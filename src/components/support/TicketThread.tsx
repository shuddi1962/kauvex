"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Send, User, ShieldCheck } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface TicketThreadProps {
  messages: Message[];
  ticketId: string;
  ticketStatus: string;
  currentUserId: string;
  onMessageSent?: () => void;
}

export default function TicketThread({ messages, ticketId, ticketStatus, currentUserId, onMessageSent }: TicketThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/v1/crm/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to send");
      }
      setNewMessage("");
      onMessageSent?.();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const isClosed = ticketStatus === "closed";

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {messages.map((msg) => {
          const isCustomer = msg.senderRole === "customer";
          const isCurrentUser = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${
                isCustomer
                  ? "bg-off-white border border-border"
                  : "bg-blue text-white"
              }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {isCustomer ? (
                    <User size={12} className={isCurrentUser ? "text-blue" : "text-text-4"} />
                  ) : (
                    <ShieldCheck size={12} className="text-white" />
                  )}
                  <span className={`text-[11px] font-medium ${isCustomer ? "text-text-3" : "text-white/80"}`}>
                    {isCustomer ? (isCurrentUser ? "You" : msg.senderName) : "Support Team"}
                  </span>
                  <span className={`text-[10px] ${isCustomer ? "text-text-4" : "text-white/60"}`}>
                    {new Date(msg.createdAt).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className={`text-sm ${isCustomer ? "text-text-1" : "text-white"}`}>{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {isClosed ? (
        <p className="text-center text-sm text-text-4 py-2">This ticket is closed. No new replies can be added.</p>
      ) : (
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type your reply..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue/20"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-10 w-10 rounded-lg bg-blue text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center flex-shrink-0 self-end"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
