"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Warehouse,
  Truck,
  DollarSign,
  CalendarDays,
  Plus,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Clock,
  FileText,
  ChevronDown,
  Bell,
  Store,
  TrendingUp,
  BarChart3,
  MapPin,
  BoxesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type FbkStatus = "not_enrolled" | "pending" | "active" | "suspended";

const FBK_STATUS: FbkStatus = "not_enrolled";

const FBK_BENEFITS = [
  { icon: Warehouse, title: "KAUVEX Storage", desc: "Store your products in our warehouses across the country" },
  { icon: Truck, title: "Fast Delivery", desc: "1-3 day delivery to major cities" },
  { icon: TrendingUp, title: "Boosted Visibility", desc: "Products marked 'Fulfilled by KAUVEX' rank higher" },
  { icon: DollarSign, title: "Lower Shipping Costs", desc: "Bulk shipping rates at 40% less than retail" },
  { icon: Check, title: "Quality Check", desc: "Every item inspected before dispatch" },
  { icon: Clock, title: "24/7 Fulfillment", desc: "Orders processed around the clock" },
];

const FEE_SCHEDULE = [
  { service: "Storage (per cu. ft/month)", fee: "$0.85", notes: "Standard items" },
  { service: "Storage (oversized)", fee: "$1.50", notes: "Over 18\" on any side" },
  { service: "Pick & Pack", fee: "$1.20", notes: "Per unit" },
  { service: "Standard Shipping", fee: "$3.50", notes: "Up to 5kg, local" },
  { service: "Express Shipping", fee: "$6.00", notes: "Next day, up to 5kg" },
  { service: "Returns Processing", fee: "$2.00", notes: "Per returned item" },
  { service: "Label Printing", fee: "$0.25", notes: "Per label" },
  { service: "Monthly Storage Report", fee: "Free", notes: "Included" },
];

const warehouses = [
  { id: "warehouse_1", name: "Lagos Main Hub", location: "Ikeja, Lagos", capacity: "85%", status: "active" },
  { id: "warehouse_2", name: "Abuja Distribution", location: "Central Area, Abuja", capacity: "62%", status: "active" },
  { id: "warehouse_3", name: "Port Harcourt", location: "PHC, Rivers", capacity: "45%", status: "active" },
];

const inboundPlans = [
  {
    id: "IP-001",
    warehouse: "Lagos Main Hub",
    products: [
      { name: "Yamaha F150 Outboard", qty: 10 },
      { name: "Marine LED Nav Kit", qty: 25 },
    ],
    totalUnits: 35,
    estimatedArrival: "2026-06-20",
    status: "in_transit",
    createdAt: "2026-06-10",
  },
  {
    id: "IP-002",
    warehouse: "Abuja Distribution",
    products: [{ name: "Bilge Pump 2000 GPH", qty: 50 }],
    totalUnits: 50,
    estimatedArrival: "2026-06-25",
    status: "processing",
    createdAt: "2026-06-12",
  },
];

const statusColors: Record<string, string> = {
  in_transit: "bg-blue-100 text-blue-600",
  processing: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const storeProducts = [
  { id: "p1", name: "Yamaha F150 Outboard Engine", sku: "YAM-F150" },
  { id: "p2", name: "Marine LED Navigation Kit", sku: "LED-NAV-01" },
  { id: "p3", name: "Bilge Pump 2000 GPH", sku: "BLG-2000" },
  { id: "p4", name: "Marine GPS Chartplotter", sku: "GPS-7" },
];

export default function FbkPage() {
  const [enrollmentStatus] = useState<FbkStatus>(FBK_STATUS);
  const [showInboundForm, setShowInboundForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [inboundForm, setInboundForm] = useState({
    warehouse: "",
    estimatedArrival: "",
    products: [{ productId: "", quantity: 1 }],
  });

  const handleEnroll = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setProcessing(false);
    alert("FBK enrollment submitted! We'll review your application within 48 hours.");
  };

  const handleCreateInbound = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setProcessing(false);
    setShowInboundForm(false);
    setInboundForm({ warehouse: "", estimatedArrival: "", products: [{ productId: "", quantity: 1 }] });
  };

  const addProductRow = () => {
    setInboundForm({ ...inboundForm, products: [...inboundForm.products, { productId: "", quantity: 1 }] });
  };

  const removeProductRow = (idx: number) => {
    setInboundForm({
      ...inboundForm,
      products: inboundForm.products.filter((_, i) => i !== idx),
    });
  };

  const updateProduct = (idx: number, field: string, value: any) => {
    const updated = [...inboundForm.products];
    (updated[idx] as any)[field] = value;
    setInboundForm({ ...inboundForm, products: updated });
  };

  const renderNotEnrolled = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Fulfillment by KAUVEX</h2>
          <p className="text-purple-100 text-sm mb-6">
            Let KAUVEX handle storage, packing, and delivery. Focus on what matters — growing your business.
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-700 hover:bg-purple-50"
            onClick={handleEnroll}
            disabled={processing}
          >
            {processing ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Package size={16} className="mr-2" />
            )}
            Enroll in FBK
          </Button>
          <p className="text-[10px] text-purple-200 mt-2">
            By enrolling, you agree to the FBK Terms of Service and Fee Schedule
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FBK_BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Icon size={16} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-xs">{benefit.title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{benefit.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-purple-600" /> Fee Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-[10px] text-gray-400 font-semibold uppercase">Service</th>
                <th className="text-left py-2 px-2 text-[10px] text-gray-400 font-semibold uppercase">Fee</th>
                <th className="text-left py-2 px-2 text-[10px] text-gray-400 font-semibold uppercase">Notes</th>
              </tr>
            </thead>
            <tbody>
              {FEE_SCHEDULE.map((fee) => (
                <tr key={fee.service} className="border-b border-gray-50">
                  <td className="py-2.5 px-2 text-xs">{fee.service}</td>
                  <td className="py-2.5 px-2 text-xs font-semibold">{fee.fee}</td>
                  <td className="py-2.5 px-2 text-xs text-gray-400">{fee.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEnrolled = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-4">
        {[
          { label: "Storage Used", value: "342 cu. ft", icon: Warehouse, color: "text-purple-600" },
          { label: "Active Units", value: "1,247", icon: Package, color: "text-blue-600" },
          { label: "Monthly Fees", value: "$892.40", icon: DollarSign, color: "text-green-600" },
          { label: "Orders Fulfilled", value: "3,891", icon: Truck, color: "text-orange-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={stat.color} />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Truck size={16} className="text-purple-600" /> Active Inbound Plans
        </h3>
        <Button size="sm" onClick={() => setShowInboundForm(true)}>
          <Plus size={14} className="mr-1" /> Create Inbound Plan
        </Button>
      </div>

      {inboundPlans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No inbound plans yet</p>
          <p className="text-xs text-gray-300 mt-1">Create a plan to send inventory to KAUVEX warehouses</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inboundPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs">{plan.id}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${statusColors[plan.status]}`}>
                    {plan.status.replace("_", " ")}
                  </span>
                </div>
                <Link
                  href="#"
                  className="text-[10px] text-purple-600 hover:underline flex items-center gap-0.5"
                >
                  View Details <ChevronDown size={10} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400">Warehouse</p>
                  <p className="font-semibold">{plan.warehouse}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Total Units</p>
                  <p className="font-semibold">{plan.totalUnits}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Estimated Arrival</p>
                  <p className="font-semibold">{plan.estimatedArrival}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Created</p>
                  <p className="font-semibold">{plan.createdAt}</p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plan.products.map((p, i) => (
                  <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                    {p.name} × {p.qty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-purple-600" /> Fee Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-2 text-[10px] text-gray-400 font-semibold uppercase">Service</th>
                <th className="text-left py-2 px-2 text-[10px] text-gray-400 font-semibold uppercase">Fee</th>
                <th className="text-left py-2 px-2 text-[10px] text-gray-400 font-semibold uppercase">Notes</th>
              </tr>
            </thead>
            <tbody>
              {FEE_SCHEDULE.map((fee) => (
                <tr key={fee.service} className="border-b border-gray-50">
                  <td className="py-2.5 px-2 text-xs">{fee.service}</td>
                  <td className="py-2.5 px-2 text-xs font-semibold">{fee.fee}</td>
                  <td className="py-2.5 px-2 text-xs text-gray-400">{fee.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStatusBanner = () => {
    if (enrollmentStatus === "not_enrolled") return null;
    const banners: Record<FbkStatus, { color: string; text: string }> = {
      pending: { color: "bg-amber-50 border-amber-200 text-amber-800", text: "Your FBK enrollment is under review. We'll notify you within 48 hours." },
      active: { color: "bg-green-50 border-green-200 text-green-800", text: "FBK is active. Your products are being fulfilled by KAUVEX." },
      suspended: { color: "bg-red-50 border-red-200 text-red-800", text: "Your FBK account has been suspended. Please contact support." },
      not_enrolled: { color: "", text: "" },
    };
    const banner = banners[enrollmentStatus];
    if (!banner.color) return null;
    return (
      <div className={`flex items-start gap-2 p-3 rounded-lg border ${banner.color}`}>
        <AlertTriangle size={14} className="mt-0.5" />
        <p className="text-xs">{banner.text}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">FBK — Fulfillment by KAUVEX</h1>
            <p className="text-sm text-gray-500">Warehouse storage and order fulfillment</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                enrollmentStatus === "active"
                  ? "bg-green-100 text-green-700"
                  : enrollmentStatus === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : enrollmentStatus === "suspended"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-500"
              }`}
            >
              {enrollmentStatus === "not_enrolled" ? "Not Enrolled" : enrollmentStatus}
            </span>
            <Link
              href="/vendor/dashboard"
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {renderStatusBanner()}
        <div className="mt-6">
          {enrollmentStatus === "not_enrolled" ? renderNotEnrolled() : renderEnrolled()}
        </div>
      </div>

      {showInboundForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowInboundForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Truck size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Create Inbound Plan</h3>
                <p className="text-xs text-gray-400">Send inventory to a KAUVEX warehouse</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Warehouse</label>
                <select
                  value={inboundForm.warehouse}
                  onChange={(e) => setInboundForm({ ...inboundForm, warehouse: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Estimated Arrival</label>
                <input
                  type="date"
                  value={inboundForm.estimatedArrival}
                  onChange={(e) => setInboundForm({ ...inboundForm, estimatedArrival: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">Products</label>
                  <button
                    onClick={addProductRow}
                    className="text-[10px] text-purple-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Add Product
                  </button>
                </div>
                <div className="space-y-2">
                  {inboundForm.products.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={product.productId}
                        onChange={(e) => updateProduct(idx, "productId", e.target.value)}
                        className="flex-1 h-9 px-2 text-xs border border-gray-200 rounded-lg"
                      >
                        <option value="">Select product...</option>
                        {storeProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={product.quantity}
                        onChange={(e) => updateProduct(idx, "quantity", parseInt(e.target.value) || 1)}
                        className="w-16 h-9 px-2 text-xs border border-gray-200 rounded-lg text-center"
                      />
                      {inboundForm.products.length > 1 && (
                        <button
                          onClick={() => removeProductRow(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {inboundForm.warehouse && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">Selected Warehouse</p>
                  {(() => {
                    const w = warehouses.find((wh) => wh.id === inboundForm.warehouse);
                    return w ? (
                      <div className="text-[10px] text-gray-500 space-y-0.5">
                        <p>{w.name}</p>
                        <p className="flex items-center gap-1"><MapPin size={10} /> {w.location}</p>
                        <p>Capacity: {w.capacity}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowInboundForm(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateInbound}
                disabled={!inboundForm.warehouse || !inboundForm.estimatedArrival || processing}
              >
                {processing ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Truck size={14} className="mr-1" />
                )}
                Create Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
