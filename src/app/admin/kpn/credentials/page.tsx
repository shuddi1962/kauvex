"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, FileText, Eye, ExternalLink } from "lucide-react";

interface Credential {
  id: string;
  professionalId: string;
  credentialType: string;
  issuingBody: string | null;
  certificateNumber: string | null;
  documentUrl: string | null;
  status: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  professional?: { companyName: string | null; primaryCategory: string };
}

export default function CredentialsPage() {
  const [pending, setPending] = useState<Credential[]>([]);
  const [history, setHistory] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCredentials = () => {
    setLoading(true);
    fetch("/api/v1/kpn/credentials")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const all = res.data || [];
          setPending(all.filter((c: Credential) => c.status === "pending"));
          setHistory(all.filter((c: Credential) => c.status !== "pending"));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCredentials(); }, []);

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/v1/kpn/credentials/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified" }),
      });
      fetchCredentials();
    } catch {}
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch(`/api/v1/kpn/credentials/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      fetchCredentials();
    } catch {}
    setActionLoading(null);
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, string> = {
      certification: "Certification",
      license: "License",
      trade_test: "Trade Test",
      oem_cert: "OEM Cert",
      background_check: "Background Check",
      insurance: "Insurance",
      nin: "National ID (NIN)",
      bvn: "Bank Verification (BVN)",
      cac: "CAC Registration",
    };
    return labels[type] || type;
  };

  return (
    <div>
      {/* Pending Queue */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-sm text-kauvex-navy">Pending Verification</h3>
          <p className="text-xs text-gray-400 mt-0.5">{pending.length} credentials awaiting review</p>
        </div>

        {loading ? (
          <div className="p-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <CheckCircle size={32} className="mx-auto text-green-300 mb-2" />
            All caught up! No pending verifications.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pending.map((cred) => (
              <div key={cred.id} className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-kauvex-navy">
                      {cred.professional?.companyName || "Professional"}
                    </p>
                    <p className="text-xs text-gray-500">{typeLabel(cred.credentialType)}</p>
                    {cred.issuingBody && (
                      <p className="text-xs text-gray-400">{cred.issuingBody}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Submitted {new Date(cred.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-4">
                  {cred.documentUrl && (
                    <a
                      href={cred.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-kauvex-navy"
                      title="View document"
                    >
                      <Eye size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => handleVerify(cred.id)}
                    disabled={actionLoading === cred.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle size={13} /> Verify
                  </button>
                  <button
                    onClick={() => handleReject(cred.id)}
                    disabled={actionLoading === cred.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-sm text-kauvex-navy">Verification History</h3>
          <p className="text-xs text-gray-400 mt-0.5">{history.length} previously processed</p>
        </div>

        {history.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">No verification history yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((cred) => (
              <div key={cred.id} className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-10 ${
                    cred.status === "verified" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    {cred.status === "verified" ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-kauvex-navy">
                      {cred.professional?.companyName || "Professional"}
                    </p>
                    <p className="text-xs text-gray-500">{typeLabel(cred.credentialType)}</p>
                    {cred.issuingBody && (
                      <p className="text-xs text-gray-400">{cred.issuingBody}</p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  cred.status === "verified" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {cred.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
