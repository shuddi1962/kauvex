"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  AlertTriangle,
  Activity,
  Bell,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Radio,
  Settings,
  Eye,
  Zap,
  Search,
  ExternalLink,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

interface RoutingRow {
  severity: string;
  badge: string;
  channels: { icon: React.ReactNode; label: string }[];
  responseTime: string;
  responseBadge: string;
}

interface ErrorEntry {
  id: string;
  message: string;
  severity: string;
  severityBadge: string;
  affectedUsers: number;
  lastSeen: string;
  status: string;
  statusBadge: string;
  statusIcon: React.ReactNode;
}

interface ConfigItem {
  label: string;
  value: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Mock Data                                 */
/* -------------------------------------------------------------------------- */

const STATS: StatCardProps[] = [
  {
    icon: <XCircle className="h-5 w-5 text-red-600" />,
    label: "Critical Errors",
    value: 3,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    label: "High Severity",
    value: 7,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    icon: <Activity className="h-5 w-5 text-blue-600" />,
    label: "Medium",
    value: 14,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: <Eye className="h-5 w-5 text-gray-500" />,
    label: "Low",
    value: 22,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
];

const ROUTING_TABLE: RoutingRow[] = [
  {
    severity: "CRITICAL",
    badge: "bg-red-100 text-red-700",
    channels: [
      { icon: <MessageSquare className="h-3.5 w-3.5" />, label: "SMS" },
      { icon: <Mail className="h-3.5 w-3.5" />, label: "Email" },
      { icon: <Bell className="h-3.5 w-3.5" />, label: "Slack" },
    ],
    responseTime: "Immediate",
    responseBadge: "bg-red-100 text-red-700",
  },
  {
    severity: "HIGH",
    badge: "bg-amber-100 text-amber-700",
    channels: [
      { icon: <Mail className="h-3.5 w-3.5" />, label: "Email" },
      { icon: <Radio className="h-3.5 w-3.5" />, label: "Dashboard" },
    ],
    responseTime: "5 minutes",
    responseBadge: "bg-amber-100 text-amber-700",
  },
  {
    severity: "MEDIUM",
    badge: "bg-blue-100 text-blue-700",
    channels: [
      { icon: <Radio className="h-3.5 w-3.5" />, label: "Dashboard" },
      { icon: <Mail className="h-3.5 w-3.5" />, label: "Daily Digest" },
    ],
    responseTime: "24 hours",
    responseBadge: "bg-blue-100 text-blue-700",
  },
  {
    severity: "LOW",
    badge: "bg-gray-100 text-gray-600",
    channels: [
      { icon: <Radio className="h-3.5 w-3.5" />, label: "Dashboard" },
    ],
    responseTime: "Next review",
    responseBadge: "bg-gray-100 text-gray-600",
  },
];

const RECENT_ERRORS: ErrorEntry[] = [
  {
    id: "err-001",
    message: "Payment processing timeout",
    severity: "CRITICAL",
    severityBadge: "bg-red-100 text-red-700",
    affectedUsers: 12,
    lastSeen: "2 min ago",
    status: "Investigating",
    statusBadge: "bg-red-100 text-red-700",
    statusIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  {
    id: "err-002",
    message: "Product image upload failure",
    severity: "HIGH",
    severityBadge: "bg-amber-100 text-amber-700",
    affectedUsers: 3,
    lastSeen: "15 min ago",
    status: "Open",
    statusBadge: "bg-amber-100 text-amber-700",
    statusIcon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  {
    id: "err-003",
    message: "Search autocomplete empty result",
    severity: "MEDIUM",
    severityBadge: "bg-blue-100 text-blue-700",
    affectedUsers: 1,
    lastSeen: "1 hour ago",
    status: "Ignored",
    statusBadge: "bg-gray-100 text-gray-600",
    statusIcon: <Eye className="h-3.5 w-3.5" />,
  },
  {
    id: "err-004",
    message: "Footer link 404",
    severity: "LOW",
    severityBadge: "bg-gray-100 text-gray-600",
    affectedUsers: 0,
    lastSeen: "3 hours ago",
    status: "Resolved",
    statusBadge: "bg-emerald-100 text-emerald-700",
    statusIcon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  {
    id: "err-005",
    message: "Vendor payout batch timeout",
    severity: "CRITICAL",
    severityBadge: "bg-red-100 text-red-700",
    affectedUsers: 8,
    lastSeen: "28 min ago",
    status: "Investigating",
    statusBadge: "bg-red-100 text-red-700",
    statusIcon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
];

const CONFIG_ITEMS: ConfigItem[] = [
  { label: "Sentry Project", value: "kauvex-production" },
  { label: "Environment", value: "Production" },
  { label: "Sample Rate", value: "10%" },
  { label: "Release", value: "v2.0.0" },
];

/* -------------------------------------------------------------------------- */
/*                                 Subcomponents                              */
/* -------------------------------------------------------------------------- */

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center ${bgColor}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

export default function AdminMonitoringPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <AdminShell
      title="Error Monitoring & Alerting"
      description="Sentry-powered error tracking and severity-based alert routing"
    >
      <div className="px-6 py-8 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">
              Error Monitoring &amp; Alerting
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Sentry-powered error tracking and severity-based alert routing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Sentry Dashboard
            </a>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e55f00] disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Activity
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Alert Routing + Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Routing Table — spans 2 cols */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#FF6B00]" />
              <h2 className="text-base font-semibold text-[#0A1628]">
                Alert Routing Configuration
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Severity
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Channels
                    </th>
                    <th className="text-left font-medium text-gray-500 px-6 py-3">
                      Response Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ROUTING_TABLE.map((row) => (
                    <tr
                      key={row.severity}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${row.badge}`}
                        >
                          {row.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {row.channels.map((ch) => (
                            <span
                              key={ch.label}
                              className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                            >
                              {ch.icon}
                              {ch.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${row.responseBadge}`}
                        >
                          <Clock className="h-3 w-3" />
                          {row.responseTime}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#0A1628]" />
              <h2 className="text-base font-semibold text-[#0A1628]">
                Configuration
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {CONFIG_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-semibold text-[#0A1628] font-mono">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Zap className="h-3.5 w-3.5 text-[#FF6B00]" />
                <span>Alerts routed via Sentry webhook + custom integration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Errors Feed */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#FF6B00]" />
              <h2 className="text-base font-semibold text-[#0A1628]">
                Recent Errors
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search errors..."
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] w-56"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 px-6 py-3">
                    Error
                  </th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">
                    Severity
                  </th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">
                    Affected Users
                  </th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">
                    Last Seen
                  </th>
                  <th className="text-left font-medium text-gray-500 px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {RECENT_ERRORS.map((err) => (
                  <tr
                    key={err.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-medium text-[#0A1628]">
                        {err.message}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${err.severityBadge}`}
                      >
                        {err.severity}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">
                      {err.affectedUsers}{" "}
                      <span className="text-gray-400">
                        {err.affectedUsers === 1 ? "user" : "users"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                      {err.lastSeen}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${err.statusBadge}`}
                      >
                        {err.statusIcon}
                        {err.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
