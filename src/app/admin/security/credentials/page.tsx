"use client";

import { useState, useEffect, useCallback } from "react";

interface Credential {
  id: string;
  name: string;
  environment: string;
  lastRotated: string;
  status: string;
}

interface AuditEntry {
  id: string;
  action: string;
  credentialName: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

export default function AdminCredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/security/credentials");
      if (!res.ok) throw new Error("Failed to load credentials");
      const data = await res.json();
      setCredentials(data.credentials);
      setAuditLog(data.auditLog);
    } catch {
      // silent fail on mount
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            OK
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-900/30 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Warning
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            {status}
          </span>
        );
    }
  };

  const filteredCredentials =
    filter === "all"
      ? credentials
      : credentials.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Credential Rotation</h1>
          <p className="text-gray-400 mt-1">
            Track API keys, secrets, and certificate rotation status
          </p>
        </div>

        <div className="flex items-center gap-3">
          {["all", "ok", "warning", "overdue"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#FF6B00] text-white"
                  : "bg-[#111c32] text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading credentials...
          </div>
        ) : (
          <>
            <div className="bg-[#111c32] border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">
                  Credentials
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left px-6 py-3 font-medium">Name</th>
                      <th className="text-left px-6 py-3 font-medium">
                        Environment
                      </th>
                      <th className="text-left px-6 py-3 font-medium">
                        Last Rotated
                      </th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCredentials.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No credentials found.
                        </td>
                      </tr>
                    ) : (
                      filteredCredentials.map((cred) => (
                        <tr
                          key={cred.id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="px-6 py-3.5">
                            <span className="text-white font-medium">
                              {cred.name}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                              {cred.environment}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-400">
                            {cred.lastRotated
                              ? new Date(cred.lastRotated).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "Never"}
                          </td>
                          <td className="px-6 py-3.5">
                            {statusBadge(cred.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#111c32] border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">
                  Audit Log
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left px-6 py-3 font-medium">
                        Action
                      </th>
                      <th className="text-left px-6 py-3 font-medium">
                        Credential
                      </th>
                      <th className="text-left px-6 py-3 font-medium">
                        Performed By
                      </th>
                      <th className="text-left px-6 py-3 font-medium">
                        Timestamp
                      </th>
                      <th className="text-left px-6 py-3 font-medium">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No audit entries found.
                        </td>
                      </tr>
                    ) : (
                      auditLog.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                entry.action === "rotate"
                                  ? "bg-[#FF6B00]/15 text-[#FF6B00]"
                                  : entry.action === "create"
                                  ? "bg-emerald-900/30 text-emerald-400"
                                  : entry.action === "revoke"
                                  ? "bg-red-900/30 text-red-400"
                                  : "bg-gray-800 text-gray-400"
                              }`}
                            >
                              {entry.action}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-300">
                            {entry.credentialName}
                          </td>
                          <td className="px-6 py-3.5 text-gray-400">
                            {entry.performedBy}
                          </td>
                          <td className="px-6 py-3.5 text-gray-400">
                            {new Date(entry.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-3.5 text-gray-500 text-xs">
                            {entry.details}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
