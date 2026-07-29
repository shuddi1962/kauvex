"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, Monitor, AlertTriangle, Package, Users, Camera,
  ArrowLeft, Search, Plus, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "contracts", label: "Surveillance Contracts", icon: ShieldCheck },
  { id: "monitoring", label: "Monitoring Schedule", icon: Monitor },
  { id: "incidents", label: "Incident Reports", icon: AlertTriangle },
  { id: "equipment", label: "Equipment & CCTV", icon: Camera },
];

const CONTRACTS = [
  { client: "Eko Atlantic Tower A", site: "Victoria Island, Lagos", guardCount: 12, monthly: "₦4.8M", start: "2026-01", end: "2026-12", status: "Active", type: "24/7 Armed" },
  { client: "Lekki Free Zone Phase 2", site: "Lekki, Lagos", guardCount: 24, monthly: "₦8.2M", start: "2026-03", end: "2027-02", status: "Active", type: "24/7 Armed" },
  { client: "Abuja Shopping Mall", site: "Central Area, Abuja", guardCount: 8, monthly: "₦2.9M", start: "2026-02", end: "2027-01", status: "Active", type: "Day Shift + CCTV" },
  { client: "Port Harcourt Refinery", site: "Eleme, Rivers", guardCount: 30, monthly: "₦12.5M", start: "2026-06", end: "2027-05", status: "Active", type: "24/7 Armed + K9" },
  { client: "Ibadan Depot", site: "Ibadan, Oyo", guardCount: 6, monthly: "₦1.8M", start: "2026-04", end: "2026-09", status: "Expiring", type: "Night Watch" },
];

const MONITORING = [
  { shift: "Morning", site: "Eko Atlantic Tower A", team: "Alpha Squad (6)", supervisor: "Commander Musa D.", time: "06:00 – 14:00", cameras: 48, status: "Active" },
  { shift: "Afternoon", site: "Lekki Free Zone", team: "Bravo Squad (8)", supervisor: "Commander Ngozi E.", time: "14:00 – 22:00", cameras: 96, status: "Active" },
  { shift: "Night", site: "Port Harcourt Refinery", team: "Charlie Squad (10)", supervisor: "Commander Emeka O.", time: "22:00 – 06:00", cameras: 144, status: "Active" },
  { shift: "Morning", site: "Abuja Shopping Mall", team: "Delta Squad (4)", supervisor: "Commander Amina B.", time: "08:00 – 16:00", cameras: 24, status: "Active" },
  { shift: "Night", site: "Lekki Free Zone", team: "Echo Squad (8)", supervisor: "Commander Segun A.", time: "22:00 – 06:00", cameras: 96, status: "Pending Handover" },
];

const INCIDENTS = [
  { id: "INC-2026-089", site: "Port Harcourt Refinery", type: "Perimeter Breach", severity: "High", reported: "2026-07-28 02:34", responder: "Charlie Squad", resolution: "Suspect apprehended", status: "Resolved" },
  { id: "INC-2026-088", site: "Lekki Free Zone", type: "Fire Alarm", severity: "Medium", reported: "2026-07-27 14:15", responder: "Bravo Squad", resolution: "False alarm – dust trigger", status: "Resolved" },
  { id: "INC-2026-087", site: "Eko Atlantic Tower A", type: "CCTV Offline", severity: "Low", reported: "2026-07-26 09:00", responder: "Tech Team", resolution: "Camera replaced", status: "Resolved" },
  { id: "INC-2026-090", site: "Ibadan Depot", type: "Unauthorized Vehicle", severity: "Medium", reported: "2026-07-28 23:10", responder: "Night Watch", resolution: "Vehicle identified – delivery truck", status: "Investigation" },
  { id: "INC-2026-086", site: "Abuja Shopping Mall", type: "Theft Attempt", severity: "High", reported: "2026-07-25 03:45", responder: "Delta Squad", resolution: "Suspect detained, handed to police", status: "Resolved" },
];

const INVENTORY = [
  { item: "Hikvision DS-2CD2386G2", type: "Bullet Camera 8MP", site: "Lekki Free Zone", total: 96, operational: 94, faulty: 2, status: "Operational" },
  { item: "Dahua SD59232U-HNI", type: "PTZ Camera 2MP", site: "Eko Atlantic Tower A", total: 12, operational: 12, faulty: 0, status: "Operational" },
  { item: "Bosch ICP-CC404", type: "Control Panel", site: "Port Harcourt Refinery", total: 8, operational: 8, faulty: 0, status: "Operational" },
  { item: "AXIS Q1656-LE", type: "Thermal Camera", site: "Port Harcourt Refinery", total: 24, operational: 22, faulty: 2, status: "Degraded" },
  { item: "Honeywell VSS-200", type: "Video Server NVR", site: "Abuja Shopping Mall", total: 4, operational: 3, faulty: 1, status: "Degraded" },
];

const statusColor: Record<string, "success" | "warning" | "error" | "default" | "info" | "outline"> = {
  Active: "success",
  Operational: "success",
  Resolved: "success",
  "Pending Handover": "warning",
  Investigation: "warning",
  Expiring: "warning",
  Degraded: "error",
  High: "error",
  Medium: "warning",
  Low: "outline",
};

export default function SecurityErpPage() {
  const [activeTab, setActiveTab] = useState("contracts");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-kauvex-navy transition-colors">Home</Link>
          <span>/</span>
          <Link href="/industry-erp" className="hover:text-kauvex-navy transition-colors">Industry ERP</Link>
          <span>/</span>
          <span className="text-kauvex-navy font-medium">Security ERP</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/industry-erp"><ArrowLeft className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" /></Link>
            <ShieldCheck className="w-8 h-8 text-gray-300" />
            <h1 className="text-3xl font-bold">Security ERP</h1>
          </div>
          <p className="text-gray-300 ml-11">Surveillance contracts, monitoring schedules, incident reporting, equipment &amp; guard deployment</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Contracts", value: "12", icon: ShieldCheck, color: "text-blue" },
            { label: "Guards Deployed", value: "212", icon: Users, color: "text-kauvex-orange" },
            { label: "Cameras Online", value: "386", icon: Camera, color: "text-emerald" },
            { label: "Incidents (30d)", value: "8", icon: AlertTriangle, color: "text-red" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-kauvex-navy">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-kauvex-orange after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-kauvex-orange"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto flex items-center pr-4">
                <Button size="sm" variant="ghost"><Search className="w-4 h-4" /></Button>
                <Button size="sm" variant="primary" className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "contracts" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Guards</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Monthly</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Period</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {CONTRACTS.map((c) => (
                    <tr key={c.client} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{c.client}</td>
                      <td className="py-3 px-4 text-gray-600">{c.site}</td>
                      <td className="py-3 px-4 text-gray-600">{c.guardCount}</td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{c.monthly}</td>
                      <td className="py-3 px-4 text-gray-600">{c.start} – {c.end}</td>
                      <td className="py-3 px-4"><Badge variant="outline">{c.type}</Badge></td>
                      <td className="py-3 px-4"><Badge variant={statusColor[c.status] || "default"}>{c.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "monitoring" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Shift</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Team</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Supervisor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cameras</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {MONITORING.map((m, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{m.shift}</td>
                      <td className="py-3 px-4 text-gray-600">{m.site}</td>
                      <td className="py-3 px-4 text-gray-600">{m.team}</td>
                      <td className="py-3 px-4 text-gray-600">{m.supervisor}</td>
                      <td className="py-3 px-4 text-gray-600">{m.time}</td>
                      <td className="py-3 px-4 text-gray-600">{m.cameras}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[m.status] || "default"}>{m.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "incidents" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Incident ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Reported</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Responder</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Resolution</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {INCIDENTS.map((inc) => (
                    <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-kauvex-navy">{inc.id}</td>
                      <td className="py-3 px-4 text-gray-600">{inc.site}</td>
                      <td className="py-3 px-4 text-gray-600">{inc.type}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[inc.severity] || "default"}>{inc.severity}</Badge></td>
                      <td className="py-3 px-4 text-gray-600">{inc.reported}</td>
                      <td className="py-3 px-4 text-gray-600">{inc.responder}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate">{inc.resolution}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[inc.status] || "default"}>{inc.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "equipment" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Item</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Operational</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Faulty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Health</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY.map((eq, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{eq.item}</td>
                      <td className="py-3 px-4 text-gray-600">{eq.type}</td>
                      <td className="py-3 px-4 text-gray-600">{eq.site}</td>
                      <td className="py-3 px-4 text-gray-600">{eq.total}</td>
                      <td className="py-3 px-4 text-gray-600">{eq.operational}</td>
                      <td className="py-3 px-4 text-gray-600">{eq.faulty}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[eq.status] || "default"}>{eq.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}