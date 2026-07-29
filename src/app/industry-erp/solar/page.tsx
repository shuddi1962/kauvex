"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sun, Layers, FileCheck, ShieldCheck, FileText, BarChart3,
  ArrowLeft, Search, Plus, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { id: "pipeline", label: "Project Pipeline", icon: Layers },
  { id: "designs", label: "System Designs", icon: Sun },
  { id: "commissioning", label: "Commissioning", icon: FileCheck },
  { id: "warranty", label: "Warranty & Contracts", icon: ShieldCheck },
];

const PIPELINE = [
  { project: "Lagos Business Park 2MW", customer: "Lekki Free Zone Authority", stage: "Site Survey", capacity: "2.0 MW", panels: 4440, value: "₦480M", roi: "22%", status: "Active" },
  { project: "Abuja Govt House 500kW", customer: "State House Administration", stage: "Design", capacity: "500 kW", panels: 1110, value: "₦125M", roi: "18%", status: "Active" },
  { project: "Ikeja City Mall 800kW", customer: "Broll Nigeria", stage: "Installation", capacity: "800 kW", panels: 1776, value: "₦210M", roi: "25%", status: "Active" },
  { project: "Port Harcourt Refinery 5MW", customer: "NNPC", stage: "Feasibility", capacity: "5.0 MW", panels: 11100, value: "₦1.2B", roi: "30%", status: "Proposal" },
  { project: "Lagos State Schools 1.2MW", customer: "Lagos State Govt", stage: "Approval", capacity: "1.2 MW", panels: 2664, value: "₦310M", roi: "20%", status: "Pending" },
];

const SYSTEM_DESIGNS = [
  { name: "Standard Rooftop 50kW", type: "Grid-Tied", panels: "JA Solar 455W", inverter: "Huawei SUN2000", battery: "None", warranty: "25yr panels", status: "Approved" },
  { name: "Hybrid Commercial 200kW", type: "Hybrid", panels: "Longi 550W", inverter: "SMA Sunny Tripower", battery: "BYD 100kWh", warranty: "25yr panels", status: "Approved" },
  { name: "Off-Grid Estate 500kW", type: "Off-Grid", panels: "Trina 500W", inverter: "Victron Quattro", battery: "Pylontech 600kWh", warranty: "25yr panels", status: "Draft" },
  { name: "Solar Carport 100kW", type: "Grid-Tied", panels: "Jinko 470W", inverter: "Growatt MAX", battery: "None", warranty: "25yr panels", status: "Review" },
  { name: "Industrial Rooftop 1MW", type: "Grid-Tied", panels: "Canadian Solar 555W", inverter: "Sungrow 110kW x9", battery: "None", warranty: "25yr panels", status: "Approved" },
];

const COMMISSIONING = [
  { project: "Lagos Business Park 2MW", date: "2026-09-15", inspector: "Eng. Adeola M.", output: "1.92 MWp", pr: "84.2%", injection: "Grid", status: "Scheduled" },
  { project: "Ikeja City Mall 800kW", date: "2026-08-20", inspector: "Eng. Bala K.", output: "780 kWp", pr: "83.5%", injection: "Grid", status: "In Progress" },
  { project: "Lekki Phase 1 School 50kW", date: "2026-07-10", inspector: "Eng. Adaobi N.", output: "48.5 kWp", pr: "86.1%", injection: "Grid", status: "Passed" },
  { project: "Eko Hotel 150kW", date: "2026-06-28", inspector: "Eng. Tunde F.", output: "146 kWp", pr: "85.7%", injection: "Grid + Backup", status: "Passed" },
  { project: "Abuja Hospital 200kW", date: "2026-05-15", inspector: "Eng. Ngozi E.", output: "195 kWp", pr: "84.9%", injection: "Grid + Backup", status: "Passed" },
];

const WARRANTIES = [
  { customer: "Eko Hotel", system: "150kW Rooftop", contractStart: "2026-07", contractEnd: "2031-07", lastService: "2026-07-20", nextService: "2026-10-20", status: "Active", type: "Premium" },
  { customer: "Lekki Phase 1 School", system: "50kW Rooftop", contractStart: "2026-07", contractEnd: "2031-07", lastService: "2026-07-12", nextService: "2026-10-12", status: "Active", type: "Standard" },
  { customer: "Lagos Business Park", system: "2MW Rooftop", contractStart: "2026-09", contractEnd: "2031-09", lastService: "—", nextService: "2026-12-15", status: "Pending", type: "Premium" },
  { customer: "Abuja Hospital", system: "200kW Hybrid", contractStart: "2026-05", contractEnd: "2031-05", lastService: "2026-05-20", nextService: "2026-08-20", status: "Active", type: "Premium" },
  { customer: "Lekki Homes Estate", system: "300kW Community", contractStart: "2026-04", contractEnd: "2031-04", lastService: "2026-04-10", nextService: "2026-07-10", status: "Expiring", type: "Standard" },
];

const statusColor: Record<string, "success" | "warning" | "error" | "default" | "info" | "outline"> = {
  Active: "success",
  Approved: "success",
  Passed: "success",
  "In Progress": "info",
  Scheduled: "default",
  Draft: "outline",
  Review: "warning",
  Pending: "warning",
  Proposal: "info",
  Expiring: "warning",
};

export default function SolarErpPage() {
  const [activeTab, setActiveTab] = useState("pipeline");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-kauvex-navy transition-colors">Home</Link>
          <span>/</span>
          <Link href="/industry-erp" className="hover:text-kauvex-navy transition-colors">Industry ERP</Link>
          <span>/</span>
          <span className="text-kauvex-navy font-medium">Solar ERP</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-700 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/industry-erp"><ArrowLeft className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" /></Link>
            <Sun className="w-8 h-8 text-yellow-200" />
            <h1 className="text-3xl font-bold">Solar ERP</h1>
          </div>
          <p className="text-yellow-100 ml-11">Project pipeline, system designs, commissioning, warranty tracking &amp; customer reporting</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Projects", value: "7", icon: Layers, color: "text-orange" },
            { label: "Installed Capacity", value: "4.6 MW", icon: Sun, color: "text-yellow" },
            { label: "Commissioned", value: "12", icon: FileCheck, color: "text-emerald" },
            { label: "Warranty Active", value: "24", icon: ShieldCheck, color: "text-blue" },
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
            {activeTab === "pipeline" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Stage</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Capacity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Panels</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">ROI</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {PIPELINE.map((p) => (
                    <tr key={p.project} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{p.project}</td>
                      <td className="py-3 px-4 text-gray-600">{p.customer}</td>
                      <td className="py-3 px-4"><Badge variant="outline">{p.stage}</Badge></td>
                      <td className="py-3 px-4 text-gray-600">{p.capacity}</td>
                      <td className="py-3 px-4 text-gray-600">{p.panels.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600 font-medium">{p.value}</td>
                      <td className="py-3 px-4 text-emerald font-medium">{p.roi}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[p.status] || "default"}>{p.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "designs" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Design Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Panels</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Inverter</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Battery</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Warranty</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {SYSTEM_DESIGNS.map((d) => (
                    <tr key={d.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-kauvex-navy">{d.name}</td>
                      <td className="py-3 px-4"><Badge variant="outline">{d.type}</Badge></td>
                      <td className="py-3 px-4 text-gray-600">{d.panels}</td>
                      <td className="py-3 px-4 text-gray-600">{d.inverter}</td>
                      <td className="py-3 px-4 text-gray-600">{d.battery}</td>
                      <td className="py-3 px-4 text-gray-600">{d.warranty}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[d.status] || "default"}>{d.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "commissioning" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Inspector</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Output</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">PR</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Injection</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSIONING.map((c) => (
                    <tr key={c.project} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-700">{c.project}</td>
                      <td className="py-3 px-4 text-gray-600">{c.date}</td>
                      <td className="py-3 px-4 text-gray-600">{c.inspector}</td>
                      <td className="py-3 px-4 text-gray-600">{c.output}</td>
                      <td className="py-3 px-4 text-kauvex-orange font-medium">{c.pr}</td>
                      <td className="py-3 px-4 text-gray-600">{c.injection}</td>
                      <td className="py-3 px-4"><Badge variant={statusColor[c.status] || "default"}>{c.status}</Badge></td>
                      <td className="py-3 px-4 text-right"><button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "warranty" && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">System</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Contract</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Last Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Next Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {WARRANTIES.map((w) => (
                    <tr key={w.customer} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-700">{w.customer}</td>
                      <td className="py-3 px-4 text-gray-600">{w.system}</td>
                      <td className="py-3 px-4 text-gray-600">{w.contractStart} – {w.contractEnd}</td>
                      <td className="py-3 px-4 text-gray-600">{w.lastService}</td>
                      <td className="py-3 px-4 text-gray-600">{w.nextService}</td>
                      <td className="py-3 px-4"><Badge variant="outline">{w.type}</Badge></td>
                      <td className="py-3 px-4"><Badge variant={statusColor[w.status] || "default"}>{w.status}</Badge></td>
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