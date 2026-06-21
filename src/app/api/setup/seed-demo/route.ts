import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const seedSecret = process.env.SEED_SECRET!;

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CATEGORIES = [
  { name: "Surveillance & CCTV", slug: "surveillance" },
  { name: "Fire Alarm Systems", slug: "fire-alarm" },
  { name: "Access Control", slug: "access-control" },
  { name: "Solar & Power", slug: "solar-systems" },
  { name: "Networking", slug: "networking" },
  { name: "Marine Accessories", slug: "marine-accessories" },
  { name: "Boat Engines", slug: "boat-engines" },
  { name: "Safety Equipment", slug: "safety-equipment" },
  { name: "ICT Equipment", slug: "ict-equipment" },
  { name: "Kitchen Equipment", slug: "kitchen-equipment" },
  { name: "UPS & Inverters", slug: "ups-inverters" },
  { name: "Dredging Equipment", slug: "dredging-equipment" },
];

const BRANDS = [
  { name: "Hikvision", slug: "hikvision" },
  { name: "Dahua", slug: "dahua" },
  { name: "Yamaha", slug: "yamaha" },
  { name: "Bosch", slug: "bosch" },
  { name: "Honeywell", slug: "honeywell" },
  { name: "Mercury", slug: "mercury" },
  { name: "Suzuki Marine", slug: "suzuki-marine" },
  { name: "ZKTeco", slug: "zkteco" },
  { name: "TP-Link", slug: "tp-link" },
  { name: "Cisco", slug: "cisco" },
  { name: "Caterpillar", slug: "caterpillar" },
  { name: "Axis", slug: "axis" },
];

const SHARED_CATALOG_PRODUCTS = [
  { title: "Hikvision 4MP IP Dome Camera DS-2CD2143G2-I", brand: "Hikvision", catIndex: 0, price: 85000 },
  { title: "Dahua 8MP IR Bullet Network Camera", brand: "Dahua", catIndex: 0, price: 95000 },
  { title: "Hikvision NVR 16-Channel 4K", brand: "Hikvision", catIndex: 0, price: 320000 },
  { title: "Bosch Fire Alarm Control Panel FPA-5000", brand: "Bosch", catIndex: 1, price: 450000 },
  { title: "Honeywell Addressable Smoke Detector", brand: "Honeywell", catIndex: 1, price: 25000 },
  { title: "ZKTeco Biometric Access Control F18", brand: "ZKTeco", catIndex: 2, price: 85000 },
  { title: "Hikvision Face Recognition Terminal", brand: "Hikvision", catIndex: 2, price: 210000 },
  { title: "Yamaha 4-Stroke Outboard F25", brand: "Yamaha", catIndex: 6, price: 1850000 },
  { title: "Mercury 15HP Outboard Engine", brand: "Mercury", catIndex: 6, price: 1250000 },
  { title: "Suzuki Marine DF20A Outboard", brand: "Suzuki Marine", catIndex: 6, price: 1450000 },
  { title: "TP-Link WiFi 6 Router Archer AX73", brand: "TP-Link", catIndex: 4, price: 65000 },
  { title: "Cisco Catalyst 2960X Switch 48-Port", brand: "Cisco", catIndex: 4, price: 580000 },
  { title: "Marine GPS Navigator Garmin", brand: "Mercury", catIndex: 5, price: 420000 },
  { title: "Yacht Anchor Chain 12mm Galvanized", brand: "Yamaha", catIndex: 5, price: 185000 },
  { title: "LED Navigation Light Set", brand: "Honeywell", catIndex: 5, price: 45000 },
  { title: "Marine VHF Radio ICOM M330", brand: "Bosch", catIndex: 5, price: 180000 },
  { title: "Boat Cover Heavy Duty 600D", brand: "Mercury", catIndex: 5, price: 95000 },
  { title: "Solar Panel 450W Monocrystalline", brand: "Caterpillar", catIndex: 3, price: 280000 },
  { title: "UPS APC Smart-UPS 1500VA", brand: "Caterpillar", catIndex: 10, price: 350000 },
  { title: "Honeywell Safety Goggles Professional", brand: "Honeywell", catIndex: 7, price: 8500 },
  { title: "Bosch Industrial Heat Gun GHG 600", brand: "Bosch", catIndex: 9, price: 45000 },
  { title: "Axis Communications P1445-LE 12MP", brand: "Axis", catIndex: 0, price: 420000 },
  { title: "Caterpillar Dredge Pump 6-inch", brand: "Caterpillar", catIndex: 11, price: 2850000 },
  { title: "ZKTeco Time Attendance TA100C", brand: "ZKTeco", catIndex: 2, price: 65000 },
];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${seedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const log: string[] = [];

    // 1. Seed categories
    for (const cat of CATEGORIES) {
      const { data: existing } = await admin.from("categories").select("id").eq("slug", cat.slug).maybeSingle();
      if (!existing) {
        const { error } = await admin.from("categories").insert({ name: cat.name, slug: cat.slug });
        if (error) log.push(`Category ${cat.name}: ${error.message}`);
        else log.push(`Category created: ${cat.name}`);
      } else {
        log.push(`Category exists: ${cat.name}`);
      }
    }

    // 2. Seed brands
    for (const b of BRANDS) {
      const { data: existing } = await admin.from("brands").select("id").eq("slug", b.slug).maybeSingle();
      if (!existing) {
        const { error } = await admin.from("brands").insert({ name: b.name, slug: b.slug });
        if (error) log.push(`Brand ${b.name}: ${error.message}`);
        else log.push(`Brand created: ${b.name}`);
      } else {
        log.push(`Brand exists: ${b.name}`);
      }
    }

    // 3. Fetch all categories & brands for mapping
    const { data: dbCats } = await admin.from("categories").select("id, name");
    const { data: dbBrands } = await admin.from("brands").select("id, name");
    const catMap = new Map((dbCats || []).map((c: any) => [c.name, c.id]));
    const brandMap = new Map((dbBrands || []).map((b: any) => [b.name, b.id]));

    // 4. Seed shared catalog products (with images)
    for (const p of SHARED_CATALOG_PRODUCTS) {
      const { data: existing } = await admin.from("shared_catalog_products").select("id").eq("title", p.title).maybeSingle();
      if (!existing) {
        const catId = catMap.get(CATEGORIES[p.catIndex].name);
        const brandId = brandMap.get(p.brand);
        const { error } = await admin.from("shared_catalog_products").insert({
          title: p.title,
          brand: p.brand,
          category_id: catId,
          images: [],
          is_active: true,
          attributes: { brand_id: brandId },
        });
        if (error) log.push(`Catalog ${p.title}: ${error.message}`);
        else log.push(`Catalog created: ${p.title}`);
      } else {
        log.push(`Catalog exists: ${p.title}`);
      }
    }

    // 5. Ensure vendor test users exist and create Vendor + VendorStore records
    const vendorUsers = [
      { email: "vendor@kauvex.com", name: "MarinePro Nigeria", shopName: "MarinePro Nigeria", shopSlug: "marinepro" },
      { email: "vendor2@kauvex.com", password: "Vendor2@123456", name: "SecureTech Global", shopName: "SecureTech Global", shopSlug: "securetech" },
      { email: "vendor3@kauvex.com", password: "Vendor3@123456", name: "PowerPlus Supplies", shopName: "PowerPlus Supplies", shopSlug: "powerplus" },
    ];

    for (const vu of vendorUsers) {
      const existing = await admin.auth.admin.listUsers();
      const found = (existing.data?.users || []).find((u: any) => u.email === vu.email);
      let userId: string;

      if (found) {
        userId = found.id;
        if ((vu as any).password) {
          await admin.auth.admin.updateUserById(found.id, { password: (vu as any).password, user_metadata: { name: vu.name, role: "vendor" } });
        }
        await admin.from("profiles").upsert({ id: userId, email: vu.email, full_name: vu.name, role: "vendor" }, { onConflict: "id" });
        log.push(`Vendor user exists: ${vu.email}`);
      } else {
        const { data: newUser, error: createErr } = await admin.auth.admin.createUser({
          email: vu.email,
          password: (vu as any).password || "Vendor@123456",
          email_confirm: true,
          user_metadata: { name: vu.name, role: "vendor" },
        });
        if (createErr || !newUser?.user) {
          log.push(`Failed to create vendor ${vu.email}: ${createErr?.message}`);
          continue;
        }
        userId = newUser.user.id;
        await admin.from("profiles").upsert({ id: userId, email: vu.email, full_name: vu.name, role: "vendor" }, { onConflict: "id" });
        log.push(`Vendor user created: ${vu.email}`);
      }

      // Create Vendor record
      const { data: existingVendor } = await admin.from("vendors").select("id").eq("shop_slug", vu.shopSlug).maybeSingle();
      if (!existingVendor) {
        const { error: vErr } = await admin.from("vendors").insert({
          user_id: userId,
          shop_name: vu.shopName,
          shop_slug: vu.shopSlug,
          status: "active",
          vendor_tier: "silver",
          commission: 12,
        });
        if (vErr) log.push(`Vendor ${vu.shopName}: ${vErr.message}`);
        else log.push(`Vendor created: ${vu.shopName}`);
      } else {
        log.push(`Vendor exists: ${vu.shopName}`);
      }
    }

    // 6. Create vendor offers on shared catalog products for each vendor
    const { data: allCatalog } = await admin.from("shared_catalog_products").select("id, title, brand").eq("is_active", true);
    const { data: allVendors } = await admin.from("vendors").select("id, shop_slug");
    const { data: allProducts } = await admin.from("products").select("id, name, vendor_id");

    if (allCatalog && allVendors) {
      for (let vi = 0; vi < allVendors.length; vi++) {
        const vendor = allVendors[vi];
        // Assign ~7-10 products per vendor
        const productsForVendor = allCatalog.slice(vi * 8, vi * 8 + 8);
        for (const cp of productsForVendor) {
          const basePrice = Math.round(50000 + Math.random() * 200000);
          const { data: existing } = await admin.from("vendor_offers").select("id")
            .eq("shared_product_id", cp.id)
            .eq("vendor_id", vendor.id)
            .maybeSingle();
          if (!existing) {
            const conditions = ["new", "refurbished"];
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            const { error } = await admin.from("vendor_offers").insert({
              shared_product_id: cp.id,
              vendor_id: vendor.id,
              price: basePrice,
              currency: "USD",
              inventory: Math.floor(Math.random() * 50) + 5,
              fulfillment_type: Math.random() > 0.5 ? "merchant" : "FBK",
              condition,
              shipping_days: Math.floor(Math.random() * 7) + 2,
              is_active: true,
              is_buy_box_winner: false,
            });
            if (!error) log.push(`Offer: ${vendor.shop_slug} -> ${cp.title}`);
          }
        }

        // Also create some products in the products table directly
        const productsForDirect = allCatalog.slice(vi * 8 + 16, vi * 8 + 20);
        for (const cp of productsForDirect) {
          const slug = cp.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "") + `-${vi}`;
          const { data: existing } = await admin.from("products").select("id").eq("slug", slug).maybeSingle();
          if (!existing) {
            const { error } = await admin.from("products").insert({
              name: cp.title,
              slug,
              sku: `SKU-${vendor.shop_slug.substring(0, 3).toUpperCase()}-${Date.now().toString(36)}`,
              regular_price: Math.round(50000 + Math.random() * 300000),
              vendor_id: vendor.id,
              status: "active",
              images: [],
              tags: [cp.brand],
              product_type: "simple",
            });
            if (!error) log.push(`Product created: ${cp.title} for ${vendor.shop_slug}`);
          }
        }
      }
    }

    // 7. Create buy box winners for some products
    const { data: allOffers } = await admin.from("vendor_offers").select("id, shared_product_id, price");
    if (allOffers) {
      const grouped = new Map<string, any[]>();
      for (const o of allOffers) {
        if (!grouped.has(o.shared_product_id)) grouped.set(o.shared_product_id, []);
        grouped.get(o.shared_product_id)!.push(o);
      }
      for (const [spId, offers] of grouped) {
        if (offers.length === 0) continue;
        const winner = offers.reduce((a, b) => a.price < b.price ? a : b);
        const { data: existing } = await admin.from("buy_box_winners").select("id").eq("shared_product_id", spId).maybeSingle();
        if (existing) {
          await admin.from("buy_box_winners").update({ vendor_offer_id: winner.id, win_score: 95, last_calculated: new Date().toISOString() }).eq("id", existing.id);
        } else {
          await admin.from("buy_box_winners").insert({ shared_product_id: spId, vendor_offer_id: winner.id, win_score: 95, last_calculated: new Date().toISOString() });
        }
        // Mark winner on the offer
        await admin.from("vendor_offers").update({ is_buy_box_winner: true }).eq("id", winner.id);
        log.push(`Buy box winner for ${spId}`);
      }
    }

    // 8. Seed university lessons
    const lessons = [
      { title: "Send to Kauvex - Workflow overview", category: "Fulfillment", contentType: "video", durationMinutes: 15, sortOrder: 1, description: "Learn how to send your inventory to Kauvex fulfillment centers and manage inbound shipments." },
      { title: "Intro to listing products", category: "List Products", contentType: "article", durationMinutes: 10, sortOrder: 2, description: "Understand the basics of creating product listings on Kauvex marketplace." },
      { title: "Learn what you need before you list", category: "Prepare to Sell", contentType: "article", durationMinutes: 8, sortOrder: 3, description: "Gather all required information and documents before listing your products." },
      { title: "Fulfill customer orders directly", category: "Merchant Fulfillment", contentType: "video", durationMinutes: 20, sortOrder: 4, description: "Step-by-step guide to shipping orders directly to customers." },
      { title: "Account Health and compliance", category: "Account Health", contentType: "article", durationMinutes: 12, sortOrder: 5, description: "Monitor your account health metrics and maintain compliance with Kauvex policies." },
      { title: "Advertise with Kauvex", category: "Advertising", contentType: "video", durationMinutes: 25, sortOrder: 6, description: "Create and manage advertising campaigns to boost your product visibility." },
      { title: "Manage your inventory", category: "Inventory", contentType: "article", durationMinutes: 15, sortOrder: 7, description: "Track stock levels, set reorder alerts, and manage multi-warehouse inventory." },
      { title: "Analyze product and brand performance", category: "Analytics", contentType: "video", durationMinutes: 18, sortOrder: 8, description: "Use Kauvex analytics tools to measure and improve your sales performance." },
    ];
    for (const l of lessons) {
      const { data: existing } = await admin.from("kv_university_lessons").select("id").eq("title", l.title).maybeSingle();
      if (!existing) {
        const { error } = await admin.from("kv_university_lessons").insert(l);
        if (error) log.push(`Lesson ${l.title}: ${error.message}`);
        else log.push(`Lesson created: ${l.title}`);
      }
    }

    // 9. Seed restricted categories
    const restrictions = [
      { categoryName: "Supplements", requiresApproval: true, allowedConditions: ["new"], requiredDocs: ["purchase_invoice"], notes: "FDA registration required" },
      { brandName: "Caterpillar", brandId: brandMap.get("Caterpillar"), requiresApproval: true, allowedConditions: ["new", "refurbished"], requiredDocs: ["purchase_invoice", "brand_auth_letter"], notes: "Authorized dealer only" },
    ];
    for (const r of restrictions) {
      const slugToCheck = r.categoryName || r.brandName;
      const { data: existing } = await admin.from("kv_restricted_categories").select("id").eq("category_name", slugToCheck).maybeSingle();
      if (!existing) {
        const { error } = await admin.from("kv_restricted_categories").insert(r as any);
        if (error) log.push(`Restriction ${slugToCheck}: ${error.message}`);
        else log.push(`Restriction created: ${slugToCheck}`);
      }
    }

    // 10. Seed approval requests
    const pendingReqs = [
      { vendorId: "demo", contactEmail: "vendor@kauvex.com", categoryName: "Supplements", brandName: "Generic", status: "pending" },
      { vendorId: "demo", contactEmail: "vendor2@kauvex.com", categoryName: "Electronics", brandName: "Sony", status: "approved" },
    ];
    for (const req of pendingReqs) {
      const { error } = await admin.from("kv_approval_requests").insert(req);
      if (error) log.push(`Approval req: ${error.message}`);
      else log.push(`Approval request created`);
    }

    // 11. Seed brand registry entries
    const brandsToRegister = [
      { vendorId: "demo", brandName: "SecureTech Pro", trademarkNumber: "TM2024-001", trademarkCountry: "US", status: "approved", brandWebsite: "https://securetech.example.com" },
      { vendorId: "demo", brandName: "PowerPlus", trademarkNumber: "TM2024-002", trademarkCountry: "NG", status: "pending", brandWebsite: "https://powerplus.example.com" },
    ];
    for (const br of brandsToRegister) {
      const { data: existing } = await admin.from("kv_brand_registry").select("id").eq("brand_name", br.brandName).maybeSingle();
      if (!existing) {
        const { error } = await admin.from("kv_brand_registry").insert(br);
        if (error) log.push(`Brand registry ${br.brandName}: ${error.message}`);
        else log.push(`Brand registry created: ${br.brandName}`);
      }
    }

    // 12. Seed business customers
    const bizCusts = [
      { customerId: "demo-cust-1", companyName: "Lagos Marine Services Ltd", taxId: "RC123456", businessType: "Marine Services", verifiedAt: new Date().toISOString() },
      { customerId: "demo-cust-2", companyName: "Secure Solutions Inc", taxId: "RC789012", businessType: "Security Services" },
    ];
    for (const bc of bizCusts) {
      const { data: existing } = await admin.from("kv_business_customers").select("id").eq("customer_id", bc.customerId).maybeSingle();
      if (!existing) {
        const { error } = await admin.from("kv_business_customers").insert(bc as any);
        if (error) log.push(`Business customer: ${error.message}`);
        else log.push(`Business customer created: ${bc.companyName}`);
      }
    }

    // 13. Seed B2B volume tiers
    if (allProducts) {
      for (const p of allProducts.slice(0, 6)) {
        const { error } = await admin.from("kv_b2b_volume_tiers").upsert([
          { product_id: p.id, vendor_id: p.vendor_id, min_quantity: 10, discount_percent: 5 },
          { product_id: p.id, vendor_id: p.vendor_id, min_quantity: 50, discount_percent: 12 },
        ]);
        if (error) log.push(`Volume tier: ${error.message}`);
      }
      log.push(`B2B volume tiers seeded`);
    }

    // 14. Seed A+ content
    const { data: brandRegBrands } = await admin.from("kv_brand_registry").select("id").eq("status", "approved");
    if (brandRegBrands && brandRegBrands.length > 0) {
      const { error } = await admin.from("kv_aplus_content").insert({
        vendor_id: "demo",
        brand_id: brandRegBrands[0].id,
        title: "Premium Marine Products",
        modules: [
          { type: "image_text", content: { heading: "Built for the Ocean", body: "Our marine-grade products are tested to withstand the harshest saltwater conditions." } },
          { type: "comparison_chart", content: { heading: "Why Choose Us", rows: [{ feature: "Corrosion Resistance", us: "Yes", others: "No" }] } },
        ],
        applied_product_ids: [],
        status: "published",
      });
      if (error) log.push(`A+ content: ${error.message}`);
      else log.push(`A+ content created`);
    }

    // 15. Seed channel sync
    const channels = ["ebay", "etsy"];
    if (allProducts) {
      for (const p of allProducts.slice(0, 4)) {
        for (const ch of channels) {
          const { error } = await admin.from("kv_channel_product_sync").upsert({
            vendor_id: p.vendor_id,
            kauvex_product_id: p.id,
            channel: ch,
            channel_listing_id: `${ch.toUpperCase()}-${p.id.slice(0, 8)}`,
            sync_inventory: true,
            sync_price: true,
            status: "active",
          });
          if (error) log.push(`Channel sync: ${error.message}`);
        }
      }
      log.push(`Channel sync seeded`);
    }

    // 16. Seed some ad campaigns
    if (allVendors) {
      for (const v of allVendors) {
        const { data: existing } = await admin.from("ad_campaigns").select("id").eq("vendor_id", v.id).limit(1);
        if (!existing || existing.length === 0) {
          const { error } = await admin.from("ad_campaigns").insert({
            vendor_id: v.id,
            name: `${v.shop_slug} Sponsored Products`,
            type: "sponsored_products",
            status: "active",
            budget: 50000,
            budget_type: "daily",
            bid_amount: 250,
            bid_type: "cpc",
            target_type: "automatic",
            target_keywords: ["marine", "security", "solar"],
            target_storefronts: ["global", "ng", "uk"],
            start_date: new Date().toISOString(),
          });
          if (error) log.push(`Campaign: ${error.message}`);
          else log.push(`Campaign created for ${v.shop_slug}`);
        }
      }
    }

    return NextResponse.json({ success: true, log });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
