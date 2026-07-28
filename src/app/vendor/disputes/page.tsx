"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface Dispute {
  id: string;
  orderId: string;
  type: string;
  status: string;
  adminDecision: string | null;
  refundAmount: number;
  openedAt: string;
  messages: { id: string; message: string; senderRole: string; createdAt: string }[];
}

export default function VendorDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, inFavor: 0, atRisk: 0 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/vendor/disputes").then((r) => r.json()),
      fetch("/api/v1/vendor/disputes?stats=true").then((r) => r.json()),
    ]).then(([d, s]) => {
      setDisputes(d.disputes || []);
      setStats(s);
    }).catch(() => {});
  }, []);

  const statusColor: Record<string, string> = {
    open: "bg-yellow-50 text-yellow-600",
    under_review: "bg-blue-50 text-blue",
    accepted: "bg-orange/10 text-orange",
    resolved: "bg-green-50 text-green-600",
    closed: "bg-gray-100 text-text-4",
  };

  const filtered = disputes.filter((d) =>
    d.type?.toLowerCase().includes(search.toLowerCase()) ||
    d.status?.includes(search.toLowerCase()) ||
    d.orderId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-800 text-navy">Disputes</h1>
        <p className="text-sm text-text-3 mt-1">Manage customer claims and A-to-Z disputes</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "bg-navy text-white" },
          { label: "Open", value: stats.open, color: "bg-yellow-50 text-yellow-600" },
          { label: "Resolved", value: stats.resolved, color: "bg-green-50 text-green-600" },
          { label: "Won", value: stats.inFavor, color: "bg-blue-50 text-blue" },
          { label: "At Risk", value: stats.atRisk, color: "bg-red-50 text-red" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-border p-4">
            <p className="text-lg font-800">{c.value}</p>
            <p className="text-xs text-text-3">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <Search className="w-4 h-4 text-text-3" />
          <input type="text" placeholder="Search disputes..." className="text-sm outline-none flex-1" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-3 text-xs">
                <th className="text-left p-3 font-medium">Order</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-center p-3 font-medium">Decision</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{d.orderId?.slice(0, 12)}...</td>
                  <td className="p-3 text-xs max-w-[200px] truncate">{d.type}</td>
                  <td className="p-3 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[d.status] || ""}`}>{d.status.replace("_", " ")}</span></td>
                  <td className="p-3 text-center">{d.adminDecision ? <span className="capitalize text-xs">{d.adminDecision}</span> : <span className="text-text-4 text-xs">—</span>}</td>
                  <td className="p-3 text-right font-medium">₦{Number(d.refundAmount || 0).toLocaleString()}</td>
                  <td className="p-3 text-xs text-text-3">{new Date(d.openedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <button className="text-xs text-orange hover:underline">View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-text-3">No disputes found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}