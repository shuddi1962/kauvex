"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Globe, Building2, Plus, X, Check, Save, Copy, ExternalLink,
  Palette, Layout, Users, ShoppingCart, DollarSign, Settings,
  Trash2, Eye, EyeOff, ToggleLeft, ToggleRight, Search, RefreshCw,
} from "lucide-react";

const demoClients = [
  { id: "WL-001", companyName: "TechMarine NG", domain: "techmarine.ng", plan: "enterprise", status: "active", stores: 3, vendors: 12, orders: 4500, revenue: 185000000, created: "2026-01-15", primaryColor: "#0A1628", secondaryColor: "#FF6B00" },
  { id: "WL-002", companyName: "AutoGuard Nigeria", domain: "autoguard.ng", plan: "professional", status: "active", stores: 2, vendors: 8, orders: 2800, revenue: 92000000, created: "2026-02-01", primaryColor: "#1a1a2e", secondaryColor: "#e94560" },
  { id: "WL-003", companyName: "Safemart Africa", domain: "safemart.africa", plan: "professional", status: "active", stores: 1, vendors: 5, orders: 1200, revenue: 45000000, created: "2026-02-15", primaryColor: "#16213e", secondaryColor: "#0f3460" },
  { id: "WL-004", companyName: "HomeEase NG", domain: "homeease.ng", plan: "starter", status: "pending", stores: 0, vendors: 0, orders: 0, revenue: 0, created: "2026-03-20", primaryColor: "#2d4059", secondaryColor: "#ea5455" },
  { id: "WL-005", companyName: "KreativeKids", domain: "kreativekids.com", plan: "starter", status: "suspended", stores: 1, vendors: 3, orders: 450, revenue: 8500000, created: "2026-01-10", primaryColor: "#222831", secondaryColor: "#fd7014" },
];

const planTiers = [
  { id: "starter", name: "Starter", price: 50000, stores: 1, vendors: 5, commission: 5 },
  { id: "professional", name: "Professional", price: 150000, stores: 3, vendors: 25, commission: 3 },
  { id: "enterprise", name: "Enterprise", price: 500000, stores: 10, vendors: 100, commission: 1.5 },
];

const featureList = [
  "Multi-Storefront", "Multi-Vendor", "Custom Domain", "White Label Branding",
  "Payment Gateway Config", "Shipping Config", "Analytics Dashboard", "AI Tools",
  "Mobile Apps", "API Access", "Priority Support", "Dedicated Account Manager",
];

export default function WhiteLabelPage() {
  const [clients, setClients] = useState(demoClients);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof demoClients[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ companyName: "", domain: "", plan: "starter" });

  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    suspended: "bg-red-50 text-red",
  };

  const filteredClients = clients.filter((c) =>
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || c.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminShell title="White Label SaaS" subtitle="Manage white label marketplace clients">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients..." className="h-9 pl-9 pr-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue w-[280px]" />
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
            <Plus size={14} /> Add Client
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">{clients.filter((c) => c.status === "active").length}</p>
            <p className="text-xs text-text-4">Active Clients</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">{clients.reduce((s, c) => s + c.stores, 0)}</p>
            <p className="text-xs text-text-4">Total Storefronts</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">{clients.reduce((s, c) => s + c.vendors, 0)}</p>
            <p className="text-xs text-text-4">Total Vendors</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">₦{clients.reduce((s, c) => s + c.revenue, 0).toLocaleString()}</p>
            <p className="text-xs text-text-4">Combined Revenue</p>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div key={client.id}
              className="bg-white rounded-xl border border-border p-5 cursor-pointer hover:border-blue/30 transition-colors"
              onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${client.primaryColor}, ${client.secondaryColor})` }}>
                    <Building2 size={18} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-1">{client.companyName}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${statusColors[client.status]}`}>{client.status}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded-full font-medium capitalize">{client.plan}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-4 mt-0.5">
                      <Globe size={12} /> {client.domain}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-3">
                      <span>{client.stores} stores</span>
                      <span>·</span>
                      <span>{client.vendors} vendors</span>
                      <span>·</span>
                      <span>{client.orders.toLocaleString()} orders</span>
                      <span>·</span>
                      <span>₦{(client.revenue / 1000000).toFixed(1)}M revenue</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedClient?.id === client.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Branding */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-text-2 flex items-center gap-1"><Palette size={12} /> Branding</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-off-white">
                          <p className="text-[10px] text-text-4">Primary Color</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: client.primaryColor }} />
                            <code className="text-xs font-mono">{client.primaryColor}</code>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-off-white">
                          <p className="text-[10px] text-text-4">Secondary Color</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: client.secondaryColor }} />
                            <code className="text-xs font-mono">{client.secondaryColor}</code>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-text-2 flex items-center gap-1"><Settings size={12} /> Actions</h5>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm"><ExternalLink size={12} className="mr-1" /> Visit Storefront</Button>
                        <Button variant="outline" size="sm"><Palette size={12} className="mr-1" /> Edit Branding</Button>
                        <Button variant="outline" size="sm"><Settings size={12} className="mr-1" /> Configuration</Button>
                        <Button variant="outline" size="sm" className="text-red border-red/20 hover:bg-red-50">
                          <X size={12} className="mr-1" /> Suspend
                        </Button>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="lg:col-span-2">
                      <h5 className="text-xs font-semibold text-text-2 mb-2 flex items-center gap-1"><Layout size={12} /> Enabled Features</h5>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        {featureList.map((feature) => (
                          <div key={feature} className="flex items-center gap-1.5 text-xs">
                            <Check size={12} className="text-green-600 shrink-0" />
                            <span className="text-text-3">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Client Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-lg">Add White Label Client</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Company Name</label>
                <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. TechMarine NG" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Domain</label>
                <input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  placeholder="e.g. techmarine.ng" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Plan Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {planTiers.map((plan) => (
                    <button key={plan.id} onClick={() => setForm({ ...form, plan: plan.id })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        form.plan === plan.id ? "border-blue bg-blue-50" : "border-border hover:border-gray-300"
                      }`}>
                      <p className="text-xs font-semibold capitalize">{plan.name}</p>
                      <p className="text-lg font-bold text-blue">₦{plan.price.toLocaleString()}</p>
                      <p className="text-[10px] text-text-4">/month</p>
                    </button>
                  ))}
                </div>
              </div>
              <Button disabled={!form.companyName || !form.domain} className="w-full gap-1.5">
                <Save size={14} /> Create Client
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
