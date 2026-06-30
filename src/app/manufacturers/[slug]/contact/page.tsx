"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, CheckCircle2, Mail, Phone, MessageSquare } from "lucide-react";

export default function ContactManufacturerPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/v1/manufacturers/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, manufacturerSlug: slug, type: "contact" }),
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
          <h1 className="text-xl font-bold text-[#0A1628] mb-2">Message Sent!</h1>
          <p className="text-sm text-gray-500 mb-6">The manufacturer will respond to your message shortly.</p>
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
            <h2 className="text-lg font-bold text-[#0A1628]">Contact Manufacturer</h2>
            <p className="text-xs text-gray-500">Send a direct message</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Mail, label: "Email", desc: "Direct message" },
            { icon: Phone, label: "Phone", desc: "Call directly" },
            { icon: MessageSquare, label: "Chat", desc: "Live chat" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl bg-white border border-gray-100 p-4 text-center hover:border-[#FF6B00] transition-colors cursor-pointer">
                <Icon size={20} className="text-[#FF6B00] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#0A1628]">{item.label}</p>
                <p className="text-[10px] text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
            <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="e.g. Inquiry about bulk pricing" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
            <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" placeholder="Write your message..." />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B00] text-white rounded-lg font-semibold hover:bg-[#e55f00] disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
