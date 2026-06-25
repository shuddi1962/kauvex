import { PartnerBrandAssets } from "@/components/partners/brand-assets-page";

export const metadata = {
  title: "Brand Assets",
  description: "Download approved Kauvex brand assets",
};

export default function PartnerBrandAssetsPage() {
  return (
    <div className="p-6">
      <PartnerBrandAssets />
    </div>
  );
}
