"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Key, ExternalLink, Trash2, CheckCircle2, AlertCircle,
  Shield, Code, RefreshCw, Copy, X, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  scope: string;
  connectedAt: string;
  status: "active" | "expired" | "revoked";
}

const MOCK_APPS: ConnectedApp[] = [
  {
    id: "1",
    name: "Inventory Sync Pro",
    description: "Third-party inventory management integration",
    icon: "📦",
    scope: "Read products, Update inventory",
    connectedAt: "2026-05-15",
    status: "active",
  },
  {
    id: "2",
    name: "ShipStation",
    description: "Shipping and order fulfillment automation",
    icon: "🚚",
    scope: "Read orders, Create shipments",
    connectedAt: "2026-04-20",
    status: "active",
  },
  {
    id: "3",
    name: "Analytics Dashboard",
    description: "Custom sales and performance reporting",
    icon: "📊",
    scope: "Read orders, Read earnings",
    connectedAt: "2026-03-10",
    status: "active",
  },
  {
    id: "4",
    name: "Email Marketing Pro",
    description: "Customer email campaign integration",
    icon: "📧",
    scope: "Read customers, Send emails",
    connectedAt: "2026-02-01",
    status: "expired",
  },
  {
    id: "5",
    name: "Chat Widget",
    description: "Live chat support integration (legacy)",
    icon: "💬",
    scope: "Read orders, Read customers",
    connectedAt: "2026-01-15",
    status: "revoked",
  },
];

export default function ApiAccessPage() {
  const [apps, setApps] = useState<ConnectedApp[]>(MOCK_APPS);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRevoke = (id: string) => {
    setApps(apps.filter((a) => a.id !== id));
    setRevokeConfirm(null);
    showToast("success", "App access revoked");
  };

  return (
    <VendorShell
      title="API Access"
      subtitle="Manage integrations and API keys"
    >
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              To authorize a new developer or manage your authorized apps, visit{" "}
              <Link
                href="/vendor/settings"
                className="text-blue-600 underline hover:text-blue-700 font-medium"
              >
                Manage Your Apps
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Code size={16} className="text-purple-600" />
            Connected Apps & Integrations
          </h3>
          <Link
            href="/vendor/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50"
          >
            <Key size={14} />
            Manage API Keys
          </Link>
        </div>

        <div className="space-y-3">
          {apps.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Code size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No connected apps</p>
            </div>
          ) : (
            apps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                    {app.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {app.name}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          app.status === "active"
                            ? "bg-green-100 text-green-700"
                            : app.status === "expired"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {app.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-gray-400">
                        Scope: {app.scope}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Connected: {app.connectedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {revokeConfirm === app.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRevoke(app.id)}
                        className="px-2.5 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRevokeConfirm(null)}
                        className="px-2.5 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeConfirm(app.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={13} />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Shield size={16} className="text-purple-600" />
            API Security Notice
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            API keys and access tokens should be kept confidential. Do not share
            them in public repositories, client-side code, or with unauthorized
            parties. Regularly rotate your API keys and revoke access for
            integrations you no longer use.
          </p>
        </div>
      </div>
    </VendorShell>
  );
}
