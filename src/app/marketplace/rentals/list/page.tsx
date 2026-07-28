"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, ArrowLeft, CheckCircle, Loader2,
  Camera, Plus, X
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

export default function ListRentalPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [weeklyRate, setWeeklyRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [deposit, setDeposit] = useState("");
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const toggleDelivery = (opt: string) => {
    setDeliveryOptions((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    );
  };

  const handleSubmit = async () => {
    if (!name || !category || !dailyRate) {
      setError("Please fill in required fields (name, category, daily rate)");
      return;
    }
    setSubmitting(true);
    setError("");

    const listing = {
      id: `rental-${Date.now()}`,
      name,
      category,
      description,
      dailyRate: Number(dailyRate),
      weeklyRate: weeklyRate ? Number(weeklyRate) : null,
      monthlyRate: monthlyRate ? Number(monthlyRate) : null,
      deposit: deposit ? Number(deposit) : null,
      deliveryOptions,
      photos,
      listedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`rental-${listing.id}`, JSON.stringify(listing));
      setTimeout(() => {
        setSuccess(true);
        setSubmitting(false);
      }, 800);
    } catch {
      setError("Failed to save listing. Please try again.");
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-green-200 p-8 text-center max-w-md">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Equipment Listed Successfully!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your <strong>{name}</strong> has been listed on the Rental Exchange. Tenants can now find and book your equipment.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/marketplace/rentals")}>
              View Listings
            </Button>
            <Button onClick={() => { setSuccess(false); setName(""); setCategory(""); setDescription(""); setDailyRate(""); setWeeklyRate(""); setMonthlyRate(""); setDeposit(""); setDeliveryOptions([]); setPhotos([]); }}>
              List Another
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
          <Link href="/marketplace/rentals" className="hover:text-[#FF6B00]">Rentals</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">List Equipment</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/marketplace/rentals" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0A1628]">List Equipment for Rent</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Equipment Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Komatsu PC200 Excavator"
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
                  placeholder="Describe your equipment, its condition, and what's included..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Rates & Deposit</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Daily Rate ($) *</label>
                <input
                  type="number"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Weekly Rate ($)</label>
                <input
                  type="number"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Monthly Rate ($)</label>
                <input
                  type="number"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Security Deposit ($)</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Delivery Options</h2>
            <div className="flex flex-wrap gap-2">
              {["Pickup Only", "Local Delivery", "Nationwide Delivery", "Operator Included"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleDelivery(opt)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    deliveryOptions.includes(opt)
                      ? "bg-[#FFF4EC] border-[#FF6B00] text-[#FF6B00]"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Photos</h2>
            <div className="flex gap-3 flex-wrap">
              {photos.map((p, i) => (
                <div key={i} className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center relative">
                  <img src={p} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const url = prompt("Enter image URL:");
                  if (url) setPhotos((prev) => [...prev, url]);
                }}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-[#FF6B00] transition-colors"
              >
                <Camera size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/marketplace/rentals"><Button variant="outline">Cancel</Button></Link>
            <Button onClick={handleSubmit} loading={submitting}>
              {submitting ? "Listing..." : "List Equipment for Rent"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
