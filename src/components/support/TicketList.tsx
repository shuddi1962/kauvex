"use client";

import Link from "next/link";
import { MessageSquare, ChevronRight, Loader2 } from "lucide-react";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
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

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function TicketList({ tickets, loading, emptyMessage = "No support tickets yet" }: TicketListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-text-4" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare size={40} className="mx-auto text-text-4 mb-3" />
        <p className="text-text-3 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {tickets.map((ticket) => {
        const badge = STATUS_BADGES[ticket.status] || STATUS_BADGES.open;
        return (
          <Link
            key={ticket.id}
            href={`/account/support/${ticket.id}`}
            className="flex items-center justify-between p-4 hover:bg-off-white/50 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-text-4">{ticket.ticketNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <h4 className="font-medium text-sm text-text-1 truncate">{ticket.subject}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-text-4">{CATEGORY_LABELS[ticket.category] || ticket.category}</span>
                <span className="text-xs text-text-4">
                  {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {ticket._count && (
                  <span className="text-xs text-text-4 flex items-center gap-1">
                    <MessageSquare size={12} />
                    {ticket._count.messages}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-text-4 group-hover:text-blue transition-colors flex-shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
