"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Globe, CheckCircle, AlertTriangle, Clock, FileText, Eye, ArrowRight, RefreshCw, Settings } from "lucide-react";

interface ComplianceEntry {
  countryCode: string;
  countryName: string;
  complianceType: string;
  status: string;
  notes: string | null;
  nextReviewDate: string | null;
  createdAt: string;
}

const FLAG_MAP: Record<string, string> = {
  NG: "\u{1F1F3}\u{1F1EC}", GB: "\u{1F1EC}\u{1F1E7}", US: "\u{1F1FA}\u{1F1F8}", AE: "\u{1F1E6}\u{1F1EA}",
  IN: "\u{1F1EE}\u{1F1F3}", AU: "\u{1F1E6}\u{1F1FA}", DE: "\u{1F1E9}\u{1F1EA}", CA: "\u{1F1E8}\u{1F1E6}",
  GH: "\u{1F1EC}\u{1F1ED}", KE: "\u{1F1F0}\u{1F1EA}", ZA: "\u{1F1FF}\u{1F1E6}", SA: "\u{1F1F8}\u{1F1E6}",
  BR: "\u{1F1E7}\u{1F1F7}", JP: "\u{1F1EF}\u{1F1F5}", FR: "\u{1F1EB}\u{1F1F7}",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  approved: { color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
  pending: { color: "bg-amber-50 text-amber-700", icon: Clock },
  rejected: { color: "bg-red-50 text-red-700", icon: AlertTriangle },
  under_review: { color: "bg-blue-50 text-blue-700", icon: Eye },
};

const COMPLIANCE_TYPES = [
  "data_protection", "tax_registration", "courier_license", "insurance",
  "import_permit", "cod_agreement", "ddp_registration", "ioss_registration",
];

export default function ComplianceDashboardPage() {
  const [entries, setEntries] = useState<ComplianceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed with demo data for countries that need compliance review
    const demoData: ComplianceEntry[] = [
      { countryCode: "NG", countryName: "Nigeria", complianceType: "courier_license", status: "approved", notes: "NCC license active", nextReviewDate: "2027-01-15", createdAt: "2025-06-01" },
      { countryCode: "NG", countryName: "Nigeria", complianceType: "tax_registration", status: "approved", notes: "FIRS TIN registered", nextReviewDate: "2027-06-01", createdAt: "2025-06-01" },
      { countryCode: "NG", countryName: "Nigeria", complianceType: "data_protection", status: "under_review", notes: "NDPR compliance in progress", nextReviewDate: "2026-09-01", createdAt: "2025-08-15" },
      { countryCode: "GB", countryName: "United Kingdom", complianceType: "data_protection", status: "approved", notes: "GDPR + UK ICO registered", nextReviewDate: "2027-03-01", createdAt: "2025-06-01" },
      { countryCode: "GB", countryName: "United Kingdom", complianceType: "courier_license", status: "approved", notes: "OFT license active", nextReviewDate: "2027-06-01", createdAt: "2025-06-01" },
      { countryCode: "DE", countryName: "Germany", complianceType: "ddp_registration", status: "pending", notes: "Awaiting Zoll registration", nextReviewDate: "2026-12-01", createdAt: "2025-09-01" },
      { countryCode: "DE", countryName: "Germany", complianceType: "ioss_registration", status: "approved", notes: "IOSS number EU382000000001 active", nextReviewDate: "2027-06-01", createdAt: "2025-06-01" },
      { countryCode: "DE", countryName: "Germany", complianceType: "data_protection", status: "approved", notes: "DSGVO compliant", nextReviewDate: "2027-03-01", createdAt: "2025-06-01" },
      { countryCode: "US", countryName: "United States", complianceType: "tax_registration", status: "approved", notes: "EIN registered", nextReviewDate: "2027-01-01", createdAt: "2025-06-01" },
      { countryCode: "IN", countryName: "India", complianceType: "import_permit", status: "pending", notes: "Awaiting DGFT license", nextReviewDate: "2026-11-01", createdAt: "2025-10-01" },
      { countryCode: "IN", countryName: "India", complianceType: "courier_license", status: "approved", notes: "DOT license active", nextReviewDate: "2027-04-01", createdAt: "2025-06-01" },
      { countryCode: "AE", countryName: "UAE", complianceType: "courier_license", status: "approved", notes: "TRA license active", nextReviewDate: "2027-02-01", createdAt: "2025-06-01" },
      { countryCode: "SA", countryName: "Saudi Arabia", complianceType: "ddp_registration", status: "pending", notes: "Awaiting ZATCA approval", nextReviewDate: "2026-10-01", createdAt: "2025-09-15" },
      { countryCode: "AU", countryName: "Australia", complianceType: "tax_registration", status: "approved", notes: "ABN registered", nextReviewDate: "2027-07-01", createdAt: "2025-06-01" },
      { countryCode: "JP", countryName: "Japan", complianceType: "courier_license", status: "pending", notes: "Awaiting MLIT approval", nextReviewDate: "2026-12-01", createdAt: "2025-10-15" },
    ];
    setEntries(demoData);
    setLoading(false);
  }, []);

  const approved = entries.filter((e) => e.status === "approved").length;
  const pending = entries.filter((e) => e.status === "pending" || e.status === "under_review").length;
  const totalCountries = [...new Set(entries.map((e) => e.countryCode))].length;
  const overdue = entries.filter((e) => e.nextReviewDate && new Date(e.nextReviewDate) < new Date()).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-600" /> Compliance Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track regulatory compliance across all logistics countries</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Countries", value: totalCountries, color: "text-blue-600 bg-blue-50", icon: Globe },
          { label: "Approved", value: approved, color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
          { label: "Pending / Review", value: pending, color: "text-amber-600 bg-amber-50", icon: Clock },
          { label: "Overdue Reviews", value: overdue, color: "text-red-600 bg-red-50", icon: AlertTriangle },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Compliance Records</h2>
          <Link href="/admin/logistics/global" className="text-sm text-blue-600 hover:underline">View All Countries &rarr;</Link>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Country</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Compliance Type</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Notes</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Next Review</th>
                  <th className="px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry, i) => {
                  const statusConfig = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{FLAG_MAP[entry.countryCode]}</span>
                          <span className="font-medium text-gray-900">{entry.countryName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                          {entry.complianceType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" /> {entry.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{entry.notes || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.nextReviewDate ? new Date(entry.nextReviewDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-blue-600 hover:underline text-xs flex items-center gap-1 justify-end">
                          <Eye className="w-3 h-3" /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
