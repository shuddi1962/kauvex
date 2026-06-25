"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Search, DollarSign, Check, Clock, RotateCcw, AlertTriangle,
  Pencil, Save, X,
} from "lucide-react";

interface CommissionRecord {
  id: string;
  partner: string;
  partnerId: string;
  orderId: string;
  product: string;
  category: string;
  saleAmount: number;
  rate: number;
  commission: number;
  bonus: number;
  total: number;
  status: string;
  date: string;
}

interface CategoryRate {
  category: string;
  rate: number;
  bonusRate: number;
}

const categoryRates: CategoryRate[] = [
  { category: "Electronics", rate: 5, bonusRate: 0 },
  { category: "Fashion", rate: 10, bonusRate: 2 },
  { category: "Home & Kitchen", rate: 8, bonusRate: 1 },
  { category: "Beauty & Health", rate: 12, bonusRate: 3 },
  { category: "Sports & Outdoors", rate: 7, bonusRate: 1 },
  { category: "Books & Media", rate: 15, bonusRate: 5 },
  { category: "Toys & Games", rate: 10, bonusRate: 2 },
  { category: "Automotive", rate: 5, bonusRate: 0 },
  { category: "Groceries", rate: 3, bonusRate: 0 },
  { category: "Digital Products", rate: 20, bonusRate: 5 },
];

const allCommissions: CommissionRecord[] = [
  { id: "1", partner: "Ngozi Eze", partnerId: "p1", orderId: "ORD-101", product: "Wireless Headphones", category: "Electronics", saleAmount: 350000, rate: 20, commission: 70000, bonus: 0, total: 70000, status: "paid", date: "2026-06-01" },
  { id: "2", partner: "Amara Nwachukwu", partnerId: "p2", orderId: "ORD-102", product: "Designer Handbag", category: "Fashion", saleAmount: 280000, rate: 15, commission: 42000, bonus: 5600, total: 47600, status: "paid", date: "2026-06-02" },
  { id: "3", partner: "Bola Tinubu Ventures", partnerId: "p3", orderId: "ORD-103", product: "Office Desk", category: "Home & Kitchen", saleAmount: 520000, rate: 15, commission: 78000, bonus: 0, total: 78000, status: "pending", date: "2026-06-05" },
  { id: "4", partner: "Zainab Yusuf", partnerId: "p4", orderId: "ORD-104", product: "Skincare Set", category: "Beauty & Health", saleAmount: 180000, rate: 18, commission: 32400, bonus: 5400, total: 37800, status: "confirmed", date: "2026-06-03" },
  { id: "5", partner: "Chinwe Obi", partnerId: "p5", orderId: "ORD-105", product: "Yoga Mat Premium", category: "Sports & Outdoors", saleAmount: 420000, rate: 15, commission: 63000, bonus: 4200, total: 67200, status: "pending", date: "2026-06-07" },
  { id: "6", partner: "Tunde Bakare", partnerId: "p6", orderId: "ORD-106", product: "Fiction Novel Set", category: "Books & Media", saleAmount: 95000, rate: 12, commission: 11400, bonus: 4750, total: 16150, status: "paid", date: "2026-05-28" },
  { id: "7", partner: "Ngozi Eze", partnerId: "p1", orderId: "ORD-107", product: "Smart Watch", category: "Electronics", saleAmount: 680000, rate: 20, commission: 136000, bonus: 0, total: 136000, status: "pending", date: "2026-06-08" },
  { id: "8", partner: "Chidi Okeke", partnerId: "p7", orderId: "ORD-108", product: "Coffee Maker", category: "Home & Kitchen", saleAmount: 150000, rate: 12, commission: 18000, bonus: 1500, total: 19500, status: "paid", date: "2026-05-25" },
  { id: "9", partner: "Yemi Ogun", partnerId: "p8", orderId: "ORD-109", product: "Running Shoes", category: "Sports & Outdoors", saleAmount: 210000, rate: 12, commission: 25200, bonus: 2100, total: 27300, status: "disputed", date: "2026-06-09" },
  { id: "10", partner: "Zainab Yusuf", partnerId: "p4", orderId: "ORD-110", product: "Makeup Kit", category: "Beauty & Health", saleAmount: 450000, rate: 18, commission: 81000, bonus: 13500, total: 94500, status: "confirmed", date: "2026-06-10" },
  { id: "11", partner: "Kelechi Ibe", partnerId: "p9", orderId: "ORD-111", product: "Board Game Set", category: "Toys & Games", saleAmount: 125000, rate: 12, commission: 15000, bonus: 2500, total: 17500, status: "paid", date: "2026-05-30" },
  { id: "12", partner: "Femi Adeleke", partnerId: "p10", orderId: "ORD-112", product: "Car Phone Holder", category: "Automotive", saleAmount: 88000, rate: 10, commission: 8800, bonus: 0, total: 8800, status: "reversed", date: "2026-06-06" },
  { id: "13", partner: "Ngozi Eze", partnerId: "p1", orderId: "ORD-113", product: "Laptop Stand", category: "Electronics", saleAmount: 120000, rate: 20, commission: 24000, bonus: 0, total: 24000, status: "pending", date: "2026-06-12" },
  { id: "14", partner: "Amara Nwachukwu", partnerId: "p2", orderId: "ORD-114", product: "Silk Dress", category: "Fashion", saleAmount: 195000, rate: 15, commission: 29250, bonus: 3900, total: 33150, status: "disputed", date: "2026-06-11" },
];

const tabs = ["Pending", "Confirmed", "Reversed", "Disputed"];

export default function AdminAffiliatesCommissionsPage() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [search, setSearch] = useState("");
  const [rates, setRates] = useState(categoryRates);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const filtered = allCommissions.filter((c) => {
    const tabMatch =
      activeTab === "Pending" ? c.status === "pending" :
      activeTab === "Confirmed" ? c.status === "confirmed" :
      activeTab === "Reversed" ? c.status === "reversed" :
      c.status === "disputed";
    if (!tabMatch) return false;
    if (search && !c.partner.toLowerCase().includes(search.toLowerCase()) && !c.orderId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleRateEdit = (cat: string) => {
    setEditingRate(cat);
    const r = rates.find((r) => r.category === cat);
    setEditValue(r ? String(r.rate) : "");
  };

  const handleRateSave = (cat: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setRates((prev) => prev.map((r) => r.category === cat ? { ...r, rate: val } : r));
    }
    setEditingRate(null);
  };

  return (
    <AdminShell title="Commissions" subtitle="Commission configuration and transaction management">
      <div className="space-y-6">
        {/* Category Commission Rates */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm text-[#0A1628] mb-3 flex items-center gap-2"><DollarSign size={15} className="text-blue" /> Commission Rates by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {rates.map((r) => (
              <div key={r.category} className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-500 mb-1">{r.category}</p>
                <div className="flex items-center gap-1">
                  {editingRate === r.category ? (
                    <>
                      <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-14 px-1.5 py-0.5 border border-gray-300 rounded text-xs" type="number" step="0.1" min="0" max="100" />
                      <button onClick={() => handleRateSave(r.category)} className="p-0.5 hover:text-green-600"><Save size={12} /></button>
                      <button onClick={() => setEditingRate(null)} className="p-0.5 hover:text-red"><X size={12} /></button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-[#0A1628]">{r.rate}%</span>
                      <button onClick={() => handleRateEdit(r.category)} className="p-0.5 hover:text-blue ml-1"><Pencil size={10} className="text-gray-400" /></button>
                    </>
                  )}
                </div>
                {r.bonusRate > 0 && <p className="text-[9px] text-green-600 mt-0.5">+{r.bonusRate}% bonus</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === tab ? "bg-[#FF6B00] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by partner or order..." className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <span className="text-xs text-gray-400">{filtered.length} commission{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Partner", "Order", "Product", "Category", "Sale Amount", "Rate", "Commission", "Bonus", "Total", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm text-[#0A1628]">{c.partner}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-blue">{c.orderId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{c.product}</td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{c.category}</td>
                  <td className="px-4 py-3 font-semibold text-sm">₦{c.saleAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">{c.rate}%</td>
                  <td className="px-4 py-3 font-semibold text-sm text-green-600">₦{c.commission.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-orange">{c.bonus > 0 ? `₦${c.bonus.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 font-bold text-sm text-[#0A1628]">₦{c.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">{c.date}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-400">No {activeTab.toLowerCase()} commissions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
