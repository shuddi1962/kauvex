import { BrandAssetPortal } from "@/components/admin/brand-asset-portal";

export const metadata = {
  title: "Brand Assets",
  description: "Manage and distribute all Kauvex brand assets",
};

export default function AdminBrandAssetsPage() {
  return (
    <div className="p-6">
      <BrandAssetPortal />
    </div>
  );
}
