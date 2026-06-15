"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Mail, Plus, Search, Send, BarChart3, FileText,
  Users, TrendingUp, Clock, Eye, MousePointerClick,
  AlertCircle, CheckCircle, XCircle, Edit3, Copy,
  Trash2, Play, Pause, List, Template,
} from "lucide-react";

interface CampaignItem {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent";
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  revenue: number;
  scheduled_at?: string;
  sent_at?: string;
}

interface TemplateItem {
  id: string;
  name: string;
  subject: string;
  category: string;
  is_system: boolean;
}

interface MailingList {
  id: string;
  name: string;
  subscriber_count: number;
  description: string;
}

interface Subscriber {
  email: string;
  name: string;
  status: "active" | "unsubscribed" | "bounced";
  subscribed_at: string;
}

const seedCampaigns: CampaignItem[] = [
  { id: "CAM-001", name: "June Security Specials", subject: "30% Off All Security Cameras - This Week Only!", status: "sent", sent_count: 24500, opened_count: 8230, clicked_count: 2450, revenue: 4850000, sent_at: "2026-06-10T10:00:00" },
  { id: "CAM-002", name: "Marine Equipment Clearance", subject: "End-of-Season Marine Sale - Up to 40% Off", status: "sending", sent_count: 18200, opened_count: 0, clicked_count: 0, revenue: 0, scheduled_at: "2026-06-16T09:00:00" },
  { id: "CAM-003", name: "Welcome Series - New Customers", subject: "Welcome to Kauvex! 10% Off Your First Order", status: "sent", sent_count: 3800, opened_count: 2640, clicked_count: 980, revenue: 1280000, sent_at: "2026-06-08T08:00:00" },
  { id: "CAM-004", name: "Abandoned Cart Recovery", subject: "You Left Something Behind - Complete Your Order Now", status: "sent", sent_count: 4200, opened_count: 1890, clicked_count: 756, revenue: 2340000, sent_at: "2026-06-12T14:00:00" },
  { id: "CAM-005", name: "B2B Bulk Discount Offer", subject: "Corporate Pricing: Save Big on Bulk Orders", status: "draft", sent_count: 0, opened_count: 0, clicked_count: 0, revenue: 0 },
  { id: "CAM-006", name: "New Storefront Launch", subject: "Now in Port Harcourt! Grand Opening Specials", status: "scheduled", sent_count: 0, opened_count: 0, clicked_count: 0, revenue: 0, scheduled_at: "2026-06-20T10:00:00" },
  { id: "CAM-007", name: "Friday Flash Sale", subject: "24-Hour Flash Sale - Everything Ships Free!", status: "draft", sent_count: 0, opened_count: 0, clicked_count: 0, revenue: 0 },
  { id: "CAM-008", name: "Customer Feedback Survey", subject: "How Was Your Experience? Share and Win N50,000", status: "sent", sent_count: 8900, opened_count: 3560, clicked_count: 1420, revenue: 0, sent_at: "2026-06-05T11:00:00" },
];

const seedTemplates: TemplateItem[] = [
  { id: "TPL-001", name: "Promotional Blast", subject: "{{title}} - Don't Miss Out!", category: "Promotions", is_system: true },
  { id: "TPL-002", name: "Abandoned Cart", subject: "You left items in your cart!", category: "Cart Recovery", is_system: true },
  { id: "TPL-003", name: "Welcome Email", subject: "Welcome to {{store_name}}!", category: "Onboarding", is_system: true },
  { id: "TPL-004", name: "Newsletter Generic", subject: "{{month}} Newsletter - What's New", category: "Newsletter", is_system: false },
  { id: "TPL-005", name: "Order Confirmation", subject: "Order #{{order_id}} Confirmed", category: "Transactional", is_system: true },
];

const seedLists: MailingList[] = [
  { id: "LST-001", name: "All Customers", subscriber_count: 45200, description: "All registered customers who opted in" },
  { id: "LST-002", name: "B2B Prospects", subscriber_count: 3200, description: "Business accounts and corporate leads" },
  { id: "LST-003", name: "Newsletter Subscribers", subscriber_count: 28400, description: "Users who subscribed via newsletter signup" },
];

const seedSubscribers: Record<string, Subscriber[]> = {
  "LST-001": [
    { email: "john.doe@example.com", name: "John Doe", status: "active", subscribed_at: "2025-01-15" },
    { email: "sarah.ahmed@example.com", name: "Sarah Ahmed", status: "active", subscribed_at: "2025-02-20" },
    { email: "michael.ok@example.com", name: "Michael Okafor", status: "active", subscribed_at: "2025-03-10" },
    { email: "chioma.eze@example.com", name: "Chioma Eze", status: "unsubscribed", subscribed_at: "2025-01-05" },
    { email: "tunde.balogun@example.com", name: "Tunde Balogun", status: "active", subscribed_at: "2025-04-01" },
    { email: "fatima.usman@example.com", name: "Fatima Usman", status: "active", subscribed_at: "2025-05-12" },
    { email: "emeka.nwosu@example.com", name: "Emeka Nwosu", status: "bounced", subscribed_at: "2025-03-22" },
    { email: "grace.okonkwo@example.com", name: "Grace Okonkwo", status: "active", subscribed_at: "2025-06-08" },
  ],
  "LST-002": [
    { email: "daniel.martins@company.com", name: "Daniel Martins", status: "active", subscribed_at: "2025-04-10" },
    { email: "aisha.bello@company.com", name: "Aisha Bello", status: "active", subscribed_at: "2025-05-01" },
    { email: "kenny.adeyemi@biz.com", name: "Kenny Adeyemi", status: "active", subscribed_at: "2025-05-20" },
    { email: "ngozi.umeh@corp.com", name: "Ngozi Umeh", status: "unsubscribed", subscribed_at: "2025-02-15" },
    { email: "sekina.abdul@traders.com", name: "Sekina Abdul", status: "active", subscribed_at: "2025-06-01" },
  ],
  "LST-003": [
    { email: "newsletter.fan@example.com", name: "Newsletter Fan", status: "active", subscribed_at: "2025-06-01" },
    { email: "deals.seeker@example.com", name: "Deals Seeker", status: "active", subscribed_at: "2025-06-05" },
    { email: "promo.lover@example.com", name: "Promo Lover", status: "active", subscribed_at: "2025-06-10" },
    { email: "bargain.hunter@example.com", name: "Bargain Hunter", status: "unsubscribed", subscribed_at: "2025-04-20" },
    { email: "shop.kauvex@example.com", name: "Shop Kauvex", status: "active", subscribed_at: "2025-06-15" },
  ],
};

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "templates" | "lists" | "analytics">("campaigns");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", template: "", schedule: "", list: "" });

  const totalCampaigns = seedCampaigns.length;
  const totalSent = seedCampaigns.reduce((s, c) => s + c.sent_count, 0);
  const totalOpened = seedCampaigns.reduce((s, c) => s + c.opened_count, 0);
  const totalClicked = seedCampaigns.reduce((s, c) => s + c.clicked_count, 0);
  const overallOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const overallClickRate = totalOpened > 0 ? Math.round((totalClicked / totalOpened) * 100) : 0;
  const bouncedCount = Object.values(seedSubscribers).flat().filter((s) => s.status === "bounced").length;
  const bounceRate = totalSent > 0 ? Math.round((bouncedCount / totalSent) * 10000) / 100 : 0;

  const kpis = [
    { label: "Total Campaigns", value: totalCampaigns.toString(), change: "+3 this month", trend: "up", icon: Mail, color: "text-blue", bg: "bg-blue/10" },
    { label: "Sent", value: totalSent.toLocaleString(), change: "+12.4% vs last month", trend: "up", icon: Send, color: "text-green-600", bg: "bg-green-50" },
    { label: "Open Rate", value: `${overallOpenRate}%`, change: overallOpenRate >= 20 ? "Good" : "Needs improvement", trend: overallOpenRate >= 20 ? "up" : "down", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Click Rate", value: `${overallClickRate}%`, change: overallClickRate >= 15 ? "On target" : "Below target", trend: overallClickRate >= 15 ? "up" : "down", icon: MousePointerClick, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Bounce Rate", value: `${bounceRate}%`, change: "-0.8% from last month", trend: "up", icon: AlertCircle, color: "text-red", bg: "bg-red/10" },
  ];

  const filteredCampaigns = seedCampaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent": return { bg: "bg-green-50", text: "text-green-600", icon: CheckCircle };
      case "sending": return { bg: "bg-blue/10", text: "text-blue", icon: Play };
      case "scheduled": return { bg: "bg-purple-50", text: "text-purple-600", icon: Clock };
      case "draft": return { bg: "bg-gray-100", text: "text-text-4", icon: FileText };
      default: return { bg: "bg-gray-100", text: "text-text-4", icon: FileText };
    }
  };

  return (
    <AdminShell title="Email Marketing" subtitle="Campaigns, templates, and subscriber management">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
          { id: "campaigns" as const, label: "Campaigns", icon: Mail },
          { id: "templates" as const, label: "Templates", icon: FileText },
          { id: "lists" as const, label: "Lists", icon: Users },
          { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "campaigns" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns..." className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
            </div>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600"><Plus size={14} /> New Campaign</button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Campaign", "Subject", "Status", "Sent", "Opens", "Clicks", "Revenue", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c) => {
                    const badge = getStatusBadge(c.status);
                    return (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-3 font-medium text-text-1">{c.name}</td>
                        <td className="p-3 text-text-2 text-xs max-w-xs truncate">{c.subject}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <badge.icon size={10} className={badge.text} />
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.bg} ${badge.text}`}>{c.status}</span>
                          </div>
                        </td>
                        <td className="p-3">{c.sent_count.toLocaleString()}</td>
                        <td className="p-3">{c.opened_count.toLocaleString()}</td>
                        <td className="p-3">{c.clicked_count.toLocaleString()}</td>
                        <td className="p-3 font-semibold">{c.revenue > 0 ? `₦${(c.revenue / 1e6).toFixed(1)}M` : "—"}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <button className="p-1 hover:bg-gray-100 rounded"><Edit3 size={12} className="text-text-4" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><Copy size={12} className="text-text-4" /></button>
                            <button className="p-1 hover:bg-gray-100 rounded"><Trash2 size={12} className="text-red/60" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {showCreate && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
              <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-sm mb-4">New Campaign</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Campaign Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. June Sale" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Email Subject</label>
                    <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Don't Miss Our Big Sale!" className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Template</label>
                    <select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue">
                      <option value="">Select template</option>
                      {seedTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Recipient List</label>
                    <select value={form.list} onChange={(e) => setForm({ ...form, list: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue">
                      <option value="">Select list</option>
                      {seedLists.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.subscriber_count.toLocaleString()})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-text-4 block mb-1 font-medium">Schedule (optional)</label>
                    <input type="datetime-local" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-blue text-white text-sm font-medium rounded-lg hover:bg-blue-600">Create Campaign</button>
                  <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "templates" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-text-1">Email Templates</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue text-white text-xs font-medium rounded-lg hover:bg-blue-600"><Plus size={12} /> Add Template</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Name", "Default Subject", "Category", "System", ""].map((h) => (
                    <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seedTemplates.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-3 font-medium text-text-1">{t.name}</td>
                    <td className="p-3 text-text-2 text-xs font-mono">{t.subject}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue/10 text-blue text-[10px] font-semibold rounded-full">{t.category}</span>
                    </td>
                    <td className="p-3">{t.is_system ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-text-4" />}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded"><Edit3 size={12} className="text-text-4" /></button>
                        <button className="p-1 hover:bg-gray-100 rounded"><Copy size={12} className="text-text-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "lists" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-3">
            {seedLists.map((l) => (
              <div key={l.id} onClick={() => setSelectedList(selectedList === l.id ? null : l.id)} className={`bg-white rounded-xl p-4 border cursor-pointer transition-colors ${selectedList === l.id ? "border-blue bg-blue/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Users size={18} className="text-purple-600" /></div>
                  <div>
                    <h4 className="font-semibold text-sm text-text-1">{l.name}</h4>
                    <p className="text-xs text-text-4">{l.subscriber_count.toLocaleString()} subscribers</p>
                  </div>
                </div>
                <p className="text-[10px] text-text-4 mt-2">{l.description}</p>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
            {selectedList ? (
              <>
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{seedLists.find((l) => l.id === selectedList)?.name} — Subscribers</h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                    <input type="text" placeholder="Search..." className="w-48 h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Email", "Name", "Status", "Subscribed"].map((h) => (
                          <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {seedSubscribers[selectedList]?.map((s) => (
                        <tr key={s.email} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-3 text-text-2 text-xs">{s.email}</td>
                          <td className="p-3 font-medium text-text-1">{s.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.status === "active" ? "bg-green-50 text-green-600" :
                              s.status === "unsubscribed" ? "bg-gray-100 text-text-4" : "bg-red/10 text-red"
                            }`}>{s.status}</span>
                          </td>
                          <td className="p-3 text-xs text-text-4">{new Date(s.subscribed_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-text-4 text-sm">Select a list to view subscribers</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Performance */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-sm mb-4">Campaign Performance</h3>
            <div className="space-y-4">
              {seedCampaigns.filter((c) => c.status === "sent").slice(0, 5).map((c) => {
                const openRate = c.sent_count > 0 ? Math.round((c.opened_count / c.sent_count) * 100) : 0;
                const clickRate = c.opened_count > 0 ? Math.round((c.clicked_count / c.opened_count) * 100) : 0;
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-text-1 truncate max-w-[200px]">{c.name}</span>
                      <span className="text-xs text-text-4">{openRate}% open / {clickRate}% click</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="bg-blue rounded-l-full" style={{ width: `${openRate}%` }} title={`Open: ${openRate}%`} />
                      <div className="bg-orange rounded-r-full" style={{ width: `${clickRate}%` }} title={`Click: ${clickRate}%`} />
                      <div className="flex-1 bg-gray-100 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-4 mt-0.5">
                      <span>Sent: {c.sent_count.toLocaleString()}</span>
                      <span>Revenue: {c.revenue > 0 ? `₦${(c.revenue / 1e6).toFixed(1)}M` : "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List Growth */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-sm mb-4">Mailing List Growth</h3>
            <div className="space-y-3">
              {seedLists.map((l) => (
                <div key={l.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-2">{l.name}</span>
                    <span className="text-text-4 font-medium">{l.subscriber_count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(l.subscriber_count / Math.max(...seedLists.map((x) => x.subscriber_count))) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-xs text-text-3">
              <strong className="text-purple-600">Total:</strong> {seedLists.reduce((s, l) => s + l.subscriber_count, 0).toLocaleString()} subscribers across all lists
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-sm mb-4">Campaign Status Distribution</h3>
            <div className="grid grid-cols-2 gap-3">
              {["draft", "scheduled", "sending", "sent"].map((status) => {
                const count = seedCampaigns.filter((c) => c.status === status).length;
                const pct = Math.round((count / totalCampaigns) * 100);
                const colors: Record<string, string> = { draft: "bg-gray-400", scheduled: "bg-purple-500", sending: "bg-blue", sent: "bg-green-500" };
                return (
                  <div key={status} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${colors[status]} mx-auto mb-1`} />
                    <p className="text-lg font-bold text-text-1">{count}</p>
                    <p className="text-[10px] text-text-4 capitalize">{status}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Insight */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-green-600" /> Insights</h3>
            <div className="space-y-3 text-sm text-text-2">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-700">Best Performer</p>
                <p className="text-xs text-green-600 mt-0.5">{'\u201C'}Welcome Series - New Customers{'\u201D'} has the highest open rate at 69.5%.</p>
              </div>
              <div className="p-3 bg-blue/5 rounded-lg">
                <p className="font-medium text-blue">Revenue Impact</p>
                <p className="text-xs text-text-3 mt-0.5">Email campaigns generated ₦8.47M in attributed revenue this month.</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-700">Needs Attention</p>
                <p className="text-xs text-yellow-600 mt-0.5">B2B Bulk Discount Offer is still in draft. Consider scheduling for next week.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
