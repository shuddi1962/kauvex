"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  Clock,
  Save,
  CheckCircle,
  MessageSquare,
  Zap,
} from "lucide-react";

type Channel = "email" | "sms" | "push";

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  channels: Record<Channel, boolean>;
  icon: React.ReactNode;
}

export default function NotificationSettingsPage() {
  const [saved, setSaved] = useState(false);

  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: "shipment_updates",
      label: "Shipment Updates",
      description: "Status changes, pickups, and delivery progress",
      channels: { email: true, sms: true, push: true },
      icon: <Zap size={16} className="text-[#FF6B00]" />,
    },
    {
      id: "delivery_confirmations",
      label: "Delivery Confirmations",
      description: "When your package is delivered successfully",
      channels: { email: true, sms: true, push: true },
      icon: <CheckCircle size={16} className="text-green-500" />,
    },
    {
      id: "billing",
      label: "Billing & Payments",
      description: "Invoices, payment receipts, and account charges",
      channels: { email: true, sms: true, push: false },
      icon: <Mail size={16} className="text-blue-500" />,
    },
    {
      id: "marketing",
      label: "Marketing & Promotions",
      description: "New features, offers, and shipping deals",
      channels: { email: false, sms: false, push: true },
      icon: <MessageSquare size={16} className="text-purple-500" />,
    },
    {
      id: "weekly_digest",
      label: "Weekly Digest",
      description: "Summary of your shipments and account activity",
      channels: { email: true, sms: false, push: false },
      icon: <Mail size={16} className="text-gray-500" />,
    },
    {
      id: "security_alerts",
      label: "Security Alerts",
      description: "Login attempts and suspicious activity",
      channels: { email: true, sms: true, push: true },
      icon: <Bell size={16} className="text-red-500" />,
    },
  ]);

  const [smsAlerts, setSmsAlerts] = useState({
    deliveryAlerts: true,
    outForDelivery: true,
  });

  const [pushEnabled, setPushEnabled] = useState(true);

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    start: "22:00",
    end: "07:00",
  });

  const toggleChannel = (categoryId: string, channel: Channel) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              channels: {
                ...cat.channels,
                [channel]: !cat.channels[channel],
              },
            }
          : cat
      )
    );
  };

  const handleSave = async () => {
    try {
      await fetch("/api/v1/express/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories, smsAlerts, pushEnabled, quietHours }),
      });
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Notification Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle size={16} className="text-emerald-500" />
          <span className="text-emerald-700 text-sm font-medium">Notification preferences saved</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <Bell size={20} className="text-[#FF6B00]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Email Notifications</h2>
            <p className="text-xs text-gray-500">Select which emails you want to receive</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-400 font-medium py-3 px-3 w-1/2">Notification</th>
                <th className="text-center font-medium py-3 px-3 w-[80px]">
                  <div className="flex flex-col items-center gap-1">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-[10px]">Email</span>
                  </div>
                </th>
                <th className="text-center font-medium py-3 px-3 w-[80px]">
                  <div className="flex flex-col items-center gap-1">
                    <Smartphone size={14} className="text-gray-400" />
                    <span className="text-[10px]">SMS</span>
                  </div>
                </th>
                <th className="text-center font-medium py-3 px-3 w-[80px]">
                  <div className="flex flex-col items-center gap-1">
                    <Bell size={14} className="text-gray-400" />
                    <span className="text-[10px]">Push</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F5F7FA] flex items-center justify-center">
                        {cat.icon}
                      </div>
                      <div>
                        <p className="font-medium text-[#0A1628]">{cat.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                  </td>
                  {(["email", "sms", "push"] as const).map((channel) => (
                    <td key={channel} className="text-center py-4 px-3">
                      <button
                        onClick={() => toggleChannel(cat.id, channel)}
                        className={`w-10 h-5 rounded-full transition-colors relative mx-auto ${
                          cat.channels[channel] ? "bg-[#FF6B00]" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                            cat.channels[channel] ? "left-5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Smartphone size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">SMS Alerts</h2>
              <p className="text-xs text-gray-500">Critical delivery notifications via SMS</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-[#0A1628]">Delivery Alerts</p>
                <p className="text-xs text-gray-500">Get notified on delivery status changes</p>
              </div>
              <button
                onClick={() => setSmsAlerts({ ...smsAlerts, deliveryAlerts: !smsAlerts.deliveryAlerts })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  smsAlerts.deliveryAlerts ? "bg-[#FF6B00]" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    smsAlerts.deliveryAlerts ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-[#0A1628]">Out for Delivery</p>
                <p className="text-xs text-gray-500">Know when your package is on its way</p>
              </div>
              <button
                onClick={() => setSmsAlerts({ ...smsAlerts, outForDelivery: !smsAlerts.outForDelivery })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  smsAlerts.outForDelivery ? "bg-[#FF6B00]" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    smsAlerts.outForDelivery ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Bell size={20} className="text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Push Notifications</h2>
              <p className="text-xs text-gray-500">Browser and mobile push notifications</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-[#0A1628]">Enable Push Notifications</p>
              <p className="text-xs text-gray-500">Receive push alerts on your devices</p>
            </div>
            <button
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                pushEnabled ? "bg-[#FF6B00]" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  pushEnabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Clock size={20} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Quiet Hours</h2>
            <p className="text-xs text-gray-500">Pause notifications during specific hours</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-medium text-[#0A1628]">Enable Quiet Hours</p>
              <p className="text-xs text-gray-500">No notifications during these hours (except security alerts)</p>
            </div>
            <button
              onClick={() => setQuietHours({ ...quietHours, enabled: !quietHours.enabled })}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                quietHours.enabled ? "bg-[#FF6B00]" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                  quietHours.enabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {quietHours.enabled && (
            <div className="flex items-center gap-4 p-3 bg-[#F5F7FA] rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">From</label>
                <input
                  type="time"
                  value={quietHours.start}
                  onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Until</label>
                <input
                  type="time"
                  value={quietHours.end}
                  onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e55f00] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={14} />
          Save Preferences
        </button>
      </div>
    </div>
  );
}
