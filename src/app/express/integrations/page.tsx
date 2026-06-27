"use client";

import { useState } from "react";
import {
  Plug,
  ShoppingCart,
  Store,
  Globe,
  Webhook,
  Plus,
  CheckCircle,
  XCircle,
  ExternalLink,
  Settings,
  Bell,
  Trash2,
  AlertTriangle,
  Link2,
  Zap,
  ArrowRight,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "connected" | "disconnected";
  icon: React.ReactNode;
}

export default function ExpressIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "1", name: "Shopify", description: "Sync orders and fulfill directly from your Shopify store", category: "E-Commerce", status: "connected", icon: <ShoppingCart size={24} /> },
    { id: "2", name: "WooCommerce", description: "Automate shipping for your WordPress WooCommerce store", category: "E-Commerce", status: "disconnected", icon: <Store size={24} /> },
    { id: "3", name: "eBay", description: "Import eBay orders and auto-generate waybills", category: "Marketplace", status: "connected", icon: <Globe size={24} /> },
    { id: "4", name: "Etsy", description: "Fulfill your Etsy handmade and vintage orders with Express", category: "Marketplace", status: "disconnected", icon: <Store size={24} /> },
    { id: "5", name: "Custom Webhook", description: "Connect any system via webhooks for real-time events", category: "Developer", status: "disconnected", icon: <Webhook size={24} /> },
  ]);

  const [webhookForm, setWebhookForm] = useState({ url: "", events: ["shipment.created", "shipment.delivered"], secret: "" });
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "connected" | "available">("all");

  const activeIntegrations = integrations.filter((i) => i.status === "connected");
  const availableIntegrations = integrations.filter((i) => i.status === "disconnected");

  const eventOptions = [
    "shipment.created",
    "shipment.picked_up",
    "shipment.in_transit",
    "shipment.delivered",
    "shipment.failed",
    "shipment.returned",
    "label.created",
    "rate.calculated",
  ];

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === "connected" ? "disconnected" : "connected" } : i
      )
    );
  };

  const toggleEvent = (event: string) => {
    setWebhookForm((prev) => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter((e) => e !== event) : [...prev.events, event],
    }));
  };

  const filteredIntegrations = activeTab === "connected" ? activeIntegrations : activeTab === "available" ? availableIntegrations : integrations;

  return (
    <div style={{ backgroundColor: "#F5F7FA" }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
              <Plug className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>Integrations</h1>
              <p className="text-gray-500 text-sm">Connect your stores and automate shipping workflows</p>
            </div>
          </div>
        </div>

        {activeIntegrations.length > 0 && (
          <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={18} style={{ color: "#FF6B00" }} />
              <h3 className="font-bold" style={{ color: "#0A1628" }}>Active Integrations ({activeIntegrations.length})</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeIntegrations.map((int) => (
                <div key={int.id} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "#FF6B00" }}>
                    {int.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "#0A1628" }}>{int.name}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={10} /> Connected
                    </p>
                  </div>
                  <button
                    onClick={() => toggleIntegration(int.id)}
                    className="text-xs text-gray-400 hover:text-red-500"
                    title="Disconnect"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "connected", "available"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={activeTab === tab ? { backgroundColor: "#FF6B00" } : {}}
            >
              {tab === "all" ? "All" : tab === "connected" ? `Connected (${activeIntegrations.length})` : `Available (${availableIntegrations.length})`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIntegrations.map((int) => (
            <div key={int.id} className="rounded-xl border border-gray-200 p-5 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: int.status === "connected" ? "#FF6B0010" : "#0A162808", color: int.status === "connected" ? "#FF6B00" : "#0A1628" }}>
                  {int.icon}
                </div>
                {int.status === "connected" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                    <CheckCircle size={10} /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                    Not Connected
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{int.category}</span>
              <h4 className="font-bold text-sm mt-1 mb-2" style={{ color: "#0A1628" }}>{int.name}</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{int.description}</p>
              <div className="flex gap-2">
                {int.status === "connected" ? (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                      <Settings size={12} /> Configure
                    </button>
                    <button
                      onClick={() => toggleIntegration(int.id)}
                      className="px-3 py-2 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleIntegration(int.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                    style={{ backgroundColor: "#FF6B00" }}
                  >
                    <Link2 size={12} /> Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook size={18} style={{ color: "#0A1628" }} />
              <h3 className="font-bold" style={{ color: "#0A1628" }}>Webhook Configuration</h3>
            </div>
            <button
              onClick={() => setShowWebhookForm(!showWebhookForm)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              {showWebhookForm ? "Close" : <><Settings size={14} /> Configure</>}
            </button>
          </div>

          <p className="text-sm text-gray-500">Receive real-time HTTP POST callbacks when shipping events occur.</p>

          {showWebhookForm && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Webhook URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://your-server.com/webhooks/kauvex"
                    value={webhookForm.url}
                    onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                  <button className="px-4 py-2.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#FF6B00" }}>
                    Save URL
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-2">Subscribe to Events</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {eventOptions.map((event) => (
                    <button
                      key={event}
                      onClick={() => toggleEvent(event)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                        webhookForm.events.includes(event)
                          ? "text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={webhookForm.events.includes(event) ? { backgroundColor: "#0A1628" } : {}}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Signing Secret (optional)</label>
                <input
                  type="text"
                  placeholder="whsec_your_signing_secret"
                  value={webhookForm.secret}
                  onChange={(e) => setWebhookForm({ ...webhookForm, secret: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
                <p className="text-xs text-gray-400 mt-1.5">Used to verify webhook payloads sent from Kauvex Express.</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-amber-500" />
                  Webhook endpoint must respond with HTTP 200 within 10 seconds.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
