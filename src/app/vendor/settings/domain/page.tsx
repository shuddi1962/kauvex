"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe, Link2, Shield, Copy, CheckCircle2, AlertCircle,
  Loader2, ExternalLink, Trash2, Search, ChevronRight,
  Wifi, WifiOff, Lock, Unlock, Store
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

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
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"subdomain" | "custom">("subdomain");

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

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  useEffect(() => {
    if (subdomain.length < 3) { setAvailability(null); return; }
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
        setMessage({ type: "success", text: `${subdomain}.kauvex.com is now live!` });
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!confirm(`Remove ${domain}? Your store will no longer be accessible at this URL.`)) return;
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

  const statusConfig = (status: string) => {
    switch (status) {
      case "active": return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2, label: "Active" };
      case "provisioning": case "awaiting_dns": return { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Loader2, label: "Provisioning" };
      case "error": return { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: AlertCircle, label: "Error" };
      default: return { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: Globe, label: status };
    }
  };

  const activeDomain = domains.find((d) => d.status === "active");
  const storeUrl = activeDomain ? `https://${activeDomain.domain}` : null;

  return (
    <VendorShell title="Domain Settings" subtitle="Manage your store domain and URL">
      <div className="space-y-6">
        {/* Message Toast */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Current Store URL */}
        <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                <Store className="text-[#FF6B00]" size={24} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Your Store is Live At</h3>
                {loading ? (
                  <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
                ) : storeUrl ? (
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold font-mono text-white">{activeDomain!.domain}</p>
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                      <CheckCircle2 size={12} /> Live
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-400">No domain configured yet — set one up below</p>
                )}
              </div>
            </div>
            {storeUrl && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(storeUrl, "main")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-medium transition-colors"
                >
                  {copied === "main" ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied === "main" ? "Copied!" : "Copy URL"}
                </button>
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF8533] rounded-xl text-sm font-medium text-white transition-colors"
                >
                  <ExternalLink size={14} />
                  Visit Store
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Domain Type Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("subdomain")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "subdomain" ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Wifi size={16} />
            Subdomain
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "custom" ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Globe size={16} />
            Custom Domain
          </button>
        </div>

        {/* Subdomain Tab */}
        {activeTab === "subdomain" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Link2 className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Free Subdomain</h3>
                <p className="text-sm text-gray-400">Get a free URL under kauvex.com — instant setup, SSL included</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="your-store-name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/50 font-mono text-lg transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">.kauvex.com</span>
              </div>
              <button
                onClick={handleProvisionSubdomain}
                disabled={!availability?.available || provisioning}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#FF6B00] hover:bg-[#FF8533] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-[#FF6B00]/20"
              >
                {provisioning ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {provisioning ? "Setting Up..." : "Claim URL"}
              </button>
            </div>

            {/* Availability Status */}
            {subdomain.length >= 3 && (
              <div className="mt-4">
                {checkingAvailability ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 size={14} className="animate-spin" />
                    Checking availability...
                  </div>
                ) : availability ? (
                  availability.available ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
                      <CheckCircle2 size={14} />
                      <span><strong>{subdomain}.kauvex.com</strong> is available!</span>
                    </div>
                  ) : (
                    <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                      <p className="text-sm text-red-400 flex items-center gap-2">
                        <AlertCircle size={14} />
                        <strong>{subdomain}.kauvex.com</strong> is taken
                        {availability.reason && <span className="text-gray-500">({availability.reason})</span>}
                      </p>
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
        )}

        {/* Custom Domain Tab */}
        {activeTab === "custom" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Globe className="text-purple-400" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Custom Domain</h3>
                <p className="text-sm text-gray-400">Use your own domain name (e.g., mystore.com)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="shop.yourdomain.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/50 font-mono text-lg transition-all"
              />
              <button
                onClick={handleProvisionCustom}
                disabled={!customDomain.trim() || customProvisioning}
                className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all"
              >
                {customProvisioning ? <Loader2 size={16} className="animate-spin" /> : <Link2 size={16} />}
                {customProvisioning ? "Adding..." : "Add Domain"}
              </button>
            </div>

            {/* DNS Instructions */}
            <div className="mt-6 bg-white/5 rounded-xl p-5 border border-white/5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Shield size={14} className="text-[#FF6B00]" />
                DNS Configuration Required
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <p className="text-sm text-gray-300">Add a <strong>CNAME</strong> record pointing to:</p>
                    <code className="block mt-1 px-3 py-1.5 bg-black/30 rounded-lg text-[#FF6B00] font-mono text-sm">cname.vercel-dns.com</code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <p className="text-sm text-gray-300">Or add an <strong>A record</strong> pointing to:</p>
                    <code className="block mt-1 px-3 py-1.5 bg-black/30 rounded-lg text-[#FF6B00] font-mono text-sm">76.76.21.21</code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <p className="text-sm text-gray-300">SSL certificate is auto-provisioned once DNS propagates (usually 5-30 minutes)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Configured Domains */}
        {!loading && domains.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Globe size={18} className="text-[#FF6B00]" />
              All Configured Domains
            </h3>
            <div className="space-y-3">
              {domains.map((d) => {
                const sc = statusConfig(d.status);
                const StatusIcon = sc.icon;
                return (
                  <div key={d.id} className="flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-xl p-4 border border-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.status === "active" ? "bg-emerald-500/10" : "bg-white/5"}`}>
                        {d.status === "active" ? <Globe className="text-emerald-400" size={18} /> : <Globe className="text-gray-500" size={18} />}
                      </div>
                      <div>
                        <p className="font-mono font-medium text-white">{d.domain}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 capitalize">{d.domain_type.replace("_", " ")}</span>
                          <span className="text-gray-600">·</span>
                          <span className={`text-xs flex items-center gap-1 ${d.ssl_status === "issued" ? "text-emerald-400" : "text-gray-500"}`}>
                            {d.ssl_status === "issued" ? <Lock size={10} /> : <Unlock size={10} />}
                            SSL {d.ssl_status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${sc.color}`}>
                        <StatusIcon size={12} className={d.status === "provisioning" ? "animate-spin" : ""} />
                        {sc.label}
                      </span>
                      <button
                        onClick={() => handleCopy(`https://${d.domain}`, d.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy URL"
                      >
                        {copied === d.id ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
                      </button>
                      <a
                        href={`https://${d.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Visit"
                      >
                        <ExternalLink size={14} className="text-gray-400" />
                      </a>
                      {d.domain_type !== "core" && (
                        <button
                          onClick={() => handleRemoveDomain(d.domain)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </VendorShell>
  );
}
