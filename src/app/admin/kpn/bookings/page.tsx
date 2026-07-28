"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Eye, UserPlus, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  id: string;
  serviceType: string;
  serviceFee: number;
  currencyCode: string;
  status: string;
  scheduledDate: string | null;
  createdAt: string;
  professionalId: string | null;
  customerId: string;
  professional?: { companyName: string | null } | null;
}

const STATUS_OPTIONS = ["all", "scheduled", "professional_assigned", "in_progress", "completed", "disputed", "cancelled"];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "15");

    // Use a generic approach - try an admin bookings endpoint
    fetch(`/api/v1/kpn/search?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setBookings(res.data.data || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, [page, statusFilter]);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-50 text-blue-700",
      professional_assigned: "bg-violet-50 text-violet-700",
      professional_en_route: "bg-amber-50 text-amber-700",
      checked_in: "bg-cyan-50 text-cyan-700",
      in_progress: "bg-orange-50 text-orange-700",
      completed: "bg-green-50 text-green-700",
      disputed: "bg-red-50 text-red-700",
      cancelled: "bg-gray-50 text-gray-600",
    };
    return colors[status] || "bg-gray-50 text-gray-600";
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Status" : s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Professional</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Scheduled</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">No bookings found</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{booking.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm text-kauvex-navy font-medium">{booking.serviceType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{booking.professional?.companyName || "Unassigned"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {booking.currencyCode} {booking.serviceFee?.toLocaleString() || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(booking.status)}`}>
                        {booking.status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-kauvex-navy"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {(!booking.professionalId || booking.status === "scheduled") && (
                          <button
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"
                            title="Assign professional"
                          >
                            <UserPlus size={14} />
                          </button>
                        )}
                        {(booking.status === "scheduled" || booking.status === "professional_assigned") && (
                          <button
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                            title="Cancel booking"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
