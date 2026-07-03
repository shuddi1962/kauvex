import { Product, HeroSlide, CategoryIcon, Brand, Vendor, PromoCard } from "./homepage-types";

const img = (id: number, w = 600, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80`;

export const heroSlides: HeroSlide[] = [
  {
    id: "s1",
    tag: "Up to 70% Off",
    title: "The Super September Sale",
    subtitle: "Top deals on electronics, fashion & home essentials — limited time only.",
    image: img(1607082349, 1440, 600),
    cta: "Shop the Sale",
    gradient: "from-navy/90 via-navy/50 to-transparent",
    href: "/deals",
  },
  {
    id: "s2",
    tag: "New Season",
    title: "Refresh Your Home",
    subtitle: "Modern furniture & decor, starting at $49. Curated for every space.",
    image: img(1618220179, 1440, 600),
    cta: "Explore Collection",
    gradient: "from-navy/90 via-navy/40 to-transparent",
    href: "/category/home-living",
  },
  {
    id: "s3",
    tag: "Limited Time",
    title: "Tech Flash Weekend",
    subtitle: "Save big on laptops, phones & audio gear. 48 hours only.",
    image: img(1498049794, 1440, 600),
    cta: "Grab the Deal",
    gradient: "from-navy/90 via-navy/40 to-transparent",
    href: "/category/electronics",
  },
];

export const dealOfDayProducts: Product[] = [
  { id: "d1", title: "Premium Wireless Noise-Cancelling Headphones", category: "Audio", image: img(1505740043), price: 89.99, oldPrice: 149.99, rating: 4.6, reviews: 2147, discount: 40, badge: "SALE" },
  { id: "d2", title: "Smart Fitness Watch Pro Series", category: "Wearables", image: img(1523278682), price: 129, oldPrice: 199, rating: 4.4, reviews: 1320, discount: 35, badge: "SALE" },
  { id: "d3", title: "4K Ultra HD Action Camera", category: "Cameras", image: img(1502920912), price: 159, oldPrice: 249, rating: 4.8, reviews: 892, discount: 36, badge: "HOT" },
  { id: "d4", title: "Portable Bluetooth Speaker Waterproof", category: "Audio", image: img(1608043158), price: 39.99, oldPrice: 69.99, rating: 4.3, reviews: 3012, discount: 43, badge: "SALE" },
  { id: "d5", title: "Ergonomic Gaming Chair Premium", category: "Furniture", image: img(1592078013), price: 219, oldPrice: 329, rating: 4.5, reviews: 764, discount: 33, badge: "SALE" },
];

export const topProducts: Record<string, Product[]> = {
  Electronics: [
    { id: "e1", title: 'Ultra-Slim Laptop 14" OLED Display', category: "Computers", image: img(1496188132), price: 899, oldPrice: 1099, rating: 4.7, reviews: 145, discount: 18, badge: "SALE" },
    { id: "e2", title: '55" 4K Smart TV with HDR10+', category: "TVs", image: img(1593355440), price: 599, oldPrice: 799, rating: 4.5, reviews: 210, discount: 25, badge: "SALE" },
    { id: "e3", title: "Mirrorless Camera Kit 24MP", category: "Cameras", image: img(1510127620), price: 749, oldPrice: 899, rating: 4.6, reviews: 58, discount: 17 },
    { id: "e4", title: "Gaming Console Pro 1TB", category: "Gaming", image: img(1606811845), price: 449, oldPrice: 499, rating: 4.9, reviews: 402, discount: 10, badge: "HOT" },
    { id: "e5", title: "Noise-Isolating Wireless Earbuds", category: "Audio", image: img(1606220942), price: 59, oldPrice: 89, rating: 4.2, reviews: 176, discount: 34 },
    { id: "e6", title: "Smart Home Hub with Voice Control", category: "Smart Home", image: img(1558089003), price: 79, oldPrice: 99, rating: 4.1, reviews: 64, discount: 20 },
  ],
  Fashion: [
    { id: "f1", title: "Classic Leather Sneakers White", category: "Shoes", image: img(1549298911), price: 74, oldPrice: 110, rating: 4.4, reviews: 88, discount: 33, badge: "SALE" },
    { id: "f2", title: "Tailored Wool Blazer Navy", category: "Menswear", image: img(1593032256), price: 129, oldPrice: 179, rating: 4.3, reviews: 41, discount: 28 },
    { id: "f3", title: "Everyday Tote Bag Premium", category: "Bags", image: img(1547940927), price: 49, oldPrice: 69, rating: 4.6, reviews: 133, discount: 29 },
    { id: "f4", title: "Minimalist Analog Watch Gold", category: "Watches", image: img(1524592092), price: 89, oldPrice: 120, rating: 4.5, reviews: 97, discount: 26, badge: "NEW" },
    { id: "f5", title: "Cashmere Blend Scarf", category: "Accessories", image: img(1591561951), price: 34, oldPrice: 48, rating: 4.2, reviews: 26, discount: 29 },
    { id: "f6", title: "Running Performance Jacket", category: "Sportswear", image: img(1576566697), price: 65, oldPrice: 95, rating: 4.4, reviews: 55, discount: 32 },
  ],
  "Home & Living": [
    { id: "h1", title: "Modular Fabric Sofa 3-Seater", category: "Furniture", image: img(1555048774), price: 699, oldPrice: 949, rating: 4.5, reviews: 39, discount: 26, badge: "SALE" },
    { id: "h2", title: "Espresso Coffee Machine Pro", category: "Appliances", image: img(1598024456), price: 189, oldPrice: 249, rating: 4.7, reviews: 118, discount: 24 },
    { id: "h3", title: "Ceramic Dinnerware Set 12pc", category: "Kitchen", image: img(1578749550), price: 59, oldPrice: 84, rating: 4.3, reviews: 62, discount: 30 },
    { id: "h4", title: "Aromatherapy Ultrasonic Diffuser", category: "Home Decor", image: img(1602875436), price: 29, oldPrice: 42, rating: 4.1, reviews: 90, discount: 31 },
    { id: "h5", title: "Memory Foam Pillow Set 2pk", category: "Bedding", image: img(1567625837), price: 39, oldPrice: 55, rating: 4.4, reviews: 74, discount: 29 },
    { id: "h6", title: "Robot Vacuum Cleaner LiDAR", category: "Appliances", image: img(1580674686), price: 249, oldPrice: 329, rating: 4.6, reviews: 205, discount: 24, badge: "HOT" },
  ],
};

export const categoryBlocks: {
  key: string;
  title: string;
  bannerImage: string;
  bannerTag: string;
  href: string;
  products: Product[];
}[] = [
  {
    key: "beauty",
    title: "Beauty & Health",
    bannerImage: img(1596462502),
    bannerTag: "Glow Up",
    href: "/category/health-beauty",
    products: [
      { id: "b1", title: "Vitamin C Brightening Serum", category: "Skincare", image: img(1570191892), price: 22, oldPrice: 32, rating: 4.5, reviews: 210, discount: 31 },
      { id: "b2", title: "Luxury Beauty Bundle 4pc", category: "Skincare", image: img(1596462502), price: 68, oldPrice: 95, rating: 4.7, reviews: 84, discount: 28, badge: "SALE" },
      { id: "b3", title: "Matte Finish Lipstick Set", category: "Makeup", image: img(1586492076), price: 24, oldPrice: 35, rating: 4.3, reviews: 152, discount: 31 },
      { id: "b4", title: "Electric Facial Cleansing Brush", category: "Tools", image: img(1578983892), price: 34, oldPrice: 49, rating: 4.4, reviews: 67, discount: 30 },
      { id: "b5", title: "Argan Hair Repair Oil", category: "Haircare", image: img(1588013279), price: 18, oldPrice: 26, rating: 4.6, reviews: 198, discount: 31 },
    ],
  },
  {
    key: "electronics",
    title: "Digital & Mobile",
    bannerImage: img(1468495244),
    bannerTag: "Cyber Deals",
    href: "/category/electronics",
    products: [
      { id: "el1", title: "Flagship Smartphone 256GB", category: "Phones", image: img(1598323795), price: 699, oldPrice: 899, rating: 4.7, reviews: 380, discount: 22, badge: "SALE" },
      { id: "el2", title: 'Tablet Pro 11" M2 Chip', category: "Tablets", image: img(1546445157), price: 449, oldPrice: 549, rating: 4.5, reviews: 121, discount: 18 },
      { id: "el3", title: "Wireless Charging Pad Fast Charge", category: "Accessories", image: img(1583860450), price: 19, oldPrice: 29, rating: 4.2, reviews: 244, discount: 34 },
      { id: "el4", title: "Mechanical Keyboard RGB Hot-Swap", category: "Computers", image: img(1562541442), price: 79, oldPrice: 109, rating: 4.6, reviews: 96, discount: 27 },
      { id: "el5", title: 'Ultra-Wide Monitor 34" Curved', category: "Computers", image: img(1586210579), price: 389, oldPrice: 469, rating: 4.5, reviews: 53, discount: 17 },
    ],
  },
  {
    key: "fashion",
    title: "Women's Fashion",
    bannerImage: img(1445205170),
    bannerTag: "Summer Edit",
    href: "/category/fashion",
    products: [
      { id: "wf1", title: "Linen Wrap Midi Dress", category: "Dresses", image: img(1595772547), price: 44, oldPrice: 64, rating: 4.4, reviews: 71, discount: 31 },
      { id: "wf2", title: "Strappy Block Heel Sandals", category: "Shoes", image: img(1562279518), price: 39, oldPrice: 58, rating: 4.3, reviews: 45, discount: 33 },
      { id: "wf3", title: "Structured Shoulder Bag", category: "Bags", image: img(1584911052), price: 52, oldPrice: 74, rating: 4.5, reviews: 63, discount: 30 },
      { id: "wf4", title: "Oversized Knit Cardigan", category: "Knitwear", image: img(1575939000), price: 36, oldPrice: 52, rating: 4.2, reviews: 38, discount: 31 },
      { id: "wf5", title: "Gold Layered Necklace Set", category: "Jewelry", image: img(1606768650), price: 21, oldPrice: 30, rating: 4.6, reviews: 109, discount: 30 },
    ],
  },
  {
    key: "furniture",
    title: "Furniture",
    bannerImage: img(1586023492),
    bannerTag: "Home Refresh",
    href: "/category/home-living",
    products: [
      { id: "fu1", title: "Solid Oak Coffee Table", category: "Living Room", image: img(1533090481), price: 179, oldPrice: 249, rating: 4.5, reviews: 32, discount: 28 },
      { id: "fu2", title: "Velvet Accent Armchair", category: "Living Room", image: img(1567538096), price: 229, oldPrice: 319, rating: 4.6, reviews: 47, discount: 28 },
      { id: "fu3", title: "Minimalist Bookshelf Walnut", category: "Storage", image: img(1594622884), price: 139, oldPrice: 189, rating: 4.3, reviews: 24, discount: 26 },
      { id: "fu4", title: "Adjustable Standing Desk Electric", category: "Office", image: img(1593644456), price: 259, oldPrice: 349, rating: 4.7, reviews: 88, discount: 26, badge: "HOT" },
      { id: "fu5", title: "Platform Bed Frame Queen", category: "Bedroom", image: img(1558618773), price: 319, oldPrice: 429, rating: 4.4, reviews: 29, discount: 26 },
    ],
  },
  {
    key: "appliances",
    title: "Appliances",
    bannerImage: img(1556905052),
    bannerTag: "Kitchen Deals",
    href: "/category/home-living",
    products: [
      { id: "ap1", title: "Air Fryer XL 6.5L Digital", category: "Kitchen", image: img(1596496499), price: 79, oldPrice: 109, rating: 4.6, reviews: 267, discount: 27, badge: "HOT" },
      { id: "ap2", title: "Stand Mixer Pro 5.5qt", category: "Kitchen", image: img(1603847731), price: 199, oldPrice: 279, rating: 4.7, reviews: 91, discount: 29 },
      { id: "ap3", title: "Cordless Stick Vacuum 45min", category: "Cleaning", image: img(1587150086), price: 149, oldPrice: 199, rating: 4.4, reviews: 138, discount: 25 },
      { id: "ap4", title: "Smart Refrigerator 4-Door", category: "Large Appliances", image: img(1571171634), price: 1299, oldPrice: 1599, rating: 4.5, reviews: 22, discount: 19 },
      { id: "ap5", title: "Compact Dishwasher Countertop", category: "Large Appliances", image: img(1594391829), price: 349, oldPrice: 449, rating: 4.3, reviews: 41, discount: 22 },
    ],
  },
];

export const categoryIcons: CategoryIcon[] = [
  { id: "c1", label: "Electronics", icon: "Smartphone", href: "/category/electronics" },
  { id: "c2", label: "Fashion", icon: "Shirt", href: "/category/fashion" },
  { id: "c3", label: "Home & Living", icon: "Sofa", href: "/category/home-living" },
  { id: "c4", label: "Health & Beauty", icon: "Sparkles", href: "/category/health-beauty" },
  { id: "c5", label: "Mother & Baby", icon: "Baby", href: "/category/mother-baby" },
  { id: "c6", label: "Sports & Outdoors", icon: "Dumbbell", href: "/category/sports-outdoors" },
  { id: "c7", label: "Automotive", icon: "Car", href: "/category/automotive" },
  { id: "c8", label: "Office & Stationery", icon: "Briefcase", href: "/category/office-stationery" },
  { id: "c9", label: "Digital Products", icon: "Download", href: "/category/digital-products" },
  { id: "c10", label: "Industrial & B2B", icon: "Factory", href: "/category/industrial-b2b" },
  { id: "c11", label: "Watches & Jewellery", icon: "Watch", href: "/category/fashion" },
  { id: "c12", label: "Gaming", icon: "Gamepad2", href: "/category/electronics" },
];

export const brands: Brand[] = [
  { id: "br1", name: "Alpha Node" },
  { id: "br2", name: "Everfyre" },
  { id: "br3", name: "Nordwear" },
  { id: "br4", name: "Cadex" },
  { id: "br5", name: "Solstice" },
  { id: "br6", name: "Ironclad" },
  { id: "br7", name: "Vantel" },
  { id: "br8", name: "Brightloop" },
  { id: "br9", name: "Zentia" },
  { id: "br10", name: "Aurelius" },
];

export const vendors: Vendor[] = [
  { id: "v1", name: "Everfyre Studio", rating: "4.9", items: 128, gradient: "from-orange-500 to-pink-500" },
  { id: "v2", name: "Nordwear Co.", rating: "4.7", items: 96, gradient: "from-blue-500 to-cyan-500" },
  { id: "v3", name: "Cadex Home", rating: "4.8", items: 74, gradient: "from-purple-500 to-violet-500" },
  { id: "v4", name: "Solstice Beauty", rating: "4.6", items: 152, gradient: "from-emerald-500 to-teal-500" },
  { id: "v5", name: "Ironclad Gear", rating: "4.8", items: 89, gradient: "from-amber-500 to-orange-500" },
  { id: "v6", name: "Brightloop Tech", rating: "4.9", items: 203, gradient: "from-rose-500 to-red-500" },
];

export const promoStrip: PromoCard[] = [
  { id: "p1", title: "Summer Sale", subtitle: "Up to 50% off", theme: "from-emerald-600 to-emerald-500", icon: "Sun", href: "/deals" },
  { id: "p2", title: "End of Summer", subtitle: "Big Sale \u00b7 60% off", theme: "from-sky-600 to-sky-500", icon: "CloudSun", href: "/deals" },
  { id: "p3", title: "Best Offer", subtitle: "Extra 15% off", theme: "from-orange-600 to-amber-500", icon: "Zap", href: "/deals" },
  { id: "p4", title: "Weekend Sale", subtitle: "Shop now & save", theme: "from-violet-600 to-fuchsia-500", icon: "Calendar", href: "/deals" },
];

export const todaysDeals: Product[] = [
  { id: "td1", title: "Smart Watch Bluetooth Elite", category: "Wearables", image: img(1523278682), price: 129, oldPrice: 189, rating: 4.5, reviews: 88, discount: 32 },
  { id: "td2", title: '24" LED Monitor 165Hz', category: "Computers", image: img(1527440543), price: 149, oldPrice: 199, rating: 4.4, reviews: 56, discount: 25 },
  { id: "td3", title: "VR Headset Immersive", category: "Gaming", image: img(1580034976), price: 219, oldPrice: 289, rating: 4.6, reviews: 40, discount: 24 },
];

export const existingRoutes: Record<string, string> = {
  Electronics: "/category/electronics",
  Fashion: "/category/fashion",
  "Home & Living": "/category/home-living",
  Appliances: "/category/home-living",
  Furniture: "/category/home-living",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Deals", href: "/deals" },
  { label: "Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
