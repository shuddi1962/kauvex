"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Camera, Package } from "lucide-react";

export default function RequestProductPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Package size={28} className="text-[#FF6B00]" />
            <h1 className="text-3xl font-bold">Can&apos;t Find What You Need?</h1>
          </div>
          <p className="text-gray-400">Tell us what product you&apos;re looking for. We&apos;ll source it and add it to Kauvex — or let our vendors bid to supply it.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {submitted ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Request Submitted!</h2>
            <p className="text-gray-500 mb-2">Your request ID: <span className="font-mono font-bold text-[#FF6B00]">KVR-2847</span></p>
            <p className="text-gray-500">We&apos;ll search our catalog and supplier network. You&apos;ll get an update within 2 hours if we find a match.</p>
            <Button className="mt-6 bg-[#FF6B00] hover:bg-[#e86000]" onClick={() => setSubmitted(false)}>Request Another Product</Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Product Name *</label>
              <input placeholder="e.g. Sony WH-1000XM5 Headphones" className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Description *</label>
              <textarea rows={3} placeholder="Describe the product in detail — brand, model, features, colour, etc."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Reference Photo (optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF6B00] cursor-pointer">
                <Camera size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload or drag an image here</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Budget Range</label>
                <div className="flex gap-2">
                  <input placeholder="Min" type="number" className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
                  <input placeholder="Max" type="number" className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Quantity Needed</label>
                <input type="number" defaultValue={1} min={1} className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Urgency</label>
              <div className="flex gap-2">
                {["Urgent (1 week)", "Normal (2-4 weeks)", "Flexible"].map(u => (
                  <button key={u} className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:border-[#FF6B00] hover:bg-orange-50">{u}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="prepay" className="rounded border-gray-300" />
              <label htmlFor="prepay" className="text-sm text-gray-600">I&apos;m willing to pre-pay a deposit</label>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Email for Updates *</label>
              <input type="email" placeholder="your@email.com" className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
            </div>
            <Button onClick={() => setSubmitted(true)} className="w-full bg-[#FF6B00] hover:bg-[#e86000] h-12 text-base">
              <Search size={18} className="mr-2" /> Submit Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
