"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Key, Plus, Copy, CheckCircle2, X, Eye, EyeOff,
  Trash2, Search, Calendar, Activity, BarChart3,
  AlertTriangle, RefreshCw, Save, ExternalLink,
} from "lucide-react";

const demoKeys = [
  { id: "KEY-001", name: "Production API", key: "kcc_live_8a7b3c2d1e9f0g4h5i6j7k8l9m0n1o2p", prefix: "kcc_live_8a7b...", status: "active", lastUsed: "2 min ago", created: "2026-01-15", expires: "2027-01-15", requests: 152340, rateLimit: 10000, scopes: ["read_products", "write_orders", "read_customers"] },
  { id: "KEY-002", name: "Staging API", key: "kcc_test_9b8c7d6e5f4g3h2i1j0k9l8m7n6o5p4q", prefix: "kcc_test_9b8c...", status: "active", lastUsed: "15 min ago", created: "2026-02-01", expires: "2027-02-01", requests: 28450, rateLimit: 5000, scopes: ["read_products", "read_orders"] },
  { id: "KEY-003", name: "Mobile App", key: "kcc_live_3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r", prefix: "kcc_live_3c4d...", status: "active", lastUsed: "1 hour ago", created: "2026-03-10", expires: "2027-03-10", requests: 89200, rateLimit: 5000, scopes: ["read_products", "read_customers"] },
  { id: "KEY-004", name: "Analytics Export", key: "kcc_live_5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t", prefix: "kcc_live_5e6f...", status: "inactive", lastUsed: "5 days ago", created: "2026-01-20", expires: "2026-07-20", requests: 1200, rateLimit: 1000, scopes: ["read_analytics"] },
  { id: "KEY-005", name: "Legacy Integration", key: "kcc_live_7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u", prefix: "kcc_live_7f8g...", status: "revoked", lastUsed: "30 days ago", created: "2025-06-01", expires: "2026-06-01", requests: 456000, rateLimit: 10000, scopes: ["read_products", "write_products", "read_orders", "write_orders", "read_customers"] },
];

const allScopes = [
  "read_products", "write_products", "read_orders", "write_orders",
  "read_customers", "write_customers", "read_analytics", "write_analytics",
  "read_payments", "write_payments", "read_vendors", "write_vendors",
  "admin_full_access",
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(demoKeys);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [newKeyExpiry, setNewKeyExpiry] = useState("365");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleScope = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const generateKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let key = "kcc_live_";
    for (let i = 0; i < 40; i++) key += chars[Math.floor(Math.random() * chars.length)];
    setGeneratedKey(key);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, status: "revoked" } : k));
  };

  const filteredKeys = keys.filter((k) =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.prefix.includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    inactive: "bg-yellow-50 text-yellow-700",
    revoked: "bg-red-50 text-red",
  };

  return (
    <AdminShell title="API Keys" subtitle="Manage API access keys for integrations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search API keys..." className="h-9 pl-9 pr-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue w-[280px]" />
          </div>
          <Button onClick={() => { setShowCreate(true); setGeneratedKey(null); }} size="sm" className="gap-1.5">
            <Plus size={14} /> Create API Key
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">{keys.filter((k) => k.status === "active").length}</p>
            <p className="text-xs text-text-4">Active Keys</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">{keys.reduce((s, k) => s + k.requests, 0).toLocaleString()}</p>
            <p className="text-xs text-text-4">Total Requests</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">99.97%</p>
            <p className="text-xs text-text-4">Uptime</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-text-1">42ms</p>
            <p className="text-xs text-text-4">Avg Response</p>
          </div>
        </div>

        {/* API Keys List */}
        <div className="space-y-3">
          {filteredKeys.map((key) => (
            <div key={key.id} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    key.status === "active" ? "bg-blue-50" : key.status === "revoked" ? "bg-red-50" : "bg-gray-100"
                  }`}>
                    <Key size={18} className={key.status === "active" ? "text-blue" : key.status === "revoked" ? "text-red" : "text-text-4"} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-text-1">{key.name}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${statusColors[key.status]}`}>{key.status}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {revealedKeys.has(key.id) ? (
                        <code className="text-xs font-mono text-text-3 bg-gray-50 px-2 py-1 rounded">{key.key}</code>
                      ) : (
                        <code className="text-xs font-mono text-text-4">{key.prefix}...</code>
                      )}
                      <button onClick={() => toggleReveal(key.id)} className="text-text-4 hover:text-blue p-0.5">
                        {revealedKeys.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => copyKey(key.key)} className="text-text-4 hover:text-blue p-0.5">
                        {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-text-4">
                      <span>Rate limit: {key.rateLimit.toLocaleString()}/hour</span>
                      <span>·</span>
                      <span>{key.requests.toLocaleString()} requests</span>
                      <span>·</span>
                      <span>Expires {key.expires}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {key.scopes.map((scope) => (
                        <span key={scope} className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue rounded-full font-medium">{scope}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue" title="View Usage">
                    <BarChart3 size={14} />
                  </button>
                  {key.status !== "revoked" && (
                    <button onClick={() => revokeKey(key.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-text-4 hover:text-red" title="Revoke">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[520px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-lg">{generatedKey ? "API Key Created" : "Create API Key"}</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>

            {generatedKey ? (
              <div className="p-5 space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">Save Your API Key</p>
                    <p className="text-xs text-yellow-700 mt-1">This is the only time you&apos;ll see the full key. Copy it now and store securely.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-xs font-mono break-all">{generatedKey}</code>
                  <Button variant="outline" size="sm" onClick={() => copyKey(generatedKey)} className="shrink-0">
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <Button className="w-full" onClick={() => setShowCreate(false)}>Done</Button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Key Name</label>
                  <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production API" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Expiration</label>
                  <select value={newKeyExpiry} onChange={(e) => setNewKeyExpiry(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-white">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                    <option value="never">Never expires</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 mb-1 block">Permissions (Scopes)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allScopes.map((scope) => (
                      <button key={scope} onClick={() => toggleScope(scope)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                          newKeyScopes.includes(scope) ? "border-blue bg-blue-50 text-blue" : "border-border text-text-3 hover:border-gray-300"
                        }`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                          newKeyScopes.includes(scope) ? "bg-blue border-blue" : "border-gray-300"
                        }`}>
                          {newKeyScopes.includes(scope) && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <code className="text-[10px]">{scope}</code>
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={generateKey} disabled={!newKeyName || newKeyScopes.length === 0} className="w-full gap-1.5">
                  <Key size={14} /> Generate API Key
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
