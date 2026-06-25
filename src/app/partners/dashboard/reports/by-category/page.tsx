"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const categoryData = [
  { category: "Electronics", clicks: 18420, orders: 1240, revenue: "$415,800", commission: "$49,896", topProduct: "Wireless Headphones", color: "#FF6B00" },
  { category: "Fashion", clicks: 12680, orders: 845, revenue: "$253,500", commission: "$30,420", topProduct: "Designer Sneakers", color: "#0A1628" },
  { category: "Home", clicks: 10950, orders: 678, revenue: "$271,200", commission: "$32,544", topProduct: "Office Chair Pro", color: "#3b82f6" },
  { category: "Beauty", clicks: 8940, orders: 523, revenue: "$78,450", commission: "$11,768", topProduct: "Skincare Bundle", color: "#ec4899" },
  { category: "Sports", clicks: 7230, orders: 412, revenue: "$61,800", commission: "$9,270", topProduct: "Yoga Mat Set", color: "#22c55e" },
  { category: "Books", clicks: 5120, orders: 298, revenue: "$29,800", commission: "$4,470", topProduct: "Business Strategy", color: "#a855f7" },
];

const totalCommission = categoryData.reduce((acc, c) => {
  return acc + parseFloat(c.commission.replace(/[$,]/g, ""));
}, 0);

export default function PerformanceByCategory() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Performance by Category</h1>
        <p className="text-xs text-gray-500">Compare commission and performance across product categories</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" /> Commissions by Category
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 10, fill: "#0A1628", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, "Commission"]}
                />
                <Bar dataKey="commissionValue" name="Commission" radius={[0, 3, 3, 0]} maxBarSize={20}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" /> Share of Commissions
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.map((c) => ({
                    ...c,
                    commissionValue: parseFloat(c.commission.replace(/[$,]/g, "")),
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="commissionValue"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 11 }}
                  formatter={(value: any) => [`$${(value / 1000).toFixed(1)}k`, "Commission"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            {categoryData.map((c) => (
              <div key={c.category} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[9px] text-gray-500">{c.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Category</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Clicks</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Orders</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Revenue</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Commission</th>
                <th className="text-left text-[10px] font-semibold text-gray-500 px-4 py-2.5">Top Product</th>
                <th className="text-right text-[10px] font-semibold text-gray-500 px-4 py-2.5">Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((c, i) => {
                const commissionVal = parseFloat(c.commission.replace(/[$,]/g, ""));
                const share = ((commissionVal / totalCommission) * 100).toFixed(1);
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="text-[11px] font-semibold text-[#0A1628] px-4 py-2.5 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.category}
                    </td>
                    <td className="text-[11px] font-semibold text-gray-800 px-4 py-2.5 text-right">{c.clicks.toLocaleString()}</td>
                    <td className="text-[11px] text-gray-700 px-4 py-2.5 text-right">{c.orders.toLocaleString()}</td>
                    <td className="text-[11px] font-semibold text-gray-800 px-4 py-2.5 text-right">{c.revenue}</td>
                    <td className="text-[11px] font-bold text-green-700 px-4 py-2.5 text-right">{c.commission}</td>
                    <td className="text-[10px] text-gray-500 px-4 py-2.5">{c.topProduct}</td>
                    <td className="text-[11px] text-gray-600 px-4 py-2.5 text-right">{share}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
