"use client";

import { useState } from "react";
import { Loader2, Send, AlertCircle } from "lucide-react";

const CATEGORIES = [
  { value: "order_issue", label: "Order Issue" },
  { value: "payment", label: "Payment" },
  { value: "delivery", label: "Delivery" },
  { value: "account", label: "Account" },
  { value: "other", label: "Other" },
];

interface TicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function TicketForm({ onSuccess, onCancel }: TicketFormProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("other");
  const [orderId, setOrderId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/crm/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          description: description.trim(),
          category,
          orderId: orderId.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create ticket");
      setSubject("");
      setCategory("other");
      setOrderId("");
      setDescription("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-text-2 mb-1 block">Subject *</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of your issue"
          className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-text-2 mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue/20"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-text-2 mb-1 block">Order ID (optional)</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ORD-12345"
            className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-2 mb-1 block">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your issue in detail..."
          rows={5}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue/20"
        />
      </div>

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-text-2 hover:bg-off-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
}
