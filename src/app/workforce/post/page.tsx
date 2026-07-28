"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, ArrowLeft, CheckCircle, Loader2,
  MapPin, DollarSign, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = ["Marine Crew", "Construction", "Oil & Gas", "Industrial", "Agriculture"];
const roleTypes = ["Permanent", "Contract", "Freelance"];

export default function PostJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [roleType, setRoleType] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !roleType || !location) {
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
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Job Posted Successfully!</h2>
          <p className="text-sm text-gray-500 mb-2"><strong>{title}</strong> is now live on the Workforce Marketplace.</p>
          <p className="text-sm text-gray-500 mb-6">Applicants can apply until {deadline ? new Date(deadline).toLocaleDateString() : "the deadline"}.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/workforce")}>View Jobs</Button>
            <Button onClick={() => { setSuccess(false); setTitle(""); setCategory(""); setRoleType(""); setDescription(""); setRequirements(""); setLocation(""); setSalaryMin(""); setSalaryMax(""); setDeadline(""); }}>
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
          <Link href="/workforce" className="hover:text-[#FF6B00]">Workforce</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Post a Job</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/workforce" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0A1628]">Post a Job</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Job Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Marine Chief Engineer"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
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
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Role Type *</label>
                  <div className="flex gap-2">
                    {roleTypes.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setRoleType(t)}
                        className={`flex-1 h-10 rounded-lg text-sm font-medium border transition-all ${
                          roleType === t
                            ? "bg-[#FFF4EC] border-[#FF6B00] text-[#FF6B00]"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Requirements</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List key requirements, certifications, and experience needed..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Location & Compensation</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600 block mb-1">Location *</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Lagos, Nigeria"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Salary Min ($/mo)</label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Salary Max ($/mo)</label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-[#0A1628] mb-4">Application Deadline</h2>
            <div className="max-w-xs">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <Link href="/workforce"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" loading={submitting}>
              {submitting ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
