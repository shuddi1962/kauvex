"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Copy, Check, Trash2 } from "lucide-react";
import { PageHeader, StatCard, Modal, Field, inputCls, btnPrimary, btnSecondary, fmtDate } from "@/components/k-platform/shared";

export default function KPlatformOauthPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [redirectUris, setRedirectUris] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/k-platform/oauth")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setApps(j.data.apps ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const create = async () => {
    try {
      const res = await fetch("/api/v1/k-platform/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, redirectUris: redirectUris.split(",").map((s) => s.trim()).filter(Boolean) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create");
      setApps((prev) => [json.data, ...prev]);
      setShowNew(false);
      setName("");
      setDescription("");
      setRedirectUris("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/v1/k-platform/oauth/${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
  };

  const copy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const active = apps.filter((a) => a.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader
        title="OAuth Apps"
        subtitle="Register OAuth applications for third-party integrations"
        icon={<ShieldCheck className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShowNew(true)}><Plus className="w-4 h-4" /> New App</button>}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Total Apps" value={apps.length} icon={<ShieldCheck className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<Check className="w-4 h-4" />} />
        <StatCard label="Scopes" value={new Set(apps.flatMap((a) => a.scopes ?? [])).size} icon={<ShieldCheck className="w-4 h-4" />} />
      </div>

      {loading ? (
        <p className="text-sm text-text-2">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-border divide-y divide-border">
          {apps.length === 0 && <p className="p-6 text-sm text-text-2">No OAuth apps yet. Register your first integration.</p>}
          {apps.map((a) => (
            <div key={a.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-kauvex-navy">{a.name}</p>
                  {a.description && <p className="text-xs text-text-2 line-clamp-1">{a.description}</p>}
                </div>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${a.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                  {a.status}
                </span>
                <span className="text-[10px] text-text-3">{fmtDate(a.createdAt)}</span>
                <button onClick={() => remove(a.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-kauvex-navy/5 px-3 py-2">
                  <span className="font-mono text-[10px] text-kauvex-navy truncate flex-1">client_id: {a.clientId}</span>
                  <button onClick={() => copy(a.clientId, `id-${a.id}`)} className="text-text-3 hover:text-kauvex-navy">
                    {copied === `id-${a.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-kauvex-navy/5 px-3 py-2">
                  <span className="text-[10px] text-text-2 truncate flex-1">{a.redirectUris?.length ?? 0} redirect URIs · {(a.scopes ?? []).length} scopes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Register OAuth App">
        <div className="space-y-4">
          <Field label="App name" required>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My store integration" />
          </Field>
          <Field label="Description">
            <textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Redirect URIs (comma separated)">
            <input className={inputCls} value={redirectUris} onChange={(e) => setRedirectUris(e.target.value)} placeholder="https://app.example.com/callback" />
          </Field>
          <button className={btnPrimary} onClick={create} disabled={!name}>Register app</button>
        </div>
      </Modal>
    </div>
  );
}
