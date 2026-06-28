import { prisma } from "@/lib/prisma";

export interface HsCodeEntry {
  hsCode: string;
  description: string;
  chapter: string;
  heading: string;
  subheading: string;
}

export interface HsCodeLookupResult {
  exact: HsCodeEntry | null;
  suggestions: HsCodeEntry[];
  confidence: number;
}

const HS_DATABASE: HsCodeEntry[] = [
  // Electronics
  { hsCode: "8517.12.00", description: "Smartphones (cellular phones)", chapter: "85", heading: "8517", subheading: "8517.12" },
  { hsCode: "8517.11.00", description: "Line telephone handsets", chapter: "85", heading: "8517", subheading: "8517.11" },
  { hsCode: "8471.30.00", description: "Portable automatic data processing machines (laptops, tablets)", chapter: "84", heading: "8471", subheading: "8471.30" },
  { hsCode: "8518.30.00", description: "Headphones and earphones (Bluetooth, wired)", chapter: "85", heading: "8518", subheading: "8518.30" },
  { hsCode: "8507.60.00", description: "Lithium-ion accumulators (power banks, rechargeable batteries)", chapter: "85", heading: "8507", subheading: "8507.60" },
  { hsCode: "8504.40.00", description: "Static converters (phone chargers, adapters, power supplies)", chapter: "85", heading: "8504", subheading: "8504.40" },
  { hsCode: "8544.42.00", description: "Electric conductors fitted with connectors (USB cables, charging cables)", chapter: "85", heading: "8544", subheading: "8544.42" },
  { hsCode: "8525.80.00", description: "Television cameras, digital cameras, CCTV cameras", chapter: "85", heading: "8525", subheading: "8525.80" },
  { hsCode: "9102.12.00", description: "Smart watches (Apple Watch, Samsung Galaxy Watch)", chapter: "91", heading: "9102", subheading: "9102.12" },
  { hsCode: "8528.72.00", description: "Television receivers (LED/OLED TVs)", chapter: "85", heading: "8528", subheading: "8528.72" },
  { hsCode: "8443.32.00", description: "Printers (inkjet, laser)", chapter: "84", heading: "8443", subheading: "8443.32" },
  { hsCode: "8471.60.00", description: "Input/output devices (keyboards, mice, monitors)", chapter: "84", heading: "8471", subheading: "8471.60" },
  { hsCode: "8518.20.00", description: "Loudspeakers (Bluetooth speakers, soundbars)", chapter: "85", heading: "8518", subheading: "8518.20" },
  { hsCode: "8521.90.00", description: "Video recording/reproducing apparatus (streaming devices, DVR)", chapter: "85", heading: "8521", subheading: "8521.90" },
  { hsCode: "8502.11.00", description: "Diesel generators (under 75kVA)", chapter: "85", heading: "8502", subheading: "8502.11" },
  { hsCode: "8539.50.00", description: "Light emitting diode (LED) bulbs and lamps", chapter: "85", heading: "8539", subheading: "8539.50" },
  { hsCode: "8509.40.00", description: "Food grinders, mixers, blenders", chapter: "85", heading: "8509", subheading: "8509.40" },
  { hsCode: "8516.60.00", description: "Electric ovens (microwave, air fryer)", chapter: "85", heading: "8516", subheading: "8516.60" },
  { hsCode: "8516.30.00", description: "Electric hair dryers", chapter: "85", heading: "8516", subheading: "8516.30" },
  { hsCode: "8508.11.00", description: "Vacuum cleaners (cordless, handheld)", chapter: "85", heading: "8508", subheading: "8508.11" },

  // Fashion & Clothing
  { hsCode: "6109.10.00", description: "T-shirts, singlets of cotton (knitted)", chapter: "61", heading: "6109", subheading: "6109.10" },
  { hsCode: "6109.90.00", description: "T-shirts of other textile materials (knitted)", chapter: "61", heading: "6109", subheading: "6109.90" },
  { hsCode: "6104.42.00", description: "Women's dresses of cotton (knitted)", chapter: "61", heading: "6104", subheading: "6104.42" },
  { hsCode: "6203.42.00", description: "Men's trousers, jeans (denim) of cotton", chapter: "62", heading: "6203", subheading: "6203.42" },
  { hsCode: "6204.62.00", description: "Women's trousers of cotton", chapter: "62", heading: "6204", subheading: "6204.62" },
  { hsCode: "5208.21.00", description: "Cotton fabrics (Ankara, printed cotton)", chapter: "52", heading: "5208", subheading: "5208.21" },
  { hsCode: "6403.99.00", description: "Leather footwear (shoes, sandals)", chapter: "64", heading: "6403", subheading: "6403.99" },
  { hsCode: "6404.11.00", description: "Sports footwear (trainers, sneakers)", chapter: "64", heading: "6404", subheading: "6404.11" },
  { hsCode: "4202.22.00", description: "Handbags with outer surface of plastics or textiles", chapter: "42", heading: "4202", subheading: "4202.22" },
  { hsCode: "4202.12.00", description: "Trunks, suitcases with outer surface of plastics", chapter: "42", heading: "4202", subheading: "4202.12" },
  { hsCode: "9004.10.00", description: "Sunglasses", chapter: "90", heading: "9004", subheading: "9004.10" },
  { hsCode: "6110.20.00", description: "Jerseys, pullovers, cardigans of cotton (knitted)", chapter: "61", heading: "6110", subheading: "6110.20" },
  { hsCode: "6101.20.00", description: "Men's overcoats of cotton (knitted)", chapter: "61", heading: "6101", subheading: "6101.20" },
  { hsCode: "6201.20.00", description: "Men's overcoats of cotton", chapter: "62", heading: "6201", subheading: "6201.20" },
  { hsCode: "6505.00.00", description: "Hats, headgear (baseball caps, beanies)", chapter: "65", heading: "6505", subheading: "6505.00" },

  // Beauty & Health
  { hsCode: "3304.99.00", description: "Beauty/skincare preparations (cream, serum, lotion)", chapter: "33", heading: "3304", subheading: "3304.99" },
  { hsCode: "3304.10.00", description: "Lip make-up preparations (lipstick, lip gloss)", chapter: "33", heading: "3304", subheading: "3304.10" },
  { hsCode: "3305.10.00", description: "Shampoos", chapter: "33", heading: "3305", subheading: "3305.10" },
  { hsCode: "6703.00.00", description: "Human hair for wigs, hair extensions", chapter: "67", heading: "6703", subheading: "6703.00" },
  { hsCode: "3303.00.00", description: "Perfumes and toilet waters", chapter: "33", heading: "3303", subheading: "3303.00" },
  { hsCode: "3306.10.00", description: "Toothpaste", chapter: "33", heading: "3306", subheading: "3306.10" },
  { hsCode: "2106.90.00", description: "Food preparations not elsewhere specified (vitamins, supplements)", chapter: "21", heading: "2106", subheading: "2106.90" },
  { hsCode: "3004.90.00", description: "Medicaments (medicines, drugs) in measured doses", chapter: "30", heading: "3004", subheading: "3004.90" },
  { hsCode: "3005.90.00", description: "Bandages, dressings, plasters", chapter: "30", heading: "3005", subheading: "3005.90" },
  { hsCode: "9619.00.00", description: "Sanitary towels, diapers", chapter: "96", heading: "9619", subheading: "9619.00" },

  // Food & Beverages
  { hsCode: "1902.30.00", description: "Pasta, instant noodles", chapter: "19", heading: "1902", subheading: "1902.30" },
  { hsCode: "2002.90.00", description: "Tomato paste and preparations", chapter: "20", heading: "2002", subheading: "2002.90" },
  { hsCode: "1806.32.00", description: "Chocolate in containers <= 2kg", chapter: "18", heading: "1806", subheading: "1806.32" },
  { hsCode: "1905.31.00", description: "Biscuits, cookies, wafers", chapter: "19", heading: "1905", subheading: "1905.31" },
  { hsCode: "2201.10.00", description: "Waters (bottled water, mineral water)", chapter: "22", heading: "2201", subheading: "2201.10" },
  { hsCode: "2009.89.00", description: "Fruit juices (not from concentrate)", chapter: "20", heading: "2009", subheading: "2009.89" },
  { hsCode: "2202.99.00", description: "Energy drinks, soft drinks, other beverages", chapter: "22", heading: "2202", subheading: "2202.99" },
  { hsCode: "0901.21.00", description: "Coffee, roasted, not decaffeinated", chapter: "09", heading: "0901", subheading: "0901.21" },
  { hsCode: "0902.10.00", description: "Green tea in packages <= 3kg", chapter: "09", heading: "0902", subheading: "0902.10" },
  { hsCode: "0402.10.00", description: "Milk powder", chapter: "04", heading: "0402", subheading: "0402.10" },

  // Nigerian Products (Exports)
  { hsCode: "1515.90.00", description: "Shea butter (other fixed vegetable fats)", chapter: "15", heading: "1515", subheading: "1515.90" },
  { hsCode: "1511.10.00", description: "Crude palm oil", chapter: "15", heading: "1511", subheading: "1511.10" },
  { hsCode: "1801.00.00", description: "Cocoa beans, whole or broken", chapter: "18", heading: "1801", subheading: "1801.00" },
  { hsCode: "1508.10.00", description: "Groundnut (peanut) oil, crude", chapter: "15", heading: "1508", subheading: "1508.10" },
  { hsCode: "0305.59.00", description: "Dried fish (other than fillets)", chapter: "03", heading: "0305", subheading: "0305.59" },
  { hsCode: "0910.11.00", description: "Ginger, dried, not crushed or ground", chapter: "09", heading: "0910", subheading: "0910.11" },
  { hsCode: "1207.40.00", description: "Sesame seeds", chapter: "12", heading: "1207", subheading: "1207.40" },

  // Vehicles & Parts
  { hsCode: "8703.23.00", description: "Motor cars (1500-3000cc engine)", chapter: "87", heading: "8703", subheading: "8703.23" },
  { hsCode: "8703.22.00", description: "Motor cars (1000-1500cc engine)", chapter: "87", heading: "8703", subheading: "8703.22" },
  { hsCode: "8711.20.00", description: "Motorcycles (250-500cc)", chapter: "87", heading: "8711", subheading: "8711.20" },
  { hsCode: "4011.10.00", description: "New pneumatic tyres for motor cars", chapter: "40", heading: "4011", subheading: "4011.10" },
  { hsCode: "8507.10.00", description: "Lead-acid accumulators (car batteries)", chapter: "85", heading: "8507", subheading: "8507.10" },
  { hsCode: "8409.99.00", description: "Parts for spark-ignition engines (engine parts)", chapter: "84", heading: "8409", subheading: "8409.99" },

  // Home & Furniture
  { hsCode: "9404.21.00", description: "Mattresses of cellular rubber or plastics", chapter: "94", heading: "9404", subheading: "9404.21" },
  { hsCode: "9403.30.00", description: "Wooden furniture (desks, tables, shelves)", chapter: "94", heading: "9403", subheading: "9403.30" },
  { hsCode: "6302.21.00", description: "Bed linen of cotton (printed)", chapter: "63", heading: "6302", subheading: "6302.21" },
  { hsCode: "9403.50.00", description: "Wooden furniture for bedrooms", chapter: "94", heading: "9403", subheading: "9403.50" },
  { hsCode: "9403.60.00", description: "Other wooden furniture", chapter: "94", heading: "9403", subheading: "9403.60" },

  // Books & Stationery
  { hsCode: "4901.99.00", description: "Printed books (other than brochures)", chapter: "49", heading: "4901", subheading: "4901.99" },
  { hsCode: "4902.90.00", description: "Newspapers, journals, periodicals", chapter: "49", heading: "4902", subheading: "4902.90" },
  { hsCode: "4820.10.00", description: "Registers, account books, notebooks", chapter: "48", heading: "4820", subheading: "4820.10" },
  { hsCode: "9608.10.00", description: "Ball point pens", chapter: "96", heading: "9608", subheading: "9608.10" },

  // Toys & Sports
  { hsCode: "9503.00.00", description: "Toys (tricycles, scooters, dolls, puzzles)", chapter: "95", heading: "9503", subheading: "9503.00" },
  { hsCode: "9504.50.00", description: "Video game consoles and machines", chapter: "95", heading: "9504", subheading: "9504.50" },
  { hsCode: "9506.91.00", description: "Articles for gymnasium or outdoor games", chapter: "95", heading: "9506", subheading: "9506.91" },

  // Plastics & Packaging
  { hsCode: "3923.21.00", description: "Sacks and bags of polymers of ethylene (plastic bags)", chapter: "39", heading: "3923", subheading: "3923.21" },
  { hsCode: "3924.10.00", description: "Plastic tableware, kitchenware", chapter: "39", heading: "3924", subheading: "3924.10" },
];

const CHAPTER_NAMES: Record<string, string> = {
  "01": "Live animals", "02": "Meat", "03": "Fish", "04": "Dairy",
  "06": "Plants", "07": "Vegetables", "08": "Fruit and nuts", "09": "Coffee, tea, spices",
  "10": "Cereals", "11": "Milling products", "12": "Oil seeds", "15": "Fats and oils",
  "18": "Cocoa", "19": "Cereals and bakery", "20": "Vegetable preparations",
  "21": "Miscellaneous food", "22": "Beverages", "30": "Pharmaceuticals",
  "33": "Essential oils and cosmetics", "39": "Plastics", "40": "Rubber",
  "42": "Leather goods", "48": "Paper", "49": "Printed materials",
  "52": "Cotton", "61": "Knitted clothing", "62": "Woven clothing",
  "63": "Textile articles", "64": "Footwear", "65": "Headgear",
  "67": "Artificial hair and flowers", "70": "Glass", "73": "Iron or steel articles",
  "76": "Aluminum", "84": "Machinery", "85": "Electrical machinery",
  "87": "Vehicles", "90": "Optical and medical instruments",
  "91": "Clocks and watches", "94": "Furniture", "95": "Toys and games",
  "96": "Miscellaneous manufactured articles",
};

export function lookupHsCode(productTitle: string, category?: string, description?: string): HsCodeLookupResult {
  const searchText = [productTitle, category, description].filter(Boolean).join(" ").toLowerCase();
  const words = searchText.split(/\s+/).filter((w) => w.length > 2);

  const scored = HS_DATABASE.map((entry) => {
    const descLower = entry.description.toLowerCase();
    let score = 0;

    for (const word of words) {
      if (descLower.includes(word)) score += 10;
    }
    if (searchText.includes("phone") || searchText.includes("iphone") || searchText.includes("galaxy") || searchText.includes("samsung") || searchText.includes("android")) {
      if (entry.hsCode.startsWith("8517.12")) score += 50;
    }
    if (searchText.includes("laptop") || searchText.includes("notebook") || searchText.includes("macbook") || searchText.includes("computer")) {
      if (entry.hsCode.startsWith("8471.30")) score += 50;
    }
    if (searchText.includes("tablet") || searchText.includes("ipad")) {
      if (entry.hsCode.startsWith("8471.30")) score += 50;
    }
    if (searchText.includes("watch") && (searchText.includes("smart") || searchText.includes("apple"))) {
      if (entry.hsCode.startsWith("9102.12")) score += 50;
    }
    if (searchText.includes("headphone") || searchText.includes("earphone") || searchText.includes("earbuds") || searchText.includes("airpods")) {
      if (entry.hsCode === "8518.30.00") score += 50;
    }
    if (searchText.includes("t-shirt") || searchText.includes("tshirt") || searchText.includes("singlet")) {
      if (entry.hsCode.startsWith("6109")) score += 50;
    }
    if (searchText.includes("jeans") || searchText.includes("trouser") || searchText.includes("pants")) {
      if (entry.hsCode === "6203.42.00" || entry.hsCode === "6204.62.00") score += 50;
    }
    if (searchText.includes("dress")) {
      if (entry.hsCode === "6104.42.00") score += 50;
    }
    if (searchText.includes("shoe") || searchText.includes("sneaker") || searchText.includes("trainer") || searchText.includes("slipper")) {
      if (entry.hsCode.startsWith("640")) score += 50;
    }
    if (searchText.includes("bag") || searchText.includes("handbag") || searchText.includes("purse")) {
      if (entry.hsCode.startsWith("4202")) score += 50;
    }
    if (searchText.includes("skin") && (searchText.includes("cream") || searchText.includes("serum") || searchText.includes("lotion") || searchText.includes("moistur"))) {
      if (entry.hsCode === "3304.99.00") score += 50;
    }
    if (searchText.includes("hair") && (searchText.includes("extension") || searchText.includes("wig"))) {
      if (entry.hsCode === "6703.00.00") score += 50;
    }
    if (searchText.includes("perfume") || searchText.includes("cologne") || searchText.includes("fragrance")) {
      if (entry.hsCode === "3303.00.00") score += 50;
    }
    if (searchText.includes("generator")) {
      if (entry.hsCode === "8502.11.00") score += 50;
    }
    if (searchText.includes("led") && (searchText.includes("bulb") || searchText.includes("light"))) {
      if (entry.hsCode === "8539.50.00") score += 50;
    }
    if (searchText.includes("blender") || searchText.includes("mixer") || searchText.includes("grinder")) {
      if (entry.hsCode === "8509.40.00") score += 50;
    }
    if (searchText.includes("tv") || searchText.includes("television")) {
      if (entry.hsCode === "8528.72.00") score += 50;
    }
    if (searchText.includes("camera") || searchText.includes("cctv")) {
      if (entry.hsCode === "8525.80.00") score += 50;
    }
    if (searchText.includes("power bank") || searchText.includes("powerbank")) {
      if (entry.hsCode === "8507.60.00") score += 50;
    }
    if (searchText.includes("charger") || searchText.includes("adapter") || searchText.includes("power supply")) {
      if (entry.hsCode === "8504.40.00") score += 50;
    }
    if (searchText.includes("cable") || searchText.includes("wire")) {
      if (entry.hsCode === "8544.42.00") score += 50;
    }
    if (searchText.includes("speaker")) {
      if (entry.hsCode === "8518.20.00") score += 50;
    }
    if (searchText.includes("car") || searchText.includes("vehicle") || searchText.includes("automobile")) {
      if (entry.hsCode.startsWith("8703")) score += 50;
    }
    if (searchText.includes("tyre") || searchText.includes("tire")) {
      if (entry.hsCode === "4011.10.00") score += 50;
    }
    if (searchText.includes("battery") && !searchText.includes("power bank")) {
      if (entry.hsCode === "8507.10.00") score += 50;
    }
    if (searchText.includes("mattress")) {
      if (entry.hsCode === "9404.21.00") score += 50;
    }
    if (searchText.includes("furniture") || searchText.includes("table") || searchText.includes("desk") || searchText.includes("shelf")) {
      if (entry.hsCode.startsWith("9403")) score += 50;
    }
    if (searchText.includes("book") && !searchText.includes("facebook") && !searchText.includes("notebook")) {
      if (entry.hsCode === "4901.99.00") score += 50;
    }
    if (searchText.includes("toy") || searchText.includes("doll") || searchText.includes("puzzle")) {
      if (entry.hsCode === "9503.00.00") score += 50;
    }
    if (searchText.includes("game") && (searchText.includes("console") || searchText.includes("playstation") || searchText.includes("xbox") || searchText.includes("nintendo"))) {
      if (entry.hsCode === "9504.50.00") score += 50;
    }
    if (searchText.includes("shea butter")) {
      if (entry.hsCode === "1515.90.00") score += 50;
    }
    if (searchText.includes("palm oil")) {
      if (entry.hsCode === "1511.10.00") score += 50;
    }
    if (searchText.includes("cocoa") && searchText.includes("bean")) {
      if (entry.hsCode === "1801.00.00") score += 50;
    }
    if (searchText.includes("sesame")) {
      if (entry.hsCode === "1207.40.00") score += 50;
    }
    if (searchText.includes("noodle") || searchText.includes("instant")) {
      if (entry.hsCode === "1902.30.00") score += 50;
    }
    if (searchText.includes("chocolate")) {
      if (entry.hsCode === "1806.32.00") score += 50;
    }
    if (searchText.includes("coffee")) {
      if (entry.hsCode === "0901.21.00") score += 50;
    }
    if (searchText.includes("tea")) {
      if (entry.hsCode === "0902.10.00") score += 50;
    }
    if (searchText.includes("water") && (searchText.includes("bottle") || searchText.includes("mineral"))) {
      if (entry.hsCode === "2201.10.00") score += 50;
    }
    if (searchText.includes("juice")) {
      if (entry.hsCode === "2009.89.00") score += 50;
    }
    if (searchText.includes("energy") && searchText.includes("drink")) {
      if (entry.hsCode === "2202.99.00") score += 50;
    }
    if (searchText.includes("medicin") || searchText.includes("drug") || searchText.includes("pharmaceutical")) {
      if (entry.hsCode === "3004.90.00") score += 50;
    }
    if (searchText.includes("vitamin") || searchText.includes("supplement")) {
      if (entry.hsCode === "2106.90.00") score += 50;
    }
    if (searchText.includes("bandage") || searchText.includes("plaster") || searchText.includes("dressing")) {
      if (entry.hsCode === "3005.90.00") score += 50;
    }
    if (searchText.includes("pen")) {
      if (entry.hsCode === "9608.10.00") score += 50;
    }
    if (searchText.includes("notebook") && !searchText.includes("laptop")) {
      if (entry.hsCode === "4820.10.00") score += 50;
    }
    if (searchText.includes("diaper") || searchText.includes("nappy") || searchText.includes("sanitary")) {
      if (entry.hsCode === "9619.00.00") score += 50;
    }
    if (searchText.includes("soap")) {
      if (entry.hsCode === "3401.11.00") score += 40;
    }
    if (searchText.includes("toothbrush")) {
      if (entry.hsCode === "9603.21.00") score += 40;
    }

    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topScore = scored[0]?.score || 0;
  const exact = topScore >= 40 ? scored[0].entry : null;
  const suggestions = scored
    .filter((s) => s.score > 0)
    .slice(0, 5)
    .map((s) => s.entry);

  return {
    exact,
    suggestions,
    confidence: Math.min(topScore / 50, 1),
  };
}

export function validateHsCode(code: string): { valid: boolean; level: string; message: string } {
  const cleaned = code.replace(/[\s.-]/g, "");
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, level: "error", message: "HS code must contain only digits" };
  }
  if (cleaned.length < 4) {
    return { valid: false, level: "error", message: "HS code must be at least 4 digits (heading)" };
  }
  if (cleaned.length === 4) {
    return { valid: true, level: "heading", message: "Valid heading level (4 digits). Add 2 more digits for subheading." };
  }
  if (cleaned.length === 6) {
    return { valid: true, level: "subheading", message: "Valid international subheading (6 digits)." };
  }
  if (cleaned.length <= 10) {
    return { valid: true, level: "national", message: `Valid national code (${cleaned.length} digits).` };
  }
  return { valid: false, level: "error", message: "HS code cannot exceed 10 digits" };
}

export async function saveHsCode(hsCode: string, description: string, categoryId?: string, productId?: string, notes?: string) {
  return prisma.hsCode.upsert({
    where: { hsCode },
    update: { description, categoryId: categoryId || null, productId: productId || null, notes: notes || null },
    create: { hsCode, description, categoryId: categoryId || null, productId: productId || null, notes: notes || null },
  });
}

export async function findHsCode(code: string) {
  return prisma.hsCode.findUnique({ where: { hsCode: code } });
}

export async function searchHsCodes(query: string, limit = 20) {
  return prisma.hsCode.findMany({
    where: {
      OR: [
        { hsCode: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: { hsCode: "asc" },
  });
}

export function getChapterName(chapter: string): string {
  return CHAPTER_NAMES[chapter] || "Unknown chapter";
}

export { HS_DATABASE };
