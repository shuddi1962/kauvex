"use client";

import { useState, useEffect, useCallback } from "react";

interface DomainRecord {
  id: string;
  domain: string;
  domain_type: string;
  status: string;
  ssl_status: string;
  vendor_id: string | null;
  vercel_domain_id: string | null;
  created_at: string;
  activated_at: string | null;
}

export default function VendorDomainSettingsPage() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState("");
  const [availability, setAvailability] = useState<{ available: boolean; reason?: string; suggestions: string[] } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  const [customProvisioning, setCustomProvisioning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/domains/status");
      const data = await res.json();
      setDomains(data.domains || []);
    } catch {
      setMessage({ type: "error", text: "Failed to load domains" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Debounced availability check
  useEffect(() => {
    if (subdomain.length < 3) {
      setAvailability(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingAvailability(true);
      try {
        const res = await fetch(`/api/v1/domains/check-availability?subdomain=${encodeURIComponent(subdomain)}`);
        const data = await res.json();
        setAvailability(data);
      } catch {
        setAvailability({ available: false, reason: "check_failed", suggestions: [] });
      } finally {
        setCheckingAvailability(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [subdomain]);

  const handleProvisionSubdomain = async () => {
    if (!availability?.available) return;
    setProvisioning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/domains/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: "current-vendor", domain: subdomain, type: "subdomain" }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: `Subdomain ${subdomain}.kauvex.com provisioned!` });
        setSubdomain("");
        setAvailability(null);
        fetchDomains();
      }
    } catch {
      setMessage({ type: "error", text: "Provisioning failed" });
    } finally {
      setProvisioning(false);
    }
  };

  const handleProvisionCustom = async () => {
    if (!customDomain.trim()) return;
    setCustomProvisioning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/domains/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: "current-vendor", domain: customDomain.trim(), type: "custom" }),
      });
      const data = await res.json();
      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Custom domain added. Configure DNS as shown below." });
        setCustomDomain("");
        fetchDomains();
      }
    } catch {
      setMessage({ type: "error", text: "Provisioning failed" });
    } finally {
      setCustomProvisioning(false);
    }
  };

  const handleCopyUrl = (domain: string) => {
    navigator.clipboard.writeText(`https://${domain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!confirm(`Remove ${domain}? This cannot be undone.`)) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/v1/domains/remove?vendor_id=current-vendor&domain=${encodeURIComponent(domain)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `${domain} removed` });
        fetchDomains();
      } else {
        setMessage({ type: "error", text: "Failed to remove domain" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove domain" });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400 bg-green-400/10";
      case "provisioning": case "awaiting_dns": return "text-yellow-400 bg-yellow-400/10";
      case "error": return "text-red-400 bg-red-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const sslColor = (ssl: string) => {
    switch (ssl) {
      case "issued": return "text-green-400";
      case "pending": return "text-yellow-400";
      case "error": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const activeDomain = domains.find((d) => d.status === "active" && d.domain_type === "subdomain") || domains.find((d) => d.status === "active");

  return (
    <div className="min-h-screen bg-[#0A1628] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#FF6B00]">Domain Settings</h1>
          <p className="text-gray-400 mt-1">Manage your store&apos;s domain and URL</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${message.type === "success" ? "bg-green-400/10 border-green-400/30 text-green-400" : "bg-red-400/10 border-red-400/30 text-red-400"}`}>
            {message.text}
          </div>
        )}

        {/* Current Domain Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Current Store URL</h2>
          {loading ? (
            <div className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ) : activeDomain ? (
            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <div>
                <p className="text-xl font-mono font-bold">{activeDomain.domain}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(activeDomain.status)}`}>
                    {activeDomain.status}
                  </span>
                  <span className={`text-xs ${sslColor(activeDomain.ssl_status)}`}>
                    SSL: {activeDomain.ssl_status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleCopyUrl(activeDomain.domain)}
                className="px-4 py-2 bg-[#FF6B00] hover:bg-[#FF8533] text-white rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          ) : (
            <p className="text-gray-400">No active domain configured yet.</p>
          )}
        </div>

        {/* Subdomain Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Subdomain</h2>
          <p className="text-gray-400 text-sm mb-4">Choose a free subdomain under kauvex.com</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-store"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">.kauvex.com</span>
            </div>
            <button
              onClick={handleProvisionSubdomain}
              disabled={!availability?.available || provisioning}
              className="px-6 py-3 bg-[#FF6B00] hover:bg-[#FF8533] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {provisioning ? "Provisioning..." : "Claim"}
            </button>
          </div>
          {subdomain.length >= 3 && (
            <div className="mt-3">
              {checkingAvailability ? (
                <p className="text-gray-400 text-sm">Checking availability...</p>
              ) : availability ? (
                availability.available ? (
                  <p className="text-green-400 text-sm">✓ {subdomain}.kauvex.com is available!</p>
                ) : (
                  <div>
                    <p className="text-red-400 text-sm">✗ {subdomain}.kauvex.com is not available ({availability.reason})</p>
                    {availability.suggestions.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {availability.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSubdomain(s)}
                            className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-gray-300 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>

        {/* Custom Domain Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-2">Custom Domain</h2>
          <p className="text-gray-400 text-sm mb-4">Use your own domain for your store</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="shop.yourdomain.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] font-mono"
            />
            <button
              onClick={handleProvisionCustom}
              disabled={!customDomain.trim() || customProvisioning}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {customProvisioning ? "Adding..." : "Add Domain"}
            </button>
          </div>
          <div className="mt-4 p-4 bg-white/5 rounded-lg text-sm text-gray-400">
            <p className="font-medium text-gray-300 mb-2">DNS Configuration Required:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Add a CNAME record pointing to <code className="text-[#FF6B00]">cname.vercel-dns.com</code></li>
              <li>Or add an A record pointing to <code className="text-[#FF6B00]">76.76.21.21</code></li>
              <li>SSL certificate will be auto-provisioned once DNS propagates</li>
            </ol>
          </div>
        </div>

        {/* All Domains */}
        {!loading && domains.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">All Domains</h2>
            <div className="space-y-3">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                  <div>
                    <p className="font-mono font-medium">{d.domain}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{d.domain_type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(d.status)}`}>{d.status}</span>
                      <span className={`text-xs ${sslColor(d.ssl_status)}`}>SSL: {d.ssl_status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(d.domain)}
                      className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleRemoveDomain(d.domain)}
                      className="text-xs px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
