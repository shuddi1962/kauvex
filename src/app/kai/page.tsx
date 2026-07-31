"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Brain, BookOpen, Workflow, Scale, Search, FileText, UserCog, Package, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import { PageHeader, StatCard } from "@/components/kai-ecosystem/shared";

export default function KaiDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/kai-ecosystem/dashboard")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setData(j.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  const c = data?.counts;

  const cards = [
    { label: "Installed Agents", value: c?.installs ?? 0, icon: <Bot className="w-4 h-4" /> },
    { label: "Memory Entries", value: c?.memory ?? 0, icon: <Brain className="w-4 h-4" /> },
    { label: "Knowledge Docs", value: c?.knowledge ?? 0, icon: <BookOpen className="w-4 h-4" /> },
    { label: "Automation Flows", value: c?.flows ?? 0, icon: <Workflow className="w-4 h-4" /> },
    { label: "Pending Decisions", value: c?.pendingDecisions ?? 0, icon: <Scale className="w-4 h-4" /> },
    { label: "Research Reports", value: c?.research ?? 0, icon: <Search className="w-4 h-4" /> },
    { label: "Content Drafts", value: c?.drafts ?? 0, icon: <FileText className="w-4 h-4" /> },
    { label: "Digital Employees", value: c?.employees ?? 0, icon: <UserCog className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="KAI Ecosystem"
        subtitle="Kauvex Artificial Intelligence — the intelligence layer that powers your business"
        icon={<Bot className="w-5 h-5" />}
        actions={<Link href="/kai/chat" className="inline-flex items-center gap-2 rounded-lg bg-kauvex-orange px-4 py-2 text-sm font-semibold text-white hover:bg-kauvex-orange/90 transition-colors"><MessageSquare className="w-4 h-4" /> Talk to the Orchestrator</Link>}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-kauvex-navy">Recent Orchestrator Runs</h2>
            <Link href="/kai/chat" className="text-xs font-semibold text-kauvex-orange hover:underline inline-flex items-center gap-1">Open chat <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {!data ? (
            <p className="text-sm text-text-3 py-6 text-center">Loading…</p>
          ) : (data.recentRuns?.length ?? 0) === 0 ? (
            <p className="text-sm text-text-3 py-6 text-center">No requests yet. Ask the Master Orchestrator anything — it delegates to specialized agents.</p>
          ) : (
            <div className="space-y-3">
              {data.recentRuns.map((run: any) => (
                <div key={run.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold text-kauvex-navy">"{run.request}"</p>
                  <p className="text-xs text-text-3 mt-1">{run.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(run.delegation ?? []).map((d: any) => (
                      <span key={d.code} className="px-1.5 py-0.5 rounded bg-purple-50 text-[10px] font-semibold text-purple-700">{d.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-bold text-kauvex-navy mb-4">Ecosystem</h2>
          <div className="space-y-2">
            {[
              { href: "/kai/agents", label: "Agent catalog", icon: Bot, count: c?.installs ?? 0, note: "installed" },
              { href: "/kai/knowledge", label: "Knowledge Hub", icon: BookOpen, count: c?.knowledge ?? 0, note: "docs" },
              { href: "/kai/flows", label: "Automation Flows", icon: Workflow, count: c?.flows ?? 0, note: "active" },
              { href: "/kai/employees", label: "Digital Employees", icon: UserCog, count: c?.employees ?? 0, note: "deployed" },
              { href: "/kai/apps", label: "AI App Store", icon: Package, count: c?.installs ?? 0, note: "agents via packs" },
              { href: "/kai/audit", label: "Safety Audit", icon: ShieldCheck, count: c?.runs ?? 0, note: "actions logged" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 hover:border-kauvex-orange/50 hover:bg-kauvex-orange/5 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-kauvex-navy/5 flex items-center justify-center"><l.icon className="w-4 h-4 text-kauvex-orange" /></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-kauvex-navy">{l.label}</p>
                  <p className="text-[11px] text-text-3">{l.count} {l.note}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
