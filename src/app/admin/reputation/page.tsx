"use client";

import { useState } from "react";
import {
  Star, Users, TrendingUp, Award, AlertTriangle, Search,
  ThumbsUp, ShoppingBag, MessageCircle, Shield, X, TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const repTabs = [
  { id: "vendors", label: "All Vendors" },
  { id: "scores", label: "Scores" },
  { id: "history", label: "History" },
];

const seedVendors = [
  { id: "1", name: "TechStar Ltd", overall_score: 4.7, delivery_speed: 4.8, return_rate: 1.2, satisfaction: 4.6, complaint_rate: 0.8, authenticity: 5.0, total_orders: 2840, category: "Electronics", status: "top" },
  { id: "2", name: "Niger Delta Oil", overall_score: 4.3, delivery_speed: 4.1, return_rate: 2.8, satisfaction: 4.2, complaint_rate: 2.1, authenticity: 4.5, total_orders: 1560, category: "Industrial", status: "good" },
  { id: "3", name: "Glamour Beauty", overall_score: 4.8, delivery_speed: 4.9, return_rate: 0.9, satisfaction: 4.9, complaint_rate: 0.5, authenticity: 4.8, total_orders: 4200, category: "Beauty", status: "top" },
  { id: "4", name: "AutoParts NG", overall_score: 3.8, delivery_speed: 3.5, return_rate: 5.2, satisfaction: 3.6, complaint_rate: 4.8, authenticity: 4.0, total_orders: 890, category: "Automotive", status: "needs_improvement" },
  { id: "5", name: "BuildMaster Inc", overall_score: 4.1, delivery_speed: 3.9, return_rate: 3.5, satisfaction: 4.0, complaint_rate: 3.2, authenticity: 4.2, total_orders: 1240, category: "Construction", status: "good" },
  { id: "6", name: "ElectroWorld", overall_score: 4.5, delivery_speed: 4.3, return_rate: 2.1, satisfaction: 4.4, complaint_rate: 1.8, authenticity: 4.7, total_orders: 2100, category: "Electronics", status: "good" },
  { id: "7", name: "FarmFresh Ltd", overall_score: 4.9, delivery_speed: 4.7, return_rate: 0.5, satisfaction: 5.0, complaint_rate: 0.3, authenticity: 4.9, total_orders: 5800, category: "Groceries", status: "top" },
  { id: "8", name: "Swift Logistics", overall_score: 3.5, delivery_speed: 3.2, return_rate: 6.8, satisfaction: 3.3, complaint_rate: 5.5, authenticity: 3.8, total_orders: 670, category: "Logistics", status: "needs_improvement" },
  { id: "9", name: "Port Security Ltd", overall_score: 4.2, delivery_speed: 4.0, return_rate: 3.0, satisfaction: 4.1, complaint_rate: 2.5, authenticity: 4.3, total_orders: 980, category: "Security", status: "good" },
  { id: "10", name: "Apex Holdings", overall_score: 4.6, delivery_speed: 4.5, return_rate: 1.5, satisfaction: 4.5, complaint_rate: 1.2, authenticity: 4.6, total_orders: 3200, category: "General", status: "top" },
  { id: "11", name: "Kemi Bayo Crafts", overall_score: 4.4, delivery_speed: 4.2, return_rate: 2.0, satisfaction: 4.3, complaint_rate: 1.5, authenticity: 4.8, total_orders: 1450, category: "Handmade", status: "good" },
  { id: "12", name: "Chidi Auto Spares", overall_score: 2.9, delivery_speed: 2.5, return_rate: 8.2, satisfaction: 2.8, complaint_rate: 7.5, authenticity: 3.0, total_orders: 340, category: "Automotive", status: "needs_improvement" },
];

const seedHistory = [
  { id: "1", vendor: "TechStar Ltd", score: 4.7, date: "2026-04-15", change: "+0.1", reason: "Positive reviews from 50+ orders" },
  { id: "2", vendor: "Swift Logistics", score: 3.5, date: "2026-04-15", change: "-0.3", reason: "Multiple delivery delays reported" },
  { id: "3", vendor: "Glamour Beauty", score: 4.8, date: "2026-04-10", change: "+0.2", reason: "Excellent customer feedback" },
  { id: "4", vendor: "AutoParts NG", score: 3.8, date: "2026-04-08", change: "-0.4", reason: "High return rate on engine parts" },
  { id: "5", vendor: "FarmFresh Ltd", score: 4.9, date: "2026-04-05", change: "+0.1", reason: "Consistent 5-star ratings" },
  { id: "6", vendor: "Chidi Auto Spares", score: 2.9, date: "2026-04-01", change: "-0.6", reason: "Authenticity complaints received" },
  { id: "7", vendor: "Apex Holdings", score: 4.6, date: "2026-03-28", change: "+0.0", reason: "Stable performance" },
  { id: "8", vendor: "ElectroWorld", score: 4.5, date: "2026-03-25", change: "+0.1", reason: "Improved delivery times" },
];

const StarRating = ({ score, size = 14 }: { score: number; size?: number }) => {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push("full");
    else if (i === full && half) stars.push("half");
    else stars.push("empty");
  }
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s, i) => (
        <Star key={i} size={size} className={s === "full" ? "fill-yellow-400 text-yellow-400" : s === "half" ? "fill-yellow-400/50 text-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  );
};

const scoreColor = (score: number) => {
  if (score >= 4) return "text-green-600";
  if (score >= 3) return "text-yellow-600";
  return "text-red";
};

const scoreBg = (score: number) => {
  if (score >= 4) return "bg-green-50 text-green-700";
  if (score >= 3) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-red";
};

export default function ReputationPage() {
  const [activeTab, setActiveTab] = useState("vendors");
  const [vendors] = useState(seedVendors);
  const [history] = useState(seedHistory);
  const [search, setSearch] = useState("");

  const tracked = vendors.length;
  const avgScore = (vendors.reduce((s, v) => s + v.overall_score, 0) / tracked);
  const topPerformer = vendors.reduce((best, v) => v.overall_score > best.overall_score ? v : best, vendors[0]);
  const needsImprovement = vendors.filter((v) => v.overall_score < 3).length;

  const kpis = [
    { label: "Vendors Tracked", value: tracked, icon: Users, color: "text-blue" },
    { label: "Avg Score", value: avgScore.toFixed(1), icon: TrendingUp, color: "text-green-600" },
    { label: "Top Performer", value: topPerformer.name.split(" ")[0], icon: Award, color: "text-yellow-500" },
    { label: "Needs Improvement", value: needsImprovement, icon: AlertTriangle, color: "text-red" },
  ];

  const filteredVendors = vendors.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Vendor Reputation" subtitle="Vendor performance scoring, ratings, and reputation tracking">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Vendor Reputation</h1>
          <div className="flex gap-2">
            <input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm w-[220px] focus:outline-none focus:border-blue" />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {repTabs.map((tab) => (
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

        {(activeTab === "vendors" || activeTab === "scores") && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><Users size={18} /> Vendor Scores</h3>
              <span className="text-xs text-text-4">{filteredVendors.length} vendors</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Vendor</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Category</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Overall</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Delivery</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Return Rate</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Satisfaction</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Complaints</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Authenticity</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Orders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVendors.map((v) => (
                    <tr key={v.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue">{v.name.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-text-1">{v.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <StarRating score={v.overall_score} size={12} />
                              <span className={`text-[10px] font-semibold ${scoreColor(v.overall_score)}`}>{v.overall_score}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-text-4">{v.category}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBg(v.overall_score)}`}>{v.overall_score}</span>
                      </td>
                      <td className="px-5 py-3 text-center text-text-2">{v.delivery_speed}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs ${v.return_rate > 5 ? "text-red" : v.return_rate > 3 ? "text-yellow-600" : "text-green-600"}`}>{v.return_rate}%</span>
                      </td>
                      <td className="px-5 py-3 text-center text-text-2">{v.satisfaction}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs ${v.complaint_rate > 5 ? "text-red" : v.complaint_rate > 3 ? "text-yellow-600" : "text-green-600"}`}>{v.complaint_rate}%</span>
                      </td>
                      <td className="px-5 py-3 text-center text-text-2">{v.authenticity}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{v.total_orders.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><TrendingUp size={18} /> Score Change History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Vendor</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Score</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Change</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-medium text-text-1">{h.vendor}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBg(h.score)}`}>{h.score}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold flex items-center justify-center gap-0.5 ${h.change.startsWith("+") ? "text-green-600" : h.change === "+0.0" ? "text-text-4" : "text-red"}`}>
                          {h.change.startsWith("+") ? <TrendingUp size={12} /> : h.change.startsWith("-") ? <TrendingDown size={12} /> : null}
                          {h.change}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-text-4 text-xs">{h.date}</td>
                      <td className="px-5 py-3 text-text-3 text-xs">{h.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
