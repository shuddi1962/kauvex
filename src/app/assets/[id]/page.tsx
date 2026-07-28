"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, ChevronRight, Loader2, AlertCircle, Calendar,
  Wrench, FileText, User, BadgePercent, DollarSign,
  Clock, ShieldAlert, CheckCircle, XCircle, Plus,
  ArrowLeft, Download, Building2, HardDrive, Cpu,
  Truck, Anchor, Wind, Tractor
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
  excellent: "text-green-600 bg-green-50 border-green-200",
  good: "text-blue-600 bg-blue-50 border-blue-200",
  fair: "text-amber-600 bg-amber-50 border-amber-200",
  poor: "text-red-600 bg-red-50 border-red-200",
};

interface DigitalTwin {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: string;
  location: string;
  description: string;
  installation: { date: string; installerName: string; installerId: string; certificateUrl: string } | null;
  warranty: { startDate: string; endDate: string; provider: string; status: string };
  maintenance: { id: string; type: string; frequency: string; lastDone: string; nextDue: string; status: string; notes: string }[];
  documents: { id: string; name: string; type: string; url: string; uploadedAt: string }[];
  ownership: { id: string; ownerName: string; fromDate: string; toDate: string | null }[];
  currentOwner: string;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showSellModal, setShowSellModal] = useState(false);
  const [askingPrice, setAskingPrice] = useState("");
  const [selling, setSelling] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: Package },
    { id: "installation", label: "Installation", icon: Download },
    { id: "warranty", label: "Warranty", icon: ShieldAlert },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "ownership", label: "Ownership", icon: User },
    { id: "sell-transfer", label: "Sell / Transfer", icon: DollarSign },
  ];

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/v1/kpn/digital-twins/${params.id}`)
      .then((r) => { if (!r.ok) throw new Error("Asset not found"); return r.json(); })
      .then((d) => setAsset(d.data || d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSell = async () => {
    if (!askingPrice || isNaN(Number(askingPrice))) return;
    setSelling(true);
    try {
      await fetch(`/api/v1/kpn/digital-twins/${params.id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ askingPrice: Number(askingPrice) }),
      });
      router.push("/marketplace/used-equipment");
    } catch {
      setError("Failed to list asset for sale");
    } finally {
      setSelling(false);
      setShowSellModal(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
    </div>
  );

  if (error || !asset) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[#0A1628] mb-2">Asset Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">{error || "The requested asset could not be found."}</p>
        <Link href="/assets"><Button variant="outline"><ArrowLeft size={14} className="mr-2" /> Back to Assets</Button></Link>
      </div>
    </div>
  );

  const Icon = typeIcons[asset.type] || typeIcons.default;

  const TabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <InfoRow label="Asset Name" value={asset.name} />
              <InfoRow label="Type" value={asset.type} />
              <InfoRow label="Manufacturer" value={asset.manufacturer} />
              <InfoRow label="Model" value={asset.model} />
              <InfoRow label="Serial Number" value={asset.serialNumber} />
            </div>
            <div className="space-y-4">
              <InfoRow label="Condition" value={
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conditionColors[asset.condition] || conditionColors.good}`}>
                  {asset.condition}
                </span>
              } />
              <InfoRow label="Purchase Date" value={asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"} />
              <InfoRow label="Purchase Price" value={asset.purchasePrice ? `$${asset.purchasePrice.toLocaleString()}` : "N/A"} />
              <InfoRow label="Location" value={asset.location || "N/A"} />
              {asset.description && <InfoRow label="Description" value={asset.description} />}
            </div>
          </div>
        );

      case "installation":
        if (!asset.installation) return <div className="text-center py-12 text-gray-400">No installation records found.</div>;
        return (
          <div className="max-w-lg space-y-4">
            <InfoRow label="Installation Date" value={new Date(asset.installation.date).toLocaleDateString()} />
            <InfoRow label="Installer" value={
              <Link href={`/vendors/${asset.installation.installerId}`} className="text-[#FF6B00] hover:underline">
                {asset.installation.installerName}
              </Link>
            } />
            {asset.installation.certificateUrl && (
              <div>
                <Button variant="outline" onClick={() => window.open(asset.installation!.certificateUrl)}>
                  <Download size={14} className="mr-2" /> Download Certificate
                </Button>
              </div>
            )}
          </div>
        );

      case "warranty":
        if (!asset.warranty) return <div className="text-center py-12 text-gray-400">No warranty information available.</div>;
        const daysRemaining = Math.ceil(
          (new Date(asset.warranty.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return (
          <div className="max-w-lg space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant={asset.warranty.status === "active" ? "success" : asset.warranty.status === "expiring" ? "warning" : "error"}>
                  {asset.warranty.status}
                </Badge>
              </div>
              <InfoRow label="Provider" value={asset.warranty.provider} />
              <InfoRow label="Start Date" value={new Date(asset.warranty.startDate).toLocaleDateString()} />
              <InfoRow label="End Date" value={new Date(asset.warranty.endDate).toLocaleDateString()} />
              <InfoRow label="Days Remaining" value={
                <span className={`font-bold ${daysRemaining <= 90 ? "text-amber-600" : "text-green-600"}`}>
                  {daysRemaining > 0 ? `${daysRemaining} days` : "Expired"}
                </span>
              } />
            </div>
          </div>
        );

      case "maintenance":
        return (
          <div>
            {asset.maintenance.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No maintenance schedules yet.</div>
            ) : (
              <div className="space-y-3 mb-6">
                {asset.maintenance.map((m) => (
                  <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#0A1628]">{m.type}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                        <span>Frequency: {m.frequency}</span>
                        <span>Last: {m.lastDone ? new Date(m.lastDone).toLocaleDateString() : "N/A"}</span>
                        <span>Next: {m.nextDue ? new Date(m.nextDue).toLocaleDateString() : "N/A"}</span>
                      </div>
                      {m.notes && <p className="text-xs text-gray-400 mt-1">{m.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={m.status === "completed" ? "success" : m.status === "overdue" ? "error" : "warning"}>
                        {m.status}
                      </Badge>
                      {m.status !== "completed" && (
                        <Button size="sm" variant="outline">Complete Maintenance</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline"><Plus size={14} className="mr-2" /> Add Schedule</Button>
          </div>
        );

      case "documents":
        return (
          <div>
            {asset.documents.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No documents uploaded.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {asset.documents.map((d) => (
                  <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#0A1628]">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.type} - {new Date(d.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => window.open(d.url)}>
                      <Download size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "ownership":
        return (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <h4 className="text-sm text-gray-500 mb-1">Current Owner</h4>
              <p className="font-semibold text-[#0A1628]">{asset.currentOwner}</p>
            </div>
            {asset.ownership.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No ownership history available.</div>
            ) : (
              <div className="relative">
                {asset.ownership.map((o, i) => (
                  <div key={o.id} className="flex gap-4 pb-6 relative">
                    {i < asset.ownership.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-[#FF6B00]/10 border-2 border-[#FF6B00] flex items-center justify-center shrink-0 z-10">
                      <User size={10} className="text-[#FF6B00]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#0A1628]">{o.ownerName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(o.fromDate).toLocaleDateString()} - {o.toDate ? new Date(o.toDate).toLocaleDateString() : "Present"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "sell-transfer":
        return (
          <div className="max-w-md space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <DollarSign size={40} className="text-[#FF6B00] mx-auto mb-3" />
              <h3 className="font-bold text-[#0A1628] mb-2">List for Sale</h3>
              <p className="text-sm text-gray-500 mb-4">List this asset on the Used Equipment Marketplace.</p>
              <Button className="w-full" onClick={() => setShowSellModal(true)}>List for Sale</Button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <User size={40} className="text-[#0A1628] mx-auto mb-3" />
              <h3 className="font-bold text-[#0A1628] mb-2">Transfer Ownership</h3>
              <p className="text-sm text-gray-500 mb-4">Transfer this asset to a new owner.</p>
              <Button variant="outline" className="w-full">Transfer Ownership</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/assets" className="hover:text-[#FF6B00]">Asset Registry</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium truncate">{asset.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start gap-4 mb-8">
          <Link href="/assets" className="p-2 rounded-lg hover:bg-gray-100 mt-1">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-xl bg-[#FFF4EC] flex items-center justify-center">
                <Icon size={24} className="text-[#FF6B00]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0A1628]">{asset.name}</h1>
                <p className="text-sm text-gray-500">{asset.manufacturer} {asset.model} · S/N: {asset.serialNumber}</p>
              </div>
            </div>
          </div>
          <Link href={`/assets/${params.id}/sell`}>
            <Button><DollarSign size={14} className="mr-2" /> Sell This Asset</Button>
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((t) => {
            const TabIcon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === t.id
                    ? "bg-[#FF6B00] text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                }`}
              >
                <TabIcon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <TabContent />
        </div>
      </div>

      {showSellModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-lg text-[#0A1628] mb-4">List "{asset.name}" for Sale</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Asking Price ($)</label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => setAskingPrice(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
                By listing, you confirm the condition information is accurate and you have the right to sell this asset.
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSellModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSell} loading={selling}>
                {selling ? "Listing..." : "Confirm Listing"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-[#0A1628] text-right max-w-[60%]">{value}</span>
    </div>
  );
}
