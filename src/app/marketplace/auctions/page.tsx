"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, Plus, Loader2, Clock,
  DollarSign, Users, AlertCircle, Gavel, TrendingUp,
  X, CheckCircle, Zap, BarChart3, Info, Star,
  History, ArrowUp, RefreshCw, Timer, Volume2,
  ArrowDown, ShoppingBag, Shield, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AuctionType = "timed" | "live" | "dutch" | "hybrid";
type AuctionStatus = "live" | "upcoming" | "ended";

interface Auction {
  id: string;
  name: string;
  category: string;
  type: AuctionType;
  status: AuctionStatus;
  image: string | null;
  endDate: string;
  bids: number;
  currentBid: number;
  reserveMet: boolean;
  depositRequired: boolean;
  buyItNow?: number;
  startingPrice?: number;
  priceDecrement?: number;
  decrementInterval?: number;
  liveSession?: string;
  viewerCount?: number;
}

const categories = ["All Categories", "Construction Equipment", "Marine Equipment", "Industrial Machinery", "Agricultural Machinery", "Security Equipment", "ICT Equipment", "Power & Energy Equipment", "Transportation Equipment"];

const auctionTypes = [
  { id: "all", label: "All Types", icon: null },
  { id: "timed", label: "Timed", icon: Timer },
  { id: "live", label: "Live", icon: Volume2 },
  { id: "dutch", label: "Dutch", icon: ArrowDown },
  { id: "hybrid", label: "BIN + Auction", icon: ShoppingBag },
];

const sampleAuctions: Auction[] = [
  // TIMED AUCTIONS (2)
  { id: "t1", name: "Caterpillar 320D Excavator", category: "Construction Equipment", type: "timed", status: "live", image: null, endDate: "2026-08-01T14:00:00Z", bids: 12, currentBid: 45000, reserveMet: true, depositRequired: true, startingPrice: 35000 },
  { id: "t2", name: "500kVA Cummins Generator", category: "Power & Energy Equipment", type: "timed", status: "live", image: null, endDate: "2026-07-30T08:00:00Z", bids: 7, currentBid: 22000, reserveMet: false, depositRequired: false, startingPrice: 18000 },
  { id: "t3", name: "Yanmar 4JH Marine Engine", category: "Marine Equipment", type: "timed", status: "upcoming", image: null, endDate: "2026-08-10T06:00:00Z", bids: 0, currentBid: 12500, reserveMet: false, depositRequired: true, startingPrice: 10000 },

  // LIVE AUCTIONS (2)
  { id: "l1", name: "Manitowoc Crane 100T", category: "Construction Equipment", type: "live", status: "live", image: null, endDate: "2026-07-29T18:00:00Z", bids: 23, currentBid: 185000, reserveMet: true, depositRequired: true, liveSession: "Session #482 - Heavy Equipment", viewerCount: 147 },
  { id: "l2", name: "Komatsu WA380 Wheel Loader", category: "Construction Equipment", type: "live", status: "live", image: null, endDate: "2026-07-29T19:30:00Z", bids: 18, currentBid: 38000, reserveMet: true, depositRequired: true, liveSession: "Session #483 - Construction Fleet", viewerCount: 89 },
  { id: "l3", name: "Industrial Air Compressor 200HP", category: "Industrial Machinery", type: "live", status: "upcoming", image: null, endDate: "2026-08-05T20:00:00Z", bids: 0, currentBid: 15000, reserveMet: false, depositRequired: true, liveSession: "Session #491 - Industrial Tools", viewerCount: 0 },

  // DUTCH AUCTIONS (2)
  { id: "d1", name: "John Deere 6125R Tractor", category: "Agricultural Machinery", type: "dutch", status: "live", image: null, endDate: "2026-07-29T16:00:00Z", bids: 0, currentBid: 55000, reserveMet: true, depositRequired: false, startingPrice: 72000, priceDecrement: 2000, decrementInterval: 30 },
  { id: "d2", name: "Toyota Land Cruiser 2022", category: "Transportation Equipment", type: "dutch", status: "live", image: null, endDate: "2026-07-30T12:00:00Z", bids: 0, currentBid: 42000, reserveMet: true, depositRequired: true, startingPrice: 65000, priceDecrement: 1500, decrementInterval: 45 },
  { id: "d3", name: "Himoinsa 250kVA Generator", category: "Power & Energy Equipment", type: "dutch", status: "ended", image: null, endDate: "2026-07-20T00:00:00Z", bids: 1, currentBid: 28000, reserveMet: true, depositRequired: false, startingPrice: 40000, priceDecrement: 1000, decrementInterval: 30 },

  // HYBRID AUCTIONS (2)
  { id: "h1", name: "Heavy Duty Forklift 5-Ton", category: "Industrial Machinery", type: "hybrid", status: "live", image: null, endDate: "2026-08-03T14:00:00Z", bids: 5, currentBid: 18500, reserveMet: false, depositRequired: false, buyItNow: 35000 },
  { id: "h2", name: "Solar Panel Array 50kW", category: "Power & Energy Equipment", type: "hybrid", status: "live", image: null, endDate: "2026-08-07T10:00:00Z", bids: 3, currentBid: 12000, reserveMet: true, depositRequired: true, buyItNow: 28000 },
  { id: "h3", name: "CAT Backhoe Loader 420F", category: "Construction Equipment", type: "hybrid", status: "upcoming", image: null, endDate: "2026-08-12T09:00:00Z", bids: 0, currentBid: 0, reserveMet: false, depositRequired: false, buyItNow: 82000 },
];

function getTimeRemaining(endDate: string): { text: string; expired: boolean } {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return { text: "Ended", expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return { text: `${days}d ${hours}h`, expired: false };
  if (hours > 0) return { text: `${hours}h ${minutes}m`, expired: false };
  return { text: `${minutes}m`, expired: false };
}

function getTimeColor(time: { text: string; expired: boolean }, endDate: string) {
  if (time.expired) return "text-red-500";
  const now = new Date();
  const end = new Date(endDate);
  const hours = (end.getTime() - now.getTime()) / 3600000;
  if (hours <= 2) return "text-red-500";
  if (hours <= 48) return "text-amber-500";
  return "text-green-500";
}

function formatCountdown(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function useCountdown(endDate: string) {
  const [display, setDisplay] = useState(formatCountdown(endDate));
  useEffect(() => {
    const interval = setInterval(() => setDisplay(formatCountdown(endDate)), 1000);
    return () => clearInterval(interval);
  }, [endDate]);
  return display;
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const display = useCountdown(endDate);
  const time = getTimeRemaining(endDate);
  return <span className={getTimeColor(time, endDate)}>{display}</span>;
}

const typeConfig: Record<AuctionType, { label: string; color: string; bg: string; icon: any }> = {
  timed: { label: "Timed", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Timer },
  live: { label: "Live", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: Volume2 },
  dutch: { label: "Dutch", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: ArrowDown },
  hybrid: { label: "BIN + Auction", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: ShoppingBag },
};

function generateBidHistory(currentBid: number, bids: number) {
  const history = [];
  let price = currentBid;
  for (let i = 0; i < Math.min(bids, 5); i++) {
    const bidder = ["Acme Corp", "Global Imports Ltd", "EquipMart", "BuildRite Nigeria", "HeavyQuip Inc", "MegaMachinery", "IndustrialHub NG"][Math.floor(Math.random() * 7)];
    history.push({ bidder, amount: price, time: `${i + 1}h ago`, auto: i > 0 && Math.random() > 0.6 });
    price -= [1000, 500, 2000][Math.floor(Math.random() * 3)];
  }
  return history.reverse();
}

export default function AuctionsPage() {
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [bidModal, setBidModal] = useState<{ auction: Auction; bidAmount: number; maxBid: string; showConfirm: boolean; showSuccess: boolean; showHistory: boolean } | null>(null);
  const [biddingLoading, setBiddingLoading] = useState(false);
  const [dutchAccepted, setDutchAccepted] = useState(false);

  const filtered = sampleAuctions.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All Categories" && a.category !== category) return false;
    if (status !== "all" && a.status !== status) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (priceMin && a.currentBid < Number(priceMin)) return false;
    if (priceMax && a.currentBid > Number(priceMax)) return false;
    return true;
  });

  const openBidModal = (auction: Auction) => {
    setBidModal({ auction, bidAmount: auction.currentBid > 0 ? auction.currentBid + 500 : (auction.startingPrice || 1000), maxBid: "", showConfirm: false, showSuccess: false, showHistory: false });
    setDutchAccepted(false);
  };

  const adjustBid = (amount: number) => {
    if (!bidModal) return;
    const newAmount = Math.max(bidModal.auction.currentBid + 500, bidModal.bidAmount + amount);
    setBidModal({ ...bidModal, bidAmount: newAmount, showConfirm: false });
  };

  const submitBid = () => {
    if (!bidModal) return;
    setBiddingLoading(true);
    setTimeout(() => {
      setBiddingLoading(false);
      setBidModal({ ...bidModal, showSuccess: true, showConfirm: false });
    }, 1500);
  };

  const acceptDutchPrice = () => {
    if (!bidModal) return;
    setBiddingLoading(true);
    setTimeout(() => {
      setBiddingLoading(false);
      setDutchAccepted(true);
    }, 1000);
  };

  const quickBids = [1, 2, 3, 5].map((m) => {
    if (!bidModal) return 0;
    return (bidModal.auction.currentBid || bidModal.auction.startingPrice || 0) * (1 + m / 100);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Industrial Auctions</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Industrial Auctions</h1>
            <p className="text-gray-500 mt-1">Bid on industrial equipment and machinery — 4 auction formats</p>
          </div>
          <Link href="/marketplace/auctions/create">
            <Button><Plus size={16} className="mr-2" /> Create Auction</Button>
          </Link>
        </div>

        {/* Auction Type Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {auctionTypes.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTypeFilter(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${typeFilter === t.id ? "bg-[#0A1628] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF6B00]"}`}>
                {Icon && <Icon size={14} />}
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search auctions..." className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]">
            {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap items-center">
          {[
            { id: "all", label: "All" },
            { id: "live", label: "Live Now" },
            { id: "upcoming", label: "Upcoming" },
            { id: "ended", label: "Ended" },
          ].map((s) => (
            <button key={s.id} onClick={() => setStatus(s.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === s.id ? "bg-[#FF6B00] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF6B00]"}`}>{s.label}</button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min $" className="w-24 h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
            <span className="text-gray-400">-</span>
            <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max $" className="w-24 h-9 px-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Gavel size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Auctions Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or create a new auction.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const tc = typeConfig[a.type];
              const time = getTimeRemaining(a.endDate);
              const TypeIcon = tc.icon;
              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    {a.type === "live" ? (
                      <Volume2 size={48} className="text-gray-300" />
                    ) : a.type === "dutch" ? (
                      <ArrowDown size={48} className="text-gray-300" />
                    ) : a.type === "hybrid" ? (
                      <ShoppingBag size={48} className="text-gray-300" />
                    ) : (
                      <Timer size={48} className="text-gray-300" />
                    )}
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tc.bg} ${tc.color}`}>
                        <TypeIcon size={11} />
                        {tc.label}
                      </span>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant={a.status === "live" ? "sale" : a.status === "upcoming" ? "info" : "outline"}>{a.status}</Badge>
                    </div>
                    {/* Deposit Required Badge */}
                    {a.depositRequired && (
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Shield size={10} /> Deposit Required
                        </span>
                      </div>
                    )}
                    {/* Live viewer count */}
                    {a.type === "live" && a.viewerCount && a.viewerCount > 0 && (
                      <div className="absolute bottom-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <Users size={10} /> {a.viewerCount}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{a.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{a.category}</p>
                    <div className="mt-3 space-y-2">
                      {/* Bid Info — type-specific */}
                      {a.type === "dutch" ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Current Price</span>
                            <span className="font-bold text-purple-600">${a.currentBid.toLocaleString()}</span>
                          </div>
                          {a.startingPrice && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Started At</span>
                              <span className="text-gray-400 line-through">${a.startingPrice.toLocaleString()}</span>
                            </div>
                          )}
                          {a.priceDecrement && a.decrementInterval && a.status === "live" && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-1"><ArrowDown size={14} /> Drop</span>
                              <span className="font-medium text-purple-600">${a.priceDecrement} / {a.decrementInterval}min</span>
                            </div>
                          )}
                        </>
                      ) : a.type === "hybrid" ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Current Bid</span>
                            <span className="font-bold text-[#FF6B00]">${a.currentBid.toLocaleString()}</span>
                          </div>
                          {a.buyItNow && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-1"><ShoppingBag size={14} /> Buy It Now</span>
                              <span className="font-bold text-emerald-600">${a.buyItNow.toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      ) : a.type === "live" ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Current Bid</span>
                            <span className="font-bold text-red-600">${a.currentBid.toLocaleString()}</span>
                          </div>
                          {a.liveSession && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Session</span>
                              <span className="text-xs text-gray-600 truncate max-w-[140px]">{a.liveSession}</span>
                            </div>
                          )}
                          {a.viewerCount && a.viewerCount > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500 flex items-center gap-1"><Users size={14} /> Watching</span>
                              <span className="font-medium">{a.viewerCount}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Current Bid</span>
                            <span className="font-bold text-[#FF6B00]">${a.currentBid.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1"><Users size={14} /> Bids</span>
                            <span className="font-medium">{a.bids}</span>
                          </div>
                        </>
                      )}

                      {/* Reserve status — for timed & hybrid */}
                      {(a.type === "timed" || a.type === "hybrid") && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Reserve</span>
                          <span className={`flex items-center gap-1 ${a.reserveMet ? "text-green-600" : "text-amber-600"}`}>
                            {a.reserveMet ? "Met" : "Not Met"}
                          </span>
                        </div>
                      )}

                      {/* Time */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1"><Clock size={14} /> {a.type === "live" ? "Ends" : "Time"}</span>
                        {a.type === "timed" && a.status === "live" ? (
                          <span className={`font-medium tabular-nums ${getTimeColor(time, a.endDate)}`}>
                            <CountdownTimer endDate={a.endDate} />
                          </span>
                        ) : (
                          <span className={`font-medium ${getTimeColor(time, a.endDate)}`}>{time.text}</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {a.status === "live" && a.type === "timed" && (
                        <Button className="flex-1" size="sm" onClick={() => openBidModal(a)}>
                          <DollarSign size={14} className="mr-1" /> Place Bid
                        </Button>
                      )}
                      {a.status === "live" && a.type === "dutch" && (
                        <Button className="flex-1" size="sm" onClick={() => openBidModal(a)}>
                          <ArrowDown size={14} className="mr-1" /> Accept Price
                        </Button>
                      )}
                      {a.status === "live" && a.type === "hybrid" && (
                        <>
                          <Button className="flex-[2]" size="sm" onClick={() => openBidModal(a)}>
                            <DollarSign size={14} className="mr-1" /> Place Bid
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                            <ShoppingBag size={14} className="mr-1" /> Buy Now
                          </Button>
                        </>
                      )}
                      {a.status === "live" && a.type === "live" && (
                        <Button className="flex-1" size="sm" onClick={() => openBidModal(a)}>
                          <Volume2 size={14} className="mr-1" /> Join Live
                        </Button>
                      )}
                      {a.status !== "live" && (
                        <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {bidModal && bidModal.auction.type === "dutch" && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setBidModal(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                  {dutchAccepted ? <CheckCircle size={16} className="text-green-600" /> : <ArrowDown size={16} className="text-purple-600" />}
                </div>
                <div>
                  <h2 className="font-bold text-[#0A1628] text-sm">{dutchAccepted ? "Price Accepted!" : "Dutch Auction"}</h2>
                  <p className="text-[11px] text-gray-400">{bidModal.auction.name}</p>
                </div>
              </div>
              <button onClick={() => setBidModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><X size={16} className="text-gray-400" /></button>
            </div>

            {dutchAccepted ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-600" /></div>
                <h3 className="text-lg font-bold text-[#0A1628] mb-1">Purchase Confirmed!</h3>
                <p className="text-sm text-gray-500 mb-4">You accepted the price of <strong className="text-purple-600">${bidModal.auction.currentBid.toLocaleString()}</strong>.</p>
                <Button onClick={() => setBidModal(null)} className="w-full">Continue to Checkout</Button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Current Price</span>
                    <span className="text-lg font-bold text-purple-600">${bidModal.auction.currentBid.toLocaleString()}</span>
                  </div>
                  {bidModal.auction.startingPrice && (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Started at</span>
                      <span className="line-through">${bidModal.auction.startingPrice.toLocaleString()}</span>
                    </div>
                  )}
                  {bidModal.auction.priceDecrement && bidModal.auction.decrementInterval && (
                    <div className="mt-2 text-xs text-purple-600 bg-white rounded-lg px-3 py-1.5 flex items-center gap-1">
                      <ArrowDown size={12} /> Dropping ${bidModal.auction.priceDecrement} every {bidModal.auction.decrementInterval}min
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <AlertCircle size={20} className="text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-amber-800 mb-1">First to accept wins</p>
                  <p className="text-xs text-amber-600">The price will continue dropping until someone accepts. No bidding — just accept the current price.</p>
                </div>

                <button onClick={acceptDutchPrice} disabled={biddingLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {biddingLoading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Accept ${bidModal.auction.currentBid.toLocaleString()}</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {bidModal && bidModal.auction.type === "live" && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setBidModal(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center"><Volume2 size={16} className="text-red-600" /></div>
                <div>
                  <h2 className="font-bold text-[#0A1628] text-sm">Live Auction Room</h2>
                  <p className="text-[11px] text-gray-400">{bidModal.auction.name}</p>
                </div>
              </div>
              <button onClick={() => setBidModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 text-white">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-semibold">LIVE — Auction in Progress</span>
                </div>
                <p className="text-2xl font-bold">${bidModal.auction.currentBid.toLocaleString()}</p>
                <p className="text-sm opacity-80">Current Bid</p>
              </div>
              {bidModal.auction.viewerCount && bidModal.auction.viewerCount > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Users size={14} /> {bidModal.auction.viewerCount} watching
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto">
                {generateBidHistory(bidModal.auction.currentBid, bidModal.auction.bids).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0A1628]">{h.bidder}</span>
                    <span className="font-semibold text-red-600">${h.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setBidModal(null)} variant="outline" className="flex-1">Leave</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700">
                  <Gavel size={14} className="mr-1" /> Place Bid
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bidModal && (bidModal.auction.type === "timed" || bidModal.auction.type === "hybrid") && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setBidModal(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                  {bidModal.showSuccess ? <CheckCircle size={16} className="text-green-600" /> : <Gavel size={16} className="text-[#FF6B00]" />}
                </div>
                <div>
                  <h2 className="font-bold text-[#0A1628] text-sm">{bidModal.showSuccess ? "Bid Placed!" : "Place Your Bid"}</h2>
                  <p className="text-[11px] text-gray-400">{bidModal.auction.name}</p>
                </div>
              </div>
              <button onClick={() => setBidModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><X size={16} className="text-gray-400" /></button>
            </div>

            {bidModal.showSuccess ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-600" /></div>
                <h3 className="text-lg font-bold text-[#0A1628] mb-1">Bid Submitted!</h3>
                <p className="text-sm text-gray-500 mb-2">Your bid of <strong className="text-[#FF6B00]">${bidModal.bidAmount.toLocaleString()}</strong> has been placed.</p>
                {bidModal.maxBid ? <p className="text-xs text-gray-400 mb-4">Max bid set: ${parseInt(bidModal.maxBid).toLocaleString()} (proxy bidding active)</p> : <p className="text-xs text-gray-400 mb-4">You'll be notified if you're outbid.</p>}
                <div className="flex gap-3">
                  <Button onClick={() => setBidModal(null)} variant="outline" className="flex-1">Close</Button>
                  <Button onClick={() => { setBidModal(null); }} className="flex-1">View My Bids</Button>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Current Bid</span>
                    <span className="text-lg font-bold text-[#FF6B00]">${bidModal.auction.currentBid.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Increment: $500</span>
                    <span>Min bid: <span className="font-semibold text-[#0A1628]">${(bidModal.auction.currentBid + 500).toLocaleString()}</span></span>
                  </div>
                  {!bidModal.auction.reserveMet && <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><Info size={12} /> Reserve not yet met. Your bid must meet or exceed the reserve price.</div>}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => adjustBid(-500)} disabled={bidModal.bidAmount <= bidModal.auction.currentBid + 500} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-400 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="number" value={bidModal.bidAmount} min={bidModal.auction.currentBid + 500} step={500} onChange={(e) => setBidModal({ ...bidModal, bidAmount: Math.max(bidModal.auction.currentBid + 500, parseInt(e.target.value) || 0), showConfirm: false })} className="w-full h-12 pl-8 pr-3 rounded-xl border-2 border-gray-200 text-lg font-bold text-center text-[#0A1628] focus:outline-none focus:border-[#FF6B00]" />
                    </div>
                    <button onClick={() => adjustBid(500)} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-400 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors">+</button>
                  </div>
                  <div className="flex gap-1.5">
                    {quickBids.map((amount, i) => (
                      <button key={i} onClick={() => setBidModal({ ...bidModal, bidAmount: Math.round(amount), showConfirm: false })}
                        className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg border transition-colors ${bidModal.bidAmount === Math.round(amount) ? "border-[#FF6B00] bg-[#FFF4EC] text-[#FF6B00]" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                        +{1 * (i + 1)}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-[#FF6B00]" />
                    <span className="text-xs font-semibold text-[#0A1628]">Proxy Bidding (Optional)</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-2">Set a maximum bid and let the system automatically bid for you up to that limit.</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" value={bidModal.maxBid} onChange={(e) => setBidModal({ ...bidModal, maxBid: e.target.value })} placeholder="Max bid amount" className="w-full h-10 pl-8 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
                  </div>
                </div>

                <button onClick={() => setBidModal({ ...bidModal, showHistory: !bidModal.showHistory })} className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-[#0A1628] py-2 transition-colors">
                  <span className="flex items-center gap-1"><History size={12} /> Bid History ({bidModal.auction.bids} bids)</span>
                  <ArrowUp size={12} className={`transition-transform ${bidModal.showHistory ? "rotate-180" : ""}`} />
                </button>
                {bidModal.showHistory && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                    {generateBidHistory(bidModal.auction.currentBid, bidModal.auction.bids).map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#0A1628]">{h.bidder}</span>
                          {h.auto && <Badge variant="outline" className="text-[8px] px-1 py-0">Auto</Badge>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">${h.amount.toLocaleString()}</span>
                          <span className="text-gray-400">{h.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bidModal.showConfirm ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <AlertCircle size={20} className="text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-amber-800 mb-1">Confirm Your Bid</p>
                    <p className="text-lg font-bold text-[#FF6B00] mb-3">${bidModal.bidAmount.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setBidModal({ ...bidModal, showConfirm: false })} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                      <button onClick={submitBid} disabled={biddingLoading} className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {biddingLoading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Confirm Bid"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setBidModal({ ...bidModal, showConfirm: true })}
                    className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Gavel size={16} /> Place Bid — ${bidModal.bidAmount.toLocaleString()}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
