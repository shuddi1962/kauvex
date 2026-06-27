"use client";

import { useState } from "react";
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Activity,
  Shield,
  Clock,
  Globe,
  RefreshCw,
  X,
  TrendingUp,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  fullKey: string;
  created: string;
  lastUsed: string;
  status: "active" | "revoked";
  callsThisMonth: number;
}

export default function ExpressApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: "1", name: "Production Server", keyPreview: "kve_live_aB3c...xY9z", fullKey: "kve_live_aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ9", created: "2026-03-15", lastUsed: "2026-06-26T14:32:00", status: "active", callsThisMonth: 12847 },
    { id: "2", name: "Staging Environment", keyPreview: "kve_test_mN2p...kL7q", fullKey: "kve_test_mN2pQ3rS4tU5vW6xY7zA8bC9dE0fG1hI2jK3lQ7", created: "2026-04-22", lastUsed: "2026-06-25T09:15:00", status: "active", callsThisMonth: 3421 },
    { id: "3", name: "Mobile App", keyPreview: "kve_live_rS8w...pQ4m", fullKey: "kve_live_rS8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0", created: "2026-05-10", lastUsed: "2026-06-26T16:45:00", status: "active", callsThisMonth: 8934 },
    { id: "4", name: "Legacy Integration", keyPreview: "kve_live_dE6f...vW3x", fullKey: "kve_live_dE6fG7hI8jK9lM0nO1pQ2rS3tU4vW5xY6zA7bC8", created: "2026-01-05", lastUsed: "2026-02-18T11:20:00", status: "revoked", callsThisMonth: 0 },
  ]);

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState<"live" | "test">("live");
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const totalCallsToday = 1847;
  const totalCallsMonth = 25202;
  const rateLimit = 1000;

  const handleGenerate = () => {
    if (!newKeyName.trim()) return;
    const prefix = newKeyType === "live" ? "kve_live_" : "kve_test_";
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const suffix = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const fullKey = prefix + suffix;
    const preview = `${fullKey.slice(0, 11)}...${fullKey.slice(-4)}`;

    setKeys((prev) => [
      {
        id: Date.now().toString(),
        name: newKeyName,
        keyPreview: preview,
        fullKey,
        created: new Date().toISOString().slice(0, 10),
        lastUsed: "Never",
        status: "active",
        callsThisMonth: 0,
      },
      ...prev,
    ]);
    setGeneratedKey(fullKey);
    setNewKeyName("");
    setShowNewKeyForm(false);
  };

  const handleCopy = (key: ApiKey) => {
    navigator.clipboard.writeText(key.fullKey);
    setCopiedId(key.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: "revoked" } : k)));
    setConfirmRevoke(null);
  };

  const stats = [
    { label: "Calls Today", value: totalCallsToday.toLocaleString(), icon: <Activity size={18} />, color: "#FF6B00" },
    { label: "Calls This Month", value: totalCallsMonth.toLocaleString(), icon: <TrendingUp size={18} />, color: "#0A1628" },
    { label: "Rate Limit", value: `${rateLimit.toLocaleString()}/min`, icon: <Shield size={18} />, color: "#059669" },
    { label: "Active Keys", value: keys.filter((k) => k.status === "active").length.toString(), icon: <Key size={18} />, color: "#7C3AED" },
  ];

  return (
    <div style={{ backgroundColor: "#F5F7FA" }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
              <Key className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>API Keys</h1>
              <p className="text-gray-500 text-sm">Manage your API credentials for programmatic access</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="https://docs.kauvex.com/express/api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ExternalLink size={14} /> API Docs
            </a>
            <button
              onClick={() => setShowNewKeyForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#FF6B00" }}
            >
              <Plus size={14} /> Generate Key
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{s.label}</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: "#0A1628" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {generatedKey && (
          <div className="rounded-xl border border-emerald-200 p-5 bg-emerald-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <h3 className="font-bold text-emerald-800">API Key Generated</h3>
                </div>
                <p className="text-xs text-emerald-700 mb-3">Copy this key now. You will not be able to see it again.</p>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-emerald-200">
                  <code className="flex-1 text-xs text-gray-700 font-mono break-all">{generatedKey}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(generatedKey); }}
                    className="shrink-0 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Copy size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <button onClick={() => setGeneratedKey(null)} className="text-emerald-600 hover:text-emerald-800 p-1">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {showNewKeyForm && (
          <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
            <h3 className="font-bold" style={{ color: "#0A1628" }}>Generate New API Key</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production Server"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Environment</label>
                <div className="flex gap-2">
                  {(["live", "test"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewKeyType(t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        newKeyType === t ? "text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                      style={newKeyType === t ? { backgroundColor: t === "live" ? "#FF6B00" : "#0A1628" } : {}}
                    >
                      {t === "live" ? "Live (Production)" : "Test (Sandbox)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNewKeyForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleGenerate} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#FF6B00" }}>Generate Key</button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-bold" style={{ color: "#0A1628" }}>Your API Keys</h3>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Name</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Key</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Created</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Last Used</th>
                  <th className="text-right text-gray-500 font-medium py-3 px-4">Calls (Month)</th>
                  <th className="text-left text-gray-500 font-medium py-3 px-4">Status</th>
                  <th className="text-right text-gray-500 font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-medium" style={{ color: "#0A1628" }}>{k.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {revealedKeys[k.id] ? k.fullKey : k.keyPreview}
                        </code>
                        <button onClick={() => toggleReveal(k.id)} className="text-gray-400 hover:text-gray-600">
                          {revealedKeys[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs">{new Date(k.created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td className="py-3.5 px-4 text-gray-500 text-xs">
                      {k.lastUsed === "Never" ? "Never" : new Date(k.lastUsed).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium" style={{ color: "#0A1628" }}>{k.callsThisMonth.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        k.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      }`}>
                        {k.status === "active" ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {k.status === "active" ? "Active" : "Revoked"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {k.status === "active" && (
                          <button onClick={() => handleCopy(k)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Copy full key">
                            {copiedId === k.id ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        )}
                        {k.status === "active" && (
                          confirmRevoke === k.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleRevoke(k.id)} className="text-xs text-red-600 font-medium hover:text-red-700">Yes</button>
                              <button onClick={() => setConfirmRevoke(null)} className="text-xs text-gray-400 hover:text-gray-600">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmRevoke(k.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Revoke key">
                              <Trash2 size={14} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-100">
            {keys.map((k) => (
              <div key={k.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: "#0A1628" }}>{k.name}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    k.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    {k.status === "active" ? "Active" : "Revoked"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded truncate">
                    {revealedKeys[k.id] ? k.fullKey : k.keyPreview}
                  </code>
                  <button onClick={() => toggleReveal(k.id)} className="text-gray-400 hover:text-gray-600">
                    {revealedKeys[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  {k.status === "active" && (
                    <button onClick={() => handleCopy(k)} className="text-gray-400 hover:text-gray-600">
                      {copiedId === k.id ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(k.created).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span>{k.callsThisMonth.toLocaleString()} calls</span>
                </div>
                {k.status === "active" && (
                  <button onClick={() => setConfirmRevoke(k.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Revoke Key</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
