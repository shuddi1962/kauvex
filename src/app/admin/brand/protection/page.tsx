import { BrandViolationReport } from "@/components/admin/brand-violation-report";

export const metadata = {
  title: "Brand Protection",
  description: "Report and manage brand violations",
};

export default function AdminBrandProtectionPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-kauvex-navy mb-6">
          Brand Protection
        </h1>
        <BrandViolationReport />
      </div>
    </div>
  );
}
