"use client";

import { useState } from "react";
import {
  TrendingUp, BarChart3, Target, Database, Search, X,
  ChevronDown, ChevronRight, CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const forecastTabs = [
  { id: "forecasts", label: "Forecasts" },
  { id: "accuracy", label: "Accuracy" },
  { id: "settings", label: "Settings" },
];

const seedForecasts = [
  { id: "1", product_id: "PROD-001", product_name: "Wireless Headphones", forecast_date: "2026-05-01", forecast_quantity: 850, confidence_lower: 720, confidence_upper: 980, actual_quantity: 810, accuracy: 95.3, factors: { seasonal: 0.25, trend: 0.35, market: 0.20, geographic: 0.20 } },
  { id: "2", product_id: "PROD-001", product_name: "Wireless Headphones", forecast_date: "2026-04-01", forecast_quantity: 750, confidence_lower: 630, confidence_upper: 870, actual_quantity: 720, accuracy: 96.0, factors: { seasonal: 0.20, trend: 0.40, market: 0.25, geographic: 0.15 } },
  { id: "3", product_id: "PROD-002", product_name: "Smart Watch Pro", forecast_date: "2026-05-01", forecast_quantity: 420, confidence_lower: 340, confidence_upper: 500, actual_quantity: null, accuracy: null, factors: { seasonal: 0.30, trend: 0.30, market: 0.25, geographic: 0.15 } },
  { id: "4", product_id: "PROD-002", product_name: "Smart Watch Pro", forecast_date: "2026-04-01", forecast_quantity: 380, confidence_lower: 310, confidence_upper: 450, actual_quantity: 395, accuracy: 96.1, factors: { seasonal: 0.28, trend: 0.32, market: 0.22, geographic: 0.18 } },
  { id: "5", product_id: "PROD-002", product_name: "Smart Watch Pro", forecast_date: "2026-03-01", forecast_quantity: 350, confidence_lower: 280, confidence_upper: 420, actual_quantity: 310, accuracy: 88.6, factors: { seasonal: 0.25, trend: 0.35, market: 0.20, geographic: 0.20 } },
  { id: "6", product_id: "PROD-003", product_name: "Organic Face Cream", forecast_date: "2026-05-01", forecast_quantity: 1200, confidence_lower: 1050, confidence_upper: 1350, actual_quantity: null, accuracy: null, factors: { seasonal: 0.40, trend: 0.20, market: 0.30, geographic: 0.10 } },
  { id: "7", product_id: "PROD-003", product_name: "Organic Face Cream", forecast_date: "2026-04-01", forecast_quantity: 1100, confidence_lower: 960, confidence_upper: 1240, actual_quantity: 1050, accuracy: 95.5, factors: { seasonal: 0.35, trend: 0.25, market: 0.28, geographic: 0.12 } },
  { id: "8", product_id: "PROD-003", product_name: "Organic Face Cream", forecast_date: "2026-03-01", forecast_quantity: 980, confidence_lower: 850, confidence_upper: 1110, actual_quantity: 1020, accuracy: 96.1, factors: { seasonal: 0.38, trend: 0.22, market: 0.25, geographic: 0.15 } },
  { id: "9", product_id: "PROD-004", product_name: "Industrial Drill Kit", forecast_date: "2026-05-01", forecast_quantity: 180, confidence_lower: 140, confidence_upper: 220, actual_quantity: null, accuracy: null, factors: { seasonal: 0.10, trend: 0.45, market: 0.25, geographic: 0.20 } },
  { id: "10", product_id: "PROD-004", product_name: "Industrial Drill Kit", forecast_date: "2026-04-01", forecast_quantity: 160, confidence_lower: 125, confidence_upper: 195, actual_quantity: 145, accuracy: 90.6, factors: { seasonal: 0.12, trend: 0.42, market: 0.28, geographic: 0.18 } },
  { id: "11", product_id: "PROD-004", product_name: "Industrial Drill Kit", forecast_date: "2026-03-01", forecast_quantity: 140, confidence_lower: 110, confidence_upper: 170, actual_quantity: 150, accuracy: 93.3, factors: { seasonal: 0.15, trend: 0.40, market: 0.25, geographic: 0.20 } },
  { id: "12", product_id: "PROD-005", product_name: "Premium Sneakers", forecast_date: "2026-05-01", forecast_quantity: 650, confidence_lower: 540, confidence_upper: 760, actual_quantity: null, accuracy: null, factors: { seasonal: 0.35, trend: 0.30, market: 0.20, geographic: 0.15 } },
  { id: "13", product_id: "PROD-005", product_name: "Premium Sneakers", forecast_date: "2026-04-01", forecast_quantity: 580, confidence_lower: 480, confidence_upper: 680, actual_quantity: 610, accuracy: 94.8, factors: { seasonal: 0.32, trend: 0.28, market: 0.22, geographic: 0.18 } },
  { id: "14", product_id: "PROD-005", product_name: "Premium Sneakers", forecast_date: "2026-03-01", forecast_quantity: 520, confidence_lower: 430, confidence_upper: 610, actual_quantity: 490, accuracy: 94.2, factors: { seasonal: 0.30, trend: 0.30, market: 0.25, geographic: 0.15 } },
];

const ForecastBar = ({ forecast, actual, lower, upper }: { forecast: number; actual: number | null; lower: number; upper: number }) => {
  const max = Math.max(upper, actual || 0, forecast) * 1.1;
  const w = 200;
  return (
    <div className="relative h-6 flex items-center" style={{ width: w }}>
      <div className="absolute h-1.5 bg-blue-100 rounded-full" style={{ left: `${(lower / max) * 100}%`, width: `${((upper - lower) / max) * 100}%`, top: "50%", transform: "translateY(-50%)" }} />
      <div className="absolute h-2 w-2 bg-blue rounded-full" style={{ left: `${(forecast / max) * 100}%`, top: "50%", transform: "translateY(-50%)" }} title={`Forecast: ${forecast}`} />
      {actual !== null && (
        <div className="absolute h-2.5 w-0.5 bg-green-500" style={{ left: `${(actual / max) * 100}%`, top: "50%", transform: "translateY(-50%)" }} title={`Actual: ${actual}`} />
      )}
      <span className="absolute text-[9px] text-text-4" style={{ left: "0", top: "-14px" }}>0</span>
      <span className="absolute text-[9px] text-text-4" style={{ right: "0", top: "-14px" }}>{Math.round(max)}</span>
    </div>
  );
};

export default function ForecastingPage() {
  const [activeTab, setActiveTab] = useState("forecasts");
  const [forecasts] = useState(seedForecasts);
  const [search, setSearch] = useState("");
  const [expandedFactors, setExpandedFactors] = useState<string | null>(null);

  const productsForecasted = new Set(forecasts.map((f) => f.product_id)).size;
  const withActual = forecasts.filter((f) => f.accuracy !== null);
  const avgAccuracy = withActual.length > 0 ? (withActual.reduce((s, f) => s + (f.accuracy || 0), 0) / withActual.length) : 0;
  const nextPeriodForecast = forecasts.filter((f) => f.forecast_date === "2026-05-01").reduce((s, f) => s + f.forecast_quantity, 0);
  const dataPoints = forecasts.length;

  const kpis = [
    { label: "Products Forecasted", value: productsForecasted, icon: Target, color: "text-blue" },
    { label: "Avg Accuracy", value: `${avgAccuracy.toFixed(1)}%`, icon: BarChart3, color: "text-green-600" },
    { label: "Next Period Forecast", value: nextPeriodForecast.toLocaleString(), icon: TrendingUp, color: "text-purple-600" },
    { label: "Data Points", value: dataPoints, icon: Database, color: "text-orange-500" },
  ];

  const filteredForecasts = forecasts.filter((f) =>
    !search || f.product_id.toLowerCase().includes(search.toLowerCase()) || f.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Demand Forecasting AI" subtitle="AI-powered demand forecasting with accuracy tracking and confidence intervals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Demand Forecasting</h1>
          <div className="flex gap-2">
            <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm w-[220px] focus:outline-none focus:border-blue" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {forecastTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon size={18} className={kpi.color} />
                  </div>
                </div>
                <p className="text-xl font-bold text-text-1">{kpi.value}</p>
                <p className="text-xs text-text-4 mt-0.5">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {activeTab === "forecasts" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><TrendingUp size={18} /> Forecast Entries</h3>
              <span className="text-xs text-text-4">{filteredForecasts.length} forecasts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Forecast Date</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Forecast Qty</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Confidence Range</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Visual</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Actual</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Accuracy</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Factors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredForecasts.map((f) => (
                    <tr key={f.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-text-1">{f.product_name}</p>
                        <p className="text-[10px] font-mono text-text-4">{f.product_id}</p>
                      </td>
                      <td className="px-5 py-3 text-text-3">{f.forecast_date}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{f.forecast_quantity.toLocaleString()}</td>
                      <td className="px-5 py-3 text-center text-xs text-text-4">{f.confidence_lower} — {f.confidence_upper}</td>
                      <td className="px-5 py-3 text-center">
                        <ForecastBar forecast={f.forecast_quantity} actual={f.actual_quantity} lower={f.confidence_lower} upper={f.confidence_upper} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{f.actual_quantity !== null ? f.actual_quantity.toLocaleString() : "-"}</td>
                      <td className="px-5 py-3 text-center">
                        {f.accuracy !== null ? (
                          <span className={`text-xs font-semibold ${f.accuracy >= 95 ? "text-green-600" : f.accuracy >= 90 ? "text-yellow-600" : "text-red"}`}>{f.accuracy}%</span>
                        ) : (
                          <span className="text-xs text-text-4">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => setExpandedFactors(expandedFactors === f.id ? null : f.id)} className="p-1 rounded-lg hover:bg-off-white text-text-4 hover:text-blue">
                          {expandedFactors === f.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {expandedFactors && (() => {
          const f = forecasts.find((x) => x.id === expandedFactors);
          if (!f) return null;
          return (
            <div className="bg-blue-50/50 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-text-1">Factors — {f.product_name} ({f.forecast_date})</h4>
                <button onClick={() => setExpandedFactors(null)} className="p-1 rounded-lg hover:bg-off-white text-text-4"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(f.factors).map(([key, val]) => (
                  <div key={key} className="bg-white rounded-lg p-3 border border-border">
                    <p className="text-[10px] text-text-4 uppercase font-semibold">{key}</p>
                    <p className="text-lg font-bold text-text-1">{(val * 100).toFixed(0)}%</p>
                    <div className="h-1.5 bg-off-white rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-blue rounded-full" style={{ width: `${val * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {activeTab === "accuracy" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><Target size={18} /> Model Accuracy by Product</h3>
              <div className="space-y-4">
                {["PROD-001", "PROD-002", "PROD-003", "PROD-004", "PROD-005"].map((pid) => {
                  const productForecasts = forecasts.filter((f) => f.product_id === pid && f.accuracy !== null);
                  const avg = productForecasts.length > 0 ? (productForecasts.reduce((s, f) => s + (f.accuracy || 0), 0) / productForecasts.length) : 0;
                  const name = productForecasts[0]?.product_name || pid;
                  return (
                    <div key={pid} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-1">{name}</p>
                        <p className="text-xs text-text-4">{productForecasts.length} forecasts</p>
                      </div>
                      <div className="h-2 w-24 bg-off-white rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${avg >= 95 ? "bg-green-500" : avg >= 90 ? "bg-yellow-500" : "bg-red"}`} style={{ width: `${avg}%` }} />
                      </div>
                      <span className={`text-xs font-semibold ${avg >= 95 ? "text-green-600" : avg >= 90 ? "text-yellow-600" : "text-red"}`}>{avg.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Monthly Accuracy Trend</h3>
              <div className="space-y-3">
                {[
                  { month: "March 2026", accuracy: 93.1 },
                  { month: "April 2026", accuracy: 95.2 },
                  { month: "May 2026", accuracy: null },
                ].map((m) => (
                  <div key={m.month} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <CalendarDays size={14} className="text-text-4" />
                    <span className="text-sm text-text-2 flex-1">{m.month}</span>
                    {m.accuracy ? (
                      <>
                        <div className="h-2 w-24 bg-off-white rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.accuracy >= 95 ? "bg-green-500" : "bg-yellow-500"}`} style={{ width: `${m.accuracy}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-green-600">{m.accuracy}%</span>
                      </>
                    ) : (
                      <span className="text-xs text-text-4">In progress</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><Database size={18} /> AI Model Configuration</h3>
              <div className="space-y-4">
                {[
                  { label: "Forecast Horizon", value: "30 days", desc: "How far ahead to predict" },
                  { label: "Confidence Level", value: "95%", desc: "Statistical confidence interval" },
                  { label: "Seasonality Period", value: "Quarterly", desc: "Seasonal pattern detection" },
                  { label: "Model Version", value: "Prophet v3.2", desc: "AI forecasting engine" },
                  { label: "Retrain Frequency", value: "Weekly", desc: "Model retrain schedule" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-text-1">{s.label}</p>
                      <p className="text-xs text-text-4">{s.desc}</p>
                    </div>
                    <span className="text-sm font-semibold text-blue">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><Target size={18} /> Data Sources</h3>
              <div className="space-y-3">
                {[
                  { source: "Historical Sales", status: "Connected", records: "45,230" },
                  { source: "Market Trends API", status: "Connected", records: "12,500" },
                  { source: "Weather Data", status: "Connected", records: "8,900" },
                  { source: "Social Sentiment", status: "Disconnected", records: "0" },
                  { source: "Competitor Pricing", status: "Connected", records: "6,700" },
                ].map((ds) => (
                  <div key={ds.source} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium text-text-1">{ds.source}</p>
                      <p className="text-xs text-text-4">{ds.records} records</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ds.status === "Connected" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>{ds.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
