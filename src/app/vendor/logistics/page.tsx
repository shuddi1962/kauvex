"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck, Package, ClipboardList, BarChart3, ArrowRight,
  CheckCircle2, MapPin, ChevronRight,
  RefreshCw, XCircle, TrendingUp, DollarSign, Eye, Box,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

interface ShipmentSummary {
  id: string;
  orderId: string;
  customer: string;
  destination: string;
  carrier: string;
  status: string;
  lastUpdate: string;
  eta: string;
}

interface PickupRequest {
  id: string;
  orderId: string;
  customer: string;
  items: number;
  weight: string;
  status: "pending" | "assigned" | "en_route" | "completed";
  pickupDate: string;
  pickupWindow: string;
  partnerName?: string;
}

interface ManifestSummary {
  id: string;
  date: string;
  orders: number;
  totalWeight: string;
  status: "draft" | "submitted" | "received";
  hubName: string;
}

const demoActiveShipments: ShipmentSummary[] = [
  { id: "s1", orderId: "ORD-2024-3841", customer: "John D.", destination: "Lekki, Lagos", carrier: "Kauvex Logistics", status: "In Transit", lastUpdate: "2h ago", eta: "Today 4PM" },
  { id: "s2", orderId: "ORD-2024-3840", customer: "Sarah M.", destination: "Wuse, Abuja", carrier: "DHL", status: "Picked Up", lastUpdate: "4h ago", eta: "Tomorrow 10AM" },
  { id: "s3", orderId: "ORD-2024-3839", customer: "TechCorp Ltd", destination: "Ikeja, Lagos", carrier: "FedEx", status: "Out for Delivery", lastUpdate: "1h ago", eta: "Today 2PM" },
  { id: "s4", orderId: "ORD-2024-3838", customer: "MarinePro", destination: "PHC, Rivers", carrier: "Kauvex Logistics", status: "Packed", lastUpdate: "6h ago", eta: "Jun 28" },
  { id: "s5", orderId: "ORD-2024-3837", customer: "Alice B.", destination: "Ibadan, Oyo", carrier: "Aramex", status: "Delivered", lastUpdate: "1d ago", eta: "Delivered Jun 24" },
];

const demoPickupRequests: PickupRequest[] = [
  { id: "pr1", orderId: "ORD-2024-3835", customer: "James Wilson", items: 3, weight: "2.1 kg", status: "pending", pickupDate: "Jun 26", pickupWindow: "09:00-12:00" },
  { id: "pr2", orderId: "ORD-2024-3834", customer: "Emily Davis", items: 1, weight: "0.5 kg", status: "assigned", pickupDate: "Jun 26", pickupWindow: "09:00-12:00", partnerName: "Kauvex Rider #1024" },
  { id: "pr3", orderId: "ORD-2024-3833", customer: "Michael Brown", items: 5, weight: "3.8 kg", status: "en_route", pickupDate: "Jun 26", pickupWindow: "14:00-17:00", partnerName: "DHL Driver #KJ-450" },
];

const demoManifests: ManifestSummary[] = [
  { id: "m1", date: "Jun 25, 2026", orders: 14, totalWeight: "23.5 kg", status: "submitted", hubName: "Lagos Island Hub" },
  { id: "m2", date: "Jun 24, 2026", orders: 11, totalWeight: "18.2 kg", status: "received", hubName: "Lagos Island Hub" },
  { id: "m3", date: "Jun 23, 2026", orders: 9, totalWeight: "12.7 kg", status: "received", hubName: "Ikeja Hub" },
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

const statusIcons: Record<string, React.ElementType> = {
  Packed: Package,
  "Picked Up": Truck,
  "In Transit": Truck,
  "Out for Delivery": MapPin,
  Delivered: CheckCircle2,
  Failed: XCircle,
  Returned: RefreshCw,
};

const pickupStatusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  en_route: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const manifestStatusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
};

const PACKAGING_TYPES = [
  {
    id: "own",
    name: "Own Packaging",
    size: "Custom",
    dimensions: "Your own box/envelope",
    maxWeight: "Any",
    price: 0,
    icon: "📦",
    color: "bg-gray-50 border-gray-200",
    selectedColor: "border-gray-600 bg-gray-100",
    bestFor: ["Items already packed", "Irregular shapes"],
    includes: ["Use your own materials"],
    description: "Bring your item pre-packed in your own packaging",
  },
  {
    id: "letter",
    name: "Letter / Document",
    size: "XS",
    dimensions: "35 × 25 × 2 cm",
    maxWeight: "0.5 kg",
    price: 0.50,
    icon: "📄",
    color: "bg-blue-50 border-blue-200",
    selectedColor: "border-blue-600 bg-blue-50",
    bestFor: ["Documents", "Contracts", "Photos", "Certificates"],
    includes: ["Document envelope", "Waterproof sleeve"],
    description: "Flat envelope for documents and paper items",
  },
  {
    id: "small",
    name: "Small Parcel",
    size: "S",
    dimensions: "30 × 20 × 15 cm",
    maxWeight: "2 kg",
    price: 1.20,
    icon: "📦",
    color: "bg-emerald-50 border-emerald-200",
    selectedColor: "border-emerald-600 bg-emerald-50",
    bestFor: ["Phone accessories", "Jewelry", "Small electronics"],
    includes: ["Small box", "Bubble wrap lining", "Sealing tape"],
    description: "Compact box for small fragile or valuable items",
  },
  {
    id: "medium",
    name: "Medium Parcel",
    size: "M",
    dimensions: "45 × 35 × 25 cm",
    maxWeight: "10 kg",
    price: 2.00,
    icon: "📫",
    color: "bg-orange-50 border-orange-200",
    selectedColor: "border-orange-600 bg-orange-50",
    bestFor: ["Clothing", "Shoes", "Books", "Electronics"],
    includes: ["Medium box", "Bubble wrap", "Foam corners", "Fragile stickers"],
    description: "Most popular — fits most everyday items",
    badge: "Most Popular",
  },
  {
    id: "large",
    name: "Large Parcel",
    size: "L",
    dimensions: "60 × 50 × 40 cm",
    maxWeight: "25 kg",
    price: 3.50,
    icon: "📬",
    color: "bg-purple-50 border-purple-200",
    selectedColor: "border-purple-600 bg-purple-50",
    bestFor: ["Kitchen appliances", "Multiple items", "Bulk clothing"],
    includes: ["Large box", "Double bubble wrap", "Corner protectors", "Void fill"],
    description: "Spacious box for larger or multiple items",
  },
  {
    id: "fragile",
    name: "Fragile Pack",
    size: "M+",
    dimensions: "45 × 35 × 25 cm",
    maxWeight: "10 kg",
    price: 4.50,
    icon: "🛡️",
    color: "bg-red-50 border-red-200",
    selectedColor: "border-red-600 bg-red-50",
    bestFor: ["Glassware", "Ceramics", "Electronics", "Artwork"],
    includes: ["Double-wall box", "Foam inserts", "Bubble wrap (2 layers)", "Fragile tape"],
    description: "Maximum protection for breakable items",
    badge: "Max Protection",
  },
  {
    id: "cold",
    name: "Cold Chain",
    size: "M",
    dimensions: "45 × 35 × 25 cm",
    maxWeight: "8 kg",
    price: 6.00,
    icon: "❄️",
    color: "bg-cyan-50 border-cyan-200",
    selectedColor: "border-cyan-600 bg-cyan-50",
    bestFor: ["Food", "Pharmaceuticals", "Flowers", "Perishables"],
    includes: ["Insulated box", "Gel packs", "Temperature seal", "Cold chain label"],
    description: "Temperature-controlled for perishable goods",
    badge: "Temperature",
  },
];

const tabs = [
  { key: "shipments", label: "Active Shipments", icon: Truck },
  { key: "pickups", label: "Pickup Requests", icon: Package },
  { key: "manifests", label: "Manifests", icon: ClipboardList },
  { key: "packaging", label: "Packaging Fees", icon: Box },
  { key: "performance", label: "Performance", icon: BarChart3 },
];

export default function VendorLogisticsPage() {
  const [activeTab, setActiveTab] = useState("shipments");

  return (
    <VendorShell title="Logistics" subtitle="Manage your shipments, pickups, manifests, and performance">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{demoActiveShipments.length}</p>
              <p className="text-xs text-gray-400">Active Shipments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{demoPickupRequests.length}</p>
              <p className="text-xs text-gray-400">Pending Pickups</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardList size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{demoManifests.length}</p>
              <p className="text-xs text-gray-400">Manifests This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">97.2%</p>
              <p className="text-xs text-gray-400">On-Time Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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

      {/* Tab: Active Shipments */}
      {activeTab === "shipments" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Current Shipments</h3>
            <Link
              href="/vendor/logistics/shipments"
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold">Destination</th>
                  <th className="text-left px-4 py-3 font-semibold">Carrier</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">ETA</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {demoActiveShipments.map((s) => {
                  const StatusIcon = statusIcons[s.status] || Truck;
                  return (
                    <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.orderId}</td>
                      <td className="px-4 py-3 text-gray-600">{s.customer}</td>
                      <td className="px-4 py-3 text-gray-600">{s.destination}</td>
                      <td className="px-4 py-3 text-gray-600">{s.carrier}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusStyles[s.status] || "bg-gray-100"}`}>
                          <StatusIcon size={10} />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{s.eta}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href="/vendor/logistics/shipments" className="text-purple-600 hover:text-purple-800 text-[10px] font-medium">
                          <Eye size={14} className="inline" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Pickup Requests */}
      {activeTab === "pickups" && (
        <div className="space-y-4">
          {demoPickupRequests.map((pr) => (
            <div key={pr.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{pr.orderId} — {pr.customer}</p>
                  <p className="text-xs text-gray-400">{pr.items} items · {pr.weight} · {pr.pickupDate} {pr.pickupWindow}</p>
                  {pr.partnerName && <p className="text-xs text-blue-600 mt-0.5">Partner: {pr.partnerName}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${pickupStatusStyles[pr.status]}`}>
                  {pr.status.replace("_", " ")}
                </span>
                <Link
                  href="/vendor/logistics/pickups"
                  className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                >
                  View <ChevronRight size={12} className="inline" />
                </Link>
              </div>
            </div>
          ))}
          <Link
            href="/vendor/logistics/pickups"
            className="block text-center text-xs text-purple-600 hover:text-purple-800 font-medium py-2"
          >
            View All Pickups →
          </Link>
        </div>
      )}

      {/* Tab: Manifests */}
      {activeTab === "manifests" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Recent Manifests</h3>
            <Link
              href="/vendor/logistics/manifests"
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Orders</th>
                  <th className="text-left px-4 py-3 font-semibold">Total Weight</th>
                  <th className="text-left px-4 py-3 font-semibold">Hub</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {demoManifests.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{m.date}</td>
                    <td className="px-4 py-3 text-gray-600">{m.orders}</td>
                    <td className="px-4 py-3 text-gray-600">{m.totalWeight}</td>
                    <td className="px-4 py-3 text-gray-600">{m.hubName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${manifestStatusStyles[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-purple-600 font-medium">View</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Packaging Fees */}
      {activeTab === "packaging" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#FF6B00] rounded-lg flex items-center justify-center"><Box size={18} className="text-white" /></div>
              <div>
                <h3 className="text-sm font-bold text-[#0A1628]">Express Packaging Fees</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xl">Fees apply per package when using Kauvex Express packing service. Choose &quot;I&apos;ll Pack Myself&quot; to avoid packaging fees. All fees reflected at checkout.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {PACKAGING_TYPES.map((p) => (
              <div key={p.id} className={`relative rounded-xl border-2 p-5 transition-all hover:shadow-md ${p.color}`}>
                {p.badge && <span className="absolute top-3 right-3 text-[9px] font-bold bg-[#FF6B00] text-white px-2 py-0.5 rounded-full">{p.badge}</span>}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0A1628]">{p.name}</h4>
                      <span className="text-[10px] font-mono bg-white/80 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{p.size}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{p.dimensions} · Max {p.maxWeight}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-3">{p.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.bestFor.map((b, i) => <span key={i} className="text-[9px] bg-white/70 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200">{b}</span>)}
                </div>
                <div className="border-t border-gray-200/60 pt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {p.includes.map((inc, i) => <span key={i} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{inc}</span>)}
                  </div>
                  <span className="text-base font-bold text-[#FF6B00]">{p.price > 0 ? `+$${p.price.toFixed(2)}` : "Free"}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h4 className="text-xs font-bold text-[#0A1628] mb-2">Packaging Fee Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-bold text-[#0A1628]">$0.50 – $6.00</p>
                <p className="text-[10px] text-gray-400">Fee range per package</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-bold text-[#0A1628]">7 options</p>
                <p className="text-[10px] text-gray-400">Including own packaging</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-lg font-bold text-green-600">$0.00</p>
                <p className="text-[10px] text-gray-400">Own packaging = free</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Performance */}
      {activeTab === "performance" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-green-600" />
              <h3 className="font-bold text-gray-900 text-sm">On-Time Delivery Rate</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">97.2%</p>
            <p className="text-xs text-gray-400 mt-1">Target: ≥ 95% · Last month: 96.1%</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={16} className="text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Avg Shipping Cost</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">₦4,850</p>
            <p className="text-xs text-gray-400 mt-1">Per shipment · 142 shipments this month</p>
          </div>
          <Link href="/vendor/logistics/performance" className="col-span-2 block text-center text-xs text-purple-600 hover:text-purple-800 font-medium py-2 bg-white rounded-xl border border-gray-200">
            View Full Performance Dashboard →
          </Link>
        </div>
      )}
    </VendorShell>
  );
}
