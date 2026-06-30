"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Beaker, ArrowLeft, Loader2, Package, DollarSign, Truck,
  CheckCircle2, Clock, XCircle, Globe, ChevronDown
} from "lucide-react";

interface Sample {
  id: string;
  inquiryId: string;
  productDescription: string;
  sampleCost: string;
  shippingFee: string;
  totalCost: string;
  status: string;
  buyerName?: string;
  manufacturerName?: string;
  direction: "incoming" | "outgoing";
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  paid: { label: "Paid", color: "text-blue-700", bg: "bg-blue-100", icon: DollarSign },
  shipped: { label: "Shipped", color: "text-purple-700", bg: "bg-purple-100", icon: Truck },
  received: { label: "Received", color: "text-cyan-700", bg: "bg-cyan-100", icon: Package },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
  declined: { label: "Declined", color: "text-red-600", bg: "bg-red-100", icon: XCircle },
};

export default function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/samples");
        const json = await res.json();
        if (json.data) {
          setSamples(json.data);
        }
      } catch {
        setSamples([
          {
            id: "smp-001",
            inquiryId: "inq-001",
            productDescription: "Cotton t-shirt sample, white, size M",
            sampleCost: "$25.00",
            shippingFee: "$18.00",
            totalCost: "$43.00",
            status: "pending",
            buyerName: "GlobalTextile Co.",
            direction: "incoming",
            createdAt: "2026-06-28",
          },
          {
            id: "smp-002",
            inquiryId: "inq-002",
            productDescription: "CNC aluminum bracket sample, anodized",
            sampleCost: "$45.00",
            shippingFee: "$32.00",
            totalCost: "$77.00",
            status: "shipped",
            buyerName: "EuroParts GmbH",
            direction: "outgoing",
            createdAt: "2026-06-25",
          },
          {
            id: "smp-003",
            inquiryId: "inq-003",
            productDescription: "Plastic container 20L, blue, with lid",
            sampleCost: "$15.00",
            shippingFee: "$12.00",
            totalCost: "$27.00",
            status: "received",
            buyerName: "Lagos Retail Ltd",
            direction: "incoming",
            createdAt: "2026-06-22",
          },
          {
            id: "smp-004",
            inquiryId: "inq-004",
            productDescription: "USB-C cable, 1.5m, braided, white",
            sampleCost: "$8.00",
            shippingFee: "$6.00",
            totalCost: "$14.00",
            status: "approved",
            buyerName: "Shenzhen Imports",
            direction: "outgoing",
            createdAt: "2026-06-18",
          },
          {
            id: "smp-005",
            inquiryId: "inq-005",
            productDescription: "Stainless steel bottle 500ml, vacuum",
            sampleCost: "$12.00",
            shippingFee: "$10.00",
            totalCost: "$22.00",
            status: "paid",
            buyerName: "Dubai Trading FZE",
            direction: "incoming",
            createdAt: "2026-06-20",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, []);

  const filtered = samples.filter((s) => s.direction === activeTab);
  const counts = {
    incoming: samples.filter((s) => s.direction === "incoming").length,
    outgoing: samples.filter((s) => s.direction === "outgoing").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Samples</h2>
              <p className="text-xs text-gray-500">Manage sample requests from buyers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "incoming"
                ? "bg-[#0A1628] text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Incoming
            <span className="ml-1.5 text-[10px] opacity-70">{counts.incoming}</span>
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "outgoing"
                ? "bg-[#0A1628] text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Outgoing
            <span className="ml-1.5 text-[10px] opacity-70">{counts.outgoing}</span>
          </button>
        </div>

        {/* Sample Cards */}
        {filtered.length === 0 ? (
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16">
            <Beaker size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">No samples found</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === "incoming" ? "Sample requests from buyers will appear here" : "Outgoing samples to buyers will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sample) => {
              const status = statusConfig[sample.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div key={sample.id} className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#0A1628]/5 flex items-center justify-center">
                        <Beaker size={16} className="text-[#0A1628]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0A1628]">{sample.id.toUpperCase()}</p>
                        <p className="text-[10px] text-gray-500">{new Date(sample.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color} flex items-center gap-1`}>
                      <StatusIcon size={9} /> {status.label}
                    </span>
                  </div>

                  {/* Product */}
                  <div className="mb-3">
                    <p className="text-xs text-[#0A1628] leading-relaxed">{sample.productDescription}</p>
                  </div>

                  {/* Buyer/Manufacturer */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Globe size={10} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500">
                      {activeTab === "incoming" ? `From: ${sample.buyerName}` : `To: ${sample.buyerName}`}
                    </span>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Sample Cost</span>
                      <span className="text-[10px] font-medium text-[#0A1628]">{sample.sampleCost}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">Shipping Fee</span>
                      <span className="text-[10px] font-medium text-[#0A1628]">{sample.shippingFee}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-200">
                      <span className="text-[10px] font-semibold text-[#0A1628]">Total</span>
                      <span className="text-xs font-bold text-[#0A1628]">{sample.totalCost}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {sample.status === "pending" && activeTab === "incoming" && (
                      <>
                        <button className="flex-1 px-3 py-2 bg-[#FF6B00] text-white text-[10px] font-semibold rounded-lg hover:bg-[#e55f00] transition-colors">
                          Accept & Prepare
                        </button>
                        <button className="px-3 py-2 border border-gray-200 text-[10px] font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          Decline
                        </button>
                      </>
                    )}
                    {sample.status === "paid" && activeTab === "incoming" && (
                      <button className="flex-1 px-3 py-2 bg-[#0A1628] text-white text-[10px] font-semibold rounded-lg hover:bg-[#0A1628]/90 transition-colors flex items-center justify-center gap-1">
                        <Truck size={10} /> Mark as Shipped
                      </button>
                    )}
                    {sample.status === "shipped" && activeTab === "outgoing" && (
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white text-[10px] font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                        <CheckCircle2 size={10} /> Mark as Received
                      </button>
                    )}
                    {sample.status === "received" && activeTab === "incoming" && (
                      <div className="flex gap-2 w-full">
                        <button className="flex-1 px-3 py-2 bg-green-600 text-white text-[10px] font-semibold rounded-lg hover:bg-green-700 transition-colors">
                          Approve
                        </button>
                        <button className="flex-1 px-3 py-2 border border-red-200 text-red-600 text-[10px] font-semibold rounded-lg hover:bg-red-50 transition-colors">
                          Decline
                        </button>
                      </div>
                    )}
                    {sample.status === "approved" && (
                      <span className="flex-1 px-3 py-2 bg-green-50 text-green-700 text-[10px] font-medium rounded-lg text-center">
                        Sample Approved — Proceed to Quote
                      </span>
                    )}
                    {sample.status === "declined" && (
                      <span className="flex-1 px-3 py-2 bg-red-50 text-red-600 text-[10px] font-medium rounded-lg text-center">
                        Sample Declined
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
