"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, Plus, Loader2, Clock,
  DollarSign, Users, AlertCircle, Gavel, TrendingUp,
  X, CheckCircle, Zap, BarChart3, Info, Star,
  History, ArrowUp, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = ["All Categories", "Construction Equipment", "Marine Equipment", "Industrial Machinery", "Agricultural Machinery", "Security Equipment", "ICT Equipment", "Power & Energy Equipment", "Transportation Equipment"];

const sampleAuctions = [
  { id: "1", name: "Caterpillar 320D Excavator", category: "Construction Equipment", currentBid: 45000, reserveMet: true, timeRemaining: "2d 14h", bids: 12, status: "live", image: null, bidIncrement: 1000, minNextBid: 46000, endDate: "2026-08-01T14:00:00Z" },
  { id: "2", name: "Yanmar 4JH Marine Engine", category: "Marine Equipment", currentBid: 12500, reserveMet: false, timeRemaining: "5d 6h", bids: 4, status: "live", image: null, bidIncrement: 500, minNextBid: 13000, endDate: "2026-08-04T06:00:00Z" },
  { id: "3", name: "Komatsu WA380 Wheel Loader", category: "Construction Equipment", currentBid: 38000, reserveMet: true, timeRemaining: "1d 3h", bids: 18, status: "live", image: null, bidIncrement: 1000, minNextBid: 39000, endDate: "2026-07-30T03:00:00Z" },
  { id: "4", name: "500kVA Cummins Generator", category: "Power & Energy Equipment", currentBid: 22000, reserveMet: true, timeRemaining: "3d 8h", bids: 7, status: "live", image: null, bidIncrement: 500, minNextBid: 22500, endDate: "2026-08-02T08:00:00Z" },
  { id: "5", name: "John Deere 6125R Tractor", category: "Agricultural Machinery", currentBid: 55000, reserveMet: true, timeRemaining: "4d 1h", bids: 9, status: "live", image: null, bidIncrement: 1000, minNextBid: 56000, endDate: "2026-08-03T01:00:00Z" },
  { id: "6", name: "Toyota Land Cruiser 2022", category: "Transportation Equipment", currentBid: 38000, reserveMet: true, timeRemaining: "6d 12h", bids: 22, status: "live", image: null, bidIncrement: 1000, minNextBid: 39000, endDate: "2026-08-05T12:00:00Z" },
  { id: "7", name: "Manitowoc Crane 100T", category: "Construction Equipment", currentBid: 185000, reserveMet: true, timeRemaining: "10d 0h", bids: 3, status: "upcoming", image: null, bidIncrement: 5000, minNextBid: 190000, endDate: "2026-08-09T00:00:00Z" },
  { id: "8", name: "Himoinsa 250kVA Generator", category: "Power & Energy Equipment", currentBid: 15000, reserveMet: false, timeRemaining: "Ended", bids: 8, status: "ended", image: null, bidIncrement: 500, minNextBid: 15500, endDate: "2026-07-20T00:00:00Z" },
];

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
  const [bidModal, setBidModal] = useState<{ auction: typeof sampleAuctions[0]; bidAmount: number; maxBid: string; showConfirm: boolean; showSuccess: boolean; showHistory: boolean } | null>(null);
  const [biddingLoading, setBiddingLoading] = useState(false);

  const filtered = sampleAuctions.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All Categories" && a.category !== category) return false;
    if (status !== "all" && a.status !== status) return false;
    if (priceMin && a.currentBid < Number(priceMin)) return false;
    if (priceMax && a.currentBid > Number(priceMax)) return false;
    return true;
  });

  const getTimeColor = (time: string) => {
    if (time === "Ended") return "text-red-500";
    const hours = parseInt(time.split("d")[0]) * 24 + parseInt(time.split("d")[1]?.split("h")[0] || "0");
    if (hours <= 48) return "text-red-500";
    if (hours <= 120) return "text-amber-500";
    return "text-green-500";
  };

  const openBidModal = (auction: typeof sampleAuctions[0]) => {
    setBidModal({ auction, bidAmount: auction.minNextBid, maxBid: "", showConfirm: false, showSuccess: false, showHistory: false });
  };

  const adjustBid = (amount: number) => {
    if (!bidModal) return;
    const newAmount = Math.max(bidModal.auction.minNextBid, bidModal.bidAmount + amount);
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

  const quickBids = [1, 2, 3, 5].map((m) => {
    if (!bidModal) return 0;
    return bidModal.auction.currentBid * (1 + m / 100);
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
            <p className="text-gray-500 mt-1">Bid on industrial equipment and machinery in real-time</p>
          </div>
          <Link href="/marketplace/auctions/create">
            <Button><Plus size={16} className="mr-2" /> Create Auction</Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
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
            { id: "live", label: "Live" },
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
            {filtered.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  <Gavel size={48} className="text-gray-300" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={a.status === "live" ? "sale" : a.status === "upcoming" ? "info" : "outline"}>{a.status}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{a.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{a.category}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Current Bid</span>
                      <span className="font-bold text-[#FF6B00]">${a.currentBid.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Reserve</span>
                      <span className={`flex items-center gap-1 ${a.reserveMet ? "text-green-600" : "text-amber-600"}`}>{a.reserveMet ? "Met" : "Not Met"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><Users size={14} /> Bids</span>
                      <span className="font-medium">{a.bids}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1"><Clock size={14} /> Time</span>
                      <span className={`font-medium ${getTimeColor(a.timeRemaining)}`}>{a.timeRemaining}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {a.status === "live" && (
                      <Button className="flex-1" size="sm" onClick={() => openBidModal(a)}>
                        <DollarSign size={14} className="mr-1" /> Place Bid
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className={a.status !== "live" ? "flex-1" : ""}>View Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setBidModal(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center">
                  {bidModal.showSuccess ? <CheckCircle size={16} className="text-green-600" /> : <Gavel size={16} className="text-orange" />}
                </div>
                <div>
                  <h2 className="font-bold text-navy text-sm">{bidModal.showSuccess ? "Bid Placed!" : "Place Your Bid"}</h2>
                  <p className="text-[11px] text-gray-400">{bidModal.auction.name}</p>
                </div>
              </div>
              <button onClick={() => setBidModal(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><X size={16} className="text-gray-400" /></button>
            </div>

            {bidModal.showSuccess ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-600" /></div>
                <h3 className="text-lg font-bold text-navy mb-1">Bid Submitted!</h3>
                <p className="text-sm text-gray-500 mb-2">Your bid of <strong className="text-orange">${bidModal.bidAmount.toLocaleString()}</strong> has been placed.</p>
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
                    <span className="text-lg font-bold text-orange">${bidModal.auction.currentBid.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Increment: ${bidModal.auction.bidIncrement.toLocaleString()}</span>
                    <span>Min bid: <span className="font-semibold text-navy">${bidModal.auction.minNextBid.toLocaleString()}</span></span>
                  </div>
                  {!bidModal.auction.reserveMet && <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><Info size={12} /> Reserve not yet met. Your bid must meet or exceed the reserve price.</div>}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => adjustBid(-bidModal.auction.bidIncrement)} disabled={bidModal.bidAmount <= bidModal.auction.minNextBid} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-400 hover:border-orange hover:text-orange transition-colors disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="number" value={bidModal.bidAmount} min={bidModal.auction.minNextBid} step={bidModal.auction.bidIncrement} onChange={(e) => setBidModal({ ...bidModal, bidAmount: Math.max(bidModal.auction.minNextBid, parseInt(e.target.value) || 0), showConfirm: false })} className="w-full h-12 pl-8 pr-3 rounded-xl border-2 border-gray-200 text-lg font-bold text-center text-navy focus:outline-none focus:border-orange" />
                    </div>
                    <button onClick={() => adjustBid(bidModal.auction.bidIncrement)} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-400 hover:border-orange hover:text-orange transition-colors">+</button>
                  </div>
                  <div className="flex gap-1.5">
                    {quickBids.map((amount, i) => (
                      <button key={i} onClick={() => setBidModal({ ...bidModal, bidAmount: Math.round(amount), showConfirm: false })}
                        className={`flex-1 text-[10px] font-semibold py-1.5 rounded-lg border transition-colors ${bidModal.bidAmount === Math.round(amount) ? "border-orange bg-[#FFF4EC] text-orange" : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                        +{1 * (i + 1)}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proxy Bidding */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-orange" />
                    <span className="text-xs font-semibold text-navy">Proxy Bidding (Optional)</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-2">Set a maximum bid and let the system automatically bid for you up to that limit.</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" value={bidModal.maxBid} onChange={(e) => setBidModal({ ...bidModal, maxBid: e.target.value })} placeholder="Max bid amount" className="w-full h-10 pl-8 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange" />
                  </div>
                </div>

                {/* Bid History */}
                <button onClick={() => setBidModal({ ...bidModal, showHistory: !bidModal.showHistory })} className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-navy py-2 transition-colors">
                  <span className="flex items-center gap-1"><History size={12} /> Bid History ({bidModal.auction.bids} bids)</span>
                  <ArrowUp size={12} className={`transition-transform ${bidModal.showHistory ? "rotate-180" : ""}`} />
                </button>
                {bidModal.showHistory && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                    {generateBidHistory(bidModal.auction.currentBid, bidModal.auction.bids).map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy">{h.bidder}</span>
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

                {/* Confirm & Submit */}
                {bidModal.showConfirm ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <AlertCircle size={20} className="text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-amber-800 mb-1">Confirm Your Bid</p>
                    <p className="text-lg font-bold text-orange mb-3">${bidModal.bidAmount.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setBidModal({ ...bidModal, showConfirm: false })} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                      <button onClick={submitBid} disabled={biddingLoading} className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {biddingLoading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Confirm Bid"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setBidModal({ ...bidModal, showConfirm: true })}
                    className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
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