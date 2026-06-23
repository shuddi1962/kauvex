"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Plus, Edit2, Loader2, X, Filter, DollarSign,
  Tag, Globe, Weight, ToggleLeft, ToggleRight,
} from "lucide-react";

interface RateCard {
  id?: string;
  tier: string;
  origin_country: string;
  origin_city: string;
  destination_country: string;
  destination_city: string;
  weight_min: number;
  weight_max: number;
  base_rate: number;
  currency: string;
  partner_payout_percent: number;
  kauvex_fee_percent: number;
  is_active: boolean;
  created_at?: string;
}

const tierBadges: Record<string, string> = {
  tier_1: "text-green-600 bg-green-50",
  tier_2: "text-blue-600 bg-blue-50",
  tier_3_air: "text-purple-600 bg-purple-50",
  tier_3_sea: "text-cyan-600 bg-cyan-50",
};

const tierOptions = ["tier_1", "tier_2", "tier_3_air", "tier_3_sea"];
const currencies = ["USD", "GBP", "EUR", "NGN", "CAD", "AUD"];

export default function RatesPage() {
  const [rates, setRates] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RateCard | null>(null);
  const [form, setForm] = useState<RateCard>({
    tier: "tier_1",
    origin_country: "",
    origin_city: "",
    destination_country: "",
    destination_city: "",
    weight_min: 0,
    weight_max: 0,
    base_rate: 0,
    currency: "USD",
    partner_payout_percent: 70,
    kauvex_fee_percent: 30,
    is_active: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await insforge.database.from("kv_ship_rate_cards").select("*").order("created_at", { ascending: false });
      if (data) setRates(data);
    } catch (e) {
      console.error("Failed to load rate cards:", e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      tier: "tier_1",
      origin_country: "",
      origin_city: "",
      destination_country: "",
      destination_city: "",
      weight_min: 0,
      weight_max: 0,
      base_rate: 0,
      currency: "USD",
      partner_payout_percent: 70,
      kauvex_fee_percent: 30,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (r: RateCard) => {
    setEditing(r);
    setForm({ ...r });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.origin_country.trim() || !form.destination_country.trim()) return;
    try {
      if (editing?.id) {
        await insforge.database.from("kv_ship_rate_cards").update(form).eq("id", editing.id);
        setRates(rates.map(r => r.id === editing.id ? { ...r, ...form } : r));
      } else {
        const { data } = await insforge.database.from("kv_ship_rate_cards").insert(form).select("*");
        if (data?.[0]) setRates([data[0], ...rates]);
      }
      setShowModal(false);
    } catch (e) { console.error("Failed to save rate card:", e); }
  };

  const toggleActive = async (r: RateCard) => {
    const updated = { ...r, is_active: !r.is_active };
    try {
      await insforge.database.from("kv_ship_rate_cards").update({ is_active: updated.is_active }).eq("id", r.id);
      setRates(rates.map(x => x.id === r.id ? updated : x));
    } catch (e) { console.error("Failed to toggle:", e); }
  };

  const filtered = tierFilter ? rates.filter(r => r.tier === tierFilter) : rates;

  if (loading) {
    return (
      <AdminShell title="Rate Cards" subtitle="Shipping rate card management">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Rate Cards" subtitle="Shipping rate card management">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-4" />
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue"
          >
            <option value="">All Tiers</option>
            {tierOptions.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>
            ))}
          </select>
          <span className="text-sm text-text-4 ml-1">{filtered.length} rate cards</span>
        </div>
        <button onClick={openCreate} className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2">
          <Plus size={14} /> Add Rate Card
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Tier</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Origin</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Destination</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Weight Range</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Base Rate</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Payout %</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Kauvex %</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Active</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-sm text-text-4">No rate cards found</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tierBadges[r.tier] || "bg-gray-100 text-text-4"}`}>
                    {r.tier.replace(/_/g, " ").toUpperCase()}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Globe size={12} className="text-text-4" />
                    <span className="text-sm text-text-1">{r.origin_country}{r.origin_city ? `, ${r.origin_city}` : ""}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Globe size={12} className="text-text-4" />
                    <span className="text-sm text-text-1">{r.destination_country}{r.destination_city ? `, ${r.destination_city}` : ""}</span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm text-text-2">{r.weight_min}–{r.weight_max} kg</span>
                </td>
                <td className="p-3 text-right">
                  <span className="text-sm font-semibold text-text-1">
                    {r.currency === "NGN" ? "₦" : r.currency === "GBP" ? "£" : r.currency === "EUR" ? "€" : "$"}{r.base_rate.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-4 ml-1">{r.currency}</span>
                </td>
                <td className="p-3 text-right text-sm text-text-2">{r.partner_payout_percent}%</td>
                <td className="p-3 text-right text-sm text-text-2">{r.kauvex_fee_percent}%</td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleActive(r)}>
                    {r.is_active ? (
                      <ToggleRight size={18} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={18} className="text-text-4" />
                    )}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-3">
                    <Edit2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-[640px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{editing ? "Edit Rate Card" : "New Rate Card"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-text-2 block mb-1.5">Tier *</label>
                <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue">
                  {tierOptions.map(t => <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Origin Country *</label>
                  <input value={form.origin_country} onChange={e => setForm({ ...form, origin_country: e.target.value })} placeholder="e.g. NG" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Origin City</label>
                  <input value={form.origin_city} onChange={e => setForm({ ...form, origin_city: e.target.value })} placeholder="e.g. Lagos" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Destination Country *</label>
                  <input value={form.destination_country} onChange={e => setForm({ ...form, destination_country: e.target.value })} placeholder="e.g. US" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Destination City</label>
                  <input value={form.destination_city} onChange={e => setForm({ ...form, destination_city: e.target.value })} placeholder="e.g. New York" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-2 block mb-1.5">Weight Range (kg)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input value={form.weight_min} onChange={e => setForm({ ...form, weight_min: Number(e.target.value) })} type="number" placeholder="Min" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                  <input value={form.weight_max} onChange={e => setForm({ ...form, weight_max: Number(e.target.value) })} type="number" placeholder="Max" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Base Rate *</label>
                  <input value={form.base_rate} onChange={e => setForm({ ...form, base_rate: Number(e.target.value) })} type="number" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue">
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Partner Payout %</label>
                  <input value={form.partner_payout_percent} onChange={e => setForm({ ...form, partner_payout_percent: Number(e.target.value) })} type="number" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-2 block mb-1.5">Kauvex Fee %</label>
                  <input value={form.kauvex_fee_percent} onChange={e => setForm({ ...form, kauvex_fee_percent: Number(e.target.value) })} type="number" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={save} className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600">{editing ? "Update" : "Create"} Rate Card</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
