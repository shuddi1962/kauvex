"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, ShoppingBag, Play, Clock, Users, Radio } from "lucide-react";
import Link from "next/link";

interface LiveStream {
  id: string;
  title: string;
  description?: string;
  vendor?: string;
  viewerCount: number;
  peakViewers?: number;
  thumbnailUrl?: string;
  status: string;
  scheduledAt?: string;
  products?: { id: string; productName?: string; flashPrice?: number; price?: number }[];
}

export default function LivePage() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await fetch("/api/v1/live");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStreams(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch streams", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const res = await fetch("/api/v1/live?filter=upcoming");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setStreams(prev => {
          const existingIds = new Set(prev.map(s => s.id));
          const newStreams = data.data.filter((s: LiveStream) => !existingIds.has(s.id));
          return [...prev, ...newStreams];
        });
      }
    } catch (e) {
      console.error("Failed to fetch upcoming streams", e);
    }
  };

  useEffect(() => {
    if (streams.length > 0) fetchUpcoming();
  }, [streams.length === 0]);

  const liveStreams = streams.filter(s => s.status === "live");
  const upcomingStreams = streams.filter(s => s.status === "scheduled");

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
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading live streams...</div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-4">🔴 Live Now</h2>
              {liveStreams.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Radio size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-[#0A1628] mb-1">No live streams right now</h3>
                  <p className="text-sm text-gray-500">Check back later or browse upcoming streams.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveStreams.map(stream => (
                    <Link key={stream.id} href={`/vendor/live/${stream.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        {stream.thumbnailUrl ? (
                          <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A1628] to-[#1a2a4a]">
                            <Radio size={48} className="text-white/30" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
                        </div>
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Users size={12} /> {(stream.viewerCount || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[#0A1628] mb-1 line-clamp-2">{stream.title}</h3>
                        {stream.vendor && <p className="text-sm text-gray-500 mb-3">{stream.vendor}</p>}
                        <div className="flex items-center gap-3">
                          <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e86000] flex-1">
                            <Play size={14} className="mr-1" /> Watch Live
                          </Button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Heart size={18} /></button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Share2 size={18} /></button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-4">📅 Upcoming Streams</h2>
              {upcomingStreams.length === 0 ? (
                <p className="text-sm text-gray-400">No upcoming streams scheduled.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingStreams.map(stream => (
                    <div key={stream.id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {stream.thumbnailUrl ? (
                            <img src={stream.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A1628] to-[#1a2a4a]">
                              <Radio size={20} className="text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#0A1628] text-sm">{stream.title}</h3>
                          {stream.vendor && <p className="text-xs text-gray-500 mt-1">{stream.vendor}</p>}
                          {stream.scheduledAt && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                              <Clock size={12} /> {new Date(stream.scheduledAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3">Set Reminder</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
