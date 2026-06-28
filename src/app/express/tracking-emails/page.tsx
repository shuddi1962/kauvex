"use client";

import { useState } from "react";
import { Mail, Send, Clock, CheckCircle2, AlertTriangle, Eye, Edit3, Trash2, Plus } from "lucide-react";

const TEMPLATES = [
  { id: 1, name: "Shipment Created", trigger: "on_create", status: "active", opens: 92, clicks: 68, lastEdited: "2 days ago" },
  { id: 2, name: "Out for Delivery", trigger: "on_out_for_delivery", status: "active", opens: 88, clicks: 72, lastEdited: "1 week ago" },
  { id: 3, name: "Delivered", trigger: "on_delivered", status: "active", opens: 95, clicks: 45, lastEdited: "3 days ago" },
  { id: 4, name: "Delivery Exception", trigger: "on_exception", status: "active", opens: 78, clicks: 55, lastEdited: "5 days ago" },
  { id: 5, name: "Returned to Sender", trigger: "on_returned", status: "paused", opens: 0, clicks: 0, lastEdited: "2 weeks ago" },
  { id: 6, name: "Custom Delay Notification", trigger: "manual", status: "active", opens: 65, clicks: 30, lastEdited: "1 day ago" },
];

export default function TrackingEmailsPage() {
  const [templates, setTemplates] = useState(TEMPLATES);

  const activeCount = templates.filter((t) => t.status === "active").length;
  const totalOpens = templates.reduce((sum, t) => sum + t.opens, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Tracking Emails</h1>
          <p className="text-gray-500 text-sm mt-1">Configure automated tracking notification emails</p>
        </div>
        <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active Templates</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Emails Opened</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{totalOpens.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Open Rate</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">83%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Template</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Trigger</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Opens</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Clicks</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Last Edited</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#FF6B00]" />
                    <span className="text-sm font-medium text-[#0A1628]">{t.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{t.trigger.replace(/_/g, " ")}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${t.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {t.status === "active" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-[#0A1628]">{t.opens}%</td>
                <td className="px-5 py-4 text-sm font-medium text-[#0A1628]">{t.clicks}%</td>
                <td className="px-5 py-4 text-sm text-gray-400">{t.lastEdited}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Preview">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Edit">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
