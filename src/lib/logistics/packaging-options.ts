export interface PackagingOption {
  type: string;
  name: string;
  icon: string;
  description: string;
  bestFor: string[];
  sizes: PackagingSize[];
  innerProtection: string;
  badge?: string;
  note?: string;
}

export interface PackagingSize {
  code: string;
  label: string;
  dimensions: string;
}

export const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    type: "standard_box",
    name: "Standard Box",
    icon: "📦",
    description: "Classic cardboard box for most items",
    bestFor: ["Electronics", "Books", "Multiple items", "Gifts", "Fragile items", "Anything rigid"],
    sizes: [
      { code: "s", label: "Small", dimensions: "30×20×10cm" },
      { code: "m", label: "Medium", dimensions: "45×35×25cm" },
      { code: "l", label: "Large", dimensions: "60×50×40cm" },
    ],
    innerProtection: "Air pillows included",
    badge: "Most Popular",
  },
  {
    type: "poly_mailer",
    name: "Poly Mailer",
    icon: "🛍️",
    description: "Lightweight nylon bag for soft items",
    bestFor: ["Clothing", "Soft items", "Shoes", "Documents", "Lightweight items", "Fashion accessories"],
    sizes: [
      { code: "s", label: "Small", dimensions: "25×35cm" },
      { code: "m", label: "Medium", dimensions: "35×45cm" },
      { code: "l", label: "Large", dimensions: "45×60cm" },
    ],
    innerProtection: "None (item goes in bag)",
    note: "Not suitable for fragile items",
    badge: "Cheapest Option",
  },
  {
    type: "bubble_mailer",
    name: "Bubble Mailer",
    icon: "💌",
    description: "Padded envelope with bubble wrap lining",
    bestFor: ["Phones", "Small electronics", "Jewellery", "Glasses/sunglasses", "Books (single)", "Cosmetics"],
    sizes: [
      { code: "s", label: "Small", dimensions: "15×20cm" },
      { code: "m", label: "Medium", dimensions: "25×35cm" },
      { code: "l", label: "Large", dimensions: "35×50cm" },
    ],
    innerProtection: "Bubble wrap lining on all sides",
  },
  {
    type: "tube",
    name: "Document Tube",
    icon: "🗞️",
    description: "Cylindrical tube for rolled items",
    bestFor: ["Posters", "Artwork", "Canvases", "Architectural drawings", "Certificates", "Maps", "Rolled fabric"],
    sizes: [
      { code: "s", label: "Short", dimensions: "Up to 60cm" },
      { code: "m", label: "Medium", dimensions: "Up to 100cm" },
      { code: "l", label: "Long", dimensions: "Up to 150cm" },
    ],
    innerProtection: "End caps included, item rolls inside",
  },
  {
    type: "fragile_pack",
    name: "Fragile Pack",
    icon: "🔮",
    description: "Maximum protection for breakable items",
    bestFor: ["Glassware", "Ceramics", "Mirrors", "Electronics (screens)", "Artwork", "Musical instruments", "Antiques"],
    sizes: [
      { code: "m", label: "Standard", dimensions: "Up to 30×30×30cm" },
    ],
    innerProtection: "3+ layers bubble wrap | Foam inserts all sides | Fragile stickers | This Way Up arrows",
    note: "Our most protective packaging",
  },
  {
    type: "gift_box",
    name: "Premium Gift Box",
    icon: "🎁",
    description: "Luxury rigid gift box with ribbon",
    bestFor: ["Birthday gifts", "Anniversary gifts", "Corporate gifts", "Luxury items", "Special occasions"],
    sizes: [
      { code: "s", label: "Small", dimensions: "20×15×10cm" },
      { code: "m", label: "Medium", dimensions: "30×25×15cm" },
      { code: "l", label: "Large", dimensions: "40×35×20cm" },
    ],
    innerProtection: "Rigid box | Orange tissue paper | Kauvex branded ribbon | Gift message card",
    badge: "Premium Experience",
  },
  {
    type: "heavy_duty",
    name: "Heavy Duty Box",
    icon: "🏋️",
    description: "Double-walled reinforced box for heavy items",
    bestFor: ["Industrial parts", "Tools", "Heavy electronics", "Bulk orders", "Commercial goods"],
    sizes: [
      { code: "l", label: "Large", dimensions: "60×50×40cm" },
      { code: "xl", label: "XL", dimensions: "80×60×50cm" },
      { code: "xxl", label: "XXL", dimensions: "100×80×70cm" },
    ],
    innerProtection: "High-density foam peanuts OR corrugated dividers",
    note: "Weight capacity: up to 50kg",
  },
  {
    type: "insulated",
    name: "Insulated Pack",
    icon: "❄️",
    description: "Temperature-controlled packaging",
    bestFor: ["Temperature-sensitive food", "Pharmaceuticals", "Skincare", "Medical supplies", "Cold chain items"],
    sizes: [
      { code: "s", label: "Small", dimensions: "20×15×15cm" },
      { code: "m", label: "Medium", dimensions: "30×25×20cm" },
    ],
    innerProtection: "Insulated foam lining | Ice pack (12-24 hours) | Temperature sticker",
    note: "Available for same-day and express delivery only",
  },
];

export function getPackagingByType(type: string): PackagingOption | undefined {
  return PACKAGING_OPTIONS.find((p) => p.type === type);
}

export function getPackagingSize(type: string, sizeCode: string): PackagingSize | undefined {
  const option = getPackagingByType(type);
  return option?.sizes.find((s) => s.code === sizeCode);
}

export function calculateDimWeight(lengthCm: number, widthCm: number, heightCm: number, divisor: number = 5000): number {
  return (lengthCm * widthCm * heightCm) / divisor;
}

export function suggestPackaging(itemWeight: number, itemDimensions?: { l: number; w: number; h: number }): { type: string; size: string; reason: string } {
  if (!itemDimensions) {
    if (itemWeight < 0.5) return { type: "poly_mailer", size: "s", reason: "Lightweight item, no fragile content" };
    if (itemWeight < 2) return { type: "standard_box", size: "s", reason: "Standard weight, fits small box" };
    return { type: "standard_box", size: "m", reason: "Medium weight item" };
  }

  const { l, w, h } = itemDimensions;
  const volume = l * w * h;

  if (volume < 15000) return { type: "bubble_mailer", size: "s", reason: "Small dimensions, padded protection ideal" };
  if (volume < 50000) return { type: "standard_box", size: "s", reason: "Fits small box with protection" };
  if (volume < 80000) return { type: "standard_box", size: "m", reason: "Medium dimensions, standard box" };
  return { type: "standard_box", size: "l", reason: "Large dimensions, needs large box" };
}
