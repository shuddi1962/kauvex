import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import prisma from "@/lib/db";
import { debitVendorWallet, getVendorBalance } from "@/lib/payments/wallet";
import { calculateInterest, getDebtEscalationLevel } from "@/lib/logistics/fbk-debt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const vendorId = profile?.vendorId;
  if (!vendorId) return errorResponse("Vendor profile not found", 404);

  try {
    const supabase = createAdminClient();
    const { data: enrollment } = await supabase
      .from("fbk_enrollments")
      .select("*")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (!enrollment) return successResponse({ enrolled: false });

    const monthlyFee = Number(enrollment.monthly_fee || 29.99);
    const pickPackFee = Number(enrollment.pick_pack_fee || 2.50);
    const storageFee = Number(enrollment.storage_fee || 0.75);

    const { data: inventory } = await supabase
      .from("warehouse_inventory")
      .select("quantity_on_hand")
      .eq("vendor_id", vendorId);

    const totalUnits = (inventory || []).reduce((s, i) => s + (i.quantity_on_hand || 0), 0);

    const storageCost = totalUnits * storageFee;
    const pickPackCost = totalUnits * pickPackFee;
    const estimatedTotal = monthlyFee + storageCost + pickPackCost;

    const walletBalance = await getVendorBalance(vendorId);
    const { data: debtRows } = await supabase
      .from("kv_ship_fbk_debt")
      .select("*")
      .eq("vendor_id", vendorId)
      .eq("status", "outstanding");

    const outstandingDebt = (debtRows || []).reduce((s, d) => s + Number(d.amount || 0), 0);
    const daysSinceBilling = enrollment.last_billed_at
      ? Math.floor((Date.now() - new Date(enrollment.last_billed_at).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    return successResponse({
      enrolled: true,
      billingPeriod: { start: enrollment.last_billed_at || enrollment.created_at, end: new Date().toISOString() },
      fees: {
        monthlySubscription: monthlyFee,
        storageFee,
        pickPackFee,
      },
      usage: { totalUnits },
      estimatedTotal,
      walletBalance,
      outstandingDebt,
      debtStatus: outstandingDebt > 0 ? getDebtEscalationLevel(daysSinceBilling) : "clear",
      daysSinceLastBilling: daysSinceBilling,
    });
  } catch {
    return errorResponse("Failed to fetch billing info", 500);
  }
}

export async function POST(request: NextRequest) {
  const { user, profile, error: authErr } = await getAuthUser(request);
  if (authErr) return authErr;
  const isAdmin = profile?.role && ["super-admin", "finance-admin"].includes(profile.role);
  if (!isAdmin) return errorResponse("Admin access required", 403);

  try {
    const body = await request.json();
    const vendorId = body.vendorId;
    if (!vendorId) return errorResponse("vendorId required", 400);

    const supabase = createAdminClient();
    const { data: enrollment } = await supabase
      .from("fbk_enrollments")
      .select("*")
      .eq("vendor_id", vendorId)
      .maybeSingle();

    if (!enrollment) return errorResponse("FBK enrollment not found", 404);

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
    const insufficient = Number(balance) < totalDue;

    if (insufficient) {
      const shortfall = totalDue - Number(balance);
      const daysOverdue = 0;
      const interest = calculateInterest(shortfall, daysOverdue, 2);

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

      await supabase
        .from("fbk_enrollments")
        .update({ last_billed_at: new Date().toISOString() })
        .eq("vendor_id", vendorId);

      return successResponse({
        billed: false,
        reason: "insufficient_balance",
        totalDue,
        balance: Number(balance),
        shortfall,
        debtCreated: true,
      });
    }

    await debitVendorWallet(vendorId, totalDue, "fbk_fees", "fbk_billing", `bill_${Date.now()}`, `FBK fees: subscription ${monthlyFee}, storage ${(totalUnits * storageFee).toFixed(2)}, pick&pack ${(totalUnits * pickPackFee).toFixed(2)}`);

    await supabase
      .from("fbk_enrollments")
      .update({ last_billed_at: new Date().toISOString() })
      .eq("vendor_id", vendorId);

    return successResponse({
      billed: true,
      totalDue,
      balance: Number(balance) - totalDue,
      breakdown: { monthlySubscription: monthlyFee, storageFee: totalUnits * storageFee, pickPackFee: totalUnits * pickPackFee },
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500);
  }
}
