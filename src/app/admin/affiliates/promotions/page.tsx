"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Plus, Search, Edit3, Trash2, X, Gift, Target,
  TrendingUp, Check, Clock, Calendar,
} from "lucide-react";

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: string;
  bonusRate: number;
  eligibleTypes: string[];
  bannerUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  clicks: number;
  conversions: number;
}

interface Bounty {
  id: string;
  name: string;
  description: string;
  type: string;
  amount: number;
  eligiblePartnerTypes: string[];
  maxPerPartner: number;
  maxTotal: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const seedPromotions: Promotion[] = [
  { id: "pr1", name: "Fashion Week Boost", description: "Double commission on all fashion category sales", type: "category_bonus", bonusRate: 5, eligibleTypes: ["associate", "influencer"], bannerUrl: "", startDate: "2026-06-01", endDate: "2026-06-30", isActive: true, clicks: 1280, conversions: 94 },
  { id: "pr2", name: "New Arrivals Push", description: "+3% bonus on electronics and gadgets", type: "category_bonus", bonusRate: 3, eligibleTypes: ["associate", "influencer", "agency"], bannerUrl: "", startDate: "2026-06-15", endDate: "2026-07-15", isActive: true, clicks: 840, conversions: 52 },
  { id: "pr3", name: "Flash Sale Weekend", description: "Extra 5% commission on all sales this weekend", type: "flash_bonus", bonusRate: 5, eligibleTypes: ["associate", "influencer", "agency", "b2b_referral"], bannerUrl: "", startDate: "2026-06-20", endDate: "2026-06-22", isActive: true, clicks: 2150, conversions: 178 },
  { id: "pr4", name: "Influencer Exclusive", description: "Special 10% bonus for influencers only", type: "partner_type_bonus", bonusRate: 10, eligibleTypes: ["influencer"], bannerUrl: "", startDate: "2026-05-01", endDate: "2026-05-31", isActive: false, clicks: 3200, conversions: 245 },
  { id: "pr5", name: "B2B Referral Drive", description: "Double commission on first B2B client referral", type: "partner_type_bonus", bonusRate: 8, eligibleTypes: ["b2b_referral"], bannerUrl: "", startDate: "2026-04-01", endDate: "2026-06-30", isActive: true, clicks: 560, conversions: 28 },
];

const seedBounties: Bounty[] = [
  { id: "b1", name: "Bring a Vendor", description: "Refer a new vendor to join Kauvex marketplace", type: "vendor_referral", amount: 25000, eligiblePartnerTypes: ["associate", "influencer", "agency"], maxPerPartner: 10, maxTotal: 100, usedCount: 34, startDate: "2026-01-01", endDate: "2026-12-31", isActive: true },
  { id: "b2", name: "Top Seller Sprint", description: "Generate ₦1M in sales within 30 days of joining", type: "milestone", amount: 50000, eligiblePartnerTypes: ["associate", "influencer"], maxPerPartner: 1, maxTotal: 50, usedCount: 12, startDate: "2026-03-01", endDate: "2026-09-30", isActive: true },
  { id: "b3", name: "Social Media Blast", description: "Post Kauvex affiliate link on 3+ platforms in one week", type: "social_promotion", amount: 10000, eligiblePartnerTypes: ["influencer", "associate"], maxPerPartner: 5, maxTotal: 200, usedCount: 87, startDate: "2026-02-01", endDate: "2026-12-31", isActive: true },
];

const promoTypes = ["category_bonus", "flash_bonus", "partner_type_bonus"];
const bountyTypes = ["vendor_referral", "milestone", "social_promotion", "customer_referral"];

export default function AdminAffiliatesPromotionsPage() {
  const [promotions, setPromotions] = useState(seedPromotions);
  const [bounties, setBounties] = useState(seedBounties);
  const [activeSection, setActiveSection] = useState<"promotions" | "bounties">("promotions");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", type: "category_bonus", bonusRate: "5",
    eligibleTypes: "associate,influencer", startDate: "", endDate: "",
    isActive: true,
  });

  const resetForm = () => {
    setForm({ name: "", description: "", type: "category_bonus", bonusRate: "5", eligibleTypes: "associate,influencer", startDate: "", endDate: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSection === "promotions") {
      if (editingId) {
        setPromotions((prev) => prev.map((p) => p.id === editingId ? {
          ...p, name: form.name, description: form.description, type: form.type,
          bonusRate: parseFloat(form.bonusRate), eligibleTypes: form.eligibleTypes.split(","),
          startDate: form.startDate, endDate: form.endDate, isActive: form.isActive,
        } : p));
      } else {
        setPromotions((prev) => [...prev, {
          id: `pr${Date.now()}`, name: form.name, description: form.description,
          type: form.type, bonusRate: parseFloat(form.bonusRate),
          eligibleTypes: form.eligibleTypes.split(","), bannerUrl: "",
          startDate: form.startDate, endDate: form.endDate, isActive: form.isActive,
          clicks: 0, conversions: 0,
        }]);
      }
    }
    resetForm();
  };

  const handleEdit = (p: Promotion) => {
    setForm({ name: p.name, description: p.description, type: p.type, bonusRate: String(p.bonusRate), eligibleTypes: p.eligibleTypes.join(","), startDate: p.startDate, endDate: p.endDate, isActive: p.isActive });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setPromotions((prev) => prev.filter((p) => p.id !== id));
  };

  const filteredPromos = promotions.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredBounties = bounties.filter((b) => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminShell title="Promotions & Bounties" subtitle="Manage affiliate promotions and bounty programs">
      <div className="space-y-6">
        {/* Section Toggle */}
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200 w-fit">
          <button onClick={() => setActiveSection("promotions")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeSection === "promotions" ? "bg-[#FF6B00] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
            <Gift size={14} className="inline mr-1" /> Promotions
          </button>
          <button onClick={() => setActiveSection("bounties")} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${activeSection === "bounties" ? "bg-[#FF6B00] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
            <Target size={14} className="inline mr-1" /> Bounties
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeSection}...`} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
            <Plus size={16} /> Create {activeSection === "promotions" ? "Promotion" : "Bounty"}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-[#0A1628]">{editingId ? "Edit" : "Create"} {activeSection === "promotions" ? "Promotion" : "Bounty"}</h3>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {(activeSection === "promotions" ? promoTypes : bountyTypes).map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{activeSection === "promotions" ? "Bonus Rate (%)" : "Amount (₦)"}</label>
                <input value={form.bonusRate} onChange={(e) => setForm({ ...form, bonusRate: e.target.value })} type="number" step="0.1" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Eligible Partner Types (comma-separated)</label>
                <input value={form.eligibleTypes} onChange={(e) => setForm({ ...form, eligibleTypes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                <input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                <input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="col-span-2 flex items-center gap-3 pt-2">
                <button type="submit" className="px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors">
                  {editingId ? "Update" : "Create"}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {activeSection === "promotions" ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Name", "Type", "Bonus Rate", "Eligible Types", "Period", "Status", "Clicks", "Conversions", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPromos.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-[#0A1628]">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.description}</p>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{p.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 font-semibold text-sm text-green-600">+{p.bonusRate}%</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">{p.eligibleTypes.map((t) => <span key={t} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{t}</span>)}</div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{p.startDate} – {p.endDate}</td>
                    <td className="px-4 py-3">{p.isActive ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600"><Check size={10} className="inline mr-0.5" /> Active</span> : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"><X size={10} className="inline mr-0.5" /> Inactive</span>}</td>
                    <td className="px-4 py-3 font-semibold text-sm">{p.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-sm">{p.conversions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"><Edit3 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Name", "Type", "Amount", "Eligible Types", "Max/Partner", "Used", "Period", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBounties.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-[#0A1628]">{b.name}</p>
                      <p className="text-[10px] text-gray-400">{b.description}</p>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{b.type.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 font-bold text-sm text-green-600">₦{b.amount.toLocaleString()}</td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{b.eligiblePartnerTypes.map((t) => <span key={t} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{t}</span>)}</div></td>
                    <td className="px-4 py-3 text-xs">{b.maxPerPartner}</td>
                    <td className="px-4 py-3 text-xs">{b.usedCount}/{b.maxTotal}</td>
                    <td className="px-4 py-3 text-[10px] text-gray-500">{b.startDate} – {b.endDate}</td>
                    <td className="px-4 py-3">{b.isActive ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600"><Check size={10} className="inline mr-0.5" /> Active</span> : <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"><X size={10} className="inline mr-0.5" /> Inactive</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
