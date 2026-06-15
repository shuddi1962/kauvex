"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  MessageSquare, Search, Send, User, Phone, Video,
  Paperclip, Image, FileText, Check, CheckCheck,
  Circle, Archive, MoreHorizontal, Users, Store,
  Truck, Ticket, ChevronLeft, Clock,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: string;
  sender_avatar?: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  timestamp: string;
  is_mine: boolean;
}

interface Participant {
  name: string;
  role: string;
  online: boolean;
}

interface Conversation {
  id: string;
  title: string;
  type: "vendor_customer" | "admin_vendor" | "warehouse_driver" | "support_ticket";
  participants: Participant[];
  last_message: string;
  last_time: string;
  unread: number;
  messages: ChatMessage[];
  archived: boolean;
}

const seedConversations: Conversation[] = [
  {
    id: "1", title: "Order #ORD-2026-0842 — Delivery Issue",
    type: "vendor_customer",
    participants: [{ name: "John Doe", role: "Customer", online: true }, { name: "Hikvision Store", role: "Vendor", online: true }],
    last_message: "The driver is on his way with the replacement", last_time: "2 min ago", unread: 3,
    archived: false,
    messages: [
      { id: "m1", sender: "John Doe", content: "My DVR kit arrived but the hard drive is missing", type: "text", timestamp: "10:30 AM", is_mine: false },
      { id: "m2", sender: "You", content: "I'm sorry about that. Let me check with the warehouse", type: "text", timestamp: "10:31 AM", is_mine: true },
      { id: "m3", sender: "You", content: "We'll send a replacement hard drive today", type: "text", timestamp: "10:35 AM", is_mine: true },
      { id: "m4", sender: "John Doe", content: "Okay, when will it arrive?", type: "text", timestamp: "10:36 AM", is_mine: false },
      { id: "m5", sender: "You", content: "Before 5 PM today. I'll share the tracking number shortly.", type: "text", timestamp: "10:38 AM", is_mine: true },
      { id: "m6", sender: "John Doe", content: "Thanks!", type: "text", timestamp: "10:40 AM", is_mine: false },
    ],
  },
  {
    id: "2", title: "New Product Enquiry — Marine Engines",
    type: "admin_vendor",
    participants: [{ name: "Yamaha Marine NG", role: "Vendor", online: true }, { name: "You", role: "Admin", online: true }],
    last_message: "Can you approve the new listing?", last_time: "15 min ago", unread: 1,
    archived: false,
    messages: [
      { id: "m7", sender: "Yamaha Marine NG", content: "We've uploaded the new 50HP engine specs", type: "text", timestamp: "2:00 PM", is_mine: false },
      { id: "m8", sender: "Yamaha Marine NG", content: "Can you approve the listing?", type: "text", timestamp: "2:01 PM", is_mine: false },
      { id: "m9", sender: "You", content: "Let me review it now", type: "text", timestamp: "2:05 PM", is_mine: true },
    ],
  },
  {
    id: "3", title: "Warehouse Pickup — VI Location #WH-03",
    type: "warehouse_driver",
    participants: [{ name: "Emeka Driver", role: "Driver", online: true }, { name: "Warehouse VI", role: "Staff", online: false }],
    last_message: "Picked up 12 parcels for Island route", last_time: "32 min ago", unread: 0,
    archived: false,
    messages: [
      { id: "m10", sender: "Emeka Driver", content: "I'm at the VI warehouse now", type: "text", timestamp: "11:00 AM", is_mine: false },
      { id: "m11", sender: "You", content: "Great, the parcels are ready at bay 3", type: "text", timestamp: "11:02 AM", is_mine: true },
      { id: "m12", sender: "Emeka Driver", content: "Picked up 12 parcels for Island route", type: "text", timestamp: "11:20 AM", is_mine: false },
      { id: "m13", sender: "You", content: "Confirmed. ETA to first drop-off?", type: "text", timestamp: "11:22 AM", is_mine: true },
      { id: "m14", sender: "Emeka Driver", content: "About 25 minutes", type: "text", timestamp: "11:23 AM", is_mine: false },
    ],
  },
  {
    id: "4", title: "Support Ticket #TKT-4421 — Payment Failed",
    type: "support_ticket",
    participants: [{ name: "Fatima Usman", role: "Customer", online: false }, { name: "Support Team", role: "Staff", online: true }],
    last_message: "Still unable to process payment", last_time: "1 hour ago", unread: 5,
    archived: false,
    messages: [
      { id: "m15", sender: "Fatima Usman", content: "I've tried three different cards but none work", type: "text", timestamp: "3:00 PM", is_mine: false },
      { id: "m16", sender: "Fatima Usman", content: "Can someone help me urgently?", type: "text", timestamp: "3:01 PM", is_mine: false },
      { id: "m17", sender: "You", content: "I'm on it. Let me check the payment gateway logs.", type: "text", timestamp: "3:05 PM", is_mine: true },
      { id: "m18", sender: "You", content: "It appears your bank is blocking the transaction. Please try a different bank card or use bank transfer.", type: "text", timestamp: "3:10 PM", is_mine: true },
    ],
  },
  {
    id: "5", title: "Bulk Order Quote — 50 Units",
    type: "vendor_customer",
    participants: [{ name: "Daniel Martins", role: "Customer", online: true }, { name: "Access Control Pro", role: "Vendor", online: false }],
    last_message: "Quote sent for 50 units at ₦112,500 each", last_time: "2 hours ago", unread: 0,
    archived: false,
    messages: [
      { id: "m19", sender: "Daniel Martins", content: "Need a quote for 50 access control units", type: "text", timestamp: "11:00 AM", is_mine: false },
      { id: "m20", sender: "You", content: "I'll connect you with the vendor", type: "text", timestamp: "11:02 AM", is_mine: true },
      { id: "m21", sender: "Access Control Pro", content: "Quote sent for 50 units at ₦112,500 each", type: "text", timestamp: "11:30 AM", is_mine: false },
    ],
  },
  {
    id: "6", title: "Driver Route Update — Lekki Phase 1",
    type: "warehouse_driver",
    participants: [{ name: "Chidi Driver", role: "Driver", online: true }, { name: "Dispatch", role: "Staff", online: true }],
    last_message: "Delivered all 8 parcels in Lekki Phase 1", last_time: "3 hours ago", unread: 0,
    archived: false,
    messages: [
      { id: "m22", sender: "Chidi Driver", content: "Starting Lekki Phase 1 route now", type: "text", timestamp: "8:00 AM", is_mine: false },
      { id: "m23", sender: "You", content: "Roger that. 8 parcels on your manifest.", type: "text", timestamp: "8:02 AM", is_mine: true },
      { id: "m24", sender: "Chidi Driver", content: "Delivered all 8 parcels in Lekki Phase 1", type: "text", timestamp: "11:45 AM", is_mine: false },
      { id: "m25", sender: "Chidi Driver", content: "All signed for", type: "text", timestamp: "11:46 AM", is_mine: false },
    ],
  },
  {
    id: "7", title: "Refund Request — Damaged Fire Extinguisher",
    type: "support_ticket",
    participants: [{ name: "Chioma Eze", role: "Customer", online: false }, { name: "Returns Team", role: "Staff", online: true }],
    last_message: "Refund processed successfully", last_time: "5 hours ago", unread: 0,
    archived: true,
    messages: [
      { id: "m26", sender: "Chioma Eze", content: "The fire extinguisher arrived with a dent", type: "text", timestamp: "9:00 AM", is_mine: false },
      { id: "m27", sender: "You", content: "I apologize for that. Please upload photos so we can process a refund.", type: "text", timestamp: "9:05 AM", is_mine: true },
      { id: "m28", sender: "Chioma Eze", content: "[Image: damage.jpg]", type: "image", timestamp: "9:10 AM", is_mine: false },
      { id: "m29", sender: "You", content: "Thank you. Refund has been initiated to your original payment method.", type: "text", timestamp: "9:15 AM", is_mine: true },
      { id: "m30", sender: "System", content: "Refund of ₦18,000 processed successfully", type: "system", timestamp: "9:20 AM", is_mine: true },
    ],
  },
  {
    id: "8", title: "New Vendor Onboarding — Security Pro Ltd",
    type: "admin_vendor",
    participants: [{ name: "Security Pro Ltd", role: "Vendor", online: true }, { name: "You", role: "Admin", online: true }],
    last_message: "All documents uploaded for verification", last_time: "6 hours ago", unread: 2,
    archived: false,
    messages: [
      { id: "m31", sender: "Security Pro Ltd", content: "We've submitted our business registration docs", type: "text", timestamp: "10:00 AM", is_mine: false },
      { id: "m32", sender: "You", content: "Received. I'll review and get back to you within 24 hours.", type: "text", timestamp: "10:05 AM", is_mine: true },
      { id: "m33", sender: "Security Pro Ltd", content: "Do you also need tax clearance?", type: "text", timestamp: "10:10 AM", is_mine: false },
      { id: "m34", sender: "You", content: "Yes, please upload that as well", type: "text", timestamp: "10:12 AM", is_mine: true },
    ],
  },
  {
    id: "9", title: "Stock Request — CCTV Cameras (Warehouse)",
    type: "warehouse_driver",
    participants: [{ name: "Warehouse VI", role: "Staff", online: false }, { name: "Inventory Team", role: "Staff", online: true }],
    last_message: "Need 50 units of Hikvision 4MP from storage", last_time: "Yesterday", unread: 0,
    archived: false,
    messages: [
      { id: "m35", sender: "Warehouse VI", content: "Running low on Hikvision 4MP cameras", type: "text", timestamp: "4:00 PM", is_mine: false },
      { id: "m36", sender: "You", content: "I'll authorize a transfer from the main warehouse", type: "text", timestamp: "4:05 PM", is_mine: true },
    ],
  },
  {
    id: "10", title: "Product Feedback — Marine GPS Navigator",
    type: "vendor_customer",
    participants: [{ name: "Tunde Balogun", role: "Customer", online: false }, { name: "Marine Store NG", role: "Vendor", online: false }],
    last_message: "The GPS is excellent, very accurate", last_time: "Yesterday", unread: 0,
    archived: true,
    messages: [
      { id: "m37", sender: "Tunde Balogun", content: "Just installed the Marine GPS Navigator", type: "text", timestamp: "2:00 PM", is_mine: false },
      { id: "m38", sender: "Tunde Balogun", content: "The GPS is excellent, very accurate. Thank you!", type: "text", timestamp: "2:30 PM", is_mine: false },
      { id: "m39", sender: "You", content: "That's great to hear! Enjoy your navigation!", type: "text", timestamp: "2:35 PM", is_mine: true },
    ],
  },
];

const conversationTypes = [
  { type: "vendor_customer", label: "Vendor → Customer", icon: Store },
  { type: "admin_vendor", label: "Admin → Vendor", icon: Users },
  { type: "warehouse_driver", label: "Warehouse → Driver", icon: Truck },
  { type: "support_ticket", label: "Support Ticket", icon: Ticket },
];

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<"all" | "mine" | "archived">("all");
  const [search, setSearch] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const filtered = seedConversations.filter((c) => {
    if (activeTab === "archived" && !c.archived) return false;
    if (activeTab === "mine" && c.archived) return false;
    if (activeTab === "all" && c.archived) return false;
    return c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.participants.some((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  });

  const selectedConv = seedConversations.find((c) => c.id === selectedConvId);

  const getTypeInfo = (type: string) => conversationTypes.find((t) => t.type === type) || conversationTypes[0];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vendor_customer": return { bg: "bg-blue/10", text: "text-blue" };
      case "admin_vendor": return { bg: "bg-purple-50", text: "text-purple-600" };
      case "warehouse_driver": return { bg: "bg-green-50", text: "text-green-600" };
      case "support_ticket": return { bg: "bg-orange/10", text: "text-orange" };
      default: return { bg: "bg-gray-100", text: "text-text-4" };
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConv) return;
    setMessageInput("");
  };

  return (
    <AdminShell title="Internal Chat" subtitle="Team and cross-organization messaging">
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {[
          { id: "all" as const, label: "All Conversations", icon: MessageSquare },
          { id: "mine" as const, label: "My Chats", icon: Users },
          { id: "archived" as const, label: "Archived", icon: Archive },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)]">
        {/* Conversation List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats..." className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => {
              const typeInfo = getTypeInfo(conv.type);
              const badge = getTypeBadge(conv.type);
              return (
                <div key={conv.id} onClick={() => setSelectedConvId(conv.id)} className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedConvId === conv.id ? "bg-blue/5 border-l-2 border-l-blue" : ""}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <typeInfo.icon size={14} className="text-text-4 shrink-0" />
                      <span className="text-sm font-medium truncate text-text-1">{conv.title}</span>
                    </div>
                    <span className="text-[10px] text-text-4 shrink-0">{conv.last_time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>{typeInfo.label}</span>
                    {conv.unread > 0 && (
                      <span className="text-[9px] bg-red text-white px-1.5 py-0.5 rounded-full font-bold">{conv.unread}</span>
                    )}
                  </div>
                  <p className="text-xs text-text-4 truncate">{conv.last_message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {conv.participants.map((p) => (
                      <div key={p.name} className="flex items-center gap-1 text-[10px] text-text-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.online ? "bg-green-500" : "bg-gray-300"}`} />
                        <span className="truncate max-w-[80px]">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConvId(null)} className="lg:hidden p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} /></button>
                  <div>
                    <h3 className="font-semibold text-sm text-text-1">{selectedConv.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {selectedConv.participants.map((p) => (
                        <div key={p.name} className="flex items-center gap-1 text-[10px] text-text-4">
                          <div className={`w-1.5 h-1.5 rounded-full ${p.online ? "bg-green-500" : "bg-gray-300"}`} />
                          <span>{p.name}</span>
                          <span className="text-text-4">({p.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><Phone size={14} className="text-text-4" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><Video size={14} className="text-text-4" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><MoreHorizontal size={14} className="text-text-4" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConv.messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.type === "system" ? "justify-center" : msg.is_mine ? "flex-row-reverse" : ""}`}>
                    {msg.type === "system" ? (
                      <div className="bg-gray-50 px-3 py-1.5 rounded-full text-[10px] text-text-4">
                        <Clock size={10} className="inline mr-1" />{msg.content}
                      </div>
                    ) : (
                      <>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.is_mine ? "bg-blue/10" : "bg-orange/10"}`}>
                          <User size={12} className={msg.is_mine ? "text-blue" : "text-orange"} />
                        </div>
                        <div className={`max-w-[70%] ${msg.type === "image" ? "" : ""}`}>
                          {msg.type === "image" ? (
                            <div className="bg-gray-100 rounded-xl p-3 border border-gray-200">
                              <div className="flex items-center gap-2">
                                <Image size={16} className="text-text-4" />
                                <span className="text-xs text-text-2">Image attachment</span>
                              </div>
                            </div>
                          ) : msg.type === "file" ? (
                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                              <div className="flex items-center gap-2">
                                <FileText size={16} className="text-text-4" />
                                <span className="text-xs text-text-2">{msg.content}</span>
                              </div>
                            </div>
                          ) : (
                            <div className={`p-2.5 rounded-xl text-xs ${msg.is_mine ? "bg-blue text-white" : "bg-gray-50 border border-gray-200 text-text-2"}`}>
                              <p>{msg.content}</p>
                              <p className={`text-[9px] mt-1 ${msg.is_mine ? "text-white/60" : "text-text-4"}`}>{msg.timestamp}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg"><Paperclip size={16} className="text-text-4" /></button>
                  <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type your message..." className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                  <button onClick={sendMessage} className="w-10 h-10 rounded-lg bg-blue text-white flex items-center justify-center hover:bg-blue-600"><Send size={16} /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-3 text-text-4 opacity-30" />
                <h3 className="font-semibold text-text-2">Select a conversation</h3>
                <p className="text-sm text-text-4 mt-1">Choose a chat from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
