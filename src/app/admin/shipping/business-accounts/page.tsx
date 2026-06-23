"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Plus, Search, Loader2, X, ToggleLeft, ToggleRight,
  Building2, Wallet, Users, TrendingUp,
} from "lucide-react";

interface BusinessAccount {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  billing_type: string;
  wallet_balance: number;
  volume_tier: string;
  discount_percent: number;
  monthly_invoice_day: number;
  payment_terms_days: number;
  api_access: boolean;
  custom_waybill_branding: boolean;
  status: string;
  created_at: string;
}

const tierColors: Record<string, string> = {
  bronze: "bg-orange-50 text-orange",
  silver: "bg-gray-100 text-text-4",
  gold: "bg-yellow-50 text-yellow-700",
  platinum: "bg-purple-50 text-purple-700",
};

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  suspended: "bg-red-50 text-red",
  closed: "bg-gray-100 text-text-4",
};

const billingLabels: Record<string, string> = {
  per_shipment: "Per Shipment",
  monthly_invoice: "Monthly Invoice",
  prepaid_wallet: "Prepaid Wallet",
};

export default function BusinessAccountsPage() {
  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BusinessAccount | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    billing_type: "per_shipment",
    wallet_balance: "0",
    volume_tier: "bronze",
    discount_percent: "0",
    monthly_invoice_day: "1",
    payment_terms_days: "30",
    api_access: false,
    custom_waybill_branding: false,
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const { data } = await insforge
        .database
        .from("kv_ship_business_accounts")
        .select("*")
        .order("company_name");
      if (data) setAccounts(data);
    } catch (e) {
      console.error("Failed to load business accounts:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const filtered = search
    ? accounts.filter(
        (a) =>
          a.company_name.toLowerCase().includes(search.toLowerCase()) ||
          a.contact_email.toLowerCase().includes(search.toLowerCase())
      )
    : accounts;

  const openCreate = () => {
    setEditing(null);
    setForm({
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      billing_type: "per_shipment",
      wallet_balance: "0",
      volume_tier: "bronze",
      discount_percent: "0",
      monthly_invoice_day: "1",
      payment_terms_days: "30",
      api_access: false,
      custom_waybill_branding: false,
      status: "active",
    });
    setShowModal(true);
  };

  const openEdit = (a: BusinessAccount) => {
    setEditing(a);
    setForm({
      company_name: a.company_name,
      contact_name: a.contact_name,
      contact_email: a.contact_email,
      contact_phone: a.contact_phone,
      billing_type: a.billing_type,
      wallet_balance: String(a.wallet_balance),
      volume_tier: a.volume_tier,
      discount_percent: String(a.discount_percent),
      monthly_invoice_day: String(a.monthly_invoice_day),
      payment_terms_days: String(a.payment_terms_days),
      api_access: a.api_access,
      custom_waybill_branding: a.custom_waybill_branding,
      status: a.status,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.company_name.trim() || !form.contact_email.trim()) return;
    setSaving(true);
    const payload = {
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone.trim(),
      billing_type: form.billing_type,
      wallet_balance: parseFloat(form.wallet_balance) || 0,
      volume_tier: form.volume_tier,
      discount_percent: parseFloat(form.discount_percent) || 0,
      monthly_invoice_day: parseInt(form.monthly_invoice_day) || 1,
      payment_terms_days: parseInt(form.payment_terms_days) || 30,
      api_access: form.api_access,
      custom_waybill_branding: form.custom_waybill_branding,
      status: form.status,
    };
    try {
      if (editing) {
        await insforge
          .database
          .from("kv_ship_business_accounts")
          .update(payload)
          .eq("id", editing.id);
        setAccounts((prev) =>
          prev.map((a) => (a.id === editing.id ? { ...a, ...payload } : a))
        );
      } else {
        const { data } = await insforge
          .database
          .from("kv_ship_business_accounts")
          .insert(payload)
          .select("*");
        if (data?.[0]) setAccounts((prev) => [...prev, data[0]]);
      }
      setShowModal(false);
    } catch (e) {
      console.error("Failed to save business account:", e);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (account: BusinessAccount) => {
    const next = account.status === "active" ? "suspended" : "active";
    try {
      await insforge
        .database
        .from("kv_ship_business_accounts")
        .update({ status: next })
        .eq("id", account.id);
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, status: next } : a))
      );
    } catch (e) {
      console.error("Failed to toggle status:", e);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Business Accounts" subtitle="Manage corporate shipping accounts">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  const activeAccounts = accounts.filter((a) => a.status === "active");
  const totalWalletBalance = accounts.reduce((s, a) => s + Number(a.wallet_balance), 0);
  const monthlyEstimate = accounts
    .filter((a) => a.status === "active")
    .reduce((s, a) => {
      const base = 50000;
      const multipliers: Record<string, number> = {
        bronze: 1,
        silver: 2.5,
        gold: 5,
        platinum: 10,
      };
      return s + base * (multipliers[a.volume_tier] || 1);
    }, 0);

  return (
    <AdminShell title="Business Accounts" subtitle="Manage corporate shipping accounts">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Accounts",
            value: accounts.length,
            icon: Building2,
            color: "text-text-1",
          },
          {
            label: "Active Accounts",
            value: activeAccounts.length,
            icon: Users,
            color: "text-green-600",
          },
          {
            label: "Total Wallet Balance",
            value: `$${totalWalletBalance.toLocaleString()}`,
            icon: Wallet,
            color: "text-blue",
          },
          {
            label: "Monthly Recurring Est.",
            value: `$${Math.round(monthlyEstimate).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-amber-600",
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon size={18} className="text-text-4" />
            </div>
            <p className={`font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-4 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company name or email..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/20"
          />
        </div>
        <button
          onClick={openCreate}
          className="h-9 px-4 bg-blue text-white text-sm font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={14} /> Add Account
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Company</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Contact</th>
              <th className="p-3 text-left text-xs font-semibold text-text-4 uppercase">Billing</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Tier</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Discount</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Wallet</th>
              <th className="p-3 text-center text-xs font-semibold text-text-4 uppercase">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-text-4 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-text-4">No business accounts found</td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-blue" />
                      </div>
                      <span className="text-sm font-semibold text-text-1">{a.company_name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-text-1">{a.contact_name}</p>
                    <p className="text-[10px] text-text-4">{a.contact_email}</p>
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-text-2 capitalize">
                      {billingLabels[a.billing_type] || a.billing_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        tierColors[a.volume_tier] || "bg-gray-100 text-text-4"
                      }`}
                    >
                      {a.volume_tier}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm font-semibold text-text-1">
                    {Number(a.discount_percent) > 0 ? `${a.discount_percent}%` : "\u2014"}
                  </td>
                  <td className="p-3 text-right text-sm font-semibold text-text-1">
                    ${Number(a.wallet_balance).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        statusColors[a.status] || "bg-gray-100 text-text-4"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(a)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg"
                        title={a.status === "active" ? "Suspend" : "Activate"}
                      >
                        {a.status === "active" ? (
                          <ToggleRight size={16} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={16} className="text-text-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(a)}
                        className="text-xs text-blue font-semibold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-[560px] max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{editing ? "Edit Business Account" : "Add Business Account"}</h3>
              <button onClick={() => setShowModal(false)} className="text-text-4 hover:text-text-2"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Company Name *</label>
                  <input
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Contact Name</label>
                  <input
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Contact Email *</label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    placeholder="john@acme.com"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Contact Phone</label>
                  <input
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    placeholder="+1 555-1234"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Billing Type</label>
                  <select
                    value={form.billing_type}
                    onChange={(e) => setForm({ ...form, billing_type: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  >
                    <option value="per_shipment">Per Shipment</option>
                    <option value="monthly_invoice">Monthly Invoice</option>
                    <option value="prepaid_wallet">Prepaid Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Volume Tier</label>
                  <select
                    value={form.volume_tier}
                    onChange={(e) => setForm({ ...form, volume_tier: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Wallet Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.wallet_balance}
                    onChange={(e) => setForm({ ...form, wallet_balance: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Discount (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.discount_percent}
                    onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Invoice Day</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={form.monthly_invoice_day}
                    onChange={(e) => setForm({ ...form, monthly_invoice_day: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-2 mb-1.5">Payment Terms (days)</label>
                  <input
                    type="number"
                    value={form.payment_terms_days}
                    onChange={(e) => setForm({ ...form, payment_terms_days: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-text-2">API Access</label>
                  <button
                    onClick={() => setForm({ ...form, api_access: !form.api_access })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.api_access ? "bg-blue" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form.api_access ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-text-2">Custom Waybill</label>
                  <button
                    onClick={() => setForm({ ...form, custom_waybill_branding: !form.custom_waybill_branding })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.custom_waybill_branding ? "bg-blue" : "bg-gray-300"}`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        form.custom_waybill_branding ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 h-10 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.company_name.trim() || !form.contact_email.trim()}
                className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
