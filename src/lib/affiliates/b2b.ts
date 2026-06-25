import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export interface B2bReferral {
  id: string;
  partner_id: string;
  client_type: string;
  client_entity_id: string | null;
  company_name: string;
  contact_name: string;
  contact_email: string;
  industry: string;
  deal_size: string;
  pipeline_stage: string;
  referral_date: string;
  first_payment_date: string | null;
  recurring_commission_rate: number;
  recurring_commission_months: number;
  recurring_paid_months: number;
  total_earned: number;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface B2bStats {
  totalReferrals: number;
  closedDeals: number;
  totalCommission: number;
  conversionRate: number;
  pipeline: Record<string, number>;
  monthlyEarnings: { month: string; amount: number }[];
}

const PIPELINE_STAGES = ["lead", "meeting", "proposal", "closed", "lost"] as const;

export async function createReferral(
  partnerId: string,
  data: {
    company_name: string;
    contact_name: string;
    contact_email: string;
    industry: string;
    deal_size: string;
    notes?: string;
  },
) {
  const { data: referral, error } = await admin
    .from("kv_aff_b2b_clients")
    .insert({
      partner_id: partnerId,
      client_type: "vendor",
      company_name: data.company_name,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      industry: data.industry,
      deal_size: data.deal_size,
      pipeline_stage: "lead",
      referral_date: new Date().toISOString(),
      recurring_commission_rate: 5,
      recurring_commission_months: 12,
      recurring_paid_months: 0,
      total_earned: 0,
      notes: data.notes || null,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return referral;
}

export async function getPartnerReferrals(partnerId: string) {
  const { data, error } = await admin
    .from("kv_aff_b2b_clients")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as B2bReferral[];
}

export async function updateReferralStage(
  referralId: string,
  stage: string,
  updates?: { first_payment_date?: string; notes?: string },
) {
  const patch: Record<string, any> = { pipeline_stage: stage };
  if (updates?.first_payment_date) patch.first_payment_date = updates.first_payment_date;
  if (updates?.notes) patch.notes = updates.notes;
  if (stage === "closed") patch.status = "active";

  const { data, error } = await admin
    .from("kv_aff_b2b_clients")
    .update(patch)
    .eq("id", referralId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteReferral(referralId: string) {
  const { error } = await admin
    .from("kv_aff_b2b_clients")
    .delete()
    .eq("id", referralId);

  if (error) throw new Error(error.message);
}

export async function getPartnerB2bStats(partnerId: string): Promise<B2bStats> {
  const referrals = await getPartnerReferrals(partnerId);

  const totalReferrals = referrals.length;
  const closedDeals = referrals.filter((r) => r.pipeline_stage === "closed").length;
  const totalCommission = referrals.reduce((sum, r) => sum + (r.total_earned || 0), 0);
  const conversionRate = totalReferrals > 0 ? Math.round((closedDeals / totalReferrals) * 100) : 0;

  const pipeline: Record<string, number> = {};
  for (const stage of PIPELINE_STAGES) {
    pipeline[stage] = referrals.filter((r) => r.pipeline_stage === stage).length;
  }

  const monthMap = new Map<string, number>();
  for (const r of referrals) {
    if (r.referral_date) {
      const d = new Date(r.referral_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap.set(key, (monthMap.get(key) || 0) + (r.total_earned || 0));
    }
  }
  const monthlyEarnings = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({ month, amount }));

  return { totalReferrals, closedDeals, totalCommission, conversionRate, pipeline, monthlyEarnings };
}

export async function calculateRecurringCommissions() {
  const { data: closedReferrals, error } = await admin
    .from("kv_aff_b2b_clients")
    .select("*")
    .eq("pipeline_stage", "closed")
    .eq("status", "active");

  if (error) throw new Error(error.message);

  let processed = 0;
  for (const referral of closedReferrals || []) {
    if (!referral.first_payment_date) continue;
    if (referral.recurring_paid_months >= referral.recurring_commission_months) continue;

    const monthsSinceFirstPayment = Math.floor(
      (Date.now() - new Date(referral.first_payment_date).getTime()) / (30 * 24 * 60 * 60 * 1000),
    );

    if (monthsSinceFirstPayment > referral.recurring_paid_months) {
      const monthsToPay = monthsSinceFirstPayment - referral.recurring_paid_months;
      const monthlyAmount = (referral.deal_size || 0) * ((referral.recurring_commission_rate || 5) / 100);
      const commissionAmount = monthlyAmount * monthsToPay;

      await admin.from("kv_aff_commissions").insert({
        partner_id: referral.partner_id,
        source_type: "b2b_referral",
        source_id: referral.id,
        amount: commissionAmount,
        currency: "USD",
        status: "pending",
        description: `B2B recurring commission: ${referral.company_name} (${monthsToPay} months)`,
      });

      await admin
        .from("kv_aff_b2b_clients")
        .update({
          recurring_paid_months: referral.recurring_paid_months + monthsToPay,
          total_earned: (referral.total_earned || 0) + commissionAmount,
        })
        .eq("id", referral.id);

      processed++;
    }
  }

  return { processed };
}
