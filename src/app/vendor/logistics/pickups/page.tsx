"use client";

import { useState } from "react";
import {
  Truck, Clock, Calendar, CheckCircle2, Plus, X,
  Loader2, MapPin, Package, ChevronDown, Eye,
  ToggleLeft, ToggleRight, History, ScanLine, QrCode,
  User, Phone, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultWindows = [
  { day: "Monday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Tuesday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Wednesday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Thursday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Friday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Saturday", enabled: false, start: "10:00", end: "14:00" },
  { day: "Sunday", enabled: false, start: "10:00", end: "14:00" },
];

const holidays = [
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-10-01", name: "Independence Day" },
];

interface PickupOrder {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  destination: string;
  items: number;
  weight: string;
  carrier: string;
  status: "pending" | "assigned" | "en_route" | "completed";
  pickupDate: string;
  pickupWindow: string;
  eta?: string;
  partnerName?: string;
  partnerPhone?: string;
  qrCode?: string;
}

const demoOrders: PickupOrder[] = [
  { id: "po1", orderId: "ORD-2024-3835", customer: "James Wilson", phone: "+234 801 111 2222", destination: "Lekki, Lagos", items: 3, weight: "2.1 kg", carrier: "Kauvex Logistics", status: "pending", pickupDate: "Jun 26", pickupWindow: "09:00-12:00" },
  { id: "po2", orderId: "ORD-2024-3834", customer: "Emily Davis", phone: "+234 802 222 3333", destination: "Ikeja, Lagos", items: 1, weight: "0.5 kg", carrier: "Kauvex Logistics", status: "assigned", pickupDate: "Jun 26", pickupWindow: "09:00-12:00", partnerName: "Kauvex Rider #1024", partnerPhone: "+234 811 000 1024", qrCode: "PK-2024-3834", eta: "10:15 AM" },
  { id: "po3", orderId: "ORD-2024-3833", customer: "Michael Brown", phone: "+234 803 333 4444", destination: "Wuse, Abuja", items: 5, weight: "3.8 kg", carrier: "DHL", status: "en_route", pickupDate: "Jun 26", pickupWindow: "14:00-17:00", partnerName: "DHL Driver #KJ-450", partnerPhone: "+234 811 000 2450", qrCode: "PK-2024-3833", eta: "2:45 PM" },
  { id: "po4", orderId: "ORD-2024-3832", customer: "Sarah Connor", phone: "+234 804 444 5555", destination: "PHC, Rivers", items: 2, weight: "1.8 kg", carrier: "FedEx", status: "pending", pickupDate: "Jun 27", pickupWindow: "09:00-12:00" },
  { id: "po5", orderId: "ORD-2024-3831", customer: "Peter Obi", phone: "+234 805 555 6666", destination: "Onitsha, Anambra", items: 4, weight: "3.2 kg", carrier: "Aramex", status: "pending", pickupDate: "Jun 27", pickupWindow: "14:00-17:00" },
];

const pickupHistory = [
  { orderId: "ORD-2024-3820", customer: "John Doe", date: "Jun 24", carrier: "Kauvex Logistics", status: "completed" },
  { orderId: "ORD-2024-3819", customer: "Jane Smith", date: "Jun 24", carrier: "DHL", status: "completed" },
  { orderId: "ORD-2024-3818", customer: "Bob Johnson", date: "Jun 23", carrier: "FedEx", status: "completed" },
  { orderId: "ORD-2024-3817", customer: "Alice Brown", date: "Jun 23", carrier: "Kauvex Logistics", status: "completed" },
  { orderId: "ORD-2024-3816", customer: "Charlie Wilson", date: "Jun 22", carrier: "Aramex", status: "completed" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  en_route: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

const tabs = [
  { key: "pending", label: "Pending Pickups", icon: Clock },
  { key: "assigned", label: "Assigned Pickups", icon: Truck },
  { key: "history", label: "Pickup History", icon: History },
  { key: "windows", label: "Pickup Windows", icon: Calendar },
];

export default function VendorLogisticsPickupsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [windows, setWindows] = useState(defaultWindows);
  const [orders, setOrders] = useState<PickupOrder[]>(demoOrders);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const toggleDay = (day: string) => {
    setWindows((prev) => prev.map((w) => w.day === day ? { ...w, enabled: !w.enabled } : w));
  };

  const updateWindow = (day: string, field: "start" | "end", value: string) => {
    setWindows((prev) => prev.map((w) => w.day === day ? { ...w, [field]: value } : w));
  };

  const saveWindows = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Pickup windows saved", "success");
    }, 800);
  };

  const assignPartner = (id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: "assigned" as const,
              partnerName: "Kauvex Rider #" + Math.floor(1000 + Math.random() * 9000),
              partnerPhone: "+234 811 000 " + Math.floor(1000 + Math.random() * 9000),
              qrCode: `PK-${o.orderId}`,
              eta: "30-45 min",
            }
          : o
      )
    );
    showToast("Partner assigned", "success");
  };

  const markCompleted = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "completed" as const } : o))
    );
    showToast("Pickup marked as completed", "success");
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const assignedOrders = orders.filter((o) => o.status === "assigned" || o.status === "en_route");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <VendorShell title="Pickups" subtitle="Manage pickup requests, assignments, and schedules">
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
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{assignedOrders.length}</p>
              <p className="text-xs text-gray-400">Assigned</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
              <p className="text-xs text-gray-400">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">14</p>
              <p className="text-xs text-gray-400">Total Today</p>
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

      {/* Tab: Pending Pickups */}
      {activeTab === "pending" && (
        <div className="space-y-3">
          {pendingOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
              No pending pickups — all orders assigned or completed.
            </div>
          ) : (
            pendingOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{o.orderId} — {o.customer}</p>
                    <p className="text-xs text-gray-400">{o.items} items · {o.weight} · {o.destination}</p>
                    <p className="text-xs text-gray-400">{o.pickupDate} · {o.pickupWindow} · {o.carrier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">Pending</span>
                  <Button size="sm" onClick={() => assignPartner(o.id)}>
                    <Truck size={12} className="mr-1" /> Assign Partner
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Assigned Pickups */}
      {activeTab === "assigned" && (
        <div className="space-y-3">
          {assignedOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
              <Truck size={32} className="mx-auto mb-2 text-gray-300" />
              No assigned pickups right now.
            </div>
          ) : (
            assignedOrders.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border-2 border-blue-100 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{o.orderId} — {o.customer}</p>
                      <p className="text-xs text-gray-400">{o.destination} · {o.pickupDate} {o.pickupWindow}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${statusStyles[o.status]}`}>
                    {o.status === "en_route" ? "En Route" : "Assigned"}
                  </span>
                </div>

                {/* Partner Info */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User size={14} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{o.partnerName}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Phone size={10} /> {o.partnerPhone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-purple-700">ETA: {o.eta}</p>
                      <p className="text-[10px] text-gray-400">Estimated arrival</p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {o.qrCode && (
                  <div className="flex items-center gap-4 bg-white border border-dashed border-blue-200 rounded-lg p-3 mb-3">
                    <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
                      <QrCode size={32} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Scan Code on Pickup</p>
                      <p className="text-[10px] text-gray-400">Present this QR code to the partner for scanning at pickup.</p>
                      <p className="text-[10px] font-mono text-blue-600 mt-0.5">Code: {o.qrCode}</p>
                    </div>
                    <button className="ml-auto p-1.5 hover:bg-blue-50 rounded-lg text-blue-600">
                      <ScanLine size={16} />
                    </button>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => markCompleted(o.id)}>
                    <CheckCircle2 size={12} className="mr-1" /> Mark Completed
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Pickup History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Carrier</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {pickupHistory.map((h, i) => (
                  <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{h.orderId}</td>
                    <td className="px-4 py-3 text-gray-600">{h.customer}</td>
                    <td className="px-4 py-3 text-gray-600">{h.date}</td>
                    <td className="px-4 py-3 text-gray-600">{h.carrier}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-green-100 text-green-700">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Pickup Windows */}
      {activeTab === "windows" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Available Pickup Days & Hours</h3>
              <p className="text-xs text-gray-400">Configure which days and times carriers can collect packages.</p>
            </div>
            <Button onClick={saveWindows} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {saving ? "Saving..." : "Save Windows"}
            </Button>
          </div>
          <div className="space-y-2">
            {windows.map((w) => (
              <div key={w.day} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                w.enabled ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"
              }`}>
                <button onClick={() => toggleDay(w.day)} className="text-gray-400 hover:text-gray-600">
                  {w.enabled ? <ToggleRight size={20} className="text-purple-600" /> : <ToggleLeft size={20} />}
                </button>
                <span className={`text-sm font-medium w-28 ${w.enabled ? "text-gray-900" : "text-gray-400"}`}>{w.day}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={w.start}
                    onChange={(e) => updateWindow(w.day, "start", e.target.value)}
                    disabled={!w.enabled}
                    className="w-28 h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-40"
                  />
                  <span className="text-gray-400 text-xs">to</span>
                  <input
                    type="time"
                    value={w.end}
                    onChange={(e) => updateWindow(w.day, "end", e.target.value)}
                    disabled={!w.enabled}
                    className="w-28 h-8 text-xs border border-gray-200 rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </VendorShell>
  );
}
