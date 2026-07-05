"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Radio, ArrowLeft, Users, DollarSign, ShoppingBag,
  MessageCircle, Gift, Play, StopCircle, Calendar, Clock,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface StreamDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  viewerCount: number;
  peakViewers: number;
  totalLikes: number;
  totalOrders: number;
  totalRevenue: number;
  chatEnabled: boolean;
  streamUrl: string | null;
  recordingUrl: string | null;
  thumbnailUrl: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  products: { id: string; productName: string | null; price: number; flashPrice: number; quantity: number; sold: number }[];
  comments: { id: string; userId: string | null; message: string; createdAt: string }[];
}

export default function VendorLiveStreamDetailPage() {
  const params = useParams();
  const [stream, setStream] = useState<StreamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (params.id) fetchStream();
  }, [params.id]);

  const fetchStream = async () => {
    try {
      const res = await fetch(`/api/v1/live?id=${params.id}`);
      const data = await res.json();
      if (data.success) setStream(data.data);
    } catch (e) {
      console.error("Failed to fetch stream", e);
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async () => {
    if (!confirm("End this live stream?")) return;
    try {
      await fetch("/api/v1/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end", streamId: params.id }),
      });
      fetchStream();
    } catch (e) {
      console.error("Failed to end stream", e);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    try {
      await fetch("/api/v1/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", streamId: params.id, userId: "vendor", message: commentText }),
      });
      setCommentText("");
      fetchStream();
    } catch (e) {
      console.error("Failed to send comment", e);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading stream...</p>
    </div>
  );

  if (!stream) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Stream not found</p>
    </div>
  );

  const sideLinks = [
    { label: "Dashboard", href: "/vendor/live", active: false },
    { label: "Create Stream", href: "/vendor/live/create", active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-200 p-4 space-y-1 shrink-0">
        <h2 className="font-bold text-[#0A1628] px-3 mb-4">Live Commerce</h2>
        {sideLinks.map(l => (
          <Link key={l.label} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${l.active ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/vendor/live" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#0A1628]">{stream.title}</h1>
            <p className="text-sm text-gray-500">
              {stream.status === "live" && <span className="text-red-500 font-semibold">🔴 LIVE</span>}
              {stream.status === "scheduled" && "Scheduled"}
              {stream.status === "ended" && "Ended"}
              {stream.scheduledAt && ` — ${new Date(stream.scheduledAt).toLocaleString()}`}
            </p>
          </div>
          {stream.status === "live" && (
            <Button onClick={handleEndStream} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
              <StopCircle size={16} className="mr-1" /> End Stream
            </Button>
          )}
          {stream.status === "scheduled" && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Play size={16} className="mr-1" /> Go Live Now
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Viewers</p>
            <p className="text-xl font-bold text-[#0A1628]">{stream.viewerCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Peak Viewers</p>
            <p className="text-xl font-bold text-[#0A1628]">{stream.peakViewers || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Orders</p>
            <p className="text-xl font-bold text-[#0A1628]">{stream.totalOrders || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Revenue</p>
            <p className="text-xl font-bold text-green-600">₦{Number(stream.totalRevenue).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <ShoppingBag size={16} /> Products in Stream
            </h2>
            {stream.products?.length === 0 ? (
              <p className="text-sm text-gray-400">No products featured yet.</p>
            ) : (
              <div className="space-y-2">
                {stream.products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-[#0A1628]">{p.productName}</span>
                    <div className="text-right">
                      {p.flashPrice ? (
                        <p className="text-sm font-bold text-green-600">₦{Number(p.flashPrice).toLocaleString()}</p>
                      ) : (
                        <p className="text-sm text-gray-500">₦{Number(p.price).toLocaleString()}</p>
                      )}
                      <p className="text-[10px] text-gray-400">{p.sold || 0} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <MessageCircle size={16} /> Live Chat
            </h2>
            <div className="h-48 overflow-y-auto space-y-2 mb-3 border border-gray-100 rounded-lg p-2 bg-gray-50">
              {stream.comments?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center pt-8">No comments yet. Be the first!</p>
              ) : (
                stream.comments?.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold text-[#0A1628]">{c.userId || "Anonymous"}</span>
                    <span className="text-gray-500 ml-2">{c.message}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendComment()}
                placeholder="Send a message..."
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
              <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e86000]" onClick={handleSendComment}>Send</Button>
            </div>
          </div>
        </div>

        {stream.description && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-[#0A1628] mb-2">Description</h2>
            <p className="text-sm text-gray-600">{stream.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
