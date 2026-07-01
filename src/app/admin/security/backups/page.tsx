"use client";

import { useState, useEffect, useCallback } from "react";

interface BackupStats {
  dailyCount: number;
  weeklyCount: number;
  monthlyCount: number;
  lastBackupDate: string;
  lastBackupSize: string;
  lastVerifiedRestore: string;
}

interface BackupRecord {
  id: string;
  type: string;
  fileName: string;
  size: string;
  status: string;
  createdAt: string;
}

export default function AdminBackupsPage() {
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/security/backups");
      if (!res.ok) throw new Error("Failed to load backups");
      const data = await res.json();
      setStats(data.stats);
      setBackups(data.backups);
    } catch {
      setMessage("Failed to load backup data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerBackup = async () => {
    try {
      setTriggering(true);
      setMessage("");
      const res = await fetch("/api/v1/admin/security/backups", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Backup triggered successfully.");
        fetchData();
      } else {
        setMessage(data.error || "Failed to trigger backup.");
      }
    } catch {
      setMessage("Failed to trigger backup.");
    } finally {
      setTriggering(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-400 bg-emerald-900/30";
      case "in_progress":
        return "text-amber-400 bg-amber-900/30";
      case "failed":
        return "text-red-400 bg-red-900/30";
      case "verified":
        return "text-sky-400 bg-sky-900/30";
      default:
        return "text-gray-400 bg-gray-800/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Backup Management</h1>
            <p className="text-gray-400 mt-1">
              Monitor and manage database & file backups
            </p>
          </div>
          <button
            onClick={triggerBackup}
            disabled={triggering}
            className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/90 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {triggering ? "Triggering..." : "Trigger Backup"}
          </button>
        </div>

        {message && (
          <div
            className={`px-4 py-3 rounded-lg text-sm ${
              message.includes("success")
                ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700"
                : "bg-red-900/40 text-red-300 border border-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading backups...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <StatCard label="Daily Backups" value={stats?.dailyCount ?? 0} />
              <StatCard label="Weekly Backups" value={stats?.weeklyCount ?? 0} />
              <StatCard label="Monthly Backups" value={stats?.monthlyCount ?? 0} />
              <StatCard
                label="Last Backup"
                value={stats?.lastBackupDate ?? "N/A"}
                isText
              />
              <StatCard
                label="Backup Size"
                value={stats?.lastBackupSize ?? "N/A"}
                isText
              />
              <StatCard
                label="Last Verified Restore"
                value={stats?.lastVerifiedRestore ?? "N/A"}
                isText
              />
            </div>

            <div className="bg-[#111c32] border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Backup History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="text-left px-6 py-3 font-medium">Type</th>
                      <th className="text-left px-6 py-3 font-medium">File Name</th>
                      <th className="text-left px-6 py-3 font-medium">Size</th>
                      <th className="text-left px-6 py-3 font-medium">Status</th>
                      <th className="text-left px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No backup records found.
                        </td>
                      </tr>
                    ) : (
                      backups.map((b) => (
                        <tr
                          key={b.id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                        >
                          <td className="px-6 py-3.5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FF6B00]/15 text-[#FF6B00]">
                              {b.type}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-300 font-mono text-xs">
                            {b.fileName}
                          </td>
                          <td className="px-6 py-3.5 text-gray-400">{b.size}</td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(
                                b.status
                              )}`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-gray-400">
                            {new Date(b.createdAt).toLocaleString()}
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

function StatCard({
  label,
  value,
  isText = false,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="bg-[#111c32] border border-gray-800 rounded-xl p-5">
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`mt-2 ${
          isText
            ? "text-sm text-gray-300"
            : "text-2xl font-bold text-white"
        }`}
      >
        {isText ? value : value.toLocaleString()}
      </p>
    </div>
  );
}
