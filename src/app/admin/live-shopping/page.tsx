"use client";

import { useState } from "react";
import {
  Radio, Calendar, Clock, Plus, Eye, Edit, Trash2, Users,
  DollarSign, PlayCircle, CheckCircle, XCircle, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const streamTabs = [
  { id: "live", label: "Live Now", icon: Radio },
  { id: "scheduled", label: "Scheduled", icon: Calendar },
  { id: "ended", label: "Ended", icon: Clock },
  { id: "create", label: "Create Stream", icon: Plus },
];

interface Stream {
  id: string;
  title: string;
  description: string;
  creator: string;
  status: "live" | "scheduled" | "ended";
  viewer_count: number;
  peak_viewers: number;
  scheduled_at: string;
  ended_at: string | null;
  revenue: string;
  products: { product_name: string; price: number; flash_price: number; sold_qty: number }[];
}

const seedStreams: Stream[] = [
  { id: "s1", title: "Fashion Friday — Summer Collection Launch", description: "Live showcase of our new summer collection with exclusive flash discounts", creator: "Amara Okafor", status: "live", viewer_count: 1240, peak_viewers: 1560, scheduled_at: "2026-06-15 16:00", ended_at: null, revenue: "₦1.2M", products: [{ product_name: "Summer Dress Floral", price: 25000, flash_price: 18500, sold_qty: 34 }, { product_name: "Straw Tote Bag", price: 15000, flash_price: 11000, sold_qty: 22 }] },
  { id: "s2", title: "Tech Tuesday — Hikvision Launch", description: "Exclusive first look at the new Hikvision 8MP security camera system", creator: "Chidi Eze", status: "live", viewer_count: 890, peak_viewers: 1100, scheduled_at: "2026-06-15 18:00", ended_at: null, revenue: "₦890K", products: [{ product_name: "Hikvision 8MP Camera", price: 185000, flash_price: 159000, sold_qty: 12 }] },
  { id: "s3", title: "Beauty Hour — Skincare Routine", description: "Live skincare demo with Zara — get your glow on!", creator: "Zara Bello", status: "scheduled", viewer_count: 0, peak_viewers: 0, scheduled_at: "2026-06-17 15:00", ended_at: null, revenue: "—", products: [{ product_name: "Vitamin C Serum", price: 8500, flash_price: 6500, sold_qty: 0 }, { product_name: "Retinol Night Cream", price: 15000, flash_price: 12000, sold_qty: 0 }] },
  { id: "s4", title: "Home & Living — Kitchen Makeover", description: "Transform your kitchen with our latest home collection", creator: "Ngozi Obi", status: "scheduled", viewer_count: 0, peak_viewers: 0, scheduled_at: "2026-06-18 14:00", ended_at: null, revenue: "—", products: [{ product_name: "Non-Stick Pot Set", price: 35000, flash_price: 28000, sold_qty: 0 }] },
  { id: "s5", title: "Fitness Frenzy — Home Gym Deals", description: "Get fit at home with huge discounts on gym equipment", creator: "Tunde Balogun", status: "ended", viewer_count: 2340, peak_viewers: 2800, scheduled_at: "2026-06-10 17:00", ended_at: "2026-06-10 19:30", revenue: "₦3.4M", products: [{ product_name: "Adjustable Dumbbells", price: 45000, flash_price: 35000, sold_qty: 45 }, { product_name: "Resistance Bands Set", price: 8000, flash_price: 5500, sold_qty: 67 }] },
  { id: "s6", title: "Gadgets Galore — MacBook & More", description: "Massive discounts on laptops, earbuds and smart home devices", creator: "Femi Adewale", status: "ended", viewer_count: 4200, peak_viewers: 5100, scheduled_at: "2026-06-08 19:00", ended_at: "2026-06-08 21:00", revenue: "₦8.2M", products: [{ product_name: "MacBook Pro M4", price: 2450000, flash_price: 2290000, sold_qty: 8 }, { product_name: "AirPods Pro 2", price: 320000, flash_price: 275000, sold_qty: 34 }] },
  { id: "s7", title: "Cooking Live — Jollof Special", description: "Simi cooks the perfect Nigerian Jollof rice with our premium cookware", creator: "Simi Lawal", status: "ended", viewer_count: 5600, peak_viewers: 7200, scheduled_at: "2026-06-05 16:00", ended_at: "2026-06-05 18:15", revenue: "₦5.1M", products: [{ product_name: "Non-Stick Pot Set", price: 35000, flash_price: 29900, sold_qty: 89 }, { product_name: "Spice Rack 12-Jar", price: 12000, flash_price: 9500, sold_qty: 56 }] },
  { id: "s8", title: "Travel Deals — Weekend Getaway Gear", description: "Everything you need for your next adventure at unbeatable prices", creator: "Dapo Ogun", status: "scheduled", viewer_count: 0, peak_viewers: 0, scheduled_at: "2026-06-20 14:00", ended_at: null, revenue: "—", products: [{ product_name: "Travel Backpack 45L", price: 28000, flash_price: 22000, sold_qty: 0 }, { product_name: "Portable Charger 20000mAh", price: 15000, flash_price: 11000, sold_qty: 0 }] },
];

const streamFormInitial = { title: "", description: "", creator: "", scheduled_at: "", productSearch: "" };

export default function AdminLiveShoppingPage() {
  const [activeTab, setActiveTab] = useState("live");
  const [streams, setStreams] = useState<Stream[]>(seedStreams);
  const [showDetail, setShowDetail] = useState<Stream | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [streamForm, setStreamForm] = useState(streamFormInitial);
  const [selectedProducts, setSelectedProducts] = useState<{ product_name: string; price: number; flash_price: number; sold_qty: number }[]>([]);

  const liveStreams = streams.filter(s => s.status === "live");
  const scheduledStreams = streams.filter(s => s.status === "scheduled");
  const endedStreams = streams.filter(s => s.status === "ended");

  const handleCreateStream = () => {
    if (!streamForm.title || !streamForm.creator || !streamForm.scheduled_at) return;
    const newStream: Stream = {
      id: `s${Date.now()}`,
      title: streamForm.title,
      description: streamForm.description,
      creator: streamForm.creator,
      status: "scheduled",
      viewer_count: 0,
      peak_viewers: 0,
      scheduled_at: streamForm.scheduled_at,
      ended_at: null,
      revenue: "—",
      products: selectedProducts,
    };
    setStreams(prev => [newStream, ...prev]);
    setShowCreate(false);
    setStreamForm(streamFormInitial);
    setSelectedProducts([]);
    setActiveTab("scheduled");
  };

  const totalViewers = streams.filter(s => s.status !== "scheduled").reduce((sum, s) => sum + s.viewer_count, 0);
  const totalRevenue = endedStreams.reduce((sum, s) => {
    const rev = parseInt(s.revenue.replace(/[₦,M]/g, "")) * (s.revenue.includes("M") ? 1000000 : 1);
    return sum + (isNaN(rev) ? 0 : rev);
  }, 0);

  const streamsByStatus = { live: liveStreams, scheduled: scheduledStreams, ended: endedStreams };

  const renderStreamCard = (stream: Stream) => (
    <div key={stream.id} onClick={() => setShowDetail(stream)} className={`bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${stream.status === "live" ? "border-green-400 ring-1 ring-green-200" : "border-border"}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-1 truncate">{stream.title}</h3>
            <p className="text-xs text-text-4 mt-0.5">{stream.creator}</p>
          </div>
          {stream.status === "live" && (
            <span className="flex items-center gap-1 bg-green-50 text-success text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 bg-success rounded-full inline-block" /> LIVE
            </span>
          )}
          {stream.status === "scheduled" && <span className="text-[10px] bg-yellow-50 text-warning px-2 py-0.5 rounded-full font-medium">Scheduled</span>}
          {stream.status === "ended" && <span className="text-[10px] bg-gray-100 text-text-4 px-2 py-0.5 rounded-full font-medium">Ended</span>}
        </div>
        <p className="text-xs text-text-3 line-clamp-2">{stream.description}</p>
        <div className="flex items-center gap-3 text-xs text-text-3">
          <span className="flex items-center gap-1"><Users size={12} /> {stream.viewer_count.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Radio size={12} /> Peak {stream.peak_viewers.toLocaleString()}</span>
          {stream.status === "ended" && <span className="flex items-center gap-1 text-success"><DollarSign size={12} /> {stream.revenue}</span>}
        </div>
        {stream.status === "scheduled" && (
          <div className="text-xs text-text-4 flex items-center gap-1"><Calendar size={12} /> {stream.scheduled_at}</div>
        )}
        <div className="flex flex-wrap gap-1">
          {stream.products.map((p, i) => (
            <span key={i} className="text-[10px] bg-off-white text-text-3 px-1.5 py-0.5 rounded">{p.product_name}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AdminShell title="Live Shopping" subtitle="Manage live streams, flash sales, and real-time shopping events">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-syne font-700 text-2xl text-text-1">Live Shopping</h1>
            <p className="text-sm text-text-3 mt-1">Stream management, flash deals, and live commerce</p>
          </div>
          <Button variant="default" size="sm" onClick={() => { setShowCreate(true); setActiveTab("create"); }}>
            <Plus className="w-3 h-3 mr-1" /> Create Stream
          </Button>
        </div>

        <div className="flex gap-1 bg-white rounded-xl border border-border p-1 mb-6">
          {streamTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-off-white"}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="font-syne font-700 text-2xl text-red-500">{liveStreams.length}</p>
            <p className="text-xs text-text-3 mt-1">Live Now</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="font-syne font-700 text-2xl text-blue">{streams.length}</p>
            <p className="text-xs text-text-3 mt-1">Total Streams</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="font-syne font-700 text-2xl text-warning">{totalViewers.toLocaleString()}</p>
            <p className="text-xs text-text-3 mt-1">Total Viewers</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="font-syne font-700 text-2xl text-success">₦{(totalRevenue / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-text-3 mt-1">Total Revenue</p>
          </div>
        </div>

        {activeTab === "create" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl space-y-4">
            <h2 className="font-syne font-bold text-lg flex items-center gap-2"><Radio size={18} className="text-blue" /> Create New Stream</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-text-2 mb-1 block">Stream Title</label>
                <input value={streamForm.title} onChange={e => setStreamForm({ ...streamForm, title: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" placeholder="e.g. Fashion Friday" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-text-2 mb-1 block">Description</label>
                <textarea value={streamForm.description} onChange={e => setStreamForm({ ...streamForm, description: e.target.value })} className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:border-blue resize-none" placeholder="Describe the stream..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Creator</label>
                <select value={streamForm.creator} onChange={e => setStreamForm({ ...streamForm, creator: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                  <option value="">Select creator</option>
                  <option>Amara Okafor</option>
                  <option>Chidi Eze</option>
                  <option>Zara Bello</option>
                  <option>Tunde Balogun</option>
                  <option>Ngozi Obi</option>
                  <option>Femi Adewale</option>
                  <option>Simi Lawal</option>
                  <option>Dapo Ogun</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Scheduled Date/Time</label>
                <input value={streamForm.scheduled_at} onChange={e => setStreamForm({ ...streamForm, scheduled_at: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" placeholder="2026-06-20 14:00" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 mb-1 block">Add Products (with Flash Prices)</label>
              <div className="border border-border rounded-lg p-3 space-y-2">
                {selectedProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <input value={p.product_name} readOnly className="flex-1 h-9 px-2 rounded border border-border text-xs bg-gray-50" />
                    <input value={p.flash_price} readOnly className="w-24 h-9 px-2 rounded border border-border text-xs bg-gray-50" placeholder="Flash price" />
                    <button onClick={() => setSelectedProducts(prev => prev.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input placeholder="Product name" className="flex-1 h-9 px-2 rounded border border-border text-xs focus:outline-none focus:border-blue"
                    value={streamForm.productSearch} onChange={e => setStreamForm({ ...streamForm, productSearch: e.target.value })} />
                  <input placeholder="Flash price" className="w-20 h-9 px-2 rounded border border-border text-xs focus:outline-none focus:border-blue" id="flashPriceInput" />
                  <Button size="sm" variant="outline" onClick={() => {
                    const fp = (document.getElementById("flashPriceInput") as HTMLInputElement)?.value;
                    if (streamForm.productSearch && fp) {
                      setSelectedProducts(prev => [...prev, { product_name: streamForm.productSearch, price: parseInt(fp) || 0, flash_price: parseInt(fp) || 0, sold_qty: 0 }]);
                      setStreamForm({ ...streamForm, productSearch: "" });
                      if (document.getElementById("flashPriceInput")) (document.getElementById("flashPriceInput") as HTMLInputElement).value = "";
                    }
                  }}>Add</Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateStream} disabled={!streamForm.title || !streamForm.creator || !streamForm.scheduled_at}><Radio size={14} className="mr-1" /> Create Stream</Button>
              <Button variant="outline" onClick={() => { setShowCreate(false); setActiveTab("live"); }}>Cancel</Button>
            </div>
          </div>
        )}

        {activeTab !== "create" && (
          <div className="grid grid-cols-2 gap-4">
            {(streamsByStatus[activeTab as keyof typeof streamsByStatus] || []).map(renderStreamCard)}
            {(streamsByStatus[activeTab as keyof typeof streamsByStatus] || []).length === 0 && (
              <div className="col-span-2 bg-white rounded-xl border border-border p-12 text-center">
                <Radio size={48} className="text-text-4 mx-auto mb-4" />
                <h3 className="font-syne font-700 text-text-1 mb-1">No {activeTab} streams</h3>
                <p className="text-sm text-text-3 mb-4">There are no streams in this category.</p>
                {activeTab === "live" && <Button variant="default" size="sm" onClick={() => setActiveTab("scheduled")}>View Scheduled</Button>}
              </div>
            )}
          </div>
        )}

        {/* Stream Detail Modal */}
        {showDetail && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDetail(null)}>
            <div className="bg-white rounded-2xl w-full max-w-[560px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-syne font-bold text-lg truncate">{showDetail.title}</h2>
                <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><XCircle size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Creator</p><p className="text-sm text-text-1 mt-0.5">{showDetail.creator}</p></div>
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Status</p>
                    <span className={`text-xs font-medium ${showDetail.status === "live" ? "text-success" : showDetail.status === "scheduled" ? "text-warning" : "text-text-4"}`}>{showDetail.status.toUpperCase()}</span>
                  </div>
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Viewers</p><p className="text-sm font-semibold">{showDetail.viewer_count.toLocaleString()}</p></div>
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Peak</p><p className="text-sm font-semibold">{showDetail.peak_viewers.toLocaleString()}</p></div>
                  {showDetail.status === "ended" && <div><p className="text-[10px] text-text-4 uppercase font-semibold">Revenue</p><p className="text-sm font-semibold text-success">{showDetail.revenue}</p></div>}
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Scheduled</p><p className="text-sm text-text-2">{showDetail.scheduled_at}</p></div>
                </div>
                <p className="text-sm text-text-3 bg-off-white p-3 rounded-lg">{showDetail.description}</p>
                {showDetail.products.length > 0 && (
                  <div>
                    <p className="text-[10px] text-text-4 uppercase font-semibold mb-2">Products in Stream</p>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-off-white"><th className="p-2 text-left font-semibold text-text-4">Product</th><th className="p-2 text-center font-semibold text-text-4">Price</th><th className="p-2 text-center font-semibold text-text-4">Flash Price</th><th className="p-2 text-center font-semibold text-text-4">Sold</th></tr></thead>
                        <tbody>
                          {showDetail.products.map((p, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="p-2 text-text-1">{p.product_name}</td>
                              <td className="p-2 text-center text-text-3">₦{p.price.toLocaleString()}</td>
                              <td className="p-2 text-center text-success font-semibold">₦{p.flash_price.toLocaleString()}</td>
                              <td className="p-2 text-center text-text-2">{p.sold_qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
