"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, ChevronDown } from "lucide-react";
import { insforge } from "@/lib/insforge";

interface QAItem {
  id: string;
  question: string;
  status: string;
  created_at: string;
  answers: { id: string; answer: string; is_vendor_answer: boolean; created_at: string }[];
}

export default function ProductQA({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await insforge.database
        .from("product_questions")
        .select("*, product_answers(id, answer, is_vendor_answer, created_at)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (data) setQuestions(data as any);
    })();
  }, [productId]);

  const handleSubmit = async () => {
    if (!newQuestion.trim()) return;
    const { error } = await insforge.database.from("product_questions").insert([{
      product_id: productId,
      question: newQuestion.trim(),
      status: "pending",
    }]);
    if (!error) {
      setQuestions((prev) => [...prev, { id: Date.now().toString(), question: newQuestion.trim(), status: "pending", created_at: new Date().toISOString(), answers: [] }]);
      setNewQuestion("");
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <MessageSquare size={16} /> Questions & Answers ({questions.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-semibold text-orange hover:text-orange/80 transition-colors">
          <Plus size={14} /> Ask a Question
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-gray-50 rounded-xl border border-border space-y-3">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question about this product..."
            className="w-full h-20 px-3 py-2 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="text-xs text-text-4 hover:text-text-2 px-3 py-1.5">Cancel</button>
            <button onClick={handleSubmit} className="text-xs font-semibold bg-orange text-white px-4 py-1.5 rounded-lg hover:bg-orange/90 transition-colors">Submit Question</button>
          </div>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-6 text-text-4 text-xs">No questions yet. Be the first to ask!</div>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1">
                  <p className="text-xs font-medium text-text-1">{q.question}</p>
                  <p className="text-[10px] text-text-4 mt-0.5">
                    {q.answers.length > 0 ? `${q.answers.length} answer${q.answers.length > 1 ? "s" : ""}` : "Awaiting answer"}
                    {" · "}{new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronDown size={14} className={`text-text-4 transition-transform ${expandedId === q.id ? "rotate-180" : ""}`} />
              </button>

              {expandedId === q.id && q.answers.length > 0 && (
                <div className="px-3 pb-3 space-y-2">
                  {q.answers.map((a) => (
                    <div key={a.id} className={`p-3 rounded-lg text-xs ${a.is_vendor_answer ? "bg-green-50 border border-green-200" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-1">{a.is_vendor_answer ? "Seller" : "Customer"}</span>
                        {a.is_vendor_answer && <span className="text-[9px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">Verified Seller</span>}
                      </div>
                      <p className="text-text-2">{a.answer}</p>
                      <p className="text-[10px] text-text-4 mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
