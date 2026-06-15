"use client";

import { useState } from "react";
import {
  Building2, Globe, Star, Shield, Plus, X, Edit, Trash2, Save, Phone, Mail,
  Award, CheckCircle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const supplierTabs = [
  { id: "all", label: "All Suppliers" },
  { id: "add", label: "Add Supplier" },
  { id: "certifications", label: "Certifications" },
];

interface Supplier {
  id: string;
  company_name: string;
  country: string;
  status: "active" | "onboarding" | "suspended" | "inactive";
  rating: number;
  total_orders: number;
  total_spend: number;
  certifications: string[];
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  categories: string[];
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  suppliers_count: number;
  expiry_required: boolean;
}

const countryFlags: Record<string, string> = {
  "China": "🇨🇳", "USA": "🇺🇸", "Germany": "🇩🇪", "Nigeria": "🇳🇬",
  "UAE": "🇦🇪", "India": "🇮🇳", "Japan": "🇯🇵", "South Africa": "🇿🇦",
  "Ghana": "🇬🇭", "UK": "🇬🇧", "Italy": "🇮🇹", "Brazil": "🇧🇷",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  onboarding: "bg-blue-50 text-blue",
  suspended: "bg-red-50 text-red",
  inactive: "bg-gray-100 text-gray-600",
};

const seedSuppliers: Supplier[] = [
  { id: "1", company_name: "Shenzhen Electronics Co", country: "China", status: "active", rating: 4.8, total_orders: 156, total_spend: 45200000, certifications: ["ISO 9001", "CE", "RoHS"], contact_name: "Li Wei", contact_email: "liwei@sz-electronics.cn", contact_phone: "+86-755-8234-5678", categories: ["Electronics", "Components"] },
  { id: "2", company_name: "Berlin Precision Parts GmbH", country: "Germany", status: "active", rating: 4.9, total_orders: 89, total_spend: 28500000, certifications: ["ISO 9001", "TÜV", "DIN"], contact_name: "Hans Mueller", contact_email: "hans@berlin-precision.de", contact_phone: "+49-30-1234-5678", categories: ["Auto Parts", "Machinery"] },
  { id: "3", company_name: "Lagos Wholesale Mart", country: "Nigeria", status: "active", rating: 4.2, total_orders: 312, total_spend: 8900000, certifications: ["NAFDAC", "SON"], contact_name: "Chidi Okonkwo", contact_email: "chidi@lagoswholesale.ng", contact_phone: "+234-803-123-4567", categories: ["FMCG", "Household"] },
  { id: "4", company_name: "Dubai Traders FZE", country: "UAE", status: "active", rating: 4.6, total_orders: 201, total_spend: 37500000, certifications: ["ISO 9001", "ECAS"], contact_name: "Ahmed Al-Rashid", contact_email: "ahmed@dubaitraders.ae", contact_phone: "+971-4-567-8901", categories: ["General Trading", "Textiles"] },
  { id: "5", company_name: "Hangzhou Textile Group", country: "China", status: "onboarding", rating: 3.8, total_orders: 0, total_spend: 0, certifications: ["OEKO-TEX"], contact_name: "Zhang Mei", contact_email: "mei@hangzhou-textile.cn", contact_phone: "+86-571-8765-4321", categories: ["Textiles", "Fashion"] },
  { id: "6", company_name: "Accra Logistics Supply", country: "Ghana", status: "active", rating: 4.0, total_orders: 67, total_spend: 5200000, certifications: ["GSA"], contact_name: "Kofi Mensah", contact_email: "kofi@accrelogistics.gh", contact_phone: "+233-302-123-456", categories: ["Logistics", "Packaging"] },
  { id: "7", company_name: "Newark Chemical Corp", country: "USA", status: "suspended", rating: 3.2, total_orders: 34, total_spend: 12800000, certifications: ["EPA", "OSHA", "ISO 14001"], contact_name: "Robert Smith", contact_email: "rsmith@newarkchem.com", contact_phone: "+1-973-555-0199", categories: ["Chemicals", "Industrial"] },
  { id: "8", company_name: "Mumbai Pharma Ltd", country: "India", status: "active", rating: 4.5, total_orders: 112, total_spend: 18900000, certifications: ["GMP", "WHO-GMP", "ISO 9001"], contact_name: "Priya Sharma", contact_email: "priya@mumbai-pharma.in", contact_phone: "+91-22-6789-0123", categories: ["Pharmaceuticals", "Healthcare"] },
  { id: "9", company_name: "Johannesburg Steel Mills", country: "South Africa", status: "active", rating: 4.3, total_orders: 45, total_spend: 23500000, certifications: ["ISO 9001", "SABS"], contact_name: "Thabo Mbeki", contact_email: "thabo@jhbsteel.co.za", contact_phone: "+27-11-234-5678", categories: ["Steel", "Construction"] },
  { id: "10", company_name: "Tokyo Components Inc", country: "Japan", status: "onboarding", rating: 4.7, total_orders: 0, total_spend: 0, certifications: ["JIS", "ISO 9001"], contact_name: "Yuki Tanaka", contact_email: "yuki@tokyocomponents.jp", contact_phone: "+81-3-1234-5678", categories: ["Electronics", "Semiconductors"] },
  { id: "11", company_name: "Milan Fashion House SRL", country: "Italy", status: "active", rating: 4.4, total_orders: 28, total_spend: 9500000, certifications: ["ISO 9001", "Oeko-Tex"], contact_name: "Marco Rossi", contact_email: "marco@milanfashion.it", contact_phone: "+39-02-9876-5432", categories: ["Fashion", "Luxury Goods"] },
  { id: "12", company_name: "Sao Paulo Agro Export", country: "Brazil", status: "inactive", rating: 3.6, total_orders: 15, total_spend: 4100000, certifications: ["MAPA", "IBAMA"], contact_name: "Ana Silva", contact_email: "ana@spagroexport.br", contact_phone: "+55-11-3456-7890", categories: ["Agriculture", "Food"] },
];

const seedCertifications: Certification[] = [
  { id: "1", name: "ISO 9001:2025", issuer: "International Organization for Standardization", suppliers_count: 6, expiry_required: true },
  { id: "2", name: "CE Marking", issuer: "European Union", suppliers_count: 2, expiry_required: false },
  { id: "3", name: "RoHS Compliant", issuer: "EU Directive", suppliers_count: 2, expiry_required: false },
  { id: "4", name: "TÜV Certified", issuer: "TÜV Rheinland", suppliers_count: 1, expiry_required: true },
  { id: "5", name: "GMP Certified", issuer: "WHO", suppliers_count: 1, expiry_required: true },
  { id: "6", name: "NAFDAC Registered", issuer: "NAFDAC Nigeria", suppliers_count: 1, expiry_required: true },
  { id: "7", name: "SON Certified", issuer: "Standards Organisation of Nigeria", suppliers_count: 1, expiry_required: true },
  { id: "8", name: "EPA Compliant", issuer: "US Environmental Protection Agency", suppliers_count: 1, expiry_required: true },
  { id: "9", name: "Oeko-Tex Standard 100", issuer: "Oeko-Tex", suppliers_count: 2, expiry_required: true },
  { id: "10", name: "SABS Approved", issuer: "South African Bureau of Standards", suppliers_count: 1, expiry_required: true },
];

const certBadgeColors = [
  "bg-blue-50 text-blue", "bg-purple-50 text-purple-700", "bg-green-50 text-green-700",
  "bg-orange-50 text-orange", "bg-pink-50 text-pink-700", "bg-teal-50 text-teal-700",
];

const formatCurrency = (val: number) => `₦${(val / 1000000).toFixed(1)}M`;

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [suppliers] = useState<Supplier[]>(seedSuppliers);
  const [certifications] = useState<Certification[]>(seedCertifications);
  const [showAddModal, setShowAddModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    company_name: "", country: "Nigeria", contact_name: "", contact_email: "",
    contact_phone: "", categories: "", certifications: [] as string[],
  });

  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const avgRating = suppliers.reduce((s, sup) => s + sup.rating, 0) / suppliers.length;

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <span className="text-yellow-500 text-xs">
        {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(5 - full - (half ? 1 : 0))}
      </span>
    );
  };

  return (
    <AdminShell title="Supplier Network" subtitle="Manage suppliers, certifications & ratings">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Supplier Network</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setSupplierForm({ company_name: "", country: "Nigeria", contact_name: "", contact_email: "", contact_phone: "", categories: "", certifications: [] }); setShowAddModal(true); }}>
              <Plus size={14} className="mr-1" /> Add Supplier
            </Button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {supplierTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Suppliers", value: String(suppliers.length), icon: Building2, color: "bg-blue-50 text-blue" },
            { label: "Active Suppliers", value: String(activeSuppliers), icon: CheckCircle, color: "bg-green-50 text-green-700" },
            { label: "Avg Rating", value: `${avgRating.toFixed(1)} / 5.0`, icon: Star, color: "bg-yellow-50 text-yellow-700" },
            { label: "Countries", value: String(new Set(suppliers.map((s) => s.country)).size), icon: Globe, color: "bg-purple-50 text-purple-700" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
                <div className={`w-9 h-9 rounded-lg ${kpi.color} flex items-center justify-center mb-2`}><Icon size={16} /></div>
                <p className="text-xl font-bold text-text-1">{kpi.value}</p>
                <p className="text-xs text-text-4">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* All Suppliers */}
        {activeTab === "all" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1">Supplier Directory</h3>
              <span className="text-xs text-text-4">{suppliers.length} suppliers</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Company</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Country</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Rating</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Orders</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Total Spend</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Certifications</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-text-1">{sup.company_name}</p>
                          <p className="text-[10px] text-text-4">{sup.contact_name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center text-lg">{countryFlags[sup.country] || "🌍"}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[sup.status]}`}>{sup.status}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {renderStars(sup.rating)}
                          <span className="text-[10px] text-text-4">{sup.rating}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center text-text-2">{sup.total_orders}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(sup.total_spend)}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {sup.certifications.slice(0, 2).map((cert, i) => (
                            <span key={cert} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${certBadgeColors[i % certBadgeColors.length]}`}>{cert}</span>
                          ))}
                          {sup.certifications.length > 2 && (
                            <span className="text-[9px] text-text-4">+{sup.certifications.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Edit size={14} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-text-4 hover:text-red"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Supplier Form */}
        {activeTab === "add" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <h3 className="font-semibold text-text-1 mb-6">Register New Supplier</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-text-2 mb-1 block">Company Name</label>
                  <input value={supplierForm.company_name} onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Country</label>
                  <select value={supplierForm.country} onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    {Object.keys(countryFlags).map((c) => <option key={c} value={c}>{countryFlags[c]} {c}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Contact Person</label>
                  <input value={supplierForm.contact_name} onChange={(e) => setSupplierForm({ ...supplierForm, contact_name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Email</label>
                  <input type="email" value={supplierForm.contact_email} onChange={(e) => setSupplierForm({ ...supplierForm, contact_email: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Phone</label>
                  <input value={supplierForm.contact_phone} onChange={(e) => setSupplierForm({ ...supplierForm, contact_phone: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-text-2 mb-1 block">Product Categories</label>
                  <input value={supplierForm.categories} onChange={(e) => setSupplierForm({ ...supplierForm, categories: e.target.value })} placeholder="Electronics, Fashion, Food..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div className="col-span-2"><label className="text-xs font-semibold text-text-2 mb-1 block">Certifications</label>
                  <div className="flex flex-wrap gap-2">
                    {seedCertifications.map((cert) => {
                      const selected = supplierForm.certifications.includes(cert.name);
                      return (
                        <button key={cert.id} onClick={() => {
                          setSupplierForm({
                            ...supplierForm,
                            certifications: selected ? supplierForm.certifications.filter((c) => c !== cert.name) : [...supplierForm.certifications, cert.name],
                          });
                        }} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selected ? "bg-blue text-white border-blue" : "bg-white text-text-3 border-border hover:border-blue"}`}>
                          {cert.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">Cancel</Button>
                <Button className="flex-1" disabled={!supplierForm.company_name}><Save size={14} className="mr-1" /> Register Supplier</Button>
              </div>
            </div>
          </div>
        )}

        {/* Certifications */}
        {activeTab === "certifications" && (
          <div className="grid md:grid-cols-2 gap-4">
            {certifications.map((cert, idx) => (
              <div key={cert.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${certBadgeColors[idx % certBadgeColors.length]} flex items-center justify-center`}>
                    <Shield size={18} />
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cert.expiry_required ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                    {cert.expiry_required ? "Expires" : "No Expiry"}
                  </span>
                </div>
                <h4 className="font-semibold text-text-1 mb-1">{cert.name}</h4>
                <p className="text-xs text-text-4 mb-3">Issued by: {cert.issuer}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 size={14} className="text-text-4" />
                  <span className="font-medium text-text-1">{cert.suppliers_count} suppliers</span>
                  <span className="text-text-4">hold this certification</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[520px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">Add Supplier</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Company Name</label>
                <input value={supplierForm.company_name} onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Country</label>
                  <select value={supplierForm.country} onChange={(e) => setSupplierForm({ ...supplierForm, country: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    {Object.keys(countryFlags).map((c) => <option key={c} value={c}>{countryFlags[c]} {c}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Contact Name</label>
                  <input value={supplierForm.contact_name} onChange={(e) => setSupplierForm({ ...supplierForm, contact_name: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Email</label>
                  <input type="email" value={supplierForm.contact_email} onChange={(e) => setSupplierForm({ ...supplierForm, contact_email: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Phone</label>
                  <input value={supplierForm.contact_phone} onChange={(e) => setSupplierForm({ ...supplierForm, contact_phone: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              </div>
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Categories</label>
                <input value={supplierForm.categories} onChange={(e) => setSupplierForm({ ...supplierForm, categories: e.target.value })} placeholder="Electronics, Fashion, Food..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button className="flex-1" disabled={!supplierForm.company_name}><Save size={14} className="mr-1" /> Add Supplier</Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
