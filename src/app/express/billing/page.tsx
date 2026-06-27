"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Zap,
  Receipt,
  DollarSign,
  TrendingUp,
  Download,
  Trash2,
  Star,
  Building2,
} from "lucide-react";

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  label: string;
  last4: string;
  brand?: string;
  isDefault: boolean;
}

interface BillingEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

export default function ExpressBillingPage() {
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const plan = {
    name: "Express Business",
    price: 99.00,
    nextBilling: "2026-07-25",
    shipmentsLimit: 500,
    shipmentsUsed: 327,
    features: ["Unlimited tracking", "Priority support", "Multi-carrier routing", "Custom branding", "API access"],
  };

  const methods: PaymentMethod[] = [
    { id: "1", type: "card", label: "Visa ending in 1234", last4: "1234", brand: "Visa", isDefault: true },
    { id: "2", type: "card", label: "Mastercard ending in 5678", last4: "5678", brand: "Mastercard", isDefault: false },
    { id: "3", type: "bank", label: "GT Bank Account ****9012", last4: "9012", isDefault: false },
  ];

  const billingHistory: BillingEntry[] = [
    { id: "1", date: "2026-06-25", description: "Express Business – Monthly Subscription", amount: 99.00, status: "paid" },
    { id: "2", date: "2026-06-24", description: "International Shipping Surcharge", amount: 42.50, status: "paid" },
    { id: "3", date: "2026-06-20", description: "Insurance Add-on (3 shipments)", amount: 12.75, status: "paid" },
    { id: "4", date: "2026-06-18", description: "Express Business – Monthly Subscription", amount: 99.00, status: "pending" },
    { id: "5", date: "2026-06-15", description: "Fuel Surcharge – Lagos–Abuja Route", amount: 18.30, status: "paid" },
    { id: "6", date: "2026-06-10", description: "Packaging Materials Order", amount: 34.00, status: "failed" },
    { id: "7", date: "2026-06-05", description: "Additional Shipment Overage (27 units)", amount: 81.00, status: "paid" },
    { id: "8", date: "2026-06-01", description: "Express Business – Monthly Subscription", amount: 99.00, status: "paid" },
  ];

  const usagePercent = Math.round((plan.shipmentsUsed / plan.shipmentsLimit) * 100);

  const statusConfig = (status: string) => {
    switch (status) {
      case "paid": return { label: "Paid", color: "text-emerald-600", bg: "bg-emerald-50", icon: <CheckCircle size={14} /> };
      case "pending": return { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: <Clock size={14} /> };
      case "failed": return { label: "Failed", color: "text-red-600", bg: "bg-red-50", icon: <AlertTriangle size={14} /> };
      default: return { label: status, color: "text-gray-500", bg: "bg-gray-50", icon: null };
    }
  };

  const handleAddMethod = () => {
    setShowAddMethod(false);
    setNewMethod({ number: "", expiry: "", cvv: "", name: "" });
  };

  const handleDelete = (id: string) => {
    setConfirmDelete(null);
  };

  return (
    <div style={{ backgroundColor: "#F5F7FA" }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
            <CreditCard className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>Billing & Payment</h1>
            <p className="text-gray-500 text-sm">Manage your subscription, payment methods, and billing history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-gray-200 p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#FF6B00" }}>CURRENT PLAN</span>
                </div>
                <h2 className="text-xl font-bold" style={{ color: "#0A1628" }}>{plan.name}</h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold" style={{ color: "#0A1628" }}>${plan.price.toFixed(2)}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                <p className="text-xs text-gray-500 mt-1">Next billing: {new Date(plan.nextBilling).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {plan.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  <CheckCircle size={10} className="text-emerald-500" />
                  {f}
                </span>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#FF6B00" }}>Upgrade Plan</button>
              <button className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">Manage Subscription</button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-6 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} style={{ color: "#FF6B00" }} />
              <h3 className="font-bold" style={{ color: "#0A1628" }}>Usage This Month</h3>
            </div>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold" style={{ color: "#0A1628" }}>{plan.shipmentsUsed}</p>
              <p className="text-sm text-gray-500">of {plan.shipmentsLimit} shipments</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${usagePercent}%`, backgroundColor: usagePercent > 90 ? "#EF4444" : "#FF6B00" }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">{plan.shipmentsLimit - plan.shipmentsUsed} shipments remaining</p>
            {usagePercent > 80 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  You have used {usagePercent}% of your monthly allowance.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold" style={{ color: "#0A1628" }}>Payment Methods</h3>
            <button
              onClick={() => setShowAddMethod(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#FF6B00" }}
            >
              <Plus size={14} /> Add Method
            </button>
          </div>

          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.type === "bank" ? "#0A162810" : "#FF6B0010" }}>
                  {m.type === "bank" ? <Building2 size={18} style={{ color: "#0A1628" }} /> : <CreditCard size={18} style={{ color: "#FF6B00" }} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: "#0A1628" }}>{m.label}</p>
                    {m.isDefault && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: "#FF6B00" }}>DEFAULT</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.type === "card" ? `${m.brand} • Expires 12/27` : "Nigerian Naira Account"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!m.isDefault && (
                    <button className="text-xs text-gray-400 hover:text-gray-600">Set Default</button>
                  )}
                  {confirmDelete === m.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(m.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Confirm</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(m.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {showAddMethod && (
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 space-y-4">
              <h4 className="font-semibold text-sm" style={{ color: "#0A1628" }}>Add Payment Method</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 block mb-1.5">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={newMethod.number}
                    onChange={(e) => setNewMethod({ ...newMethod, number: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={newMethod.expiry}
                    onChange={(e) => setNewMethod({ ...newMethod, expiry: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={newMethod.cvv}
                    onChange={(e) => setNewMethod({ ...newMethod, cvv: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-500 block mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddMethod(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={handleAddMethod} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#FF6B00" }}>Add Method</button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold" style={{ color: "#0A1628" }}>Billing History</h3>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">
              <Download size={12} /> Export All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Date</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Description</th>
                  <th className="text-right text-gray-500 font-medium py-3 px-4">Amount</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Status</th>
                  <th className="text-right text-gray-500 font-medium py-3 px-4">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((entry) => {
                  const cfg = statusConfig(entry.status);
                  return (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-600">{new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="py-3 px-4 font-medium" style={{ color: "#0A1628" }}>{entry.description}</td>
                      <td className="py-3 px-4 text-right font-bold" style={{ color: "#0A1628" }}>${entry.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {entry.status === "paid" && (
                          <button className="text-xs font-medium hover:underline" style={{ color: "#FF6B00" }}>Download</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
