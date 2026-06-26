"use client";

import { useState } from "react";
import { Grid, List, Map, Filter, Search, ChevronRight, Truck, Package, Clock, CheckCircle2, AlertCircle, MapPin, X, ExternalLink } from "lucide-react";

const SHIPMENTS = [
  { id: "KVX-7842", from: "15 Admiralty Way, Lekki", to: "22 Wuse Zone 5, Abuja", status: "transit", carrier: "GIG Logistics", driver: "Tunde Adewale", vehicle: "Toyota Hiace (ABC-123XY)", eta: "Today 4:30 PM", progress: 72, weight: "5.2 kg", service: "Express", created: "Jun 26, 8:15 AM", updates: [{ time: "3:45 PM", msg: "Departed Ibadan hub" }, { time: "1:20 PM", msg: "Arrived Ibadan hub" }, { time: "9:00 AM", msg: "Picked up from sender" }] },
  { id: "KVX-7841", from: "42 Marina, Lagos Island", to: "12 Kano Road, Kano", status: "transit", carrier: "FedEx", driver: "Emeka Nwosu", vehicle: "Ford Transit (ABJ-456CD)", eta: "Tomorrow 10:00 AM", progress: 45, weight: "2.1 kg", service: "Standard", created: "Jun 25, 2:30 PM", updates: [{ time: "10:00 AM", msg: "In transit from Abuja" }, { time: "6:00 PM", msg: "Arrived Abuja hub" }] },
  { id: "KVX-7840", from: "Block C, Amuwo Odofin", to: "Johannesburg, SA", status: "delivered", carrier: "DHL International", driver: "Completed", vehicle: "Air Freight", eta: "Delivered", progress: 100, weight: "8.0 kg", service: "Express International", created: "Jun 20, 11:00 AM", updates: [{ time: "Jun 24, 2:00 PM", msg: "Delivered to recipient" }, { time: "Jun 24, 8:00 AM", msg: "Out for delivery" }] },
  { id: "KVX-7839", from: "15 Admiralty Way, Lekki", to: "8 Cantonments, Accra", status: "delivered", carrier: "DHL Express", driver: "Completed", vehicle: "Van", eta: "Delivered", progress: 100, weight: "3.5 kg", service: "Express", created: "Jun 21, 9:00 AM", updates: [{ time: "Jun 23, 11:30 AM", msg: "Delivered" }, { time: "Jun 23, 7:00 AM", msg: "Customs cleared" }] },
  { id: "KVX-7838", from: "8 Allen Avenue, Ikeja", to: "Nairobi, Kenya", status: "transit", carrier: "Aramex", driver: "Via Air", vehicle: "Air Freight", eta: "Jun 28", progress: 30, weight: "12.0 kg", service: "Express International", created: "Jun 22, 3:00 PM", updates: [{ time: "Jun 25, 6:00 PM", msg: "Departed Lagos airport" }] },
  { id: "KVX-7844", from: "PH Warehouse", to: "Calabar Market", status: "exception", carrier: "GIG Logistics", driver: "Kemi Okafor", vehicle: "Truck", eta: "Delayed", progress: 55, weight: "15.0 kg", service: "Standard", created: "Jun 24, 10:00 AM", updates: [{ time: "Jun 26, 8:00 AM", msg: "Traffic delay on route" }, { time: "Jun 25, 4:00 PM", msg: "Departed PH hub" }] },
  { id: "KVX-7845", from: "Lekki Plaza", to: "14 Bode Thomas, Surulere", status: "out", carrier: "Kwik Delivery", driver: "Bola Mohammed", vehicle: "Bike", eta: "15 min", progress: 90, weight: "0.8 kg", service: "Express", created: "Jun 26, 2:00 PM", updates: [{ time: "3:15 PM", msg: "Out for delivery" }, { time: "3:00 PM", msg: "Arrived local hub" }] },
  { id: "KVX-7843", from: "42 Marina", to: "8 Allen Avenue, Ikeja", status: "pickup", carrier: "Kwik Delivery", driver: "Awaiting pickup", vehicle: "-", eta: "30 min", progress: 10, weight: "1.5 kg", service: "Express", created: "Jun 26, 3:00 PM", updates: [{ time: "3:05 PM", msg: "Driver assigned" }] },
  { id: "KVX-7846", from: "Ikeja Mall", to: "Surulere Stadium", status: "transit", carrier: "Local Partner", driver: "Chidi Eze", vehicle: "Tricycle", eta: "1 hr", progress: 35, weight: "3.0 kg", service: "Economy", created: "Jun 26, 1:30 PM", updates: [{ time: "3:00 PM", msg: "Picked up" }] },
  { id: "KVX-7847", from: "Wuse Market, Abuja", to: "15 Admiralty Way, Lekki", status: "pickup", carrier: "FedEx", driver: "Pending", vehicle: "-", eta: "1 hr", progress: 5, weight: "4.0 kg", service: "Standard", created: "Jun 26, 3:15 PM", updates: [] },
  { id: "KVX-7848", from: "V.I. Office", to: "Lekki Phase 2", status: "delivered", carrier: "Local Partner", driver: "Completed", vehicle: "Bike", eta: "Delivered", progress: 100, weight: "0.5 kg", service: "Express", created: "Jun 26, 9:00 AM", updates: [{ time: "10:15 AM", msg: "Delivered" }] },
  { id: "KVX-7849", from: "Lekki Warehouse", to: "Ajah Market", status: "transit", carrier: "Kwik Delivery", driver: "Sola Adeyemi", vehicle: "Tricycle", eta: "45 min", progress: 60, weight: "7.5 kg", service: "Standard", created: "Jun 26, 2:45 PM", updates: [{ time: "3:10 PM", msg: "In transit" }] },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  transit: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  pickup: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  exception: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  out: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
};

const STATUS_LABELS: Record<string, string> = {
  transit: "In Transit",
  delivered: "Delivered",
  pickup: "Pending Pickup",
  exception: "Exception",
  out: "Out for Delivery",
};

export default function FleetTrackingPage() {
  const [view, setView] = useState<"grid" | "list" | "map">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = SHIPMENTS.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const detail = SHIPMENTS.find((s) => s.id === selected);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Fleet Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all shipments in one view.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by tracking number..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "transit", "delivered", "pickup", "exception", "out"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {s === "all" ? "All" : STATUS_LABELS[s]} {s === "all" ? SHIPMENTS.length : SHIPMENTS.filter((x) => x.status === s).length}
            </button>
          ))}
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
          {[
            { id: "grid" as const, icon: Grid },
            { id: "list" as const, icon: List },
            { id: "map" as const, icon: Map },
          ].map((v) => (
            <button key={v.id} onClick={() => setView(v.id)} className={`p-2 rounded-md transition-colors ${view === v.id ? "bg-white shadow text-[#0A1628]" : "text-gray-400 hover:text-gray-600"}`}><v.icon className="w-4 h-4" /></button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        {/* Cards */}
        <div className="flex-1">
          {view === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((s) => {
                const sc = STATUS_COLORS[s.status];
                return (
                  <button key={s.id} onClick={() => setSelected(s.id)} className={`text-left bg-white rounded-xl border p-4 hover:shadow-md transition-all ${selected === s.id ? "border-[#FF6B00] ring-1 ring-[#FF6B00]/30" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-[#0A1628]">{s.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>{STATUS_LABELS[s.status]}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.from.split(",")[0]} → {s.to.split(",")[0]}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2"><div className={`h-full rounded-full ${sc.dot}`} style={{ width: `${s.progress}%` }} /></div>
                    <div className="flex justify-between text-[11px] text-gray-500"><span>{s.carrier}</span><span>{s.eta}</span></div>
                  </button>
                );
              })}
            </div>
          )}
          {view === "list" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Tracking #</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Route</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Carrier</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">ETA</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Progress</th>
                </tr></thead>
                <tbody>
                  {filtered.map((s) => {
                    const sc = STATUS_COLORS[s.status];
                    return (
                      <tr key={s.id} onClick={() => setSelected(s.id)} className={`border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${selected === s.id ? "bg-orange-50" : ""}`}>
                        <td className="py-3 px-4 font-mono font-bold text-[#0A1628]">{s.id}</td>
                        <td className="py-3 px-4 text-gray-600">{s.from.split(",")[0]} → {s.to.split(",")[0]}</td>
                        <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>{STATUS_LABELS[s.status]}</span></td>
                        <td className="py-3 px-4 text-gray-600">{s.carrier}</td>
                        <td className="py-3 px-4 text-gray-600">{s.eta}</td>
                        <td className="py-3 px-4 w-32"><div className="bg-gray-200 rounded-full h-1.5"><div className={`h-full rounded-full ${sc.dot}`} style={{ width: `${s.progress}%` }} /></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {view === "map" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-[500px] relative">
              <div className="absolute inset-0 bg-[#0A1628]">
                <svg viewBox="0 0 800 500" className="w-full h-full">
                  {filtered.map((s, i) => {
                    const positions = [[120, 300], [300, 150], [500, 100], [650, 80], [400, 350], [200, 200], [350, 280], [550, 250], [150, 150], [450, 180], [280, 380], [600, 320]];
                    const [cx, cy] = positions[i % positions.length];
                    return (
                      <g key={s.id}>
                        <circle cx={cx} cy={cy} r="10" fill={STATUS_COLORS[s.status].dot.replace("bg-", "")} opacity="0.3">
                          <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={cx} cy={cy} r="5" fill={STATUS_COLORS[s.status].dot.replace("bg-", "")} stroke="white" strokeWidth="1.5" />
                        <text x={cx} y={cy - 12} textAnchor="middle" fill="white" fontSize="8" opacity="0.7">{s.id}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {detail && (
          <div className="w-80 bg-white rounded-xl border border-gray-200 p-5 space-y-4 shrink-0 hidden lg:block">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-[#0A1628]">{detail.id}</span>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[detail.status].bg} ${STATUS_COLORS[detail.status].text}`}>{STATUS_LABELS[detail.status]}</span>
              <span className="text-xs text-gray-500">{detail.service}</span>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-2 mb-2"><MapPin className="w-3.5 h-3.5 text-[#FF6B00] mt-0.5 shrink-0" /><div><p className="text-[11px] text-gray-500">From</p><p className="text-xs font-medium text-[#0A1628]">{detail.from}</p></div></div>
                <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" /><div><p className="text-[11px] text-gray-500">To</p><p className="text-xs font-medium text-[#0A1628]">{detail.to}</p></div></div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"><div className={`h-full rounded-full ${STATUS_COLORS[detail.status].dot}`} style={{ width: `${detail.progress}%` }} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2"><p className="text-[10px] text-gray-500">Carrier</p><p className="text-xs font-medium text-[#0A1628]">{detail.carrier}</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="text-[10px] text-gray-500">ETA</p><p className="text-xs font-medium text-[#0A1628]">{detail.eta}</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="text-[10px] text-gray-500">Driver</p><p className="text-xs font-medium text-[#0A1628]">{detail.driver}</p></div>
                <div className="bg-gray-50 rounded-lg p-2"><p className="text-[10px] text-gray-500">Weight</p><p className="text-xs font-medium text-[#0A1628]">{detail.weight}</p></div>
              </div>
            </div>
            {detail.updates.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#0A1628] mb-2">Tracking Updates</h4>
                <div className="space-y-2">
                  {detail.updates.map((u, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-gray-500">{u.time}</p>
                        <p className="text-xs text-[#0A1628]">{u.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
