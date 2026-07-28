"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, ArrowLeft, CheckCircle, Loader2,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  "Construction",
  "Marine",
  "Industrial",
  "Agriculture",
  "Security",
  "ICT",
  "Power & Energy",
  "Transportation",
];

export default function PostTenderPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !title || !category || !deadline) {
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
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Tender Posted Successfully!</h2>
          <p className="text-sm text-gray-500 mb-2"><strong>{title}</strong> is now live on the Procurement Marketplace.</p>
          <p className="text-sm text-gray-500 mb-6">Bidders will be able to submit proposals until {new Date(deadline).toLocaleDateString()}.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/marketplace/procurement")}>View Tenders</Button>
            <Button onClick={() => { setSuccess(false); setCompany(""); setTitle(""); setDescription(""); setCategory(""); setBudgetMin(""); setBudgetMax(""); setDeadline(""); }}>
              Post Another
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
          <Link href="/marketplace/procurement" className="hover:text-[#FF6B00]">Procurement</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Post Tender</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/marketplace/procurement" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0A1628]">Post a Tender</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Tender Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Company / Organization *</label>
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company name"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Tender Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Supply of Heavy Equipment for Highway Construction"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the tender requirements, scope of work, and deliverables..."
                  rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
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
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Budget & Timeline</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Budget Range Min ($)</label>
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Budget Range Max ($)</label>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Submission Deadline *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Supporting Documents</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#FF6B00] transition-colors cursor-pointer">
              <Upload size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Upload Tender Documents</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS (max 20MB per file)</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <Link href="/marketplace/procurement"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" loading={submitting}>
              {submitting ? "Posting..." : "Post Tender"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
