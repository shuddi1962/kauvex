"use client";

import { useState, useEffect } from "react";
import {
  Loader2, AlertTriangle, Bell, BellOff, Trash2, Plus, Clock,
  Mail, MessageSquare, Filter, ArrowRight
} from "lucide-react";

interface Alert {
  id: string;
  route: string;
  triggerType: string;
  threshold: number;
  channel: string;
  frequency: string;
  status: string;
  createdAt: string;
}

interface AlertHistory {
  id: string;
  alertId: string;
  route: string;
  triggeredAt: string;
  value: number;
  threshold: number;
  channel: string;
}

export default function FuelAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formRoute, setFormRoute] = useState("");
  const [formTrigger, setFormTrigger] = useState("price_above");
  const [formThreshold, setFormThreshold] = useState("");
  const [formChannel, setFormChannel] = useState("email");
  const [formFrequency, setFormFrequency] = useState("daily");
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"active" | "history">("active");

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/fuel/alerts");
      const data = await res.json();
      setAlerts(data.data?.alerts ?? []);
      setHistory(data.data?.history ?? []);
    } catch {
      setError("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!formRoute || !formThreshold) return;
    setSubmitting(true);
    try {
      await fetch("/api/v1/fuel/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: formRoute,
          triggerType: formTrigger,
          threshold: Number(formThreshold),
          channel: formChannel,
          frequency: formFrequency,
        }),
      });
      setShowForm(false);
      setFormRoute("");
      setFormThreshold("");
      fetchAlerts();
    } catch {
      setError("Failed to create alert");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAlert(id: string) {
    try {
      await fetch(`/api/v1/fuel/alerts?id=${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete alert");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Rate Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Get notified when fuel surcharges cross your thresholds</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#FF6B00]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertTriangle className="w-4 h-4 inline mr-1" />{error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Create Alert Form */}
      {showForm && (
        <form onSubmit={createAlert} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#0A1628]">Create New Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Route</label>
              <input
                type="text"
                value={formRoute}
                onChange={(e) => setFormRoute(e.target.value)}
                placeholder="e.g. Lagos → Abuja"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Trigger</label>
              <select
                value={formTrigger}
                onChange={(e) => setFormTrigger(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="price_above">Price goes above</option>
                <option value="price_below">Price goes below</option>
                <option value="surcharge_above">Surcharge goes above</option>
                <option value="surcharge_below">Surcharge goes below</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Threshold</label>
              <input
                type="number"
                value={formThreshold}
                onChange={(e) => setFormThreshold(e.target.value)}
                placeholder="e.g. 15"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Channel</label>
              <select
                value={formChannel}
                onChange={(e) => setFormChannel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting || !formRoute || !formThreshold}
                className="w-full px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-semibold hover:bg-[#0A1628]/90 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Alert"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "active" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Bell className="w-3 h-3 inline mr-1" />
          Active ({alerts.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === "history" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Clock className="w-3 h-3 inline mr-1" />
          History ({history.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
        </div>
      ) : tab === "active" ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {alerts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <BellOff className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active alerts. Create one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 font-medium text-gray-500">Route</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Trigger</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Threshold</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Channel</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Frequency</th>
                    <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alerts.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-[#0A1628]">{a.route}</td>
                      <td className="px-6 py-3 text-gray-600 capitalize">{a.triggerType.replace(/_/g, " ")}</td>
                      <td className="px-6 py-3 font-semibold text-[#FF6B00]">{a.threshold}%</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs capitalize">
                          {a.channel === "email" ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                          {a.channel}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 capitalize">{a.frequency}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => deleteAlert(a.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No alert triggers yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-6 py-3 font-medium text-gray-500">Route</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Triggered At</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Value</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Threshold</th>
                    <th className="px-6 py-3 font-medium text-gray-500">Channel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-[#0A1628]">{h.route}</td>
                      <td className="px-6 py-3 text-gray-600">{new Date(h.triggeredAt).toLocaleString()}</td>
                      <td className="px-6 py-3 font-semibold text-[#FF6B00]">{h.value}%</td>
                      <td className="px-6 py-3 text-gray-600">{h.threshold}%</td>
                      <td className="px-6 py-3 text-gray-600 capitalize">{h.channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
