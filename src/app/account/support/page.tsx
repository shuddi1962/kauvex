"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import TicketForm from "@/components/support/TicketForm";
import TicketList from "@/components/support/TicketList";

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

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/crm/tickets");
      const json = await res.json();
      if (res.ok) setTickets(json.data || []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-syne font-700 text-lg text-text-1">My Tickets</h2>
            <p className="text-sm text-text-3 mt-1">View and manage your support requests</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              showForm
                ? "bg-off-white text-text-2 border border-border"
                : "bg-blue text-white hover:bg-blue-700"
            }`}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Ticket"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="mt-5 p-5 rounded-xl bg-off-white border border-border">
            <h3 className="font-semibold text-sm text-text-1 mb-4">Submit a Support Ticket</h3>
            <TicketForm onSuccess={() => { setShowForm(false); loadTickets(); }} onCancel={() => setShowForm(false)} />
          </div>
        )}
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm text-text-1">Your Tickets</h3>
        </div>
        <TicketList tickets={tickets} loading={loading} emptyMessage="You haven't submitted any support tickets yet." />
      </div>
    </div>
  );
}
