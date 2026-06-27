"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Clock,
  Package,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  BarChart3,
  Filter,
  X,
} from "lucide-react";

interface LockerHistoryEntry {
  id: string;
  bookingId: string;
  lockerName: string;
  location: string;
  dateIn: string;
  dateOut: string;
  status: "completed" | "expired" | "cancelled";
  contents: string;
  compartmentSize: string;
  durationHours: number;
}

const MOCK_HISTORY: LockerHistoryEntry[] = [
  {
    id: "1",
    bookingId: "LBK-2026-0001",
    lockerName: "Lekki Phase 1 Locker Hub",
    location: "14 Admiralty Way, Lekki, Lagos",
    dateIn: "2026-06-20T14:30:00Z",
    dateOut: "2026-06-21T09:15:00Z",
    status: "completed",
    contents: "Electronics — Wireless Earbuds",
    compartmentSize: "Small",
    durationHours: 19,
  },
  {
    id: "2",
    bookingId: "LBK-2026-0002",
    lockerName: "Victoria Island Express Locker",
    location: "Plot 1231, Ahmadu Bello Way, VI, Lagos",
    dateIn: "2026-06-18T10:00:00Z",
    dateOut: "2026-06-19T16:45:00Z",
    status: "completed",
    contents: "Fashion — Summer Dress Collection",
    compartmentSize: "Medium",
    durationHours: 31,
  },
  {
    id: "3",
    bookingId: "LBK-2026-0003",
    lockerName: "Ikeja City Mall Pickup Point",
    location: "Obafemi Awolowo Way, Ikeja, Lagos",
    dateIn: "2026-06-15T08:00:00Z",
    dateOut: "2026-06-18T08:00:00Z",
    status: "expired",
    contents: "Books — 3x Paperback Novels",
    compartmentSize: "Small",
    durationHours: 72,
  },
  {
    id: "4",
    bookingId: "LBK-2026-0004",
    lockerName: "Yaba Tech Hub Locker",
    location: "12 Herbert Macaulay Way, Yaba, Lagos",
    dateIn: "2026-06-12T16:20:00Z",
    dateOut: "2026-06-12T16:20:00Z",
    status: "cancelled",
    contents: "Home — Kitchen Utensil Set",
    compartmentSize: "Large",
    durationHours: 0,
  },
  {
    id: "5",
    bookingId: "LBK-2026-0005",
    lockerName: "Surulere Community Locker",
    location: "56 Adeniran Ogunsanya St, Surulere, Lagos",
    dateIn: "2026-06-10T11:00:00Z",
    dateOut: "2026-06-11T14:30:00Z",
    status: "completed",
    contents: "Health — Vitamins & Supplements",
    compartmentSize: "XS",
    durationHours: 28,
  },
  {
    id: "6",
    bookingId: "LBK-2026-0006",
    lockerName: "Lekki Mall Drive-Thru Locker",
    location: "14 Admiralty Road, Lekki, Lagos",
    dateIn: "2026-06-08T09:45:00Z",
    dateOut: "2026-06-11T09:45:00Z",
    status: "expired",
    contents: "Beauty — Skincare Bundle",
    compartmentSize: "Medium",
    durationHours: 72,
  },
  {
    id: "7",
    bookingId: "LBK-2026-0007",
    lockerName: "Lekki Phase 1 Locker Hub",
    location: "14 Admiralty Way, Lekki, Lagos",
    dateIn: "2026-06-05T13:10:00Z",
    dateOut: "2026-06-05T17:00:00Z",
    status: "completed",
    contents: "Documents — Passport & ID Cards",
    compartmentSize: "XS",
    durationHours: 4,
  },
  {
    id: "8",
    bookingId: "LBK-2026-0008",
    lockerName: "Victoria Island Express Locker",
    location: "Plot 1231, Ahmadu Bello Way, VI, Lagos",
    dateIn: "2026-06-02T15:30:00Z",
    dateOut: "2026-06-03T11:20:00Z",
    status: "completed",
    contents: "Sports — Running Shoes (Nike)",
    compartmentSize: "Medium",
    durationHours: 20,
  },
  {
    id: "9",
    bookingId: "LBK-2026-0009",
    lockerName: "Ikeja City Mall Pickup Point",
    location: "Obafemi Awolowo Way, Ikeja, Lagos",
    dateIn: "2026-05-28T10:00:00Z",
    dateOut: "2026-05-28T10:00:00Z",
    status: "cancelled",
    contents: "Accessories — Leather Wallet",
    compartmentSize: "XS",
    durationHours: 0,
  },
  {
    id: "10",
    bookingId: "LBK-2026-0010",
    lockerName: "Surulere Community Locker",
    location: "56 Adeniran Ogunsanya St, Surulere, Lagos",
    dateIn: "2026-05-25T14:00:00Z",
    dateOut: "2026-05-27T10:30:00Z",
    status: "completed",
    contents: "Kitchen — Air Fryer Accessories",
    compartmentSize: "Large",
    durationHours: 45,
  },
];

const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; label: string; icon: typeof Package }
> = {
  completed: {
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    label: "Completed",
    icon: CheckCircle2,
  },
  expired: {
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    label: "Expired",
    icon: AlertTriangle,
  },
  cancelled: {
    color: "text-gray-500",
    bg: "bg-gray-50 border-gray-200",
    label: "Cancelled",
    icon: RotateCcw,
  },
};

type StatusFilter = "all" | "completed" | "expired" | "cancelled";

export default function LockerHistoryPage() {
  const [history] = useState<LockerHistoryEntry[]>(MOCK_HISTORY);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return history.filter((entry) => {
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      if (
        q &&
        !entry.bookingId.toLowerCase().includes(q) &&
        !entry.lockerName.toLowerCase().includes(q) &&
        !entry.contents.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [history, statusFilter, searchQuery]);

  const totalBookings = history.length;
  const thisMonthBookings = history.filter((e) => {
    const d = new Date(e.dateIn);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const avgDuration =
    history.length > 0
      ? Math.round(history.reduce((sum, e) => sum + e.durationHours, 0) / history.length)
      : 0;
  const completedCount = history.filter((e) => e.status === "completed").length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    const header = "Booking ID,Locker,Location,Date In,Date Out,Status,Contents,Duration (hrs)";
    const rows = filtered.map(
      (e) =>
        `${e.bookingId},"${e.lockerName}","${e.location}",${e.dateIn},${e.dateOut},${e.status},"${e.contents}",${e.durationHours}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `locker-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalBookings },
    { key: "completed", label: "Completed", count: history.filter((e) => e.status === "completed").length },
    { key: "expired", label: "Expired", count: history.filter((e) => e.status === "expired").length },
    { key: "cancelled", label: "Cancelled", count: history.filter((e) => e.status === "cancelled").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Locker History</h1>
          <p className="text-sm text-gray-500 mt-1">Review your past locker bookings and usage</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-[#0A1628] text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Bookings</p>
              <p className="text-xl font-bold text-[#0A1628]">{totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-xl font-bold text-[#0A1628]">{thisMonthBookings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Duration</p>
              <p className="text-xl font-bold text-[#0A1628]">{avgDuration}h</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completion Rate</p>
              <p className="text-xl font-bold text-[#0A1628]">
                {totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by booking ID, locker, or contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
          />
        </div>
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                statusFilter === f.key
                  ? "bg-[#FF6B00] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] px-1 py-0.5 rounded-full ${
                  statusFilter === f.key ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0A1628]">No History Found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters or search term."
              : "Your locker booking history will appear here."}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Locker
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date In
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Out
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contents
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((entry) => {
                  const cfg = STATUS_CONFIG[entry.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <span className="font-mono font-semibold text-[#FF6B00] text-xs">
                          {entry.bookingId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#0A1628] text-xs">{entry.lockerName}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {entry.location.split(",").slice(0, 2).join(",")}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-[#0A1628]">{formatDate(entry.dateIn)}</div>
                        <div className="text-[11px] text-gray-400">{formatTime(entry.dateIn)}</div>
                      </td>
                      <td className="px-5 py-4">
                        {entry.status === "cancelled" ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : (
                          <>
                            <div className="text-xs text-[#0A1628]">{formatDate(entry.dateOut)}</div>
                            <div className="text-[11px] text-gray-400">{formatTime(entry.dateOut)}</div>
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-[#0A1628] max-w-[200px] truncate">
                          {entry.contents}
                        </div>
                        <div className="text-[11px] text-gray-400">{entry.compartmentSize} compartment</div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-xs font-medium text-[#0A1628]">
                          {entry.status === "cancelled" ? "—" : `${entry.durationHours}h`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-[#F5F7FA] border-t border-gray-200 text-xs text-gray-500">
            Showing {filtered.length} of {totalBookings} bookings
          </div>
        </div>
      )}
    </div>
  );
}
