"use client";

import { useEffect, useState, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Shield, AlertTriangle, Globe, Activity, Loader2 } from "lucide-react";

interface BlockedRequest {
  id: string;
  ip: string;
  path: string;
  attackType: string;
  country: string;
  timestamp: string;
}

interface AttackTypeCount {
  type: string;
  count: number;
}

interface CountryCount {
  country: string;
  count: number;
}

interface FirewallStats {
  blockedToday: number;
  sqlInjectionAttempts: number;
  xssAttempts: number;
  scannerDetections: number;
  recentBlocked: BlockedRequest[];
  topAttackTypes: AttackTypeCount[];
  topSourceCountries: CountryCount[];
}

function StatCard({
  icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        {loading ? (
          <Loader2 className="mt-1 h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            {value.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const ATTACK_BADGE: Record<string, string> = {
  "SQL_INJECTION": "bg-red-100 text-red-700",
  "XSS": "bg-orange-100 text-orange-700",
  "SCANNER": "bg-yellow-100 text-yellow-700",
  "BRUTE_FORCE": "bg-purple-100 text-purple-700",
  "PATH_TRAVERSAL": "bg-pink-100 text-pink-700",
  "COMMAND_INJECTION": "bg-red-100 text-red-800",
  "DEFAULT": "bg-gray-100 text-gray-700",
};

function badgeClass(type: string) {
  return ATTACK_BADGE[type] ?? ATTACK_BADGE.DEFAULT;
}

export default function AdminFirewallPage() {
  const [stats, setStats] = useState<FirewallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/admin/security/firewall");
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const data: FirewallStats = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load firewall data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <AdminShell
      title="Firewall Dashboard"
      description="Monitor blocked threats, attack patterns, and source locations"
    >
      <div className="px-6 py-8 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Firewall</h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time threat monitoring and blocking
            </p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e55f00] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Activity className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Failed to load firewall data
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchStats}
                className="text-sm font-medium text-red-700 underline mt-2 hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Shield className="h-5 w-5 text-[#FF6B00]" />}
            label="Blocked Today"
            value={stats?.blockedToday ?? 0}
            color="bg-[#0A1628]/10"
            loading={loading}
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            label="SQL Injection Attempts"
            value={stats?.sqlInjectionAttempts ?? 0}
            color="bg-red-100"
            loading={loading}
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-[#FF6B00]" />}
            label="XSS Attempts"
            value={stats?.xssAttempts ?? 0}
            color="bg-orange-100"
            loading={loading}
          />
          <StatCard
            icon={<Globe className="h-5 w-5 text-[#0A1628]" />}
            label="Scanner Detections"
            value={stats?.scannerDetections ?? 0}
            color="bg-blue-100"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Blocked Requests - spans 2 cols */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#0A1628]">
                Recent Blocked Requests
              </h2>
            </div>
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00]" />
                <p className="text-sm text-gray-500">Loading requests...</p>
              </div>
            ) : !stats?.recentBlocked?.length ? (
              <div className="p-12 text-center">
                <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No blocked requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left font-medium text-gray-500 px-6 py-3">
                        IP Address
                      </th>
                      <th className="text-left font-medium text-gray-500 px-6 py-3">
                        Path
                      </th>
                      <th className="text-left font-medium text-gray-500 px-6 py-3">
                        Attack Type
                      </th>
                      <th className="text-left font-medium text-gray-500 px-6 py-3">
                        Country
                      </th>
                      <th className="text-left font-medium text-gray-500 px-6 py-3">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.recentBlocked.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3 font-mono text-xs text-[#0A1628]">
                          {req.ip}
                        </td>
                        <td className="px-6 py-3 max-w-[200px]">
                          <span
                            className="font-mono text-xs text-gray-600 truncate block"
                            title={req.path}
                          >
                            {req.path}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${badgeClass(req.attackType)}`}
                          >
                            {req.attackType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-600">
                          {req.country}
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(req.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            {/* Top Attack Types */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#0A1628]">
                  Top Attack Types
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" />
                  </div>
                ) : !stats?.topAttackTypes?.length ? (
                  <p className="text-sm text-gray-500 text-center py-6">
                    No data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.topAttackTypes.map((item) => {
                      const maxCount = Math.max(
                        ...stats.topAttackTypes.map((t) => t.count),
                        1
                      );
                      const pct = Math.round((item.count / maxCount) * 100);
                      return (
                        <div key={item.type}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass(item.type)}`}
                            >
                              {item.type.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {item.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-[#FF6B00] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Top Source Countries */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#0A1628]">
                  Top Source Countries
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#FF6B00]" />
                  </div>
                ) : !stats?.topSourceCountries?.length ? (
                  <p className="text-sm text-gray-500 text-center py-6">
                    No data available
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.topSourceCountries.map((item, idx) => {
                      const maxCount = Math.max(
                        ...stats.topSourceCountries.map((c) => c.count),
                        1
                      );
                      const pct = Math.round((item.count / maxCount) * 100);
                      return (
                        <div key={item.country}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-2 text-xs font-medium text-gray-700">
                              <span className="text-gray-400 font-mono">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              {item.country}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {item.count.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-[#0A1628] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
