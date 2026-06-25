"use client";

import {
  Building2, Users, Handshake, DollarSign, TrendingUp, Plus,
  BarChart3, ArrowUp, ArrowDown, ChevronRight, Phone, Mail, Calendar,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const statCards = [
  { label: "B2B Referrals", value: "24", icon: Users, change: "+6 this month", up: true },
  { label: "Closed Deals", value: "18", icon: Handshake, change: "75% close rate", up: true },
  { label: "Total B2B Commission", value: "$12,450", icon: DollarSign, change: "+$2,340 this month", up: true },
  { label: "Conversion Rate", value: "75%", icon: TrendingUp, change: "+5% vs last quarter", up: true },
];

const pipelineStages = [
  { name: "Lead", count: 8, color: "#3b82f6" },
  { name: "Meeting", count: 5, color: "#8b5cf6" },
  { name: "Proposal", count: 3, color: "#f59e0b" },
  { name: "Closed", count: 18, color: "#22c55e" },
];

const monthlyEarnings = [
  { month: "Jan", earnings: 1200 },
  { month: "Feb", earnings: 1800 },
  { month: "Mar", earnings: 950 },
  { month: "Apr", earnings: 2100 },
  { month: "May", earnings: 1650 },
  { month: "Jun", earnings: 2800 },
  { month: "Jul", earnings: 3200 },
  { month: "Aug", earnings: 2450 },
  { month: "Sep", earnings: 1900 },
  { month: "Oct", earnings: 2200 },
  { month: "Nov", earnings: 2600 },
  { month: "Dec", earnings: 3100 },
];

const referrals = [
  { company: "TechCorp Nigeria Ltd", contact: "James Okafor", value: "$45,000", commission: "$4,500", stage: "Closed", date: "2026-06-20" },
  { company: "Marine Logistics Pro", contact: "Fatima Usman", value: "$32,000", commission: "$3,200", stage: "Closed", date: "2026-06-15" },
  { company: "Greenfield Agro Ltd", contact: "Chidi Eze", value: "$28,000", commission: "$2,800", stage: "Negotiation", date: "2026-06-10" },
  { company: "Pinnacle Health Corp", contact: "Sarah Adeyemi", value: "$18,500", commission: "$1,850", stage: "Proposal", date: "2026-06-05" },
  { company: "Bluewave Energy Plc", contact: "Michael Dakuku", value: "$52,000", commission: "$5,200", stage: "Negotiation", date: "2026-05-28" },
  { company: "Apex Retail Chain Ltd", contact: "Grace Obi", value: "$12,000", commission: "$1,200", stage: "Lead", date: "2026-05-20" },
];

const stageColors: Record<string, string> = {
  Lead: "text-blue-700 bg-blue-50",
  Meeting: "text-purple-700 bg-purple-50",
  Proposal: "text-amber-700 bg-amber-50",
  Negotiation: "text-orange-700 bg-orange-50",
  Closed: "text-green-700 bg-green-50",
};

export default function B2BPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#0A1628]">B2B Referral Dashboard</h1>
          <p className="text-xs text-gray-500">Track your business referrals, deals, and B2B commissions</p>
        </div>
        <button className="flex items-center gap-1.5 h-9 px-4 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
          <Plus size={12} /> New Referral
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                  <Icon size={15} />
                </div>
                <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${card.up ? "text-green-600" : "text-red-500"}`}>
                  {card.up ? <ArrowUp size={9} /> : <ArrowDown size={9} />} {card.change}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">{card.label}</p>
              <p className="font-bold text-lg text-[#0A1628]">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Pipeline Visualization */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-[#FF6B00]" /> Sales Pipeline
          </h3>
          <div className="flex items-end gap-2 h-32">
            {pipelineStages.map((stage) => {
              const maxCount = Math.max(...pipelineStages.map((s) => s.count));
              const height = (stage.count / maxCount) * 100;
              return (
                <div key={stage.name} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-700">{stage.count}</span>
                  <div
                    className="w-full rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%`, background: stage.color, minHeight: 12 }}
                  />
                  <span className="text-[9px] text-gray-500 font-medium">{stage.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <DollarSign size={14} className="text-[#FF6B00]" /> Monthly B2B Earnings
          </h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEarnings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                  formatter={(value: any) => [`$${value}`, undefined]}
                />
                <Bar dataKey="earnings" fill="#FF6B00" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
          <Building2 size={14} className="text-[#FF6B00]" /> B2B Referrals
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Company</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Contact</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Deal Value</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Commission</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Stage</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => (
                <tr key={ref.company} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-3">
                    <p className="text-xs font-semibold text-gray-800">{ref.company}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <p className="text-[11px] text-gray-600">{ref.contact}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <p className="text-xs font-semibold text-gray-800">{ref.value}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <p className="text-xs font-semibold text-green-700">{ref.commission}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${stageColors[ref.stage] || "text-gray-600 bg-gray-100"}`}>
                      {ref.stage}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <p className="text-[11px] text-gray-500">{ref.date}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
