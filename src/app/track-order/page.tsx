"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackOrderPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) { setError("Enter an order ID or waybill number."); return; }
    setError("");

    const isWaybill = /^KEX-\d{4}-\d{7}$/.test(trimmed);
    const isOrderId = /^KVX-\d{4}-\d{6}$/.test(trimmed);

    if (isWaybill) {
      router.push(`/express/track/${encodeURIComponent(trimmed)}`);
    } else if (isOrderId) {
      // Try to find tracking for this order
      router.push(`/express/track/${encodeURIComponent(trimmed)}`);
    } else if (/^\d+$/.test(trimmed)) {
      router.push(`/express/track/KEX-2026-${trimmed.padStart(7, "0")}`);
    } else {
      setError("Enter a valid Kauvex order ID (e.g., KVX-2026-001234) or Express waybill (e.g., KEX-2026-0084729).");
    }
  };

  return (
    <div className="bg-off-white min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link>
          <span>/</span>
          <span className="text-text-1 font-medium">Track Order</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-orange" />
          </div>
          <h1 className="font-syne font-700 text-3xl text-text-1 mb-2">Track Your Order</h1>
          <p className="text-text-3">Enter your order ID or Kauvex Express waybill number to see delivery status</p>
        </div>

        <form onSubmit={handleTrack} className="bg-white rounded-xl border border-border p-6 lg:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(""); }}
                placeholder="Order ID (KVX-...) or Waybill (KEX-...)"
                className={`w-full pl-10 pr-4 py-3 border ${error ? "border-red-300" : "border-border"} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange font-mono`}
              />
            </div>
            <Button type="submit" size="lg" className="bg-orange hover:bg-orange-600 px-8 shrink-0">
              Track <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </form>

        <div className="text-center">
          <p className="text-sm text-text-4 mb-6">
            Not sure where to find your order ID? Check your order confirmation email or text message.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/express/book" className="block p-5 bg-white rounded-xl border border-border hover:border-orange hover:shadow-sm transition-all">
              <Truck className="w-6 h-6 text-orange mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-1">Book a Shipment</p>
              <p className="text-xs text-text-4 mt-1">Send a package with Kauvex Express</p>
            </Link>
            <Link href="/express/track" className="block p-5 bg-white rounded-xl border border-border hover:border-orange hover:shadow-sm transition-all">
              <Search className="w-6 h-6 text-orange mx-auto mb-2" />
              <p className="text-sm font-semibold text-text-1">Express Tracking</p>
              <p className="text-xs text-text-4 mt-1">Track by Kauvex Express waybill number</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
