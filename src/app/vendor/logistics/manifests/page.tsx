"use client";

import { useState } from "react";
import {
  ClipboardList, Printer, Download, CheckCircle2, Clock,
  Package, Truck, MapPin, Loader2, FileText, Search,
  ChevronDown, Eye, X, ArrowRight, Home, CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface ManifestOrder {
  id: string;
  orderId: string;
  customer: string;
  destination: string;
  items: number;
  weight: string;
  sizeTier: string;
  carrier: string;
  waybill: string | null;
  status: "ready" | "manifested" | "dropped_off";
}

interface Hub {
  id: string;
  name: string;
  address: string;
  distance: string;
  operatingHours: string;
  acceptsToday: boolean;
}

const demoOrders: ManifestOrder[] = [
  { id: "o1", orderId: "ORD-2024-3841", customer: "John Doe", destination: "Lekki, Lagos", items: 3, weight: "2.5 kg", sizeTier: "Small", carrier: "Kauvex Logistics", waybill: null, status: "ready" },
  { id: "o2", orderId: "ORD-2024-3840", customer: "Sarah Mitchell", destination: "Wuse, Abuja", items: 1, weight: "0.8 kg", sizeTier: "Small", carrier: "DHL", waybill: null, status: "ready" },
  { id: "o3", orderId: "ORD-2024-3839", customer: "TechCorp Ltd", destination: "Ikeja, Lagos", items: 5, weight: "4.2 kg", sizeTier: "Medium", carrier: "FedEx", waybill: null, status: "ready" },
  { id: "o4", orderId: "ORD-2024-3838", customer: "MarinePro Nigeria", destination: "PHC, Rivers", items: 2, weight: "1.1 kg", sizeTier: "Small", carrier: "DHL", waybill: null, status: "ready" },
  { id: "o5", orderId: "ORD-2024-3837", customer: "Alice Brown", destination: "Ibadan, Oyo", items: 8, weight: "6.7 kg", sizeTier: "Large", carrier: "FedEx", waybill: null, status: "ready" },
  { id: "o6", orderId: "ORD-2024-3836", customer: "Chief Emeka Okafor", destination: "Enugu", items: 4, weight: "3.4 kg", sizeTier: "Medium", carrier: "Kauvex Logistics", waybill: "KWX-789012", status: "manifested" },
  { id: "o7", orderId: "ORD-2024-3835", customer: "Fatima Bello", destination: "Kano", items: 2, weight: "1.8 kg", sizeTier: "Small", carrier: "DHL", waybill: "DHL-345678", status: "dropped_off" },
  { id: "o8", orderId: "ORD-2024-3834", customer: "David Ukah", destination: "Ibadan, Oyo", items: 1, weight: "0.6 kg", sizeTier: "Small", carrier: "Kauvex Logistics", waybill: "KWX-789013", status: "manifested" },
];

const nearestHubs: Hub[] = [
  { id: "h1", name: "Lagos Island Hub", address: "42 Marina Road, Lagos Island", distance: "2.3 km", operatingHours: "06:00 - 20:00", acceptsToday: true },
  { id: "h2", name: "Ikeja Central Hub", address: "15 Awolowo Way, Ikeja", distance: "8.7 km", operatingHours: "06:00 - 18:00", acceptsToday: true },
  { id: "h3", name: "Victoria Island Depot", address: "7 Adeola Odeku Street, VI", distance: "4.1 km", operatingHours: "08:00 - 17:00", acceptsToday: false },
];

const manifestHistory = [
  { id: "mh1", date: "Jun 24, 2026", orders: 11, weight: "18.2 kg", status: "received", hub: "Lagos Island Hub", droppedBy: "08:45 AM" },
  { id: "mh2", date: "Jun 23, 2026", orders: 9, weight: "12.7 kg", status: "received", hub: "Ikeja Hub", droppedBy: "09:30 AM" },
  { id: "mh3", date: "Jun 22, 2026", orders: 14, weight: "21.3 kg", status: "received", hub: "Lagos Island Hub", droppedBy: "08:15 AM" },
  { id: "mh4", date: "Jun 21, 2026", orders: 7, weight: "9.8 kg", status: "received", hub: "Victoria Island Depot", droppedBy: "10:00 AM" },
  { id: "mh5", date: "Jun 20, 2026", orders: 12, weight: "16.5 kg", status: "received", hub: "Lagos Island Hub", droppedBy: "08:30 AM" },
];

const sizeTierColors: Record<string, string> = {
  Small: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  Large: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  ready: "bg-gray-100 text-gray-600",
  manifested: "bg-green-100 text-green-700",
  dropped_off: "bg-blue-100 text-blue-700",
};

export default function VendorLogisticsManifestsPage() {
  const [orders, setOrders] = useState<ManifestOrder[]>(demoOrders);
  const [generating, setGenerating] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [manifestDate, setManifestDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const [selectedHub, setSelectedHub] = useState("Lagos Island Hub");
  const [activeSection, setActiveSection] = useState<"manifest" | "history" | "hubs">("manifest");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const readyOrders = orders.filter((o) => o.status === "ready");
  const manifestedOrders = orders.filter((o) => o.status === "manifested");
  const droppedOffOrders = orders.filter((o) => o.status === "dropped_off");

  const filtered = orders.filter((o) =>
    o.orderId.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.destination.toLowerCase().includes(search.toLowerCase())
  );

  const generateManifest = () => {
    setGenerating(true);
    setTimeout(() => {
      const now = new Date();
      setManifestDate(now.toISOString().split("T")[0]);
      setOrders((prev) =>
        prev.map((o) =>
          o.status === "ready"
            ? {
                ...o,
                waybill: `${o.carrier === "DHL" ? "DHL" : o.carrier === "FedEx" ? "FDX" : "KWX"}-${Math.floor(100000 + Math.random() * 900000)}`,
                status: "manifested" as const,
              }
            : o
        )
      );
      setGenerating(false);
      setShowManifest(true);
      showToast(`Manifest generated — ${readyOrders.length} orders manifested`, "success");
    }, 1500);
  };

  const printManifest = () => {
    window.print();
  };

  const markDroppedOff = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "dropped_off" as const } : o))
    );
    showToast("Order marked as dropped off", "success");
  };

  const markAllDroppedOff = () => {
    setOrders((prev) =>
      prev.map((o) => (o.status === "manifested" ? { ...o, status: "dropped_off" as const } : o))
    );
    showToast("All manifested orders marked as dropped off", "success");
  };

  const totalWeight = filtered.reduce((acc, o) => {
    const w = parseFloat(o.weight);
    return acc + (isNaN(w) ? 0 : w);
  }, 0);

  return (
    <VendorShell title="Manifests" subtitle="Generate, print, and manage daily drop-off manifests">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{readyOrders.length}</p>
              <p className="text-xs text-gray-400">Ready to Manifest</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardList size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{manifestedOrders.length}</p>
              <p className="text-xs text-gray-400">Manifested</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{droppedOffOrders.length}</p>
              <p className="text-xs text-gray-400">Dropped Off</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWeight.toFixed(1)} kg</p>
              <p className="text-xs text-gray-400">Total Weight</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1">
        {[
          { key: "manifest", label: "Today's Manifest", icon: ClipboardList },
          { key: "history", label: "Manifest History", icon: Clock },
          { key: "hubs", label: "Nearest Hubs", icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as typeof activeSection)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive ? "bg-purple-100 text-purple-700 shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Section: Today's Manifest */}
      {activeSection === "manifest" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="w-full h-9 pl-9 pr-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{readyOrders.length} orders ready</span>
              <Button onClick={generateManifest} disabled={generating || readyOrders.length === 0}>
                {generating ? <Loader2 size={15} className="animate-spin mr-1.5" /> : <ClipboardList size={15} className="mr-1.5" />}
                {generating ? "Generating..." : "Generate Manifest"}
              </Button>
            </div>
          </div>

          {/* Manifest View */}
          {showManifest && (
            <div className="bg-white rounded-xl border-2 border-purple-200 p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Drop-off Manifest</h3>
                    <p className="text-xs text-gray-400">Date: {new Date(manifestDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={selectedHub} onChange={(e) => setSelectedHub(e.target.value)} className="h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none">
                    {nearestHubs.filter((h) => h.acceptsToday).map((h) => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={printManifest}>
                    <Printer size={14} className="mr-1" /> Print
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={14} className="mr-1" /> PDF
                  </Button>
                  <button onClick={() => setShowManifest(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-purple-50 text-gray-500 uppercase text-[10px]">
                      <th className="text-left px-3 py-2 font-semibold">#</th>
                      <th className="text-left px-3 py-2 font-semibold">Order ID</th>
                      <th className="text-left px-3 py-2 font-semibold">Customer</th>
                      <th className="text-left px-3 py-2 font-semibold">Destination</th>
                      <th className="text-left px-3 py-2 font-semibold">Items</th>
                      <th className="text-left px-3 py-2 font-semibold">Weight</th>
                      <th className="text-left px-3 py-2 font-semibold">Size</th>
                      <th className="text-left px-3 py-2 font-semibold">Waybill</th>
                      <th className="text-right px-3 py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o, i) => (
                      <tr key={o.id} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">{o.orderId}</td>
                        <td className="px-3 py-2 text-gray-600">{o.customer}</td>
                        <td className="px-3 py-2 text-gray-600">{o.destination}</td>
                        <td className="px-3 py-2 text-gray-600">{o.items}</td>
                        <td className="px-3 py-2 text-gray-600">{o.weight}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sizeTierColors[o.sizeTier]}`}>{o.sizeTier}</span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[10px] text-gray-500">{o.waybill || "—"}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[o.status]}`}>
                              {o.status === "dropped_off" ? "Dropped" : o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                            {o.status === "manifested" && (
                              <button
                                onClick={() => markDroppedOff(o.id)}
                                className="p-1 hover:bg-blue-50 rounded text-blue-600"
                                title="Mark as dropped off"
                              >
                                <CheckSquare size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {manifestedOrders.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={markAllDroppedOff}>
                    <CheckCircle2 size={14} className="mr-1" /> Mark All as Dropped Off
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Orders Table */}
          {!showManifest && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px]">
                      <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                      <th className="text-left px-4 py-3 font-semibold">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold">Destination</th>
                      <th className="text-left px-4 py-3 font-semibold">Items</th>
                      <th className="text-left px-4 py-3 font-semibold">Weight</th>
                      <th className="text-left px-4 py-3 font-semibold">Size</th>
                      <th className="text-left px-4 py-3 font-semibold">Carrier</th>
                      <th className="text-left px-4 py-3 font-semibold">Waybill</th>
                      <th className="text-right px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{o.orderId}</td>
                        <td className="px-4 py-3 text-gray-600">{o.customer}</td>
                        <td className="px-4 py-3 text-gray-600">{o.destination}</td>
                        <td className="px-4 py-3 text-gray-600">{o.items}</td>
                        <td className="px-4 py-3 text-gray-600">{o.weight}</td>
                        <td className="px-4 py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sizeTierColors[o.sizeTier]}`}>{o.sizeTier}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{o.carrier}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-gray-500">{o.waybill || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[o.status]}`}>
                            {o.status === "dropped_off" ? "Dropped Off" : o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Section: Manifest History */}
      {activeSection === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Orders</th>
                  <th className="text-left px-4 py-3 font-semibold">Weight</th>
                  <th className="text-left px-4 py-3 font-semibold">Hub</th>
                  <th className="text-left px-4 py-3 font-semibold">Dropped By</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {manifestHistory.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.date}</td>
                    <td className="px-4 py-3 text-gray-600">{m.orders}</td>
                    <td className="px-4 py-3 text-gray-600">{m.weight}</td>
                    <td className="px-4 py-3 text-gray-600">{m.hub}</td>
                    <td className="px-4 py-3 text-gray-600">{m.droppedBy}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700">Received</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section: Nearest Hubs */}
      {activeSection === "hubs" && (
        <div className="grid grid-cols-3 gap-4">
          {nearestHubs.map((hub) => (
            <div key={hub.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin size={18} className="text-purple-600" />
                </div>
                {hub.acceptsToday ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">Open Today</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600">Closed</span>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{hub.name}</h3>
              <p className="text-xs text-gray-500 mb-1">{hub.address}</p>
              <p className="text-xs text-gray-400">{hub.distance} away</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Hours</span>
                  <span className="text-gray-900 font-medium">{hub.operatingHours}</span>
                </div>
              </div>
              {hub.acceptsToday && (
                <Button size="sm" className="w-full mt-3" variant="outline">
                  <MapPin size={12} className="mr-1" /> Get Directions
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </VendorShell>
  );
}
