import { BRAND } from "@/components/ui/brand-tokens";

export function generateBrandPageHead({
  title,
  description,
  subBrand,
}: {
  title: string;
  description?: string;
  subBrand?: string;
}) {
  const brand = subBrand
    ? BRAND.subBrands[subBrand as keyof typeof BRAND.subBrands]
    : null;
  const fullTitle = brand
    ? `${brand.name} — ${title}`
    : `${BRAND.name} — ${title}`;

  return {
    title: fullTitle,
    description: description || `${brand?.tagline || BRAND.tagline} ${BRAND.name} platform.`,
    openGraph: {
      title: fullTitle,
      description: description || BRAND.tagline,
      siteName: BRAND.name,
    },
  };
}
