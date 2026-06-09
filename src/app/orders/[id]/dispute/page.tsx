"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Shield, ChevronRight, Upload, X, CheckCircle, Package, Search, AlertTriangle, RotateCcw } from "lucide-react";

const issueTypes = [
  { value: "not-received", label: "Item Not Received", description: "I haven't received my order", icon: Package },
  { value: "not-as-described", label: "Not as Described", description: "Item doesn't match the listing", icon: Search },
  { value: "damaged", label: "Damaged", description: "Item arrived damaged or defective", icon: AlertTriangle },
  { value: "wrong-item", label: "Wrong Item", description: "Received a different item", icon: RotateCcw },
];

export default function DisputePage() {
  const params = useParams();
  const orderId = params.id as string;

  const [step, setStep] = useState(1);
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [resolution, setResolution] = useState("full-refund");
  const [partialPercent, setPartialPercent] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");

  const totalSteps = 5;

  const addFile = (name: string, size: string) => {
    if (files.length >= 5) return;
    setFiles([...files, { name, size }]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const caseNum = `DIS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setCaseNumber(caseNum);
    console.log({ orderId, issueType, description, files, resolution, partialPercent, caseNumber: caseNum });
    setSubmitted(true);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!issueType;
      case 2: return description.trim().length > 0;
      case 3: return files.length > 0;
      case 4: return resolution !== "partial-refund" || (partialPercent && parseInt(partialPercent) > 0 && parseInt(partialPercent) <= 100);
      case 5: return confirmed;
      default: return false;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-off-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl border border-border p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-syne font-700 text-2xl text-text-1 mb-2">Dispute Submitted</h1>
            <p className="text-text-3 mb-6">Your dispute has been filed successfully. We&apos;ll review it within 48 hours.</p>
            <div className="bg-navy text-white rounded-xl p-5 mb-6 inline-block">
              <p className="text-xs text-white/60 mb-1">Case Number</p>
              <p className="font-mono font-bold text-lg tracking-wider">{caseNumber}</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link href={`/account/orders`} className="px-5 py-2.5 bg-blue text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                Back to Orders
              </Link>
              <Link href={`/orders/${orderId}/dispute`} className="px-5 py-2.5 border border-border text-text-2 rounded-xl text-sm font-medium hover:bg-off-white transition-colors">
                View Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-4 mb-6">
          <Link href="/" className="hover:text-blue transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/account/orders" className="hover:text-blue transition-colors">My Orders</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/account/orders`} className="hover:text-blue transition-colors">Order #{orderId}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-text-2 font-medium">Open Dispute</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-orange" />
          </div>
          <div>
            <h1 className="font-syne font-700 text-2xl text-text-1">Open a Dispute</h1>
            <p className="text-sm text-text-3">Order #{orderId}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                s < step ? "bg-success text-white" : s === step ? "bg-orange text-white" : "bg-gray-100 text-text-4"
              }`}>
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < totalSteps && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${s < step ? "bg-success" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-[10px] text-text-4 font-medium mb-8 -mt-4">
          <span>Issue Type</span>
          <span className="ml-2">Describe</span>
          <span>Evidence</span>
          <span>Resolution</span>
          <span>Review</span>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          {/* Step 1: Select Issue Type */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-syne font-700 text-lg text-text-1 mb-1">Select Issue Type</h2>
              <p className="text-sm text-text-3 mb-6">What best describes your issue?</p>
              <div className="space-y-3">
                {issueTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        issueType === type.value ? "border-orange bg-orange-50" : "border-border hover:border-blue/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="issueType"
                        value={type.value}
                        checked={issueType === type.value}
                        onChange={() => setIssueType(type.value)}
                        className="w-4 h-4 text-orange accent-orange"
                      />
                      <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-navy" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-text-1">{type.label}</p>
                        <p className="text-xs text-text-4">{type.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Describe the Problem */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-syne font-700 text-lg text-text-1 mb-1">Describe the Problem</h2>
              <p className="text-sm text-text-3 mb-6">Tell us what went wrong in detail.</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, when you received the item, and any other relevant details..."
                rows={6}
                className="w-full border border-border rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange transition-all"
              />
              <p className="text-xs text-text-4 mt-2">Please provide as much detail as possible</p>
              <p className="text-xs text-text-4 mt-1">{description.length} characters</p>
            </div>
          )}

          {/* Step 3: Upload Evidence */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-syne font-700 text-lg text-text-1 mb-1">Upload Evidence</h2>
              <p className="text-sm text-text-3 mb-6">Upload photos showing the issue (max 5 files, JPG/PNG only).</p>

              {/* Drop Zone */}
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-orange/40 transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-orange" />
                </div>
                <p className="text-sm font-medium text-text-2">Drag & drop files here or click to browse</p>
                <p className="text-xs text-text-4 mt-1">JPG, PNG up to 5MB each</p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-off-white rounded-lg px-4 py-2.5 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-orange" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-1">{file.name}</p>
                          <p className="text-xs text-text-4">{file.size}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(i)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-text-3 hover:text-red" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-text-4 mt-3">{files.length}/5 files uploaded</p>
            </div>
          )}

          {/* Step 4: Choose Resolution */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="font-syne font-700 text-lg text-text-1 mb-1">Choose Resolution</h2>
              <p className="text-sm text-text-3 mb-6">What outcome would you like?</p>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  resolution === "full-refund" ? "border-orange bg-orange-50" : "border-border hover:border-blue/30"
                }`}>
                  <input
                    type="radio"
                    name="resolution"
                    value="full-refund"
                    checked={resolution === "full-refund"}
                    onChange={() => setResolution("full-refund")}
                    className="w-4 h-4 text-orange accent-orange"
                  />
                  <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-1">Full Refund</p>
                    <p className="text-xs text-text-4">Refund the full amount</p>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  resolution === "partial-refund" ? "border-orange bg-orange-50" : "border-border hover:border-blue/30"
                }`}>
                  <input
                    type="radio"
                    name="resolution"
                    value="partial-refund"
                    checked={resolution === "partial-refund"}
                    onChange={() => setResolution("partial-refund")}
                    className="w-4 h-4 text-orange accent-orange"
                  />
                  <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-1">Partial Refund</p>
                    <p className="text-xs text-text-4">I&apos;d like a partial refund</p>
                  </div>
                </label>

                {resolution === "partial-refund" && (
                  <div className="flex items-center gap-3 pl-16">
                    <input
                      type="number"
                      value={partialPercent}
                      onChange={(e) => setPartialPercent(e.target.value)}
                      placeholder="0"
                      min="1"
                      max="100"
                      className="w-20 border border-border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                    <span className="text-sm font-medium text-text-2">% refund</span>
                  </div>
                )}

                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  resolution === "return-item" ? "border-orange bg-orange-50" : "border-border hover:border-blue/30"
                }`}>
                  <input
                    type="radio"
                    name="resolution"
                    value="return-item"
                    checked={resolution === "return-item"}
                    onChange={() => setResolution("return-item")}
                    className="w-4 h-4 text-orange accent-orange"
                  />
                  <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-1">Return Item</p>
                    <p className="text-xs text-text-4">I want to return the item for a refund</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="font-syne font-700 text-lg text-text-1 mb-1">Review & Submit</h2>
              <p className="text-sm text-text-3 mb-6">Please review your dispute details before submitting.</p>

              <div className="space-y-4 mb-6">
                <div className="bg-off-white rounded-xl p-4">
                  <p className="text-xs text-text-4 uppercase tracking-wider font-medium mb-2">Issue Type</p>
                  <p className="font-medium text-text-1">{issueTypes.find((t) => t.value === issueType)?.label}</p>
                </div>

                <div className="bg-off-white rounded-xl p-4">
                  <p className="text-xs text-text-4 uppercase tracking-wider font-medium mb-2">Description</p>
                  <p className="text-sm text-text-2">{description}</p>
                </div>

                <div className="bg-off-white rounded-xl p-4">
                  <p className="text-xs text-text-4 uppercase tracking-wider font-medium mb-2">Evidence Files</p>
                  <p className="text-sm text-text-2">{files.length} file{files.length !== 1 ? "s" : ""} uploaded</p>
                  <ul className="mt-1 space-y-1">
                    {files.map((f, i) => (
                      <li key={i} className="text-xs text-text-4">{f.name}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-off-white rounded-xl p-4">
                  <p className="text-xs text-text-4 uppercase tracking-wider font-medium mb-2">Requested Resolution</p>
                  <p className="font-medium text-text-1">
                    {resolution === "full-refund" && "Full Refund"}
                    {resolution === "partial-refund" && `Partial Refund (${partialPercent}%)`}
                    {resolution === "return-item" && "Return Item"}
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={() => setConfirmed(!confirmed)}
                  className="w-4 h-4 mt-0.5 text-orange accent-orange rounded"
                />
                <span className="text-sm text-text-2">I confirm the information provided is accurate and complete to the best of my knowledge.</span>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`px-5 py-2.5 border border-border rounded-xl text-sm font-medium transition-colors ${
                step === 1 ? "opacity-0 pointer-events-none" : "hover:bg-off-white text-text-2"
              }`}
            >
              Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={() => canProceed() && setStep(step + 1)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  canProceed()
                    ? "bg-orange text-white hover:bg-orange-600"
                    : "bg-gray-100 text-text-4 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  canProceed()
                    ? "bg-orange text-white hover:bg-orange-600"
                    : "bg-gray-100 text-text-4 cursor-not-allowed"
                }`}
              >
                Submit Dispute
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
