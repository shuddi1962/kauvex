"use client";

import { useEffect, useState } from "react";
import { Webhook, Plus, Zap, Trash2, Send } from "lucide-react";
import { PageHeader, StatCard, Modal, Field, inputCls, btnPrimary, btnSecondary, fmtDate } from "@/components/k-platform/shared";

const EVENT_OPTIONS = ["*", "module.installed", "module.uninstalled", "order.created", "order.paid", "order.shipped", "payment.received", "invoice.created", "kai.run", "webhook.test"];

export default function KPlatformWebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>(["*"]);
  const [testResult, setTestResult] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch("/api/v1/k-platform/webhooks")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setWebhooks(j.data.webhooks ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    try {
      const res = await fetch("/api/v1/k-platform/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, eventTypes }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create");
      setWebhooks((prev) => [json.data, ...prev]);
      setShowNew(false);
      setName("");
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const toggle = async (id: string, isActive: boolean) => {
    const res = await fetch(`/api/v1/k-platform/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setWebhooks((prev) => prev.map((w) => (w.id === id ? json.data : w)));
  };

  const remove = async (id: string) => {
    await fetch(`/api/v1/k-platform/webhooks/${id}`, { method: "DELETE" });
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const test = async (id: string) => {
    setTestResult((prev) => ({ ...prev, [id]: { testing: true } }));
    try {
      const res = await fetch(`/api/v1/k-platform/webhooks/${id}`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      setTestResult((prev) => ({ ...prev, [id]: json.data }));
    } catch {
      setTestResult((prev) => ({ ...prev, [id]: { ok: false, error: "Failed to reach endpoint" } }));
    }
  };

  const toggleEvent = (ev: string) => {
    setEventTypes((prev) => {
      if (prev.includes("*")) return [ev];
      if (prev.includes(ev)) return prev.filter((e) => e !== ev).length ? prev.filter((e) => e !== ev) : ["*"];
      return [...prev, ev];
    });
  };

  const active = webhooks.filter((w) => w.isActive);
  const failures = webhooks.reduce((s, w) => s + (w.failureCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooks"
        subtitle="Deliver Kauvex events to your endpoints with retries and HMAC signatures"
        icon={<Webhook className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShowNew(true)}><Plus className="w-4 h-4" /> New Webhook</button>}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Webhooks" value={webhooks.length} icon={<Webhook className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<Zap className="w-4 h-4" />} />
        <StatCard label="Cumulative Failures" value={failures} icon={<Send className="w-4 h-4" />} />
        <StatCard label="Events Covered" value={new Set(webhooks.flatMap((w) => w.eventTypes ?? [])).size} icon={<Webhook className="w-4 h-4" />} />
      </div>

      {loading ? (
        <p className="text-sm text-text-2">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border">
          {webhooks.length === 0 && <p className="p-6 text-sm text-text-2">No webhooks yet. Create one to receive events.</p>}
          {webhooks.map((w) => {
            const tr = testResult[w.id];
            return (
              <div key={w.id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-kauvex-navy">{w.name}</p>
                    <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${w.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                      {w.isActive ? "Active" : "Paused"}
                    </span>
                    {w.failureCount > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">{w.failureCount} failures</span>}
                  </div>
                  <p className="font-mono text-xs text-text-2 truncate">{w.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(w.eventTypes ?? []).map((e: string) => (
                      <span key={e} className="px-1.5 py-0.5 rounded bg-kauvex-navy/5 text-[10px] font-semibold text-kauvex-navy">{e}</span>
                    ))}
                  </div>
                  {tr?.testing && <p className="text-[10px] text-text-3 mt-1">Testing delivery…</p>}
                  {tr?.ok !== undefined && !tr.testing && (
                    <p className={`text-[10px] font-semibold mt-1 ${tr.ok ? "text-emerald-600" : "text-red-600"}`}>
                      Test {tr.ok ? `delivered (${tr.status})` : `failed — ${tr.error ?? `status ${tr.status}`}`}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-text-3">Last delivered {fmtDate(w.lastDeliveredAt) ?? "never"}</span>
                <div className="flex gap-2">
                  <button onClick={() => test(w.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-kauvex-navy hover:bg-gray-50">
                    <Send className="w-3 h-3" /> Test
                  </button>
                  <button onClick={() => toggle(w.id, !w.isActive)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-kauvex-navy hover:bg-gray-50">
                    {w.isActive ? "Pause" : "Resume"}
                  </button>
                  <button onClick={() => remove(w.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create Webhook">
        <div className="space-y-4">
          <Field label="Name" required>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Order notifications" />
          </Field>
          <Field label="Endpoint URL" required>
            <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/hooks/kauvex" />
          </Field>
          <Field label="Event types">
            <div className="flex flex-wrap gap-1.5">
              {EVENT_OPTIONS.map((ev) => (
                <button key={ev} onClick={() => toggleEvent(ev)} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${eventTypes.includes(ev) ? "bg-kauvex-navy text-white border-kauvex-navy" : "bg-white border-border text-text-2"}`}>
                  {ev}
                </button>
              ))}
            </div>
          </Field>
          <button className={btnPrimary} onClick={create} disabled={!name || !url}>Create webhook</button>
        </div>
      </Modal>
    </div>
  );
}
