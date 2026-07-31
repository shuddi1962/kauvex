"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, fmtDate, fmtMoney, initials } from "@/components/k-platform/shared";

export default function KPlatformEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/k-platform/earnings")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setData(j.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  const markPaid = async (id: string) => {
    await fetch("/api/v1/k-platform/earnings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-paid", id }),
    });
    setData((prev: any) => ({
      ...prev,
      earnings: prev.earnings.map((e: any) => (e.id === id ? { ...e, status: "paid" } : e)),
      summary: { ...prev.summary, pending: prev.summary.pending - Number(prev.earnings.find((e: any) => e.id === id)?.amount ?? 0), paid: prev.summary.paid + Number(prev.earnings.find((e: any) => e.id === id)?.amount ?? 0) },
    }));
  };

  if (!data) return <div className="text-sm text-text-2">{error ? `Error: ${error}` : "Loading…"}</div>;

  const s = data.summary;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Earnings"
        subtitle="Commissions from module sales, in one place"
        icon={<Wallet className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Earnings" value={fmtMoney(s.total, "USD")} icon={<Wallet className="w-4 h-4" />} />
        <StatCard label="Pending" value={fmtMoney(s.pending, "USD")} icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Paid" value={fmtMoney(s.paid, "USD")} icon={<CheckCircle2 className="w-4 h-4" />} />
        <StatCard label="Transactions" value={data.earnings.length} icon={<TrendingUp className="w-4 h-4" />} />
      </div>

      <div className="bg-white rounded-xl border border-border divide-y divide-border">
        {data.earnings.length === 0 && <p className="p-6 text-sm text-text-2">No earnings yet. Publish a module with a price and earn commission on every install.</p>}
        {data.earnings.map((e: any) => (
          <div key={e.id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-kauvex-navy/5 flex items-center justify-center text-xs font-bold text-kauvex-navy">
              {initials(e.earningType)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-kauvex-navy">{e.earningType} · {e.period ?? "—"}</p>
              <p className="text-[10px] text-text-3">module: {e.moduleId?.slice(0, 8) ?? "platform"} · {fmtDate(e.createdAt)}</p>
            </div>
            <span className="text-sm font-bold text-kauvex-navy">{fmtMoney(e.amount, "USD")}</span>
            <StatusBadge status={e.status} />
            {e.status === "pending" && (
              <button onClick={() => markPaid(e.id)} className="rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">
                Mark paid
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
