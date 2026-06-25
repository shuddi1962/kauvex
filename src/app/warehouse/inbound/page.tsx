"use client";

import { useState } from "react";
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

const seedPlans: InboundPlan[] = [
  { id: "IP1", vendor: "TechGadgets NG", reference: "INB-2024-001", expectedUnits: 50, expectedDate: "2024-03-20", status: "pending" },
  { id: "IP2", vendor: "FashionHub Lagos", reference: "INB-2024-002", expectedUnits: 120, expectedDate: "2024-03-21", status: "in_transit" },
  { id: "IP3", vendor: "HomeEssentials Ltd", reference: "INB-2024-003", expectedUnits: 30, expectedDate: "2024-03-19", status: "arrived" },
  { id: "IP4", vendor: "ElectroWorld PLC", reference: "INB-2024-004", expectedUnits: 200, expectedDate: "2024-03-22", status: "pending" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_transit: "bg-blue-100 text-blue-700",
  arrived: "bg-green-100 text-green-700",
};

export default function WarehouseInboundPage() {
  const [plans, setPlans] = useState(seedPlans);
  const [receiving, setReceiving] = useState<ReceivingForm[]>([
    { sku: "WEB-001", expectedQty: 50, receivedQty: 48, damagedQty: 2, condition: "ok", notes: "" },
    { sku: "WEB-002", expectedQty: 30, receivedQty: 30, damagedQty: 0, condition: "ok", notes: "" },
    { sku: "BTS-003", expectedQty: 20, receivedQty: 18, damagedQty: 1, condition: "damaged", notes: "Box crushed on arrival" },
  ]);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const confirmReceipt = () => {
    setConfirmed(true);
    setPlans((prev) => prev.map((p) => p.id === activePlan ? { ...p, status: "arrived" as const } : p));
  };

  const inboundHistory = [
    { date: "2024-03-18", vendor: "TechGadgets NG", units: 100, discrepancies: 2, status: "confirmed" },
    { date: "2024-03-17", vendor: "FashionHub Lagos", units: 75, discrepancies: 0, status: "confirmed" },
    { date: "2024-03-15", vendor: "HomeEssentials Ltd", units: 50, discrepancies: 1, status: "confirmed" },
  ];

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
