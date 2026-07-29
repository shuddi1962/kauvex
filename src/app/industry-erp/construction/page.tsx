"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HardHat, Building2, Truck, Users2, ClipboardCheck, Package, Clock,
  ArrowLeft, Search, Plus, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "sites", label: "Site Management", icon: Building2 },
  { id: "equipment", label: "Equipment", icon: Truck },
  { id: "subs", label: "Subcontractors", icon: Users2 },
  { id: "progress", label: "Daily Reports", icon: ClipboardCheck },
];

const SITES = [
  { name: "Lekki Phase 1 Estate", location: "Lekki, Lagos", status: "Active", progress: "65%", start: "2026-01", end: "2026-12", manager: "Eng. Adekunle F." },
  { name: "Eko Atlantic Tower B", location: "Victoria Island, Lagos", status: "Active", progress: "32%", start: "2026-03", end: "2027-06", manager: "Eng. Chioma E." },
  { name: "Abuja Smart City", location: "Abuja FCT", status: "Active", progress: "18%", start: "2026-06", end: "2028-03", manager: "Arch. Musa I." },
  { name: "Port Harcourt Mall", location: "Port Harcourt, Rivers", status: "On Hold", progress: "45%", start: "2025-09", end: "2027-01", manager: "Eng. Grace O." },
  { name: "Ibadan Industrial Park", location: "Ibadan, Oyo", status: "Planning", progress: "5%", start: "2026-09", end: "2028-12", manager: "Eng. Tunde B." },
];

const EQUIPMENT = [
  { name: "CAT D6 Dozer", id: "EQ-001", site: "Lekki Phase 1", hours: 1240, status: "Operational", nextService: "2026-08-10" },
  { name: "Komatsu PC200 Excavator", id: "EQ-002", site: "Eko Atlantic", hours: 890, status: "Operational", nextService: "2026-07-28" },
  { name: "Crane LTM 1050", id: "EQ-003", site: "Eko Atlantic", hours: 560, status: "Maintenance", nextService: "2026-08-05" },
  { name: "Volvo A40D Dump Truck", id: "EQ-004", site: "Abuja Smart", hours: 2100, status: "Operational", nextService: "2026-08-20" },
  { name: "Concrete Pump 42m", id: "EQ-005", site: "Lekki Phase 1", hours: 340, status: "Idle", nextService: "2026-09-01" },
];

const SUBCONTRACTORS = [
  { company: "Jagal Construction", scope: "Steel Structure", site: "Eko Atlantic", contractValue: "₦450M", start: "2026-03", end: "2026-11", status: "Active" },
  { company: "CCECC Nigeria", scope: "Road Works", site: "Abuja Smart City", contractValue: "₦780M", start: "2026-06", end: "2027-12", status: "Active" },
  { company: "Julius Berger", scope: "Foundation", site: "Lekki Phase 1", contractValue: "₦320M", start: "2026-01", end: "2026-08", status: "Active" },
  { company: "Arab Contractors", scope: "Plumbing & HVAC", site: "Port Harcourt Mall", contractValue: "₦180M", start: "2025-09", end: "2026-10", status: "Suspended" },
  { company: "Mobil Construct", scope: "Earthworks", site: "Ibadan Park", contractValue: "₦95M", start: "2026-09", end: "2027-06", status: "Pending" },
];

const DAILY_REPORTS = [
  { date: "2026-07-28", site: "Lekki Phase 1", workers: 87, hours: 696, activities: "Floor slab pour Block B, rebar installation Block C", issues: "None", status: "Complete" },
  { date: "2026-07-28", site: "Eko Atlantic Tower B", workers: 54, hours: 432, activities: "Steel frame erection Level 12, curtain wall mullions", issues: "Crane maintenance delay 2hrs", status: "Complete" },
  { date: "2026-07-28", site: "Abuja Smart City", workers: 32, hours: 256, activities: "Site clearing Zone 3, temporary utilities installation", issues: "Rain delay afternoon", status: "Partial" },
  { date: "2026-07-27", site: "Ibadan Industrial Park", workers: 12, hours: 96, activities: "Topographic survey south sector, soil testing", issues: "None", status: "Complete" },
  { date: "2026-07-27", site: "Port Harcourt Mall", workers: 0, hours: 0, activities: "Site idle - permit renewal pending", issues: "Permit delay", status: "Suspended" },
];

const statusColor: Record<string, "success" | "warning" | "error" | "default" | "info" | "outline"> = {
  Active: "success",
  Operational: "success",
  Complete: "success",
  Partial: "warning",
  Maintenance: "warning",
  Idle: "outline",
  Suspended: "error",
  Planning: "info",
  Pending: "warning",
  "On Hold": "warning",
};

export default function ConstructionErpPage() {
  const [activeTab, setActiveTab] = useState("sites");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-kauvex-navy transition-colors">Home</Link>
          <span>/</span>
          <Link href="/industry-erp" className="hover:text-kauvex-navy transition-colors">Industry ERP</Link>
          <span>/</span>
          <span className="text-kauvex-navy font-medium">Construction ERP</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-800 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/industry-erp"><ArrowLeft className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" /></Link>
            <HardHat className="w-8 h-8 text-amber-200" />
            <h1 className="text-3xl font-bold">Construction ERP</h1>
          </div>
          <p className="text-amber-100 ml-11">Multi-site management, equipment fleet, subcontractors, daily reports &amp; labour tracking</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Sites", value: "3", icon: Building2, color: "text-amber" },
            { label: "Equipment Fleet", value: "42", icon: Truck, color: "text-blue" },
            { label: "Subcontractors", value: "18", icon: Users2, color: "text-emerald" },
            { label: "Workers On-Site", value: "185", icon: HardHat, color: "text-kauvex-orange" },
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
            {activeTab === "sites" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Project Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Start</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">End</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Manager</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {SITES.map((s) => (
                    <tr key={s.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{s.name}</td>
                      <td className="py-3 px-4 text-gray-600">{s.location}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[s.status] || "default"}>{s.status}</Badge></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-kauvex-orange h-2 rounded-full" style={{ width: s.progress }} />
                          </div>
                          <span className="text-gray-600 text-xs">{s.progress}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{s.start}</td>
                      <td className="py-3 px-4 text-gray-600">{s.end}</td>
                      <td className="py-3 px-4 text-gray-600">{s.manager}</td>
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
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Equipment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Next Service</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {EQUIPMENT.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{e.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{e.id}</td>
                      <td className="py-3 px-4 text-gray-600">{e.site}</td>
                      <td className="py-3 px-4 text-gray-600">{e.hours.toLocaleString()}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[e.status] || "default"}>{e.status}</Badge></td>
                      <td className="py-3 px-4 text-gray-600">{e.nextService}</td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "subs" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Scope</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Contract Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Start</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">End</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {SUBCONTRACTORS.map((s) => (
                    <tr key={s.company} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{s.company}</td>
                      <td className="py-3 px-4 text-gray-600">{s.scope}</td>
                      <td className="py-3 px-4 text-gray-600">{s.site}</td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{s.contractValue}</td>
                      <td className="py-3 px-4 text-gray-600">{s.start}</td>
                      <td className="py-3 px-4 text-gray-600">{s.end}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[s.status] || "default"}>{s.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "progress" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Site</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Workers</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Labour Hours</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Activities</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Issues</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {DAILY_REPORTS.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-gray-600">{r.date}</td>
                      <td className="py-3 px-4 font-medium text-gray-700">{r.site}</td>
                      <td className="py-3 px-4 text-gray-600">{r.workers}</td>
                      <td className="py-3 px-4 text-gray-600">{r.hours.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">{r.activities}</td>
                      <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate">{r.issues}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[r.status] || "default"}>{r.status}</Badge></td>
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