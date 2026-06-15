"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Send } from "lucide-react";

export default function ConciergePage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([
    { role: "ai", text: "Hi! I'm your Kauvex shopping concierge. Tell me what you're looking for — product, budget, preferences, anything!" },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setChat(c => [...c, { role: "user", text: message }]);
    setMessage("");
    setTimeout(() => {
      setChat(c => [...c, { role: "ai", text: "Great question! Let me search through thousands of products from our verified sellers to find the perfect match for you. Give me a moment..." }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={28} className="text-[#FF6B00]" />
            <h1 className="text-3xl font-bold">Kauvex Concierge</h1>
          </div>
          <p className="text-gray-400">Your personal AI shopping assistant. Tell me what you need, and I&apos;ll find the perfect products for you.</p>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 space-y-4 overflow-y-auto max-h-[60vh] mb-4">
          {chat.map((c, i) => (
            <div key={i} className={`flex gap-3 ${c.role === 'user' ? 'justify-end' : ''}`}>
              {c.role === 'ai' && <div className="w-8 h-8 bg-[#FF6B00] rounded-full flex items-center justify-center flex-shrink-0"><Sparkles size={14} className="text-white" /></div>}
              <div className={`max-w-[70%] p-3 rounded-xl text-sm ${c.role === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-[#FF6B00] text-white'}`}>
                {c.text}
              </div>
              {c.role === 'user' && <div className="w-8 h-8 bg-[#0A1628] rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">You</div>}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-2 flex items-center gap-2">
          <input value={message} onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Describe what you want to buy..."
            className="flex-1 h-10 px-3 text-sm focus:outline-none" />
          <Button onClick={handleSend} className="bg-[#FF6B00] hover:bg-[#e86000] h-10"><Send size={16} /></Button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            "I need a birthday gift under ₦15,000",
            "Find me running shoes size 42",
            "Best smartphones under ₦200,000",
          ].map(suggestion => (
            <button key={suggestion} onClick={() => { setMessage(suggestion); }}
              className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg p-2 hover:border-[#FF6B00] text-left">
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
