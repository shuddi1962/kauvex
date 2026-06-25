"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck, Package, ClipboardList, BarChart3, ArrowRight,
  Clock, CheckCircle2, AlertTriangle, MapPin, ChevronRight,
  RefreshCw, XCircle, User, TrendingUp, DollarSign, Eye,
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

const tabs = [
  { key: "shipments", label: "Active Shipments", icon: Truck },
  { key: "pickups", label: "Pickup Requests", icon: Package },
  { key: "manifests", label: "Manifests", icon: ClipboardList },
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
