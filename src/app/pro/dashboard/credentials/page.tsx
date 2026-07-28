"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  ChevronLeft,
  CheckCircle,
  X,
  Upload,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";

interface Credential {
  id: string;
  type: string;
  issuingBody: string;
  certificateNumber: string;
  documentUrl?: string;
  status: "pending" | "verified" | "rejected";
  createdAt: string;
}

export default function ProCredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newCred, setNewCred] = useState({ type: "", issuingBody: "", certificateNumber: "", documentUrl: "" });

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/kpn/credentials");
      if (res.ok) {
        const data = await res.json();
        setCredentials(data.credentials || []);
      }
    } catch {
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleAdd = async () => {
    setError("");
    if (!newCred.type || !newCred.issuingBody || !newCred.certificateNumber) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/kpn/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCred),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add credential");
      }
      setNewCred({ type: "", issuingBody: "", certificateNumber: "", documentUrl: "" });
      setShowForm(false);
      fetchCredentials();
    } catch (err: any) {
      setError(err.message || "Failed to add credential.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600",
    verified: "bg-green-50 text-green-600",
    rejected: "bg-red-50 text-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/pro/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Award className="w-6 h-6 text-orange" /> My Credentials
          </h1>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 bg-orange hover:bg-orange/90 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Credential
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {showForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy">New Credential</h3>
                  <button onClick={() => { setShowForm(false); setError(""); }}
                    className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Credential Type *</label>
                  <input type="text" value={newCred.type} onChange={(e) => setNewCred({ ...newCred, type: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                    placeholder="e.g., Bachelor's Degree, COREN Certification" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Issuing Body *</label>
                  <input type="text" value={newCred.issuingBody} onChange={(e) => setNewCred({ ...newCred, issuingBody: e.target.value })}
                    className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                    placeholder="e.g., University of Lagos, COREN" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Certificate Number *</label>
                    <input type="text" value={newCred.certificateNumber} onChange={(e) => setNewCred({ ...newCred, certificateNumber: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="Certificate ID" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Document URL (optional)</label>
                    <input type="url" value={newCred.documentUrl} onChange={(e) => setNewCred({ ...newCred, documentUrl: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                      placeholder="https://..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => { setShowForm(false); setError(""); }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAdd} disabled={submitting}
                    className="inline-flex items-center gap-1.5 bg-orange hover:bg-orange/90 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {submitting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                    ) : "Submit for Verification"}
                  </button>
                </div>
              </div>
            )}

            {credentials.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-navy mb-1">No credentials yet</h3>
                <p className="text-sm text-gray-500 mb-4">Add your professional credentials to get verified and increase your tier.</p>
                <button onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 bg-orange hover:bg-orange/90 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" /> Add Your First Credential
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {credentials.map((cred) => (
                  <div key={cred.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-orange" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-navy">{cred.type}</h3>
                        <p className="text-sm text-gray-500">{cred.issuingBody}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cred.certificateNumber}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Added {new Date(cred.createdAt).toLocaleDateString()}</span>
                          {cred.documentUrl && (
                            <a href={cred.documentUrl} target="_blank" rel="noopener noreferrer"
                              className="text-orange hover:underline flex items-center gap-1">
                              <Upload className="w-3 h-3" /> View Document
                            </a>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${statusStyles[cred.status] || "bg-gray-100 text-gray-600"}`}>
                        {cred.status === "verified" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {cred.status === "pending" && <Clock className="w-3 h-3 inline mr-1" />}
                        {cred.status === "rejected" && <AlertCircle className="w-3 h-3 inline mr-1" />}
                        {cred.status.charAt(0).toUpperCase() + cred.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}