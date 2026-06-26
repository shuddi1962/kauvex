"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Package,
  FileCheck,
  MapPin,
  Route,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Heart,
  RefreshCw,
  Lightbulb,
} from "lucide-react";

interface HealthFactor {
  name: string;
  score: number;
  color: string;
}

interface ShipmentHealth {
  shipmentId: string;
  waybillNumber: string;
  route: string;
  status: string;
  serviceLevel: string;
  healthScore: number;
  factors: HealthFactor[];
  suggestions: string[];
  createdAt: string;
}

const FACTOR_ICONS: Record<string, React.ReactNode> = {
  "Packaging Adequacy": <Package className="w-4 h-4" />,
  "Insurance Coverage": <Shield className="w-4 h-4" />,
  "Address Quality": <MapPin className="w-4 h-4" />,
  "Route Reliability": <Route className="w-4 h-4" />,
  "Time Sensitivity": <Clock className="w-4 h-4" />,
};

function getScoreLabel(score: number): string {
  if (score > 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function getScoreRingColor(score: number): string {
  if (score > 80) return "stroke-green-500";
  if (score >= 60) return "stroke-amber-500";
  return "stroke-red-500";
}

function ScoreRing({ score, size = 60 }: { score: number; size?: number }) {
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
        className={getScoreRingColor(score)}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

export default function HealthScorePage() {
  const [shipments, setShipments] = useState<ShipmentHealth[]>([]);
  const [accountHealth, setAccountHealth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/health-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      setShipments(json.shipments || []);
      setAccountHealth(json.accountHealthScore || 0);
      setLastUpdated(json.lastUpdated || new Date().toISOString());
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeShipments = shipments.filter((s) => s.status !== "delivered");
  const allSuggestions = [...new Set(shipments.flatMap((s) => s.suggestions))];
  const selected = shipments.find((s) => s.shipmentId === selectedShipment);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Shipment Health Score</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor the health of your shipments with multi-factor scoring
          </p>
        </div>
        <div className="flex items-center gap-3">
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

      {/* Account Health */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative flex items-center justify-center">
            <ScoreRing score={accountHealth} size={100} />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-[#0A1628]">{accountHealth}</span>
              <span className="text-[10px] text-gray-400">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#0A1628]">Account Overall Health</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {accountHealth > 80
                ? "Your shipments are in excellent health. Keep it up!"
                : accountHealth >= 60
                  ? "Good health overall. Some shipments could use attention."
                  : "Several shipments need improvement. Check suggestions below."}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <p className="text-xl font-bold text-[#0A1628]">{shipments.length}</p>
                <p className="text-[10px] text-gray-500">Total Shipments</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600">{activeShipments.length}</p>
                <p className="text-[10px] text-gray-500">Active</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-400">{shipments.length - activeShipments.length}</p>
                <p className="text-[10px] text-gray-500">Delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-[#FF6B00]" />
          <h3 className="text-sm font-semibold text-[#0A1628]">Suggestions to Improve Health</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {allSuggestions.slice(0, 6).map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B00] mt-0.5 shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
        {allSuggestions.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">All shipments are healthy. No suggestions needed.</p>
        )}
      </div>

      {/* Shipment List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#0A1628]">Shipment Health Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Waybill</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Route</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500">Health</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 hidden lg:table-cell">Factors</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 hidden xl:table-cell">Suggestions</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr
                  key={s.shipmentId}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedShipment(selectedShipment === s.shipmentId ? null : s.shipmentId)}
                >
                  <td className="py-3 px-4">
                    <p className="font-mono font-medium text-[#0A1628] text-xs">{s.waybillNumber}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.serviceLevel}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">{s.route}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <ScoreRing score={s.healthScore} size={36} />
                      <div>
                        <p className="text-xs font-bold" style={{ color: s.healthScore > 80 ? "#10B981" : s.healthScore >= 60 ? "#F59E0B" : "#EF4444" }}>
                          {s.healthScore}
                        </p>
                        <p className="text-[9px] text-gray-400">{getScoreLabel(s.healthScore)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.factors.map((f) => (
                        <span
                          key={f.name}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                          style={{ backgroundColor: `${f.color}15`, color: f.color, borderColor: `${f.color}30` }}
                        >
                          {f.name.split(" ")[0]}: {f.score}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden xl:table-cell">
                    <p className="text-[11px] text-gray-500 truncate max-w-[200px]">
                      {s.suggestions[0] || "No issues"}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`/express/track/${s.waybillNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF6B00] hover:underline"
                    >
                      Track <ArrowRight className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shipments.length === 0 && !loading && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No shipments to analyze</p>
          </div>
        )}
      </div>

      {/* Expanded Detail */}
      {selected && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#0A1628] font-mono">{selected.waybillNumber}</h3>
              <p className="text-xs text-gray-500">{selected.route}</p>
            </div>
            <button
              onClick={() => setSelectedShipment(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>

          <div className="grid sm:grid-cols-5 gap-4 mb-5">
            {selected.factors.map((f) => (
              <div key={f.name} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${f.color}15` }}>
                  <span style={{ color: f.color }}>{FACTOR_ICONS[f.name] || <CheckCircle2 className="w-4 h-4" />}</span>
                </div>
                <p className="text-lg font-bold" style={{ color: f.color }}>{f.score}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{f.name}</p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${f.score}%`, backgroundColor: f.color }} />
                </div>
              </div>
            ))}
          </div>

          {selected.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 mb-2">Suggestions</h4>
              <div className="space-y-2">
                {selected.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                    <Lightbulb className="w-3.5 h-3.5 text-[#FF6B00] mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-700">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Factor Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Health Score Factors</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: <Package className="w-4 h-4" />, name: "Packaging Adequacy", desc: "Protection level of packaging material" },
            { icon: <Shield className="w-4 h-4" />, name: "Insurance Coverage", desc: "Whether shipment is insured" },
            { icon: <MapPin className="w-4 h-4" />, name: "Address Quality", desc: "Completeness of pickup/delivery addresses" },
            { icon: <Route className="w-4 h-4" />, name: "Route Reliability", desc: "Historical success rate of this route" },
            { icon: <Clock className="w-4 h-4" />, name: "Time Sensitivity", desc: "How urgently shipment is progressing" },
          ].map((f) => (
            <div key={f.name} className="flex items-start gap-2">
              <span className="text-[#FF6B00] mt-0.5">{f.icon}</span>
              <div>
                <p className="text-xs font-medium text-gray-700">{f.name}</p>
                <p className="text-[11px] text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
