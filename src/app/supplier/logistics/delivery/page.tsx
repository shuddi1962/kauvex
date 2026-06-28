"use client";

import { useState } from "react";
import { Truck, MapPin, Clock, CheckCircle, ShieldAlert, XCircle, AlertTriangle, Bike, Package2 } from "lucide-react";

type DeliveryStatus = "pending" | "in-transit" | "delivered" | "issue";
type DeliveryMethod = "own-rider" | "kauvex-logistics" | "kauvex-go";

interface Delivery {
  id: string;
  customer: string;
  area: string;
  item: string;
  status: DeliveryStatus;
  method: string;
  time: string;
}

const initialDeliveries: Delivery[] = [
  { id: "DEL-001", customer: "Chidi Okafor", area: "Ikeja", item: "Indomie Chicken Pack x50", status: "pending", method: "Own Rider", time: "09:30 AM" },
  { id: "DEL-002", customer: "Aisha Bello", area: "Lekki", item: "Milo Tin 500g x24", status: "in-transit", method: "GIG", time: "11:00 AM" },
  { id: "DEL-003", customer: "Emeka Nwosu", area: "VI", item: "Coke 50cl Crate x10", status: "pending", method: "Kwik", time: "10:15 AM" },
  { id: "DEL-004", customer: "Funmi Adeyemi", area: "Surulere", item: "Peak Milk 400g x36", status: "delivered", method: "Own Rider", time: "08:45 AM" },
  { id: "DEL-005", customer: "Segun Ogun", area: "Ikeja", item: "Dangote Sugar 1kg x20", status: "in-transit", method: "Kauvex Logistics", time: "09:00 AM" },
  { id: "DEL-006", customer: "Ngozi Okonkwo", area: "Lekki", item: "Golden Penny Pasta x30", status: "pending", method: "GIG", time: "01:30 PM" },
  { id: "DEL-007", customer: "Tunde Bakare", area: "Ajah", item: "Peak Yogurt 1L x12", status: "issue", method: "Own Rider", time: "07:30 AM" },
  { id: "DEL-008", customer: "Amara Eze", area: "Yaba", item: "Indomie Chicken x100", status: "pending", method: "Kwik", time: "02:00 PM" },
];

const performanceData = [
  { area: "Ikeja", onTime: "98%", failed: 2, avgTime: "24 min" },
  { area: "Lekki", onTime: "92%", failed: 5, avgTime: "38 min" },
  { area: "Victoria Island", onTime: "95%", failed: 3, avgTime: "31 min" },
  { area: "Surulere", onTime: "97%", failed: 1, avgTime: "27 min" },
  { area: "Ajah", onTime: "82%", failed: 8, avgTime: "52 min" },
  { area: "Yaba", onTime: "90%", failed: 4, avgTime: "35 min" },
];

export default function SupplierDeliveryPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [method, setMethod] = useState<DeliveryMethod>("own-rider");
  const [gigPartner, setGigPartner] = useState(false);
  const [kwikPartner, setKwikPartner] = useState(false);

  const markDelivered = (id: string) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: "delivered" as DeliveryStatus } : d));
  };

  const reportIssue = (id: string) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: "issue" as DeliveryStatus } : d));
  };

  const statusBadge = (status: DeliveryStatus) => {
    const map: Record<DeliveryStatus, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      "in-transit": "bg-blue-100 text-blue-700",
      delivered: "bg-green-100 text-green-700",
      issue: "bg-red-100 text-red-700",
    };
    return map[status];
  };

  const statusIcon = (status: DeliveryStatus) => {
    const Icon = {
      pending: Clock,
      "in-transit": Truck,
      delivered: CheckCircle,
      issue: AlertTriangle,
    }[status];
    return <Icon size={16} />;
  };

  const activeDeliveries = deliveries.filter(d => d.status !== "delivered").length;
  const deliveredToday = deliveries.filter(d => d.status === "delivered").length;
  const issuesCount = deliveries.filter(d => d.status === "issue").length;
  const onTimeRate = "94%";

  const deliveryMethodLabel = (m: DeliveryMethod) => {
    const labels: Record<DeliveryMethod, string> = {
      "own-rider": "Own Rider",
      "kauvex-logistics": "Kauvex Logistics",
      "kauvex-go": "Kauvex Go",
    };
    return labels[m];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-6 py-4">
        <h1 className="text-xl font-bold">Kauvex Supplier Portal</h1>
        <p className="text-sm text-gray-400">Lagos Wholesale Mart</p>
      </div>

      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-bold text-[#0A1628]">Delivery Management</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3"><CheckCircle size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">{deliveredToday}</p>
            <p className="text-sm text-gray-500">Delivered Today</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue flex items-center justify-center mb-3"><Truck size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">{activeDeliveries}</p>
            <p className="text-sm text-gray-500">Active Deliveries</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3"><Clock size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">{onTimeRate}</p>
            <p className="text-sm text-gray-500">On-Time Rate</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mb-3"><AlertTriangle size={20} /></div>
            <p className="text-2xl font-bold text-[#0A1628]">{issuesCount}</p>
            <p className="text-sm text-gray-500">Issues Reported</p>
          </div>
        </div>

        {/* Delivery Method Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-[#0A1628] mb-4">Delivery Method Settings</h3>
          <div className="space-y-3">
            {(["own-rider", "kauvex-logistics", "kauvex-go"] as DeliveryMethod[]).map(m => (
              <label key={m} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-[#FF6B00] transition-all">
                <input type="radio" name="delivery-method" value={m} checked={method === m} onChange={() => setMethod(m)}
                  className="accent-[#FF6B00]" />
                <div className="flex items-center gap-2 flex-1">
                  {m === "own-rider" && <Bike size={18} className="text-gray-500" />}
                  {m === "kauvex-logistics" && <Truck size={18} className="text-blue-500" />}
                  {m === "kauvex-go" && <Truck size={18} className="text-orange-500" />}
                  <span className="font-medium text-[#0A1628]">{deliveryMethodLabel(m)}</span>
                </div>
                {method === m && <span className="text-xs text-[#FF6B00] font-medium">Active</span>}
              </label>
            ))}
          </div>
          {method === "kauvex-logistics" && (
            <div className="mt-3 pl-10">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={gigPartner} onChange={() => setGigPartner(!gigPartner)} className="accent-[#FF6B00]" />
                I have an active Kauvex Logistics partner account
              </label>
            </div>
          )}
          {method === "kauvex-go" && (
            <div className="mt-3 pl-10">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={kwikPartner} onChange={() => setKwikPartner(!kwikPartner)} className="accent-[#FF6B00]" />
                I have an active Kauvex Go partner account
              </label>
            </div>
          )}
          {method === "kauvex-logistics" && (
            <div className="mt-3 pl-10 text-sm text-gray-500">
              Kauvex handles pickup and delivery. No partner account needed.
            </div>
          )}
        </div>

        {/* Active Deliveries Today */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-[#0A1628]">Active Deliveries Today</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {deliveries.map(del => (
              <div key={del.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#0A1628]">{del.id}</span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusBadge(del.status)}`}>
                      {statusIcon(del.status)} {del.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{del.item}</p>
                  <p className="text-xs text-gray-400">{del.customer} • {del.area} • via {del.method} • {del.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  {del.status !== "delivered" && del.status !== "issue" && (
                    <>
                      <button onClick={() => markDelivered(del.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-all">
                        <CheckCircle size={14} /> Mark Delivered
                      </button>
                      <button onClick={() => reportIssue(del.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-all">
                        <XCircle size={14} /> Report Issue
                      </button>
                    </>
                  )}
                  {del.status === "delivered" && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle size={14} /> Completed</span>
                  )}
                  {del.status === "issue" && (
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1"><ShieldAlert size={14} /> Under Review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Performance */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-[#0A1628]">Delivery Performance by Area</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Area</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">On-Time Rate</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Failed Attempts</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Avg Delivery Time</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {performanceData.map((p, i) => {
                const rateNum = parseInt(p.onTime);
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-[#0A1628]">{p.area}</td>
                    <td className="px-5 py-3 text-center">{p.onTime}</td>
                    <td className="px-5 py-3 text-center">{p.failed}</td>
                    <td className="px-5 py-3 text-center">{p.avgTime}</td>
                    <td className="px-5 py-3 text-center">
                      {rateNum >= 95 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Excellent</span>
                      ) : rateNum >= 90 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Good</span>
                      ) : rateNum >= 85 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Fair</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Needs Improvement</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
