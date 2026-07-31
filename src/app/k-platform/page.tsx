"use client";

import { useEffect, useState } from "react";
import { Store, Download, Activity, Webhook, KeyRound, Wallet, Package } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, fmtDate, fmtMoney, initials } from "@/components/k-platform/shared";

export default function KPlatformDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/k-platform/dashboard")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setData(j.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (!data) return <div className="text-sm text-text-2">{error ? `Error: ${error}` : "Loading…"}</div>;

  const s = data.stats;
  return (
    <div className="space-y-6">
      <PageHeader
        title="K Platform"
        subtitle="SDK & developer ecosystem — modules, API keys, webhooks, and the event bus"
        icon={<Store className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Published Modules" value={s.publishedModules} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Total Installs" value={s.installCount} icon={<Download className="w-4 h-4" />} />
        <StatCard label="Org Installs" value={s.totalInstalls} icon={<Store className="w-4 h-4" />} />
        <StatCard label="Events" value={s.totalEvents} icon={<Activity className="w-4 h-4" />} />
        <StatCard label="Webhooks" value={s.webhooks.length} icon={<Webhook className="w-4 h-4" />} />
        <StatCard label="API Keys" value={s.apiKeys.length} icon={<KeyRound className="w-4 h-4" />} />
        {data.earningsSummary && (
          <>
            <StatCard label="Dev Earnings (total)" value={fmtMoney(data.earningsSummary.total, "USD")} icon={<Wallet className="w-4 h-4" />} />
            <StatCard label="Pending" value={fmtMoney(data.earningsSummary.pending, "USD")} icon={<Wallet className="w-4 h-4" />} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="font-bold text-kauvex-navy text-sm mb-4">Top Modules</p>
          <div className="space-y-3">
            {data.modules.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-black" style={{ background: m.color ?? "#FF6B00" }}>
                  {initials(m.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-kauvex-navy truncate">{m.name}</p>
                  <p className="text-[10px] text-text-3 uppercase tracking-wide">{m.moduleType} · v{m.version}</p>
                </div>
                <StatusBadge status={m.status} />
                <span className="text-xs font-semibold text-text-2">{m.installCount} installs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <p className="font-bold text-kauvex-navy text-sm mb-4">Recent Events</p>
          <div className="space-y-3">
            {data.recentEvents.map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.status === "delivered" ? "#059669" : "#DC2626" }} />
                <span className="font-mono text-xs text-kauvex-navy truncate">{e.eventType}</span>
                <span className="ml-auto text-[10px] text-text-3">{fmtDate(e.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
