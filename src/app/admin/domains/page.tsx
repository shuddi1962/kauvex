"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [countryDomains, setCountryDomains] = useState<CountryDomainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [provisioningAll, setProvisioningAll] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

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

  // Compute stats
  const stats = {
    total: domains.length,
    active: domains.filter((d) => d.status === "active").length,
    pending: domains.filter((d) => d.status === "awaiting_dns").length,
    provisioning: domains.filter((d) => d.status === "provisioning").length,
    errors: domains.filter((d) => d.status === "error").length,
  };

  // Filtered domains
  const filtered = domains.filter((d) => {
    if (typeFilter !== "all" && d.domain_type !== typeFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    return true;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400 bg-green-400/10";
      case "provisioning": case "awaiting_dns": return "text-yellow-400 bg-yellow-400/10";
      case "error": return "text-red-400 bg-red-400/10";
      case "removed": return "text-gray-400 bg-gray-400/10";
      case "not_provisioned": return "text-gray-500 bg-gray-500/10";
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

  return (
    <div className="min-h-screen bg-[#0A1628] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#FF6B00]">Domain Management</h1>
          <p className="text-gray-400 mt-1">Manage all Kauvex domains, vendor domains, and SSL certificates</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg border ${message.type === "success" ? "bg-green-400/10 border-green-400/30 text-green-400" : "bg-red-400/10 border-red-400/30 text-red-400"}`}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "Total Domains", value: stats.total, color: "text-white" },
            { label: "Active", value: stats.active, color: "text-green-400" },
            { label: "Pending DNS", value: stats.pending, color: "text-yellow-400" },
            { label: "Provisioning", value: stats.provisioning, color: "text-yellow-400" },
            { label: "Errors", value: stats.errors, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Country Domains Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Kauvex Country Domains</h2>
              <p className="text-gray-400 text-sm">15 country-specific TLDs for localized storefronts</p>
            </div>
            <button
              onClick={handleProvisionAll}
              disabled={provisioningAll}
              className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF8533] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {provisioningAll ? "Provisioning..." : "Provision All"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {countryDomains.map((cd) => (
              <div key={cd.countryCode} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-mono font-medium">{cd.domain}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cd.countryCode} · {cd.currency} · {cd.language}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(cd.status)}`}>{cd.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All Domains Table */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Domains</h2>
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="all">All Types</option>
                <option value="subdomain">Subdomain</option>
                <option value="custom">Custom Domain</option>
                <option value="kauvex_country">Country Domain</option>
                <option value="whitelabel">Whitelabel</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="provisioning">Provisioning</option>
                <option value="awaiting_dns">Awaiting DNS</option>
                <option value="error">Error</option>
                <option value="removed">Removed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No domains found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Domain</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Vendor</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">SSL</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-mono">{d.domain}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{d.domain_type}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{d.vendor_id || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(d.status)}`}>{d.status}</span>
                      </td>
                      <td className={`py-3 px-4 ${sslColor(d.ssl_status)}`}>{d.ssl_status}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors">View</button>
                          <button className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
