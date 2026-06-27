"use client";

import { useState, useEffect } from "react";
import { Package, ClipboardList, ChevronRight, Scan, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface PickTask {
  id: string;
  orderId: string;
  product: string;
  sku: string;
  binLocation: string;
  qty: number;
  tier: string;
  priority: string;
  status: "pending" | "in_progress" | "picked";
}

interface PackTask {
  id: string;
  orderId: string;
  products: string[];
  tier: string;
  isGift: boolean;
  status: "pending" | "in_progress" | "packed";
}

const seedPickList: PickTask[] = [];
const seedPackQueue: PackTask[] = [];

const priorityColors: Record<string, string> = {
  express: "bg-red-100 text-red-700",
  premium: "bg-purple-100 text-purple-700",
  standard: "bg-gray-100 text-gray-600",
};

export default function WarehouseDashboard() {
  const [pickList, setPickList] = useState<PickTask[]>(seedPickList);
  const [packQueue, setPackQueue] = useState<PackTask[]>(seedPackQueue);
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/v1/warehouse/manager");
        const json = await res.json();
        if (json.data) {
          const pickTasks = (json.data.pickTasks || json.data.outbound || []).map((t: Record<string, unknown>) => ({
            id: String(t.id || t.task_id),
            orderId: String(t.order_id || t.orderId || "KAU-0000"),
            product: String(t.product_name || t.product || "Product"),
            sku: String(t.sku || "SKU-000"),
            binLocation: String(t.bin_location || t.bin || "A-01-1"),
            qty: Number(t.quantity || t.qty || 1),
            tier: String(t.tier || "A"),
            priority: String(t.priority || "standard"),
            status: (t.status || "pending") as PickTask["status"],
          }));
          if (pickTasks.length > 0) setPickList(pickTasks);

          const packTasks = (json.data.packTasks || json.data.packaging || []).map((t: Record<string, unknown>) => ({
            id: String(t.id || t.task_id),
            orderId: String(t.order_id || t.orderId || "KAU-0000"),
            products: Array.isArray(t.products) ? t.products : [String(t.product_name || "Product")],
            tier: String(t.tier || "A"),
            isGift: Boolean(t.is_gift),
            status: (t.status || "pending") as PackTask["status"],
          }));
          if (packTasks.length > 0) setPackQueue(packTasks);
        }
      } catch {
        // Use defaults
        setPickList([
          { id: "P1", orderId: "KAU-3921", product: "Wireless Earbuds Pro", sku: "WEB-001", binLocation: "A-12-3", qty: 2, tier: "A", priority: "express", status: "pending" },
          { id: "P2", orderId: "KAU-3922", product: "iPhone 15 Case", sku: "IPC-002", binLocation: "B-04-1", qty: 1, tier: "A", priority: "premium", status: "pending" },
          { id: "P3", orderId: "KAU-3923", product: "Men's Running Shoes", sku: "MRS-010", binLocation: "C-08-2", qty: 1, tier: "B", priority: "standard", status: "in_progress" },
        ]);
        setPackQueue([
          { id: "PK1", orderId: "KAU-3918", products: ["Leather Wallet"], tier: "A", isGift: true, status: "in_progress" },
          { id: "PK2", orderId: "KAU-3919", products: ["Yoga Mat", "Water Bottle"], tier: "A", isGift: false, status: "pending" },
        ]);
      }
    };
    fetchData();
  }, []);

  const updatePickStatus = (id: string, status: PickTask["status"]) => {
    setPickList((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const updatePackStatus = (id: string, status: PackTask["status"]) => {
    setPackQueue((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const checklistItems = [
    { label: "Select correct box size", key: "box" },
    { label: "Inner protection", key: "protection" },
    { label: "Place product in package", key: "place" },
    { label: "Tissue wrap", key: "tissue" },
    { label: "Insert packing slip", key: "slip" },
    { label: "Insert thank you card", key: "thankyou" },
    { label: "Add fragile sticker", key: "fragile" },
    { label: "Seal with tape", key: "seal" },
    { label: "Apply shipping label", key: "label" },
    { label: "Photo (high-value)", key: "photo" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#0A1628]">Today&apos;s Tasks</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-[#0A1628]">{pickList.filter(p => p.status === "pending").length}</div>
          <p className="text-sm text-gray-500">Pending Picks</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange">{pickList.filter(p => p.priority === "express" && p.status !== "picked").length}</div>
          <p className="text-sm text-gray-500">Express Priority</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">{packQueue.filter(p => p.status === "pending").length}</div>
          <p className="text-sm text-gray-500">To Pack</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{pickList.filter(p => p.status === "picked").length + packQueue.filter(p => p.status === "packed").length}</div>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
      </div>

      {/* Pick List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <ClipboardList size={16} className="text-[#FF6B00]" /> Pick List
          </h3>
          <span className="text-xs text-gray-400">Priority: Express → Premium → Standard</span>
        </div>
        <div className="divide-y divide-gray-100">
          {pickList.map((task) => (
            <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                task.status === "picked" ? "bg-green-100" : task.status === "in_progress" ? "bg-yellow-100" : "bg-gray-100"
              }`}>
                {task.status === "picked" ? <CheckCircle2 size={16} className="text-green-600" /> :
                 task.status === "in_progress" ? <Clock size={16} className="text-yellow-600" /> :
                 <Package size={16} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-[#0A1628]">{task.product}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                </div>
                <p className="text-xs text-gray-500">{task.orderId} • {task.sku} • Bin: {task.binLocation} • Qty: {task.qty}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                task.tier === "A" ? "bg-blue-50 text-blue-600" : task.tier === "B" ? "bg-purple-50 text-purple-600" : "bg-green-50 text-green-600"
              }`}>Tier {task.tier}</span>
              {task.status === "pending" && (
                <button onClick={() => updatePickStatus(task.id, "in_progress")} className="text-xs bg-[#FF6B00] text-white px-3 py-1.5 rounded-lg hover:bg-orange-600">
                  Start Picking
                </button>
              )}
              {task.status === "in_progress" && (
                <button onClick={() => updatePickStatus(task.id, "picked")} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                  <Scan size={12} className="inline mr-1" /> Scan & Confirm
                </button>
              )}
              {task.status === "picked" && (
                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Picked</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Packing Queue */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-[#0A1628] flex items-center gap-2">
            <Package size={16} className="text-[#FF6B00]" /> Packing Queue
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {packQueue.map((task) => (
            <div key={task.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">{task.orderId}</p>
                  <p className="text-xs text-gray-500">{task.products.join(", ")} • Tier {task.tier} {task.isGift ? "🎁 Gift" : ""}</p>
                </div>
                {task.status === "pending" && (
                  <button onClick={() => { setActiveChecklist(task.id); updatePackStatus(task.id, "in_progress"); }} className="text-xs bg-[#FF6B00] text-white px-3 py-1.5 rounded-lg">
                    Start Packing
                  </button>
                )}
                {task.status === "packed" && <span className="text-xs text-green-600"><CheckCircle2 size={12} className="inline mr-1" /> Packed</span>}
              </div>
              {activeChecklist === task.id && task.status === "in_progress" && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                  {checklistItems.map((item) => (
                    <label key={item.key} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      {item.label}
                    </label>
                  ))}
                  <button onClick={() => { updatePackStatus(task.id, "packed"); setActiveChecklist(null); }} className="mt-2 text-xs bg-green-600 text-white px-4 py-1.5 rounded-lg">
                    Mark Packed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
