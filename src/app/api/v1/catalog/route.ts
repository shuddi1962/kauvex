import { NextRequest } from "next/server";
import { insforge } from "@/lib/insforge";
import { errorResponse, paginatedResponse } from "@/lib/api-helpers";

interface DemoProduct {
  id: string;
  title: string;
  brand: string;
  description: string;
  images: string[];
  is_active: boolean;
  seller_count: number;
  sku: string;
  upc: string;
  ean: string;
  isbn?: string;
  category_name: string;
}

const CATEGORIES: Record<string, string> = {
  electronics: "Electronics & Gadgets",
  marine: "Marine & Boating",
  security: "Security & Surveillance",
  automotive: "Automotive",
  home: "Home & Kitchen",
  outdoor: "Outdoor & Camping",
  tools: "Tools & Hardware",
  health: "Health & Wellness",
  pets: "Pet Supplies",
  office: "Office Supplies",
  sports: "Sports & Fitness",
  baby: "Baby & Kids",
};

const CATEGORY_SLUGS = new Map(Object.entries(CATEGORIES).map(([k, v]) => [v.toLowerCase(), k]));

function randomSellerCount(): number {
  return Math.floor(Math.random() * 5) + 1;
}

const demoProducts: DemoProduct[] = [
  {
    id: "demo-001",
    title: "Wireless Noise-Cancelling Headphones",
    brand: "SoundWave",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and high-fidelity audio. Features Bluetooth 5.3, multipoint connection, and foldable design for travel.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-SND-001",
    upc: "871829461023",
    ean: "5901234567890",
    isbn: "9780141036144",
    category_name: "Electronics & Gadgets",
  },
  {
    id: "demo-002",
    title: "4K Ultra HD Webcam with Auto-Focus",
    brand: "ClearView",
    description: "Professional-grade 4K webcam with Sony Starvis sensor, auto-focus, built-in ring light, and noise-cancelling dual microphones. Ideal for streaming, conferencing, and content creation.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-CLV-002",
    upc: "938475620184",
    ean: "4012345678901",
    category_name: "Electronics & Gadgets",
  },
  {
    id: "demo-003",
    title: "Marine GPS Chartplotter 7-Inch",
    brand: "NavDepth",
    description: "7-inch sunlight-readable GPS chartplotter with preloaded coastal charts, sonar support, Wi-Fi connectivity, and touchscreen interface. Waterproof IPX7 rated for offshore use.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-NAV-003",
    upc: "756483920175",
    ean: "8712345678902",
    category_name: "Marine & Boating",
  },
  {
    id: "demo-004",
    title: "Heavy-Duty Boat Anchor Kit 35lb",
    brand: "AnchorPro",
    description: "Galvanized steel fluke anchor with 20ft chain and 200ft nylon rope. Suitable for boats up to 40ft. Includes storage bag and shackle hardware.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-APR-004",
    upc: "612839405768",
    ean: "5909876543210",
    category_name: "Marine & Boating",
  },
  {
    id: "demo-005",
    title: "4MP PoE Security Camera Outdoor",
    brand: "SafeSight",
    description: "Weatherproof 4MP outdoor security camera with Power over Ethernet, night vision up to 100ft, motion detection, and ONVIF compatibility. Supports continuous recording and AI alerts.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-SFS-005",
    upc: "384756291034",
    ean: "1234567890123",
    category_name: "Security & Surveillance",
  },
  {
    id: "demo-006",
    title: "Smart Video Doorbell 2K",
    brand: "DoorGuard",
    description: "2K resolution smart doorbell with 160-degree field of view, two-way audio, IR night vision, and real-time smartphone alerts. Supports Alexa and Google Assistant.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-DGR-006",
    upc: "293847561029",
    ean: "2109876543210",
    isbn: "9780061120084",
    category_name: "Security & Surveillance",
  },
  {
    id: "demo-007",
    title: "OBD2 Bluetooth Diagnostic Scanner",
    brand: "AutoLink",
    description: "Wireless OBD2 scanner with Bluetooth 5.0, real-time engine data, check engine light diagnostics, and full system scans. Works with iOS and Android via companion app.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-ALK-007",
    upc: "574839201647",
    ean: "3012345678903",
    category_name: "Automotive",
  },
  {
    id: "demo-008",
    title: "Dash Cam 4K with GPS and Night Vision",
    brand: "RoadRec",
    description: "4K dash camera with supercapacitor, GPS logging, wide dynamic range, parking mode, and 170-degree wide-angle lens. Loop recording with G-sensor collision detection.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-RRC-008",
    upc: "819203746580",
    ean: "4987654321098",
    category_name: "Automotive",
  },
  {
    id: "demo-009",
    title: "Smart 12-Cup Coffee Maker with Grinder",
    brand: "BrewMaster",
    description: "Programmable coffee maker with integrated burr grinder, 12-cup carafe, brew strength selector, auto-shutoff, and WiFi scheduling. Compatible with whole bean and ground coffee.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-BRM-009",
    upc: "465738291045",
    ean: "5123467890124",
    category_name: "Home & Kitchen",
  },
  {
    id: "demo-010",
    title: "Stainless Steel Air Fryer 6QT",
    brand: "CrispPro",
    description: "6-quart digital air fryer with 8 preset cooking modes, shake reminder, and rapid air circulation technology. Uses 95% less oil than traditional frying. Dishwasher-safe basket.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-CRP-010",
    upc: "129384756039",
    ean: "6234567890125",
    category_name: "Home & Kitchen",
  },
  {
    id: "demo-011",
    title: "4-Person Waterproof Camping Tent",
    brand: "WildBase",
    description: "4-person 3-season tent with seam-taped rainfly, mesh ventilation, and quick-setup pole system. 3000mm waterproof rating, weighs 8.5lbs, packs into included carry bag.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-WLB-011",
    upc: "783940516273",
    ean: "7345678901236",
    category_name: "Outdoor & Camping",
  },
  {
    id: "demo-012",
    title: "Portable Camping Stove 2-Burner",
    brand: "FlameBase",
    description: "Portable propane camping stove with dual 10,000 BTU burners, push-button ignition, wind baffles, and folding legs. Runs on standard 1lb propane canisters.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-FLB-012",
    upc: "506172839405",
    ean: "8456789012347",
    category_name: "Outdoor & Camping",
  },
  {
    id: "demo-013",
    title: "20V Cordless Drill Kit 3/8-Inch",
    brand: "ToughBuilt",
    description: "Brushless 20V cordless drill with 2-speed gearbox, 24-position clutch, LED work light, and keyless chuck. Includes 2x 2.0Ah batteries and fast charger.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-TBT-013",
    upc: "394857260184",
    ean: "9567890123458",
    category_name: "Tools & Hardware",
  },
  {
    id: "demo-014",
    title: "Laser Distance Measurer 165ft",
    brand: "MeasureTech",
    description: "Digital laser distance measurer with 165ft range, ±0.06in accuracy, backlit LCD, and Pythagoras mode for indirect height measurement. IP54 rated. Includes carrying case.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-MTC-014",
    upc: "617283940561",
    ean: "0678901234569",
    category_name: "Tools & Hardware",
  },
  {
    id: "demo-015",
    title: "Smart Blood Pressure Monitor",
    brand: "VitaCheck",
    description: "FDA-cleared upper arm blood pressure monitor with Bluetooth sync, irregular heartbeat detection, and color-coded risk indicators. Stores up to 120 readings for two users.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-VTC-015",
    upc: "283940561748",
    ean: "1789012345670",
    isbn: "9780451524935",
    category_name: "Health & Wellness",
  },
  {
    id: "demo-016",
    title: "No-Touch Infrared Thermometer",
    brand: "TempSense",
    description: "Medical-grade infrared thermometer with instant 1-second reading, color-coded fever alert, and memory recall for 25 readings. Suitable for all ages.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-TMS-016",
    upc: "506172839401",
    ean: "2890123456781",
    category_name: "Health & Wellness",
  },
  {
    id: "demo-017",
    title: "Automatic Pet Feeder with Camera",
    brand: "PetCare",
    description: "WiFi-enabled automatic pet feeder with 1080p camera, two-way audio, programmable meal schedules, and portion control. Holds up to 5lbs of dry food. Stainless steel bowl.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-PTC-017",
    upc: "718293045672",
    ean: "3901234567892",
    category_name: "Pet Supplies",
  },
  {
    id: "demo-018",
    title: "GPS Dog Tracker Collar",
    brand: "TrackPaw",
    description: "Real-time GPS dog tracker with unlimited range via LTE-M, virtual fence alerts, activity monitoring, and escape detection. Waterproof, 5-day battery life. No subscription required for basic tracking.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-TPW-018",
    upc: "839405617283",
    ean: "4012345678904",
    category_name: "Pet Supplies",
  },
  {
    id: "demo-019",
    title: "Ergonomic Office Chair with Lumbar Support",
    brand: "ComfortCore",
    description: "Adjustable ergonomic office chair with mesh back, memory foam seat cushion, 4D armrests, adjustable lumbar support, and 180-degree recline. Supports up to 300lbs.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-CFC-019",
    upc: "940516283748",
    ean: "5123456789012",
    category_name: "Office Supplies",
  },
  {
    id: "demo-020",
    title: "Standing Desk Converter 36-Inch",
    brand: "ErgoLift",
    description: "Gas spring standing desk converter with dual monitor support, keyboard tray, and built-in cable management. Raises from 4 to 18 inches. Holds up to 35lbs.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-EGL-020",
    upc: "617283940516",
    ean: "6234567890123",
    category_name: "Office Supplies",
  },
  {
    id: "demo-021",
    title: "Resistance Bands Set 5-Pack",
    brand: "FlexFit",
    description: "Set of 5 latex resistance bands with varying tension levels (10-50lbs), non-slip design, and carrying pouch. Includes door anchor, ankle straps, and exercise guide.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-FFT-021",
    upc: "394857261839",
    ean: "7345678901234",
    category_name: "Sports & Fitness",
  },
  {
    id: "demo-022",
    title: "Smart Jump Rope with LED Counter",
    brand: "SkipPro",
    description: "Weighted smart jump rope with Bluetooth connectivity, real-time LED counter, calorie tracking, and workout modes. Adjustable 10ft steel cable with foam handles.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-SKP-022",
    upc: "506172839402",
    ean: "8456789012345",
    category_name: "Sports & Fitness",
  },
  {
    id: "demo-023",
    title: "Baby Video Monitor 5-Inch Display",
    brand: "LittleEye",
    description: "5-inch color baby monitor with 1080p camera, pan/tilt/zoom, infrared night vision, temperature sensor, two-way talk, and lullaby player. Secure FHSS transmission, no WiFi needed.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-LTE-023",
    upc: "617283940517",
    ean: "9567890123456",
    category_name: "Baby & Kids",
  },
  {
    id: "demo-024",
    title: "Convertible Car Seat 3-in-1",
    brand: "SafeRide",
    description: "3-in-1 convertible car seat suitable for rear-facing (5-40lbs), forward-facing (22-65lbs), and booster (40-100lbs). Steel-reinforced frame, side-impact protection, machine-washable cover.",
    images: [],
    is_active: true,
    seller_count: randomSellerCount(),
    sku: "SKU-SRD-024",
    upc: "728394051627",
    ean: "0678901234567",
    isbn: "9780143039433",
    category_name: "Baby & Kids",
  },
];

function resolveCategoryName(categoryId: string): string {
  if (!categoryId) return "";
  const lower = categoryId.toLowerCase();
  if (CATEGORIES[lower]) return CATEGORIES[lower];
  for (const [name, slug] of CATEGORY_SLUGS) {
    if (slug === lower || name === lower) return name;
  }
  return categoryId;
}

function filterDemoProducts(
  products: DemoProduct[],
  search: string,
  categoryName: string,
  brand: string
): DemoProduct[] {
  let result = products;

  if (search) {
    const lower = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.brand.toLowerCase().includes(lower) ||
        p.sku.toLowerCase().includes(lower) ||
        p.upc.includes(lower) ||
        p.ean.includes(lower) ||
        (p.isbn && p.isbn.includes(lower)) ||
        p.description.toLowerCase().includes(lower)
    );
  }

  if (categoryName) {
    const lower = categoryName.toLowerCase();
    result = result.filter((p) => p.category_name.toLowerCase() === lower);
  }

  if (brand) {
    const lower = brand.toLowerCase();
    result = result.filter((p) => p.brand.toLowerCase().includes(lower));
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24")));
    const categoryId = searchParams.get("category_id") || "";
    const brand = searchParams.get("brand") || "";
    const offset = (page - 1) * limit;

    // Try a lightweight count query first to check if DB has data
    const { count: dbCount, error: countError } = await insforge.database
      .from("shared_catalog_products")
      .select("*", { count: "exact", head: true });

    const dbHasData = !countError && dbCount !== null && dbCount > 0;

    if (dbHasData) {
      let query = insforge.database
        .from("shared_catalog_products")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .order("title", { ascending: true });

      if (search) {
        query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
      }
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      if (brand) {
        query = query.ilike("brand", `%${brand}%`);
      }

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) {
        return errorResponse(error.message, 400);
      }

      const enriched = await Promise.all(
        (data || []).map(async (product: any) => {
          const { data: offers } = await insforge.database
            .from("vendor_offers")
            .select("id")
            .eq("shared_product_id", product.id)
            .eq("is_active", true);
          return { ...product, seller_count: offers?.length || 0 };
        })
      );

      return paginatedResponse(enriched, count || 0, page, limit);
    }

    // DB unavailable or empty — use demo data if there's a meaningful query
    if (!countError && !search && !categoryId && !brand) {
      return paginatedResponse([], 0, page, limit);
    }

    const categoryName = resolveCategoryName(categoryId);
    let filtered = filterDemoProducts(demoProducts, search, categoryName, brand);
    const total = filtered.length;
    filtered = filtered.slice(offset, offset + limit);

    return paginatedResponse(filtered, total, page, limit);
  } catch {
    return errorResponse("Internal server error", 500);
  }
}
