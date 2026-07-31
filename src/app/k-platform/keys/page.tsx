"use client";

import { useEffect, useState } from "react";
import { KeyRound, Plus, RefreshCw, Ban, Copy, Check } from "lucide-react";
import { PageHeader, StatCard, Modal, Field, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate } from "@/components/k-platform/shared";

export default function KPlatformKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState("organizations:read,orders:read");
  const [created, setCreated] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/v1/k-platform/keys")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setKeys(j.data.keys ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    try {
      const res = await fetch("/api/v1/k-platform/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scopes: scopes.split(",").map((s) => s.trim()).filter(Boolean) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create");
      setKeys((prev) => [json.data, ...prev]);
      setCreated(json.data);
      setShowNew(false);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const action = async (id: string, act: "revoke" | "rotate") => {
    try {
      const res = await fetch(`/api/v1/k-platform/keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed");
      if (act === "rotate") {
        setCreated(json.data);
        setKeys((prev) => prev.map((k) => (k.id === id ? json.data : k)));
      } else {
        setKeys((prev) => prev.map((k) => (k.id === id ? json.data : k)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const copyKey = async () => {
    if (!created?.raw) return;
    await navigator.clipboard.writeText(created.raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const active = keys.filter((k) => !k.revoked);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        subtitle="Create and manage keys for the Kauvex REST API"
        icon={<KeyRound className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShowNew(true)}><Plus className="w-4 h-4" /> New Key</button>}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Keys" value={keys.length} icon={<KeyRound className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<Check className="w-4 h-4" />} />
        <StatCard label="Revoked" value={keys.length - active.length} icon={<Ban className="w-4 h-4" />} />
        <StatCard label="Scopes" value={new Set(keys.flatMap((k) => k.scopes ?? [])).size} icon={<KeyRound className="w-4 h-4" />} />
      </div>

      {loading ? (
        <p className="text-sm text-text-2">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border">
          {keys.length === 0 && <p className="p-6 text-sm text-text-2">No API keys yet. Create one to get started.</p>}
          {keys.map((k) => (
            <div key={k.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-kauvex-navy">{k.name}</p>
                <p className="font-mono text-xs text-text-2">{k.keyPrefix}••••••••••••</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(k.scopes ?? []).map((s: string) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-kauvex-navy/5 text-[10px] font-semibold text-kauvex-navy">{s}</span>
                  ))}
                </div>
              </div>
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${k.revoked ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
                {k.revoked ? "Revoked" : "Active"}
              </span>
              <span className="text-[10px] text-text-3">Created {fmtDate(k.createdAt)}</span>
              {!k.revoked && (
                <div className="flex gap-2">
                  <button onClick={() => action(k.id, "rotate")} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-kauvex-navy hover:bg-gray-50">
                    <RefreshCw className="w-3 h-3" /> Rotate
                  </button>
                  <button onClick={() => action(k.id, "revoke")} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                    <Ban className="w-3 h-3" /> Revoke
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create API Key">
        <div className="space-y-4">
          <Field label="Key name" required>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production server" />
          </Field>
          <Field label="Scopes (comma separated)">
            <input className={inputCls} value={scopes} onChange={(e) => setScopes(e.target.value)} />
          </Field>
          <button className={btnPrimary} onClick={create} disabled={!name}>Create key</button>
        </div>
      </Modal>

      <Modal open={Boolean(created)} onClose={() => setCreated(null)} title="Your API key" wide>
        <div className="space-y-4">
          <p className="text-sm text-text-2">Copy this key now — it is shown only once.</p>
          <div className="flex gap-2">
            <code className="flex-1 rounded-lg bg-kauvex-navy text-emerald-300 font-mono text-xs p-3 break-all">{created?.raw}</code>
            <button className={btnSecondary} onClick={copyKey}>
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button className={btnSecondary} onClick={() => setCreated(null)}>Done</button>
        </div>
      </Modal>
    </div>
  );
}
