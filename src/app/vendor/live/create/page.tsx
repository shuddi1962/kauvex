"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Radio, ArrowLeft, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductEntry {
  productName: string;
  flashPrice: number;
}

export default function VendorCreateStreamPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [goLiveNow, setGoLiveNow] = useState(true);
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [productName, setProductName] = useState("");
  const [flashPrice, setFlashPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddProduct = () => {
    if (!productName || !flashPrice) return;
    setProducts(prev => [...prev, { productName, flashPrice: Number(flashPrice) }]);
    setProductName("");
    setFlashPrice("");
  };

  const handleSubmit = async () => {
    if (!title) return;
    setSubmitting(true);
    try {
      const body = {
        action: "create",
        creatorId: "vendor",
        vendorId: "current",
        title,
        description: description || undefined,
        scheduledAt: goLiveNow ? undefined : scheduledAt || undefined,
        products: products.map(p => p.productName),
      };
      const res = await fetch("/api/v1/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/vendor/live");
      }
    } catch (e) {
      console.error("Failed to create stream", e);
    } finally {
      setSubmitting(false);
    }
  };

  const sideLinks = [
    { label: "Dashboard", href: "/vendor/live", active: false },
    { label: "Create Stream", href: "/vendor/live/create", active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-200 p-4 space-y-1 shrink-0">
        <h2 className="font-bold text-[#0A1628] px-3 mb-4">Live Commerce</h2>
        {sideLinks.map(l => (
          <Link key={l.label} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${l.active ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex-1 p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/vendor/live" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-[#0A1628]">Create Live Stream</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Stream Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
              placeholder="e.g. Summer Collection Launch - 50% Off Live Only!" />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#0A1628] mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full h-24 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
              placeholder="Describe what you'll showcase in this stream..." />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#0A1628] mb-3 block">Schedule</label>
            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={goLiveNow} onChange={() => setGoLiveNow(true)} className="accent-[#FF6B00]" />
                <span className="text-sm">Go live now</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!goLiveNow} onChange={() => setGoLiveNow(false)} className="accent-[#FF6B00]" />
                <span className="text-sm">Schedule for later</span>
              </label>
            </div>
            {!goLiveNow && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-[#0A1628] mb-2 block">Products to Feature</label>
            <div className="border border-gray-200 rounded-lg p-3 space-y-2">
              {products.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={p.productName} readOnly className="flex-1 h-9 px-2 rounded border border-gray-100 text-xs bg-gray-50" />
                  <input value={`₦${p.flashPrice}`} readOnly className="w-28 h-9 px-2 rounded border border-gray-100 text-xs bg-gray-50" />
                  <button onClick={() => setProducts(prev => prev.filter((_, j) => j !== i))} className="p-1.5 text-red-400 hover:bg-red-50 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input placeholder="Product name" value={productName} onChange={e => setProductName(e.target.value)}
                  className="flex-1 h-9 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-[#FF6B00]" />
                <input placeholder="Flash price" value={flashPrice} onChange={e => setFlashPrice(e.target.value)} type="number"
                  className="w-28 h-9 px-2 rounded border border-gray-200 text-xs focus:outline-none focus:border-[#FF6B00]" />
                <Button size="sm" variant="outline" onClick={handleAddProduct}>Add</Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={!title || submitting} className="bg-[#FF6B00] hover:bg-[#e86000]">
              {submitting ? "Creating..." : goLiveNow ? "Go Live Now" : "Schedule Stream"}
            </Button>
            <Link href="/vendor/live">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
