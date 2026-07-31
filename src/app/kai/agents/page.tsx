"use client";

import { useEffect, useState } from "react";
import { Bot, Plus, Minus } from "lucide-react";
import { PageHeader, StatCard, inputCls } from "@/components/kai-ecosystem/shared";

export default function KaiAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [installed, setInstalled] = useState<Record<string, boolean>>({});
  const [q, setQ] = useState("");
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/kai-ecosystem/agents")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setAgents(j.data.agents ?? []);
        setInstalled(j.data.installed ?? {});
      })
      .catch((e) => setError(e.message));
  }, []);

  const toggle = async (code: string, installing: boolean) => {
    setBusyCode(code);
    try {
      const res = await fetch("/api/v1/kai-ecosystem/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentCode: code, action: installing ? "install" : "uninstall" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed");
      setInstalled((prev) => ({ ...prev, [code]: installing }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusyCode(null);
    }
  };

  const filtered = agents.filter((a) => (a.name + " " + a.category + " " + (a.description ?? "")).toLowerCase().includes(q.toLowerCase()));
  const installedCount = Object.values(installed).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agents"
        subtitle="Install specialized agents into your organization's KAI workspace"
        icon={<Bot className="w-5 h-5" />}
        actions={<div className="w-56"><input className={inputCls} placeholder="Search agents…" value={q} onChange={(e) => setQ(e.target.value)} /></div>}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Agents Available" value={agents.length} icon={<Bot className="w-4 h-4" />} />
        <StatCard label="Installed" value={installedCount} icon={<Plus className="w-4 h-4" />} />
        <StatCard label="Categories" value={new Set(agents.map((a) => a.category)).size} icon={<Bot className="w-4 h-4" />} />
        <StatCard label="Capabilities" value={agents.reduce((s: number, a: any) => s + (a.capabilities?.length ?? 0), 0)} icon={<Bot className="w-4 h-4" />} />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((a) => {
          const isInstalled = installed[a.code];
          return (
            <div key={a.code} className="bg-white rounded-xl border border-border p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${a.color}18` }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-kauvex-navy text-sm">{a.name}</p>
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-text-3">{a.category}</p>
                </div>
                {isInstalled && <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Installed</span>}
              </div>
              <p className="text-xs text-text-2 leading-relaxed flex-1">{a.description}</p>
              <div className="flex flex-wrap gap-1">
                {(a.capabilities ?? []).slice(0, 4).map((c: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-kauvex-navy/5 text-[10px] font-semibold text-kauvex-navy">{c}</span>
                ))}
              </div>
              <button
                onClick={() => toggle(a.code, !isInstalled)}
                disabled={busyCode === a.code}
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
