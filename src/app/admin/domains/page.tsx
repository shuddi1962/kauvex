"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe, Link2, Shield, CheckCircle2, AlertCircle,
  Loader2, ExternalLink, Search, Filter, Wifi,
  Lock, Unlock, MapPin, Languages, DollarSign, Eye,
  Trash2, RefreshCw, Server, ChevronDown
} from "lucide-react";
import AdminShell from "@/components/admin/admin-shell";

interface DomainRecord {
  id: string;
  domain: string;
  domain_type: string;
  status: string;
  ssl_status: string;
  vendor_id: string | null;
  created_at: string;
  activated_at: string | null;
  error_message: string | null;
}

interface CountryDomainEntry {
  countryCode: string;
  domain: string;
  currency: string;
  language: string;
  status: string;
  sslStatus: string;
  activatedAt: string | null;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", UK: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", NG: "🇳🇬",
  IN: "🇮🇳", AE: "🇦🇪", DE: "🇩🇪", FR: "🇫🇷", GH: "🇬🇭",
  KE: "🇰🇪", ZA: "🇿🇦", SA: "🇸🇦", BR: "🇧🇷", JP: "🇯🇵",
};

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [countryDomains, setCountryDomains] = useState<CountryDomainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [provisioningAll, setProvisioningAll] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "all" | "country">("overview");

  const fetchDomains = useCallback(async () => {
    try {
      const [domainsRes, countryRes] = await Promise.all([
        fetch("/api/v1/domains/status"),
        fetch("/api/v1/domains/country-domains"),
      ]);
      const domainsData = await domainsRes.json();
      const countryData = await countryRes.json();
      setDomains(domainsData.domains || []);
      setCountryDomains(countryData.domains || []);
    } catch {
      setMessage({ type: "error", text: "Failed to load domains" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  const handleProvisionAll = async () => {
    setProvisioningAll(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/domains/country-domains", { method: "POST" });
      const data = await res.json();
      setMessage({
        type: data.errors.length > 0 ? "error" : "success",
        text: `Provisioned ${data.provisioned} domain(s). ${data.errors.length} error(s).`,
      });
      fetchDomains();
    } catch {
      setMessage({ type: "error", text: "Provisioning failed" });
    } finally {
      setProvisioningAll(false);
    }
  };

  const stats = {
    total: domains.length + countryDomains.length,
    active: domains.filter((d) => d.status === "active").length + countryDomains.filter((d) => d.status === "active").length,
    pending: domains.filter((d) => d.status === "awaiting_dns").length + countryDomains.filter((d) => d.status === "pending").length,
    provisioning: domains.filter((d) => d.status === "provisioning").length + countryDomains.filter((d) => d.status === "provisioning").length,
    errors: domains.filter((d) => d.status === "error").length + countryDomains.filter((d) => d.status === "error").length,
    countryReady: countryDomains.filter((d) => d.status === "active").length,
    vendorSubdomains: domains.filter((d) => d.domain_type === "subdomain").length,
    vendorCustom: domains.filter((d) => d.domain_type === "custom").length,
  };

  const filtered = domains.filter((d) => {
    if (typeFilter !== "all" && d.domain_type !== typeFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (searchQuery && !d.domain.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const statusConfig = (status: string) => {
    switch (status) {
      case "active": return { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2, label: "Active" };
      case "provisioning": case "awaiting_dns": return { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Loader2, label: "Provisioning" };
      case "error": return { color: "text-red-400 bg-red-400/10 border-red-400/20", icon: AlertCircle, label: "Error" };
      case "removed": return { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: Globe, label: "Removed" };
      case "not_provisioned": return { color: "text-gray-500 bg-gray-500/10 border-gray-500/20", icon: Globe, label: "Not Provisioned" };
      default: return { color: "text-gray-400 bg-gray-400/10 border-gray-400/20", icon: Globe, label: status };
    }
  };

  return (
    <AdminShell title="Domain Management" subtitle="Manage all Kauvex domains, vendor stores, and SSL certificates">
      <div className="space-y-6">
        {/* Message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${message.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
            {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Domains", value: stats.total, icon: Globe, color: "text-white", bg: "bg-white/5" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/5" },
            { label: "Pending DNS", value: stats.pending, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/5" },
            { label: "Errors", value: stats.errors, icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/5" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-white/5 rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`${s.color} opacity-60`} size={20} />
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
          {[
            { id: "overview" as const, label: "Overview", icon: Globe },
            { id: "all" as const, label: "All Domains", icon: Server },
            { id: "country" as const, label: "Country TLDs", icon: MapPin },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Wifi className="text-blue-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-white">Vendor Subdomains</h3>
                </div>
                <p className="text-3xl font-bold text-white">{stats.vendorSubdomains}</p>
                <p className="text-sm text-gray-400 mt-1">stores on *.kauvex.com</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Globe className="text-purple-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-white">Custom Domains</h3>
                </div>
                <p className="text-3xl font-bold text-white">{stats.vendorCustom}</p>
                <p className="text-sm text-gray-400 mt-1">merchant-owned domains</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                    <MapPin className="text-[#FF6B00]" size={20} />
                  </div>
                  <h3 className="font-semibold text-white">Country TLDs</h3>
                </div>
                <p className="text-3xl font-bold text-white">{stats.countryReady}<span className="text-lg text-gray-500">/{countryDomains.length}</span></p>
                <p className="text-sm text-gray-400 mt-1">active country domains</p>
              </div>
            </div>

            {/* Core Kauvex Domains */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={18} className="text-[#FF6B00]" />
                Core Platform Domains
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {domains.filter((d) => d.domain_type === "core").map((d) => {
                  const sc = statusConfig(d.status);
                  return (
                    <div key={d.id} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="font-mono text-sm text-white truncate">{d.domain}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs flex items-center gap-1 ${sc.color.split(" ")[0]}`}>
                          <CheckCircle2 size={10} />
                          {sc.label}
                        </span>
                        <span className={`text-xs ${d.ssl_status === "issued" ? "text-emerald-400" : "text-gray-500"}`}>
                          {d.ssl_status === "issued" ? "🔒" : "🔓"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ALL DOMAINS TAB */}
        {activeTab === "all" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Server size={18} className="text-[#FF6B00]" />
                All Registered Domains
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search domains..."
                    className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6B00] w-48"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="all">All Types</option>
                  <option value="core">Core</option>
                  <option value="subdomain">Subdomain</option>
                  <option value="custom">Custom</option>
                  <option value="kauvex_country">Country</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="provisioning">Provisioning</option>
                  <option value="awaiting_dns">Awaiting DNS</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="mx-auto text-gray-600 mb-3" size={40} />
                <p className="text-gray-400">No domains found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((d) => {
                  const sc = statusConfig(d.status);
                  const StatusIcon = sc.icon;
                  return (
                    <div key={d.id} className="flex items-center justify-between bg-white/5 hover:bg-white/8 rounded-xl p-4 border border-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.status === "active" ? "bg-emerald-500/10" : "bg-white/5"}`}>
                          <Globe className={d.status === "active" ? "text-emerald-400" : "text-gray-500"} size={18} />
                        </div>
                        <div>
                          <p className="font-mono font-medium text-white">{d.domain}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 capitalize">{d.domain_type.replace("_", " ")}</span>
                            {d.vendor_id && <span className="text-xs text-gray-500">Vendor: {d.vendor_id.slice(0, 8)}...</span>}
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
                        <a href={`https://${d.domain}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Visit">
                          <ExternalLink size={14} className="text-gray-400" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* COUNTRY TLDs TAB */}
        {activeTab === "country" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#FF6B00]/5 border border-[#FF6B00]/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                    <MapPin className="text-[#FF6B00]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">Kauvex Country Domains</h3>
                    <p className="text-sm text-gray-400">{stats.countryReady} of {countryDomains.length} domains active — localized storefronts for each market</p>
                  </div>
                </div>
                <button
                  onClick={handleProvisionAll}
                  disabled={provisioningAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF8533] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-[#FF6B00]/20"
                >
                  {provisioningAll ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {provisioningAll ? "Provisioning..." : "Provision All Pending"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryDomains.map((cd) => {
                const sc = statusConfig(cd.status);
                const StatusIcon = sc.icon;
                const flag = COUNTRY_FLAGS[cd.countryCode] || "🌍";
                return (
                  <div key={cd.countryCode} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{flag}</span>
                        <div>
                          <p className="font-mono font-semibold text-white">{cd.domain}</p>
                          <p className="text-xs text-gray-400">{cd.countryCode}</p>
                        </div>
                      </div>
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${sc.color}`}>
                        <StatusIcon size={12} className={cd.status === "provisioning" ? "animate-spin" : ""} />
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <DollarSign size={12} />
                        {cd.currency}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Languages size={12} />
                        {cd.language.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        {cd.sslStatus === "issued" ? <Lock size={12} className="text-emerald-400" /> : <Unlock size={12} />}
                        SSL {cd.sslStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
