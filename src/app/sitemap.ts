import { MetadataRoute } from "next";

const BASE_URL = "https://kauvex.com";

const staticRoutes = [
  { path: "", priority: 1.0, changeFreq: "daily" as const },
  { path: "/shop", priority: 0.9, changeFreq: "daily" as const },
  { path: "/deals", priority: 0.8, changeFreq: "daily" as const },
  { path: "/new-arrivals", priority: 0.8, changeFreq: "daily" as const },
  { path: "/brands", priority: 0.6, changeFreq: "weekly" as const },
  { path: "/blog", priority: 0.7, changeFreq: "daily" as const },
  { path: "/gift-cards", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/faq", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/help", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/contact", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/about", priority: 0.5, changeFreq: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFreq: "monthly" as const },
  { path: "/terms", priority: 0.3, changeFreq: "monthly" as const },
  { path: "/express", priority: 0.7, changeFreq: "weekly" as const },
  { path: "/concierge", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/associate", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/creators", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/b2b-referral", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/live", priority: 0.6, changeFreq: "daily" as const },
  { path: "/group-buy", priority: 0.5, changeFreq: "daily" as const },
  { path: "/art-marketplace", priority: 0.5, changeFreq: "daily" as const },
  { path: "/nft-marketplace", priority: 0.4, changeFreq: "daily" as const },
  { path: "/pod-marketplace", priority: 0.4, changeFreq: "weekly" as const },
  { path: "/stores", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/wholesale", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/manufacturers", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/request-product", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/compare", priority: 0.3, changeFreq: "monthly" as const },
  { path: "/pro", priority: 0.6, changeFreq: "weekly" as const },
  { path: "/pro/search", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/pro/register", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/projects", priority: 0.6, changeFreq: "daily" as const },
  { path: "/projects/create", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/projects/my-projects", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/configure", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/configure/boat", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/configure/solar", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/configure/cctv", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/configure/house", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/configure/kitchen", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/configure/dredging", priority: 0.4, changeFreq: "monthly" as const },
  { path: "/assets", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/marketplace/used-equipment", priority: 0.5, changeFreq: "daily" as const },
  { path: "/marketplace/rentals", priority: 0.4, changeFreq: "weekly" as const },
  { path: "/marketplace/auctions", priority: 0.4, changeFreq: "weekly" as const },
  { path: "/marketplace/procurement", priority: 0.4, changeFreq: "weekly" as const },
  { path: "/workforce", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/financing", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/insurance", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/sustainability", priority: 0.5, changeFreq: "weekly" as const },
  { path: "/industries", priority: 0.6, changeFreq: "weekly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));

  return entries;
}