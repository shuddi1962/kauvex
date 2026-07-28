"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package, Plus, Wrench, ShieldAlert, Activity,
  ChevronRight, Loader2, AlertCircle, CalendarClock,
  Building2, WrenchIcon, HardDrive, Cpu, Truck, Anchor,
  Wind, Dribbble as Drill, Tractor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const typeIcons: Record<string, typeof Package> = {
  "Construction Equipment": Building2,
  "Marine Equipment": Anchor,
  "Industrial Machinery": Cpu,
  "Agricultural Machinery": Tractor,
  "Security Equipment": ShieldAlert,
  "ICT Equipment": HardDrive,
  "Power & Energy Equipment": Wind,
  "Transportation Equipment": Truck,
  default: Package,
};

const conditionColors: Record<string, string> = {
  excellent: "bg-green-100 text-green-700 border-green-200",
  good: "bg-blue-100 text-blue-700 border-blue-200",
  fair: "bg-amber-100 text-amber-700 border-amber-200",
  poor: "bg-red-100 text-red-700 border-red-200",
};

interface DigitalTwin {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  condition: string;
  nextMaintenance: string;
  warrantyEnd: string;
  warrantyStatus: string;
  location: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<DigitalTwin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/kpn/digital-twins")
      .then((r) => { if (!r.ok) throw new Error("Failed to load assets"); return r.json(); })
      .then((d) => setAssets(Array.isArray(d) ? d : d.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[#0A1628] mb-2">Failed to Load Assets</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  );

  const totalAssets = assets.length;
  const maintenanceDue = assets.filter((a) => {
    const d = new Date(a.nextMaintenance);
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff > 0;
  }).length;
  const warrantiesExpiring = assets.filter((a) => {
    const d = new Date(a.warrantyEnd);
    const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  }).length;

  const stats = [
    { label: "Total Assets", value: totalAssets, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Maintenance Due (30d)", value: maintenanceDue, icon: Wrench, color: "bg-amber-50 text-amber-600" },
    { label: "Warranties Expiring (90d)", value: warrantiesExpiring, icon: ShieldAlert, color: "bg-red-50 text-red-600" },
    { label: "Active Assets", value: assets.filter((a) => a.condition !== "poor").length, icon: Activity, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Asset Registry</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Digital Twin & Asset Registry</h1>
            <p className="text-gray-500 mt-1">Manage your equipment digital twins, maintenance, and lifecycle</p>
          </div>
          <Link href="/assets/add">
            <Button>
              <Plus size={16} className="mr-2" /> Add Asset
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#0A1628]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        {assets.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Assets Registered</h3>
            <p className="text-sm text-gray-500 mb-6">Add your first equipment digital twin to start tracking.</p>
            <Link href="/assets/add"><Button>Add Your First Asset</Button></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((a) => {
              const Icon = typeIcons[a.type] || typeIcons.default;
              const condClass = conditionColors[a.condition] || conditionColors.good;
              const warrantyDays = Math.ceil(
                (new Date(a.warrantyEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );
              return (
                <Link key={a.id} href={`/assets/${a.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#FF6B00]/30 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF4EC] flex items-center justify-center">
                        <Icon size={24} className="text-[#FF6B00]" />
                      </div>
                      <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${condClass}`}>
                        {a.condition}
                      </div>
                    </div>
                    <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">
                      {a.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{a.manufacturer} {a.model}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-400">
                        <CalendarClock size={12} />
                        <span>Maint: {a.nextMaintenance ? new Date(a.nextMaintenance).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShieldAlert size={12} className={warrantyDays <= 90 && warrantyDays > 0 ? "text-amber-500" : "text-green-500"} />
                        <span className={warrantyDays <= 90 && warrantyDays > 0 ? "text-amber-600" : "text-green-600"}>
                          {warrantyDays > 0 ? `${warrantyDays}d left` : "Expired"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
