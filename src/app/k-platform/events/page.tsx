"use client";

import { useEffect, useState } from "react";
import { Activity, Send } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, fmtDate } from "@/components/k-platform/shared";

export default function KPlatformEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventType, setEventType] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams();
    if (eventType) qs.set("event_type", eventType);
    if (status) qs.set("status", status);
    fetch(`/api/v1/k-platform/events?${qs}`)
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setEvents(j.data.events ?? []);
        setCounts(j.data.counts);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [eventType, status]);

  const types = [...new Set(events.map((e) => e.eventType))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Bus"
        subtitle="Every platform event, in one ledger — ready for webhook delivery"
        icon={<Activity className="w-5 h-5" />}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={counts?.total ?? 0} icon={<Activity className="w-4 h-4" />} />
        <StatCard label="Delivered" value={counts?.delivered ?? 0} icon={<Send className="w-4 h-4" />} />
        <StatCard label="Failed" value={counts?.failed ?? 0} icon={<Activity className="w-4 h-4" />} />
        <StatCard label="Event Types" value={types.length} icon={<Activity className="w-4 h-4" />} />
      </div>

      <div className="flex flex-wrap gap-2">
        <select className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-kauvex-navy" value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-kauvex-navy" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">pending</option>
          <option value="delivered">delivered</option>
          <option value="failed">failed</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-text-2">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border">
          {events.length === 0 && <p className="p-6 text-sm text-text-2">No events yet.</p>}
          {events.map((e) => (
            <div key={e.id} className="p-4 flex flex-wrap items-center gap-3">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.status === "delivered" ? "#059669" : e.status === "failed" ? "#DC2626" : "#F59E0B" }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-kauvex-navy font-mono">{e.eventType}</p>
                <p className="text-[10px] text-text-3 truncate">source: {e.source ?? "platform"} · attempts: {e.attempts} · {e.id.slice(0, 8)}</p>
              </div>
              <StatusBadge status={e.status} />
              <span className="text-[10px] text-text-3">{fmtDate(e.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
