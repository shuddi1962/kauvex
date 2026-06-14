export type AdPlacement = {
  id: string;
  label: string;
  description: string;
  dimensions: string;
};

export type AggregatedMetrics = {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  cpc: number;
  roas: number;
  cac: number;
};

const placements: AdPlacement[] = [
  { id: "homepage_top", label: "Homepage Top", description: "Hero banner at the top of the marketplace homepage", dimensions: "1200x300" },
  { id: "homepage_middle", label: "Homepage Middle", description: "Banner in the middle of the homepage", dimensions: "728x90" },
  { id: "sidebar", label: "Sidebar", description: "Sidebar banner on category and product pages", dimensions: "300x250" },
  { id: "search_results", label: "Search Results", description: "Sponsored placement in search results", dimensions: "600x200" },
  { id: "category_top", label: "Category Top", description: "Banner at the top of category pages", dimensions: "1200x200" },
  { id: "product_detail", label: "Product Detail", description: "Banner on product detail pages", dimensions: "300x250" },
  { id: "checkout", label: "Checkout Page", description: "Banner during checkout flow", dimensions: "728x90" },
  { id: "mobile_interstitial", label: "Mobile Interstitial", description: "Full-screen ad on mobile app", dimensions: "360x640" },
];

export function getAdPlacements(): AdPlacement[] {
  return placements;
}

export function calculateCTR(impressions: number, clicks: number): number {
  if (impressions <= 0) return 0;
  return (clicks / impressions) * 100;
}

export function calculateROAS(spend: number, revenue: number): number {
  if (spend <= 0) return 0;
  return revenue / spend;
}

export function calculateCAC(spend: number, conversions: number): number {
  if (conversions <= 0) return 0;
  return spend / conversions;
}

export function getAdMetrics(
  campaignId: string,
  startDate: string,
  endDate: string
): AggregatedMetrics {
  const impressions = 0;
  const clicks = 0;
  const conversions = 0;
  const spend = 0;
  const revenue = 0;
  const ctr = calculateCTR(impressions, clicks);
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const roas = calculateROAS(spend, revenue);
  const cac = calculateCAC(spend, conversions);

  return { impressions, clicks, conversions, spend, revenue, ctr, conversionRate, cpc, roas, cac };
}
