"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, Loader2, AlertCircle, DollarSign,
  CheckCircle, ArrowLeft, Package, Building2, Cpu,
  Truck, Anchor, Wind, Tractor, HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, typeof Package> = {
  "Construction Equipment": Building2,
  "Marine Equipment": Anchor,
  "Industrial Machinery": Cpu,
  "Agricultural Machinery": Tractor,
  "ICT Equipment": HardDrive,
  "Transportation Equipment": Truck,
  default: Package,
};

interface AssetInfo {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  condition: string;
  purchaseYear: number;
  location: string;
}

export default function SellAssetPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<AssetInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [conditionConfirmed, setConditionConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/v1/kpn/digital-twins/${params.id}`)
      .then((r) => { if (!r.ok) throw new Error("Asset not found"); return r.json(); })
      .then((d) => setAsset(d.data || d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async () => {
    if (!askingPrice || isNaN(Number(askingPrice)) || !conditionConfirmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/kpn/digital-twins/${params.id}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ askingPrice: Number(askingPrice) }),
      });
      if (!res.ok) throw new Error("Failed to list asset");
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to list asset");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
    </div>
  );

  if (error && !asset) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-[#0A1628] mb-2">Asset Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Link href="/assets"><Button variant="outline">Back to Assets</Button></Link>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-green-200 p-8 text-center max-w-md">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0A1628] mb-2">Listed Successfully!</h2>
        <p className="text-sm text-gray-500 mb-2">{asset?.name} has been listed on the Used Equipment Marketplace.</p>
        <p className="text-lg font-bold text-[#FF6B00] mb-6">${Number(askingPrice).toLocaleString()}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/assets")}>Back to Assets</Button>
          <Button onClick={() => router.push("/marketplace/used-equipment")}>View Marketplace</Button>
        </div>
      </div>
    </div>
  );

  const Icon = typeIcons[asset?.type || ""] || Package;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/assets" className="hover:text-[#FF6B00]">Asset Registry</Link>
          <ChevronRight size={12} />
          <Link href={`/assets/${params.id}`} className="hover:text-[#FF6B00]">{asset?.name}</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Sell</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/assets/${params.id}`} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-400" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0A1628]">Sell {asset?.name}</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-[#0A1628] mb-4">Asset Information</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#FFF4EC] flex items-center justify-center">
              <Icon size={28} className="text-[#FF6B00]" />
            </div>
            <div>
              <p className="font-bold text-lg text-[#0A1628]">{asset?.name}</p>
              <p className="text-sm text-gray-500">{asset?.manufacturer} {asset?.model}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-[#0A1628]">{asset?.type}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Serial Number</span>
              <span className="font-medium text-[#0A1628]">{asset?.serialNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Year</span>
              <span className="font-medium text-[#0A1628]">{asset?.purchaseYear}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Condition</span>
              <span className={`font-medium capitalize ${
                asset?.condition === "excellent" ? "text-green-600" :
                asset?.condition === "good" ? "text-blue-600" :
                asset?.condition === "fair" ? "text-amber-600" : "text-red-600"
              }`}>{asset?.condition}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 sm:col-span-2">
              <span className="text-gray-500">Location</span>
              <span className="font-medium text-[#0A1628]">{asset?.location || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-[#0A1628] mb-4">Asking Price</h2>
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              type="number"
              value={askingPrice}
              onChange={(e) => setAskingPrice(e.target.value)}
              placeholder="Enter your asking price"
              className="w-full h-12 pl-8 pr-4 rounded-lg border border-gray-200 text-lg font-bold text-[#0A1628] focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
            />
          </div>
          <p className="text-xs text-gray-400">Marketplace listing fee: 5% of sale price (capped at $500)</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={conditionConfirmed}
              onChange={(e) => setConditionConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
            />
            <span className="text-sm text-gray-600">
              I confirm that the condition, specifications, and details provided for{" "}
              <strong className="text-[#0A1628]">{asset?.name}</strong> are accurate and complete.
              I have the legal right to sell this asset.
            </span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link href={`/assets/${params.id}`}><Button variant="outline">Cancel</Button></Link>
          <Button
            onClick={handleSubmit}
            disabled={!askingPrice || !conditionConfirmed}
            loading={submitting}
          >
            <DollarSign size={16} className="mr-2" />
            {submitting ? "Listing..." : `List for $${Number(askingPrice || 0).toLocaleString()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
