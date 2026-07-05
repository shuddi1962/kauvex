"use client";

import { useState, useEffect } from "react";
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
];

interface Stream {
  id: string;
  title: string;
  description: string | null;
  creator?: string;
  status: string;
  viewerCount: number;
  peakViewers: number;
  scheduledAt: string | null;
  endedAt: string | null;
  totalRevenue: number;
  totalOrders: number;
  products: { id: string; productName: string | null; price: number; flashPrice: number; sold: number }[];
}

export default function AdminLiveShoppingPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [showDetail, setShowDetail] = useState<Stream | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [streamForm, setStreamForm] = useState({ title: "", description: "", creator: "", scheduled_at: "" });
  const [selectedProducts, setSelectedProducts] = useState<{ productName: string; flashPrice: number }[]>([]);
  const [productName, setProductName] = useState("");
  const [flashPrice, setFlashPrice] = useState("");

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await fetch("/api/v1/live?filter=all");
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

  const handleCreateStream = async () => {
    if (!streamForm.title || !streamForm.creator || !streamForm.scheduled_at) return;
    try {
      const res = await fetch("/api/v1/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          creatorId: "admin",
          vendorId: streamForm.creator,
          title: streamForm.title,
          description: streamForm.description,
          scheduledAt: streamForm.scheduled_at,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setStreamForm({ title: "", description: "", creator: "", scheduled_at: "" });
        setSelectedProducts([]);
        fetchStreams();
      }
    } catch (e) {
      console.error("Failed to create stream", e);
    }
  };

  const liveStreams = streams.filter(s => s.status === "live");
  const scheduledStreams = streams.filter(s => s.status === "scheduled");
  const endedStreams = streams.filter(s => s.status === "ended");

  const totalViewers = streams.filter(s => s.status !== "scheduled").reduce((sum, s) => sum + (s.viewerCount || 0), 0);
  const totalRevenue = endedStreams.reduce((sum, s) => sum + Number(s.totalRevenue || 0), 0);

  const streamsByStatus = { live: liveStreams, scheduled: scheduledStreams, ended: endedStreams };

  const renderStreamCard = (stream: Stream) => (
    <div key={stream.id} onClick={() => setShowDetail(stream)} className={`bg-white rounded-xl border overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${stream.status === "live" ? "border-green-400 ring-1 ring-green-200" : "border-border"}`}>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-1 truncate">{stream.title}</h3>
          </div>
          {stream.status === "live" && (
            <span className="flex items-center gap-1 bg-green-50 text-success text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 bg-success rounded-full inline-block" /> LIVE
            </span>
          )}
          {stream.status === "scheduled" && <span className="text-[10px] bg-yellow-50 text-warning px-2 py-0.5 rounded-full font-medium">Scheduled</span>}
          {stream.status === "ended" && <span className="text-[10px] bg-gray-100 text-text-4 px-2 py-0.5 rounded-full font-medium">Ended</span>}
        </div>
        {stream.description && <p className="text-xs text-text-3 line-clamp-2">{stream.description}</p>}
        <div className="flex items-center gap-3 text-xs text-text-3">
          <span className="flex items-center gap-1"><Users size={12} /> {(stream.viewerCount || 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><Radio size={12} /> Peak {(stream.peakViewers || 0).toLocaleString()}</span>
          {stream.status === "ended" && <span className="flex items-center gap-1 text-success"><DollarSign size={12} /> ₦{Number(stream.totalRevenue).toLocaleString()}</span>}
        </div>
        {stream.status === "scheduled" && stream.scheduledAt && (
          <div className="text-xs text-text-4 flex items-center gap-1"><Calendar size={12} /> {new Date(stream.scheduledAt).toLocaleString()}</div>
        )}
        {stream.products?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {stream.products.slice(0, 3).map((p, i) => (
              <span key={i} className="text-[10px] bg-off-white text-text-3 px-1.5 py-0.5 rounded">{p.productName}</span>
            ))}
            {stream.products.length > 3 && <span className="text-[10px] text-text-4">+{stream.products.length - 3}</span>}
          </div>
        )}
      </div>
    </div>
  );

  const handleAddProduct = () => {
    if (!productName || !flashPrice) return;
    setSelectedProducts(prev => [...prev, { productName, flashPrice: Number(flashPrice) }]);
    setProductName("");
    setFlashPrice("");
  };

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
            <p className="font-syne font-700 text-2xl text-success">₦{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-text-3 mt-1">Total Revenue</p>
          </div>
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

        {showCreate && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-2xl space-y-4 mb-6">
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
                <label className="text-xs font-semibold text-text-2 mb-1 block">Creator/Vendor</label>
                <input value={streamForm.creator} onChange={e => setStreamForm({ ...streamForm, creator: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm" placeholder="Vendor ID" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Scheduled Date/Time</label>
                <input type="datetime-local" value={streamForm.scheduled_at} onChange={e => setStreamForm({ ...streamForm, scheduled_at: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 mb-1 block">Add Products (with Flash Prices)</label>
              <div className="border border-border rounded-lg p-3 space-y-2">
                {selectedProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <input value={p.productName} readOnly className="flex-1 h-9 px-2 rounded border border-border text-xs bg-gray-50" />
                    <input value={p.flashPrice} readOnly className="w-24 h-9 px-2 rounded border border-border text-xs bg-gray-50" />
                    <button onClick={() => setSelectedProducts(prev => prev.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input placeholder="Product name" value={productName} onChange={e => setProductName(e.target.value)} className="flex-1 h-9 px-2 rounded border border-border text-xs focus:outline-none focus:border-blue" />
                  <input placeholder="Flash price" value={flashPrice} onChange={e => setFlashPrice(e.target.value)} type="number" className="w-20 h-9 px-2 rounded border border-border text-xs focus:outline-none focus:border-blue" />
                  <Button size="sm" variant="outline" onClick={handleAddProduct}>Add</Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateStream} disabled={!streamForm.title || !streamForm.creator || !streamForm.scheduled_at}><Radio size={14} className="mr-1" /> Create Stream</Button>
              <Button variant="outline" onClick={() => { setShowCreate(false); setActiveTab("live"); }}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-text-3">Loading streams...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {(activeTab !== "create" ? (streamsByStatus[activeTab as keyof typeof streamsByStatus] || []) : []).map(renderStreamCard)}
            {activeTab !== "create" && (streamsByStatus[activeTab as keyof typeof streamsByStatus] || []).length === 0 && (
              <div className="col-span-2 bg-white rounded-xl border border-border p-12 text-center">
                <Radio size={48} className="text-text-4 mx-auto mb-4" />
                <h3 className="font-syne font-700 text-text-1 mb-1">No {activeTab} streams</h3>
                <p className="text-sm text-text-3 mb-4">There are no streams in this category.</p>
              </div>
            )}
          </div>
        )}

        {showDetail && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDetail(null)}>
            <div className="bg-white rounded-2xl w-full max-w-[560px]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-syne font-bold text-lg truncate">{showDetail.title}</h2>
                <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><XCircle size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Status</p>
                    <span className={`text-xs font-medium ${showDetail.status === "live" ? "text-success" : showDetail.status === "scheduled" ? "text-warning" : "text-text-4"}`}>{showDetail.status.toUpperCase()}</span>
                  </div>
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Viewers</p><p className="text-sm font-semibold">{(showDetail.viewerCount || 0).toLocaleString()}</p></div>
                  <div><p className="text-[10px] text-text-4 uppercase font-semibold">Peak</p><p className="text-sm font-semibold">{(showDetail.peakViewers || 0).toLocaleString()}</p></div>
                  {showDetail.status === "ended" && <div><p className="text-[10px] text-text-4 uppercase font-semibold">Revenue</p><p className="text-sm font-semibold text-success">₦{Number(showDetail.totalRevenue).toLocaleString()}</p></div>}
                  {showDetail.scheduledAt && <div><p className="text-[10px] text-text-4 uppercase font-semibold">Scheduled</p><p className="text-sm text-text-2">{new Date(showDetail.scheduledAt).toLocaleString()}</p></div>}
                </div>
                {showDetail.description && <p className="text-sm text-text-3 bg-off-white p-3 rounded-lg">{showDetail.description}</p>}
                {showDetail.products && showDetail.products.length > 0 && (
                  <div>
                    <p className="text-[10px] text-text-4 uppercase font-semibold mb-2">Products in Stream</p>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-off-white"><th className="p-2 text-left font-semibold text-text-4">Product</th><th className="p-2 text-center font-semibold text-text-4">Flash Price</th><th className="p-2 text-center font-semibold text-text-4">Sold</th></tr></thead>
                        <tbody>
                          {showDetail.products.map((p, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="p-2 text-text-1">{p.productName}</td>
                              <td className="p-2 text-center text-success font-semibold">₦{Number(p.flashPrice || p.price).toLocaleString()}</td>
                              <td className="p-2 text-center text-text-2">{p.sold || 0}</td>
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
