"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Radio, Calendar, Clock, Plus, Users, DollarSign,
  Play, Eye, ShoppingBag, TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Stream {
  id: string;
  title: string;
  description: string | null;
  status: string;
  viewerCount: number;
  peakViewers: number;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  totalOrders: number;
  totalRevenue: number;
  products: { id: string; productName: string | null; flashPrice: number; sold: number }[];
}

export default function VendorLivePage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await fetch("/api/v1/live?vendorId=current");
      const data = await res.json();
      if (data.success) setStreams(data.data);
    } catch (e) {
      console.error("Failed to fetch streams", e);
    } finally {
      setLoading(false);
    }
  };

  const liveStreams = streams.filter(s => s.status === "live");
  const scheduledStreams = streams.filter(s => s.status === "scheduled");
  const endedStreams = streams.filter(s => s.status === "ended");

  const totalViewers = streams.reduce((s, st) => s + (st.viewerCount || 0), 0);
  const totalRevenue = streams.reduce((s, st) => s + Number(st.totalRevenue || 0), 0);

  const sideLinks = [
    { label: "Dashboard", href: "/vendor/live", active: true },
    { label: "Create Stream", href: "/vendor/live/create" },
  ];

  const renderStreamCard = (stream: Stream) => (
    <Link key={stream.id} href={`/vendor/live/${stream.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-[#0A1628] text-sm flex-1">{stream.title}</h3>
          {stream.status === "live" && (
            <span className="flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full inline-block" /> LIVE
            </span>
          )}
          {stream.status === "scheduled" && (
            <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full shrink-0">Scheduled</span>
          )}
          {stream.status === "ended" && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Ended</span>
          )}
        </div>
        {stream.description && <p className="text-xs text-gray-500 line-clamp-2">{stream.description}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Users size={12} /> {stream.viewerCount || 0}</span>
          <span className="flex items-center gap-1"><Radio size={12} /> Peak {stream.peakViewers || 0}</span>
          {stream.status === "ended" && (
            <span className="flex items-center gap-1 text-green-600"><DollarSign size={12} /> ₦{Number(stream.totalRevenue).toLocaleString()}</span>
          )}
        </div>
        {stream.scheduledAt && stream.status === "scheduled" && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={12} /> {new Date(stream.scheduledAt).toLocaleString()}
          </div>
        )}
        {stream.products?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {stream.products.slice(0, 3).map((p) => (
              <span key={p.id} className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded">{p.productName}</span>
            ))}
            {stream.products.length > 3 && <span className="text-[10px] text-gray-400">+{stream.products.length - 3}</span>}
          </div>
        )}
      </div>
    </Link>
  );

  const streamsByTab = { live: liveStreams, scheduled: scheduledStreams, ended: endedStreams };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">Live Streams</h1>
            <p className="text-sm text-gray-500 mt-1">Go live, manage streams, and track performance</p>
          </div>
          <Link href="/vendor/live/create">
            <Button className="bg-[#FF6B00] hover:bg-[#e86000]"><Plus size={16} className="mr-1" /> Create Stream</Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <p className="text-xs text-gray-500">Live Now</p>
            </div>
            <p className="text-2xl font-bold text-[#0A1628]">{liveStreams.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2">Total Streams</p>
            <p className="text-2xl font-bold text-[#0A1628]">{streams.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2">Total Viewers</p>
            <p className="text-2xl font-bold text-[#0A1628]">{totalViewers.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-fit">
          {[
            { id: "live", label: "Live Now", icon: Radio },
            { id: "scheduled", label: "Scheduled", icon: Calendar },
            { id: "ended", label: "Ended", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-[#FF6B00] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading streams...</div>
        ) : streamsByTab[activeTab as keyof typeof streamsByTab].length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Radio size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-[#0A1628] mb-1">No {activeTab} streams</h3>
            <p className="text-sm text-gray-500 mb-4">
              {activeTab === "live" ? "You're not live right now. Start a stream!" :
               activeTab === "scheduled" ? "Schedule your first live stream." :
               "No ended streams yet."}
            </p>
            <Link href="/vendor/live/create">
              <Button className="bg-[#FF6B00] hover:bg-[#e86000]"><Plus size={16} className="mr-1" /> Create Stream</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {streamsByTab[activeTab as keyof typeof streamsByTab].map(renderStreamCard)}
          </div>
        )}
      </div>
    </div>
  );
}
