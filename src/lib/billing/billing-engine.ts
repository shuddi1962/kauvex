import prisma from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { creditVendorWallet, debitVendorWallet, getVendorBalance } from "@/lib/payments/wallet";
import { calculateInterest, getDebtEscalationLevel } from "@/lib/logistics/fbk-debt";

export interface BillingResult {
  success: boolean;
  vendorId: string;
  actions: {
    type: string;
    amount: number;
    status: string;
    detail: string;
  }[];
  errors: string[];
}

export async function creditOrderEarnings(orderId: string): Promise<BillingResult> {
  const result: BillingResult = { success: true, vendorId: "", actions: [], errors: [] };

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, vendor: true },
    });

    if (!order) {
      result.errors.push(`Order ${orderId} not found`);
      result.success = false;
      return result;
    }

    if (order.status !== "completed") {
      result.errors.push(`Order ${order.orderNumber} is not completed (${order.status})`);
      result.success = false;
      return result;
    }

    const vendorId = order.vendorId;
    if (!vendorId) {
      result.errors.push(`Order ${order.orderNumber} has no vendor`);
      result.success = false;
      return result;
    }

    result.vendorId = vendorId;

    const vendor = order.vendor;
    const commissionRate = Number(vendor?.commission ?? 10) / 100;
    const orderTotal = Number(order.total);
    const commissionAmount = +(orderTotal * commissionRate).toFixed(2);
    const earningsAmount = orderTotal - commissionAmount;

    if (earningsAmount <= 0) {
      result.actions.push({
        type: "earnings_credit",
        amount: 0,
        status: "skipped",
        detail: `Order ${order.orderNumber}: total=$${orderTotal}, commission=$${commissionAmount}, net earnings=$0 (no profit to credit)`,
      });
      return result;
    }

    await creditVendorWallet(
      vendorId,
      earningsAmount,
      "sale_credit",
      "order_earnings",
      `earn_${order.orderNumber}`,
      `Earnings from order ${order.orderNumber}: $${orderTotal} sale - $${commissionAmount} commission`
    );

    result.actions.push({
      type: "earnings_credit",
      amount: earningsAmount,
      status: "completed",
      detail: `Credited $${earningsAmount} to vendor ${vendorId} for order ${order.orderNumber}`,
    });
  } catch (err) {
    result.errors.push(`creditOrderEarnings failed: ${(err as Error).message}`);
    result.success = false;
  }

  return result;
}

export async function processSubscriptionRenewal(vendorId: string): Promise<BillingResult> {
  const result: BillingResult = { success: true, vendorId, actions: [], errors: [] };

  try {
    const subscription = await prisma.vendorPlanSubscription.findUnique({
      where: { vendorId },
      include: { plan: true },
    });

    if (!subscription) {
      result.actions.push({
        type: "subscription_renewal",
        amount: 0,
        status: "skipped",
        detail: `No active subscription for vendor ${vendorId}`,
      });
      return result;
    }

    if (subscription.status !== "active") {
      result.actions.push({
        type: "subscription_renewal",
        amount: 0,
        status: "skipped",
        detail: `Subscription ${subscription.id} is not active (${subscription.status})`,
      });
      return result;
    }

    if (subscription.cancelAtPeriodEnd) {
      result.actions.push({
        type: "subscription_renewal",
        amount: 0,
        status: "skipped",
        detail: `Subscription ${subscription.id} is set to cancel at period end — not renewing`,
      });
      return result;
    }

    const now = new Date();
    if (now < subscription.currentPeriodEnd) {
      const daysLeft = Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      result.actions.push({
        type: "subscription_renewal",
        amount: 0,
        status: "skipped",
        detail: `Subscription ${subscription.id} still active — ${daysLeft} days until renewal`,
      });
      return result;
    }

    const isAnnual = subscription.billingCycle === "annual";
    const price = isAnnual
      ? Number(subscription.plan.annualPrice || 0)
      : Number(subscription.plan.monthlyPrice || 0);

    if (subscription.plan.slug === "free" || price === 0) {
      await prisma.vendorPlanSubscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000),
          updatedAt: now,
        },
      });

      result.actions.push({
        type: "subscription_renewal",
        amount: 0,
        status: "completed",
        detail: `Free plan renewed for vendor ${vendorId}`,
      });
      return result;
    }

    const balance = await getVendorBalance(vendorId);
    if (Number(balance) < price) {
      const shortfall = price - Number(balance);
      const supabase = createAdminClient();
      await supabase.from("kv_ship_fbk_debt").insert({
        vendor_id: vendorId,
        debt_type: "subscription",
        amount: shortfall,
        interest_amount: 0,
        period_start: subscription.currentPeriodEnd.toISOString(),
        period_end: now.toISOString(),
        status: "outstanding",
        recovery_from_sales: true,
      });

      result.actions.push({
        type: "subscription_renewal",
        amount: price,
        status: "failed_insufficient_balance",
        detail: `Insufficient balance ($${Number(balance)}) to renew $${price} plan. Debt of $${shortfall} created.`,
      });
      result.errors.push(`Insufficient wallet balance for subscription renewal: need $${price}, have $${Number(balance)}`);
      result.success = false;
      return result;
    }

    await debitVendorWallet(
      vendorId,
      price,
      "subscription",
      "plan_subscription",
      `sub_${subscription.planId}_${Date.now()}`,
      `${subscription.plan.name} plan — ${subscription.billingCycle} renewal`
    );

    await prisma.vendorPlanSubscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000),
        updatedAt: now,
      },
    });

    await prisma.vendorPlanPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: price,
        currency: "USD",
        status: "completed",
        gatewayRef: `wallet_${Date.now()}`,
        paidAt: now,
      },
    });

    result.actions.push({
      type: "subscription_renewal",
      amount: price,
      status: "completed",
      detail: `Renewed ${subscription.plan.name} plan for vendor ${vendorId} — charged $${price} from wallet`,
    });
  } catch (err) {
    result.errors.push(`processSubscriptionRenewal failed: ${(err as Error).message}`);
    result.success = false;
  }

  return result;
}

export async function processFbkBilling(vendorId: string): Promise<BillingResult> {
  const result: BillingResult = { success: true, vendorId, actions: [], errors: [] };

  try {
    const supabase = createAdminClient();
    const { data: enrollment } = await supabase
      .from("fbk_enrollments")
      .select("*")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (!enrollment) {
      result.actions.push({
        type: "fbk_billing",
        amount: 0,
        status: "skipped",
        detail: `No FBK enrollment for vendor ${vendorId}`,
      });
      return result;
    }

    const monthlyFee = Number(enrollment.monthly_fee || 29.99);
    const pickPackFee = Number(enrollment.pick_pack_fee || 2.50);
    const storageFee = Number(enrollment.storage_fee || 0.75);

    const { data: inventory } = await supabase
      .from("warehouse_inventory")
      .select("quantity_on_hand")
      .eq("vendor_id", vendorId);

    const totalUnits = (inventory || []).reduce((s, i) => s + (i.quantity_on_hand || 0), 0);
    const totalDue = monthlyFee + totalUnits * storageFee + totalUnits * pickPackFee;

    const balance = await getVendorBalance(vendorId);

    if (Number(balance) < totalDue) {
      const shortfall = totalDue - Number(balance);
      const daysSinceBilling = enrollment.last_billed_at
        ? Math.floor((Date.now() - new Date(enrollment.last_billed_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      const interest = calculateInterest(shortfall, daysSinceBilling);

      await supabase.from("kv_ship_fbk_debt").insert({
        vendor_id: vendorId,
        debt_type: "storage",
        amount: shortfall,
        interest_amount: interest,
        period_start: enrollment.last_billed_at || new Date().toISOString(),
        period_end: new Date().toISOString(),
        status: "outstanding",
        recovery_from_sales: true,
      });

      result.actions.push({
        type: "fbk_billing",
        amount: totalDue,
        status: "partial",
        detail: `Insufficient balance ($${Number(balance)}) for FBK fees of $${totalDue}. Debt of $${shortfall} + $${interest} interest created.`,
      });
      result.errors.push(`Insufficient wallet balance for FBK fees: need $${totalDue}, have $${Number(balance)}`);
      result.success = false;
    } else {
      await debitVendorWallet(
        vendorId,
        totalDue,
        "fbk_fees",
        "fbk_billing",
        `fbk_bill_${Date.now()}`,
        `FBK fees: subscription $${monthlyFee}, storage $${(totalUnits * storageFee).toFixed(2)}, pick&pack $${(totalUnits * pickPackFee).toFixed(2)}`
      );

      result.actions.push({
        type: "fbk_billing",
        amount: totalDue,
        status: "completed",
        detail: `Charged $${totalDue} FBK fees from vendor ${vendorId} wallet`,
      });
    }

    await supabase
      .from("fbk_enrollments")
      .update({ last_billed_at: new Date().toISOString() })
      .eq("vendor_id", vendorId);

  } catch (err) {
    result.errors.push(`processFbkBilling failed: ${(err as Error).message}`);
    result.success = false;
  }

  return result;
}

export async function processVendorBillingCycle(vendorId: string): Promise<BillingResult> {
  const result: BillingResult = { success: true, vendorId, actions: [], errors: [] };

  const subResult = await processSubscriptionRenewal(vendorId);
  result.actions.push(...subResult.actions);
  result.errors.push(...subResult.errors);
  if (!subResult.success) result.success = false;

  const fbkResult = await processFbkBilling(vendorId);
  result.actions.push(...fbkResult.actions);
  result.errors.push(...fbkResult.errors);
  if (!fbkResult.success) result.success = false;

  return result;
}

export async function processAllBillingCycles(): Promise<{ results: BillingResult[]; total: number; succeeded: number; failed: number }> {
  const subscriptions = await prisma.vendorPlanSubscription.findMany({
    where: { status: "active" },
    select: { vendorId: true },
  });

  const vendorIds = [...new Set(subscriptions.map((s) => s.vendorId))];
  const results: BillingResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const vendorId of vendorIds) {
    const r = await processVendorBillingCycle(vendorId);
    results.push(r);
    if (r.success) succeeded++;
    else failed++;
  }

  return { results, total: vendorIds.length, succeeded, failed };
}
