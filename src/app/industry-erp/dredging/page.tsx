"use client";

import { useState } from "react";
import {
  Anchor,
  Ship,
  Fuel,
  Wrench,
  BarChart3,
  HardHat,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Droplets,
  Map,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TABS = [
  { key: "vessels", label: "Dredger Fleet", icon: Ship },
  { key: "projects", label: "Project Tracking", icon: HardHat },
  { key: "crew", label: "Crew & Compliance", icon: Users },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
];

const dredgers = [
  { name: "Kauvex Dragon", type: "Cutter Suction Dredger 14\"", status: "operational", location: "Lagos Lagoon", project: "Lagos Channel Deepening", fuelConsumption: "850 L/hr", hoursLogged: 12450, nextService: "2026-08-15", captain: "Capt. Ibrahim Bello" },
  { name: "Kauvex Titan", type: "Trailing Suction Hopper Dredger 3000m³", status: "operational", location: "Port Harcourt", project: "Bonny River Dredging", fuelConsumption: "1200 L/hr", hoursLogged: 8930, nextService: "2026-09-01", captain: "Capt. Stella Okafor" },
  { name: "Kauvex Storm", type: "Excavator Dredger (Long Reach)", status: "maintenance", location: "Warri Dry Dock", project: "None — Under Service", fuelConsumption: "450 L/hr", hoursLogged: 6200, nextService: "2026-07-30", captain: "Capt. Michael Obi" },
  { name: "Kauvex Tide", type: "Water Injection Dredger", status: "operational", location: "Calabar", project: "Calabar Port Access", fuelConsumption: "600 L/hr", hoursLogged: 3450, nextService: "2026-10-12", captain: "Capt. Fatima Usman" },
];

const projects = [
  { id: "DRG-2026-001", client: "Nigerian Ports Authority", location: "Lagos Lagoon", volumeM3: 1250000, progress: 72, startDate: "2025-11-01", endDate: "2027-03-15", budget: "₦4.8B", spent: "₦3.2B", status: "active" },
  { id: "DRG-2026-002", client: "Shell Nigeria", location: "Bonny River", volumeM3: 850000, progress: 45, startDate: "2026-01-15", endDate: "2026-12-30", budget: "₦2.9B", spent: "₦1.1B", status: "active" },
  { id: "DRG-2026-003", client: "Cross River State Govt.", location: "Calabar Port", volumeM3: 420000, progress: 28, startDate: "2026-03-01", endDate: "2027-06-30", budget: "₦1.8B", spent: "₦420M", status: "active" },
  { id: "DRG-2026-004", client: "Dangote Industries", location: "Lekki Deep Sea Port", volumeM3: 2100000, progress: 100, startDate: "2024-06-01", endDate: "2026-02-28", budget: "₦7.2B", spent: "₦6.9B", status: "completed" },
];

const crew = [
  { name: "Capt. Ibrahim Bello", role: "Master Mariner", license: "Class 1 Unlimited", certExpiry: "2027-04-15", vessel: "Kauvex Dragon", daysOnBoard: 45, status: "active" },
  { name: "Capt. Stella Okafor", role: "Master Mariner", license: "Class 1 Coastal", certExpiry: "2026-11-20", vessel: "Kauvex Titan", daysOnBoard: 38, status: "active" },
  { name: "Engr. Chidi Nwosu", role: "Chief Engineer", license: "Class 1 Marine Engineering", certExpiry: "2027-02-10", vessel: "Kauvex Dragon", daysOnBoard: 45, status: "active" },
  { name: "Samuel Adeyemi", role: "Dredge Operator", license: "Dredging Operations Certificate", certExpiry: "2026-08-05", vessel: "Kauvex Titan", daysOnBoard: 32, status: "active" },
  { name: "Grace Yusuf", role: "Environmental Officer", license: "Environmental Compliance", certExpiry: "2027-06-30", vessel: "Kauvex Tide", daysOnBoard: 22, status: "active" },
  { name: "Capt. Michael Obi", role: "Master Mariner", license: "Class 2 Coastal", certExpiry: "2026-05-15", vessel: "Kauvex Storm", daysOnBoard: 0, status: "leave" },
];

const maintenanceItems = [
  { vessel: "Kauvex Dragon", type: "Engine Overhaul", dueDate: "2026-08-15", priority: "high", assignedTo: "Engr. Chidi Nwosu", status: "scheduled", notes: "Main engine 5000hr service" },
  { vessel: "Kauvex Titan", type: "Hydraulic System Inspection", dueDate: "2026-09-01", priority: "medium", assignedTo: "Engr. Funmi Ojo", status: "scheduled", notes: "Check all hydraulic lines and pumps" },
  { vessel: "Kauvex Storm", type: "Cutter Head Replacement", dueDate: "2026-07-28", priority: "urgent", assignedTo: "Engr. Chidi Nwosu", status: "in_progress", notes: "Worn teeth — full replacement needed" },
  { vessel: "Kauvex Tide", type: "GPS & Survey Equipment Calibration", dueDate: "2026-10-12", priority: "low", assignedTo: "Survey Team", status: "scheduled" },
  { vessel: "Kauvex Dragon", type: "Annual Classification Survey", dueDate: "2026-09-30", priority: "high", assignedTo: "DNV Surveyor", status: "pending", notes: "Mandatory for insurance coverage" },
];

export default function DredgingERPage() {
  const [activeTab, setActiveTab] = useState("vessels");

  return (
    <div className="min-h-screen bg-off-white">
      <div className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-xs text-text-4">
            <Link href="/" className="hover:text-blue transition-colors">Home</Link>
            <span>/</span>
            <Link href="/industry-erp" className="hover:text-blue transition-colors">Industry ERP</Link>
            <span>/</span>
            <span className="text-text-2 font-semibold">Dredging Operations</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-navy to-blue-900 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <Droplets size={28} className="text-orange" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-2xl text-white">Dredging Operations ERP</h1>
              <p className="text-white/60 text-sm">Fleet Management | Project Tracking | Crew Compliance</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Active Dredgers", value: "3", icon: Ship },
              { label: "Active Projects", value: "3", icon: HardHat },
              { label: "Crew on Board", value: "22", icon: Users },
              { label: "Volume Dredged", value: "4.2M m³", icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className="text-orange" />
                  <span className="text-white/50 text-[10px] uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-white font-syne font-bold text-xl">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-syne font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key ? "border-orange text-orange" : "border-transparent text-text-3 hover:text-text-1"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {activeTab === "vessels" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white border-b border-border">
                  <tr>
                    {["Vessel Name", "Type", "Status", "Location", "Current Project", "Fuel Consumption", "Hours Logged", "Next Service", "Captain"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dredgers.map((v) => (
                    <tr key={v.name} className="border-b border-border last:border-0 hover:bg-off-white/50">
                      <td className="px-4 py-3 font-semibold text-text-1">{v.name}</td>
                      <td className="px-4 py-3 text-text-3 text-xs">{v.type}</td>
                      <td className="px-4 py-3">
                        <Badge variant={v.status === "operational" ? "default" : "outline"} className={`text-[10px] ${v.status === "operational" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600"}`}>
                          {v.status === "operational" ? "Operational" : "Under Maintenance"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-text-2">{v.location}</td>
                      <td className="px-4 py-3 text-text-3 text-xs max-w-[200px] truncate">{v.project}</td>
                      <td className="px-4 py-3 text-text-2 font-mono text-xs">{v.fuelConsumption}</td>
                      <td className="px-4 py-3 text-text-2 font-mono text-xs">{v.hoursLogged.toLocaleString()}</td>
                      <td className="px-4 py-3 text-text-3 text-xs">{v.nextService}</td>
                      <td className="px-4 py-3 text-text-3 text-xs">{v.captain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white border-b border-border">
                  <tr>
                    {["Project ID", "Client", "Location", "Volume (m³)", "Progress", "Duration", "Budget", "Spent", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-off-white/50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-text-1">{p.id}</td>
                      <td className="px-4 py-3 text-text-2">{p.client}</td>
                      <td className="px-4 py-3 text-text-3">{p.location}</td>
                      <td className="px-4 py-3 text-text-2 font-mono text-xs">{p.volumeM3.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-off-white rounded-full overflow-hidden">
                            <div className="h-full bg-orange rounded-full" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-text-2">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-3 text-xs">{p.startDate} — {p.endDate}</td>
                      <td className="px-4 py-3 text-text-2 font-bold text-xs">{p.budget}</td>
                      <td className="px-4 py-3 text-text-3 text-xs">{p.spent}</td>
                      <td className="px-4 py-3">
                        <Badge variant={p.status === "active" ? "default" : "outline"} className={`text-[10px] ${p.status === "active" ? "bg-blue text-white" : "bg-success/10 text-success"}`}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "crew" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white border-b border-border">
                  <tr>
                    {["Name", "Role", "License", "Cert Expiry", "Assigned Vessel", "Days Onboard", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {crew.map((c) => (
                    <tr key={c.name} className="border-b border-border last:border-0 hover:bg-off-white/50">
                      <td className="px-4 py-3 font-semibold text-text-1">{c.name}</td>
                      <td className="px-4 py-3 text-text-2">{c.role}</td>
                      <td className="px-4 py-3 text-text-3 text-xs">{c.license}</td>
                      <td className="px-4 py-3 text-xs">{c.certExpiry}</td>
                      <td className="px-4 py-3 text-text-3">{c.vessel}</td>
                      <td className="px-4 py-3 text-text-2 font-mono text-xs">{c.daysOnBoard}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.status === "active" ? "default" : "outline"} className={`text-[10px] ${c.status === "active" ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600"}`}>
                          {c.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white border-b border-border">
                  <tr>
                    {["Vessel", "Maintenance Type", "Due Date", "Priority", "Assigned To", "Status", "Notes"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maintenanceItems.map((m, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-off-white/50">
                      <td className="px-4 py-3 font-semibold text-text-1">{m.vessel}</td>
                      <td className="px-4 py-3 text-text-3 text-xs">{m.type}</td>
                      <td className="px-4 py-3 text-xs">{m.dueDate}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${
                          m.priority === "urgent" ? "bg-red/10 text-red border-red/20" :
                          m.priority === "high" ? "bg-orange/10 text-orange border-orange/20" :
                          m.priority === "medium" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-blue-50 text-blue border-blue-200"
                        }`}>{m.priority}</Badge>
                      </td>
                      <td className="px-4 py-3 text-text-3 text-xs">{m.assignedTo}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${
                          m.status === "in_progress" ? "bg-blue text-white" :
                          m.status === "scheduled" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-off-white text-text-4"
                        }`}>{m.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3 text-text-4 text-xs max-w-[250px] truncate">{m.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}