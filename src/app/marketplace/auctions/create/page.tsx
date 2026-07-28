"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, ArrowLeft, CheckCircle, Loader2,
  Upload, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  "Construction Equipment",
  "Marine Equipment",
  "Industrial Machinery",
  "Agricultural Machinery",
  "Security Equipment",
  "ICT Equipment",
  "Power & Energy Equipment",
  "Transportation Equipment",
];

export default function CreateAuctionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startingBid, setStartingBid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !startDate || !endDate || !startingBid) {
      setError("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    setError("");

    setTimeout(() => {
      setSuccess(true);
      setSubmitting(false);
    }, 1000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-green-200 p-8 text-center max-w-md">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Auction Created!</h2>
          <p className="text-sm text-gray-500 mb-2">Your auction for <strong>{name}</strong> has been created.</p>
          <p className="text-sm text-gray-500 mb-6">
            Starts: {new Date(startDate).toLocaleDateString()} · Ends: {new Date(endDate).toLocaleDateString()}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/marketplace/auctions")}>View Auctions</Button>
            <Button onClick={() => { setSuccess(false); setName(""); setCategory(""); setDescription(""); setReservePrice(""); setStartDate(""); setEndDate(""); setStartingBid(""); }}>
              Create Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <Link href="/marketplace/auctions" className="hover:text-[#FF6B00]">Auctions</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Create Auction</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/marketplace/auctions" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0A1628]">Create Auction</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Item Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Item Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Caterpillar 320D Excavator"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item, condition, specifications..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Pricing & Schedule</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Starting Bid ($) *</label>
                <input
                  type="number"
                  value={startingBid}
                  onChange={(e) => setStartingBid(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Reserve Price ($)</label>
                <input
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  placeholder="0.00 (optional)"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Inspection Report</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#FF6B00] transition-colors cursor-pointer">
              <Upload size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Upload Inspection Report</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, or Images (max 10MB)</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <Link href="/marketplace/auctions"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" loading={submitting}>
              {submitting ? "Creating..." : "Create Auction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
