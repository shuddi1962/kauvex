"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, Loader2, AlertTriangle, Check, User, Calendar,
  DollarSign, ClipboardList, Users, Package, CreditCard,
} from "lucide-react";

const PROFILES = [
  { id: "p1", name: "BuildRight Construction Ltd", type: "General Contractor", rating: 4.8 },
  { id: "p2", name: "Arc. David Okafor", type: "Architect", rating: 4.9 },
  { id: "p3", name: "Structa Engineering Ltd", type: "Structural Engineer", rating: 4.7 },
];

export default function BidPage() {
  const params = useParams();
  const router = useRouter();

  const [selectedProfile, setSelectedProfile] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [proposedStart, setProposedStart] = useState("");
  const [proposedEnd, setProposedEnd] = useState("");
  const [methodology, setMethodology] = useState("");
  const [teamComposition, setTeamComposition] = useState("");
  const [equipment, setEquipment] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedProfile || !bidAmount || !proposedStart || !proposedEnd || !methodology) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/v1/kpn/projects/${params.id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selectedProfile, bidAmount: parseFloat(bidAmount),
          proposedStart, proposedEnd, methodology, teamComposition, equipment,
          paymentSchedule,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit bid");
      router.push(`/projects/${params.id}?bid=submitted`);
    } catch {
      setError("Failed to submit bid. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";
  const textareaCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none transition-all";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-[#0A1628] transition-colors">Project Hub</Link>
          <span>/</span>
          <Link href={`/projects/${params.id}`} className="hover:text-[#0A1628] transition-colors">Project</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">Submit Bid</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          <h1 className="font-bold text-xl text-[#0A1628] mb-2">Submit a Bid</h1>
          <p className="text-sm text-gray-500 mb-6">
            Fill in your proposal details. All fields marked with * are required.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Professional Profile */}
            <div>
              <label className={labelCls}>Professional Profile *</label>
              <div className="space-y-2">
                {PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selectedProfile === profile.id
                        ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#0A1628]">{profile.name}</p>
                      <p className="text-xs text-gray-500">{profile.type} &bull; {profile.rating} rating</p>
                    </div>
                    {selectedProfile === profile.id && (
                      <Check className="w-5 h-5 text-[#FF6B00]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bid Amount */}
            <div>
              <label className={labelCls}>Bid Amount *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="e.g. 68500000" className={inputCls + " pl-9"} />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Proposed Start Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={proposedStart} onChange={(e) => setProposedStart(e.target.value)}
                    className={inputCls + " pl-9"} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Proposed End Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={proposedEnd} onChange={(e) => setProposedEnd(e.target.value)}
                    className={inputCls + " pl-9"} />
                </div>
              </div>
            </div>

            {/* Methodology */}
            <div>
              <label className={labelCls}>Methodology & Approach *</label>
              <textarea value={methodology} onChange={(e) => setMethodology(e.target.value)}
                rows={4} placeholder="Describe your construction methodology, approach, and key differentiators..."
                className={textareaCls} />
            </div>

            {/* Team Composition */}
            <div>
              <label className={labelCls}>Team Composition</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea value={teamComposition} onChange={(e) => setTeamComposition(e.target.value)}
                  rows={3} placeholder="List key team members, their roles, and relevant experience..."
                  className={textareaCls + " pl-9"} />
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className={labelCls}>Equipment List</label>
              <div className="relative">
                <Package className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea value={equipment} onChange={(e) => setEquipment(e.target.value)}
                  rows={3} placeholder="List major equipment and machinery to be used..."
                  className={textareaCls + " pl-9"} />
              </div>
            </div>

            {/* Payment Schedule */}
            <div>
              <label className={labelCls}>Payment Schedule</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea value={paymentSchedule} onChange={(e) => setPaymentSchedule(e.target.value)}
                  rows={3} placeholder="e.g. 30% mobilization, 30% at foundation, 30% at roofing, 10% at handover"
                  className={textareaCls + " pl-9"} />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Link
              href={`/projects/${params.id}`}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Project
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Bid
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
