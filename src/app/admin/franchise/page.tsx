"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Users, Store, Percent, DollarSign, Search, Plus,
  CheckCircle, XCircle, UserPlus, TrendingUp, MapPin,
  ChevronRight, ChevronDown, Hierarchy, Briefcase,
} from "lucide-react";

interface Agent {
  agent_id: string;
  full_name: string;
  agent_type: "franchise" | "reseller" | "agent" | "affiliate";
  commission_rate: number;
  territory: string;
  status: "active" | "inactive" | "suspended";
  total_sales: number;
  parent_agent: string | null;
  email: string;
  phone: string;
  joined_date: string;
}

interface MiniStore {
  store_name: string;
  store_slug: string;
  agent_id: string;
  agent_name: string;
  commission_rate: number;
  total_sales: number;
  is_active: boolean;
  created_at: string;
}

interface CommissionPayout {
  id: string;
  agent_id: string;
  agent_name: string;
  amount: number;
  period: string;
  status: "paid" | "pending" | "processing";
  paid_date: string | null;
}

const seedAgents: Agent[] = [
  { agent_id: "AGT-001", full_name: "Lagos Main Franchise", agent_type: "franchise", commission_rate: 8, territory: "Lagos State", status: "active", total_sales: 28400000, parent_agent: null, email: "lagos@kauvex.com", phone: "+234-801-234-5678", joined_date: "2024-01-15" },
  { agent_id: "AGT-002", full_name: "Port Harcourt Hub", agent_type: "franchise", commission_rate: 7.5, territory: "Rivers State", status: "active", total_sales: 18600000, parent_agent: null, email: "ph@kauvex.com", phone: "+234-802-345-6789", joined_date: "2024-02-20" },
  { agent_id: "AGT-003", full_name: "Abuja Capital Resellers", agent_type: "reseller", commission_rate: 10, territory: "FCT Abuja", status: "active", total_sales: 12500000, parent_agent: "AGT-001", email: "abuja@kauvex.com", phone: "+234-803-456-7890", joined_date: "2024-03-10" },
  { agent_id: "AGT-004", full_name: "Warri Security Solutions", agent_type: "reseller", commission_rate: 9, territory: "Delta State", status: "active", total_sales: 9200000, parent_agent: "AGT-002", email: "warri@kauvex.com", phone: "+234-804-567-8901", joined_date: "2024-04-05" },
  { agent_id: "AGT-005", full_name: "Calabar Affiliate Network", agent_type: "affiliate", commission_rate: 12, territory: "Cross River", status: "active", total_sales: 5600000, parent_agent: "AGT-001", email: "calabar@kauvex.com", phone: "+234-805-678-9012", joined_date: "2024-05-12" },
  { agent_id: "AGT-006", full_name: "Ibadan Tech Agents", agent_type: "agent", commission_rate: 6, territory: "Oyo State", status: "active", total_sales: 7800000, parent_agent: "AGT-001", email: "ibadan@kauvex.com", phone: "+234-806-789-0123", joined_date: "2024-06-01" },
  { agent_id: "AGT-007", full_name: "Enugu East Resellers", agent_type: "reseller", commission_rate: 8.5, territory: "Enugu State", status: "active", total_sales: 4300000, parent_agent: "AGT-002", email: "enugu@kauvex.com", phone: "+234-807-890-1234", joined_date: "2024-07-18" },
  { agent_id: "AGT-008", full_name: "Kano Northern Hub", agent_type: "franchise", commission_rate: 7, territory: "Kano State", status: "inactive", total_sales: 2100000, parent_agent: null, email: "kano@kauvex.com", phone: "+234-808-901-2345", joined_date: "2024-08-22" },
  { agent_id: "AGT-009", full_name: "Benin City Agents", agent_type: "agent", commission_rate: 5.5, territory: "Edo State", status: "active", total_sales: 3400000, parent_agent: "AGT-002", email: "benin@kauvex.com", phone: "+234-809-012-3456", joined_date: "2024-09-10" },
  { agent_id: "AGT-010", full_name: "Online Affiliate Pro", agent_type: "affiliate", commission_rate: 15, territory: "National (Online)", status: "active", total_sales: 18900000, parent_agent: null, email: "online@kauvex.com", phone: "+234-810-123-4567", joined_date: "2024-01-20" },
];

const seedMiniStores: MiniStore[] = [
  { store_name: "Lagos Security Mart", store_slug: "lagos-security", agent_id: "AGT-001", agent_name: "Lagos Main Franchise", commission_rate: 8, total_sales: 12800000, is_active: true, created_at: "2024-03-01" },
  { store_name: "PH Marine & Safety", store_slug: "ph-marine", agent_id: "AGT-002", agent_name: "Port Harcourt Hub", commission_rate: 7.5, total_sales: 9200000, is_active: true, created_at: "2024-04-15" },
  { store_name: "Abuja Tech Store", store_slug: "abuja-tech", agent_id: "AGT-003", agent_name: "Abuja Capital Resellers", commission_rate: 10, total_sales: 5600000, is_active: true, created_at: "2024-05-01" },
  { store_name: "Warri Fire Safety", store_slug: "warri-fire", agent_id: "AGT-004", agent_name: "Warri Security Solutions", commission_rate: 9, total_sales: 3400000, is_active: true, created_at: "2024-06-01" },
  { store_name: "Calabar Marine Store", store_slug: "calabar-marine", agent_id: "AGT-005", agent_name: "Calabar Affiliate Network", commission_rate: 12, total_sales: 1800000, is_active: true, created_at: "2024-07-01" },
  { store_name: "Ibadan CCTV Hub", store_slug: "ibadan-cctv", agent_id: "AGT-006", agent_name: "Ibadan Tech Agents", commission_rate: 6, total_sales: 4200000, is_active: true, created_at: "2024-08-01" },
  { store_name: "Kano Northern Mart", store_slug: "kano-mart", agent_id: "AGT-008", agent_name: "Kano Northern Hub", commission_rate: 7, total_sales: 0, is_active: false, created_at: "2024-09-01" },
  { store_name: "Benin Safety Store", store_slug: "benin-safety", agent_id: "AGT-009", agent_name: "Benin City Agents", commission_rate: 5.5, total_sales: 950000, is_active: true, created_at: "2024-10-01" },
];

const seedPayouts: CommissionPayout[] = [
  { id: "PAY-001", agent_id: "AGT-001", agent_name: "Lagos Main Franchise", amount: 1890000, period: "May 2026", status: "paid", paid_date: "2026-06-05" },
  { id: "PAY-002", agent_id: "AGT-002", agent_name: "Port Harcourt Hub", amount: 1120000, period: "May 2026", status: "paid", paid_date: "2026-06-05" },
  { id: "PAY-003", agent_id: "AGT-003", agent_name: "Abuja Capital Resellers", amount: 890000, period: "May 2026", status: "processing", paid_date: null },
  { id: "PAY-004", agent_id: "AGT-010", agent_name: "Online Affiliate Pro", amount: 2100000, period: "May 2026", status: "pending", paid_date: null },
  { id: "PAY-005", agent_id: "AGT-005", agent_name: "Calabar Affiliate Network", amount: 560000, period: "May 2026", status: "paid", paid_date: "2026-06-04" },
  { id: "PAY-006", agent_id: "AGT-004", agent_name: "Warri Security Solutions", amount: 720000, period: "April 2026", status: "paid", paid_date: "2026-05-05" },
  { id: "PAY-007", agent_id: "AGT-006", agent_name: "Ibadan Tech Agents", amount: 410000, period: "April 2026", status: "paid", paid_date: "2026-05-05" },
  { id: "PAY-008", agent_id: "AGT-007", agent_name: "Enugu East Resellers", amount: 320000, period: "April 2026", status: "paid", paid_date: "2026-05-05" },
];

const applications = [
  { id: "APP-001", full_name: "Blessing Okoro", email: "blessing@email.com", agent_type: "reseller", territory: "Anambra", status: "pending", submitted: "2026-06-14" },
  { id: "APP-002", full_name: "Ahmed Bello", email: "ahmed@email.com", agent_type: "franchise", territory: "Kaduna", status: "under_review", submitted: "2026-06-13" },
  { id: "APP-003", full_name: "Chidi Obi", email: "chidi@email.com", agent_type: "agent", territory: "Imo", status: "approved", submitted: "2026-06-10" },
  { id: "APP-004", full_name: "Rashidat Abdul", email: "rashidat@email.com", agent_type: "affiliate", territory: "National", status: "rejected", submitted: "2026-06-08" },
  { id: "APP-005", full_name: "Peter Thompson", email: "peter@email.com", agent_type: "reseller", territory: "Akwa Ibom", status: "pending", submitted: "2026-06-07" },
];

export default function FranchisePage() {
  const [activeTab, setActiveTab] = useState<"agents" | "stores" | "commissions" | "applications">("agents");
  const [search, setSearch] = useState("");
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const totalAgents = seedAgents.length;
  const activeAgents = seedAgents.filter((a) => a.status === "active").length;
  const totalMiniStores = seedMiniStores.filter((s) => s.is_active).length;
  const totalCommissionPaid = seedPayouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  const kpis = [
    { label: "Total Agents", value: totalAgents.toString(), change: `+${activeAgents} active`, trend: "up", icon: Users, color: "text-blue", bg: "bg-blue/10" },
    { label: "Active Agents", value: activeAgents.toString(), change: `${Math.round((activeAgents / totalAgents) * 100)}% rate`, trend: "up", icon: UserPlus, color: "text-green-600", bg: "bg-green-50" },
    { label: "Mini Stores", value: totalMiniStores.toString(), change: "+2 this month", trend: "up", icon: Store, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Commission Paid", value: `₦${(totalCommissionPaid / 1e6).toFixed(1)}M`, change: "+18.3%", trend: "up", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const getAgentTypeBadge = (type: string) => {
    switch (type) {
      case "franchise": return { bg: "bg-purple-50", text: "text-purple-600", label: "Franchise" };
      case "reseller": return { bg: "bg-blue/10", text: "text-blue", label: "Reseller" };
      case "agent": return { bg: "bg-green-50", text: "text-green-600", label: "Agent" };
      case "affiliate": return { bg: "bg-orange/10", text: "text-orange", label: "Affiliate" };
      default: return { bg: "bg-gray-100", text: "text-text-4", label: type };
    }
  };

  const formatSales = (n: number) => {
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return `₦${n.toLocaleString()}`;
  };

  const filteredAgents = seedAgents.filter((a) =>
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.agent_id.toLowerCase().includes(search.toLowerCase()) ||
    a.territory.toLowerCase().includes(search.toLowerCase())
  );

  const getChildren = (parentId: string | null) => seedAgents.filter((a) => a.parent_agent === parentId);

  return (
    <AdminShell title="Franchise & Reseller Network" subtitle="Manage agents, mini stores, and commission payouts">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={16} className={kpi.color} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.trend === "up" ? "text-green-600" : "text-red"}`}>{kpi.change}</span>
            </div>
            <p className="text-lg font-bold text-text-1">{kpi.value}</p>
            <p className="text-[10px] text-text-4 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {[
          { id: "agents" as const, label: "Agents", icon: Users },
          { id: "stores" as const, label: "Mini Stores", icon: Store },
          { id: "commissions" as const, label: "Commissions", icon: DollarSign },
          { id: "applications" as const, label: "Applications", icon: UserPlus },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "agents" && (
        <div className="space-y-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search agents..." className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
          </div>

          {/* Hierarchy root (agents with no parent) */}
          {getChildren(null).map((root) => {
            const badge = getAgentTypeBadge(root.agent_type);
            const children = getChildren(root.agent_id);
            return (
              <div key={root.agent_id}>
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue/30 transition-colors cursor-pointer" onClick={() => setExpandedAgent(expandedAgent === root.agent_id ? null : root.agent_id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue/10 flex items-center justify-center"><Briefcase size={18} className="text-blue" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-text-1">{root.full_name}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-text-4 mt-0.5">
                          <span>{root.agent_id}</span>
                          <span>{root.territory}</span>
                          <span>{root.commission_rate}% commission</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-text-1">{formatSales(root.total_sales)}</p>
                        <p className="text-[9px] text-text-4">Total Sales</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${root.status === "active" ? "bg-green-50 text-green-600" : root.status === "inactive" ? "bg-gray-100 text-text-4" : "bg-red/10 text-red"}`}>{root.status}</span>
                      {children.length > 0 && (expandedAgent === root.agent_id ? <ChevronDown size={16} className="text-text-4" /> : <ChevronRight size={16} className="text-text-4" />)}
                    </div>
                  </div>
                </div>
                {/* Children */}
                {expandedAgent === root.agent_id && children.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2 border-l-2 border-blue/20 pl-4">
                    {children.map((child) => {
                      const childBadge = getAgentTypeBadge(child.agent_type);
                      return (
                        <div key={child.agent_id} className="bg-white rounded-xl border border-gray-200 p-3 hover:border-gray-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center"><UserPlus size={14} className="text-purple-600" /></div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-text-1">{child.full_name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${childBadge.bg} ${childBadge.text}`}>{childBadge.label}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-text-4">
                                  <span>{child.territory}</span>
                                  <span>•</span>
                                  <span>{child.commission_rate}% rate</span>
                                  <span>•</span>
                                  <span>Parent: {root.full_name}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-bold">{formatSales(child.total_sales)}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${child.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-text-4"}`}>{child.status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "stores" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-text-1">Mini Stores</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue text-white text-xs font-medium rounded-lg hover:bg-blue-600"><Plus size={12} /> Add Store</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Store Name", "Slug", "Agent", "Commission", "Total Sales", "Status", "Created", ""].map((h) => (
                    <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seedMiniStores.map((store) => (
                  <tr key={store.store_slug} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 font-medium text-text-1">{store.store_name}</td>
                    <td className="p-3 font-mono text-xs text-blue">{store.store_slug}</td>
                    <td className="p-3 text-text-2 text-xs">{store.agent_name}</td>
                    <td className="p-3">{store.commission_rate}%</td>
                    <td className="p-3 font-semibold">{formatSales(store.total_sales)}</td>
                    <td className="p-3">{store.is_active ? <span className="text-green-600 text-xs font-medium">Active</span> : <span className="text-text-4 text-xs">Inactive</span>}</td>
                    <td className="p-3 text-xs text-text-4">{new Date(store.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "commissions" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-text-1">Commission Payouts</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue text-white text-xs font-medium rounded-lg hover:bg-blue-600"><DollarSign size={12} /> Process Payouts</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Payout ID", "Agent", "Amount", "Period", "Status", "Paid Date", ""].map((h) => (
                    <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seedPayouts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs font-semibold text-blue">{p.id}</td>
                    <td className="p-3 text-text-2">{p.agent_name}</td>
                    <td className="p-3 font-semibold">₦{p.amount.toLocaleString()}</td>
                    <td className="p-3 text-text-3 text-xs">{p.period}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === "paid" ? "bg-green-50 text-green-600" :
                        p.status === "processing" ? "bg-blue/10 text-blue" : "bg-yellow-50 text-yellow-600"
                      }`}>{p.status}</span>
                    </td>
                    <td className="p-3 text-xs text-text-4">{p.paid_date ? new Date(p.paid_date).toLocaleDateString() : "—"}</td>
                    <td className="p-3"><button className="text-xs text-blue hover:underline">{p.status === "pending" ? "Process" : "View"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "applications" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-text-1">Agent Applications</h3>
            <span className="text-xs text-text-4">{applications.filter((a) => a.status === "pending").length} pending</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Application ID", "Full Name", "Email", "Type", "Territory", "Submitted", "Status", ""].map((h) => (
                    <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const badge = getAgentTypeBadge(app.agent_type);
                  return (
                    <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs font-semibold text-blue">{app.id}</td>
                      <td className="p-3 font-medium text-text-1">{app.full_name}</td>
                      <td className="p-3 text-text-2 text-xs">{app.email}</td>
                      <td className="p-3"><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span></td>
                      <td className="p-3 text-text-3 text-xs">{app.territory}</td>
                      <td className="p-3 text-xs text-text-4">{new Date(app.submitted).toLocaleDateString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          app.status === "approved" ? "bg-green-50 text-green-600" :
                          app.status === "rejected" ? "bg-red/10 text-red" :
                          app.status === "under_review" ? "bg-blue/10 text-blue" : "bg-yellow-50 text-yellow-600"
                        }`}>{app.status.replace("_", " ")}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {app.status === "pending" && <><button className="text-xs text-green-600 hover:underline">Approve</button><span className="text-text-4">/</span><button className="text-xs text-red hover:underline">Reject</button></>}
                          {app.status !== "pending" && <button className="text-xs text-blue hover:underline">View</button>}
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
    </AdminShell>
  );
}
