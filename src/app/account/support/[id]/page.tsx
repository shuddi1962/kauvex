"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, X, Calendar, Tag, AlertCircle,
} from "lucide-react";
import TicketThread from "@/components/support/TicketThread";
import { useAuthStore } from "@/store/auth-store";

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  orderId: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  messages: Message[];
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-blue-50 text-blue" },
  in_progress: { label: "In Progress", className: "bg-yellow-50 text-yellow-700" },
  waiting_on_customer: { label: "Waiting on You", className: "bg-purple-50 text-purple-700" },
  resolved: { label: "Resolved", className: "bg-green-50 text-green-700" },
  closed: { label: "Closed", className: "bg-gray-100 text-text-4" },
};

const CATEGORY_LABELS: Record<string, string> = {
  order_issue: "Order Issue",
  payment: "Payment",
  delivery: "Delivery",
  account: "Account",
  other: "Other",
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [closing, setClosing] = useState(false);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/crm/tickets/${params.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load ticket");
      setTicket(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTicket(); }, [params.id]);

  const handleClose = async () => {
    if (!confirm("Are you sure you want to close this ticket?")) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/v1/crm/tickets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to close");
      setTicket((prev) => prev ? { ...prev, status: "closed", closedAt: new Date().toISOString() } : prev);
      setShowRating(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClosing(false);
    }
  };

  const handleRating = async (stars: number) => {
    setSubmittingRating(true);
    try {
      const res = await fetch(`/api/v1/crm/tickets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit rating");
      setRating(stars);
      setTicket((prev) => prev ? { ...prev, rating: stars } : prev);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border p-12 text-center">
        <p className="text-text-4 text-sm">Loading ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-white rounded-xl border border-border p-12 text-center">
        <AlertCircle size={32} className="mx-auto text-red mb-3" />
        <p className="text-text-3 text-sm">{error || "Ticket not found"}</p>
        <button onClick={() => router.push("/account/support")} className="mt-4 text-sm text-blue hover:underline">
          Back to Support
        </button>
      </div>
    );
  }

  const badge = STATUS_BADGES[ticket.status] || STATUS_BADGES.open;
  const isClosed = ticket.status === "closed";

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/account/support")}
        className="flex items-center gap-1.5 text-sm text-text-3 hover:text-text-1 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to tickets
      </button>

      {/* Ticket Header */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-text-4">{ticket.ticketNumber}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <h2 className="font-syne font-700 text-lg text-text-1">{ticket.subject}</h2>
          </div>
          {!isClosed && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-text-2 hover:bg-red-50 hover:text-red hover:border-red/30 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <X size={14} />
              {closing ? "Closing..." : "Close Ticket"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-text-4">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            {new Date(ticket.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </div>
          <div className="flex items-center gap-1">
            <Tag size={12} />
            {CATEGORY_LABELS[ticket.category] || ticket.category}
          </div>
          {ticket.orderId && (
            <span className="font-mono">Order: {ticket.orderId}</span>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-sm text-text-1 mb-4">Conversation</h3>
        <TicketThread
          messages={ticket.messages}
          ticketId={ticket.id}
          ticketStatus={ticket.status}
          currentUserId={user?.id || ""}
          onMessageSent={loadTicket}
        />
      </div>

      {/* Rating after close */}
      {isClosed && !ticket.rating && (
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <h3 className="font-semibold text-sm text-text-1 mb-2">Rate this support experience</h3>
          <p className="text-xs text-text-4 mb-3">How satisfied were you with the support you received?</p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                disabled={submittingRating}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  size={28}
                  className={`${star <= (rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-text-4"} ${submittingRating ? "opacity-50" : ""}`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Already rated */}
      {isClosed && ticket.rating && (
        <div className="bg-white rounded-xl border border-border p-5 text-center">
          <p className="text-xs text-text-4 mb-2">Your rating</p>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={star <= ticket.rating! ? "fill-yellow-400 text-yellow-400" : "text-text-4"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
