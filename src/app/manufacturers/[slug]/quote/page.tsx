"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function RequestQuotePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productName: "",
    description: "",
    quantity: "",
    targetPrice: "",
    customization: "",
    timeline: "",
    destinationCountry: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    company: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/v1/manufacturers/inquiries", {
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
          <h1 className="text-xl font-bold text-[#0A1628] mb-2">Quote Request Sent!</h1>
          <p className="text-sm text-gray-500 mb-6">The manufacturer will review your requirements and respond within 24-48 hours.</p>
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
            <h2 className="text-lg font-bold text-[#0A1628]">Request a Quote</h2>
            <p className="text-xs text-gray-500">Send your requirements to this manufacturer</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Product Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                <input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. Cotton T-Shirts, PCB Assembly" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description & Specifications *</label>
                <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="Describe materials, sizes, colors, quality requirements..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reference Images</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#FF6B00] transition-colors cursor-pointer">
                  <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Drag & drop images or click to upload</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Order Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                <input required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. 5,000 units" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Unit Price</label>
                <input value={form.targetPrice} onChange={(e) => setForm({ ...form, targetPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. $2.50 per unit" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Customization Needed</label>
                <input value={form.customization} onChange={(e) => setForm({ ...form, customization: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. Custom logo, packaging" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Timeline</label>
                <input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. 4-6 weeks" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Destination Country</label>
                <input value={form.destinationCountry} onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. Nigeria, USA, UK" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[#0A1628] mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
                <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
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

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B00] text-white rounded-lg font-semibold hover:bg-[#e55f00] disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? "Sending..." : "Send Quote Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
