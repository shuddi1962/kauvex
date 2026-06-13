"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, Navigation, CheckCircle, XCircle, Clock,
  MapPin, Phone, User, Truck, ChevronRight, Loader2,
  Search, Bell, Menu, LogOut, Star, Camera,
} from "lucide-react";

interface DeliveryAssignment {
  id: string;
  shipment_id: string;
  status: string;
  assigned_at: string;
  otp_code: string;
  delivery_proof_url?: string;
  recipient_name?: string;
  shipment?: {
    id: string;
    tracking_number: string;
    originWarehouse?: { name: string; address: string; city: string };
    items: { productId: string; quantity: number }[];
  };
  order?: {
    order_number: string;
    customer: { full_name: string; phone: string; address: string };
  };
}

export default function DriverDashboard() {
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"assigned" | "in_transit" | "delivered">("assigned");

  useEffect(() => {
    setTimeout(() => {
      setAssignments(demoAssignments);
      setLoading(false);
    }, 800);
  }, []);

  const filtered = assignments.filter(a => {
    if (activeTab === "assigned") return a.status === "assigned";
    if (activeTab === "in_transit") return ["picked_up", "in_transit"].includes(a.status);
    return a.status === "delivered";
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "assigned": return "text-blue";
      case "picked_up": return "text-purple-600";
      case "in_transit": return "text-orange";
      case "delivered": return "text-green-600";
      case "failed": return "text-red-600";
      default: return "text-text-4";
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "assigned": return "bg-blue-50 text-blue";
      case "picked_up": return "bg-purple-50 text-purple-700";
      case "in_transit": return "bg-orange-50 text-orange";
      case "delivered": return "bg-green-50 text-green-700";
      case "failed": return "bg-red-50 text-red-700";
      default: return "bg-gray-100 text-text-4";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-orange mx-auto mb-3" size={32} />
        <p className="text-sm text-text-4">Loading driver dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Truck size={20} className="text-orange" />
          <div>
            <h1 className="font-bold text-sm">Driver Hub</h1>
            <p className="text-[10px] text-white/60">Chidi Okoro • Lagos Warehouse</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-1.5">
            <Bell size={18} className="text-white/70" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-orange rounded-full"></span>
          </button>
          <button className="p-1.5">
            <LogOut size={16} className="text-white/50" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-white border-b border-gray-100">
        {[
          { label: "Today", value: "12", icon: Package, color: "text-blue" },
          { label: "Active", value: "4", icon: Navigation, color: "text-orange" },
          { label: "Done", value: "8", icon: CheckCircle, color: "text-green-600" },
          { label: "Rating", value: "4.8", icon: Star, color: "text-yellow-500" },
        ].map(s => (
          <div key={s.label} className="text-center">
            <s.icon size={16} className={`mx-auto mb-1 ${s.color}`} />
            <p className={`font-bold text-sm ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-text-4">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 px-3">
        {[
          { key: "assigned" as const, label: "Assigned", count: assignments.filter(a => a.status === "assigned").length },
          { key: "in_transit" as const, label: "In Transit", count: assignments.filter(a => ["picked_up", "in_transit"].includes(a.status)).length },
          { key: "delivered" as const, label: "Delivered", count: assignments.filter(a => a.status === "delivered").length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === t.key
                ? "border-orange text-orange"
                : "border-transparent text-text-4 hover:text-text-2"
            }`}
          >
            {t.label} <span className="ml-1 text-[10px] opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input placeholder="Search by order # or customer..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm" />
        </div>
      </div>

      {/* Assignments List */}
      <div className="px-3 pb-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package size={32} className="mx-auto text-text-4 mb-2" />
            <p className="text-sm text-text-4">No deliveries found</p>
          </div>
        ) : (
          filtered.map(a => (
            <Link
              key={a.id}
              href={`/driver/${a.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-text-1">
                    Order #{a.order?.order_number || "N/A"}
                  </p>
                  <p className="text-[10px] text-text-4">
                    Tracking: {a.shipment?.tracking_number || "—"}
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>
                  {a.status.replace(/_/g, " ")}
                </span>
              </div>

              {a.order?.customer && (
                <div className="space-y-1.5 text-xs text-text-3 mb-3">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-text-4" />
                    <span>{a.order.customer.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-text-4" />
                    <span>{a.order.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-text-4" />
                    <span className="text-[11px]">{a.order.customer.address}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[10px] text-text-4">
                  <Clock size={10} />
                  <span>{new Date(a.assigned_at).toLocaleTimeString()}</span>
                </div>
                {a.status === "assigned" && (
                  <div className="flex items-center gap-1 text-blue text-[10px] font-medium">
                    <Navigation size={12} />
                    <span>Navigate</span>
                    <ChevronRight size={12} />
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

const demoAssignments: DeliveryAssignment[] = [
  {
    id: "1", shipment_id: "s1", status: "assigned",
    assigned_at: new Date().toISOString(), otp_code: "8741",
    shipment: { id: "s1", tracking_number: "KX-2024-001", items: [{ productId: "p1", quantity: 1 }] },
    order: { order_number: "ORD-1001", customer: { full_name: "Emeka Okafor", phone: "+234 803 111 2222", address: "15 Admiralty Way, Lekki Phase 1, Lagos" } },
  },
  {
    id: "2", shipment_id: "s2", status: "in_transit",
    assigned_at: new Date(Date.now() - 3600000).toISOString(), otp_code: "2356",
    shipment: { id: "s2", tracking_number: "KX-2024-002", items: [{ productId: "p2", quantity: 2 }] },
    order: { order_number: "ORD-1002", customer: { full_name: "Amara Okafor", phone: "+234 810 222 3333", address: "8 Unity Road, Ikeja, Lagos" } },
  },
  {
    id: "3", shipment_id: "s3", status: "picked_up",
    assigned_at: new Date(Date.now() - 7200000).toISOString(), otp_code: "4523",
    shipment: { id: "s3", tracking_number: "KX-2024-003", items: [{ productId: "p3", quantity: 1 }] },
    order: { order_number: "ORD-1003", customer: { full_name: "Chidi Nwosu", phone: "+234 806 333 4444", address: "42 Marina Road, Victoria Island, Lagos" } },
  },
  {
    id: "4", shipment_id: "s4", status: "delivered",
    assigned_at: new Date(Date.now() - 86400000).toISOString(), otp_code: "9876",
    delivery_proof_url: "", recipient_name: "Sarah Adeyemi",
    shipment: { id: "s4", tracking_number: "KX-2024-004", items: [{ productId: "p4", quantity: 1 }] },
    order: { order_number: "ORD-0999", customer: { full_name: "Sarah Adeyemi", phone: "+234 802 444 5555", address: "23 Bourdillon Road, Ikoyi, Lagos" } },
  },
  {
    id: "5", shipment_id: "s5", status: "delivered",
    assigned_at: new Date(Date.now() - 172800000).toISOString(), otp_code: "5432",
    delivery_proof_url: "", recipient_name: "John Obi",
    shipment: { id: "s5", tracking_number: "KX-2024-005", items: [{ productId: "p5", quantity: 1 }] },
    order: { order_number: "ORD-0998", customer: { full_name: "John Obi", phone: "+234 809 555 6666", address: "7 Awolowo Road, Ikoyi, Lagos" } },
  },
];
