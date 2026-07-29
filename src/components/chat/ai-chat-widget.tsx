"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Mic,
  Paperclip,
  ChevronDown,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  persona?: string;
  sources?: { title: string; category: string; similarity: number }[];
  messageId?: string;
}

const personas = [
  { name: "KAI", role: "KAUVEX AI Assistant", avatar: "K", color: "from-orange-400 to-orange-600" },
  { name: "Kemi Okafor", role: "Sales & Products", avatar: "KO", color: "from-purple-400 to-purple-600" },
  { name: "Tunde Nwachukwu", role: "Technical Support", avatar: "TN", color: "from-green-500 to-green-700" },
  { name: "Fatima Aliyu", role: "Orders & Returns", avatar: "FA", color: "from-blue-400 to-blue-600" },
];

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm **KAI**, Kauvex's AI assistant. I can help with product recommendations, order tracking, installation services, returns, and anything about the Kauvex platform. What can I help you with today?",
    timestamp: new Date(),
    persona: "KAI",
  },
];

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("kai-session-id");
  if (!sid) {
    sid = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("kai-session-id", sid);
  }
  return sid;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersona] = useState(personas[0]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userContent = input.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError("");

    try {
      const res = await fetch("/api/kai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userContent,
          conversationId,
          sessionId: getSessionId(),
          persona: currentPersona.name.toLowerCase(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errData.error || `Error ${res.status}`);
      }

      const data = await res.json();

      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
        persona: currentPersona.name,
        sources: data.sources,
        messageId: data.messageId,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to get response. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `I'm sorry, I encountered an error: ${err.message || "Please try again."}`,
          timestamp: new Date(),
          persona: currentPersona.name,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, conversationId, currentPersona.name]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFeedback = async (messageId: string | undefined, rating: number) => {
    if (!messageId) return;
    try {
      await fetch("/api/v1/kai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating }),
      });
    } catch {}
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-strong flex items-center justify-center hover:shadow-xl transition-shadow group"
          >
            <Sparkles size={24} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue rounded-full flex items-center justify-center text-[8px] font-bold">
              AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`fixed bottom-6 right-6 z-[9998] w-[400px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-strong border border-border overflow-hidden flex flex-col ${
              isMinimized ? "h-[60px]" : "h-[560px]"
            } transition-[height] duration-300`}
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${currentPersona.color} flex items-center justify-center text-sm font-bold`}>
                  {currentPersona.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{currentPersona.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-white/70">{currentPersona.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <ChevronDown size={16} className="rotate-180" /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-off-white">
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      <div
                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        {msg.role === "assistant" && (
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentPersona.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1`}>
                            {currentPersona.avatar}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-blue text-white rounded-tr-sm"
                              : "bg-white border border-border text-text-1 rounded-tl-sm shadow-soft"
                          }`}
                        >
                          <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>") }} />
                        </div>
                      </div>
                      {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                        <div className="flex gap-1 mt-1 ml-9 flex-wrap">
                          {msg.sources.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[8px] bg-blue-50 text-blue px-1.5 py-0.5 rounded">
                              {s.title.slice(0, 30)}
                            </span>
                          ))}
                        </div>
                      )}
                      {msg.role === "assistant" && msg.messageId && (
                        <div className="flex gap-2 mt-1 ml-9">
                          <button
                            onClick={() => handleFeedback(msg.messageId, 5)}
                            className="text-text-4 hover:text-success transition-colors"
                            title="Helpful"
                          >
                            <ThumbsUp size={10} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.messageId, 1)}
                            className="text-text-4 hover:text-red transition-colors"
                            title="Not helpful"
                          >
                            <ThumbsDown size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${currentPersona.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-1`}>
                        {currentPersona.avatar}
                      </div>
                      <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-soft">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="text-xs text-red text-center">{error}</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 py-2 border-t border-border bg-white flex gap-1.5 overflow-x-auto">
                  {["Track my order", "Installation help", "Return policy", "Talk to agent"].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setInput(action);
                        setTimeout(sendMessage, 100);
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-full bg-off-white border border-border text-[11px] text-text-3 font-medium hover:bg-orange-50 hover:border-orange hover:text-orange transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t border-border bg-white shrink-0">
                  <div className="flex items-center gap-2 bg-off-white rounded-xl px-3 py-2 border border-border focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/10">
                    <button className="text-text-4 hover:text-text-2 transition-colors">
                      <Paperclip size={16} />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask KAI anything..."
                      className="flex-1 bg-transparent text-sm text-text-1 placeholder:text-text-4 outline-none"
                    />
                    <button className="text-text-4 hover:text-text-2 transition-colors">
                      <Mic size={16} />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isTyping}
                      className="w-8 h-8 rounded-lg bg-orange text-white flex items-center justify-center hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}