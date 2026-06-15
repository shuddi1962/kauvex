"use client";

import Link from "next/link";

export default function PODAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-200 p-4 space-y-1 min-h-screen">
        <h2 className="font-bold text-[#0A1628] px-3 mb-4">POD Studio</h2>
        {[
          { label: "Dashboard", href: "/vendor/pod", active: false },
          { label: "Design Studio", href: "/vendor/pod/design-studio", active: false },
          { label: "My Products", href: "/vendor/pod/products", active: false },
          { label: "Orders", href: "/vendor/pod/orders", active: false },
          { label: "Analytics", href: "/vendor/pod/analytics", active: true },
        ].map(l => (
          <Link key={l.label} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${l.active ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{l.label}</Link>
        ))}
      </div>
      <div className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-[#0A1628]">POD Analytics</h1>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: "₦478,000", change: "+12%", positive: true },
            { label: "Best Selling Design", value: "Geometric Waves", change: "47 units", positive: true },
            { label: "Avg. Profit Margin", value: "48%", change: "+3%", positive: true },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#0A1628] my-1">{s.value}</p>
              <span className={`text-xs font-medium ${s.positive ? 'text-green-600' : 'text-red-600'}`}>{s.change}</span>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-[#0A1628] mb-3">Sales by Product Type</h3>
            <div className="space-y-2">
              {[
                { type: "T-Shirts", pct: 45, color: "bg-blue-500" },
                { type: "Hoodies", pct: 28, color: "bg-purple-500" },
                { type: "Mugs", pct: 15, color: "bg-orange-500" },
                { type: "Phone Cases", pct: 12, color: "bg-green-500" },
              ].map(item => (
                <div key={item.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.type}</span><span className="text-gray-500">{item.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-[#0A1628] mb-3">Top Designs</h3>
            <div className="space-y-3">
              {[
                { name: "Geometric Waves", sales: 47, rev: "₦235,000" },
                { name: "Navy Waves Hoodie", sales: 31, rev: "₦186,000" },
                { name: "Minimalist Lines", sales: 22, rev: "₦88,000" },
              ].map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{d.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{d.rev}</span>
                    <span className="text-xs text-gray-400 ml-2">{d.sales} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
