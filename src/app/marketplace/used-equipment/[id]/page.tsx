"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, Loader2, AlertCircle, Package,
  MapPin, Calendar, DollarSign, Phone, Mail,
  ArrowLeft, Shield, Wrench, FileText, Clock,
  Building2, Cpu, Truck, Anchor, Wind, Tractor, HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const typeIcons: Record<string, typeof Package> = {
  "Construction Equipment": Building2,
  "Marine Equipment": Anchor,
  "Industrial Machinery": Cpu,
  "Agricultural Machinery": Tractor,
  "ICT Equipment": HardDrive,
  "Transportation Equipment": Truck,
  default: Package,
};

const conditionColors: Record<string, string> = {
  excellent: "bg-green-100 text-green-700 border-green-200",
  good: "bg-blue-100 text-blue-700 border-blue-200",
  fair: "bg-amber-100 text-amber-700 border-amber-200",
  poor: "bg-red-100 text-red-700 border-red-200",
};

interface UsedEquipmentDetail {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  year: number;
  condition: string;
  askingPrice: number;
  location: string;
  listedAt: string;
  description: string;
  conditionReport: string;
  maintenanceHistory: { id: string; type: string; date: string; notes: string }[];
  seller: { name: string; phone: string; email: string };
  assetId: string;
}

export default function UsedEquipmentDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<UsedEquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/v1/kpn/used-equipment/${params.id}`)
      .then((r) => { if (!r.ok) throw new Error("Listing not found"); return r.json(); })
      .then((d) => setItem(d.data || d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
    </div>
  );

  if (error || !item) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[#0A1628] mb-2">Listing Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">{error || "The requested listing could not be found."}</p>
        <Link href="/marketplace/used-equipment"><Button variant="outline"><ArrowLeft size={14} className="mr-2" /> Back to Listings</Button></Link>
      </div>
    </div>
  );

  const Icon = typeIcons[item.type] || Package;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace/used-equipment" className="hover:text-[#FF6B00]">Used Equipment</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium truncate">{item.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/marketplace/used-equipment" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#FF6B00] mb-6">
          <ArrowLeft size={14} /> Back to listings
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package size={80} className="text-gray-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#0A1628]">{item.name}</h1>
                  <p className="text-gray-500 mt-1">{item.manufacturer} {item.model}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${conditionColors[item.condition] || conditionColors.good}`}>
                  {item.condition}
                </div>
              </div>

              <div className="text-3xl font-bold text-[#FF6B00] mb-6">${item.askingPrice.toLocaleString()}</div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <InfoRow icon={Package} label="Type" value={item.type} />
                <InfoRow icon={Calendar} label="Year" value={item.year?.toString() || "N/A"} />
                <InfoRow icon={Shield} label="Serial Number" value={item.serialNumber || "N/A"} />
                <InfoRow icon={MapPin} label="Location" value={item.location || "N/A"} />
              </div>
            </div>

            {item.description && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-[#0A1628] mb-3">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            )}

            {item.conditionReport && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-bold text-[#0A1628] mb-3">Condition Report</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{item.conditionReport}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-[#0A1628] mb-4">Maintenance History</h2>
              {item.maintenanceHistory.length === 0 ? (
                <p className="text-sm text-gray-400">No maintenance records available.</p>
              ) : (
                <div className="space-y-3">
                  {item.maintenanceHistory.map((m) => (
                    <div key={m.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Wrench size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#0A1628]">{m.type}</p>
                        <p className="text-xs text-gray-400">{m.date ? new Date(m.date).toLocaleDateString() : "N/A"}</p>
                        {m.notes && <p className="text-xs text-gray-500 mt-1">{m.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <h3 className="font-bold text-[#0A1628] mb-4">Contact Seller</h3>
              {item.seller && (
                <div className="space-y-3 mb-6">
                  <p className="font-medium text-sm">{item.seller.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail size={14} /> {item.seller.email}
                  </div>
                  {item.seller.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={14} /> {item.seller.phone}
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <Button className="w-full">
                  <Phone size={16} className="mr-2" /> Contact Seller
                </Button>
                <Button variant="outline" className="w-full">
                  <DollarSign size={16} className="mr-2" /> Buy Now
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">
                Secure transaction through Kauvex Marketplace
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100">
      <Icon size={14} className="text-gray-400" />
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-[#0A1628]">{value}</span>
    </div>
  );
}
