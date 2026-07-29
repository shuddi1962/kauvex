"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ship, Users, Compass, Wrench, Anchor, DollarSign, Flag,
  ArrowLeft, Search, Plus, MoreHorizontal, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "vessels", label: "Vessel Registry", icon: Ship },
  { id: "crew", label: "Crew Management", icon: Users },
  { id: "voyages", label: "Voyage Tracking", icon: Compass },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
];

const VESSELS = [
  { name: "MV Atlantic Star", type: "Container", flag: "Panama", imo: "9876543", year: 2018, status: "Active", nextDryDock: "2026-09" },
  { name: "MV Pacific Voyager", type: "Bulk Carrier", flag: "Liberia", imo: "9123456", year: 2020, status: "Active", nextDryDock: "2027-03" },
  { name: "MT Gulf Spirit", type: "Tanker", flag: "Marshall Is", imo: "9345678", year: 2015, status: "Maintenance", nextDryDock: "2026-08" },
  { name: "MV Northern Pride", type: "General Cargo", flag: "Cyprus", imo: "9567890", year: 2022, status: "Active", nextDryDock: "2028-01" },
  { name: "MT Eagle Ray", type: "Chemical Tanker", flag: "Singapore", imo: "9789012", year: 2019, status: "Chartered", nextDryDock: "2027-06" },
];

const CREW = [
  { name: "Capt. Adebayo O.", rank: "Master", cert: "Master Mariner", contractEnd: "2026-12", status: "Onboard", vessel: "MV Atlantic Star" },
  { name: "Ch. Eng. Fatima K.", rank: "Chief Engineer", cert: "MEO Class 1", contractEnd: "2026-10", status: "Onboard", vessel: "MV Pacific Voyager" },
  { name: "2nd Off. James C.", rank: "Second Officer", cert: "OOW Unlimited", contractEnd: "2026-08", status: "Onboard", vessel: "MT Gulf Spirit" },
  { name: "E. O. Mensah", rank: "Electrician", cert: "HV/LV Qualified", contractEnd: "2026-11", status: "Leave", vessel: "MV Northern Pride" },
  { name: "Bosun Kwame A.", rank: "Boatswain", cert: "AB Unlimited", contractEnd: "2027-01", status: "Available", vessel: "Pool" },
];

const VOYAGES = [
  { id: "V-2026-089", vessel: "MV Atlantic Star", route: "Lagos → Rotterdam → Hamburg", cargo: "12,400 TEU", fuel: "1,240 MT", dep: "2026-07-15", eta: "2026-08-05", status: "Underway" },
  { id: "V-2026-090", vessel: "MV Pacific Voyager", route: "Durban → Shanghai → Busan", cargo: "78,500 MT Iron Ore", fuel: "1,890 MT", dep: "2026-07-10", eta: "2026-08-20", status: "Underway" },
  { id: "V-2026-088", vessel: "MT Gulf Spirit", route: "Houston → Santos → Lagos", cargo: "45,000 MT Crude", fuel: "980 MT", dep: "2026-07-01", eta: "2026-07-28", status: "Completed" },
  { id: "V-2026-091", vessel: "MV Northern Pride", route: "Tema → Abidjan → Douala", cargo: "8,200 MT General", fuel: "340 MT", dep: "2026-07-20", eta: "2026-07-30", status: "Loading" },
  { id: "V-2026-092", vessel: "MT Eagle Ray", route: "Jeddah → Mumbai → Colombo", cargo: "22,000 MT Chemicals", fuel: "620 MT", dep: "2026-07-18", eta: "2026-08-10", status: "Underway" },
];

const MAINTENANCE = [
  { vessel: "MV Atlantic Star", task: "Main Engine Overhaul", type: "Planned", due: "2026-08-15", assignee: "Ch. Eng. Fatima K.", status: "Scheduled", priority: "High" },
  { vessel: "MV Pacific Voyager", task: "Bow Thruster Inspection", type: "Planned", due: "2026-07-30", assignee: "2nd Off. James C.", status: "In Progress", priority: "Medium" },
  { vessel: "MT Gulf Spirit", task: "Emergency Fire Pump", type: "Corrective", due: "2026-07-25", assignee: "E. O. Mensah", status: "Overdue", priority: "Critical" },
  { vessel: "MV Northern Pride", task: "Lifeboat Release Gear", type: "Statutory", due: "2026-09-01", assignee: "Bosun Kwame A.", status: "Scheduled", priority: "High" },
  { vessel: "MT Eagle Ray", task: "Cargo Pump Seal Replacement", type: "Planned", due: "2026-08-10", assignee: "Ch. Eng. Fatima K.", status: "Scheduled", priority: "Medium" },
];

const statusColor: Record<string, "success" | "warning" | "error" | "default" | "info"> = {
  Active: "success",
  Underway: "success",
  "In Progress": "info",
  Scheduled: "default",
  Completed: "success",
  Loading: "warning",
  Maintenance: "warning",
  Chartered: "info",
  Available: "success",
  Leave: "warning",
  Onboard: "success",
  Overdue: "error",
  Critical: "error",
  High: "error",
  Medium: "warning",
};

export default function MarineErpPage() {
  const [activeTab, setActiveTab] = useState("vessels");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-kauvex-navy transition-colors">Home</Link>
          <span>/</span>
          <Link href="/industry-erp" className="hover:text-kauvex-navy transition-colors">Industry ERP</Link>
          <span>/</span>
          <span className="text-kauvex-navy font-medium">Marine ERP</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/industry-erp"><ArrowLeft className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" /></Link>
            <Ship className="w-8 h-8 text-blue-200" />
            <h1 className="text-3xl font-bold">Marine ERP</h1>
          </div>
          <p className="text-blue-100 ml-11">Vessel registry, crew management, voyage tracking, maintenance &amp; compliance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Vessels", value: "18", icon: Ship, color: "text-blue" },
            { label: "Crew Onboard", value: "142", icon: Users, color: "text-emerald" },
            { label: "Active Voyages", value: "7", icon: Compass, color: "text-amber" },
            { label: "Due Maintenance", value: "12", icon: Wrench, color: "text-red" },
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
            {activeTab === "vessels" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Vessel Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Flag</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">IMO</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Year</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Next Dry Dock</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {VESSELS.map((v) => (
                    <tr key={v.imo} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{v.name}</td>
                      <td className="py-3 px-4 text-gray-600">{v.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Flag className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600">{v.flag}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-mono">{v.imo}</td>
                      <td className="py-3 px-4 text-gray-600">{v.year}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusColor[v.status] || "default"}>{v.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{v.nextDryDock}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "crew" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Certification</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Contract End</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Vessel</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {CREW.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600">{c.rank}</td>
                      <td className="py-3 px-4 text-gray-600">{c.cert}</td>
                      <td className="py-3 px-4 text-gray-600">{c.contractEnd}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusColor[c.status] || "default"}>{c.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{c.vessel}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "voyages" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Voyage ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Vessel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Route</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Cargo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Fuel Used</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Departure</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">ETA</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {VOYAGES.map((v) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm text-kauvex-navy">{v.id}</td>
                      <td className="py-3 px-4 font-medium text-gray-700">{v.vessel}</td>
                      <td className="py-3 px-4 text-gray-600">{v.route}</td>
                      <td className="py-3 px-4 text-gray-600">{v.cargo}</td>
                      <td className="py-3 px-4 text-gray-600">{v.fuel}</td>
                      <td className="py-3 px-4 text-gray-600">{v.dep}</td>
                      <td className="py-3 px-4 text-gray-600">{v.eta}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusColor[v.status] || "default"}>{v.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "maintenance" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Vessel</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Task</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Assignee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {MAINTENANCE.map((m, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-700">{m.vessel}</td>
                      <td className="py-3 px-4 text-gray-600">{m.task}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{m.type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{m.due}</td>
                      <td className="py-3 px-4 text-gray-600">{m.assignee}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusColor[m.priority] || "default"}>{m.priority}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusColor[m.status] || "default"}>{m.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                      </td>
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