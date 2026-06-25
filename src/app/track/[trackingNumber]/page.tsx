"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Package, Truck, MapPin, CheckCircle2, Navigation, Search, ChevronRight } from "lucide-react";

const mockShipments: Record<string, any> = {
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

export default function PublicTrackingPage() {
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;
  const [manualTrack, setManualTrack] = useState("");
  const [shipment, setShipment] = useState(mockShipments[trackingNumber] || null);

  const handleTrack = () => {
    const found = mockShipments[manualTrack.toUpperCase()];
    if (found) {
      setShipment(found);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1628] text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-[#FF6B00]" />
            <span className="font-bold text-sm">Kauvex Express Tracking</span>
          </div>
          <div className="flex gap-2">
            <input
              value={manualTrack || trackingNumber}
              onChange={(e) => setManualTrack(e.target.value)}
              placeholder="Enter tracking number..."
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-black"
            />
            <button onClick={handleTrack} className="bg-[#FF6B00] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600">
              <Search size={16} className="inline mr-1" /> Track
            </button>
          </div>
        </div>
      </div>

      {shipment ? (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center">
                <Truck size={24} className="text-orange" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-[#0A1628]">In Transit</h2>
                <p className="text-sm text-gray-500">Expected {shipment.estimatedDelivery}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Tracking #: {trackingNumber} • Last updated: {shipment.lastUpdated}</p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-sm text-[#0A1628] mb-4">Tracking Timeline</h3>
            <div className="space-y-0">
              {shipment.timeline.map((step: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      step.completed ? "bg-green-500" : step.active ? "bg-orange" : "bg-gray-200"
                    }`}>
                      {step.completed && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    {i < shipment.timeline.length - 1 && (
                      <div className={`w-0.5 h-7 ${step.completed ? "bg-green-200" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className={`pb-5 ${step.active ? "" : step.completed ? "" : "opacity-40"}`}>
                    <p className={`text-sm ${step.active ? "text-orange font-medium" : "text-gray-700"}`}>{step.label}</p>
                    <p className="text-xs text-gray-400">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
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
                <MapPin size={14} className="text-orange mt-0.5" />
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
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Search size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-medium text-gray-700 mb-1">Enter a tracking number</h3>
            <p className="text-sm text-gray-500">Enter your Kauvex Express waybill number to track your shipment</p>
          </div>
        </div>
      )}
    </div>
  );
}
