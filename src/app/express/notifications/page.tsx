"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";

const NOTIFICATION_TYPES = [
  { id: "shipment_created", label: "Shipment Created", category: "Shipments", email: true, push: true, sms: false },
  { id: "shipment_picked_up", label: "Shipment Picked Up", category: "Shipments", email: true, push: true, sms: false },
  { id: "shipment_in_transit", label: "Shipment In Transit", category: "Shipments", email: false, push: true, sms: false },
  { id: "shipment_delivered", label: "Shipment Delivered", category: "Shipments", email: true, push: true, sms: true },
  { id: "shipment_exception", label: "Delivery Exception", category: "Shipments", email: true, push: true, sms: true },
  { id: "shipment_returned", label: "Shipment Returned", category: "Shipments", email: true, push: true, sms: false },
  { id: "invoice_created", label: "Invoice Created", category: "Billing", email: true, push: false, sms: false },
  { id: "payment_received", label: "Payment Received", category: "Billing", email: true, push: true, sms: false },
  { id: "payment_failed", label: "Payment Failed", category: "Billing", email: true, push: true, sms: true },
  { id: "subscription_expiring", label: "Subscription Expiring", category: "Account", email: true, push: true, sms: false },
  { id: "team_member_joined", label: "Team Member Joined", category: "Account", email: true, push: false, sms: false },
  { id: "api_key_rotated", label: "API Key Rotated", category: "Security", email: true, push: true, sms: false },
  { id: "login_new_device", label: "Login from New Device", category: "Security", email: true, push: true, sms: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATION_TYPES);

  const toggleChannel = (id: string, channel: "email" | "push" | "sms") => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, [channel]: !n[channel] } : n)));
  };

  const categories = [...new Set(notifications.map((n) => n.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Manage how you receive alerts and updates</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Mail className="w-4 h-4" /> Email
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Bell className="w-4 h-4" /> Push
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <Smartphone className="w-4 h-4" /> SMS
            </div>
          </div>
        </div>

        {categories.map((category) => (
          <div key={category}>
            <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{category}</span>
            </div>
            {notifications
              .filter((n) => n.category === category)
              .map((n) => (
                <div key={n.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <span className="text-sm text-[#0A1628] font-medium">{n.label}</span>
                  <div className="flex items-center gap-6">
                    {(["email", "push", "sms"] as const).map((ch) => (
                      <button key={ch} onClick={() => toggleChannel(n.id, ch)} className="p-1">
                        {n[ch] ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
