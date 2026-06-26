"use client";

import { useState } from "react";
import {
  Settings,
  Database,
  Webhook,
  Code,
  Plug,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Clock,
  Activity,
  Server,
  Key,
  Link,
  ArrowLeft,
  ChevronDown,
  Trash2,
  Plus,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react";

type WmsType = "manual" | "autostore" | "geek_plus" | "dematic" | "custom";

const wmsOptions: { id: WmsType; name: string; description: string; icon: string }[] = [
  { id: "manual", name: "Manual WMS", description: "Spreadsheet-based tracking with manual entry", icon: "📋" },
  { id: "autostore", name: "AutoStore", description: "Cube-based automated storage and retrieval system", icon: "🤖" },
  { id: "geek_plus", name: "Geek+", description: "Goods-to-person robotic picking system", icon: "🦾" },
  { id: "dematic", name: "Dematic", description: "Integrated automated material movement", icon: "⚙️" },
  { id: "custom", name: "Custom API", description: "Connect your own WMS via REST API", icon: "🔗" },
];

interface StatusCode {
  code: number;
  label: string;
  description: string;
  mappedTo: string;
}

const defaultStatusCodes: StatusCode[] = [
  { code: 200, label: "Success", description: "Request processed successfully", mappedTo: "success" },
  { code: 201, label: "Created", description: "Resource created", mappedTo: "success" },
  { code: 400, label: "Bad Request", description: "Invalid parameters", mappedTo: "error" },
  { code: 401, label: "Unauthorized", description: "Invalid API key", mappedTo: "auth_error" },
  { code: 403, label: "Forbidden", description: "Insufficient permissions", mappedTo: "auth_error" },
  { code: 404, label: "Not Found", description: "Resource not found", mappedTo: "error" },
  { code: 422, label: "Unprocessable", description: "Validation failed", mappedTo: "validation_error" },
  { code: 429, label: "Rate Limited", description: "Too many requests", mappedTo: "rate_limited" },
  { code: 500, label: "Server Error", description: "Internal WMS error", mappedTo: "server_error" },
  { code: 503, label: "Unavailable", description: "WMS temporarily down", mappedTo: "server_error" },
];

const mappedColors: Record<string, string> = {
  success: "bg-green-400/10 text-green-400",
  error: "bg-red-400/10 text-red-400",
  auth_error: "bg-yellow-400/10 text-yellow-400",
  validation_error: "bg-purple-400/10 text-purple-400",
  rate_limited: "bg-blue-400/10 text-blue-400",
  server_error: "bg-red-400/10 text-red-400",
};

const syncHistory = [
  { id: 1, timestamp: "2026-06-26 14:32:15", type: "inventory", status: "success", records: 1250, duration: "3.2s" },
  { id: 2, timestamp: "2026-06-26 14:30:00", type: "orders", status: "success", records: 45, duration: "1.1s" },
  { id: 3, timestamp: "2026-06-26 14:15:22", type: "shipments", status: "success", records: 28, duration: "0.8s" },
  { id: 4, timestamp: "2026-06-26 13:45:10", type: "inventory", status: "error", records: 0, duration: "5.0s" },
  { id: 5, timestamp: "2026-06-26 13:30:00", type: "orders", status: "success", records: 38, duration: "1.3s" },
  { id: 6, timestamp: "2026-06-26 13:00:00", type: "inventory", status: "success", records: 1248, duration: "3.1s" },
];

export default function WmsIntegrationPage() {
  const [selectedWms, setSelectedWms] = useState<WmsType>("custom");
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [isActive, setIsActive] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("https://api.kauvex.com/webhooks/wms/lag-fc");
  const [apiKey, setApiKey] = useState("kwx_live_sk_lag_fc_8f3a2b1c4d5e6f7g8h9i0j");
  const [apiSecret, setApiSecret] = useState("kwx_secret_lag_fc_9z8y7x6w5v4u3t2s1r0q");
  const [apiEndpoint, setApiEndpoint] = useState("https://wms.example.com/api/v2");
  const [editedStatusCodes, setEditedStatusCodes] = useState<StatusCode[]>(defaultStatusCodes);
  const [lastSyncAt] = useState("2026-06-26 14:32:15 UTC");

  const handleTestConnection = () => {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus(selectedWms === "custom" ? "success" : "success");
    }, 2200);
  };

  const updateMappedTo = (code: number, value: string) => {
    setEditedStatusCodes((prev) =>
      prev.map((sc) => (sc.code === code ? { ...sc, mappedTo: value } : sc))
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <a href="/admin/warehouses/overview" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-[#FF6B00] transition mb-2">
              <ArrowLeft className="w-3 h-3" /> Back to Warehouses
            </a>
            <h1 className="text-lg font-bold text-white">WMS Adapter Configuration</h1>
            <p className="text-xs text-white/40 mt-0.5">Lagos Fulfillment Center (LAG-FC) — KSP6.2</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Clock className="h-3.5 w-3.5" />
              Last sync: {lastSyncAt}
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? "bg-green-400/10 text-green-400 border border-green-400/30"
                  : "bg-white/5 text-white/40 border border-white/10"
              }`}
            >
              {isActive ? <Power className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
              {isActive ? "Active" : "Inactive"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Config */}
          <div className="lg:col-span-2 space-y-6">
            {/* WMS Type Selector */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FF6B00]" /> WMS Type
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {wmsOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedWms(opt.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedWms === opt.id
                        ? "border-[#FF6B00] bg-[#FF6B00]/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <div className="text-xs font-semibold text-white">{opt.name}</div>
                    <div className="text-[10px] text-white/40 mt-1 leading-tight">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Credentials */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#FF6B00]" /> API Credentials
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">API Endpoint URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#FF6B00]/50"
                    />
                    <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Copy">
                      <Copy className="w-4 h-4 text-white/30" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">API Key</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#FF6B00]/50"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Regenerate">
                      <RefreshCw className="w-4 h-4 text-white/30" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">API Secret</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showSecret ? "text" : "password"}
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#FF6B00]/50"
                      />
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Regenerate">
                      <RefreshCw className="w-4 h-4 text-white/30" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Organization ID</label>
                    <input
                      type="text"
                      defaultValue="org_kauvex_lag_fc"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#FF6B00]/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Warehouse Code</label>
                    <input
                      type="text"
                      defaultValue="LAG-FC"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#FF6B00]/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Webhook className="w-4 h-4 text-[#FF6B00]" /> Webhook Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Webhook URL</label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#FF6B00]/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Webhook Events</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["order.received", "order.picked", "order.packed", "order.shipped", "inventory.updated", "inventory.low", "shipment.created", "shipment.delivered"].map((event) => (
                      <label key={event} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/8 transition">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 text-[#FF6B00] focus:ring-[#FF6B00]" />
                        <span className="text-[11px] font-mono text-white/70">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Webhook Secret (for signature verification)</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      defaultValue="whsec_kauvex_lag_fc_2026_secret"
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#FF6B00]/50"
                    />
                    <button className="px-3 py-2 bg-white/5 text-white/50 text-xs font-medium rounded-lg hover:bg-white/10 transition">
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Code Mapping */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Code className="w-4 h-4 text-[#FF6B00]" /> Status Code Mapping
              </h3>
              <p className="text-xs text-white/40 mb-4">Map WMS HTTP status codes to internal Kauvex status categories</p>
              <div className="space-y-2">
                {editedStatusCodes.map((sc) => (
                  <div key={sc.code} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-16 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        sc.code < 300 ? "bg-green-400/10 text-green-400" : sc.code < 500 ? "bg-yellow-400/10 text-yellow-400" : "bg-red-400/10 text-red-400"
                      }`}>
                        {sc.code}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white">{sc.label}</div>
                      <div className="text-[10px] text-white/40">{sc.description}</div>
                    </div>
                    <select
                      value={sc.mappedTo}
                      onChange={(e) => updateMappedTo(sc.code, e.target.value)}
                      className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-[#FF6B00]/50"
                    >
                      <option value="success">Success</option>
                      <option value="error">Error</option>
                      <option value="auth_error">Auth Error</option>
                      <option value="validation_error">Validation Error</option>
                      <option value="rate_limited">Rate Limited</option>
                      <option value="server_error">Server Error</option>
                    </select>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${mappedColors[sc.mappedTo]}`}>
                      {sc.mappedTo.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition">
                <Save className="w-4 h-4" /> Save Configuration
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testStatus === "testing"}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded-lg hover:bg-[#0d1f3c] transition disabled:opacity-50 border border-white/10"
              >
                {testStatus === "testing" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Testing...</>
                ) : (
                  <><TestTube className="w-4 h-4" /> Test Connection</>
                )}
              </button>
            </div>

            {/* Test Result */}
            {testStatus !== "idle" && testStatus !== "testing" && (
              <div className={`rounded-xl p-4 flex items-start gap-3 ${
                testStatus === "success" ? "bg-green-400/5 border border-green-400/20" : "bg-red-400/5 border border-red-400/20"
              }`}>
                {testStatus === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className={`text-sm font-semibold ${testStatus === "success" ? "text-green-400" : "text-red-400"}`}>
                    {testStatus === "success" ? "Connection Successful" : "Connection Failed"}
                  </div>
                  <div className={`text-xs mt-1 ${testStatus === "success" ? "text-green-400/70" : "text-red-400/70"}`}>
                    {testStatus === "success"
                      ? "Successfully connected to WMS endpoint. API credentials validated. Webhook endpoint reachable. Last sync completed in 3.2s."
                      : "Failed to connect. Please verify your API endpoint URL and credentials. Check that the WMS server is accessible from our network."}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Status & Sync */}
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF6B00]" /> Connection Status
              </h3>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${isActive ? "bg-green-400/5" : "bg-white/5"}`}>
                  <div className="flex items-center gap-2">
                    {isActive ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-white/30" />}
                    <span className={`text-xs font-medium ${isActive ? "text-green-400" : "text-white/40"}`}>API Connected</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${isActive ? "bg-green-400/5" : "bg-white/5"}`}>
                  <div className="flex items-center gap-2">
                    {isActive ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-white/30" />}
                    <span className={`text-xs font-medium ${isActive ? "text-green-400" : "text-white/40"}`}>Webhook Active</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-white/20"}`} />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-400/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-400">Rate Limit: 85%</span>
                  </div>
                  <span className="text-[10px] text-yellow-400/70">850/1000 req/hr</span>
                </div>
              </div>
            </div>

            {/* Sync History */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF6B00]" /> Recent Sync Activity
              </h3>
              <div className="space-y-2">
                {syncHistory.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition">
                    <div className={`w-2 h-2 rounded-full ${s.status === "success" ? "bg-green-400" : "bg-red-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{s.type}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          s.status === "success" ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5">
                        {s.records > 0 ? `${s.records} records · ` : ""}{s.duration} · {s.timestamp.split(" ")[1]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Settings */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#FF6B00]" /> Sync Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Sync Frequency</label>
                  <select className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF6B00]/50">
                    <option>Real-time (webhook)</option>
                    <option>Every 5 minutes</option>
                    <option>Every 15 minutes</option>
                    <option>Every 30 minutes</option>
                    <option>Every hour</option>
                    <option>Manual only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Sync Scope</label>
                  <div className="space-y-2">
                    {["Inventory levels", "Order status", "Shipment tracking", "Product catalog", "Bin locations"].map((scope) => (
                      <label key={scope} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-white/20 text-[#FF6B00] focus:ring-[#FF6B00]" />
                        <span className="text-xs text-white/70">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Retry Policy</label>
                  <select className="w-full text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF6B00]/50">
                    <option>3 retries, exponential backoff</option>
                    <option>5 retries, linear backoff</option>
                    <option>1 retry, immediate</option>
                    <option>No retries</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Timeout (seconds)</label>
                  <input
                    type="number"
                    defaultValue={30}
                    min={5}
                    max={120}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B00]/50"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-xl bg-white/5 border border-red-400/20 p-5">
              <h3 className="text-sm font-semibold text-red-400 mb-3">Danger Zone</h3>
              <p className="text-xs text-white/40 mb-3">Disconnecting will stop all sync operations. Pending data may be lost.</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-400/5 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-400/10 border border-red-400/20 transition">
                <Trash2 className="w-3.5 h-3.5" /> Disconnect WMS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
