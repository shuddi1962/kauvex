"use client";

import { useEffect, useState } from "react";
import { Package, Download, Check } from "lucide-react";
import { PageHeader, StatCard } from "@/components/kai-ecosystem/shared";

export default function KaiAppsPage() {
  const [packs, setPacks] = useState<any[]>([]);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/kai-ecosystem/apps")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setPacks(j.data.packs ?? []);
        setInstalled(j.data.installed ?? {});
      })
      .catch((e) => setError(e.message));
  }, []);

  const install = async (slug: string) => {
    setBusy(slug);
    try {
      const res = await fetch("/api/v1/kai-ecosystem/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to install");
      const pack = packs.find((p) => p.slug === slug);
      const newInstalled = { ...installed };
      (pack?.agents ?? []).forEach((code: string) => { newInstalled[code] = true; });
      setInstalled(newInstalled);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const installedCount = Object.values(installed).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI App Store"
        subtitle="Install specialized AI packs — each pack extends your KAI workforce"
        icon={<Package className="w-5 h-5" />}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Packs Available" value={packs.length} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Agents Installed" value={installedCount} icon={<Check className="w-4 h-4" />} />
        <StatCard label="Industries" value={new Set(packs.map((p) => p.industry)).size} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Downloads" value={packs.reduce((s: number, p: any) => s + (p.installCount || 0), 0)} icon={<Download className="w-4 h-4" />} />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {packs.map((p) => {
          const packInstalled = (p.agents ?? []).every((code: string) => installed[code]);
          return (
            <div key={p.slug} className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15` }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-kauvex-navy text-sm">{p.name}</p>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-text-3">{p.industry}</p>
                </div>
                {packInstalled && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Installed</span>}
              </div>
              <p className="text-xs text-text-2 leading-relaxed flex-1">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {(p.agents ?? []).map((code: string, i: number) => (
                  <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${installed[code] ? "bg-emerald-50 text-emerald-700" : "bg-kauvex-navy/5 text-kauvex-navy"}`}>{code}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-kauvex-navy">{Number(p.priceMonthly) === 0 ? "Free" : `$${Number(p.priceMonthly)}/mo`}</p>
                <button
                  onClick={() => install(p.slug)}
                  disabled={busy === p.slug || packInstalled}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${packInstalled ? "border border-border text-text-3 cursor-default" : "bg-kauvex-orange text-white hover:bg-kauvex-orange/90"} disabled:opacity-50`}
                >
                  {packInstalled ? "Installed" : busy === p.slug ? "Installing…" : "Install Pack"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
