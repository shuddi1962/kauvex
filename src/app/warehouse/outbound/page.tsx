"use client";

import { useState } from "react";
import { Package, Scan, CheckCircle2, Truck, Printer, Download, Loader2 } from "lucide-react";

interface DispatchItem {
  id: string;
  orderId: string;
  tier: string;
  destination: string;
  carrier: string;
  weight: string;
  status: "staged" | "handed" | "dispatched";
}

const seedDispatch: DispatchItem[] = [
  { id: "D1", orderId: "KAU-3918", tier: "A", destination: "Lagos, Ikeja", carrier: "GIG", weight: "0.5kg", status: "staged" },
  { id: "D2", orderId: "KAU-3919", tier: "A", destination: "Abuja, Wuse", carrier: "Kauvex Rider", weight: "1.2kg", status: "staged" },
  { id: "D3", orderId: "KAU-3920", tier: "B", destination: "Port Harcourt", carrier: "DHL", weight: "0.8kg", status: "staged" },
  { id: "D4", orderId: "KAU-3915", tier: "A", destination: "Lagos, VI", carrier: "Kauvex Rider", weight: "2.0kg", status: "handed" },
  { id: "D5", orderId: "KAU-3910", tier: "A", destination: "Ibadan", carrier: "GIG", weight: "1.5kg", status: "dispatched" },
];

export default function WarehouseOutboundPage() {
  const [dispatch, setDispatch] = useState(seedDispatch);
  const [showQR, setShowQR] = useState<string | null>(null);

  const updateStatus = (id: string, status: DispatchItem["status"]) => {
    setDispatch((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  const staged = dispatch.filter(d => d.status === "staged");
  const handed = dispatch.filter(d => d.status === "handed");
  const dispatched = dispatch.filter(d => d.status === "dispatched");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#0A1628]">Outbound (Dispatch)</h1>

      {/* End of Day Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#0A1628]">{staged.length}</div>
          <p className="text-sm text-gray-500">Staged</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange">{handed.length}</div>
          <p className="text-sm text-gray-500">Handed to Rider</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{dispatched.length}</div>
          <p className="text-sm text-gray-500">Dispatched Today</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{dispatch.length}</div>
          <p className="text-sm text-gray-500">Total Today</p>
        </div>
      </div>

      {/* Dispatch Queue */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Package size={16} className="text-[#FF6B00]" /> Dispatch Queue
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {dispatch.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                item.status === "dispatched" ? "bg-green-100" : item.status === "handed" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                {item.status === "dispatched" ? <CheckCircle2 size={16} className="text-green-600" /> :
                 item.status === "handed" ? <Truck size={16} className="text-blue-600" /> :
                 <Package size={16} className="text-gray-400" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-[#0A1628]">{item.orderId}</p>
                <p className="text-xs text-gray-500">{item.destination} • {item.weight} • {item.carrier}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                item.tier === "A" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
              }`}>Tier {item.tier}</span>
              {item.status === "staged" && (
                <div className="flex gap-2">
                  <button onClick={() => { setShowQR(item.id); }} className="text-xs bg-[#FF6B00] text-white px-3 py-1.5 rounded-lg hover:bg-orange-600">
                    <Scan size={12} className="inline mr-1" /> Hand to Rider
                  </button>
                  <button onClick={() => updateStatus(item.id, "dispatched")} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                    <Truck size={12} className="inline mr-1" /> Carrier Pickup
                  </button>
                </div>
              )}
              {item.status === "handed" && (
                <span className="text-xs text-blue-600 flex items-center gap-1"><Truck size={12} /> With Rider</span>
              )}
              {item.status === "dispatched" && (
                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Dispatched</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <h3 className="font-semibold mb-4 text-center">Scan Job QR</h3>
            <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
              <div className="w-40 h-40 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">Ask the rider to scan this QR code to confirm handover</p>
            <button onClick={() => { updateStatus(showQR, "handed"); setShowQR(null); }} className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700">
              Confirm Handover
            </button>
            <button onClick={() => setShowQR(null)} className="w-full text-gray-500 py-2 text-sm mt-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
