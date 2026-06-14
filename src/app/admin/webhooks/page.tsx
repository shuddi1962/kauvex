"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Webhook, Plus, Trash2, Check, X, Copy, Play, Eye,
  ToggleLeft, ToggleRight, RefreshCw, AlertTriangle,
  Clock, Code, Save, Loader2, ExternalLink, Search,
} from "lucide-react";

const webhookEvents = [
  "order.created", "order.updated", "order.completed", "order.cancelled",
  "product.created", "product.updated", "product.deleted",
  "payment.completed", "payment.failed", "payment.refunded",
  "vendor.created", "vendor.approved", "vendor.suspended",
  "customer.created", "customer.updated",
  "shipment.created", "shipment.delivered",
];

const initialWebhooks = [
  { id: "WH-001", name: "ERP Sync", url: "https://erp.company.com/webhooks/kauvex", events: ["order.created", "order.updated", "order.completed"], status: "active", lastDelivery: "2 min ago", successRate: 99.8, secret: "whsec_erp..." },
  { id: "WH-002", name: "CRM Integration", url: "https://crm.company.com/api/kauvex", events: ["customer.created", "customer.updated", "order.completed"], status: "active", lastDelivery: "5 min ago", successRate: 100, secret: "whsec_crm..." },
  { id: "WH-003", name: "Analytics Pipeline", url: "https://analytics.company.com/events", events: ["order.created", "payment.completed", "payment.failed"], status: "active", lastDelivery: "1 hour ago", successRate: 97.5, secret: "whsec_analytics..." },
  { id: "WH-004", name: "Accounting Sync", url: "https://accounting.company.com/kauvex-webhook", events: ["payment.completed", "payment.refunded"], status: "inactive", lastDelivery: "3 days ago", successRate: 100, secret: "whsec_acct..." },
];

const deliveryLogs = [
  { id: "DL-001", webhook: "ERP Sync", event: "order.created", status: "success", code: 200, duration: "320ms", timestamp: "2026-04-05 14:32:01" },
  { id: "DL-002", webhook: "ERP Sync", event: "order.updated", status: "success", code: 200, duration: "280ms", timestamp: "2026-04-05 14:30:15" },
  { id: "DL-003", webhook: "Analytics Pipeline", event: "payment.completed", status: "failed", code: 500, duration: "5.2s", timestamp: "2026-04-05 14:28:00" },
  { id: "DL-004", webhook: "CRM Integration", event: "customer.created", status: "success", code: 200, duration: "190ms", timestamp: "2026-04-05 14:25:44" },
  { id: "DL-005", webhook: "ERP Sync", event: "order.completed", status: "success", code: 200, duration: "310ms", timestamp: "2026-04-05 14:20:30" },
  { id: "DL-006", webhook: "Analytics Pipeline", event: "order.created", status: "success", code: 201, duration: "450ms", timestamp: "2026-04-05 14:15:22" },
  { id: "DL-007", webhook: "Accounting Sync", event: "payment.refunded", status: "failed", code: 0, duration: "30s", timestamp: "2026-04-05 14:10:00" },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"webhooks" | "logs" | "settings">("webhooks");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    name: "", url: "", events: [] as string[], secret: "",
  });

  const [settings, setSettings] = useState({
    retryOnFailure: true,
    maxRetries: 3,
    retryInterval: 60,
    timeout: 30,
    rateLimit: 100,
  });

  const toggleWebhook = (id: string) => {
    setWebhooks((prev) => prev.map((w) => w.id === id ? { ...w, status: w.status === "active" ? "inactive" : "active" } : w));
  };

  const toggleEvent = (event: string) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const testWebhook = async (url: string) => {
    setTestResult(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
      });
      setTestResult({ success: res.ok, message: res.ok ? `HTTP ${res.status}: Delivery successful` : `HTTP ${res.status}: Delivery failed` });
    } catch {
      setTestResult({ success: false, message: "Connection failed: Unable to reach endpoint" });
    }
  };

  const filteredWebhooks = webhooks.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    inactive: "bg-gray-100 text-text-4",
    failed: "bg-red-50 text-red",
  };

  return (
    <AdminShell title="Webhooks" subtitle="Manage outgoing webhook integrations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(["webhooks", "logs", "settings"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"
                }`}>
                {tab === "logs" ? "Delivery Logs" : tab}
              </button>
            ))}
          </div>
          {activeTab === "webhooks" && (
            <Button onClick={() => setShowCreate(true)} size="sm" className="gap-1.5">
              <Plus size={14} /> Create Webhook
            </Button>
          )}
        </div>

        {activeTab === "webhooks" && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search webhooks..." className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredWebhooks.map((wh) => (
                <div key={wh.id} className="bg-white rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        wh.status === "active" ? "bg-green-50" : "bg-gray-100"
                      }`}>
                        <Webhook size={18} className={wh.status === "active" ? "text-green-600" : "text-text-4"} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-text-1">{wh.name}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize ${statusColors[wh.status]}`}>{wh.status}</span>
                        </div>
                        <code className="text-xs text-text-4 font-mono block mt-0.5">{wh.url}</code>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {wh.events.map((event) => (
                            <span key={event} className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue rounded-full font-medium">{event}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-3">
                        <p className="text-xs font-semibold text-text-1">{wh.successRate}%</p>
                        <p className="text-[10px] text-text-4">{wh.lastDelivery}</p>
                      </div>
                      <button onClick={() => toggleWebhook(wh.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${wh.status === "active" ? "bg-green-500" : "bg-gray-300"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${wh.status === "active" ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                      <button onClick={() => testWebhook(wh.url)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue" title="Test">
                        <Play size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue" title="View Secret">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-text-4 hover:text-red" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {testResult && (
                    <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${
                      testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red"
                    }`}>
                      {testResult.success ? <Check size={14} /> : <X size={14} />}
                      {testResult.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "logs" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Event</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Webhook</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Response</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Duration</th>
                    <th className="text-right px-5 py-3 font-medium text-text-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deliveryLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue rounded-full font-medium">{log.event}</span>
                      </td>
                      <td className="px-5 py-3 text-text-1 font-medium">{log.webhook}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          log.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red"
                        }`}>{log.status}</span>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs">{log.code}</td>
                      <td className="px-5 py-3 text-right text-text-4">{log.duration}</td>
                      <td className="px-5 py-3 text-right text-text-4 text-xs">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-white rounded-xl border border-border p-5 max-w-lg">
            <h3 className="font-semibold text-text-1 mb-4">Webhook Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-1">Auto Retry on Failure</p>
                  <p className="text-xs text-text-4">Automatically retry failed deliveries</p>
                </div>
                <button onClick={() => setSettings({ ...settings, retryOnFailure: !settings.retryOnFailure })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${settings.retryOnFailure ? "bg-blue" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.retryOnFailure ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {settings.retryOnFailure && (
                <>
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Max Retries</label>
                    <input type="number" value={settings.maxRetries} onChange={(e) => setSettings({ ...settings, maxRetries: +e.target.value })}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Retry Interval (seconds)</label>
                    <input type="number" value={settings.retryInterval} onChange={(e) => setSettings({ ...settings, retryInterval: +e.target.value })}
                      className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Request Timeout (seconds)</label>
                <input type="number" value={settings.timeout} onChange={(e) => setSettings({ ...settings, timeout: +e.target.value })}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Rate Limit (requests/hour)</label>
                <input type="number" value={settings.rateLimit} onChange={(e) => setSettings({ ...settings, rateLimit: +e.target.value })}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
              </div>
              <Button><Save size={14} className="mr-1" /> Save Settings</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Webhook Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-bold text-lg">Create Webhook</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Webhook Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. ERP Integration" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Endpoint URL</label>
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://your-server.com/webhook" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Secret (optional)</label>
                <input value={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.value })}
                  placeholder="whsec_your_secret_key" className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Subscribe to Events</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {webhookEvents.map((event) => (
                    <button key={event} onClick={() => toggleEvent(event)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                        form.events.includes(event) ? "border-blue bg-blue-50 text-blue" : "border-border text-text-3 hover:border-gray-300"
                      }`}>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        form.events.includes(event) ? "bg-blue border-blue" : "border-gray-300"
                      }`}>
                        {form.events.includes(event) && <Check size={10} className="text-white" />}
                      </div>
                      <code className="text-[10px]">{event}</code>
                    </button>
                  ))}
                </div>
              </div>
              <Button disabled={!form.name || !form.url} className="w-full">
                <Save size={14} className="mr-1" /> Create Webhook
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
