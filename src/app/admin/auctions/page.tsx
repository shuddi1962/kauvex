"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  Timer, Search, Eye, TrendingUp, DollarSign,
  Gavel, Clock, X, Check, AlertTriangle, BarChart3,
  Plus, Package, Send,
} from "lucide-react";

interface Auction {
  id: string;
  title: string;
  product: string;
  starting_bid: number;
  current_bid: number;
  reserve_price: number;
  bid_count: number;
  start_time: string;
  end_time: string;
  status: string;
  winner: string | null;
}

interface Bid {
  id: string;
  auction_id: string;
  bidder: string;
  amount: number;
  time: string;
}

const now = new Date();
const fmtDate = (d: Date) => d.toISOString().slice(0, 16).replace("T", " ");

const auctions: Auction[] = [
  { id: "1", title: "Hikvision 4MP Security Kit", product: "Hikvision 4MP Dome Camera + NVR", starting_bid: 180000, current_bid: 245000, reserve_price: 200000, bid_count: 12, start_time: fmtDate(new Date(now.getTime() - 7 * 86400000)), end_time: fmtDate(new Date(now.getTime() + 2 * 86400000)), status: "active", winner: null },
  { id: "2", title: "Yamaha 40HP Outboard Engine", product: "Yamaha 40HP Outboard Engine", starting_bid: 1800000, current_bid: 2100000, reserve_price: 1900000, bid_count: 8, start_time: fmtDate(new Date(now.getTime() - 5 * 86400000)), end_time: fmtDate(new Date(now.getTime() + 1 * 86400000)), status: "active", winner: null },
  { id: "3", title: "Full CCTV DVR Kit 8CH", product: "CCTV 8CH DVR Kit with 4 Cameras", starting_bid: 120000, current_bid: 175000, reserve_price: 150000, bid_count: 15, start_time: fmtDate(new Date(now.getTime() - 3 * 86400000)), end_time: fmtDate(new Date(now.getTime() + 3 * 86400000)), status: "active", winner: null },
  { id: "4", title: "Marine GPS Navigator Pro", product: "Marine GPS Navigator 7-inch", starting_bid: 220000, current_bid: 310000, reserve_price: 250000, bid_count: 20, start_time: fmtDate(new Date(now.getTime() - 10 * 86400000)), end_time: fmtDate(new Date(now.getTime() - 1 * 86400000)), status: "ended", winner: "Chidi Okeke" },
  { id: "5", title: "Fire Alarm Panel 8-Zone", product: "Fire Alarm Panel 8-Zone Addressable", starting_bid: 65000, current_bid: 82000, reserve_price: 70000, bid_count: 6, start_time: fmtDate(new Date(now.getTime() - 2 * 86400000)), end_time: fmtDate(new Date(now.getTime() + 4 * 86400000)), status: "active", winner: null },
  { id: "6", title: "Access Control Biometric", product: "ZKTeco Access Control + RFID", starting_bid: 85000, current_bid: 95000, reserve_price: 90000, bid_count: 4, start_time: fmtDate(new Date(now.getTime() - 1 * 86400000)), end_time: fmtDate(new Date(now.getTime() + 5 * 86400000)), status: "active", winner: null },
  { id: "7", title: "Kitchen Hood 90cm Stainless", product: "Kitchen Hood 90cm Stainless Steel", starting_bid: 95000, current_bid: 140000, reserve_price: 110000, bid_count: 9, start_time: fmtDate(new Date(now.getTime() - 14 * 86400000)), end_time: fmtDate(new Date(now.getTime() - 2 * 86400000)), status: "sold", winner: "Amara Nwachukwu" },
  { id: "8", title: "Industrial Smoke Detector (10pk)", product: "Wireless Smoke Detector 10-Pack", starting_bid: 85000, current_bid: 85000, reserve_price: 90000, bid_count: 0, start_time: fmtDate(new Date(now.getTime() - 8 * 86400000)), end_time: fmtDate(new Date(now.getTime() - 1 * 86400000)), status: "unsold", winner: null },
  { id: "9", title: "Life Jacket Adult 10-Pack", product: "Life Jacket Adult (10-Pack)", starting_bid: 75000, current_bid: 110000, reserve_price: 80000, bid_count: 7, start_time: fmtDate(new Date(now.getTime() - 4 * 86400000)), end_time: fmtDate(new Date(now.getTime() + 2 * 86400000)), status: "extended", winner: null },
  { id: "10", title: "Boat Engine Oil 20L", product: "Boat Engine Oil 4L (5-Pack)", starting_bid: 40000, current_bid: 58000, reserve_price: 45000, bid_count: 11, start_time: fmtDate(new Date(now.getTime() - 6 * 86400000)), end_time: fmtDate(new Date(now.getTime())), status: "active", winner: null },
];

const bidHistory: Bid[] = [
  { id: "1", auction_id: "1", bidder: "Emeka Obi", amount: 245000, time: "2026-06-14 14:30" },
  { id: "2", auction_id: "1", bidder: "Zainab Bello", amount: 240000, time: "2026-06-14 12:15" },
  { id: "3", auction_id: "1", bidder: "Chidi Okeke", amount: 235000, time: "2026-06-14 10:00" },
  { id: "4", auction_id: "1", bidder: "Emeka Obi", amount: 225000, time: "2026-06-13 22:45" },
  { id: "5", auction_id: "1", bidder: "Folake Adeyemi", amount: 220000, time: "2026-06-13 18:30" },
  { id: "6", auction_id: "2", bidder: "Lagos Marine Ltd", amount: 2100000, time: "2026-06-14 15:00" },
  { id: "7", auction_id: "2", bidder: "Coastal Ventures", amount: 2050000, time: "2026-06-13 16:20" },
  { id: "8", auction_id: "2", bidder: "Lagos Marine Ltd", amount: 2000000, time: "2026-06-12 11:10" },
  { id: "9", auction_id: "3", bidder: "Security Pro NG", amount: 175000, time: "2026-06-14 16:45" },
  { id: "10", auction_id: "3", bidder: "Amara Nwachukwu", amount: 168000, time: "2026-06-14 09:30" },
  { id: "11", auction_id: "4", bidder: "Chidi Okeke", amount: 310000, time: "2026-06-04 20:00" },
  { id: "12", auction_id: "7", bidder: "Amara Nwachukwu", amount: 140000, time: "2026-06-01 12:00" },
];

const productOptions = [
  "Hikvision 4MP Dome Camera",
  "Yamaha 40HP Outboard Engine",
  "CCTV 8CH DVR Kit",
  "Marine GPS Navigator",
  "Fire Alarm Panel 8-Zone",
  "Access Control ZKTeco",
  "Kitchen Hood 90cm",
  "Life Jacket Adult",
  "Boat Engine Oil 4L",
  "Smoke Detector Wireless",
];

const tabs = ["Active Auctions", "Ended", "Create Auction"];

function getTimeRemaining(endTime: string): string {
  const end = new Date(endTime);
  const diff = end.getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AuctionsPage() {
  const [activeTab, setActiveTab] = useState("Active Auctions");
  const [search, setSearch] = useState("");
  const [viewAuction, setViewAuction] = useState<Auction | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    product: "", title: "", starting_bid: "", reserve_price: "", start_time: "", end_time: "",
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeAuctions = auctions.filter((a) => a.status === "active" || a.status === "extended");
  const endedAuctions = auctions.filter((a) => ["ended", "sold", "unsold", "pending"].includes(a.status));
  const totalBids = auctions.reduce((s, a) => s + a.bid_count, 0);
  const avgPremium = activeAuctions.length > 0
    ? Math.round(activeAuctions.reduce((s, a) => s + ((a.current_bid - a.starting_bid) / a.starting_bid) * 100, 0) / activeAuctions.length)
    : 0;
  const sellThrough = auctions.filter((a) => a.status === "sold" || a.status === "ended").length > 0
    ? Math.round((auctions.filter((a) => a.status === "sold").length / auctions.filter((a) => a.status === "sold" || a.status === "ended" || a.status === "unsold").length) * 100)
    : 0;

  const filteredActive = activeAuctions.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) || a.product.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEnded = endedAuctions.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) || a.product.toLowerCase().includes(search.toLowerCase())
  );

  const getBidsForAuction = (auctionId: string) => bidHistory.filter((b) => b.auction_id === auctionId).sort((a, b) => b.amount - a.amount);

  const createAuction = () => {
    if (!createForm.product || !createForm.title || !createForm.starting_bid || !createForm.end_time) return;
    const newAuction: Auction = {
      id: `${auctions.length + 1}`,
      title: createForm.title,
      product: createForm.product,
      starting_bid: Number(createForm.starting_bid),
      current_bid: Number(createForm.starting_bid),
      reserve_price: Number(createForm.reserve_price) || Number(createForm.starting_bid),
      bid_count: 0,
      start_time: createForm.start_time || fmtDate(new Date()),
      end_time: createForm.end_time,
      status: "pending",
      winner: null,
    };
    auctions.push(newAuction);
    setShowCreate(false);
    setCreateForm({ product: "", title: "", starting_bid: "", reserve_price: "", start_time: "", end_time: "" });
  };

  return (
    <AdminShell title="Auction Marketplace" subtitle="Manage product auctions and bidding">
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"}`}>
            {tab === "Create Auction" ? <Plus size={16} /> : tab === "Active Auctions" ? <Gavel size={16} /> : <Clock size={16} />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Active Auctions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Auctions", value: activeAuctions.length, icon: Gavel, color: "text-blue" },
              { label: "Total Bids", value: totalBids, icon: TrendingUp, color: "text-green-600" },
              { label: "Avg Bid Premium", value: `${avgPremium}%`, icon: DollarSign, color: "text-purple-600" },
              { label: "Sell-Through Rate", value: `${sellThrough}%`, icon: BarChart3, color: "text-orange" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-text-4">{s.label}</span></div>
                <p className="text-xl font-bold text-text-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search auctions..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredActive.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Package size={18} className="text-blue" /></div>
                      <div>
                        <h4 className="font-semibold text-sm text-text-1 leading-tight">{a.title}</h4>
                        <p className="text-[10px] text-text-4">{a.product}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === "active" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange"}`}>{a.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 mb-2">
                    <Timer size={14} className="text-text-4" />
                    <span className={`text-xs font-mono font-semibold ${getTimeRemaining(a.end_time) === "Ended" ? "text-red" : "text-blue"}`}>
                      {getTimeRemaining(a.end_time)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-text-4">Current Bid</p>
                      <p className="text-lg font-bold text-text-1">₦{a.current_bid.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-text-4">Bids</p>
                      <p className="text-sm font-semibold">{a.bid_count}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-text-4 mt-1">
                    <span>Starting: ₦{a.starting_bid.toLocaleString()}</span>
                    <span>Reserve: ₦{a.reserve_price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button onClick={() => setViewAuction(a)} className="w-full h-9 text-xs font-medium rounded-lg border border-gray-200 text-text-2 hover:bg-gray-50 flex items-center justify-center gap-1">
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            ))}
            {filteredActive.length === 0 && (
              <div className="col-span-full text-center py-12 text-text-4 text-sm">No active auctions found.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Ended" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ended auctions..." className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Auction", "Final Bid", "Bids", "Winner", "Ended", "Status", ""].map((h) => (
                      <th key={h} className="text-left p-3 text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEnded.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium text-text-1">{a.title}</p>
                        <p className="text-[10px] text-text-4">{a.product}</p>
                      </td>
                      <td className="p-3 font-semibold">₦{a.current_bid.toLocaleString()}</td>
                      <td className="p-3">{a.bid_count}</td>
                      <td className="p-3 text-xs">{a.winner || "-"}</td>
                      <td className="p-3 text-xs text-text-3">{a.end_time}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.status === "sold" ? "bg-green-50 text-green-600" : a.status === "ended" ? "bg-blue-50 text-blue" : "bg-red-50 text-red"}`}>{a.status}</span>
                      </td>
                      <td className="p-3"><button onClick={() => setViewAuction(a)} className="text-xs text-blue hover:underline"><Eye size={12} className="inline mr-1" />View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "Create Auction" && (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <h3 className="font-semibold text-base flex items-center gap-2"><Plus size={18} className="text-blue" /> New Auction Listing</h3>
            <div>
              <label className="text-xs text-text-4 block mb-1 font-medium">Product *</label>
              <select value={createForm.product} onChange={(e) => { setCreateForm({ ...createForm, product: e.target.value, title: e.target.value }); }} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue">
                <option value="">Select a product...</option>
                {productOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-4 block mb-1 font-medium">Auction Title *</label>
              <input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-4 block mb-1 font-medium">Starting Bid (₦) *</label>
                <input type="number" value={createForm.starting_bid} onChange={(e) => setCreateForm({ ...createForm, starting_bid: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs text-text-4 block mb-1 font-medium">Reserve Price (₦)</label>
                <input type="number" value={createForm.reserve_price} onChange={(e) => setCreateForm({ ...createForm, reserve_price: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-4 block mb-1 font-medium">Start Time</label>
                <input type="datetime-local" value={createForm.start_time} onChange={(e) => setCreateForm({ ...createForm, start_time: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs text-text-4 block mb-1 font-medium">End Time *</label>
                <input type="datetime-local" value={createForm.end_time} onChange={(e) => setCreateForm({ ...createForm, end_time: e.target.value })} className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={createAuction} disabled={!createForm.product || !createForm.title || !createForm.starting_bid || !createForm.end_time} className="flex-1 h-10 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Send size={14} /> Create Auction
              </button>
              <button onClick={() => setShowCreate(!showCreate)} className="px-6 h-10 border border-gray-200 rounded-lg text-sm text-text-2 hover:bg-gray-50">Clear</button>
            </div>
          </div>
        </div>
      )}

      {viewAuction && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewAuction(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-lg">{viewAuction.title}</h2>
              <button onClick={() => setViewAuction(null)} className="p-2 rounded-lg hover:bg-gray-50 text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-text-4">Product:</span><p className="font-medium">{viewAuction.product}</p></div>
                <div><span className="text-text-4">Status:</span><p><span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${viewAuction.status === "active" ? "bg-green-50 text-green-600" : viewAuction.status === "sold" ? "bg-blue-50 text-blue" : viewAuction.status === "unsold" ? "bg-red-50 text-red" : viewAuction.status === "extended" ? "bg-orange-50 text-orange" : "bg-gray-100 text-text-4"}`}>{viewAuction.status}</span></p></div>
                <div><span className="text-text-4">Starting Bid:</span><p className="font-medium">₦{viewAuction.starting_bid.toLocaleString()}</p></div>
                <div><span className="text-text-4">Current Bid:</span><p className="font-bold text-blue text-base">₦{viewAuction.current_bid.toLocaleString()}</p></div>
                <div><span className="text-text-4">Reserve Price:</span><p className="font-medium">₦{viewAuction.reserve_price.toLocaleString()}</p></div>
                <div><span className="text-text-4">Total Bids:</span><p className="font-semibold">{viewAuction.bid_count}</p></div>
                <div><span className="text-text-4">Winner:</span><p className="font-medium">{viewAuction.winner || "No winner yet"}</p></div>
                <div><span className="text-text-4">Time Remaining:</span><p className="font-mono font-semibold text-blue">{getTimeRemaining(viewAuction.end_time)}</p></div>
                <div className="col-span-2"><span className="text-text-4 text-xs">Started: {viewAuction.start_time} · Ends: {viewAuction.end_time}</span></div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"><Gavel size={14} className="text-blue" /> Bid History</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {getBidsForAuction(viewAuction.id).length === 0 ? (
                    <p className="text-xs text-text-4 text-center py-4">No bids yet.</p>
                  ) : getBidsForAuction(viewAuction.id).map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-text-1">{bid.bidder}</p>
                        <p className="text-[10px] text-text-4">{bid.time}</p>
                      </div>
                      <p className="text-xs font-bold text-blue">₦{bid.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
