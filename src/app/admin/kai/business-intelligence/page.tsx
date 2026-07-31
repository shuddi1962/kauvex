"use client";

import { useEffect, useState } from "react";
import { Building2, BookOpen, MessageSquare, CreditCard, Bot, Brain, Activity, RefreshCw } from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function KaiBusinessIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/kai/business-intelligence")
      .then((r) => r.json())
      .then((j) => {
        if (!j.data) throw new Error(j.error || "Failed to load");
        setData(j.data);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AdminShell title="KAI — Business Intelligence">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-kauvex-navy flex items-center gap-2">
              <Brain className="w-5 h-5 text-kauvex-orange" /> Company Brain Oversight
            </h2>
            <p className="text-sm text-text-2 mt-1">Every business on KAI — what they trained, what they asked, what they pay.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

        {!data ? (
          <p className="text-sm text-text-2">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
              <StatCard label="Businesses" value={data.stats.totalBusinesses} icon={<Building2 className="w-4 h-4" />} />
              <StatCard label="Active Subscriptions" value={data.stats.activeSubscriptions} icon={<CreditCard className="w-4 h-4" />} />
              <StatCard label="Questions Asked" value={data.stats.totalQuestions} icon={<MessageSquare className="w-4 h-4" />} />
              <StatCard label="Knowledge Chunks" value={data.stats.totalChunks} icon={<BookOpen className="w-4 h-4" />} />
              <StatCard label="AI Employees" value={data.businesses.reduce((s: number, b: any) => s + b.agentCount, 0)} icon={<Bot className="w-4 h-4" />} />
            </div>

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-text-3 border-b border-border bg-gray-50">
                      <th className="px-4 py-3">Business</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Documents</th>
                      <th className="px-4 py-3">Chunks</th>
                      <th className="px-4 py-3">Questions</th>
                      <th className="px-4 py-3">Agents</th>
                      <th className="px-4 py-3">Onboarded</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.businesses.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-6 text-sm text-text-2">No businesses yet. Businesses appear here when they start using KAI.</td></tr>
                    )}
                    {data.businesses.map((b: any) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-kauvex-navy">{b.companyName}</p>
                          <p className="text-xs text-text-3">{b.industry ?? "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          {b.subscription ? (
                            <div>
                              <p className="font-semibold text-kauvex-navy text-xs">{b.subscription.plan?.name ?? "—"}</p>
                              <Badge className={b.subscription.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} variant="outline">
                                {b.subscription.status}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-xs text-text-3">No plan</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{b.docCount}</td>
                        <td className="px-4 py-3 text-center">{b.chunkCount}</td>
                        <td className="px-4 py-3 text-center">{b.questionCount}</td>
                        <td className="px-4 py-3 text-center">{b.agentCount}</td>
                        <td className="px-4 py-3 text-center">
                          {b.onboarded ? <Badge className="bg-emerald-100 text-emerald-700" variant="outline">Yes</Badge> : <Badge variant="outline" className="bg-gray-100 text-text-3">No</Badge>}
                        </td>
                        <td className="px-4 py-3 text-xs text-text-3">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-5">
              <p className="font-bold text-kauvex-navy text-sm mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-kauvex-orange" /> Recent Questions Across All Businesses
              </p>
              <div className="space-y-3">
                {data.recentQuestions.length === 0 && <p className="text-sm text-text-2">No questions yet.</p>}
                {data.recentQuestions.map((q: any) => (
                  <div key={q.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-kauvex-navy/5 text-kauvex-navy">{q.mode}</Badge>
                      <span className="text-xs text-text-3">{new Date(q.createdAt).toLocaleString()}</span>
                      <span className="ml-auto text-[10px] text-text-3">{q.latencyMs}ms</span>
                    </div>
                    <p className="text-sm font-semibold text-kauvex-navy mt-1.5">{q.question}</p>
                    <p className="text-xs text-text-2 mt-1 line-clamp-2">{q.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-text-3 text-xs font-semibold mb-1">{icon}{label}</div>
      <p className="text-2xl font-bold text-kauvex-navy">{value}</p>
    </div>
  );
}
