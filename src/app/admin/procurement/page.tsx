"use client";

import { useState } from "react";
import {
  ShoppingCart, ClipboardList, Plus, CheckCircle2, Clock, Truck, X, Save,
  Search, Filter, Eye, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const poTabs = [
  { id: "pos", label: "Purchase Orders" },
  { id: "create", label: "Create PO" },
  { id: "history", label: "Received History" },
];

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: string;
  status: "draft" | "pending_approval" | "approved" | "confirmed" | "received";
  order_date: string;
  total_cost: number;
  payment_status: "unpaid" | "partial" | "paid";
  items: number;
}

interface ReceivedPO {
  id: string;
  po_number: string;
  supplier: string;
  received_date: string;
  items_received: number;
  items_expected: number;
  total_cost: number;
  carrier: string;
  tracking: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_approval: "bg-yellow-50 text-yellow-700",
  approved: "bg-blue-50 text-blue",
  confirmed: "bg-green-50 text-green-700",
  received: "bg-emerald-50 text-emerald-700",
};

const paymentColors: Record<string, string> = {
  unpaid: "bg-red-50 text-red",
  partial: "bg-orange-50 text-orange",
  paid: "bg-green-50 text-green-700",
};

const seedPOs: PurchaseOrder[] = [
  { id: "1", po_number: "PO-2026-0101", supplier: "Shenzhen Electronics Co", status: "received", order_date: "2026-05-20", total_cost: 4580000, payment_status: "paid", items: 12 },
  { id: "2", po_number: "PO-2026-0102", supplier: "Berlin Precision Parts GmbH", status: "confirmed", order_date: "2026-05-28", total_cost: 2850000, payment_status: "partial", items: 5 },
  { id: "3", po_number: "PO-2026-0103", supplier: "Lagos Wholesale Mart", status: "approved", order_date: "2026-06-01", total_cost: 890000, payment_status: "unpaid", items: 3 },
  { id: "4", po_number: "PO-2026-0104", supplier: "Dubai Traders FZE", status: "pending_approval", order_date: "2026-06-03", total_cost: 6200000, payment_status: "unpaid", items: 8 },
  { id: "5", po_number: "PO-2026-0105", supplier: "Hangzhou Textile Group", status: "draft", order_date: "2026-06-05", total_cost: 1750000, payment_status: "unpaid", items: 6 },
  { id: "6", po_number: "PO-2026-0106", supplier: "Accra Logistics Supply", status: "received", order_date: "2026-05-15", total_cost: 1200000, payment_status: "paid", items: 4 },
  { id: "7", po_number: "PO-2026-0107", supplier: "Newark Chemical Corp", status: "confirmed", order_date: "2026-06-02", total_cost: 3900000, payment_status: "unpaid", items: 7 },
  { id: "8", po_number: "PO-2026-0108", supplier: "Mumbai Pharma Ltd", status: "approved", order_date: "2026-06-07", total_cost: 2100000, payment_status: "partial", items: 5 },
  { id: "9", po_number: "PO-2026-0109", supplier: "Johannesburg Steel Mills", status: "pending_approval", order_date: "2026-06-08", total_cost: 8750000, payment_status: "unpaid", items: 10 },
  { id: "10", po_number: "PO-2026-0110", supplier: "Tokyo Components Inc", status: "draft", order_date: "2026-06-10", total_cost: 1450000, payment_status: "unpaid", items: 3 },
];

const seedReceived: ReceivedPO[] = [
  { id: "1", po_number: "PO-2026-0095", supplier: "Shenzhen Electronics Co", received_date: "2026-05-25", items_received: 15, items_expected: 15, total_cost: 5200000, carrier: "DHL Express", tracking: "DHL-NG-89521" },
  { id: "2", po_number: "PO-2026-0098", supplier: "Dubai Traders FZE", received_date: "2026-05-28", items_received: 8, items_expected: 8, total_cost: 3800000, carrier: "FedEx", tracking: "FX-44678-K" },
  { id: "3", po_number: "PO-2026-0101", supplier: "Shenzhen Electronics Co", received_date: "2026-06-02", items_received: 12, items_expected: 12, total_cost: 4580000, carrier: "Maersk Line", tracking: "MAEU-784512" },
  { id: "4", po_number: "PO-2026-0099", supplier: "Accra Logistics Supply", received_date: "2026-05-30", items_received: 4, items_expected: 6, total_cost: 1800000, carrier: "Kuehne+Nagel", tracking: "KN-99012" },
  { id: "5", po_number: "PO-2026-0096", supplier: "Berlin Precision Parts GmbH", received_date: "2026-05-22", items_received: 5, items_expected: 5, total_cost: 2150000, carrier: "DHL Express", tracking: "DHL-EU-33217" },
  { id: "6", po_number: "PO-2026-0100", supplier: "Lagos Wholesale Mart", received_date: "2026-06-01", items_received: 3, items_expected: 3, total_cost: 750000, carrier: "Local Courier", tracking: "LC-88234" },
  { id: "7", po_number: "PO-2026-0097", supplier: "Newark Chemical Corp", received_date: "2026-05-20", items_received: 7, items_expected: 10, total_cost: 4250000, carrier: "Maersk Line", tracking: "MAEU-774210" },
  { id: "8", po_number: "PO-2026-0106", supplier: "Accra Logistics Supply", received_date: "2026-06-05", items_received: 4, items_expected: 4, total_cost: 1200000, carrier: "FedEx", tracking: "FX-55123-K" },
];

const supplierOptions = [
  "Shenzhen Electronics Co", "Berlin Precision Parts GmbH", "Lagos Wholesale Mart",
  "Dubai Traders FZE", "Hangzhou Textile Group", "Accra Logistics Supply",
  "Newark Chemical Corp", "Mumbai Pharma Ltd", "Johannesburg Steel Mills",
  "Tokyo Components Inc",
];

const formatCurrency = (val: number) => `₦${(val / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState("pos");
  const [pos] = useState<PurchaseOrder[]>(seedPOs);
  const [received] = useState<ReceivedPO[]>(seedReceived);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [poForm, setPoForm] = useState({
    supplier: "",
    items: [{ product: "", qty: 1, unit_cost: 0 }],
    delivery_date: "",
    notes: "",
  });

  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredPOs = pos.filter((po) => {
    const matchStatus = filterStatus === "all" || po.status === filterStatus;
    const matchSearch = po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPOValue = pos.reduce((s, p) => s + p.total_cost, 0);
  const pendingCount = pos.filter((p) => p.status === "pending_approval" || p.status === "approved").length;
  const receivedCount = pos.filter((p) => p.status === "received").length;

  const addLineItem = () => {
    setPoForm({ ...poForm, items: [...poForm.items, { product: "", qty: 1, unit_cost: 0 }] });
  };

  const removeLineItem = (idx: number) => {
    setPoForm({ ...poForm, items: poForm.items.filter((_, i) => i !== idx) });
  };

  const updateLineItem = (idx: number, field: string, value: string | number) => {
    const items = [...poForm.items];
    items[idx] = { ...items[idx], [field]: value };
    setPoForm({ ...poForm, items });
  };

  const poTotal = poForm.items.reduce((s, item) => s + item.qty * item.unit_cost, 0);

  return (
    <AdminShell title="Procurement" subtitle="Purchase Orders & Procurement Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Procurement</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setShowCreatePO(true); }}>
              <Plus size={14} className="mr-1" /> Create PO
            </Button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {poTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total POs", value: String(pos.length), icon: ShoppingCart, color: "bg-blue-50 text-blue" },
            { label: "Total Value", value: formatCurrency(totalPOValue), icon: ClipboardList, color: "bg-purple-50 text-purple-700" },
            { label: "Pending Orders", value: String(pendingCount), icon: Clock, color: "bg-yellow-50 text-yellow-700" },
            { label: "Received", value: String(receivedCount), icon: CheckCircle2, color: "bg-green-50 text-green-700" },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-4">
                <div className={`w-9 h-9 rounded-lg ${kpi.color} flex items-center justify-center mb-2`}><Icon size={16} /></div>
                <p className="text-xl font-bold text-text-1">{kpi.value}</p>
                <p className="text-xs text-text-4">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {/* Purchase Orders */}
        {activeTab === "pos" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1">All Purchase Orders</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search POs..." className="w-44 h-8 pl-8 pr-3 rounded-lg border border-border text-xs focus:outline-none focus:border-blue" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-8 px-2 rounded-lg border border-border text-xs bg-white">
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="received">Received</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">PO #</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Supplier</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Date</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Items</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Total</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Payment</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-text-1">{po.po_number}</td>
                      <td className="px-5 py-3 text-text-2">{po.supplier}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[po.status]}`}>
                          {po.status === "received" ? "✓ " : ""}{po.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-text-4">{po.order_date}</td>
                      <td className="px-5 py-3 text-center text-text-2">{po.items}</td>
                      <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(po.total_cost)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${paymentColors[po.payment_status]}`}>{po.payment_status}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create PO */}
        {activeTab === "create" && (
          <div className="bg-white rounded-xl border border-border p-6 max-w-3xl">
            <h3 className="font-semibold text-text-1 mb-6">New Purchase Order</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Supplier</label>
                <select value={poForm.supplier} onChange={(e) => setPoForm({ ...poForm, supplier: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white focus:outline-none focus:border-blue">
                  <option value="">Select supplier...</option>
                  {supplierOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-2">Line Items</label>
                  <button onClick={addLineItem} className="text-xs text-blue hover:underline flex items-center gap-1"><Plus size={12} /> Add Item</button>
                </div>
                {poForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] text-text-4 mb-0.5 block">Product</label>
                      <input value={item.product} onChange={(e) => updateLineItem(idx, "product", e.target.value)} placeholder="SKU or product name" className="w-full h-9 px-3 rounded-lg border border-border text-xs focus:outline-none focus:border-blue" />
                    </div>
                    <div className="w-20">
                      <label className="text-[10px] text-text-4 mb-0.5 block">Qty</label>
                      <input type="number" min={1} value={item.qty} onChange={(e) => updateLineItem(idx, "qty", +e.target.value)} className="w-full h-9 px-2 rounded-lg border border-border text-xs focus:outline-none focus:border-blue" />
                    </div>
                    <div className="w-28">
                      <label className="text-[10px] text-text-4 mb-0.5 block">Unit Cost (₦)</label>
                      <input type="number" min={0} value={item.unit_cost} onChange={(e) => updateLineItem(idx, "unit_cost", +e.target.value)} className="w-full h-9 px-2 rounded-lg border border-border text-xs focus:outline-none focus:border-blue" />
                    </div>
                    <div className="w-20 pt-5">
                      <span className="text-xs font-semibold text-text-1">₦{(item.qty * item.unit_cost).toLocaleString()}</span>
                    </div>
                    {poForm.items.length > 1 && (
                      <button onClick={() => removeLineItem(idx)} className="p-2 text-text-4 hover:text-red"><X size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-text-1">PO Total</span>
                <span className="text-lg font-bold text-blue">{formatCurrency(poTotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Expected Delivery</label>
                  <input type="date" value={poForm.delivery_date} onChange={(e) => setPoForm({ ...poForm, delivery_date: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" /></div>
              </div>
              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Notes</label>
                <textarea value={poForm.notes} onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })} className="w-full h-20 px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none focus:border-blue" /></div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">Save as Draft</Button>
                <Button className="flex-1" disabled={!poForm.supplier || poForm.items.some((i) => !i.product)}>
                  <Save size={14} className="mr-1" /> Submit for Approval
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Received History */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><Truck size={18} /> Received History</h3>
              <Button size="sm" variant="outline" className="gap-1.5"><Download size={14} /> Export</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">PO #</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Supplier</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Received Date</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Items</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Total Cost</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Carrier</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Tracking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {received.map((r) => {
                    const missing = r.items_expected - r.items_received;
                    return (
                      <tr key={r.id} className="hover:bg-off-white transition-colors">
                        <td className="px-5 py-3 font-mono text-xs font-medium text-text-1">{r.po_number}</td>
                        <td className="px-5 py-3 text-text-2">{r.supplier}</td>
                        <td className="px-5 py-3 text-center text-text-4">{r.received_date}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`font-medium ${missing > 0 ? "text-orange" : "text-green-700"}`}>{r.items_received}/{r.items_expected}</span>
                          {missing > 0 && <span className="text-[10px] text-orange ml-1">({missing} pending)</span>}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-text-1">{formatCurrency(r.total_cost)}</td>
                        <td className="px-5 py-3 text-text-3">{r.carrier}</td>
                        <td className="px-5 py-3 font-mono text-xs text-text-4">{r.tracking}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
