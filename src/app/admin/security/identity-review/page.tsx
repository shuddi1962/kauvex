"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  FileText,
} from "lucide-react";

interface IdentityReview {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  provider: string;
  documentType: string;
  confidenceScore: number;
  status: string;
  submittedAt: string;
  documentUrl?: string;
  notes?: string;
}

interface ReviewStats {
  pending: number;
  passedToday: number;
  failedToday: number;
  manualQueue: number;
}

export default function IdentityReviewPage() {
  const [reviews, setReviews] = useState<IdentityReview[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    pending: 0,
    passedToday: 0,
    failedToday: 0,
    manualQueue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    review: IdentityReview;
    action: "approve" | "reject";
  } | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/admin/security/identity");
      if (!res.ok) throw new Error("Failed to load identity reviews");
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setStats(
        data.stats ?? {
          pending: 0,
          passedToday: 0,
          failedToday: 0,
          manualQueue: 0,
        }
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to load identity reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const openModal = (review: IdentityReview, action: "approve" | "reject") => {
    setActionModal({ review, action });
    setActionNotes("");
    setSubmitting(false);
  };

  const closeModal = () => {
    if (submitting) return;
    setActionModal(null);
    setActionNotes("");
  };

  const submitAction = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/security/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionModal.action,
          reviewId: actionModal.review.id,
          notes: actionNotes,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      setToast({
        type: "success",
        message: `Verification ${actionModal.action}d successfully`,
      });
      setActionModal(null);
      setActionNotes("");
      fetchData();
    } catch (err: any) {
      setToast({ type: "error", message: err.message ?? "Action failed" });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.userName.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      r.provider.toLowerCase().includes(q) ||
      r.documentType.toLowerCase().includes(q)
    );
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const confidenceBadge = (score: number) => {
    if (score >= 90)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {score}%
        </span>
      );
    if (score >= 70)
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {score}%
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {score}%
      </span>
    );
  };

  const statCards = [
    {
      label: "Pending Reviews",
      value: stats.pending,
      icon: <Clock className="h-5 w-5 text-[#FF6B00]" />,
      color: "bg-[#0A1628]",
      valueColor: "text-[#FF6B00]",
    },
    {
      label: "Passed Today",
      value: stats.passedToday,
      icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
      color: "bg-emerald-100",
      valueColor: "text-emerald-600",
    },
    {
      label: "Failed Today",
      value: stats.failedToday,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      color: "bg-red-100",
      valueColor: "text-red-600",
    },
    {
      label: "Manual Queue",
      value: stats.manualQueue,
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      color: "bg-amber-100",
      valueColor: "text-amber-600",
    },
  ];

  return (
    <AdminShell>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#0A1628] rounded-xl">
                  <ShieldCheck className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#0A1628]">
                    Identity Verification Review
                  </h1>
                  <p className="text-sm text-gray-500">
                    Review, approve, or reject user identity submissions
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A1628] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Toast */}
          {toast && (
            <div
              className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-sm ${
                toast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-current" />
              {toast.message}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#FF6B00]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 ${s.color} rounded-lg`}>{s.icon}</div>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
                  ) : (
                    s.value
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, role, provider, or document type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-colors"
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Failed to load identity reviews
                </p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button
                  onClick={fetchData}
                  className="text-sm font-medium text-red-700 underline mt-2 hover:text-red-900"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Table Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0A1628]">
                    Pending Verifications
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredReviews.length} verification
                    {filteredReviews.length !== 1 ? "s" : ""} found
                  </p>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-[#FF6B00] animate-spin mb-4" />
                <p className="text-sm text-gray-500">
                  Loading verifications...
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredReviews.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center">
                <div className="p-3 bg-emerald-50 rounded-full mb-4">
                  <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-[#0A1628]">
                  {searchQuery
                    ? "No matching verifications"
                    : "No pending identity verifications"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "All caught up for today"}
                </p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && filteredReviews.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Provider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Document Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#0A1628] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReviews.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-[#0A1628]">
                              {r.userName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {r.userEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0A1628]/5 text-[#0A1628] border border-[#0A1628]/20">
                            {r.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {r.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                            <FileText className="h-3.5 w-3.5 text-gray-400" />
                            {r.documentType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {confidenceBadge(r.confidenceScore)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDateTime(r.submittedAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setExpandedRow(
                                  expandedRow === r.id ? null : r.id
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-[#0A1628] hover:bg-gray-100 rounded-lg transition-colors"
                              title="View details"
                            >
                              {expandedRow === r.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => openModal(r, "approve")}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#FF6B00] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#e55f00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => openModal(r, "reject")}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Expanded Detail Row */}
                {expandedRow && (() => {
                  const r = filteredReviews.find((rev) => rev.id === expandedRow);
                  if (!r) return null;
                  return (
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-3">
                            User Info
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">User ID</span>
                              <span className="font-mono text-[#0A1628] text-xs">
                                {r.userId}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Name</span>
                              <span className="font-medium text-[#0A1628]">
                                {r.userName}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Email</span>
                              <span className="text-[#0A1628]">{r.userEmail}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-3">
                            Verification Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Provider</span>
                              <span className="text-[#0A1628]">{r.provider}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Document</span>
                              <span className="text-[#0A1628]">{r.documentType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Confidence</span>
                              {confidenceBadge(r.confidenceScore)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider mb-3">
                            Timeline
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Submitted</span>
                              <span className="text-[#0A1628]">
                                {formatDate(r.submittedAt)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Status</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                {r.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-semibold text-[#0A1628]">
                {actionModal.action === "approve" ? "Approve" : "Reject"}{" "}
                Verification
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              {/* User summary */}
              <div className="mb-5 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[#0A1628]">
                      {actionModal.review.userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {actionModal.review.userEmail}
                    </p>
                  </div>
                  {confidenceBadge(actionModal.review.confidenceScore)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#0A1628]/5 px-2 py-0.5 text-xs font-medium text-[#0A1628]">
                    <User className="h-3 w-3" />
                    {actionModal.review.role}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {actionModal.review.provider}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                    <FileText className="h-3 w-3" />
                    {actionModal.review.documentType}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Submitted {formatDate(actionModal.review.submittedAt)}
                </p>
              </div>

              {/* Reject warning */}
              {actionModal.action === "reject" && (
                <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p>
                    The user will be notified and may need to resubmit
                    verification documents.
                  </p>
                </div>
              )}

              {/* Notes textarea */}
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-700">
                  Reviewer Notes
                  {actionModal.action === "reject" && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </span>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  placeholder={
                    actionModal.action === "approve"
                      ? "Optional notes about this approval..."
                      : "Provide a reason for rejection..."
                  }
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30"
                />
              </label>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={
                  submitting ||
                  (actionModal.action === "reject" && !actionNotes.trim())
                }
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  actionModal.action === "approve"
                    ? "bg-[#FF6B00] hover:bg-[#e55f00] focus:ring-[#FF6B00]"
                    : "bg-red-600 hover:bg-red-700 focus:ring-red-400"
                } focus:outline-none focus:ring-2 focus:ring-offset-1`}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : actionModal.action === "approve" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {submitting
                  ? "Processing..."
                  : actionModal.action === "approve"
                    ? "Confirm Approve"
                    : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
