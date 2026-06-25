"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  MousePointerClick, Users, TrendingUp, Percent,
} from "lucide-react";

const summaryMetrics = [
  { label: "Total Clicks", value: "45,892", icon: MousePointerClick, change: "+22.1%", up: true },
  { label: "Unique Visitors", value: "32,147", icon: Users, change: "+18.4%", up: true },
  { label: "Avg Clicks/Day", value: "1,529", icon: TrendingUp, change: "+8.9%", up: true },
  { label: "CTR", value: "4.7%", icon: Percent, change: "+0.6%", up: true },
];

const clicksChartData = [
  { day: "Jun 12", clicks: 1240 },
  { day: "Jun 13", clicks: 1380 },
  { day: "Jun 14", clicks: 1120 },
  { day: "Jun 15", clicks: 1580 },
  { day: "Jun 16", clicks: 1420 },
  { day: "Jun 17", clicks: 1650 },
  { day: "Jun 18", clicks: 1890 },
  { day: "Jun 19", clicks: 1720 },
  { day: "Jun 20", clicks: 1980 },
  { day: "Jun 21", clicks: 2140 },
  { day: "Jun 22", clicks: 1960 },
  { day: "Jun 23", clicks: 2210 },
  { day: "Jun 24", clicks: 2350 },
  { day: "Jun 25", clicks: 2240 },
];

const topLinks = [
  { link: "kauvex.com/shop/electronics?ref=KAV-1234", clicks: 8942, unique: 6210, conversions: 482, convRate: "5.4%" },
  { link: "kauvex.com/shop/fashion?ref=KAV-1234", clicks: 7230, unique: 5140, conversions: 356, convRate: "4.9%" },
  { link: "kauvex.com/shop/home?ref=KAV-1234", clicks: 6180, unique: 4420, conversions: 298, convRate: "4.8%" },
  { link: "kauvex.com/promotions/summer-sale?ref=KAV-1234", clicks: 5410, unique: 3870, conversions: 412, convRate: "7.6%" },
  { link: "kauvex.com/shop/beauty?ref=KAV-1234", clicks: 4890, unique: 3510, conversions: 215, convRate: "4.4%" },
  { link: "kauvex.com/product/headphones-pro?ref=KAV-1234", clicks: 3240, unique: 2340, conversions: 187, convRate: "5.8%" },
];

const deviceData = [
  { name: "Mobile", value: 62, color: "#FF6B00" },
  { name: "Desktop", value: 28, color: "#0A1628" },
  { name: "Tablet", value: 10, color: "#94a3b8" },
];

export default function ClickAnalytics() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Click Analytics</h1>
        <p className="text-xs text-gray-500">Track click performance, top links, and device breakdown</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Icon size={13} />
                </div>
                <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${m.up ? "text-green-600" : "text-red-500"}`}>
                  {m.up ? "+" : "-"}{m.change}
                </span>
              </div>
              <p className="font-bold text-sm text-[#0A1628]">{m.value}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <MousePointerClick size={15} className="text-[#FF6B00]" /> Clicks Per Day (14 Days)
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clicksChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                  formatter={(value: any) => [value.toLocaleString(), "Clicks"]}
                />
                <Bar dataKey="clicks" fill="#FF6B00" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <Users size={15} className="text-[#FF6B00]" /> Device Breakdown
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                  formatter={(value: any) => [`${value}%`, undefined]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            {deviceData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[10px] text-gray-500">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-xs text-[#0A1628]">Top Performing Links</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Link</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Clicks</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Unique</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Conversions</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {topLinks.map((link, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="text-[10px] font-mono text-gray-600 px-4 py-2.5 truncate max-w-[300px]">{link.link}</td>
                  <td className="text-[11px] font-semibold text-gray-800 px-4 py-2.5 text-right">{link.clicks.toLocaleString()}</td>
                  <td className="text-[11px] text-gray-600 px-4 py-2.5 text-right">{link.unique.toLocaleString()}</td>
                  <td className="text-[11px] text-gray-600 px-4 py-2.5 text-right">{link.conversions.toLocaleString()}</td>
                  <td className="text-[11px] font-bold text-green-700 px-4 py-2.5 text-right">{link.convRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
