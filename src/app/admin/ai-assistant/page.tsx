"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Bot, MessageSquare, TrendingUp, Clock, ThumbsUp, Search,
  ChevronDown, ChevronUp, BarChart3, Settings, Activity,
  Sparkles, User, Tag, Globe, ShoppingCart, Zap, AlertCircle,
  CheckCircle, XCircle,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  user: string;
  session_id: string;
  context_type: string;
  message_count: number;
  date: string;
  status: "active" | "resolved" | "abandoned";
  messages: ChatMessage[];
  satisfaction?: number;
}

const seedConversations: Conversation[] = [
  {
    id: "1", user: "John Doe", session_id: "SESS-001", context_type: "product_search", message_count: 8, date: "2026-06-15T10:30:00", status: "resolved",
    satisfaction: 5,
    messages: [
      { role: "user", content: "I'm looking for a marine GPS navigator", timestamp: "10:30 AM" },
      { role: "assistant", content: "I found several marine GPS options. Our top recommendation is the Marine GPS Navigator (GPS-NAV) at ₦350,000. Would you like details?", timestamp: "10:30 AM" },
      { role: "user", content: "Yes, tell me more about it", timestamp: "10:31 AM" },
      { role: "assistant", content: "The Marine GPS Navigator features a 7-inch touchscreen, preloaded coastal maps, GPS/GLONASS support, and IPX7 waterproof rating. It's our bestseller for marine navigation.", timestamp: "10:31 AM" },
      { role: "user", content: "What about warranty?", timestamp: "10:32 AM" },
      { role: "assistant", content: "It comes with a 2-year manufacturer warranty and free installation support. Would you like to add it to your cart?", timestamp: "10:32 AM" },
      { role: "user", content: "Yes please", timestamp: "10:33 AM" },
      { role: "assistant", content: "Done! I've added 1x Marine GPS Navigator to your cart. You can proceed to checkout or continue shopping.", timestamp: "10:33 AM" },
      { role: "user", content: "Thanks!", timestamp: "10:34 AM" },
    ],
  },
  {
    id: "2", user: "Sarah Ahmed", session_id: "SESS-002", context_type: "order_status", message_count: 5, date: "2026-06-15T09:15:00", status: "resolved",
    messages: [
      { role: "user", content: "Where is my order #ORD-2026-0842?", timestamp: "9:15 AM" },
      { role: "assistant", content: "Let me check that for you. Order #ORD-2026-0842 is currently out for delivery and expected to arrive within 2 hours.", timestamp: "9:15 AM" },
      { role: "user", content: "Can I change the delivery address?", timestamp: "9:17 AM" },
      { role: "assistant", content: "Since it's already out for delivery, I can route it back to the depot for pickup instead. Alternatively, you can contact the driver directly.", timestamp: "9:17 AM" },
      { role: "user", content: "I'll pick it up from the depot", timestamp: "9:18 AM" },
      { role: "assistant", content: "Noted! I've updated your order for depot pickup at our VI Island location. You'll receive an SMS when it's ready.", timestamp: "9:18 AM" },
    ],
  },
  {
    id: "3", user: "Michael Okafor", session_id: "SESS-003", context_type: "product_inquiry", message_count: 12, date: "2026-06-14T14:00:00", status: "active",
    messages: [
      { role: "user", content: "Do you have Hikvision 4MP dome cameras in stock?" },
      { role: "assistant", content: "Yes! We have the Hikvision 4MP Dome Camera (HKV-4MP-D) in stock at ₦85,000. Quantity available: 47 units.", timestamp: "2:00 PM" },
      { role: "user", content: "What about the 8MP version?" },
      { role: "assistant", content: "The 8MP version is ₦145,000 with 23 units in stock. Would you like to compare features?" },
    ],
  },
  {
    id: "4", user: "Chioma Eze", session_id: "SESS-004", context_type: "returns", message_count: 6, date: "2026-06-14T11:45:00", status: "resolved",
    satisfaction: 4,
    messages: [
      { role: "user", content: "I need to return a fire extinguisher I bought last week" },
      { role: "assistant", content: "I'm sorry to hear that. Could you please provide your order number and the reason for return?" },
      { role: "user", content: "Order #ORD-2026-0791. It's a 9kg DCP but I need a 6kg instead" },
      { role: "assistant", content: "No problem! I've initiated a return. The driver will pick it up tomorrow between 10 AM and 2 PM. A replacement 6kg unit will be delivered at the same time." },
    ],
  },
  {
    id: "5", user: "Tunde Balogun", session_id: "SESS-005", context_type: "technical_support", message_count: 15, date: "2026-06-14T08:30:00", status: "active",
    messages: [
      { role: "user", content: "My DVR kit isn't recording properly" },
      { role: "assistant", content: "Let's troubleshoot. First, check if the hard drive is detected in the system settings. Go to Menu > Storage > HDD Management." },
      { role: "user", content: "It says no HDD detected" },
      { role: "assistant", content: "That indicates a connection issue. Please power off the unit, open the casing, and reseat the SATA cable on both ends." },
    ],
  },
  {
    id: "6", user: "Fatima Usman", session_id: "SESS-006", context_type: "checkout_help", message_count: 4, date: "2026-06-13T16:20:00", status: "resolved",
    satisfaction: 5,
    messages: [
      { role: "user", content: "I'm having trouble with the payment gateway" },
      { role: "assistant", content: "I can help with that. What payment method are you trying to use?" },
      { role: "user", content: "Bank transfer, but it's not showing the account details" },
      { role: "assistant", content: "Please try clearing your browser cache or use incognito mode. If the issue persists, use this direct account: GTBank 0123456789 — Kauvex Commerce Ltd." },
    ],
  },
  {
    id: "7", user: "Emeka Nwosu", session_id: "SESS-007", context_type: "product_search", message_count: 9, date: "2026-06-13T13:10:00", status: "abandoned",
    messages: [
      { role: "user", content: "Looking for access control systems" },
      { role: "assistant", content: "We have several options from ZKTeco. Our popular model is the ZKTeco Access Control at ₦125,000 with fingerprint and RFID support." },
      { role: "user", content: "Do you have face recognition ones?" },
      { role: "assistant", content: "Yes! The ZKTeco FaceRec model is ₦245,000 with infrared temperature screening capability. Would you like a quote?" },
    ],
  },
  {
    id: "8", user: "Grace Okonkwo", session_id: "SESS-008", context_type: "complaint", message_count: 7, date: "2026-06-12T10:00:00", status: "resolved",
    satisfaction: 3,
    messages: [
      { role: "user", content: "My order arrived damaged" },
      { role: "assistant", content: "I sincerely apologize for the inconvenience. Please share photos of the damaged item and we'll process a replacement immediately." },
      { role: "user", content: "I already sent photos via email" },
      { role: "assistant", content: "Thank you. I can see them now. A replacement has been scheduled for delivery tomorrow. We've also added a ₦5,000 voucher as compensation." },
    ],
  },
  {
    id: "9", user: "Daniel Martins", session_id: "SESS-009", context_type: "pricing", message_count: 6, date: "2026-06-12T09:30:00", status: "active",
    messages: [
      { role: "user", content: "Can you give me a bulk price for 10 units of the 4MP dome camera?" },
      { role: "assistant", content: "For bulk orders of 10+ units, we offer a 12% discount. That would bring the unit price down to ₦74,800 each." },
      { role: "user", content: "What about 50 units?" },
      { role: "assistant", content: "For 50+ units, the discount increases to 18%. I can prepare a formal quote for you." },
    ],
  },
  {
    id: "10", user: "Aisha Bello", session_id: "SESS-010", context_type: "account", message_count: 3, date: "2026-06-11T15:45:00", status: "resolved",
    satisfaction: 4,
    messages: [
      { role: "user", content: "I forgot my password" },
      { role: "assistant", content: "No worries! Please click the 'Forgot Password' link on the login page and enter your registered email. You'll receive a reset link within 2 minutes." },
      { role: "user", content: "Got it, thanks!" },
    ],
  },
  {
    id: "11", user: "Kenny Adeyemi", session_id: "SESS-011", context_type: "product_search", message_count: 10, date: "2026-06-11T14:00:00", status: "active",
    messages: [
      { role: "user", content: "I need a kitchen hood for a commercial kitchen" },
      { role: "assistant", content: "Our Kitchen Hood 90cm (KH-90) at ₦185,000 is suitable for commercial use. It has a 1200 CFM motor and stainless steel baffle filters." },
      { role: "user", content: "Does it come with installation?" },
      { role: "assistant", content: "Installation is available for ₦25,000 within Lagos. For other locations, we can arrange a certified installer." },
    ],
  },
  {
    id: "12", user: "Ngozi Umeh", session_id: "SESS-012", context_type: "order_status", message_count: 4, date: "2026-06-10T12:00:00", status: "resolved",
    satisfaction: 5,
    messages: [
      { role: "user", content: "Has my boat engine been shipped?" },
      { role: "assistant", content: "Your Yamaha 40HP Outboard Engine was shipped yesterday via KCV Logistics. Tracking number: KCV-2026-4421. Estimated delivery: Friday." },
      { role: "user", content: "Perfect, thank you!" },
    ],
  },
];

const popularQueries = [
  { query: "marine GPS", count: 187, completion: 92 },
  { query: "hikvision camera price", count: 156, completion: 88 },
  { query: "access control system", count: 134, completion: 85 },
  { query: "fire extinguisher", count: 112, completion: 91 },
  { query: "boat engine", count: 98, completion: 79 },
  { query: "kitchen hood", count: 87, completion: 94 },
  { query: "life jacket", count: 76, completion: 96 },
  { query: "cctv installation", count: 65, completion: 72 },
  { query: "order status", count: 54, completion: 98 },
  { query: "return policy", count: 43, completion: 95 },
];

const contextTypes = [
  { type: "product_search", label: "Product Search", icon: Search },
  { type: "order_status", label: "Order Status", icon: ShoppingCart },
  { type: "product_inquiry", label: "Product Inquiry", icon: Tag },
  { type: "returns", label: "Returns", icon: AlertCircle },
  { type: "technical_support", label: "Tech Support", icon: Activity },
  { type: "checkout_help", label: "Checkout Help", icon: Zap },
  { type: "complaint", label: "Complaint", icon: AlertCircle },
  { type: "pricing", label: "Pricing", icon: Tag },
  { type: "account", label: "Account", icon: User },
];

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<"conversations" | "analytics" | "settings">("conversations");
  const [search, setSearch] = useState("");
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalConversations = seedConversations.length;
  const avgResponseTime = "1.4s";
  const avgSatisfaction = seedConversations.filter((c) => c.satisfaction).reduce((s, c) => s + (c.satisfaction || 0), 0) / seedConversations.filter((c) => c.satisfaction).length || 0;
  const resolvedCount = seedConversations.filter((c) => c.status === "resolved").length;
  const completionRate = Math.round((resolvedCount / totalConversations) * 100);

  const filtered = seedConversations.filter((c) =>
    c.user.toLowerCase().includes(search.toLowerCase()) ||
    c.session_id.toLowerCase().includes(search.toLowerCase()) ||
    c.context_type.toLowerCase().includes(search.toLowerCase())
  );

  const getContextIcon = (type: string) => {
    const found = contextTypes.find((c) => c.type === type);
    return found ? found.icon : MessageSquare;
  };

  const getContextLabel = (type: string) => {
    const found = contextTypes.find((c) => c.type === type);
    return found ? found.label : type;
  };

  const kpis = [
    { label: "Total Conversations", value: totalConversations.toString(), change: "+18.5%", trend: "up", icon: MessageSquare, color: "text-blue", bg: "bg-blue/10" },
    { label: "Avg Response Time", value: avgResponseTime, change: "-0.3s", trend: "up", icon: Clock, color: "text-green-600", bg: "bg-green-50" },
    { label: "Satisfaction", value: `${avgSatisfaction.toFixed(1)}/5`, change: "+0.4", trend: "up", icon: ThumbsUp, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Completion Rate", value: `${completionRate}%`, change: "+5.2%", trend: "up", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <AdminShell title="AI Shopping Assistant" subtitle="Intelligent customer support and product recommendations">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {[
          { id: "conversations" as const, label: "Conversations", icon: MessageSquare },
          { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
          { id: "settings" as const, label: "Settings", icon: Settings },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "conversations" && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon size={16} className={kpi.color} />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.trend === "up" ? "text-green-600" : "text-red"}`}>
                    {kpi.trend === "up" ? "+" : ""}{kpi.change}
                  </span>
                </div>
                <p className="text-lg font-bold text-text-1">{kpi.value}</p>
                <p className="text-[10px] text-text-4 mt-0.5">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
          </div>

          {/* Conversation List */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-text-1">All Conversations</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["User", "Session", "Context", "Messages", "Date", "Status", "Rating", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((conv) => (
                    <>
                      <tr key={conv.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue/10 flex items-center justify-center"><User size={12} className="text-blue" /></div>
                            <span className="font-medium text-text-1">{conv.user}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-blue">{conv.session_id}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {(() => { const Icon = getContextIcon(conv.context_type); return <Icon size={12} className="text-text-4" />; })()}
                            <span className="text-text-2">{getContextLabel(conv.context_type)}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1"><MessageSquare size={12} className="text-text-4" /> {conv.message_count}</span>
                        </td>
                        <td className="p-3 text-text-3 text-xs">{new Date(conv.date).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            conv.status === "active" ? "bg-blue/10 text-blue" :
                            conv.status === "resolved" ? "bg-green-50 text-green-600" : "bg-gray-100 text-text-4"
                          }`}>{conv.status}</span>
                        </td>
                        <td className="p-3">
                          {conv.satisfaction ? (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i < conv.satisfaction! ? "bg-yellow-400" : "bg-gray-200"}`} />
                              ))}
                            </div>
                          ) : <span className="text-text-4 text-xs">—</span>}
                        </td>
                        <td className="p-3">
                          {expandedId === conv.id ? <ChevronUp size={14} className="text-text-4" /> : <ChevronDown size={14} className="text-text-4" />}
                        </td>
                      </tr>
                      {expandedId === conv.id && (
                        <tr key={`${conv.id}-expanded`}>
                          <td colSpan={8} className="p-4 bg-gray-50/50">
                            <div className="max-w-2xl mx-auto space-y-2">
                              {conv.messages.map((msg, i) => (
                                <div key={i} className={`flex gap-2 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-blue/10" : "bg-orange/10"}`}>
                                    {msg.role === "assistant" ? <Bot size={12} className="text-blue" /> : <User size={12} className="text-orange" />}
                                  </div>
                                  <div className={`max-w-[70%] p-2.5 rounded-xl text-xs ${msg.role === "assistant" ? "bg-white border border-gray-200 text-text-2" : "bg-blue text-white"}`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-[9px] mt-1 ${msg.role === "assistant" ? "text-text-4" : "text-white/60"}`}>{msg.timestamp || ""}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue/10 flex items-center justify-center"><Activity size={18} className="text-blue" /></div>
                <div><p className="text-sm font-semibold">Avg Session Length</p><p className="text-xs text-text-4">Per conversation</p></div>
              </div>
              <p className="text-2xl font-bold text-text-1">4m 32s</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle size={18} className="text-green-600" /></div>
                <div><p className="text-sm font-semibold">Resolution Rate</p><p className="text-xs text-text-4">First contact</p></div>
              </div>
              <p className="text-2xl font-bold text-text-1">72%</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center"><Sparkles size={18} className="text-purple-600" /></div>
                <div><p className="text-sm font-semibold">AI Suggestions Used</p><p className="text-xs text-text-4">This week</p></div>
              </div>
              <p className="text-2xl font-bold text-text-1">1,247</p>
            </div>
          </div>

          {/* Popular Queries */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-text-1">Popular Queries</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Query", "Count", "Completion Rate", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {popularQueries.map((q) => (
                    <tr key={q.query} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-medium text-text-1">{q.query}</td>
                      <td className="p-3">{q.count}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${q.completion >= 90 ? "bg-green-500" : q.completion >= 80 ? "bg-yellow-500" : "bg-red"}`} style={{ width: `${q.completion}%` }} />
                          </div>
                          <span className="text-xs font-medium">{q.completion}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {q.completion >= 90 ? <CheckCircle size={14} className="text-green-500" /> : q.completion >= 80 ? <AlertCircle size={14} className="text-yellow-500" /> : <XCircle size={14} className="text-red" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Context Distribution */}
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-sm mb-4">Context Type Distribution</h3>
            <div className="space-y-3">
              {contextTypes.map((ctx) => {
                const count = seedConversations.filter((c) => c.context_type === ctx.type).length;
                const pct = Math.round((count / totalConversations) * 100);
                return (
                  <div key={ctx.type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <ctx.icon size={14} className="text-text-4" />
                        <span className="text-text-2">{ctx.label}</span>
                      </div>
                      <span className="text-text-4">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Bot size={16} className="text-blue" /> AI Model Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Model</label>
                <select className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue">
                  <option>GPT-4o (Recommended)</option>
                  <option>GPT-4o Mini</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>Claude 3 Haiku</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Temperature</label>
                <input type="range" min="0" max="1" step="0.1" defaultValue="0.3" className="w-full" />
                <p className="text-[10px] text-text-4 mt-0.5">Lower values = more deterministic responses</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-1">Auto-Resolve Conversations</p>
                  <p className="text-xs text-text-4">Automatically mark as resolved after 24h of inactivity</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-blue flex items-center justify-start p-0.5 cursor-pointer"><div className="w-4 h-4 rounded-full bg-white shadow" /></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-1">Product Recommendations</p>
                  <p className="text-xs text-text-4">Suggest products based on conversation context</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-blue flex items-center justify-start p-0.5 cursor-pointer"><div className="w-4 h-4 rounded-full bg-white shadow" /></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-1">Sentiment Analysis</p>
                  <p className="text-xs text-text-4">Detect customer sentiment and escalate if negative</p>
                </div>
                <div className="w-10 h-5 rounded-full bg-gray-200 flex items-center justify-end p-0.5 cursor-pointer"><div className="w-4 h-4 rounded-full bg-white shadow" /></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Globe size={16} className="text-blue" /> Language & Region</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Primary Language</label>
                <select className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue">
                  <option>English (Default)</option>
                  <option>French</option>
                  <option>Arabic</option>
                  <option>Portuguese</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Fallback Response</label>
                <textarea rows={3} defaultValue="I'm sorry, I couldn't process your request. Let me connect you with a human agent." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
