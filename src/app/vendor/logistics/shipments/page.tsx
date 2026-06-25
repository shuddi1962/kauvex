"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package, Truck, MapPin, CheckCircle2, XCircle, RefreshCw,
  Clock, Eye, Phone, AlertTriangle, RotateCcw, Search,
  ChevronDown, Filter, MessageSquare, ArrowLeft, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface Shipment {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  phone: string;
  destination: string;
  zone: string;
  carrier: string;
  tier: string;
  status: string;
  lastUpdate: string;
  eta: string;
  items: number;
  value: string;
  storefront: string;
}

const allStorefronts = ["kauvex.com", "kauvex.com/uk", "kauvex.com/ca", "kauvex.com/ng"];
const allCarriers = ["Kauvex Logistics", "DHL", "FedEx", "Aramex", "GIG Logistics", "Kwik"];
const allDestinations = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano", "Ogun"];

const statusStages = [
  { key: "Packed", icon: Package, color: "text-gray-500" },
  { key: "Picked Up", icon: Truck, color: "text-blue-600" },
  { key: "In Transit", icon: Truck, color: "text-amber-600" },
  { key: "Out for Delivery", icon: MapPin, color: "text-purple-600" },
  { key: "Delivered", icon: CheckCircle2, color: "text-green-600" },
  { key: "Failed", icon: XCircle, color: "text-red-600" },
  { key: "Returned", icon: RefreshCw, color: "text-orange-600" },
];

const statusStyles: Record<string, string> = {
  Packed: "bg-gray-100 text-gray-600",
  "Picked Up": "bg-blue-100 text-blue-700",
  "In Transit": "bg-amber-100 text-amber-700",
  "Out for Delivery": "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-600",
  Returned: "bg-orange-100 text-orange-700",
};

const demoData: Shipment[] = [
  { id: "s1", orderId: "ORD-2024-3841", customer: "John Doe", email: "john@email.com", phone: "+234 801 234 5678", destination: "Lekki Phase 1, Lagos", zone: "Lagos Island", carrier: "Kauvex Logistics", tier: "Tier 1", status: "In Transit", lastUpdate: "2h ago", eta: "Today 4PM", items: 3, value: "₦234,500", storefront: "kauvex.com" },
  { id: "s2", orderId: "ORD-2024-3840", customer: "Sarah Mitchell", email: "sarah@email.com", phone: "+234 802 345 6789", destination: "Wuse Zone 4, Abuja", zone: "FCT", carrier: "DHL", tier: "Tier 3", status: "Picked Up", lastUpdate: "4h ago", eta: "Tomorrow 10AM", items: 1, value: "₦89,000", storefront: "kauvex.com/ng" },
  { id: "s3", orderId: "ORD-2024-3839", customer: "TechCorp Ltd", email: "orders@techcorp.com", phone: "+234 803 456 7890", destination: "Ikeja GRA, Lagos", zone: "Lagos Mainland", carrier: "FedEx", tier: "Tier 2", status: "Out for Delivery", lastUpdate: "1h ago", eta: "Today 2PM", items: 5, value: "₦567,000", storefront: "kauvex.com" },
  { id: "s4", orderId: "ORD-2024-3838", customer: "MarinePro Nigeria", email: "info@marinepro.ng", phone: "+234 804 567 8901", destination: "GRA Phase 2, Port Harcourt", zone: "Rivers", carrier: "Kauvex Logistics", tier: "Tier 2", status: "Packed", lastUpdate: "6h ago", eta: "Jun 28", items: 2, value: "₦178,000", storefront: "kauvex.com/ng" },
  { id: "s5", orderId: "ORD-2024-3837", customer: "Alice Brown", email: "alice@email.com", phone: "+234 805 678 9012", destination: "Bodija, Ibadan", zone: "Oyo", carrier: "Aramex", tier: "Tier 2", status: "Delivered", lastUpdate: "1d ago", eta: "Delivered Jun 24", items: 8, value: "₦412,000", storefront: "kauvex.com" },
  { id: "s6", orderId: "ORD-2024-3836", customer: "Chief Emeka Okafor", email: "emeka@email.com", phone: "+234 806 789 0123", destination: "Independence Layout, Enugu", zone: "Enugu", carrier: "DHL", tier: "Tier 2", status: "In Transit", lastUpdate: "3h ago", eta: "Jun 27", items: 4, value: "₦320,000", storefront: "kauvex.com/ng" },
  { id: "s7", orderId: "ORD-2024-3835", customer: "Fatima Bello", email: "fatima@email.com", phone: "+234 807 890 1234", destination: "Kano Municipal", zone: "Kano", carrier: "GIG Logistics", tier: "Tier 2", status: "Failed", lastUpdate: "1d ago", eta: "Rescheduled", items: 2, value: "₦95,000", storefront: "kauvex.com/ng" },
  { id: "s8", orderId: "ORD-2024-3834", customer: "David Ukah", email: "david@email.com", phone: "+234 808 901 2345", destination: "Agodi, Ibadan", zone: "Oyo", carrier: "Kauvex Logistics", tier: "Tier 1", status: "Returned", lastUpdate: "2d ago", eta: "Returned to sender", items: 1, value: "₦45,000", storefront: "kauvex.com" },
  { id: "s9", orderId: "ORD-2024-3833", customer: "Grace Lee", email: "grace@email.com", phone: "+234 809 012 3456", destination: "Victoria Island, Lagos", zone: "Lagos Island", carrier: "Kwik", tier: "Tier 1", status: "Packed", lastUpdate: "30m ago", eta: "Today 6PM", items: 3, value: "₦156,000", storefront: "kauvex.com/uk" },
  { id: "s10", orderId: "ORD-2024-3832", customer: "Henry Okonkwo", email: "henry@email.com", phone: "+234 810 123 4567", destination: "Asaba, Delta", zone: "Delta", carrier: "FedEx", tier: "Tier 2", status: "Picked Up", lastUpdate: "5h ago", eta: "Jun 28", items: 6, value: "₦890,000", storefront: "kauvex.com/ca" },
];

export default function VendorLogisticsShipmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [storefrontFilter, setStorefrontFilter] = useState("All");
  const [carrierFilter, setCarrierFilter] = useState("All");
  const [destinationFilter, setDestinationFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = demoData.filter((s) => {
    if (search && !s.orderId.toLowerCase().includes(search.toLowerCase()) && !s.customer.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    if (storefrontFilter !== "All" && s.storefront !== storefrontFilter) return false;
    if (carrierFilter !== "All" && s.carrier !== carrierFilter) return false;
    if (destinationFilter !== "All" && !s.destination.includes(destinationFilter)) return false;
    return true;
  });

  return (
    <VendorShell title="Shipments" subtitle="Track and manage all your outbound orders">
      {/* Status Stages */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 text-sm">Delivery Lifecycle</h3>
          <span className="text-[10px] text-gray-400">{filtered.length} shipments</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statusStages.map((stage) => {
            const Icon = stage.icon;
            const count = demoData.filter((s) => s.status === stage.key).length;
            return (
              <button
                key={stage.key}
                onClick={() => setStatusFilter(statusFilter === stage.key ? "All" : stage.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  statusFilter === stage.key
                    ? "bg-purple-100 text-purple-700 border-purple-200"
                    : "text-gray-500 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={12} className={stage.color} />
                {stage.key}
                <span className="text-gray-400 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order ID or customer..."
                className="w-full h-9 pl-9 pr-3 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg"
          >
            <Filter size={14} />
            Filters
            <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-6 gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400">
                <option>All</option>
                {statusStages.map((st) => <option key={st.key}>{st.key}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Storefront</label>
              <select value={storefrontFilter} onChange={(e) => setStorefrontFilter(e.target.value)} className="w-full h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400">
                <option>All</option>
                {allStorefronts.map((sf) => <option key={sf}>{sf}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Carrier</label>
              <select value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} className="w-full h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400">
                <option>All</option>
                {allCarriers.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">Destination</label>
              <select value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)} className="w-full h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400">
                <option>All</option>
                {allDestinations.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">From Date</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase block mb-1">To Date</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px]">
                <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">Destination</th>
                <th className="text-left px-4 py-3 font-semibold">Carrier</th>
                <th className="text-left px-4 py-3 font-semibold">Tier</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Last Update</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const StatusIcon = statusStages.find((st) => st.key === s.status)?.icon || Package;
                return (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{s.orderId}</span>
                      <span className="block text-[9px] text-gray-400">{s.storefront}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{s.customer}</span>
                      <span className="block text-[9px] text-gray-400">{s.items} items · {s.value}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.destination}</td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{s.carrier}</span>
                      <span className="block text-[9px] text-gray-400">{s.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        s.tier === "Tier 1" ? "bg-green-100 text-green-700" :
                        s.tier === "Tier 2" ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{s.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusStyles[s.status] || "bg-gray-100"}`}>
                        <StatusIcon size={10} />
                        {s.status}
                      </span>
                      <span className="block text-[9px] text-gray-400 mt-0.5">ETA: {s.eta}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[10px]">{s.lastUpdate}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button title="View tracking" className="p-1.5 hover:bg-purple-50 rounded-lg text-gray-400 hover:text-purple-600">
                          <Eye size={14} />
                        </button>
                        <button title="Contact customer" className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600">
                          <MessageSquare size={14} />
                        </button>
                        <button title="Report issue" className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
                          <AlertTriangle size={14} />
                        </button>
                        <button title="Request re-delivery" className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600">
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No shipments match your filters.</div>
        )}
      </div>
    </VendorShell>
  );
}
