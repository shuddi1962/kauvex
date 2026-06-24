import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = process.env.DATABASE_URL
      ? require("pg")
        .Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
      : null;

    const plans = [];

    if (db) {
      try {
        const { rows } = await db.query(
          `SELECT id, name, slug, description, monthly_price, annual_price, currency, commission_rate, max_products, max_storefronts, max_staff, allows_subdomain, allows_custom_domain, allows_fbk, allows_ads, allows_api, allows_white_label, allows_b2b, analytics_level, support_level, features, is_active, sort_order FROM vendor_plans WHERE is_active = true ORDER BY sort_order ASC`
        );
        plans.push(...rows);
      } catch (err) {
        console.error("Failed to query vendor_plans:", err);
      } finally {
        await db?.end();
      }
    }

    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
