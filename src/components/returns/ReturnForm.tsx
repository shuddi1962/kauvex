"use client";

import { useState, useRef } from "react";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReturnFormData {
  orderId: string;
  productId: string;
  reason: string;
  description: string;
  photos: string[];
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: { id: string; productId: string; productName: string; productImage: string | null; quantity: number }[];
}

interface ReturnFormProps {
  orders: OrderSummary[];
  onSubmit: (data: ReturnFormData) => Promise<void>;
  onCancel: () => void;
}

const REASONS: Record<string, string[]> = {
  electronics: ["Defective product", "Wrong item received", "Damaged in transit", "Not as described", "Compatibility issue", "Missing accessories"],
  fashion: ["Wrong size", "Wrong color", "Defective stitching", "Not as pictured", "Uncomfortable fit", "Changed mind"],
  default: ["Defective product", "Wrong item received", "Damaged in transit", "Not as described", "Changed mind", "No longer needed", "Quality not as expected"],
};

const CATEGORY_KEYWORDS: Record<string, string> = {
  electronics: "electronics",
  fashion: "fashion",
};

function guessCategory(productName: string): string {
  const lower = productName.toLowerCase();
  for (const [cat, word] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(word)) return cat;
  }
  return "default";
}

export default function ReturnForm({ orders, onSubmit, onCancel }: ReturnFormProps) {
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const items = selectedOrder?.items || [];
  const selectedProduct = items.find((i) => i.id === selectedProductId);
  const reasonList = REASONS[guessCategory(selectedProduct?.productName || "")] || REASONS.default;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setPhotos((prev) => [...prev, url].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    if (!selectedOrderId) return setError("Please select an order");
    if (!selectedProductId) return setError("Please select a product");
    if (!reason) return setError("Please select a reason");
    setSubmitting(true);
    try {
      await onSubmit({ orderId: selectedOrderId, productId: selectedProductId, reason, description, photos });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit return");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <h3 className="font-semibold text-lg text-[#0A1628] mb-4">New Return Request</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Order</label>
          <select
            value={selectedOrderId}
            onChange={(e) => { setSelectedOrderId(e.target.value); setSelectedProductId(""); }}
            className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
          >
            <option value="">Select an order...</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {new Date(o.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Product</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            disabled={!selectedOrderId}
          >
            <option value="">Select product...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName} x{item.quantity || 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Reason for Return</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
          >
            <option value="">Select reason...</option>
            {reasonList.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Upload Photos (max 5)</label>
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-[#FF6B00] transition-colors"
              >
                <Upload size={16} className="text-gray-400" />
                <span className="text-[10px] text-gray-400">Upload</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={handleSubmit} disabled={submitting} className="bg-[#FF6B00] hover:bg-[#e06000] text-white">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {submitting ? "Submitting..." : "Submit Return Request"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}