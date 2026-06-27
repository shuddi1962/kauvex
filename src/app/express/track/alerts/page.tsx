"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Smartphone,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Eye,
  EyeOff,
  Settings,
  Save,
  RotateCcw,
} from "lucide-react";

interface AlertPreference {
  id: string;
  type: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface AlertNotification {
  id: string;
  type: "delivery_exception" | "out_for_delivery" | "delivered" | "customs_hold" | "pickup_ready";
  waybill: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const MOCK_ALERT_PREFS: AlertPreference[] = [
  { id: "ap1", type: "delivery_exception", label: "Delivery Exception", description: "Failed delivery attempt, incorrect address, or recipient unavailable", enabled: true },
  { id: "ap2", type: "out_for_delivery", label: "Out for Delivery", description: "Package is on its way to the recipient", enabled: true },
  { id: "ap3", type: "delivered", label: "Delivered", description: "Package has been successfully delivered", enabled: true },
  { id: "ap4", type: "customs_hold", label: "Customs Hold", description: "International shipment held at customs for clearance", enabled: true },
  { id: "ap5", type: "pickup_ready", label: "Pickup Ready", description: "Express package ready for courier pickup", enabled: false },
  { id: "ap6", type: "in_transit", label: "In Transit Updates", description: "Package arrival at each sorting facility", enabled: false },
];

const MOCK_ALERTS: AlertNotification[] = [
  {
    id: "al1",
    type: "delivery_exception",
    waybill: "KVX-20479",
    message: "Delivery failed — recipient not available at 12 Wuse Zone 5, Abuja. Attempt 1 of 3.",
    timestamp: "2026-01-20T14:30:00Z",
    read: false,
  },
  {
    id: "al2",
    type: "out_for_delivery",
    waybill: "KVX-20482",
    message: "Package is out for delivery to Lagos Island. Expected arrival: 3:00 PM — 5:00 PM.",
    timestamp: "2026-01-20T11:15:00Z",
    read: false,
  },
  {
    id: "al3",
    type: "delivered",
    waybill: "KVX-20480",
    message: "Package delivered successfully to Chukwuemeka Okoro in Abuja. Signed by: C. OKORO.",
    timestamp: "2026-01-20T10:45:00Z",
    read: false,
  },
  {
    id: "al4",
    type: "customs_hold",
    waybill: "KVX-20475",
    message: "Shipment held at UK Customs — Heathrow. Additional documentation required for clearance.",
    timestamp: "2026-01-19T16:20:00Z",
    read: true,
  },
  {
    id: "al5",
    type: "delivered",
    waybill: "KVX-20477",
    message: "Package delivered to Ibrahim Musa in Kano. Left at reception desk.",
    timestamp: "2026-01-19T14:00:00Z",
    read: true,
  },
  {
    id: "al6",
    type: "out_for_delivery",
    waybill: "KVX-20478",
    message: "Package is out for delivery to Port Harcourt. Driver: Emeka N. — Tracking live.",
    timestamp: "2026-01-19T09:30:00Z",
    read: true,
  },
  {
    id: "al7",
    type: "delivery_exception",
    waybill: "KVX-20470",
    message: "Delivery failed — incorrect address provided. Contact recipient to confirm address.",
    timestamp: "2026-01-18T15:10:00Z",
    read: true,
  },
  {
    id: "al8",
    type: "delivered",
    waybill: "KVX-20468",
    message: "Package delivered to Sarah Williams in London. Proof of delivery: photo attached.",
    timestamp: "2026-01-18T11:00:00Z",
    read: true,
  },
];

export default function DeliveryAlertsPage() {
  const [preferences, setPreferences] = useState(MOCK_ALERT_PREFS);
  const [channels, setChannels] = useState({ email: true, sms: true, push: true });
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [activeTab, setActiveTab] = useState<"alerts" | "preferences">("alerts");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
    setUnsavedChanges(true);
  };

  const toggleChannel = (channel: "email" | "sms" | "push") => {
    setChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
    setUnsavedChanges(true);
  };

  const markAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const alertIcon = (type: string) => {
    switch (type) {
      case "delivery_exception":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "out_for_delivery":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "delivered":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "customs_hold":
        return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
      case "pickup_ready":
        return <Clock className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const alertBg = (type: string, read: boolean) => {
    if (read) return "bg-white";
    switch (type) {
      case "delivery_exception":
        return "bg-red-50/50";
      case "customs_hold":
        return "bg-yellow-50/50";
      default:
        return "bg-blue-50/30";
    }
  };

  const channelIcon = (ch: string) => {
    switch (ch) {
      case "email":
        return <Mail className="w-5 h-5" />;
      case "sms":
        return <MessageSquare className="w-5 h-5" />;
      case "push":
        return <Smartphone className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Delivery Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure notifications and view recent shipment alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Exceptions</div>
              <div className="text-xl font-bold text-[#0A1628]">
                {alerts.filter((a) => a.type === "delivery_exception").length}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Out for Delivery</div>
              <div className="text-xl font-bold text-[#0A1628]">
                {alerts.filter((a) => a.type === "out_for_delivery").length}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Delivered</div>
              <div className="text-xl font-bold text-[#0A1628]">
                {alerts.filter((a) => a.type === "delivered").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "alerts"
              ? "border-[#FF6B00] text-[#FF6B00]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            Recent Alerts
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#FF6B00] text-white text-[10px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "preferences"
              ? "border-[#FF6B00] text-[#FF6B00]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            Preferences
          </span>
        </button>
      </div>

      {activeTab === "alerts" && (
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 ${alertBg(alert.type, alert.read)} ${
                !alert.read ? "border-l-[#FF6B00] border-l-2" : ""
              }`}
            >
              <div className="shrink-0 mt-0.5">{alertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-[#0A1628]">{alert.waybill}</span>
                  {!alert.read && (
                    <span className="w-2 h-2 bg-[#FF6B00] rounded-full shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(alert.timestamp)}
                  </span>
                  <span className="capitalize">
                    {alert.type.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!alert.read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    title="Mark as read"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "preferences" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Notification Channels</h2>
            <p className="text-sm text-gray-500 mb-4">Choose how you want to receive delivery alerts</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["email", "sms", "push"] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    channels[ch]
                      ? "border-[#FF6B00] bg-orange-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      channels[ch] ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {channelIcon(ch)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[#0A1628] capitalize">{ch}</div>
                    <div className="text-xs text-gray-500">
                      {channels[ch] ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        channels[ch] ? "bg-[#FF6B00]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${
                          channels[ch] ? "translate-x-[18px]" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Alert Types</h2>
            <p className="text-sm text-gray-500 mb-4">Select which shipment events trigger notifications</p>
            <div className="space-y-3">
              {preferences.map((pref) => (
                <div
                  key={pref.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    pref.enabled ? "border-green-200 bg-green-50/30" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      pref.enabled ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      {pref.enabled ? (
                        <Bell className="w-4 h-4 text-green-600" />
                      ) : (
                        <BellOff className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#0A1628] text-sm">{pref.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{pref.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference(pref.id)}
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                      pref.enabled ? "bg-[#FF6B00]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${
                        pref.enabled ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {unsavedChanges && (
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors">
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
              <button
                onClick={() => {
                  setPreferences(MOCK_ALERT_PREFS);
                  setChannels({ email: true, sms: true, push: true });
                  setUnsavedChanges(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
