"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/kai-ecosystem/shared";

const SUGGESTIONS = [
  "I want to build a warehouse",
  "Create a quotation for 500 solar panels",
  "Compare these suppliers",
  "Generate a production schedule",
  "Design a two-bedroom bungalow",
  "Plan a marketing campaign",
];

export default function KaiChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const request = (text ?? input).trim();
    if (!request || busy) return;
    setInput("");
    setError(null);
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: request }]);
    try {
      const res = await fetch("/api/v1/kai-ecosystem/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "The orchestrator could not respond");
      setMessages((m) => [...m, { role: "kai", run: json.data }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Orchestrator"
        subtitle="One conversation. Many specialized agents working behind it."
        icon={<Bot className="w-5 h-5" />}
      />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="bg-white rounded-xl border border-border flex flex-col h-[62vh]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-kauvex-navy">Ask KAI anything about your business.</p>
                <p className="text-sm text-text-3 mt-1">The orchestrator delegates to specialized agents — construction, finance, design, procurement, and more.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs font-medium text-kauvex-navy bg-gray-50 border border-border rounded-full px-3 py-1.5 hover:border-kauvex-orange hover:text-kauvex-orange transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-kauvex-navy text-white px-4 py-2.5 text-sm">{m.content}</div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-700" />
                </div>
                <div className="max-w-[85%] space-y-3">
                  <div className="rounded-2xl rounded-tl-md bg-gray-50 border border-border px-4 py-3">
                    <p className="text-sm text-kauvex-navy leading-relaxed">{m.run.summary}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(m.run.delegation ?? []).map((d: any, j: number) => (
                      <div key={j} className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">
                        <p className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name}
                        </p>
                        <p className="text-[11px] text-text-2 mt-1.5 leading-relaxed">{d.contribution}</p>
                        {(d.nextSteps ?? []).length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {d.nextSteps.map((n: string, k: number) => (
                              <li key={k} className="text-[10px] text-text-3 flex gap-1"><span>•</span>{n}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
          {busy && (
            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-700" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-gray-50 border border-border px-4 py-3 text-sm text-text-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Orchestrating agents…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask KAI to plan, quote, compare, design, or automate…"
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-kauvex-navy placeholder:text-text-3/70 focus:outline-none focus:ring-2 focus:ring-kauvex-orange/40 focus:border-kauvex-orange"
          />
          <button onClick={() => send()} disabled={busy} className="rounded-lg bg-kauvex-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-kauvex-orange/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
            <Send className="w-4 h-4" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
