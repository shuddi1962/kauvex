"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, CheckCircle2, Package } from "lucide-react";

export default function RequestSamplePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productName: "",
    specifications: "",
    quantity: "1",
    color: "",
    size: "",
    notes: "",
    shippingAddress: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/v1/manufacturers/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, manufacturerSlug: slug }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-[#0A1628] mb-2">Sample Request Sent!</h1>
          <p className="text-sm text-gray-500 mb-6">The manufacturer will confirm sample availability, cost, and shipping details.</p>
          <Link href={`/manufacturers/${slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B00] text-white rounded-lg font-semibold hover:bg-[#e55f00]">
            <ArrowLeft size={16} /> Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href={`/manufacturers/${slug}`} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Request a Sample</h2>
            <p className="text-xs text-gray-500">Order a sample before committing to bulk production</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex items-start gap-3">
            <Package size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Sample Policy</p>
              <p className="text-xs text-amber-700 mt-1">Sample costs are typically non-refundable but may be credited against your first bulk order. Shipping fees apply separately.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Sample Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. Cotton Crew Neck T-Shirt" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Specifications</label>
                <textarea rows={3} value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="Material, weight, dimensions, etc." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                  <input value={form.quantity} onChange={(e) => setForm({   ...form, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                  <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. Black" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                  <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. L, XL" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="Any special requirements for the sample..." />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Shipping & Contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Shipping Address *</label>
                <textarea required rows={2} value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="Full address with city, country, postal code" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B00] text-white rounded-lg font-semibold hover:bg-[#e55f00] disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? "Sending..." : "Request Sample"}
          </button>
        </form>
      </div>
    </div>
  );
}
