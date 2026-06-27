"use client";

import { useState } from "react";
import {
  Repeat,
  Plus,
  Pause,
  Play,
  Trash2,
  Calendar,
  MapPin,
  Package,
  Clock,
  ChevronDown,
  ArrowRight,
  Edit2,
  History,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface RecurringShipment {
  id: string;
  origin: string;
  destination: string;
  weight: string;
  service: string;
  frequency: "weekly" | "biweekly" | "monthly";
  nextShipDate: string;
  status: "active" | "paused";
  createdDate: string;
  totalShipments: number;
}

const MOCK_RECURRING: RecurringShipment[] = [
  {
    id: "RCS-001",
    origin: "Lagos, Nigeria",
    destination: "Abuja, Nigeria",
    weight: "2.5 kg",
    service: "Express Domestic",
    frequency: "weekly",
    nextShipDate: "2026-01-27",
    status: "active",
    createdDate: "2025-10-15",
    totalShipments: 16,
  },
  {
    id: "RCS-002",
    origin: "Lagos, Nigeria",
    destination: "London, UK",
    weight: "5.0 kg",
    service: "International Priority",
    frequency: "monthly",
    nextShipDate: "2026-02-01",
    status: "active",
    createdDate: "2025-08-20",
    totalShipments: 5,
  },
  {
    id: "RCS-003",
    origin: "Port Harcourt, Nigeria",
    destination: "Accra, Ghana",
    weight: "1.8 kg",
    service: "Regional Express",
    frequency: "biweekly",
    nextShipDate: "2026-01-30",
    status: "paused",
    createdDate: "2025-11-05",
    totalShipments: 8,
  },
  {
    id: "RCS-004",
    origin: "Abuja, Nigeria",
    destination: "Dubai, UAE",
    weight: "10.0 kg",
    service: "International Standard",
    frequency: "monthly",
    nextShipDate: "2026-02-05",
    status: "active",
    createdDate: "2025-09-10",
    totalShipments: 4,
  },
  {
    id: "RCS-005",
    origin: "Lagos, Nigeria",
    destination: "Kano, Nigeria",
    weight: "3.2 kg",
    service: "Express Domestic",
    frequency: "weekly",
    nextShipDate: "2026-01-28",
    status: "active",
    createdDate: "2025-12-01",
    totalShipments: 4,
  },
];

const MOCK_HISTORY = [
  { id: "H-001", waybill: "KVX-20481", recurringId: "RCS-001", date: "2026-01-20", status: "delivered", cost: 3500 },
  { id: "H-002", waybill: "KVX-20465", recurringId: "RCS-002", date: "2026-01-02", status: "delivered", cost: 18500 },
  { id: "H-003", waybill: "KVX-20440", recurringId: "RCS-001", date: "2026-01-13", status: "delivered", cost: 3500 },
  { id: "H-004", waybill: "KVX-20425", recurringId: "RCS-003", date: "2026-01-08", status: "delivered", cost: 9200 },
  { id: "H-005", waybill: "KVX-20410", recurringId: "RCS-001", date: "2026-01-06", status: "delivered", cost: 3500 },
  { id: "H-006", waybill: "KVX-20398", recurringId: "RCS-005", date: "2026-01-03", status: "delivered", cost: 4200 },
  { id: "H-007", waybill: "KVX-20380", recurringId: "RCS-001", date: "2025-12-30", status: "delivered", cost: 3500 },
  { id: "H-008", waybill: "KVX-20365", recurringId: "RCS-004", date: "2025-12-28", status: "delivered", cost: 24000 },
];

export default function RecurringPage() {
  const [shipments, setShipments] = useState(MOCK_RECURRING);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weight: "",
    service: "express-domestic",
    frequency: "weekly" as "weekly" | "biweekly" | "monthly",
    startDate: "",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
  });

  const toggleStatus = (id: string) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "active" ? "paused" : "active" } : s))
    );
  };

  const deleteShipment = (id: string) => {
    setShipments((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreate = () => {
    const newShipment: RecurringShipment = {
      id: `RCS-${String(shipments.length + 1).padStart(3, "0")}`,
      origin: formData.origin || "Lagos, Nigeria",
      destination: formData.destination || "Abuja, Nigeria",
      weight: formData.weight ? `${formData.weight} kg` : "1.0 kg",
      service: formData.service === "express-domestic" ? "Express Domestic" : "International Priority",
      frequency: formData.frequency,
      nextShipDate: formData.startDate || "2026-02-01",
      status: "active",
      createdDate: new Date().toISOString().split("T")[0],
      totalShipments: 0,
    };
    setShipments((prev) => [newShipment, ...prev]);
    setShowForm(false);
    setFormData({
      origin: "",
      destination: "",
      weight: "",
      service: "express-domestic",
      frequency: "weekly",
      startDate: "",
      recipientName: "",
      recipientPhone: "",
      recipientAddress: "",
    });
  };

  const frequencyLabel = (f: string) => {
    switch (f) {
      case "weekly":
        return "Every week";
      case "biweekly":
        return "Every 2 weeks";
      case "monthly":
        return "Every month";
      default:
        return f;
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Recurring Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">Automate regular shipments on a schedule</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Recurring Shipment
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 p-5 bg-white">
          <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Create Recurring Shipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin City</label>
              <input
                type="text"
                placeholder="e.g. Lagos, Nigeria"
                value={formData.origin}
                onChange={(e) => setFormData((p) => ({ ...p, origin: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
              <input
                type="text"
                placeholder="e.g. Abuja, Nigeria"
                value={formData.destination}
                onChange={(e) => setFormData((p) => ({ ...p, destination: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Weight (kg)</label>
              <input
                type="number"
                placeholder="e.g. 2.5"
                value={formData.weight}
                onChange={(e) => setFormData((p) => ({ ...p, weight: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <div className="relative">
                <select
                  value={formData.service}
                  onChange={(e) => setFormData((p) => ({ ...p, service: e.target.value }))}
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                >
                  <option value="express-domestic">Express Domestic</option>
                  <option value="international-priority">International Priority</option>
                  <option value="international-standard">International Standard</option>
                  <option value="regional-express">Regional Express</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <div className="relative">
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, frequency: e.target.value as "weekly" | "biweekly" | "monthly" }))
                  }
                  className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.recipientName}
                onChange={(e) => setFormData((p) => ({ ...p, recipientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone</label>
              <input
                type="tel"
                placeholder="e.g. +234 801 234 5678"
                value={formData.recipientPhone}
                onChange={(e) => setFormData((p) => ({ ...p, recipientPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
              <input
                type="text"
                placeholder="e.g. 123 Main Street"
                value={formData.recipientAddress}
                onChange={(e) => setFormData((p) => ({ ...p, recipientAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleCreate}
              className="px-5 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors"
            >
              Create Recurring Shipment
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "active"
              ? "border-[#FF6B00] text-[#FF6B00]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active ({shipments.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-[#FF6B00] text-[#FF6B00]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <History className="w-4 h-4" />
            History
          </span>
        </button>
      </div>

      {activeTab === "active" && (
        <div className="space-y-4">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className={`rounded-xl border p-5 ${
                shipment.status === "paused" ? "border-yellow-200 bg-yellow-50/30" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono font-semibold text-[#0A1628]">{shipment.id}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        shipment.status === "active"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {shipment.status === "active" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Pause className="w-3 h-3" />
                      )}
                      {shipment.status === "active" ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-[#FF6B00]" />
                    <span className="font-medium">{shipment.origin}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{shipment.destination}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      {shipment.weight}
                    </span>
                    <span className="flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5" />
                      {shipment.service}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {frequencyLabel(shipment.frequency)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Next: {formatDate(shipment.nextShipDate)}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>{shipment.totalShipments} shipments sent</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(shipment.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      shipment.status === "active"
                        ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                        : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    }`}
                  >
                    {shipment.status === "active" ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Resume
                      </>
                    )}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteShipment(shipment.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {shipments.length === 0 && (
            <div className="rounded-xl border border-gray-200 p-10 text-center">
              <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No recurring shipments configured</p>
              <p className="text-sm text-gray-400 mt-1">Create one to automate your regular shipments</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Shipment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Waybill</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Recurring ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Cost</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-[#0A1628]">{h.waybill}</td>
                    <td className="py-3 px-4 text-gray-600">{h.recurringId}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(h.date)}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#0A1628]">₦{h.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
