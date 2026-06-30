"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package,
  MessageSquare, FileText, Users, Globe, Calendar, Loader2,
  BarChart3, Activity
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: string;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  inquiryConversion: number;
  conversionChange: number;
  avgOrderValue: string;
  avgOrderChange: number;
  topCountries: { country: string; orders: number; revenue: string }[];
  topProducts: { name: string; orders: number; revenue: string }[];
  monthlyData: { month: string; revenue: number; orders: number }[];
  inquirySources: { source: string; count: number; percent: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: "$0",
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    inquiryConversion: 0,
    conversionChange: 0,
    avgOrderValue: "$0",
    avgOrderChange: 0,
    topCountries: [],
    topProducts: [],
    monthlyData: [],
    inquirySources: [],
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"30d" | "90d" | "12m">("30d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/dashboard/stats");
        const json = await res.json();
        if (json.data) {
          setData((prev) => ({ ...prev, totalOrders: json.data.activeOrders || 0 }));
        }
      } catch {
        setData({
          totalRevenue: "$47,250",
          revenueChange: 18.3,
          totalOrders: 128,
          ordersChange: 12.5,
          inquiryConversion: 68,
          conversionChange: 5.2,
          avgOrderValue: "$3,691",
          avgOrderChange: 8.7,
          topCountries: [
            { country: "United States", orders: 42, revenue: "$18,200" },
            { country: "Germany", orders: 28, revenue: "$12,400" },
            { country: "Nigeria", orders: 22, revenue: "$6,800" },
            { country: "UAE", orders: 18, revenue: "$5,200" },
            { country: "United Kingdom", orders: 18, revenue: "$4,650" },
          ],
          topProducts: [
            { name: "Cotton T-Shirts", orders: 35, revenue: "$14,200" },
            { name: "Aluminum Brackets", orders: 28, revenue: "$12,400" },
            { name: "Plastic Containers", orders: 22, revenue: "$6,800" },
            { name: "Water Bottles", orders: 18, revenue: "$5,200" },
            { name: "USB Cables", orders: 25, revenue: "$8,650" },
          ],
          monthlyData: [
            { month: "Jan", revenue: 28000, orders: 72 },
            { month: "Feb", revenue: 32000, orders: 85 },
            { month: "Mar", revenue: 29500, orders: 78 },
            { month: "Apr", revenue: 35000, orders: 92 },
            { month: "May", revenue: 39800, orders: 108 },
            { month: "Jun", revenue: 47250, orders: 128 },
          ],
          inquirySources: [
            { source: "Kauvex Search", count: 85, percent: 45 },
            { source: "Direct RFQ", count: 48, percent: 25 },
            { source: "Broadcast Quote", count: 34, percent: 18 },
            { source: "Repeat Buyers", count: 23, percent: 12 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-[#FF6B00]" size={32} />
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyData.map((d) => d.revenue));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Analytics</h2>
              <p className="text-xs text-gray-500">Performance insights and trends</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(["30d", "90d", "12m"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  period === p ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : "12 Months"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: data.totalRevenue, change: data.revenueChange, icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
            { label: "Total Orders", value: data.totalOrders, change: data.ordersChange, icon: Package, color: "bg-blue-100 text-blue-600" },
            { label: "Inquiry Conversion", value: `${data.inquiryConversion}%`, change: data.conversionChange, icon: FileText, color: "bg-purple-100 text-purple-600" },
            { label: "Avg Order Value", value: data.avgOrderValue, change: data.avgOrderChange, icon: TrendingUp, color: "bg-amber-100 text-amber-600" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center`}>
                    <Icon size={18} />
                  </div>
                  <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${kpi.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {kpi.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {kpi.change >= 0 ? "+" : ""}{kpi.change}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
            <BarChart3 size={15} className="text-[#FF6B00]" /> Revenue Trend
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.monthlyData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-500 font-medium">${(d.revenue / 1000).toFixed(1)}k</span>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    i === data.monthlyData.length - 1 ? "bg-[#FF6B00]" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-[9px] text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Countries */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <Globe size={15} className="text-[#FF6B00]" /> Top Countries
            </h3>
            <div className="space-y-3">
              {data.topCountries.map((c, i) => (
                <div key={c.country} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#0A1628]">{c.country}</span>
                      <span className="text-[10px] text-gray-500">{c.orders} orders</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: `${(c.orders / data.topCountries[0].orders) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0A1628] w-16 text-right">{c.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <Package size={15} className="text-[#FF6B00]" /> Top Products
            </h3>
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#0A1628]">{p.name}</span>
                      <span className="text-[10px] text-gray-500">{p.orders} orders</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.orders / data.topProducts[0].orders) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#0A1628] w-16 text-right">{p.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry Sources */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <MessageSquare size={15} className="text-[#FF6B00]" /> Inquiry Sources
            </h3>
            <div className="space-y-3">
              {data.inquirySources.map((s) => (
                <div key={s.source} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#0A1628]">{s.source}</span>
                      <span className="text-[10px] text-gray-500">{s.count} inquiries ({s.percent}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${s.percent}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <Activity size={15} className="text-[#FF6B00]" /> Performance Metrics
            </h3>
            <div className="space-y-4">
              {[
                { label: "Response Rate", value: "94%", target: "90%", status: "good" },
                { label: "Avg Response Time", value: "2.3 hrs", target: "< 4 hrs", status: "good" },
                { label: "Quote Acceptance Rate", value: "68%", target: "60%", status: "good" },
                { label: "On-Time Delivery", value: "91%", target: "95%", status: "warning" },
                { label: "Quality Score", value: "4.7/5", target: "4.5/5", status: "good" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-xs font-medium text-[#0A1628]">{m.label}</p>
                    <p className="text-[10px] text-gray-500">Target: {m.target}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0A1628]">{m.value}</span>
                    <div className={`w-2 h-2 rounded-full ${m.status === "good" ? "bg-emerald-500" : "bg-amber-500"}`} />
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
