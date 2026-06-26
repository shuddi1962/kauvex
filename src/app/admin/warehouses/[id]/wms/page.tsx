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
} from "lucide-react";

type WmsType = "manual" | "autostore" | "geek_plus" | "dematic" | "custom";

const wmsOptions: { id: WmsType; name: string; description: string; icon: string }[] = [
  { id: "manual", name: "Manual WMS", description: "Spreadsheet-based tracking with manual entry", icon: "📋" },
  { id: "autostore", name: "AutoStore", description: "Cube-based automated storage and retrieval system", icon: "🤖" },
  { id: "geek_plus", name: "Geek+", description: "Goods-to-person robotic picking system", icon: "🦾" },
  { id: "dematic", name: "Dematic", description: "Integrated automated material movement", icon: "⚙️" },
  { id: "custom", name: "Custom API", description: "Connect your own WMS via REST API", icon: "🔗" },
];

const statusCodes = [
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
  success: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700",
  auth_error: "bg-amber-100 text-amber-700",
  validation_error: "bg-purple-100 text-purple-700",
  rate_limited: "bg-blue-100 text-blue-700",
  server_error: "bg-red-100 text-red-700",
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
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [webhookUrl, setWebhookUrl] = useState("https://api.kauvex.com/webhooks/wms/lag-fc");
  const [apiKey, setApiKey] = useState("kwx_live_sk_lag_fc_8f3a2b1c4d5e6f7g8h9i0j");
  const [apiEndpoint, setApiEndpoint] = useState("https://wms.example.com/api/v2");
  const [editedStatusCodes, setEditedStatusCodes] = useState(statusCodes);

  const handleTestConnection = () => {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus(selectedWms === "custom" ? "success" : "success");
    }, 2000);
  };

  const updateMappedTo = (code: number, value: string) => {
    setEditedStatusCodes((prev) =>
      prev.map((sc) => (sc.code === code ? { ...sc, mappedTo: value } : sc))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <a href="/admin/warehouses/overview" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0A1628] transition mb-2">
          <ArrowLeft className="w-3 h-3" /> Back to Overview
        </a>
        <h1 className="text-xl font-bold text-[#0A1628]">WMS Integration Configuration</h1>
        <p className="text-sm text-gray-500 mt-1">Lagos Fulfillment Center (LAG-FC) — Configure Warehouse Management System connection</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Config */}
        <div className="lg:col-span-2 space-y-6">
          {/* WMS Type Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FF6B00]" /> WMS Type
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wmsOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedWms(opt.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedWms === opt.id
                      ? "border-[#FF6B00] bg-[#FF6B00]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{opt.icon}</div>
                  <div className="text-sm font-semibold text-[#0A1628]">{opt.name}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Credentials */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#FF6B00]" /> API Credentials
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">API Endpoint URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Copy">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition" title="Regenerate">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Organization ID</label>
                  <input
                    type="text"
                    defaultValue="org_kauvex_lag_fc"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Warehouse Code</label>
                  <input
                    type="text"
                    defaultValue="LAG-FC"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Webhook Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Webhook className="w-4 h-4 text-[#FF6B00]" /> Webhook Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Webhook URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Webhook Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {["order.received", "order.picked", "order.packed", "order.shipped", "inventory.updated", "inventory.low", "shipment.created", "shipment.delivered"].map((event) => (
                    <label key={event} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                      <span className="text-xs font-mono text-[#0A1628]">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Webhook Secret (for signature verification)</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    defaultValue="whsec_kauvex_lag_fc_2026_secret"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition">
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Code Mapping */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#FF6B00]" /> Status Code Mapping
            </h3>
            <p className="text-xs text-gray-500 mb-4">Map WMS HTTP status codes to internal Kauvex status categories</p>
            <div className="space-y-2">
              {editedStatusCodes.map((sc) => (
                <div key={sc.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      sc.code < 300 ? "bg-green-100 text-green-700" : sc.code < 500 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>
                      {sc.code}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#0A1628]">{sc.label}</div>
                    <div className="text-[10px] text-gray-500">{sc.description}</div>
                  </div>
                  <select
                    value={sc.mappedTo}
                    onChange={(e) => updateMappedTo(sc.code, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
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
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1628] text-white text-sm font-semibold rounded-lg hover:bg-[#0d1f3c] transition disabled:opacity-50"
            >
              {testStatus === "testing" ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Testing...</>
              ) : (
                <><TestTube className="w-4 h-4" /> Test Connection</>
              )}
            </button>
          </div>

          {/* Test Result */}
          {testStatus !== "idle" && testStatus !== "testing" && (
            <div className={`rounded-xl p-4 flex items-start gap-3 ${
              testStatus === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
              {testStatus === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              )}
              <div>
                <div className={`text-sm font-semibold ${testStatus === "success" ? "text-green-800" : "text-red-800"}`}>
                  {testStatus === "success" ? "Connection Successful" : "Connection Failed"}
                </div>
                <div className={`text-xs mt-1 ${testStatus === "success" ? "text-green-700" : "text-red-700"}`}>
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
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF6B00]" /> Connection Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">API Connected</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">Webhook Active</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800">Rate Limit: 85%</span>
                </div>
                <span className="text-[10px] text-amber-600">850/1000 req/hr</span>
              </div>
            </div>
          </div>

          {/* Sync History */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6B00]" /> Recent Sync Activity
            </h3>
            <div className="space-y-2">
              {syncHistory.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                  <div className={`w-2 h-2 rounded-full ${s.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#0A1628]">{s.type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        s.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {s.records > 0 ? `${s.records} records · ` : ""}{s.duration} · {s.timestamp.split(" ")[1]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#FF6B00]" /> Sync Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sync Frequency</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]">
                  <option>Real-time (webhook)</option>
                  <option>Every 5 minutes</option>
                  <option>Every 15 minutes</option>
                  <option>Every 30 minutes</option>
                  <option>Every hour</option>
                  <option>Manual only</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Sync Scope</label>
                <div className="space-y-2">
                  {["Inventory levels", "Order status", "Shipment tracking", "Product catalog", "Bin locations"].map((scope) => (
                    <label key={scope} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                      <span className="text-xs text-[#0A1628]">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Retry Policy</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B00]">
                  <option>3 retries, exponential backoff</option>
                  <option>5 retries, linear backoff</option>
                  <option>1 retry, immediate</option>
                  <option>No retries</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Timeout (seconds)</label>
                <input
                  type="number"
                  defaultValue={30}
                  min={5}
                  max={120}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 p-5">
            <h3 className="text-sm font-semibold text-red-600 mb-3">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-3">Disconnecting will stop all sync operations. Pending data may be lost.</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 border border-red-200 transition">
              <Trash2 className="w-3.5 h-3.5" /> Disconnect WMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
