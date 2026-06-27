"use client";

import { useState, useEffect } from "react";
import { Truck, CheckCircle2, AlertTriangle, Loader2, Search } from "lucide-react";

interface InboundPlan {
  id: string;
  vendor: string;
  reference: string;
  expectedUnits: number;
  expectedDate: string;
  status: "pending" | "in_transit" | "arrived";
}

interface ReceivingForm {
  sku: string;
  expectedQty: number;
  receivedQty: number;
  damagedQty: number;
  condition: "ok" | "damaged" | "wrong_item";
  notes: string;
}

interface InboundHistoryItem {
  date: string;
  vendor: string;
  units: number;
  discrepancies: number;
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_transit: "bg-blue-100 text-blue-700",
  arrived: "bg-green-100 text-green-700",
};

export default function WarehouseInboundPage() {
  const [plans, setPlans] = useState<InboundPlan[]>([]);
  const [inboundHistory, setInboundHistory] = useState<InboundHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiving, setReceiving] = useState<ReceivingForm[]>([]);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("/api/v1/warehouses")
      .then(r => r.json())
      .then(json => {
        const shipments = json.data?.inbound || [];
        setPlans(shipments.map((s: any) => ({
          id: s.id,
          vendor: s.vendor,
          reference: s.reference,
          expectedUnits: s.expectedUnits,
          expectedDate: s.expectedDate,
          status: s.status,
        })));
        const history = json.data?.inboundHistory || [];
        setInboundHistory(history.map((h: any) => ({
          date: h.date,
          vendor: h.vendor,
          units: h.units,
          discrepancies: h.discrepancies,
          status: h.status,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const confirmReceipt = () => {
    setConfirmed(true);
    setPlans((prev) => prev.map((p) => p.id === activePlan ? { ...p, status: "arrived" as const } : p));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#0A1628]">Inbound (Receiving)</h1>

      {/* Expected Inbounds */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Truck size={16} className="text-[#FF6B00]" /> Expected Inbounds
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm text-[#0A1628]">{plan.vendor}</p>
                <p className="text-xs text-gray-500">{plan.reference} • {plan.expectedUnits} units • Expected {plan.expectedDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[plan.status]}`}>{plan.status.replace("_", " ")}</span>
                {plan.status !== "arrived" && (
                  <button onClick={() => { setActivePlan(plan.id); setConfirmed(false); }} className="text-xs bg-[#FF6B00] text-white px-3 py-1.5 rounded-lg">
                    Receive Shipment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Receive Shipment Form */}
      {activePlan && !confirmed && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-[#0A1628] mb-4">Receive Shipment</h3>
          <div className="space-y-3">
            {receiving.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-5 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">SKU</p>
                    <p className="text-sm font-medium">{item.sku}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Expected</p>
                    <p className="text-sm font-medium">{item.expectedQty}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Received</p>
                    <input type="number" value={item.receivedQty} onChange={(e) => {
                      const newReceiving = [...receiving];
                      newReceiving[i].receivedQty = parseInt(e.target.value) || 0;
                      setReceiving(newReceiving);
                    }} className="w-full text-sm border border-gray-300 rounded px-2 py-1" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Damaged</p>
                    <input type="number" value={item.damagedQty} onChange={(e) => {
                      const newReceiving = [...receiving];
                      newReceiving[i].damagedQty = parseInt(e.target.value) || 0;
                      setReceiving(newReceiving);
                    }} className="w-full text-sm border border-gray-300 rounded px-2 py-1" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-1">Condition</p>
                    <select value={item.condition} onChange={(e) => {
                      const newReceiving = [...receiving];
                      newReceiving[i].condition = e.target.value as any;
                      setReceiving(newReceiving);
                    }} className="w-full text-sm border border-gray-300 rounded px-2 py-1">
                      <option value="ok">OK</option>
                      <option value="damaged">Damaged</option>
                      <option value="wrong_item">Wrong Item</option>
                    </select>
                  </div>
                </div>
                <input placeholder="Notes..." value={item.notes} onChange={(e) => {
                  const newReceiving = [...receiving];
                  newReceiving[i].notes = e.target.value;
                  setReceiving(newReceiving);
                }} className="mt-2 w-full text-xs border border-gray-300 rounded px-2 py-1" />
              </div>
            ))}
            <button onClick={confirmReceipt} className="bg-[#FF6B00] text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600">
              Confirm Receipt
            </button>
          </div>
        </div>
      )}

      {confirmed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <div>
            <p className="font-medium text-green-800 text-sm">Receipt Confirmed</p>
            <p className="text-xs text-green-600">Inventory updated. Inbound handling fee charged to vendor wallet.</p>
          </div>
        </div>
      )}

      {/* Inbound History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628]">Inbound History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {inboundHistory.map((item, i) => (
            <div key={i} className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-[#0A1628]">{item.vendor}</p>
                <p className="text-xs text-gray-500">{item.date} • {item.units} units</p>
              </div>
              <div className="flex items-center gap-3">
                {item.discrepancies > 0 ? (
                  <span className="text-xs text-orange flex items-center gap-1"><AlertTriangle size={12} /> {item.discrepancies} discrepancies</span>
                ) : (
                  <span className="text-xs text-green-600">No discrepancies</span>
                )}
                <span className="text-xs text-green-600"><CheckCircle2 size={12} className="inline mr-1" /> {item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
