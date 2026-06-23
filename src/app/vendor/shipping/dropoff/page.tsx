"use client";

import { useState } from "react";
import {
  ClipboardList, Printer, CheckCircle2, Clock, Package,
  Truck, MapPin, Download, Loader2, FileText, Search,
  ChevronDown, Eye, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface ReadyOrder {
  id: string;
  orderId: string;
  customer: string;
  destination: string;
  items: number;
  weight: string;
  sizeTier: string;
  carrier: string;
  waybill: string | null;
  status: "ready" | "manifested" | "received";
}

const demoOrders: ReadyOrder[] = [
  { id: "o1", orderId: "ORD-1001", customer: "John Doe", destination: "Lekki, Lagos", items: 3, weight: "2.5 kg", sizeTier: "Small", carrier: "DHL", waybill: null, status: "ready" },
  { id: "o2", orderId: "ORD-1002", customer: "Jane Smith", destination: "Wuse, Abuja", items: 1, weight: "0.8 kg", sizeTier: "Small", carrier: "FedEx", waybill: null, status: "ready" },
  { id: "o3", orderId: "ORD-1003", customer: "Bob Johnson", destination: "Ikeja, Lagos", items: 5, weight: "4.2 kg", sizeTier: "Medium", carrier: "Kauvex Logistics", waybill: null, status: "ready" },
  { id: "o4", orderId: "ORD-1004", customer: "Alice Brown", destination: "Port Harcourt, Rivers", items: 2, weight: "1.1 kg", sizeTier: "Small", carrier: "DHL", waybill: null, status: "ready" },
  { id: "o5", orderId: "ORD-1005", customer: "Charlie Wilson", destination: "Ibadan, Oyo", items: 8, weight: "6.7 kg", sizeTier: "Large", carrier: "FedEx", waybill: null, status: "ready" },
  { id: "o6", orderId: "ORD-1006", customer: "Diana Prince", destination: "Victoria Island, Lagos", items: 1, weight: "0.3 kg", sizeTier: "Small", carrier: "Kauvex Logistics", waybill: "KWX-789012", status: "manifested" },
  { id: "o7", orderId: "ORD-1007", customer: "Bruce Wayne", destination: "GRA, Enugu", items: 4, weight: "3.4 kg", sizeTier: "Medium", carrier: "DHL", waybill: "DHL-345678", status: "received" },
];

const sizeTierColors: Record<string, string> = {
  Small: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  Large: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  ready: "bg-gray-100 text-gray-600",
  manifested: "bg-green-100 text-green-700",
  received: "bg-blue-100 text-blue-700",
};

export default function DropoffManifestPage() {
  const [orders, setOrders] = useState<ReadyOrder[]>(demoOrders);
  const [generating, setGenerating] = useState(false);
  const [showManifest, setShowManifest] = useState(false);
  const [manifestDate, setManifestDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const readyOrders = orders.filter((o) => o.status === "ready");
  const manifestedOrders = orders.filter((o) => o.status === "manifested");
  const receivedOrders = orders.filter((o) => o.status === "received");

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
            ? { ...o, waybill: `${o.carrier === "DHL" ? "DHL" : o.carrier === "FedEx" ? "FDX" : "KWX"}-${Math.floor(100000 + Math.random() * 900000)}`, status: "manifested" as const }
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

  const totalWeight = orders.reduce((acc, o) => {
    const w = parseFloat(o.weight);
    return acc + (isNaN(w) ? 0 : w);
  }, 0);

  return (
    <VendorShell title="Drop-off Manifest" subtitle="Generate daily drop-off manifests for carrier handoff">
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
              <p className="text-xs text-gray-400">Ready to Ship</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
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
              <p className="text-2xl font-bold text-gray-900">{receivedOrders.length}</p>
              <p className="text-xs text-gray-400">Received by Carrier</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <MapPin size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalWeight.toFixed(1)}</p>
              <p className="text-xs text-gray-400">Total Weight (kg)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full h-9 pl-9 pr-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">{readyOrders.length} orders ready</div>
          <Button onClick={generateManifest} disabled={generating || readyOrders.length === 0}>
            {generating ? <Loader2 size={15} className="animate-spin mr-1.5" /> : <ClipboardList size={15} className="mr-1.5" />}
            {generating ? "Generating..." : "Generate Today's Manifest"}
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
              <Button variant="outline" size="sm" onClick={printManifest}>
                <Printer size={14} className="mr-1" /> Print
              </Button>
              <Button variant="outline" size="sm">
                <Download size={14} className="mr-1" /> Export
              </Button>
              <button onClick={() => setShowManifest(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Manifest Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 grid grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Total Orders:</span>
              <span className="font-bold text-gray-800 ml-1">{manifestedOrders.length + (orders.filter(o => o.status === "ready" && !search).length)}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Items:</span>
              <span className="font-bold text-gray-800 ml-1">{manifestedOrders.reduce((a, o) => a + o.items, 0)}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Weight:</span>
              <span className="font-bold text-gray-800 ml-1">{totalWeight.toFixed(1)} kg</span>
            </div>
            <div>
              <span className="text-gray-400">Carriers:</span>
              <span className="font-bold text-gray-800 ml-1">{new Set(orders.map((o) => o.carrier)).size}</span>
            </div>
          </div>

          {/* Manifest Table (printable) */}
          <div className="overflow-x-auto printable-manifest">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Waybill</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Order</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Customer</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Destination</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Items</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Weight</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Tier</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Carrier</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter((o) => o.status !== "ready").map((o) => (
                  <tr key={o.id} className="border-b border-gray-100">
                    <td className="py-2 px-2 font-mono font-medium text-gray-800">{o.waybill}</td>
                    <td className="py-2 px-2 text-gray-800">{o.orderId}</td>
                    <td className="py-2 px-2 text-gray-800">{o.customer}</td>
                    <td className="py-2 px-2 text-gray-600">{o.destination}</td>
                    <td className="py-2 px-2 text-gray-800">{o.items}</td>
                    <td className="py-2 px-2 text-gray-800">{o.weight}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sizeTierColors[o.sizeTier] || "bg-gray-100 text-gray-600"}`}>
                        {o.sizeTier}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-800">{o.carrier}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[o.status]}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">All Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Order</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Destination</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Items</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Weight</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Carrier</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Waybill</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-xs text-gray-400">No orders found.</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-800">{o.orderId}</td>
                    <td className="py-3 px-4 text-gray-800">{o.customer}</td>
                    <td className="py-3 px-4 text-gray-600">{o.destination}</td>
                    <td className="py-3 px-4 text-gray-800">{o.items}</td>
                    <td className="py-3 px-4 text-gray-800">{o.weight}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${sizeTierColors[o.sizeTier] || "bg-gray-100 text-gray-600"}`}>
                        {o.sizeTier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{o.carrier}</td>
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {o.waybill || <span className="text-gray-300 italic">pending</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">{filtered.length} order(s)</span>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="inline-block w-2 h-2 rounded-full bg-green-100 border border-green-300" /> Manifested
            <span className="inline-block w-2 h-2 rounded-full bg-blue-100 border border-blue-300 ml-2" /> Received
            <span className="inline-block w-2 h-2 rounded-full bg-gray-100 border border-gray-300 ml-2" /> Ready
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .printable-manifest { display: block !important; }
          body * { visibility: hidden; }
          .printable-manifest, .printable-manifest * { visibility: visible; }
          .printable-manifest { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </VendorShell>
  );
}
