import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  partnerType: z.enum(["rider", "driver", "courier", "freight"]),
  businessName: z.string().optional(),
  businessReg: z.string().optional(),
  baseLocation: z.string().min(1),
  radius: z.string().optional(),
  vehicleType: z.string().min(1),
  vehicleReg: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
  payoutSchedule: z.string().optional(),
  coverageRoutes: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid form data", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // 1. Create auth user
    const tempPassword = `Kauvex${Date.now().toString(36)}!`;
    const { data: authUser, error: createErr } = await supabase.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: "logistics_partner",
        name: `${data.firstName} ${data.lastName}`,
        partner_type: data.partnerType,
      },
    });

    if (createErr || !authUser?.user) {
      return NextResponse.json({ error: createErr?.message || "Failed to create account" }, { status: 400 });
    }

    const userId = authUser.user.id;

    // 2. Create logistics partner record
    const { data: partner, error: partnerErr } = await supabase
      .from("kv_logistics_partners")
      .insert({
        user_id: userId,
        name: `${data.firstName} ${data.lastName}`,
        company_name: data.businessName || null,
        email: data.email,
        phone: data.phone,
        partner_type: data.partnerType,
        status: "pending",
        vehicle_type: data.vehicleType,
        vehicle_registration: data.vehicleReg,
        base_location: data.baseLocation,
        coverage_radius_km: Number(data.radius) || 10,
        bank_name: data.bankName,
        bank_account_number: data.accountNumber,
        bank_account_name: data.accountName,
        payout_schedule: data.payoutSchedule || "weekly",
        coverage_routes: data.coverageRoutes || [],
        business_registration: data.businessReg || null,
        rating: 0,
        total_deliveries: 0,
        on_time_rate: 0,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (partnerErr) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Failed to create partner profile: " + partnerErr.message }, { status: 400 });
    }

    // 3. Create profile record
    await supabase.from("profiles").upsert(
      { id: userId, email: data.email, full_name: `${data.firstName} ${data.lastName}`, phone: data.phone, role: "logistics_partner" },
      { onConflict: "id" },
    );

    return NextResponse.json({
      success: true,
      partner_id: partner.id,
      message: "Application submitted successfully. We'll review your application within 2-3 business days.",
      temp_password: tempPassword,
    }, { status: 201 });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
