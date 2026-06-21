"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Filter, Calendar, Search, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface AuditEntry {
  id: string;
  actor: string;
  targetUser: string;
  action: string;
  details: string;
  timestamp: string;
}

const MOCK_AUDIT: AuditEntry[] = [
  {
    id: "1",
    actor: "Alice Johnson",
    targetUser: "Bob Smith",
    action: "Permission Modified",
    details: "Changed 'Sponsored Products' from View to View & Edit",
    timestamp: "2026-06-20T14:30:00",
  },
  {
    id: "2",
    actor: "Alice Johnson",
    targetUser: "Carol Davis",
    action: "Permission Modified",
    details: "Changed 'Reviews' from None to View & Edit",
    timestamp: "2026-06-19T11:15:00",
  },
  {
    id: "3",
    actor: "System",
    targetUser: "Bob Smith",
    action: "User Invited",
    details: "Invitation sent with Manager role",
    timestamp: "2026-06-18T09:00:00",
  },
  {
    id: "4",
    actor: "Alice Johnson",
    targetUser: "Carol Davis",
    action: "Access Revoked",
    details: "Removed access to 'Internal Tools' module",
    timestamp: "2026-06-17T16:45:00",
  },
  {
    id: "5",
    actor: "System",
    targetUser: "Carol Davis",
    action: "User Invited",
    details: "Invitation sent with Support role",
    timestamp: "2026-06-15T10:30:00",
  },
  {
    id: "6",
    actor: "Alice Johnson",
    targetUser: "Global",
    action: "Global Permission Updated",
    details: "Updated default permission template for new users",
    timestamp: "2026-06-14T08:20:00",
  },
  {
    id: "7",
    actor: "Alice Johnson",
    targetUser: "Bob Smith",
    action: "Permission Modified",
    details: "Changed 'Campaign Manager' from View to View & Edit",
    timestamp: "2026-06-12T13:00:00",
  },
  {
    id: "8",
    actor: "System",
    targetUser: "Alice Johnson",
    action: "Role Assigned",
    details: "Granted Admin role with full access",
    timestamp: "2026-06-10T07:00:00",
  },
];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PermissionsHistoryPage() {
  const [entries] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = entries.filter((e) => {
    const matchesSearch =
      e.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.targetUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.details.toLowerCase().includes(searchQuery.toLowerCase());

    const entryDate = new Date(e.timestamp);
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;

    const matchesDate =
      (!from || entryDate >= from) && (!to || entryDate <= to);

    return matchesSearch && matchesDate;
  });

  return (
    <VendorShell
      title="Permissions History"
      subtitle="Audit log of permission changes"
    >
      <div className="flex items-center mb-4">
        <Link
          href="/vendor/settings/permissions"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600"
        >
          <ArrowLeft size={14} /> Back to Permissions
        </Link>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">
              Filters
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actor, target, action..."
                className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 px-3 text-sm border border-gray-200 rounded-lg"
              />
            </div>
            {(searchQuery || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                  Actor
                </th>
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                  Target User
                </th>
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                  Details
                </th>
                <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <UserCheck
                      size={32}
                      className="mx-auto text-gray-200 mb-2"
                    />
                    <p className="text-sm text-gray-400">
                      No audit entries found
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-gray-700">
                        {entry.actor}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {entry.targetUser}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          entry.action.includes("Modified")
                            ? "bg-amber-100 text-amber-700"
                            : entry.action.includes("Revoked")
                              ? "bg-red-100 text-red-700"
                              : entry.action.includes("Invited") || entry.action.includes("Assigned")
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 max-w-xs truncate">
                      {entry.details}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-gray-400 whitespace-nowrap">
                      {formatDateTime(entry.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Showing {filtered.length} of {entries.length} audit entries
        </p>
      </div>
    </VendorShell>
  );
}
