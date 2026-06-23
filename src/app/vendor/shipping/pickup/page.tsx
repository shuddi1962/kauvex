"use client";

import { useState } from "react";
import {
  Truck, Clock, Calendar, CheckCircle2, Plus, X,
  Loader2, MapPin, Package, ChevronDown, Eye,
  ToggleLeft, ToggleRight, History,
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

interface ScheduledPickup {
  id: string;
  date: string;
  timeWindow: string;
  carrier: string;
  orders: number;
  status: "scheduled" | "in_transit" | "completed" | "cancelled";
  notes?: string;
}

const demoPickups: ScheduledPickup[] = [
  { id: "pk-1", date: "2026-06-23", timeWindow: "09:00 - 12:00", carrier: "Kauvex Logistics", orders: 8, status: "scheduled" },
  { id: "pk-2", date: "2026-06-23", timeWindow: "14:00 - 17:00", carrier: "DHL Express", orders: 4, status: "scheduled" },
  { id: "pk-3", date: "2026-06-22", timeWindow: "09:00 - 12:00", carrier: "FedEx", orders: 6, status: "completed" },
  { id: "pk-4", date: "2026-06-21", timeWindow: "10:00 - 14:00", carrier: "Kauvex Logistics", orders: 3, status: "completed" },
  { id: "pk-5", date: "2026-06-20", timeWindow: "09:00 - 11:00", carrier: "DHL Express", orders: 5, status: "cancelled" },
];

interface ReadyPickupOrder {
  id: string;
  orderId: string;
  customer: string;
  destination: string;
  items: number;
  weight: string;
  carrier: string;
  marked: boolean;
}

const demoReadyOrders: ReadyPickupOrder[] = [
  { id: "rp-1", orderId: "ORD-1001", customer: "John Doe", destination: "Lekki, Lagos", items: 3, weight: "2.5 kg", carrier: "Kauvex Logistics", marked: false },
  { id: "rp-2", orderId: "ORD-1002", customer: "Jane Smith", destination: "Wuse, Abuja", items: 1, weight: "0.8 kg", carrier: "DHL", marked: false },
  { id: "rp-3", orderId: "ORD-1003", customer: "Bob Johnson", destination: "Ikeja, Lagos", items: 5, weight: "4.2 kg", carrier: "Kauvex Logistics", marked: false },
  { id: "rp-4", orderId: "ORD-1004", customer: "Alice Brown", destination: "Port Harcourt", items: 2, weight: "1.1 kg", carrier: "FedEx", marked: false },
  { id: "rp-5", orderId: "ORD-1005", customer: "Charlie Wilson", destination: "Ibadan, Oyo", items: 8, weight: "6.7 kg", carrier: "DHL", marked: false },
];

const statusColors: Record<string, string> = {
  scheduled: "bg-purple-100 text-purple-700",
  in_transit: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function PickupManagementPage() {
  const [windows, setWindows] = useState(defaultWindows);
  const [pickups, setPickups] = useState<ScheduledPickup[]>(demoPickups);
  const [readyOrders, setReadyOrders] = useState<ReadyPickupOrder[]>(demoReadyOrders);
  const [showHolidays, setShowHolidays] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [holidayList, setHolidayList] = useState(holidays);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const [activeTab, setActiveTab] = useState<"windows" | "pickups" | "ready">("pickups");

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

  const addHoliday = () => {
    if (newHolidayDate && newHolidayName) {
      setHolidayList([...holidayList, { date: newHolidayDate, name: newHolidayName }]);
      setNewHolidayDate("");
      setNewHolidayName("");
      showToast("Holiday added", "success");
    }
  };

  const removeHoliday = (date: string) => {
    setHolidayList((prev) => prev.filter((h) => h.date !== date));
  };

  const markReady = (id: string) => {
    setReadyOrders((prev) => prev.map((o) => o.id === id ? { ...o, marked: !o.marked } : o));
  };

  const markAllReady = () => {
    setReadyOrders((prev) => prev.map((o) => ({ ...o, marked: true })));
    showToast("All orders marked ready for pickup", "success");
  };

  const schedulePickup = () => {
    setSaving(true);
    setTimeout(() => {
      const newPickup: ScheduledPickup = {
        id: `pk-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        timeWindow: "09:00 - 12:00",
        carrier: "Kauvex Logistics",
        orders: readyOrders.filter((o) => o.marked).length,
        status: "scheduled",
      };
      setPickups([newPickup, ...pickups]);
      setReadyOrders((prev) => prev.filter((o) => !o.marked));
      setSaving(false);
      showToast("Pickup scheduled successfully", "success");
    }, 1000);
  };

  const saveWindows = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Pickup windows saved", "success");
    }, 800);
  };

  const tabs = [
    { key: "pickups", label: "Upcoming Pickups", icon: Calendar },
    { key: "ready", label: "Ready for Pickup", icon: Package },
    { key: "windows", label: "Pickup Windows", icon: Clock },
  ] as const;

  return (
    <VendorShell title="Pickup Management" subtitle="Configure pickup windows, schedule pickups, and track carrier collections">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm text-white shadow-lg ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

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

      {/* Tab: Pickup Windows */}
      {activeTab === "windows" && (
        <div className="space-y-6">
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
                  <button onClick={() => toggleDay(w.day)} className="text-gray-400">
                    {w.enabled ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                  </button>
                  <span className={`text-sm font-medium w-28 ${w.enabled ? "text-gray-900" : "text-gray-400"}`}>{w.day}</span>
                  {w.enabled ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={w.start}
                        onChange={(e) => updateWindow(w.day, "start", e.target.value)}
                        type="time"
                        className="h-8 px-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                      <span className="text-xs text-gray-400">to</span>
                      <input
                        value={w.end}
                        onChange={(e) => updateWindow(w.day, "end", e.target.value)}
                        type="time"
                        className="h-8 px-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Holidays */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => setShowHolidays(!showHolidays)}
              className="flex items-center justify-between w-full"
            >
              <div>
                <h3 className="font-bold text-gray-900">Holidays & Excluded Dates</h3>
                <p className="text-xs text-gray-400">{holidayList.length} holiday(s) configured</p>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showHolidays ? "rotate-180" : ""}`} />
            </button>
            {showHolidays && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    type="date"
                    className="h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                  <input
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    placeholder="Holiday name"
                    className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                  <Button variant="outline" size="sm" onClick={addHoliday}>
                    <Plus size={12} className="mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {holidayList.map((h) => (
                    <div key={h.date} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-red-400" />
                        <span className="text-sm text-gray-700">{h.date} — {h.name}</span>
                      </div>
                      <button onClick={() => removeHoliday(h.date)} className="p-1 hover:bg-red-50 rounded">
                        <X size={12} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Ready for Pickup */}
      {activeTab === "ready" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Ready for Pickup</h3>
                <p className="text-xs text-gray-400">Mark orders as ready and schedule a carrier pickup.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={markAllReady}>
                  <CheckCircle2 size={14} className="mr-1" /> Mark All Ready
                </Button>
                <Button onClick={schedulePickup} disabled={saving || readyOrders.filter((o) => o.marked).length === 0}>
                  {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Truck size={14} className="mr-1" />}
                  {saving ? "Scheduling..." : "Schedule Pickup"}
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Ready</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Order</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Destination</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Items</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Weight</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Carrier</th>
                  </tr>
                </thead>
                <tbody>
                  {readyOrders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-xs text-gray-400">All orders assigned for pickup.</td></tr>
                  ) : (
                    readyOrders.map((o) => (
                      <tr key={o.id} className={`border-b border-gray-50 transition-colors ${o.marked ? "bg-green-50" : "hover:bg-gray-50"}`}>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => markReady(o.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              o.marked ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-green-400"
                            }`}
                          >
                            {o.marked && <CheckCircle2 size={12} />}
                          </button>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">{o.orderId}</td>
                        <td className="py-3 px-4 text-gray-800">{o.customer}</td>
                        <td className="py-3 px-4 text-gray-600">{o.destination}</td>
                        <td className="py-3 px-4 text-gray-800">{o.items}</td>
                        <td className="py-3 px-4 text-gray-800">{o.weight}</td>
                        <td className="py-3 px-4 text-gray-800">{o.carrier}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              {readyOrders.filter((o) => o.marked).length} of {readyOrders.length} marked ready
            </div>
          </div>
        </div>
      )}

      {/* Tab: Upcoming Pickups */}
      {activeTab === "pickups" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{pickups.filter((p) => p.status === "scheduled").length}</p>
              <p className="text-xs text-gray-400">Scheduled</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{pickups.filter((p) => p.status === "completed").length}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{pickups.reduce((a, p) => a + p.orders, 0)}</p>
              <p className="text-xs text-gray-400">Total Orders</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Pickup History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Time Window</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Carrier</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Orders</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {pickups.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-xs text-gray-400">No pickups scheduled yet.</td></tr>
                  ) : (
                    pickups.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-medium text-gray-800">{new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="py-3 px-4 text-gray-600">{p.timeWindow}</td>
                        <td className="py-3 px-4 text-gray-800">{p.carrier}</td>
                        <td className="py-3 px-4 text-gray-800">{p.orders}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColors[p.status]}`}>
                            {p.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{p.notes || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </VendorShell>
  );
}
