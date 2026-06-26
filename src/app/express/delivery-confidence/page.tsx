"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  Cloud,
  Route,
  Timer,
  Globe,
  ArrowRight,
  Info,
} from "lucide-react";

interface ConfidenceFactor {
  name: string;
  score: number;
  status: "good" | "warning" | "bad";
}

interface ShipmentConfidence {
  shipmentId: string;
  waybillNumber: string;
  route: string;
  status: string;
  serviceLevel: string;
  carrier: string;
  confidenceScore: number;
  factors: ConfidenceFactor[];
  recommendation: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Pickup",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-orange-100 text-[#FF6B00]",
  out_for_delivery: "bg-green-100 text-green-700",
};

function getScoreColor(score: number): string {
  if (score > 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function getScoreBg(score: number): string {
  if (score > 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function getScoreRing(score: number): string {
  if (score > 80) return "stroke-green-500";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-red-500";
}

function FactorIcon({ status }: { status: string }) {
  if (status === "good") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === "warning") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className={getScoreRing(score)}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

export default function DeliveryConfidencePage() {
  const [shipments, setShipments] = useState<ShipmentConfidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/delivery-confidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      setShipments(json.shipments || []);
      setLastUpdated(json.lastUpdated || new Date().toISOString());
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = shipments.filter((s) => {
    if (filter === "high") return s.confidenceScore > 80;
    if (filter === "medium") return s.confidenceScore >= 60 && s.confidenceScore <= 80;
    if (filter === "low") return s.confidenceScore < 60;
    return true;
  });

  const highCount = shipments.filter((s) => s.confidenceScore > 80).length;
  const medCount = shipments.filter((s) => s.confidenceScore >= 60 && s.confidenceScore <= 80).length;
  const lowCount = shipments.filter((s) => s.confidenceScore < 60).length;
  const avgScore = shipments.length > 0 ? Math.round(shipments.reduce((a, s) => a + s.confidenceScore, 0) / shipments.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Delivery Confidence Score</h1>
          <p className="text-sm text-gray-500 mt-1">
            Predictive confidence scores for your active shipments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            Updated every hour
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#0A1628]/10 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#0A1628]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0A1628]">{shipments.length}</p>
          <p className="text-xs text-gray-500">Active Shipments</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{highCount}</p>
          <p className="text-xs text-gray-500">High Confidence</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-500">{medCount}</p>
          <p className="text-xs text-gray-500">Medium Confidence</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">{lowCount}</p>
          <p className="text-xs text-gray-500">Low Confidence</p>
        </div>
      </div>

      {/* Average Score */}
      {shipments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <ScoreRing score={avgScore} size={80} />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold" style={{ color: getScoreColor(avgScore) }}>
                  {avgScore}
                </span>
                <span className="text-[10px] text-gray-400 -mt-0.5">/100</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0A1628]">Fleet Average Confidence</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {avgScore > 80 ? "Your fleet is performing excellently" : avgScore >= 60 ? "Moderate confidence across fleet" : "Fleet needs attention"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {(["all", "high", "medium", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f ? "bg-white shadow text-[#0A1628]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f === "all" ? "All" : f === "high" ? "High (>80)" : f === "medium" ? "Medium (60-80)" : "Low (<60)"}
          </button>
        ))}
      </div>

      {loading && shipments.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]" />
        </div>
      )}

      {/* Shipment Cards */}
      <div className="space-y-4">
        {filtered.map((s) => (
          <div
            key={s.shipmentId}
            className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${getScoreBg(s.confidenceScore)}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              {/* Left: Waybill + Score */}
              <div className="flex items-start gap-4 shrink-0">
                <div className="relative flex items-center justify-center">
                  <ScoreRing score={s.confidenceScore} size={64} />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm font-bold" style={{ color: getScoreColor(s.confidenceScore) }}>
                      {s.confidenceScore}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A1628] font-mono">{s.waybillNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.route}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                    <span className="text-[10px] text-gray-400">{s.serviceLevel}</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">{s.carrier}</span>
                  </div>
                </div>
              </div>

              {/* Center: Factors */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {s.factors.map((f) => (
                  <div key={f.name} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">{f.name}</span>
                      <FactorIcon status={f.status} />
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className="text-lg font-bold" style={{ color: getScoreColor(f.score) }}>
                        {f.score}
                      </span>
                      <span className="text-[10px] text-gray-400 mb-0.5">/100</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${f.score}%`, backgroundColor: getScoreColor(f.score) }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Recommendation */}
              <div className="lg:w-64 shrink-0">
                <div className="flex items-start gap-2 p-3 bg-white/80 rounded-lg border border-gray-100">
                  <Info className="w-4 h-4 text-[#FF6B00] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-gray-600 leading-relaxed">{s.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-[10px] text-gray-400">
                Created {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <a
                href={`/express/track/${s.waybillNumber}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF6B00] hover:underline"
              >
                Track Shipment <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No shipments found for this filter</p>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-[#0A1628] mb-3">How Confidence Scores Work</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-2">
            <Cloud className="w-4 h-4 text-blue-500 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700">Weather</p>
              <p className="text-[11px] text-gray-500">Real-time weather conditions along the route</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Truck className="w-4 h-4 text-[#FF6B00] mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700">Carrier Performance</p>
              <p className="text-[11px] text-gray-500">Historical on-time rate for this carrier</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Route className="w-4 h-4 text-purple-500 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700">Route Congestion</p>
              <p className="text-[11px] text-gray-500">Traffic and road conditions on the route</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-700">Customs Processing</p>
              <p className="text-[11px] text-gray-500">International customs clearance speed</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> High (&gt;80)
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium (60-80)
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Low (&lt;60)
          </span>
          <span className="text-[10px] text-gray-400 ml-auto">
            <Timer className="w-3 h-3 inline mr-1" />
            Scores refresh every hour
          </span>
        </div>
      </div>
    </div>
  );
}
