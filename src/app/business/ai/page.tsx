"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Sparkles, Zap, BookOpen, Activity, TrendingUp, PackageX, Wallet, Users, ListTodo, Target } from "lucide-react";

const SUGGESTIONS = [
  "How many orders do we have and what's our total sales?",
  "What products are low on stock?",
  "Do we have any overdue invoices?",
  "How many customers and open tasks do we have?",
  "Give me a summary of everything happening in the business.",
];

const fmt = (v: number) => (v ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function BusinessAskKaiPage() {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<any>(null);
  const [facts, setFacts] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/kai-business/facts")
      .then((r) => r.json())
      .then((j) => j.data && setFacts(j.data))
      .catch(() => {});
    fetch("/api/v1/kai-business/questions?limit=10")
      .then((r) => r.json())
      .then((j) => j.data && setHistory(j.data.questions ?? []))
      .catch(() => {});
  }, []);

  const ask = async (q?: string) => {
    const text = (q ?? question).trim();
    if (!text || asking) return;
    setAsking(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/kai-business/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to ask");
      setAnswer(json.data);
      setHistory((prev) => [json.data, ...prev].slice(0, 10));
      setQuestion("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setAsking(false);
    }
  };

  const f = facts?.sales;
  const inv = facts?.inventory;
  const fin = facts?.finance;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-kauvex-navy flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-kauvex-orange" /> Ask KAI
        </h1>
        <p className="text-sm text-text-2 mt-1">KAI knows what's happening in your business — live orders, inventory, finance, customers, and your company documents. <span className="text-kauvex-orange font-semibold">"KAI knows."</span></p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-border p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="px-3 py-1.5 rounded-full border border-border bg-gray-50 text-xs font-medium text-kauvex-navy hover:border-kauvex-orange hover:bg-kauvex-orange/5 transition-colors text-left">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-kauvex-navy placeholder:text-text-3/70 focus:outline-none focus:ring-2 focus:ring-kauvex-orange/40 focus:border-kauvex-orange"
                placeholder="Ask anything about your business…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
              />
              <button onClick={() => ask()} disabled={asking || !question.trim()} className="inline-flex items-center gap-2 rounded-lg bg-kauvex-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-kauvex-orange/90 disabled:opacity-50">
                {asking ? "Thinking…" : <><Send className="w-4 h-4" /> Ask</>}
              </button>
            </div>
          </div>

          {answer && (
            <div className="bg-white rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-kauvex-orange/10 border border-kauvex-orange/30 px-3 py-1 text-[10px] font-bold text-kauvex-orange uppercase">
                  <Sparkles className="w-3 h-3" /> KAI answered
                </span>
                <span className="text-[10px] font-semibold text-text-3 uppercase bg-gray-100 rounded-full px-2 py-1">{answer.mode}</span>
                <span className="text-[10px] text-text-3">{answer.latencyMs}ms</span>
              </div>
              <p className="text-sm text-kauvex-navy leading-relaxed whitespace-pre-wrap">{answer.answer}</p>

              {answer.liveData?.summary && (
                <div className="rounded-lg bg-kauvex-navy/5 border border-kauvex-navy/10 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-text-3 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Live data · {answer.liveData.routed}</p>
                  <p className="text-xs text-kauvex-navy leading-relaxed">{answer.liveData.summary}</p>
                </div>
              )}

              {answer.sources?.length > 0 && (
                <div className="rounded-lg bg-gray-50 border border-border p-3 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-text-3 flex items-center gap-1"><BookOpen className="w-3 h-3" /> From your documents</p>
                  {answer.sources.map((s: any, i: number) => (
                    <div key={s.id ?? i}>
                      <p className="text-xs font-semibold text-kauvex-navy">{s.title}</p>
                      <p className="text-[11px] text-text-2 line-clamp-2">{s.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5">
              <p className="font-bold text-kauvex-navy text-sm mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-kauvex-orange" /> Recent questions</p>
              <div className="space-y-2.5">
                {history.map((h: any) => (
                  <button key={h.id} onClick={() => setAnswer(h)} className="w-full text-left rounded-lg border border-border p-3 hover:border-kauvex-orange/40 transition-colors">
                    <p className="text-xs font-semibold text-kauvex-navy">{h.question}</p>
                    <p className="text-[11px] text-text-2 line-clamp-1 mt-0.5">{h.answer}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="font-bold text-kauvex-navy text-sm mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-kauvex-orange" /> Live business pulse</p>
            {!facts?.orgId ? (
              <p className="text-xs text-text-2">Connect a Business OS organization to see live data. KAI will then answer with your real numbers.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <MiniStat icon={<TrendingUp className="w-3.5 h-3.5" />} label="Orders" value={fmt(f?.count)} sub={`${fmt(f?.thisWeekCount)} this week`} />
                <MiniStat icon={<Wallet className="w-3.5 h-3.5" />} label="Sales (7d)" value={fmt(f?.thisWeekTotal)} sub={`Total ${fmt(f?.total)}`} />
                <MiniStat icon={<PackageX className="w-3.5 h-3.5" />} label="Low stock" value={fmt(inv?.lowStockCount)} sub={`${fmt(inv?.itemCount)} products`} />
                <MiniStat icon={<Wallet className="w-3.5 h-3.5" />} label="Receivables" value={fmt(fin?.receivables)} sub={`${fmt(fin?.overdueCount)} overdue`} />
                <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Customers" value={fmt(facts.customers?.count)} sub="active" />
                <MiniStat icon={<ListTodo className="w-3.5 h-3.5" />} label="Open tasks" value={fmt(facts.tasks?.openCount)} sub="in progress" />
                <MiniStat icon={<Target className="w-3.5 h-3.5" />} label="Open leads" value={fmt(facts.leads?.openCount)} sub={`${fmt(facts.leads?.dealValue)} pipeline`} />
                <MiniStat icon={<Activity className="w-3.5 h-3.5" />} label="Production" value={fmt(facts.production?.activeCount)} sub="active orders" />
              </div>
            )}
          </div>

          <div className="bg-kauvex-navy rounded-xl p-4 text-white">
            <p className="text-xs font-bold flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-kauvex-orange" /> Train KAI</p>
            <p className="text-[11px] text-white/70 leading-relaxed">Upload your policies, product catalogues, and manuals in the <span className="text-white font-semibold">Company Brain</span> so KAI can answer from your own documents too.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-gray-50/50 p-2.5">
      <div className="flex items-center gap-1.5 text-text-3 text-[10px] font-semibold">{icon}{label}</div>
      <p className="text-lg font-bold text-kauvex-navy leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-text-3 truncate">{sub}</p>}
    </div>
  );
}
