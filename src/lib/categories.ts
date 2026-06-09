export interface KauvexCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  image: string;
  subcategories: KauvexSubcategory[];
}

export interface KauvexSubcategory {
  name: string;
  slug: string;
  description?: string;
}

export const KAUVEX_CATEGORIES: KauvexCategory[] = [
  {
    id: "electronics",
    name: "Electronics & Technology",
    description: "Smartphones, laptops, gaming, wearables, and more",
    icon: "💻",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Smartphones & Accessories", slug: "smartphones", description: "Latest smartphones, cases, chargers, screen protectors" },
      { name: "Laptops & Computers", slug: "laptops", description: "Laptops, desktops, monitors, and peripherals" },
      { name: "Tablets & E-Readers", slug: "tablets", description: "iPad, Android tablets, Kindle, and accessories" },
      { name: "Smart Home & IoT", slug: "smart-home", description: "Smart speakers, lights, security cameras, thermostats" },
      { name: "Audio & Headphones", slug: "audio", description: "Headphones, earbuds, speakers, soundbars" },
      { name: "Cameras & Photography", slug: "cameras", description: "DSLR, mirrorless, action cams, and accessories" },
      { name: "Gaming & Consoles", slug: "gaming", description: "PS5, Xbox, Nintendo Switch, gaming PCs & accessories" },
      { name: "Wearables & Smartwatches", slug: "wearables", description: "Apple Watch, Fitbit, Garmin, and smart bands" },
      { name: "TV & Home Entertainment", slug: "tv-entertainment", description: "Smart TVs, projectors, streaming devices" },
      { name: "Computer Components", slug: "computer-components", description: "CPU, GPU, RAM, motherboards, storage" },
      { name: "Networking Equipment", slug: "networking", description: "Routers, switches, modems, mesh systems" },
      { name: "Power Banks & Chargers", slug: "power-banks", description: "Portable chargers, wireless chargers, cables" },
      { name: "Cables & Adapters", slug: "cables-adapters", description: "HDMI, USB, Thunderbolt, adapters and hubs" },
    ],
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    description: "Clothing, shoes, accessories, and jewellery for everyone",
    icon: "👗",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Men's Clothing", slug: "mens-clothing", description: "Shirts, trousers, jackets, suits, casual wear" },
      { name: "Women's Clothing", slug: "womens-clothing", description: "Dresses, tops, skirts, jeans, outerwear" },
      { name: "Children's Clothing", slug: "kids-clothing", description: "Boys, girls, and baby clothing sets" },
      { name: "Shoes & Footwear", slug: "shoes", description: "Sneakers, boots, sandals, formal shoes, heels" },
      { name: "Bags & Luggage", slug: "bags-luggage", description: "Backpacks, handbags, suitcases, travel bags" },
      { name: "Watches & Jewellery", slug: "watches-jewellery", description: "Luxury watches, fashion jewellery, rings, bracelets" },
      { name: "Sunglasses & Eyewear", slug: "eyewear", description: "Designer sunglasses, prescription glasses, frames" },
      { name: "Sportswear & Activewear", slug: "sportswear", description: "Gym wear, yoga pants, sports bras, tracksuits" },
      { name: "Underwear & Loungewear", slug: "underwear", description: "Boxers, briefs, bras, socks, loungewear sets" },
      { name: "Traditional & Cultural Wear", slug: "traditional-wear", description: "Kaftans, dashikis, kimonos, sarees, agbadas" },
    ],
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "Furniture, decor, kitchen, garden, and everything home",
    icon: "🏠",
    slug: "home-living",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Furniture", slug: "furniture", description: "Sofas, beds, tables, chairs, wardrobes, shelves" },
      { name: "Kitchen & Dining", slug: "kitchen-dining", description: "Cookware, utensils, dinner sets, appliances" },
      { name: "Bedding & Bath", slug: "bedding-bath", description: "Sheets, duvets, pillows, towels, bath mats" },
      { name: "Home Décor", slug: "home-decor", description: "Wall art, candles, vases, rugs, mirrors" },
      { name: "Lighting", slug: "lighting", description: "Lamps, ceiling lights, fairy lights, smart bulbs" },
      { name: "Storage & Organisation", slug: "storage-org", description: "Bins, shelves, closet organisers, drawer dividers" },
      { name: "Garden & Outdoor", slug: "garden-outdoor", description: "Plants, pots, garden tools, outdoor furniture" },
      { name: "Cleaning & Laundry", slug: "cleaning-laundry", description: "Vacuum cleaners, mops, detergents, laundry baskets" },
      { name: "DIY & Tools", slug: "diy-tools", description: "Power tools, hand tools, hardware, workbenches" },
      { name: "Home Security", slug: "home-security", description: "Smart locks, doorbells, security cameras, alarms" },
    ],
  },
  {
    id: "health-beauty",
    name: "Health & Beauty",
    description: "Skincare, makeup, haircare, supplements, and wellness",
    icon: "✨",
    slug: "health-beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Skincare", slug: "skincare", description: "Moisturisers, serums, cleansers, sunscreens, masks" },
      { name: "Hair Care", slug: "hair-care", description: "Shampoos, conditioners, styling tools, treatments" },
      { name: "Makeup & Cosmetics", slug: "makeup", description: "Foundation, lipstick, eyeshadow, brushes, palettes" },
      { name: "Men's Grooming", slug: "mens-grooming", description: "Beard care, razors, cologne, shaving kits" },
      { name: "Vitamins & Supplements", slug: "supplements", description: "Multivitamins, protein powders, fish oil, probiotics" },
      { name: "Medical Devices", slug: "medical-devices", description: "Blood pressure monitors, thermometers, pulse oximeters" },
      { name: "Dental Care", slug: "dental-care", description: "Toothbrushes, toothpaste, whitening kits, floss" },
      { name: "Fragrances", slug: "fragrances", description: "Perfumes, colognes, body mists, essential oils" },
      { name: "Fitness Equipment", slug: "fitness-equipment", description: "Dumbbells, yoga mats, resistance bands, treadmills" },
      { name: "Wellness", slug: "wellness", description: "Aromatherapy, massage guns, relaxation, sleep aids" },
    ],
  },
  {
    id: "mother-baby",
    name: "Mother & Baby",
    description: "Baby essentials, toys, nursery furniture, and maternity",
    icon: "👶",
    slug: "mother-baby",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Baby Clothing", slug: "baby-clothing", description: "Onesies, babygrows, hats, socks, bibs" },
      { name: "Toys & Games", slug: "toys-games", description: "Educational toys, puzzles, dolls, building blocks" },
      { name: "Pushchairs & Car Seats", slug: "pushchairs-car-seats", description: "Strollers, prams, car seats, travel systems" },
      { name: "Baby Food & Formula", slug: "baby-food", description: "Organic baby food, formula milk, snacks, feeding" },
      { name: "Nursery Furniture", slug: "nursery-furniture", description: "Cribs, changing tables, rocking chairs, cots" },
      { name: "Educational Toys", slug: "educational-toys", description: "STEM toys, flashcards, books, learning aids" },
      { name: "Board Games", slug: "board-games", description: "Family games, strategy games, card games, puzzles" },
    ],
  },
  {
    id: "sports-outdoors",
    name: "Sports & Outdoors",
    description: "Sports equipment, camping gear, cycling, and fitness",
    icon: "⚽",
    slug: "sports-outdoors",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Football & Team Sports", slug: "football", description: "Football boots, jerseys, balls, goal nets" },
      { name: "Swimming & Water Sports", slug: "swimming", description: "Swimwear, goggles, snorkels, pool accessories" },
      { name: "Cycling", slug: "cycling", description: "Bicycles, helmets, lights, locks, cycling apparel" },
      { name: "Camping & Hiking", slug: "camping-hiking", description: "Tents, sleeping bags, backpacks, hiking boots" },
      { name: "Fishing", slug: "fishing", description: "Fishing rods, reels, tackle boxes, bait, gear" },
      { name: "Boxing & Martial Arts", slug: "boxing-martial-arts", description: "Gloves, punch bags, protectors, uniforms" },
      { name: "Running & Athletics", slug: "running-athletics", description: "Running shoes, apparel, hydration packs, watches" },
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    description: "Car parts, accessories, motorcycle gear, and maintenance",
    icon: "🚗",
    slug: "automotive",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Car Accessories", slug: "car-accessories", description: "Seat covers, dashcams, floor mats, phone holders" },
      { name: "Motorcycle Parts", slug: "motorcycle-parts", description: "Helmets, gloves, chains, brake pads, lights" },
      { name: "Car Electronics", slug: "car-electronics", description: "GPS, stereos, subwoofers, LED lights, sensors" },
      { name: "Tyres & Wheels", slug: "tyres-wheels", description: "Car tyres, alloy wheels, rim covers, tyre accessories" },
      { name: "Car Care & Cleaning", slug: "car-care", description: "Waxes, polishes, shampoos, interior cleaners" },
      { name: "Commercial Vehicle Parts", slug: "commercial-parts", description: "Truck parts, van accessories, fleet supplies" },
    ],
  },
  {
    id: "office-stationery",
    name: "Office & Stationery",
    description: "Office supplies, printers, stationery, and business machines",
    icon: "💼",
    slug: "office-stationery",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Office Furniture", slug: "office-furniture", description: "Desks, chairs, filing cabinets, bookshelves" },
      { name: "Printers & Scanners", slug: "printers-scanners", description: "Inkjet, laser printers, multifunction, 3D printers" },
      { name: "Stationery & Supplies", slug: "stationery", description: "Pens, paper, notebooks, folders, sticky notes" },
      { name: "Whiteboards & Display", slug: "whiteboards-display", description: "Whiteboards, bulletin boards, flip charts, easels" },
      { name: "Business Machines", slug: "business-machines", description: "Shredders, laminators, binding machines, cash registers" },
    ],
  },
  {
    id: "digital-products",
    name: "Digital Products",
    description: "Software, gift cards, online courses, and e-books",
    icon: "📦",
    slug: "digital-products",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Software & Licenses", slug: "software-licenses", description: "Antivirus, office suites, design tools, OS licenses" },
      { name: "Gift Cards & Vouchers", slug: "gift-cards", description: "KAUVEX gift cards, store credit, digital vouchers" },
      { name: "Online Courses", slug: "online-courses", description: "Programming, design, business, language courses" },
      { name: "E-Books", slug: "ebooks", description: "Fiction, non-fiction, textbooks, audiobooks" },
    ],
  },
  {
    id: "industrial-b2b",
    name: "Industrial & B2B",
    description: "Safety equipment, electrical, construction, and industrial supplies",
    icon: "🏭",
    slug: "industrial-b2b",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop",
    subcategories: [
      { name: "Safety Equipment & PPE", slug: "safety-ppe", description: "Hard hats, gloves, masks, safety vests, harnesses" },
      { name: "Electrical & Industrial", slug: "electrical-industrial", description: "Cables, switches, circuit breakers, tools" },
      { name: "Construction Materials", slug: "construction", description: "Cement, steel, wood, paints, plumbing supplies" },
      { name: "Packaging & Shipping Supplies", slug: "packaging", description: "Boxes, tape, bubble wrap, pallets, labels" },
      { name: "Agricultural Equipment", slug: "agricultural", description: "Farm tools, irrigation, seeds, fertilizers" },
    ],
  },
];

export function getCategoryBySlug(slug: string): KauvexCategory | undefined {
  return KAUVEX_CATEGORIES.find(c => c.slug === slug);
}

export function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string): KauvexSubcategory | undefined {
  const cat = getCategoryBySlug(categorySlug);
  return cat?.subcategories.find(s => s.slug === subcategorySlug);
}
