"use client";

import { useState } from "react";
import {
  FileText, Key, Download, DollarSign, Plus, Eye, Edit, Trash2,
  CheckCircle, XCircle, AlertTriangle, Monitor, BookOpen, File,
  Video, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const dpTabs = [
  { id: "products", label: "Products", icon: FileText },
  { id: "licenses", label: "Licenses", icon: Key },
  { id: "downloads", label: "Downloads", icon: Download },
];

interface DigitalProduct {
  id: string;
  name: string;
  type: "software" | "course" | "ebook" | "pdf" | "membership";
  file_size: string;
  file_format: string;
  price: number;
  download_limit: number | null;
  requires_license: boolean;
  total_downloads: number;
  total_revenue: string;
  status: string;
}

interface LicenseKey {
  id: string;
  license_key: string;
  product_name: string;
  customer: string;
  customer_email: string;
  status: "active" | "revoked" | "expired";
  activation_count: number;
  max_activations: number;
  issued_at: string;
  expires_at: string;
}

const seedProducts: DigitalProduct[] = [
  { id: "dp1", name: "Nitro PDF Pro Suite", type: "software", file_size: "256 MB", file_format: ".exe/.dmg", price: 45000, download_limit: null, requires_license: true, total_downloads: 1234, total_revenue: "₦55.5M", status: "active" },
  { id: "dp2", name: "Complete Web Dev Bootcamp", type: "course", file_size: "12.5 GB", file_format: "MP4 + PDF", price: 85000, download_limit: null, requires_license: false, total_downloads: 567, total_revenue: "₦48.2M", status: "active" },
  { id: "dp3", name: "Financial Freedom E-Book", type: "ebook", file_size: "4.8 MB", file_format: "EPUB/MOBI/PDF", price: 5000, download_limit: 3, requires_license: false, total_downloads: 8901, total_revenue: "₦44.5M", status: "active" },
  { id: "dp4", name: "Ultimate Cooking Guide PDF", type: "pdf", file_size: "18 MB", file_format: "PDF", price: 3500, download_limit: 5, requires_license: false, total_downloads: 12450, total_revenue: "₦43.6M", status: "active" },
  { id: "dp5", name: "Adobe Creative Cloud 1-Year", type: "membership", file_size: "—", file_format: "—", price: 180000, download_limit: null, requires_license: true, total_downloads: 345, total_revenue: "₦62.1M", status: "active" },
  { id: "dp6", name: "AutoCAD LT 2026", type: "software", file_size: "1.8 GB", file_format: ".exe", price: 320000, download_limit: null, requires_license: true, total_downloads: 234, total_revenue: "₦74.9M", status: "active" },
  { id: "dp7", name: "Digital Marketing Masterclass", type: "course", file_size: "8.2 GB", file_format: "MP4 + PDF", price: 65000, download_limit: null, requires_license: false, total_downloads: 789, total_revenue: "₦51.3M", status: "active" },
  { id: "dp8", name: "Resume Templates Pack", type: "pdf", file_size: "2.1 MB", file_format: "PDF/DOCX", price: 2500, download_limit: 10, requires_license: false, total_downloads: 23400, total_revenue: "₦58.5M", status: "active" },
  { id: "dp9", name: "Python for Data Science Course", type: "course", file_size: "15.4 GB", file_format: "MP4 + IPYNB", price: 95000, download_limit: null, requires_license: false, total_downloads: 412, total_revenue: "₦39.1M", status: "inactive" },
  { id: "dp10", name: "Windows 11 Pro License", type: "software", file_size: "4.5 GB", file_format: ".iso", price: 45000, download_limit: 1, requires_license: true, total_downloads: 5678, total_revenue: "₦255.5M", status: "active" },
];

const seedLicenses: LicenseKey[] = [
  { id: "l1", license_key: "NPRO-2A7F-K9D3-M4P1", product_name: "Nitro PDF Pro Suite", customer: "Chioma Nwachukwu", customer_email: "chioma.n@email.com", status: "active", activation_count: 1, max_activations: 3, issued_at: "2026-01-15", expires_at: "2027-01-15" },
  { id: "l2", license_key: "NPRO-8C2E-T5H6-J9K0", product_name: "Nitro PDF Pro Suite", customer: "Emeka Okafor", customer_email: "emeka.o@email.com", status: "active", activation_count: 2, max_activations: 3, issued_at: "2026-02-20", expires_at: "2027-02-20" },
  { id: "l3", license_key: "ACAD-L2M3-N4P5-Q6R7", product_name: "AutoCAD LT 2026", customer: "Temidayo Akin", customer_email: "temidayo.a@email.com", status: "active", activation_count: 1, max_activations: 2, issued_at: "2026-03-01", expires_at: "2027-03-01" },
  { id: "l4", license_key: "ACAD-S8T9-U1V2-W3X4", product_name: "AutoCAD LT 2026", customer: "Kayode Balogun", customer_email: "kayode.b@email.com", status: "revoked", activation_count: 3, max_activations: 2, issued_at: "2025-11-10", expires_at: "2026-11-10" },
  { id: "l5", license_key: "CC-Y5Z6-A7B8-C9D0", product_name: "Adobe Creative Cloud 1-Year", customer: "Zainab Abdullah", customer_email: "zainab.a@email.com", status: "active", activation_count: 2, max_activations: 5, issued_at: "2026-04-05", expires_at: "2027-04-05" },
  { id: "l6", license_key: "CC-E1F2-G3H4-I5J6", product_name: "Adobe Creative Cloud 1-Year", customer: "Folake Daniels", customer_email: "folake.d@email.com", status: "active", activation_count: 1, max_activations: 5, issued_at: "2026-05-15", expires_at: "2027-05-15" },
  { id: "l7", license_key: "WIN11-K7L8-M9N0-O1P2", product_name: "Windows 11 Pro License", customer: "Oluwaseun Adeyemi", customer_email: "oluwaseun.a@email.com", status: "active", activation_count: 1, max_activations: 1, issued_at: "2026-02-10", expires_at: "2027-02-10" },
  { id: "l8", license_key: "WIN11-Q3R4-S5T6-U7V8", product_name: "Windows 11 Pro License", customer: "Amina Bello", customer_email: "amina.b@email.com", status: "active", activation_count: 1, max_activations: 1, issued_at: "2026-03-20", expires_at: "2027-03-20" },
  { id: "l9", license_key: "WIN11-W9X0-Y1Z2-A3B4", product_name: "Windows 11 Pro License", customer: "Chukwudi Nnamdi", customer_email: "chukwudi.n@email.com", status: "active", activation_count: 1, max_activations: 1, issued_at: "2026-04-12", expires_at: "2027-04-12" },
  { id: "l10", license_key: "NPRO-C5D6-E7F8-G9H0", product_name: "Nitro PDF Pro Suite", customer: "Bisola Savage", customer_email: "bisola.s@email.com", status: "active", activation_count: 1, max_activations: 3, issued_at: "2026-04-25", expires_at: "2027-04-25" },
  { id: "l11", license_key: "ACAD-I1J2-K3L4-M5N6", product_name: "AutoCAD LT 2026", customer: "Ifeanyi Eze", customer_email: "ifeanyi.e@email.com", status: "expired", activation_count: 2, max_activations: 2, issued_at: "2024-06-01", expires_at: "2025-06-01" },
  { id: "l12", license_key: "CC-O7P8-Q9R0-S1T2", product_name: "Adobe Creative Cloud 1-Year", customer: "Nkechi Obi", customer_email: "nkechi.o@email.com", status: "active", activation_count: 3, max_activations: 5, issued_at: "2026-01-05", expires_at: "2027-01-05" },
  { id: "l13", license_key: "NPRO-U3V4-W5X6-Y7Z8", product_name: "Nitro PDF Pro Suite", customer: "Dapo Ogun", customer_email: "dapo.o@email.com", status: "revoked", activation_count: 3, max_activations: 3, issued_at: "2025-08-15", expires_at: "2026-08-15" },
  { id: "l14", license_key: "WIN11-A9B0-C1D2-E3F4", product_name: "Windows 11 Pro License", customer: "Simi Lawal", customer_email: "simi.l@email.com", status: "active", activation_count: 1, max_activations: 1, issued_at: "2026-05-01", expires_at: "2027-05-01" },
  { id: "l15", license_key: "ACAD-G5H6-I7J8-K9L0", product_name: "AutoCAD LT 2026", customer: "Femi Adewale", customer_email: "femi.a@email.com", status: "active", activation_count: 1, max_activations: 2, issued_at: "2026-06-01", expires_at: "2027-06-01" },
  { id: "l16", license_key: "CC-M1N2-O3P4-Q5R6", product_name: "Adobe Creative Cloud 1-Year", customer: "Zara Bello", customer_email: "zara.b@email.com", status: "active", activation_count: 2, max_activations: 5, issued_at: "2026-03-10", expires_at: "2027-03-10" },
  { id: "l17", license_key: "NPRO-S7T8-U9V0-W1X2", product_name: "Nitro PDF Pro Suite", customer: "Tunde Balogun", customer_email: "tunde.b@email.com", status: "expired", activation_count: 3, max_activations: 3, issued_at: "2024-12-01", expires_at: "2025-12-01" },
  { id: "l18", license_key: "WIN11-Y3Z4-A5B6-C7D8", product_name: "Windows 11 Pro License", customer: "Ngozi Obi", customer_email: "ngozi.o@email.com", status: "active", activation_count: 1, max_activations: 1, issued_at: "2026-05-20", expires_at: "2027-05-20" },
];

const typeIcons: Record<string, React.ElementType> = {
  software: Monitor, course: Video, ebook: BookOpen, pdf: File, membership: Users,
};

export default function AdminDigitalProductsPage() {
  const [activeTab, setActiveTab] = useState("products");
  const [products] = useState<DigitalProduct[]>(seedProducts);
  const [licenses, setLicenses] = useState<LicenseKey[]>(seedLicenses);
  const [showActivations, setShowActivations] = useState<LicenseKey | null>(null);

  const handleRevokeLicense = (id: string) => {
    setLicenses(prev => prev.map(l => l.id === id ? { ...l, status: "revoked" as const } : l));
  };

  const totalDownloads = products.reduce((s, p) => s + p.total_downloads, 0);
  const activeLicenses = licenses.filter(l => l.status === "active").length;

  const displayTab = (tab: string) => {
    const label = { products: "Products", licenses: "Licenses", downloads: "Downloads" }[tab] || tab;
    return <span className="capitalize">{label}</span>;
  };

  return (
    <AdminShell title="Digital Products" subtitle="Software, courses, ebooks, licenses, and digital downloads">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-syne font-700 text-2xl text-text-1">Digital Products</h1>
            <p className="text-sm text-text-3 mt-1">Manage digital goods, license keys, and download tracking</p>
          </div>
          <Button variant="default" size="sm"><Plus className="w-3 h-3 mr-1" /> Add Product</Button>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6">
          {dpTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-off-white"}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{products.length}</p>
                <p className="text-xs text-text-3 mt-1">Total Products</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{products.filter(p => p.requires_license).length}</p>
                <p className="text-xs text-text-3 mt-1">Require License</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{totalDownloads.toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Downloads</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">₦{Math.round(products.reduce((s, p) => s + parseInt(p.total_revenue.replace(/[₦,M]/g, "")) * (p.total_revenue.includes("M") ? 1000000 : 1), 0) / 1000000)}M</p>
                <p className="text-xs text-text-3 mt-1">Total Revenue</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-off-white border-b border-border">
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Product</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Type</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">File Size</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Download Limit</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">License</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Downloads</th>
                    <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Revenue</th>
                    <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const TypeIcon = typeIcons[p.type] || FileText;
                    return (
                      <tr key={p.id} className="border-b border-border hover:bg-off-white/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center"><TypeIcon size={14} className="text-blue" /></div>
                            <span className="text-sm font-medium text-text-1">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-xs text-text-3 capitalize">{p.type}</td>
                        <td className="p-3 text-center text-xs text-text-3">{p.file_size}</td>
                        <td className="p-3 text-center text-xs text-text-3">{p.download_limit ?? "∞"}</td>
                        <td className="p-3 text-center">{p.requires_license ? <CheckCircle size={14} className="text-success inline" /> : <XCircle size={14} className="text-text-4 inline" />}</td>
                        <td className="p-3 text-center text-sm text-text-2">{p.total_downloads.toLocaleString()}</td>
                        <td className="p-3 text-right font-syne font-600 text-sm text-text-1">{p.total_revenue}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Edit className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "licenses" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{licenses.length}</p>
                <p className="text-xs text-text-3 mt-1">Total Licenses</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{activeLicenses}</p>
                <p className="text-xs text-text-3 mt-1">Active Licenses</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{licenses.filter(l => l.status === "revoked").length}</p>
                <p className="text-xs text-text-3 mt-1">Revoked</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-4">{licenses.filter(l => l.status === "expired").length}</p>
                <p className="text-xs text-text-3 mt-1">Expired</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-off-white border-b border-border">
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">License Key</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Product</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Customer</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
                    <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Activations</th>
                    <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Expires</th>
                    <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((l) => (
                    <tr key={l.id} className="border-b border-border hover:bg-off-white/50">
                      <td className="p-3">
                        <span className="font-mono text-xs font-medium text-text-1">{l.license_key}</span>
                      </td>
                      <td className="p-3 text-sm text-text-2">{l.product_name}</td>
                      <td className="p-3">
                        <p className="text-sm text-text-1">{l.customer}</p>
                        <p className="text-xs text-text-4">{l.customer_email}</p>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                          l.status === "active" ? "bg-green-50 text-success" : l.status === "revoked" ? "bg-red-50 text-red" : "bg-gray-100 text-text-4"
                        }`}>
                          {l.status === "revoked" && <AlertTriangle size={10} />}
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-text-2">{l.activation_count}/{l.max_activations}</td>
                      <td className="p-3 text-xs text-text-3">{l.expires_at}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {l.status === "active" && (
                            <button onClick={() => handleRevokeLicense(l.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-text-4 hover:text-red" title="Revoke"><XCircle className="w-3.5 h-3.5" /></button>
                          )}
                          <button onClick={() => setShowActivations(l)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue" title="View Activations"><Eye className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "downloads" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-blue">{totalDownloads.toLocaleString()}</p>
                <p className="text-xs text-text-3 mt-1">Total Downloads</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-success">{products.filter(p => p.status === "active").length}</p>
                <p className="text-xs text-text-3 mt-1">Active Products</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-warning">{Math.round(totalDownloads / products.length)}</p>
                <p className="text-xs text-text-3 mt-1">Avg Downloads/Product</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-4">
                <p className="font-syne font-700 text-2xl text-text-1">{products.filter(p => p.download_limit !== null).length}</p>
                <p className="text-xs text-text-3 mt-1">With Download Limits</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3 flex items-center gap-2"><Download size={16} className="text-blue" /> Top Downloaded Products</h3>
                <div className="space-y-2">
                  {[...products].sort((a, b) => b.total_downloads - a.total_downloads).slice(0, 6).map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-4 w-4">{i + 1}</span>
                        <span className="text-sm text-text-1">{p.name}</span>
                      </div>
                      <span className="text-xs text-text-3">{p.total_downloads.toLocaleString()} downloads</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3 flex items-center gap-2"><DollarSign size={16} className="text-success" /> Top Revenue Products</h3>
                <div className="space-y-2">
                  {[...products].sort((a, b) => {
                    const aRev = parseInt(a.total_revenue.replace(/[₦,M]/g, "")) * (a.total_revenue.includes("M") ? 1000000 : 1);
                    const bRev = parseInt(b.total_revenue.replace(/[₦,M]/g, "")) * (b.total_revenue.includes("M") ? 1000000 : 1);
                    return bRev - aRev;
                  }).slice(0, 6).map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-4 w-4">{i + 1}</span>
                        <span className="text-sm text-text-1">{p.name}</span>
                      </div>
                      <span className="text-xs text-success">{p.total_revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <FileText className="w-8 h-8 text-blue mx-auto mb-3" />
              <h3 className="font-syne font-700 text-text-1 mb-2">Download Analytics</h3>
              <p className="text-sm text-text-3">Detailed download logs, geographic distribution, and file access history available in the full analytics report.</p>
            </div>
          </div>
        )}

        {/* Activations Modal */}
        {showActivations && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowActivations(null)}>
            <div className="bg-white rounded-2xl w-full max-w-[420px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-syne font-bold text-lg">License Activations</h2>
                <button onClick={() => setShowActivations(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><XCircle size={16} /></button>
              </div>
              <div className="p-5 space-y-3">
                <div className="bg-off-white rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-text-4">License Key</span><span className="font-mono text-text-1">{showActivations.license_key}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-4">Product</span><span className="text-text-1">{showActivations.product_name}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-4">Customer</span><span className="text-text-1">{showActivations.customer}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-4">Status</span><span className={`text-xs font-medium ${showActivations.status === "active" ? "text-success" : "text-red"}`}>{showActivations.status}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-4">Activations</span><span className="text-text-1">{showActivations.activation_count} / {showActivations.max_activations}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-4">Issued</span><span className="text-text-1">{showActivations.issued_at}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-text-4">Expires</span><span className="text-text-1">{showActivations.expires_at}</span></div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-2 mb-2">Activation History</p>
                  <div className="space-y-1.5">
                    {Array.from({ length: showActivations.activation_count }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 px-3 bg-off-white rounded-lg">
                        <span className="text-text-3">Device {i + 1}</span>
                        <span className="text-text-4">Windows · 192.168.{10 + i}.{i + 1}</span>
                      </div>
                    ))}
                    {showActivations.activation_count === 0 && <p className="text-xs text-text-4 text-center py-2">No activations recorded</p>}
                  </div>
                </div>
                {showActivations.status === "active" && (
                  <Button variant="outline" size="sm" className="w-full text-red border-red/30 hover:bg-red-50" onClick={() => { handleRevokeLicense(showActivations.id); setShowActivations(null); }}>
                    <XCircle size={14} className="mr-1" /> Revoke License
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
