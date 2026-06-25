"use client";

import { useState } from "react";
import {
  TrendingUp, Clock, MapPin, XCircle, RefreshCw,
  Star, DollarSign, Truck, Package, AlertTriangle,
  Lightbulb, CheckCircle2, ArrowUp, ArrowDown,
  BarChart3, PieChart, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface ZoneMetric {
  zone: string;
  onTimeRate: number;
  avgDeliveryDays: number;
  shipments: number;
}

interface FailedReason {
  reason: string;
  count: number;
  percentage: number;
}

interface CostByCarrier {
  carrier: string;
  total: string;
  avgPerShipment: string;
  shipments: number;
}

interface CostByZone {
  zone: string;
  avgCost: string;
  shipments: number;
}

const zoneData: ZoneMetric[] = [
  { zone: "Lagos Island", onTimeRate: 98.5, avgDeliveryDays: 1.2, shipments: 312 },
  { zone: "Lagos Mainland", onTimeRate: 97.2, avgDeliveryDays: 1.5, shipments: 245 },
  { zone: "Abuja (FCT)", onTimeRate: 96.8, avgDeliveryDays: 2.1, shipments: 178 },
  { zone: "Port Harcourt", onTimeRate: 95.4, avgDeliveryDays: 2.8, shipments: 134 },
  { zone: "Ibadan / Oyo", onTimeRate: 94.1, avgDeliveryDays: 3.2, shipments: 98 },
  { zone: "Enugu / East", onTimeRate: 93.6, avgDeliveryDays: 3.5, shipments: 76 },
  { zone: "Kano / North", onTimeRate: 89.2, avgDeliveryDays: 4.8, shipments: 45 },
  { zone: "Other Regions", onTimeRate: 91.5, avgDeliveryDays: 4.1, shipments: 112 },
];

const failedReasons: FailedReason[] = [
  { reason: "Customer not available", count: 12, percentage: 32.4 },
  { reason: "Wrong address", count: 8, percentage: 21.6 },
  { reason: "Package damaged", count: 5, percentage: 13.5 },
  { reason: "Delivery refused", count: 4, percentage: 10.8 },
  { reason: "Address not found", count: 3, percentage: 8.1 },
  { reason: "Other", count: 5, percentage: 13.5 },
];

const costByCarrier: CostByCarrier[] = [
  { carrier: "Kauvex Logistics", total: "₦284,500", avgPerShipment: "₦2,150", shipments: 132 },
  { carrier: "DHL", total: "₦198,000", avgPerShipment: "₦4,950", shipments: 40 },
  { carrier: "FedEx", total: "₦156,000", avgPerShipment: "₦5,200", shipments: 30 },
  { carrier: "Aramex", total: "₦89,000", avgPerShipment: "₦3,560", shipments: 25 },
  { carrier: "GIG Logistics", total: "₦45,000", avgPerShipment: "₦1,800", shipments: 25 },
  { carrier: "Kwik", total: "₦32,000", avgPerShipment: "₦1,600", shipments: 20 },
];

const costByZone: CostByZone[] = [
  { zone: "Lagos Island", avgCost: "₦2,100", shipments: 312 },
  { zone: "Lagos Mainland", avgCost: "₦2,450", shipments: 245 },
  { zone: "Abuja (FCT)", avgCost: "₦4,200", shipments: 178 },
  { zone: "Port Harcourt", avgCost: "₦4,800", shipments: 134 },
  { zone: "Ibadan / Oyo", avgCost: "₦3,600", shipments: 98 },
  { zone: "Enugu / East", avgCost: "₦5,200", shipments: 76 },
  { zone: "Kano / North", avgCost: "₦6,500", shipments: 45 },
  { zone: "Other Regions", avgCost: "₦5,800", shipments: 112 },
];

const savingsSuggestions = [
  { title: "Switch to Kauvex Logistics for Lagos zones", savings: "Up to ₦85,000/mo", desc: "Kauvex Logistics is 58% cheaper than DHL/FedEx for same-day Lagos delivery." },
  { title: "Consolidate daily shipments into one manifest", savings: "Up to ₦24,000/mo", desc: "Bulk drop-off reduces per-shipment handling fees by ₦200 each." },
  { title: "Use Tier 1 partners for last-mile in Lagos", savings: "Up to ₦38,000/mo", desc: "Local riders cost 40% less than carrier API rates for intra-city delivery." },
  { title: "Optimize packaging to reduce weight tiers", savings: "Up to ₦15,000/mo", desc: "12% of shipments fall into the next weight bracket by less than 100g." },
];

export default function VendorLogisticsPerformancePage() {
  const [savingsExpanded, setSavingsExpanded] = useState(false);

  const totalShipments = zoneData.reduce((acc, z) => acc + z.shipments, 0);
  const totalSpend = costByCarrier.reduce((acc, c) => acc + parseInt(c.total.replace(/[₦,]/g, "")), 0);
  const avgCostPerShipment = totalSpend / totalShipments;

  return (
    <VendorShell title="Performance" subtitle="Logistics performance metrics, costs, and optimization insights">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">97.2%</p>
              <p className="text-xs text-gray-400">On-Time Delivery</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600">
            <ArrowUp size={10} /> +1.1% vs last month
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">2.4 days</p>
              <p className="text-xs text-gray-400">Avg Delivery Time</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600">
            <ArrowDown size={10} /> -0.3 days vs last month
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">2.8%</p>
              <p className="text-xs text-gray-400">Failed Delivery Rate</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600">
            <ArrowUp size={10} /> +0.4% vs last month
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₦{avgCostPerShipment.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Avg Cost / Shipment</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">{totalShipments} shipments this month</div>
        </div>
      </div>

      {/* Row: On-Time by Zone + Failed Reasons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* On-Time by Zone */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">On-Time Delivery Rate by Zone</h3>
          </div>
          <div className="space-y-2">
            {zoneData.map((z) => (
              <div key={z.zone}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-700 font-medium">{z.zone}</span>
                  <span className="text-xs text-gray-500">{z.onTimeRate}% · {z.avgDeliveryDays}d avg · {z.shipments} ship</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      z.onTimeRate >= 97 ? "bg-green-500" : z.onTimeRate >= 93 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${z.onTimeRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failed Reasons */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={16} className="text-red-600" />
            <h3 className="font-bold text-gray-900 text-sm">Failed Delivery Reasons</h3>
          </div>
          <div className="space-y-3">
            {failedReasons.map((r) => (
              <div key={r.reason}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-700 font-medium">{r.reason}</span>
                  <span className="text-xs text-gray-500">{r.count} ({r.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${r.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Return Rate</span>
              <span className="font-semibold text-gray-900">1.8%</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Customer Delivery Satisfaction</span>
              <span className="font-semibold text-green-600">4.6 / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-purple-600" />
          <h3 className="font-bold text-gray-900 text-sm">Shipping Cost Analysis</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">Total Spend This Month</p>
            <p className="text-xl font-bold text-purple-700">₦{totalSpend.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">Avg Cost / Shipment</p>
            <p className="text-xl font-bold text-blue-700">₦{avgCostPerShipment.toFixed(0).toLocaleString()}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-0.5">Total Shipments</p>
            <p className="text-xl font-bold text-green-700">{totalShipments}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Cost by Carrier */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cost by Carrier</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase">
                  <th className="text-left pb-1 font-semibold">Carrier</th>
                  <th className="text-right pb-1 font-semibold">Shipments</th>
                  <th className="text-right pb-1 font-semibold">Avg</th>
                  <th className="text-right pb-1 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {costByCarrier.map((c) => (
                  <tr key={c.carrier} className="border-t border-gray-50">
                    <td className="py-1.5 text-gray-700 font-medium">{c.carrier}</td>
                    <td className="py-1.5 text-right text-gray-500">{c.shipments}</td>
                    <td className="py-1.5 text-right text-gray-500">{c.avgPerShipment}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{c.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Cost by Zone */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cost by Zone</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-400 text-[10px] uppercase">
                  <th className="text-left pb-1 font-semibold">Zone</th>
                  <th className="text-right pb-1 font-semibold">Shipments</th>
                  <th className="text-right pb-1 font-semibold">Avg Cost</th>
                </tr>
              </thead>
              <tbody>
                {costByZone.map((z) => (
                  <tr key={z.zone} className="border-t border-gray-50">
                    <td className="py-1.5 text-gray-700 font-medium">{z.zone}</td>
                    <td className="py-1.5 text-right text-gray-500">{z.shipments}</td>
                    <td className="py-1.5 text-right font-medium text-gray-900">{z.avgCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cost Savings Suggestions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setSavingsExpanded(!savingsExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            <h3 className="font-bold text-gray-900 text-sm">Cost Savings Suggestions</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
              {savingsSuggestions.length} suggestions
            </span>
          </div>
          <span className="text-xs text-gray-400">{savingsExpanded ? "Hide" : "Show"}</span>
        </button>
        {savingsExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
            {savingsSuggestions.map((s, i) => (
              <div key={i} className="bg-green-50 rounded-lg p-3 flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign size={14} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    <span className="text-xs font-bold text-green-700">{s.savings}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full">
              <Download size={14} className="mr-1" /> Download Full Savings Report
            </Button>
          </div>
        )}
      </div>
    </VendorShell>
  );
}
