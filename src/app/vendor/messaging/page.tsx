"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Search, ChevronRight, User, Package, Clock } from "lucide-react";

interface Conversation {
  id: string;
  conversationType: string;
  title: string;
  updatedAt: string;
  participants: { userId: string; userRole: string; lastReadAt: string | null }[];
  messages: { id: string; message: string; senderRole: string; senderId: string; createdAt: string; isRead: boolean }[];
}

export default function VendorMessagingPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v1/vendor/messaging/conversations")
      .then((r) => r.json())
      .then((d) => { setConversations(d.conversations || []); setUnread(d.unread || 0); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/v1/vendor/messaging/messages?conversationId=${selected}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, [selected]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selected) return;
    const res = await fetch("/api/v1/vendor/messaging/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selected, senderId: "vendor", message: newMsg, senderRole: "vendor" }),
    });
    if (res.ok) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), message: newMsg, senderRole: "vendor", createdAt: new Date().toISOString() }]);
      setNewMsg("");
    }
  };

  const filtered = conversations.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-navy">Messaging</h1>
          <p className="text-sm text-text-3 mt-1">Customer conversations and order inquiries</p>
        </div>
        {unread > 0 && <span className="bg-orange text-white text-xs px-2.5 py-1 rounded-full font-medium">{unread} unread</span>}
      </div>

      <div className="flex gap-4 h-[600px]">
        <div className="w-80 shrink-0 bg-white rounded-xl border border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-text-3" />
              <input type="text" placeholder="Search conversations..." className="bg-transparent text-sm outline-none w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected === c.id ? "bg-orange/5 border-l-2 border-orange" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-3.5 h-3.5 text-text-3" /></div>
                  <p className="text-sm font-medium text-navy truncate flex-1">{c.title}</p>
                  <span className="text-[10px] text-text-4"><Clock className="w-3 h-3 inline" /> {new Date(c.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-text-3 truncate pl-9">{c.messages[0]?.message || "No messages"}</p>
                {c.messages.some((m) => !m.isRead && m.senderRole !== "vendor") && <span className="ml-9 w-2 h-2 rounded-full bg-orange inline-block" />}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-center text-text-3 text-sm py-8">No conversations yet</p>}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-border flex flex-col">
          {selected ? (
            <>
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium text-navy">{conversations.find((c) => c.id === selected)?.title}</p>
                <p className="text-xs text-text-3">{conversations.find((c) => c.id === selected)?.conversationType.replace("_", " ")}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderRole === "vendor" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${m.senderRole === "vendor" ? "bg-orange text-white rounded-br-sm" : "bg-gray-100 text-navy rounded-bl-sm"}`}>
                      <p>{m.message}</p>
                      <p className={`text-[10px] mt-1 ${m.senderRole === "vendor" ? "text-white/70" : "text-text-4"}`}>{new Date(m.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <input type="text" placeholder="Type a message..." className="flex-1 h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-orange" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                  <button onClick={sendMessage} className="bg-orange text-white h-10 w-10 rounded-lg flex items-center justify-center hover:bg-orange/90"><Send className="w-4 h-4" /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-text-3 mx-auto mb-3" />
                <p className="text-sm text-text-3">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}