"use client";

import { useEffect, useState } from "react";
import { Store, Plus, Minus, Star } from "lucide-react";
import { PageHeader, StatCard, StatusBadge, inputCls, fmtMoney, initials } from "@/components/k-platform/shared";

export default function KPlatformMarketplace() {
  const [data, setData] = useState<any>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/k-platform/modules")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setData(j.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  const toggle = async (moduleId: string, installing: boolean) => {
    setBusyId(moduleId);
    try {
      const res = await fetch("/api/v1/k-platform/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, action: installing ? "install" : "uninstall" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed");
      setData((prev: any) => {
        const installed = { ...prev.installed };
        if (installing) installed[moduleId] = { id: json.data?.id ?? "new", version: "1.0.0", status: "installed" };
        else delete installed[moduleId];
        return { ...prev, installed };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyId(null);
    }
  };

  if (!data) return <div className="text-sm text-text-2">{error ? `Error: ${error}` : "Loading…"}</div>;

  const types = ["all", ...new Set(data.modules.map((m: any) => m.moduleType))];
  const filtered = data.modules.filter(
    (m: any) =>
      (type === "all" || m.moduleType === type) &&
      (m.name + " " + (m.description ?? "")).toLowerCase().includes(q.toLowerCase())
  );
  const installedCount = Object.keys(data.installed).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Module Marketplace"
        subtitle="Install apps, SDKs, plugins, reports, and studio tools into your organization"
        icon={<Store className="w-5 h-5" />}
        actions={<div className="w-56"><input className={inputCls} placeholder="Search modules…" value={q} onChange={(e) => setQ(e.target.value)} /></div>}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Available Modules" value={data.modules.length} icon={<Store className="w-4 h-4" />} />
        <StatCard label="Installed" value={installedCount} icon={<Plus className="w-4 h-4" />} />
        <StatCard label="Types" value={types.length - 1} icon={<Store className="w-4 h-4" />} />
        <StatCard label="Total Installs" value={data.modules.reduce((s: number, m: any) => s + (m.installCount ?? 0), 0)} icon={<Star className="w-4 h-4" />} />
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${type === t ? "bg-kauvex-navy text-white border-kauvex-navy" : "bg-white border-border text-text-2 hover:border-kauvex-navy/30"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((m: any) => {
          const isInstalled = Boolean(data.installed[m.id]);
          return (
            <div key={m.id} className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-black" style={{ background: m.color ?? "#FF6B00" }}>
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-kauvex-navy text-sm truncate">{m.name}</p>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-text-3">{m.moduleType} · v{m.version}</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={m.status} />
                </div>
              </div>
              <p className="text-xs text-text-2 leading-relaxed flex-1 line-clamp-3">{m.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                  <Star className="w-3 h-3 inline mr-1 -mt-0.5" />
                  {Number(m.rating).toFixed(1)}
                </span>
                <span className="text-[10px] font-semibold text-text-2">{m.installCount} installs</span>
                {Number(m.priceMonthly) > 0 && <span className="ml-auto text-xs font-bold text-kauvex-navy">{fmtMoney(m.priceMonthly, "USD")}/mo</span>}
              </div>
              <button
                onClick={() => toggle(m.id, !isInstalled)}
                disabled={busyId === m.id || m.status !== "published"}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
                  isInstalled ? "border border-border bg-white text-kauvex-navy hover:bg-gray-50" : "bg-kauvex-orange text-white hover:bg-kauvex-orange/90"
                } disabled:opacity-50`}
              >
                {isInstalled ? <><Minus className="w-3 h-3" /> Uninstall</> : <><Plus className="w-3 h-3" /> Install</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
