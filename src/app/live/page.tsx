"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, ShoppingBag, Play, Clock, Users } from "lucide-react";

interface LiveStream {
  id: string;
  vendor: string;
  title: string;
  viewers: number;
  likes: number;
  thumbnail: string;
  status: "live" | "scheduled";
  scheduledAt?: string;
}

export default function LivePage() {
  const [activeStreams] = useState<LiveStream[]>([
    { id: "1", vendor: "TechHub NG", title: "New iPhone 16 - First Look & Giveaway!", viewers: 1240, likes: 3400, thumbnail: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=250&fit=crop", status: "live" },
    { id: "2", vendor: "Fashion Avenue", title: "Summer Collection Launch - 50% Off Live Only!", viewers: 890, likes: 2100, thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=250&fit=crop", status: "live" },
    { id: "3", vendor: "Gadget Galaxy", title: "Smart Home Devices Review & Demo", viewers: 560, likes: 1200, thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop", status: "live" },
    { id: "4", vendor: "Beauty Bliss", title: "Skincare Routine - Live Tutorial", viewers: 0, likes: 0, thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=250&fit=crop", status: "scheduled", scheduledAt: "Tomorrow, 3:00 PM" },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-3xl font-bold">Kauvex Live</h1>
          </div>
          <p className="text-gray-400">Shop live with your favourite vendors. Watch. Chat. Buy instantly.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#0A1628] mb-4">🔴 Live Now</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStreams.filter(s => s.status === "live").map(stream => (
              <div key={stream.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Users size={12} /> {stream.viewers.toLocaleString()}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#0A1628] mb-1 line-clamp-2">{stream.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{stream.vendor}</p>
                  <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e86000] flex-1"><Play size={14} className="mr-1" /> Watch Live</Button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Heart size={18} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Share2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0A1628] mb-4">📅 Upcoming Streams</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStreams.filter(s => s.status === "scheduled").map(stream => (
              <div key={stream.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    <img src={stream.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0A1628] text-sm">{stream.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{stream.vendor}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <Clock size={12} /> {stream.scheduledAt}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-3">Set Reminder</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
