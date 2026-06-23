"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight, Package, Truck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackPage() {
  const router = useRouter();
  const [waybill, setWaybill] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = waybill.trim();
    if (!trimmed) return;
    router.push(`/express/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="bg-off-white min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link>
          <span>/</span>
          <Link href="/express" className="hover:text-blue">Express</Link>
          <span>/</span>
          <span className="text-text-1 font-medium">Track Shipment</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-orange" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-syne font-700 text-text-1 mb-2">Track Your Shipment</h1>
          <p className="text-text-3">Enter your Kauvex Express waybill number to see real-time delivery status</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-soft mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
              <input
                type="text"
                value={waybill}
                onChange={(e) => setWaybill(e.target.value)}
                placeholder="Enter waybill number (e.g., KEX-2026-0084729)"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange font-mono"
              />
            </div>
            <Button type="submit" size="lg" className="bg-orange hover:bg-orange-600 px-8 shrink-0">
              Track <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border p-5 text-center">
            <Truck className="w-6 h-6 text-orange mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-1">Real-Time Updates</p>
            <p className="text-xs text-text-4 mt-1">Live status from pickup to delivery</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 text-center">
            <ClipboardList className="w-6 h-6 text-orange mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-1">Detailed Timeline</p>
            <p className="text-xs text-text-4 mt-1">Every scan event and location</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 text-center">
            <Search className="w-6 h-6 text-orange mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-1">Instant Results</p>
            <p className="text-xs text-text-4 mt-1">Just type your waybill number</p>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-5">
          <p className="text-xs text-text-4 text-center">
            No waybill number?{" "}
            <Link href="/contact" className="text-blue font-semibold hover:underline">
              Contact support
            </Link>{" "}
            with your order details or{" "}
            <Link href="/express/book" className="text-blue font-semibold hover:underline">
              book a new shipment
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
