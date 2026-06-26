"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  CheckCircle2,
  RotateCcw,
  XCircle,
  DollarSign,
  Clock,
  Leaf,
  MapPin,
  Download,
  ChevronDown,
  Search,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  Target,
} from "lucide-react";

interface DateRange {
  start: string;
  end: string;
}

interface BreakdownCard {
  label: string;
  value: number;
  pct: number;
  trend: { value: number; direction: "up" | "down" };
}

interface VolumeChart {
  labels: string[];
  delivered: number[];
  in_transit: number[];
  picked_up: number[];
  failed: number[];
  pending: number[];
}

interface SpendChart {
  all: { labels: string[]; amounts: number[]; counts: number[] };
  by_destination: { destination: string; amount: number; count: number }[];
  by_category: { category: string; amount: number; count: number }[];
}

interface CategoryChart {
  name: string;
  count: number;
  pct: number;
  color: string;
}

interface AvgCheck {
  route: string;
  avgSpend: number;
  count: number;
}

interface DeliveryTime {
  destination: string;
  avgDays: number;
  sla: number;
  rating: string;
}

interface CarrierPerf {
  carrier: string;
  shipments: number;
  successRate: number;
  avgCost: number;
  avgDays: number;
  recommendation: string;
}

interface CostBreakdown {
  label: string;
  amount: number;
  pct: number;
  color: string;
}

interface CarbonData {
  co2ThisMonth: number;
  treesEquivalent: number;
  routeEfficiency: number;
  byRoute: { route: string; co2: number }[];
  suggestions: string[];
}

interface MapCountry {
  country: string;
  count: number;
  pct: number;
  avgCost: number;
  avgDays: number;
}

interface ApiResponse {
  date_range: DateRange;
  breakdown: BreakdownCard[];
  chart1_volume: VolumeChart;
  chart2_spend: SpendChart;
  chart3_categories: CategoryChart[];
  chart4_avg_check: AvgCheck[];
  chart5_delivery_time: DeliveryTime[];
  chart6_carriers: CarrierPerf[];
  chart7_cost_breakdown: CostBreakdown[];
  chart8_carbon: CarbonData;
  map_analytics: { countries: MapCountry[]; searchIndex: string[] };
}

const BREAKDOWN_ICONS: Record<string, React.ReactNode> = {
  Total: <Package className="w-4 h-4" />,
  Active: <Truck className="w-4 h-4" />,
  Completed: <CheckCircle2 className="w-4 h-4" />,
  Returned: <RotateCcw className="w-4 h-4" />,
  Failed: <XCircle className="w-4 h-4" />,
};

const BREAKDOWN_COLORS: Record<string, string> = {
  Total: "bg-[#0A1628]/10 text-[#0A1628]",
  Active: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Returned: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

const STATUS_COLORS = {
  delivered: "#10B981",
  in_transit: "#FF6B00",
  picked_up: "#3B82F6",
  failed: "#EF4444",
  pending: "#9CA3AF",
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [volumeToggle, setVolumeToggle] = useState<"week" | "month" | "year">("month");
  const [spendToggle, setSpendToggle] = useState<"all" | "destination" | "category">("all");
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);
  const [mapSearch, setMapSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_range: dateRange,
          custom_start: customStart || undefined,
          custom_end: customEnd || undefined,
          group_by: volumeToggle,
        }),
      });
      const json = await res.json();
      setData(json);
    } catch {
      // keep previous data or null
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStart, customEnd, volumeToggle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeSelect = (range: string) => {
    if (range === "custom") {
      setShowCustom(true);
      setDateRange("custom");
    } else {
      setShowCustom(false);
      setDateRange(range);
    }
  };

  const d = data;
  const filteredMap =
    d?.map_analytics.countries.filter((c) =>
      c.country.toLowerCase().includes(mapSearch.toLowerCase())
    ) || [];

  const maxVolume = d
    ? Math.max(
        ...d.chart1_volume.labels.map((_, i) =>
          d.chart1_volume.delivered[i] +
            d.chart1_volume.in_transit[i] +
            d.chart1_volume.picked_up[i] +
            d.chart1_volume.failed[i] +
            d.chart1_volume.pending[i]
        ),
        1
      )
    : 1;

  const maxSpendAmount = d
    ? Math.max(...(d.chart2_spend.all.amounts || [1]))
    : 1;

  const maxAvgCheck = d
    ? Math.max(...(d.chart4_avg_check.map((c) => c.avgSpend) || [1]))
    : 1;

  const maxDeliveryDays = d
    ? Math.max(...(d.chart5_delivery_time.map((t) => t.avgDays) || [1]))
    : 1;

  const maxCarbonRoute = d
    ? Math.max(...(d.chart8_carbon.byRoute.map((r) => r.co2) || [1]))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Express Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive shipping analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs font-medium text-gray-600">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap">
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "This Week" },
            { key: "month", label: "This Month" },
            { key: "year", label: "This Year" },
            { key: "custom", label: "Custom Range" },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => handleDateRangeSelect(r.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                dateRange === r.key
                  ? "bg-white shadow text-[#0A1628]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {showCustom && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700"
            />
          </div>
        )}
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
        </div>
      )}

      {d && (
        <>
          {/* Shipment Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {d.breakdown.map((b) => (
              <div
                key={b.label}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${BREAKDOWN_COLORS[b.label] || "bg-gray-100 text-gray-600"}`}
                  >
                    {BREAKDOWN_ICONS[b.label] || <Package className="w-4 h-4" />}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      b.trend.direction === "up" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {b.trend.direction === "up" ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {b.trend.value}%
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">
                  {b.value.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">{b.label}</p>
                  <span className="text-[10px] text-gray-400">
                    {b.pct.toFixed(1)}% of total
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 — Volume + Spend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 1 — Shipment Volume */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Shipment Volume
                </h3>
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  {(["week", "month", "year"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setVolumeToggle(t)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        volumeToggle === t
                          ? "bg-white shadow text-[#0A1628]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {d.chart1_volume.labels.map((label, i) => {
                  const total =
                    d.chart1_volume.delivered[i] +
                    d.chart1_volume.in_transit[i] +
                    d.chart1_volume.picked_up[i] +
                    d.chart1_volume.failed[i] +
                    d.chart1_volume.pending[i];
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 w-16 text-right shrink-0 truncate">
                        {label}
                      </span>
                      <div className="flex-1 flex h-5 rounded overflow-hidden bg-gray-100">
                        {(["delivered", "in_transit", "picked_up", "failed", "pending"] as const).map(
                          (status) => {
                            const val = d.chart1_volume[status][i];
                            const pct = total > 0 ? (val / total) * 100 : 0;
                            return pct > 0 ? (
                              <div
                                key={status}
                                className="h-full transition-all duration-300"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: STATUS_COLORS[status],
                                }}
                                title={`${status}: ${val}`}
                              />
                            ) : null;
                          }
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-[#0A1628] w-10 text-right">
                        {total}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {[
                  { label: "Delivered", color: STATUS_COLORS.delivered },
                  { label: "In Transit", color: STATUS_COLORS.in_transit },
                  { label: "Picked Up", color: STATUS_COLORS.picked_up },
                  { label: "Failed", color: STATUS_COLORS.failed },
                  { label: "Pending", color: STATUS_COLORS.pending },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* CHART 2 — Spend Over Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Spend Over Time
                </h3>
                <div className="flex bg-gray-100 rounded-md p-0.5">
                  {[
                    { key: "all" as const, label: "All" },
                    { key: "destination" as const, label: "By Destination" },
                    { key: "category" as const, label: "By Category" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSpendToggle(t.key)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        spendToggle === t.key
                          ? "bg-white shadow text-[#0A1628]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative h-48">
                <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 45}
                      x2="600"
                      y2={i * 45}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                    />
                  ))}
                  {spendToggle === "all" && d.chart2_spend.all.labels.length > 0 && (
                    <>
                      <defs>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <polygon
                        fill="url(#spendGrad)"
                        points={`0,180 ${d.chart2_spend.all.labels
                          .map(
                            (_, i) =>
                              `${(i / Math.max(d.chart2_spend.all.labels.length - 1, 1)) * 600},${180 - (d.chart2_spend.all.amounts[i] / maxSpendAmount) * 160}`
                          )
                          .join(" ")} 600,180`}
                      />
                      <polyline
                        fill="none"
                        stroke="#FF6B00"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={d.chart2_spend.all.labels
                          .map(
                            (_, i) =>
                              `${(i / Math.max(d.chart2_spend.all.labels.length - 1, 1)) * 600},${180 - (d.chart2_spend.all.amounts[i] / maxSpendAmount) * 160}`
                          )
                          .join(" ")}
                      />
                      {d.chart2_spend.all.labels.map((label, i) => {
                        const x = (i / Math.max(d.chart2_spend.all.labels.length - 1, 1)) * 600;
                        const y = 180 - (d.chart2_spend.all.amounts[i] / maxSpendAmount) * 160;
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#FF6B00"
                            stroke="white"
                            strokeWidth="2"
                            onMouseEnter={(e) => {
                              const rect = (e.target as SVGElement).closest("svg")?.getBoundingClientRect();
                              if (rect) {
                                setHoveredTooltip({
                                  x: e.clientX - rect.left,
                                  y: e.clientY - rect.top - 40,
                                  content: `${label} | $${d.chart2_spend.all.amounts[i].toLocaleString()} | ${d.chart2_spend.all.counts[i]} shipments`,
                                });
                              }
                            }}
                            onMouseLeave={() => setHoveredTooltip(null)}
                            style={{ cursor: "pointer" }}
                          />
                        );
                      })}
                    </>
                  )}
                  {spendToggle === "destination" && (
                    <text x="300" y="90" textAnchor="middle" fill="#9CA3AF" fontSize="12">
                      Top destinations shown in table below chart
                    </text>
                  )}
                  {spendToggle === "category" && (
                    <text x="300" y="90" textAnchor="middle" fill="#9CA3AF" fontSize="12">
                      Category breakdown shown in table below chart
                    </text>
                  )}
                </svg>
                {hoveredTooltip && (
                  <div
                    className="absolute z-10 bg-[#0A1628] text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
                    style={{ left: hoveredTooltip.x, top: hoveredTooltip.y }}
                  >
                    {hoveredTooltip.content}
                  </div>
                )}
              </div>
              {spendToggle === "destination" && d.chart2_spend.by_destination.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {d.chart2_spend.by_destination.slice(0, 5).map((item) => (
                    <div key={item.destination} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-600 w-16 truncate">
                        {item.destination}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#FF6B00]"
                          style={{
                            width: `${(item.amount / (d.chart2_spend.by_destination[0]?.amount || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-800 w-20 text-right">
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {spendToggle === "category" && d.chart2_spend.by_category.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {d.chart2_spend.by_category.map((item) => (
                    <div key={item.category} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-600 w-20 truncate">
                        {item.category}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0A1628]"
                          style={{
                            width: `${(item.amount / (d.chart2_spend.by_category[0]?.amount || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-800 w-20 text-right">
                        ${item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Charts Row 2 — Categories + Avg Check + Delivery Time */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CHART 3 — Popular Categories */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <PieChart className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Popular Categories
                </h3>
              </div>
              <div className="relative mx-auto w-36 h-36 mb-4">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(${d.chart3_categories
                      .map((c, i) => {
                        const off = d.chart3_categories
                          .slice(0, i)
                          .reduce((a, x) => a + x.pct, 0);
                        return `${c.color} ${off}% ${off + c.pct}%`;
                      })
                      .join(", ")})`,
                  }}
                />
                <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center flex-col">
                  <span className="text-lg font-bold text-[#0A1628]">
                    {d.chart3_categories.length}
                  </span>
                  <span className="text-[10px] text-gray-500">Types</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {d.chart3_categories.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs text-gray-600 flex-1">{c.name}</span>
                    <span className="text-xs font-semibold text-gray-800">
                      {c.pct}%
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({c.count.toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 4 — Average Check */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-[#0A1628]" />
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Average Check
                </h3>
              </div>
              <div className="space-y-2.5">
                {d.chart4_avg_check.slice(0, 8).map((item) => (
                  <div key={item.route} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 w-28 text-right shrink-0 truncate">
                      {item.route}
                    </span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <div
                        className="bg-[#FF6B00] rounded h-4 transition-all duration-300"
                        style={{
                          width: `${(item.avgSpend / maxAvgCheck) * 100}%`,
                          minWidth: "4px",
                        }}
                      />
                      <span className="text-[11px] font-bold text-[#0A1628] whitespace-nowrap">
                        ${item.avgSpend.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {d.chart4_avg_check.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No route data available
                  </p>
                )}
              </div>
            </div>

            {/* CHART 5 — Average Delivery Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-[#10B981]" />
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Avg. Delivery Time
                </h3>
              </div>
              <div className="space-y-2.5">
                {d.chart5_delivery_time.slice(0, 8).map((item) => {
                  const barColor =
                    item.rating === "Perfectly"
                      ? "#10B981"
                      : item.rating === "Fine"
                        ? "#F59E0B"
                        : "#EF4444";
                  return (
                    <div key={item.destination} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-20 text-right shrink-0">
                        {item.destination}
                      </span>
                      <div className="flex-1 flex items-center gap-1.5">
                        <div
                          className="rounded h-4 transition-all duration-300"
                          style={{
                            width: `${(item.avgDays / maxDeliveryDays) * 100}%`,
                            minWidth: "4px",
                            backgroundColor: barColor,
                          }}
                        />
                        <span className="text-[11px] font-bold text-[#0A1628] whitespace-nowrap">
                          {item.avgDays}d
                        </span>
                      </div>
                      <span
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: `${barColor}20`,
                          color: barColor,
                        }}
                      >
                        {item.rating}
                      </span>
                    </div>
                  );
                })}
                {d.chart5_delivery_time.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No delivery data available
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 mt-3">
                {[
                  { label: "Perfectly", color: "#10B981" },
                  { label: "Fine", color: "#F59E0B" },
                  { label: "Too long", color: "#EF4444" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CHART 6 — Carrier Performance Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4 text-[#FF6B00]" />
              <h3 className="text-sm font-semibold text-[#0A1628]">
                Carrier Performance
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">
                      Carrier
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      Shipments
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      Success Rate
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      Avg Cost
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      Avg Days
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 w-48">
                      Recommendation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.chart6_carriers.map((c) => (
                    <tr
                      key={c.carrier}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#0A1628]">
                        {c.carrier}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {c.shipments.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className="font-bold"
                          style={{
                            color:
                              c.successRate >= 95
                                ? "#10B981"
                                : c.successRate >= 90
                                  ? "#F59E0B"
                                  : "#EF4444",
                          }}
                        >
                          {c.successRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        ${c.avgCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {c.avgDays}d
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500 italic">
                        {c.recommendation || "—"}
                      </td>
                    </tr>
                  ))}
                  {d.chart6_carriers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                        No carrier data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row 4 — Cost Breakdown + Carbon Footprint */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CHART 7 — Cost Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <DollarSign className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Cost Breakdown
                </h3>
              </div>
              <div className="relative mx-auto w-40 h-40 mb-4">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(${d.chart7_cost_breakdown
                      .map((c, i) => {
                        const off = d.chart7_cost_breakdown
                          .slice(0, i)
                          .reduce((a, x) => a + x.pct, 0);
                        return `${c.color} ${off}% ${off + c.pct}%`;
                      })
                      .join(", ")})`,
                  }}
                />
                <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center flex-col">
                  <span className="text-sm font-bold text-[#0A1628]">
                    $
                    {(
                      d.chart7_cost_breakdown.reduce((a, c) => a + c.amount, 0) / 1000
                    ).toFixed(1)}
                    K
                  </span>
                  <span className="text-[10px] text-gray-500">Total</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {d.chart7_cost_breakdown.map((c) => (
                  <div key={c.label} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs text-gray-600 flex-1">{c.label}</span>
                    <span className="text-xs font-semibold text-gray-800">
                      ${c.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 8 — Carbon Footprint */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Leaf className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Carbon Footprint
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-700">
                    {d.chart8_carbon.co2ThisMonth.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-green-600">CO₂ (kg)</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">
                    {d.chart8_carbon.treesEquivalent}
                  </p>
                  <p className="text-[10px] text-blue-600">Trees Planted Equiv.</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#FF6B00]">
                    {d.chart8_carbon.routeEfficiency}%
                  </p>
                  <p className="text-[10px] text-[#FF6B00]">Route Efficiency</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[11px] font-medium text-gray-500 mb-2">
                  CO₂ by Route
                </p>
                <div className="space-y-1.5">
                  {d.chart8_carbon.byRoute.slice(0, 5).map((r) => (
                    <div key={r.route} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-24 text-right truncate">
                        {r.route}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600"
                          style={{
                            width: `${(r.co2 / maxCarbonRoute) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-700 w-14 text-right">
                        {r.co2} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-500 mb-2">
                  Going Green Suggestions
                </p>
                <div className="space-y-1.5">
                  {d.chart8_carbon.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 bg-green-50/50 rounded-lg"
                    >
                      <Leaf className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-[11px] text-gray-600">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Analytics Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-semibold text-[#0A1628]">
                  Map Analytics
                </h3>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search country..."
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 w-48 focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
            {/* SVG World Map */}
            <div className="relative bg-[#0A1628] rounded-xl h-52 mb-5 overflow-hidden">
              <svg viewBox="0 0 800 360" className="w-full h-full opacity-80">
                {/* Simplified world map outline */}
                <ellipse cx="400" cy="180" rx="380" ry="160" fill="none" stroke="#1E3A5F" strokeWidth="1" />
                <ellipse cx="400" cy="180" rx="380" ry="160" fill="none" stroke="#1E3A5F" strokeWidth="0.5" strokeDasharray="4 4" />
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={`h${i}`} x1="20" y1={60 * i + 30} x2="780" y2={60 * i + 30} stroke="#1E3A5F" strokeWidth="0.5" />
                ))}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <line key={`v${i}`} x1={60 * i + 20} y1="20" x2={60 * i + 20} y2="340" stroke="#1E3A5F" strokeWidth="0.5" />
                ))}
                {/* Country dots — positions approximate real locations */}
                {(() => {
                  const countryPositions: Record<string, { x: number; y: number }> = {
                    NG: { x: 380, y: 210 },
                    GB: { x: 390, y: 110 },
                    US: { x: 160, y: 140 },
                    AE: { x: 500, y: 190 },
                    IN: { x: 560, y: 180 },
                    AU: { x: 640, y: 280 },
                    DE: { x: 420, y: 115 },
                    CA: { x: 170, y: 100 },
                    GH: { x: 370, y: 220 },
                    KE: { x: 490, y: 230 },
                    ZA: { x: 450, y: 290 },
                    SA: { x: 490, y: 185 },
                    BR: { x: 250, y: 270 },
                    JP: { x: 680, y: 140 },
                    FR: { x: 400, y: 120 },
                  };
                  const maxCount = Math.max(
                    ...d.map_analytics.countries.map((c) => c.count),
                    1
                  );
                  return d.map_analytics.countries.map((c) => {
                    const pos = countryPositions[c.country];
                    if (!pos) return null;
                    const r = 3 + (c.count / maxCount) * 8;
                    const opacity = 0.4 + (c.count / maxCount) * 0.6;
                    return (
                      <g key={c.country}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={r + 4}
                          fill="#FF6B00"
                          opacity={opacity * 0.2}
                        />
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={r}
                          fill="#FF6B00"
                          opacity={opacity}
                        />
                        <text
                          x={pos.x}
                          y={pos.y - r - 4}
                          textAnchor="middle"
                          fill="white"
                          fontSize="8"
                          opacity="0.7"
                        >
                          {c.country}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
            {/* Country Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">
                      Destination
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      Count
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      %
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      Avg Cost
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">
                      Avg Delivery Days
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMap.map((c) => (
                    <tr
                      key={c.country}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-medium text-[#0A1628]">
                        {c.country}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {c.count.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {c.pct}%
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        ${c.avgCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-gray-600">
                        {c.avgDays}d
                      </td>
                    </tr>
                  ))}
                  {filteredMap.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-400 text-xs"
                      >
                        No matching destinations
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
