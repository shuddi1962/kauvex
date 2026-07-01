"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  TrendingUp,
  AlertTriangle,
  Ban,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Clock,
  XCircle,
  CheckCircle,
  Loader2,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  CreditCard,
  Globe,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface FraudStats {
  flaggedToday: number;
  heldOrders: number;
  declinedOrders: number;
  fraudPreventedAmount: number;
  flaggedTrend: number;
  heldTrend: number;
  declinedTrend: number;
  amountTrend: number;
}

interface FlaggedTransaction {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  order: {
    id: string;
    number: string;
    amount: number;
    currency: string;
  };
  riskScore: number;
  riskFactors: string[];
  outcome: "pending" | "held" | "declined" | "approved" | "investigating";
  createdAt: string;
  ipAddress: string;
  deviceFingerprint: string;
}

interface BlacklistItem {
  id: string;
  type: "ip" | "email" | "card_bin";
  value: string;
  reason: string;
  addedBy: string;
  createdAt: string;
}

export default function AdminFraudDashboard() {
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [transactions, setTransactions] = useState<FlaggedTransaction[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [showAddBlacklist, setShowAddBlacklist] = useState(false);
  const [newBlacklistType, setNewBlacklistType] = useState<"ip" | "email" | "card_bin">("ip");
  const [newBlacklistValue, setNewBlacklistValue] = useState("");
  const [newBlacklistReason, setNewBlacklistReason] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, txRes, blRes] = await Promise.all([
        fetch("/api/v1/admin/security/fraud/stats"),
        fetch(`/api/v1/admin/security/fraud/transactions?${new URLSearchParams({
          ...(outcomeFilter !== "all" && { outcome: outcomeFilter }),
          ...(searchQuery && { search: searchQuery }),
        })}`),
        fetch("/api/v1/admin/security/fraud/blacklist"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
      if (blRes.ok) {
        const blData = await blRes.json();
        setBlacklist(blData.blacklist || []);
      }
    } catch (error) {
      console.error("Failed to fetch fraud data:", error);
    } finally {
      setLoading(false);
    }
  }, [outcomeFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddBlacklist = async () => {
    if (!newBlacklistValue.trim() || !newBlacklistReason.trim()) return;
    setBlacklistLoading(true);
    try {
      const res = await fetch("/api/v1/admin/security/fraud/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newBlacklistType,
          value: newBlacklistValue,
          reason: newBlacklistReason,
        }),
      });
      if (res.ok) {
        setNewBlacklistValue("");
        setNewBlacklistReason("");
        setShowAddBlacklist(false);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add to blacklist:", error);
    } finally {
      setBlacklistLoading(false);
    }
  };

  const handleRemoveBlacklist = async (id: string) => {
    setBlacklistLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/security/fraud/blacklist?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to remove from blacklist:", error);
    } finally {
      setBlacklistLoading(false);
    }
  };

  const handleOutcomeChange = async (txId: string, newOutcome: string) => {
    try {
      const res = await fetch(`/api/v1/admin/security/fraud/transactions/${txId}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: newOutcome }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update outcome:", error);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score <= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRiskDotColor = (score: number) => {
    if (score <= 30) return "bg-emerald-500";
    if (score <= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  const getOutcomeConfig = (outcome: string) => {
    switch (outcome) {
      case "pending":
        return { label: "Pending", icon: Clock, color: "text-[#0A1628] bg-[#0A1628]/5 border-[#0A1628]/20" };
      case "held":
        return { label: "Held", icon: ShieldAlert, color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "declined":
        return { label: "Declined", icon: XCircle, color: "text-red-600 bg-red-50 border-red-200" };
      case "approved":
        return { label: "Approved", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
      case "investigating":
        return { label: "Investigating", icon: Eye, color: "text-purple-600 bg-purple-50 border-purple-200" };
      default:
        return { label: outcome, icon: Clock, color: "text-gray-600 bg-gray-50 border-gray-200" };
    }
  };

  const formatCurrency = (amount: number, currency = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id]
    );
  };

  return (
    <AdminShell>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#0A1628] rounded-xl">
                    <ShieldAlert className="h-6 w-6 text-[#FF6B00]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#0A1628]">
                      Fraud Detection Center
                    </h1>
                    <p className="text-sm text-gray-500">
                      Monitor and manage suspicious activities across the platform
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A1628] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] rounded-lg hover:bg-[#FF6B00]/90 transition-colors">
                  <Download className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#FF6B00]/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${stats.flaggedTrend >= 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {stats.flaggedTrend >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stats.flaggedTrend)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{stats.flaggedToday}</p>
                <p className="text-sm text-gray-500 mt-1">Flagged Today</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#FF6B00]/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${stats.heldTrend >= 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {stats.heldTrend >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stats.heldTrend)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{stats.heldOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Held Orders</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#FF6B00]/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-[#0A1628]/5 rounded-lg">
                    <ShieldX className="h-5 w-5 text-[#0A1628]" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${stats.declinedTrend >= 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {stats.declinedTrend >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stats.declinedTrend)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{stats.declinedOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Declined Orders</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#FF6B00]/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${stats.amountTrend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {stats.amountTrend >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stats.amountTrend)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">
                  {formatCurrency(stats.fraudPreventedAmount)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Fraud Prevented</p>
              </div>
            </div>
          ) : null}

          {/* Filters & Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, email, order #, or IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-colors"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={outcomeFilter}
                    onChange={(e) => setOutcomeFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] appearance-none cursor-pointer"
                  >
                    <option value="all">All Outcomes</option>
                    <option value="pending">Pending</option>
                    <option value="held">Held</option>
                    <option value="declined">Declined</option>
                    <option value="approved">Approved</option>
                    <option value="investigating">Investigating</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Flagged Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0A1628]">
                    Flagged Transactions
                  </h2>
                  <p className="text-sm text-gray-500">
                    {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                {selectedTransactions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {selectedTransactions.length} selected
                    </span>
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                      Bulk Decline
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-[#0A1628] bg-[#0A1628]/5 rounded-lg hover:bg-[#0A1628]/10 transition-colors">
                      Bulk Approve
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#FF6B00] animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading flagged transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="p-3 bg-emerald-50 rounded-full mb-4">
                  <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-[#0A1628]">No flagged transactions</p>
                <p className="text-xs text-gray-500 mt-1">All clear for today</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.length === transactions.length}
                          onChange={() =>
                            setSelectedTransactions(
                              selectedTransactions.length === transactions.length
                                ? []
                                : transactions.map((tx) => tx.id)
                            )
                          }
                          className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Risk Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Outcome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                      const outcomeConfig = getOutcomeConfig(tx.outcome);
                      const OutcomeIcon = outcomeConfig.icon;
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(tx.id)}
                              onChange={() => toggleTransactionSelection(tx.id)}
                              className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-[#0A1628]">
                                {tx.user.name}
                              </p>
                              <p className="text-xs text-gray-500">{tx.user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-[#0A1628] font-mono">
                                #{tx.order.number}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(tx.order.amount, tx.order.currency)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${getRiskDotColor(tx.riskScore)}`}
                              />
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(
                                  tx.riskScore
                                )}`}
                              >
                                {tx.riskScore}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${outcomeConfig.color}`}
                            >
                              <OutcomeIcon className="h-3 w-3" />
                              {outcomeConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">
                              {formatDate(tx.createdAt)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setExpandedRow(
                                    expandedRow === tx.id ? null : tx.id
                                  )
                                }
                                className="p-1.5 text-gray-400 hover:text-[#0A1628] hover:bg-gray-100 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {tx.outcome === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleOutcomeChange(tx.id, "approved")}
                                    className="p-1.5 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOutcomeChange(tx.id, "declined")}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Decline"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOutcomeChange(tx.id, "held")}
                                    className="p-1.5 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="Hold"
                                  >
                                    <ShieldAlert className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Expanded Row Detail */}
            {expandedRow && (
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                {(() => {
                  const tx = transactions.find((t) => t.id === expandedRow);
                  if (!tx) return null;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-3">
                          Transaction Details
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Transaction ID</span>
                            <span className="font-mono text-[#0A1628]">{tx.id}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Order Amount</span>
                            <span className="font-medium text-[#0A1628]">
                              {formatCurrency(tx.order.amount, tx.order.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-3">
                          Device & Location
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">IP Address</span>
                            <span className="font-mono text-[#0A1628]">{tx.ipAddress}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Device Fingerprint</span>
                            <span className="font-mono text-[#0A1628] text-xs">
                              {tx.deviceFingerprint}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-3">
                          Risk Factors
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tx.riskFactors.map((factor, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Blacklist Management */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0A1628]">
                    Blacklist Management
                  </h2>
                  <p className="text-sm text-gray-500">
                    Block IPs, emails, and card BINs from the platform
                  </p>
                </div>
                <button
                  onClick={() => setShowAddBlacklist(!showAddBlacklist)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0A1628] rounded-lg hover:bg-[#0A1628]/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add to Blacklist
                </button>
              </div>
            </div>

            {/* Add Blacklist Form */}
            {showAddBlacklist && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-2">
                      Type
                    </label>
                    <select
                      value={newBlacklistType}
                      onChange={(e) =>
                        setNewBlacklistType(e.target.value as "ip" | "email" | "card_bin")
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    >
                      <option value="ip">IP Address</option>
                      <option value="email">Email</option>
                      <option value="card_bin">Card BIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-2">
                      Value
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        {newBlacklistType === "ip" && (
                          <Globe className="h-4 w-4 text-gray-400" />
                        )}
                        {newBlacklistType === "email" && (
                          <Mail className="h-4 w-4 text-gray-400" />
                        )}
                        {newBlacklistType === "card_bin" && (
                          <CreditCard className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={
                          newBlacklistType === "ip"
                            ? "192.168.1.1"
                            : newBlacklistType === "email"
                            ? "user@example.com"
                            : "411111"
                        }
                        value={newBlacklistValue}
                        onChange={(e) => setNewBlacklistValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-2">
                      Reason
                    </label>
                    <input
                      type="text"
                      placeholder="Reason for blacklisting..."
                      value={newBlacklistReason}
                      onChange={(e) => setNewBlacklistReason(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleAddBlacklist}
                      disabled={blacklistLoading || !newBlacklistValue.trim() || !newBlacklistReason.trim()}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] rounded-lg hover:bg-[#FF6B00]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {blacklistLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddBlacklist(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Blacklist Table */}
            {blacklistLoading && !showAddBlacklist ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#FF6B00] animate-spin mb-4" />
                <p className="text-sm text-gray-500">Loading blacklist...</p>
              </div>
            ) : blacklist.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="p-3 bg-gray-100 rounded-full mb-4">
                  <Ban className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-[#0A1628]">No blacklisted items</p>
                <p className="text-xs text-gray-500 mt-1">The blacklist is empty</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Added By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blacklist.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0A1628]/5 text-[#0A1628] border border-[#0A1628]/20">
                            {item.type === "ip" && <Globe className="h-3 w-3" />}
                            {item.type === "email" && <Mail className="h-3 w-3" />}
                            {item.type === "card_bin" && <CreditCard className="h-3 w-3" />}
                            {item.type === "ip"
                              ? "IP"
                              : item.type === "email"
                              ? "Email"
                              : "Card BIN"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-[#0A1628]">
                            {item.value}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{item.reason}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{item.addedBy}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(item.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRemoveBlacklist(item.id)}
                            disabled={blacklistLoading}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove from blacklist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
