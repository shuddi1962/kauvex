"use client";

import { useState } from "react";
import {
  FileText, ClipboardList, Plus, X, Save, Send, MessageSquare,
  Building2, Globe, Calendar, DollarSign, Package, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const rfqTabs = [
  { id: "open", label: "Open RFQs" },
  { id: "mine", label: "My RFQs" },
  { id: "create", label: "Create RFQ" },
];

interface RFQ {
  id: string;
  rfq_number: string;
  product_needed: string;
  quantity: number;
  unit: string;
  delivery_country: string;
  status: "open" | "under_review" | "awarded" | "closed";
  response_count: number;
  budget_range: string;
  timeline: string;
  packaging: string;
  created_date: string;
  buyer: string;
}

interface RFQResponse {
  id: string;
  rfq_id: string;
  supplier_name: string;
  country: string;
  unit_price: number;
  total_price: number;
  delivery_days: number;
  payment_terms: string;
  notes: string;
  submitted_date: string;
}

const statusColors: Record<string, string> = {
  open: "bg-green-50 text-green-700",
  under_review: "bg-yellow-50 text-yellow-700",
  awarded: "bg-blue-50 text-blue",
  closed: "bg-gray-100 text-gray-600",
};

const countryEmojis: Record<string, string> = {
  "Nigeria": "🇳🇬", "UK": "🇬🇧", "USA": "🇺🇸", "Germany": "🇩🇪",
  "UAE": "🇦🇪", "China": "🇨🇳", "India": "🇮🇳", "South Africa": "🇿🇦",
  "Ghana": "🇬🇭", "Japan": "🇯🇵", "Canada": "🇨🇦", "Australia": "🇦🇺",
};

const seedRFQs: RFQ[] = [
  { id: "1", rfq_number: "RFQ-2026-001", product_needed: "Industrial Grade Steel Sheets (3mm)", quantity: 5000, unit: "sheets", delivery_country: "Nigeria", status: "open", response_count: 4, budget_range: "₦45M - ₦55M", timeline: "45 days", packaging: "Standard pallet wrap", created_date: "2026-06-01", buyer: "Kauvex Procurement" },
  { id: "2", rfq_number: "RFQ-2026-002", product_needed: "Smartphone LCD Displays 6.5\"", quantity: 10000, unit: "units", delivery_country: "Nigeria", status: "open", response_count: 7, budget_range: "₦120M - ₦150M", timeline: "30 days", packaging: "Anti-static foam boxes", created_date: "2026-06-03", buyer: "Kauvex Procurement" },
  { id: "3", rfq_number: "RFQ-2026-003", product_needed: "Organic Shea Butter (Refined)", quantity: 20000, unit: "kg", delivery_country: "UK", status: "under_review", response_count: 5, budget_range: "£80K - £100K", timeline: "60 days", packaging: "Food-grade drums", created_date: "2026-05-28", buyer: "Kauvex Export" },
  { id: "4", rfq_number: "RFQ-2026-004", product_needed: "Solar Panel Kits 300W", quantity: 2500, unit: "kits", delivery_country: "Nigeria", status: "awarded", response_count: 6, budget_range: "₦85M - ₦95M", timeline: "40 days", packaging: "Export-grade cartons", created_date: "2026-05-20", buyer: "Kauvex Procurement" },
  { id: "5", rfq_number: "RFQ-2026-005", product_needed: "Frozen Chicken (Whole)", quantity: 50000, unit: "kg", delivery_country: "Ghana", status: "open", response_count: 3, budget_range: "₦65M - ₦80M", timeline: "30 days", packaging: "Vacuum-sealed + frozen", created_date: "2026-06-05", buyer: "Kauvex Foods" },
  { id: "6", rfq_number: "RFQ-2026-006", product_needed: "Pharmaceutical Glass Bottles 100ml", quantity: 100000, unit: "units", delivery_country: "Nigeria", status: "under_review", response_count: 8, budget_range: "₦18M - ₦25M", timeline: "50 days", packaging: "Cardboard boxes with dividers", created_date: "2026-05-25", buyer: "Kauvex Pharma" },
  { id: "7", rfq_number: "RFQ-2026-007", product_needed: "Cotton T-Shirts (Bulk, White)", quantity: 50000, unit: "pieces", delivery_country: "USA", status: "open", response_count: 2, budget_range: "$150K - $200K", timeline: "75 days", packaging: "Polybag per dozen", created_date: "2026-06-08", buyer: "Kauvex Apparel" },
  { id: "8", rfq_number: "RFQ-2026-008", product_needed: "Lithium Batteries 18650", quantity: 50000, unit: "units", delivery_country: "Germany", status: "closed", response_count: 4, budget_range: "€90K - €110K", timeline: "35 days", packaging: "UN3480 certified packaging", created_date: "2026-04-15", buyer: "Kauvex Tech" },
];

const seedResponses: Record<string, RFQResponse[]> = {
  "RFQ-2026-001": [
    { id: "r1", rfq_id: "RFQ-2026-001", supplier_name: "Johannesburg Steel Mills", country: "South Africa", unit_price: 9500, total_price: 47500000, delivery_days: 35, payment_terms: "50% deposit, 50% on delivery", notes: "SABS certified, grade A steel", submitted_date: "2026-06-05" },
    { id: "r2", rfq_id: "RFQ-2026-001", supplier_name: "Shenzhen Electronics Co", country: "China", unit_price: 8800, total_price: 44000000, delivery_days: 45, payment_terms: "30% deposit, 70% T/T", notes: "Can include anticorrosion coating", submitted_date: "2026-06-04" },
    { id: "r3", rfq_id: "RFQ-2026-001", supplier_name: "Dubai Traders FZE", country: "UAE", unit_price: 9200, total_price: 46000000, delivery_days: 30, payment_terms: "Full L/C", notes: "Ready stock in Jebel Ali", submitted_date: "2026-06-06" },
  ],
  "RFQ-2026-002": [
    { id: "r4", rfq_id: "RFQ-2026-002", supplier_name: "Shenzhen Electronics Co", country: "China", unit_price: 12500, total_price: 125000000, delivery_days: 25, payment_terms: "30% deposit, 70% before shipment", notes: "Latest model, 90-day warranty", submitted_date: "2026-06-06" },
    { id: "r5", rfq_id: "RFQ-2026-002", supplier_name: "Tokyo Components Inc", country: "Japan", unit_price: 14500, total_price: 145000000, delivery_days: 35, payment_terms: "L/C at sight", notes: "JIS certified, premium grade", submitted_date: "2026-06-07" },
  ],
};

const formatCurrency = (val: number) => `₦${(val / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export default function RFQPage() {
  const [activeTab, setActiveTab] = useState("open");
  const [rfqs] = useState<RFQ[]>(seedRFQs);
  const [selectedRFQ, setSelectedRFQ] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [rfqForm, setRfqForm] = useState({
    product_needed: "", quantity: 0, unit: "units", delivery_country: "Nigeria",
    timeline: "", budget_min: "", budget_max: "", packaging: "", notes: "",
  });

  const openRFQs = rfqs.filter((r) => r.status === "open").length;
  const totalResponses = rfqs.reduce((s, r) => s + r.response_count, 0);

  return (
    <AdminShell title="RFQ System" subtitle="Request for Quotations & Supplier Responses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">RFQ System</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setShowCreateModal(true); }}>
              <Plus size={14} className="mr-1" /> Create RFQ
            </Button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {rfqTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total RFQs", value: String(rfqs.length), icon: FileText, color: "bg-blue-50 text-blue" },
            { label: "Open RFQs", value: String(openRFQs), icon: ClipboardList, color: "bg-green-50 text-green-700" },
            { label: "Total Responses", value: String(totalResponses), icon: MessageSquare, color: "bg-purple-50 text-purple-700" },
            { label: "Awarded", value: String(rfqs.filter((r) => r.status === "awarded").length), icon: Send, color: "bg-orange-50 text-orange" },
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

        {/* Open RFQs */}
        {activeTab === "open" && (
          <div className="space-y-4">
            {rfqs.filter((r) => r.status !== "closed").map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-soft transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-text-4">{rfq.rfq_number}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[rfq.status]}`}>{rfq.status.replace("_", " ")}</span>
                    </div>
                    <h4 className="font-semibold text-text-1">{rfq.product_needed}</h4>
                  </div>
                  <button onClick={() => setSelectedRFQ(selectedRFQ === rfq.rfq_number ? null : rfq.rfq_number)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4">
                    <Eye size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div><p className="text-lg font-bold text-text-1">{rfq.quantity.toLocaleString()}</p><p className="text-[10px] text-text-4">{rfq.unit}</p></div>
                  <div><p className="text-lg font-bold text-text-1">{countryEmojis[rfq.delivery_country] || "🌍"}</p><p className="text-[10px] text-text-4">{rfq.delivery_country}</p></div>
                  <div><p className="text-sm font-semibold text-text-1">{rfq.budget_range}</p><p className="text-[10px] text-text-4">Budget range</p></div>
                  <div><p className="text-sm font-semibold text-text-1">{rfq.response_count}</p><p className="text-[10px] text-text-4">Responses</p></div>
                  <div><p className="text-sm font-semibold text-text-1">{rfq.timeline}</p><p className="text-[10px] text-text-4">Timeline</p></div>
                </div>

                {/* Expanded responses */}
                {selectedRFQ === rfq.rfq_number && seedResponses[rfq.rfq_number] && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <p className="text-xs font-semibold text-text-4 uppercase tracking-wider">Supplier Responses</p>
                    {seedResponses[rfq.rfq_number].map((resp) => (
                      <div key={resp.id} className="bg-off-white rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-text-4" />
                              <span className="font-medium text-sm text-text-1">{resp.supplier_name}</span>
                              <span className="text-xs">{countryEmojis[resp.country] || "🌍"}</span>
                            </div>
                            <p className="text-xs text-text-4 mt-0.5">Payment: {resp.payment_terms}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue">{formatCurrency(resp.total_price)}</p>
                            <p className="text-[10px] text-text-4">{formatCurrency(resp.unit_price)} per unit</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-text-3">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {resp.delivery_days} days</span>
                          <span className="flex items-center gap-1"><MessageSquare size={10} /> {resp.notes}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs h-7 px-3">Counter</Button>
                          <Button size="sm" className="text-xs h-7 px-3">Accept Quote</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* My RFQs */}
        {activeTab === "mine" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1">My RFQs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">RFQ #</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Qty</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Delivery</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Responses</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Created</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-text-3">{rfq.rfq_number}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-text-1">{rfq.product_needed}</p>
                        <p className="text-[10px] text-text-4">{rfq.buyer}</p>
                      </td>
                      <td className="px-5 py-3 text-center text-text-2">{rfq.quantity.toLocaleString()}</td>
                      <td className="px-5 py-3 text-center text-lg">{countryEmojis[rfq.delivery_country] || "🌍"}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[rfq.status]}`}>{rfq.status.replace("_", " ")}</span>
                      </td>
                      <td className="px-5 py-3 text-center font-semibold text-text-1">{rfq.response_count}</td>
                      <td className="px-5 py-3 text-text-4">{rfq.created_date}</td>
                      <td className="px-5 py-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create RFQ */}
        {activeTab === "create" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl">
            <h3 className="font-semibold text-text-1 mb-6">Create New RFQ</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-semibold text-text-2 mb-1 block">Product Needed</label>
                  <input value={rfqForm.product_needed} onChange={(e) => setRfqForm({ ...rfqForm, product_needed: e.target.value })} placeholder="e.g. Industrial Grade Steel Sheets 3mm" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Quantity</label>
                  <input type="number" min={1} value={rfqForm.quantity} onChange={(e) => setRfqForm({ ...rfqForm, quantity: +e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Unit</label>
                  <select value={rfqForm.unit} onChange={(e) => setRfqForm({ ...rfqForm, unit: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    {["units", "kg", "pieces", "sheets", "liters", "boxes", "pallets", "kits"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Delivery Country</label>
                  <select value={rfqForm.delivery_country} onChange={(e) => setRfqForm({ ...rfqForm, delivery_country: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    {Object.keys(countryEmojis).map((c) => <option key={c} value={c}>{countryEmojis[c]} {c}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Delivery Timeline</label>
                  <select value={rfqForm.timeline} onChange={(e) => setRfqForm({ ...rfqForm, timeline: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    <option value="">Select...</option>
                    <option value="15 days">15 days</option>
                    <option value="30 days">30 days</option>
                    <option value="45 days">45 days</option>
                    <option value="60 days">60 days</option>
                    <option value="75 days">75 days</option>
                    <option value="90 days">90 days</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Budget Min (₦)</label>
                  <input type="number" min={0} value={rfqForm.budget_min} onChange={(e) => setRfqForm({ ...rfqForm, budget_min: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Budget Max (₦)</label>
                  <input type="number" min={0} value={rfqForm.budget_max} onChange={(e) => setRfqForm({ ...rfqForm, budget_max: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              </div>
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Packaging Requirements</label>
                <input value={rfqForm.packaging} onChange={(e) => setRfqForm({ ...rfqForm, packaging: e.target.value })} placeholder="e.g. Standard pallet wrap, export-grade cartons..." className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Additional Notes</label>
                <textarea value={rfqForm.notes} onChange={(e) => setRfqForm({ ...rfqForm, notes: e.target.value })} className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none focus:border-blue" /></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">Save Draft</Button>
                <Button className="flex-1" disabled={!rfqForm.product_needed || !rfqForm.quantity}>
                  <Send size={14} className="mr-1" /> Publish RFQ
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create RFQ Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[540px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">Create RFQ</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Product Needed</label>
                <input value={rfqForm.product_needed} onChange={(e) => setRfqForm({ ...rfqForm, product_needed: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Quantity</label>
                  <input type="number" min={1} value={rfqForm.quantity} onChange={(e) => setRfqForm({ ...rfqForm, quantity: +e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Unit</label>
                  <select value={rfqForm.unit} onChange={(e) => setRfqForm({ ...rfqForm, unit: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    {["units", "kg", "pieces", "sheets", "liters", "boxes", "pallets", "kits"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Delivery Country</label>
                  <select value={rfqForm.delivery_country} onChange={(e) => setRfqForm({ ...rfqForm, delivery_country: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    {Object.keys(countryEmojis).map((c) => <option key={c} value={c}>{countryEmojis[c]} {c}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Timeline</label>
                  <select value={rfqForm.timeline} onChange={(e) => setRfqForm({ ...rfqForm, timeline: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    <option value="">Select...</option>
                    {["15 days", "30 days", "45 days", "60 days", "75 days", "90 days"].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Budget Min</label>
                  <input type="number" value={rfqForm.budget_min} onChange={(e) => setRfqForm({ ...rfqForm, budget_min: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Budget Max</label>
                  <input type="number" value={rfqForm.budget_max} onChange={(e) => setRfqForm({ ...rfqForm, budget_max: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              </div>
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Packaging</label>
                <input value={rfqForm.packaging} onChange={(e) => setRfqForm({ ...rfqForm, packaging: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button className="flex-1" disabled={!rfqForm.product_needed || !rfqForm.quantity}><Send size={14} className="mr-1" /> Publish RFQ</Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
