"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import FlashDealsSection from "./FlashDealsSection";
import TrendingSection from "./TrendingSection";
import FeaturedProductsSection from "./FeaturedProductsSection";
import NewArrivalsSection from "./NewArrivalsSection";
import BestSellersSection from "./BestSellersSection";
import FeaturedVendorsSection from "./FeaturedVendorsSection";
import FeaturedBrandsSection from "./FeaturedBrandsSection";
import TestimonialsSection from "./TestimonialsSection";
import NewsletterSection from "./NewsletterSection";

interface HomepageSection {
  id: string;
  section_type: string;
  title: string;
  subtitle: string | null;
  config: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

const defaultSections: { type: string; title: string; subtitle?: string }[] = [
  { type: "flash_deals", title: "Flash Deals" },
  { type: "trending", title: "Trending Now" },
  { type: "featured", title: "Featured Products" },
  { type: "best_sellers", title: "Best Sellers" },
  { type: "new_arrivals", title: "New Arrivals" },
  { type: "featured_brands", title: "Featured Brands" },
  { type: "testimonials", title: "What Our Customers Say" },
  { type: "newsletter", title: "Stay in the Loop", subtitle: "Get exclusive deals and new arrivals." },
];

const componentMap: Record<string, React.FC<{ title: string; subtitle?: string; config?: any }>> = {
  flash_deals: (props) => <FlashDealsSection title={props.title} endTime={new Date(Date.now() + 86400000).toISOString()} products={[]} />,
  trending: (props) => <TrendingSection title={props.title} products={[]} />,
  featured: (props) => <FeaturedProductsSection title={props.title} products={[]} />,
  new_arrivals: (props) => <NewArrivalsSection title={props.title} />,
  best_sellers: (props) => <BestSellersSection title={props.title} />,
  featured_vendors: (props) => <FeaturedVendorsSection title={props.title} vendors={[]} />,
  featured_brands: () => <FeaturedBrandsSection />,
  testimonials: () => <TestimonialsSection />,
  newsletter: (props) => <NewsletterSection title={props.title} subtitle={props.subtitle || ""} buttonText="Subscribe" />,
};

export default function HomepageSectionRenderer() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await insforge.database
        .from("homepage_sections")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (data && data.length > 0) {
        setSections(data);
      }
      setLoaded(true);
    })();
  }, []);

  const displaySections = sections.length > 0
    ? sections
    : defaultSections.map((s, i) => ({
        id: `default-${i}`,
        section_type: s.type,
        title: s.title,
        subtitle: s.subtitle || null,
        config: {},
        sort_order: i,
        is_visible: true,
      }));

  return (
    <>
      {displaySections.map((section) => {
        const Comp = componentMap[section.section_type as keyof typeof componentMap];
        if (!Comp) return null;
        if (!loaded && sections.length === 0) return null;
        return (
          <section key={section.id} className="py-6 lg:py-8">
            <div className="w-full max-w-[1440px] mx-auto px-4">
              <Comp title={section.title} subtitle={section.subtitle || undefined} config={section.config} />
            </div>
          </section>
        );
      })}
    </>
  );
}
