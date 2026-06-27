"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Package, Truck, MapPin, CheckCircle2, Navigation, Search, Loader2 } from "lucide-react";

interface TimelineStep {
  label: string;
  date: string;
  completed: boolean;
  active?: boolean;
}

interface ShipmentData {
  orderNumber: string;
  sender: string;
  senderAddress: string;
  receiver: string;
  receiverAddress: string;
  contents: string;
  declaredValue: string;
  weight: string;
  serviceLevel: string;
  status: string;
  estimatedDelivery: string;
  lastUpdated: string;
  carrier: string;
  timeline: TimelineStep[];
}

const fallbackShipments: Record<string, ShipmentData> = {
  "KVX-EXP-8294": {
    orderNumber: "Kauvex Express",
    sender: "John Doe",
    senderAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
    receiver: "Jane Smith",
    receiverAddress: "45 Aminu Kano Crescent, Wuse 2, Abuja",
    contents: "Documents & Electronics",
    declaredValue: "₦150,000",
    weight: "2.5 kg",
    serviceLevel: "Express Same-Day",
    status: "in_transit",
    estimatedDelivery: "Today by 8PM",
    lastUpdated: "30 mins ago",
    carrier: "Kauvex Express",
    timeline: [
      { label: "Parcel picked up from sender", date: "Mar 20, 10:15 AM", completed: true },
      { label: "Arrived at Lagos hub", date: "Mar 20, 11:30 AM", completed: true },
      { label: "Departed Lagos hub", date: "Mar 20, 1:00 PM", completed: true },
      { label: "Arrived at Abuja hub", date: "Mar 20, 5:30 PM", completed: false, active: true },
      { label: "Out for delivery in Abuja", date: "—", completed: false },
      { label: "Delivered", date: "—", completed: false },
    ],
  },
};

const STATUS_MAP: Record<string, { label: string; emoji: string }> = {
  pending: { label: "Pending Pickup", emoji: "📦" },
  picked_up: { label: "Picked Up", emoji: "✅" },
  in_transit: { label: "In Transit", emoji: "🚚" },
  out_for_delivery: { label: "Out for Delivery", emoji: "🚴" },
  delivered: { label: "Delivered", emoji: "✅" },
  failed: { label: "Delivery Failed", emoji: "❌" },
  returned: { label: "Returned", emoji: "↩️" },
  customs: { label: "In Customs", emoji: "⚠️" },
};

export default function PublicTrackingPage() {
  const params = useParams();
  const trackingNumber = (params.trackingNumber as string)?.toUpperCase() || "";
  const [manualTrack, setManualTrack] = useState("");
  const [shipment, setShipment] = useState<ShipmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchShipment = useCallback(async (waybill: string) => {
    if (!waybill) return;
    setLoading(true);
    setError("");
    setShipment(null);

    try {
      const res = await fetch(`/api/v1/express/tracking?waybillNumber=${encodeURIComponent(waybill)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.waybillNumber) {
          const timeline: TimelineStep[] = [];
          if (data.events && Array.isArray(data.events)) {
            for (const evt of data.events) {
              timeline.push({
                label: evt.description || evt.status?.replace(/_/g, " ") || "Event",
                date: evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "—",
                completed: evt.statusType === "completed",
                active: evt.statusType === "in_progress",
              });
            }
          } else {
            const statusOrder = ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered"];
            const currentIdx = statusOrder.indexOf(data.status || "pending");
            statusOrder.forEach((s, i) => {
              timeline.push({
                label: STATUS_MAP[s]?.label || s,
                date: i <= currentIdx ? (i === currentIdx ? "Current" : "Completed") : "Pending",
                completed: i < currentIdx,
                active: i === currentIdx,
              });
            });
          }

          setShipment({
            orderNumber: data.carrierUsed || "Kauvex Express",
            sender: data.senderName || "Sender",
            senderAddress: data.pickupAddress || "Pickup address",
            receiver: data.receiverName || "Receiver",
            receiverAddress: data.dropoffAddress || "Dropoff address",
            contents: "Shipment contents",
            declaredValue: data.pricePaid ? `${data.currency || "₦"}${data.pricePaid.toLocaleString()}` : "—",
            weight: data.weightKg ? `${data.weightKg} kg` : "—",
            serviceLevel: data.serviceLevel || "Standard",
            status: data.status || "pending",
            estimatedDelivery: "Estimated delivery pending",
            lastUpdated: "just now",
            carrier: data.carrierUsed || "Kauvex Express",
            timeline,
          });
        } else {
          const fallback = fallbackShipments[waybill];
          if (fallback) {
            setShipment(fallback);
          } else {
            setError("No shipment found with this tracking number.");
          }
        }
      } else {
        const fallback = fallbackShipments[waybill];
        if (fallback) {
          setShipment(fallback);
        } else {
          setError("No shipment found with this tracking number.");
        }
      }
    } catch {
      const fallback = fallbackShipments[waybill];
      if (fallback) {
        setShipment(fallback);
      } else {
        setError("Unable to track this shipment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (trackingNumber) {
      fetchShipment(trackingNumber);
    }
  }, [trackingNumber, fetchShipment]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTrack.trim()) {
      fetchShipment(manualTrack.trim().toUpperCase());
    }
  };

  const getStatusInfo = (status: string) => {
    const s = STATUS_MAP[status] || { label: status?.replace(/_/g, " ") || "Unknown", emoji: "📦" };
    return s;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-[#FF6B00]" />
            <span className="font-bold text-sm">Kauvex Express Tracking</span>
          </div>
          <form onSubmit={handleTrack} className="flex gap-2">
            <input
              value={manualTrack || trackingNumber}
              onChange={(e) => setManualTrack(e.target.value)}
              placeholder="Enter tracking number (e.g. KEX-2024-1234567)"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-black"
            />
            <button type="submit" disabled={loading} className="bg-[#FF6B00] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="inline mr-1 animate-spin" /> : <Search size={16} className="inline mr-1" />}
              Track
            </button>
          </form>
        </div>
      </div>

      {loading && (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Loader2 size={32} className="animate-spin text-[#FF6B00] mx-auto mb-3" />
            <p className="text-sm text-gray-500">Tracking your shipment...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Search size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-medium text-gray-700 mb-1">{error}</h3>
            <p className="text-sm text-gray-500">Check the tracking number and try again</p>
          </div>
        </div>
      )}

      {!loading && !error && !shipment && (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Search size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-medium text-gray-700 mb-1">Enter a tracking number</h3>
            <p className="text-sm text-gray-500">Enter your Kauvex Express waybill number to track your shipment</p>
          </div>
        </div>
      )}

      {!loading && shipment && (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                <Truck size={24} className="text-[#FF6B00]" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-[#0A1628]">{getStatusInfo(shipment.status).label}</h2>
                <p className="text-sm text-gray-500">{shipment.estimatedDelivery}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Tracking #: {trackingNumber || manualTrack} • Last updated: {shipment.lastUpdated}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4">Tracking Timeline</h3>
            <div className="space-y-0">
              {shipment.timeline.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      step.completed ? "bg-green-500" : step.active ? "bg-[#FF6B00]" : "bg-gray-200"
                    }`}>
                      {step.completed && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    {i < shipment.timeline.length - 1 && (
                      <div className={`w-0.5 h-7 ${step.completed ? "bg-green-200" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className={`pb-5 ${step.active ? "" : step.completed ? "" : "opacity-40"}`}>
                    <p className={`text-sm ${step.active ? "text-[#FF6B00] font-medium" : "text-gray-700"}`}>{step.label}</p>
                    <p className="text-xs text-gray-400">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-3">Shipment Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="text-sm font-medium text-[#0A1628]">{shipment.sender}</p>
                  <p className="text-xs text-gray-500">{shipment.senderAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-[#FF6B00] mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">To</p>
                  <p className="text-sm font-medium text-[#0A1628]">{shipment.receiver}</p>
                  <p className="text-xs text-gray-500">{shipment.receiverAddress}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div><p className="text-[10px] text-gray-500">Contents</p><p className="text-sm">{shipment.contents}</p></div>
                <div><p className="text-[10px] text-gray-500">Declared Value</p><p className="text-sm">{shipment.declaredValue}</p></div>
                <div><p className="text-[10px] text-gray-500">Weight</p><p className="text-sm">{shipment.weight}</p></div>
                <div><p className="text-[10px] text-gray-500">Service</p><p className="text-sm">{shipment.serviceLevel}</p></div>
                <div><p className="text-[10px] text-gray-500">Carrier</p><p className="text-sm">{shipment.carrier}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
