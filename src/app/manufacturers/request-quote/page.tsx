"use client";

import { useState } from "react";
import {
  Send, Upload, X, Loader2, CheckCircle, AlertCircle,
  Package, MapPin, Building2, FileText, Image as ImageIcon,
} from "lucide-react";

const categories = [
  "Textiles & Apparel", "Electronics & Components", "Machinery & Industrial",
  "Automotive Parts", "Food & Beverage Processing", "Pharmaceuticals & Medical",
  "Chemicals & Plastics", "Building Materials", "Furniture & Woodwork",
  "Packaging & Printing", "Metals & Alloys", "Rubber & Tire",
  "Paper & Pulp", "Ceramics & Glass", "Footwear & Leather",
  "Toys & Consumer Goods", "Energy & Solar", "Agriculture & Farming",
  "Handicrafts & Artisans",
];

const countries = [
  "Nigeria", "China", "India", "USA", "UK", "Germany", "UAE",
  "Ghana", "South Africa", "Japan", "Turkey", "Vietnam",
  "Bangladesh", "Brazil", "France",
];

const sampleManufacturers = [
  { id: "m1", name: "Shenzhen Electronics Co", country: "China", category: "Electronics & Components", rating: 4.8, verified: true },
  { id: "m2", name: "Tiruppur Textiles Ltd", country: "India", category: "Textiles & Apparel", rating: 4.6, verified: true },
  { id: "m3", name: "Lagos Industrial Corp", country: "Nigeria", category: "Machinery & Industrial", rating: 4.2, verified: false },
  { id: "m4", name: "Istanbul Ceramics GmbH", country: "Germany", category: "Ceramics & Glass", rating: 4.9, verified: true },
  { id: "m5", name: "Guangzhou Plastics Ltd", country: "China", category: "Chemicals & Plastics", rating: 4.3, verified: true },
  { id: "m6", name: "Dhaka Garments Corp", country: "Bangladesh", category: "Textiles & Apparel", rating: 4.1, verified: false },
  { id: "m7", name: "Ho Chi Minh Footwear", country: "Vietnam", category: "Footwear & Leather", rating: 4.5, verified: true },
  { id: "m8", name: "Mumbai Pharma Industries", country: "India", category: "Pharmaceuticals & Medical", rating: 4.7, verified: true },
];

export default function RequestQuotePage() {
  const [form, setForm] = useState({
    productDescription: "",
    quantity: "",
    targetPrice: "",
    customization: "",
    deliveryTimeline: "",
    destinationCountry: "Nigeria",
    broadcast: true,
    selectedCategory: "",
    selectedManufacturers: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredManufacturers = form.selectedCategory
    ? sampleManufacturers.filter((m) => m.category === form.selectedCategory)
    : sampleManufacturers;

  const toggleManufacturer = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedManufacturers: prev.selectedManufacturers.includes(id)
        ? prev.selectedManufacturers.filter((m) => m !== id)
        : [...prev.selectedManufacturers, id],
    }));
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setImages((prev) => [...prev, ...files].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.productDescription.trim()) errs.productDescription = "Product description is required";
    if (!form.quantity || +form.quantity <= 0) errs.quantity = "Valid quantity is required";
    if (!form.deliveryTimeline) errs.deliveryTimeline = "Delivery timeline is required";
    if (!form.broadcast && form.selectedManufacturers.length === 0) {
      errs.manufacturers = "Select at least one manufacturer";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        quantity: +form.quantity,
        targetPrice: form.targetPrice ? +form.targetPrice : undefined,
      };
      const res = await fetch("/api/v1/manufacturers/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-[#0A1628] mb-2">RFQ Submitted</h1>
          <p className="text-gray-600 text-sm mb-6">
            Your request for quote has been sent to {form.broadcast ? "matching manufacturers" : `${form.selectedManufacturers.length} selected manufacturer(s)}`}. You&apos;ll receive quotes within 2-5 business days.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({
                productDescription: "", quantity: "", targetPrice: "", customization: "",
                deliveryTimeline: "", destinationCountry: "Nigeria", broadcast: true,
                selectedCategory: "", selectedManufacturers: [],
              });
              setImages([]);
            }}
            className="rounded-lg bg-[#FF6B00] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e55f00] transition-colors"
          >
            Submit Another RFQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628]">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Request for Quote</h1>
          <p className="mt-2 text-gray-300">Describe your product needs and receive competitive quotes from verified manufacturers.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Product Description */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-[#FF6B00]" />
              <h2 className="font-semibold text-[#0A1628]">Product Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Description *</label>
                <textarea
                  rows={4}
                  value={form.productDescription}
                  onChange={(e) => setForm({ ...form, productDescription: e.target.value })}
                  placeholder="e.g. USB-C to Lightning cables, 1.5m length, white color, MFi certified, minimum 1000 units..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none"
                />
                {errors.productDescription && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.productDescription}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Unit Price (optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.targetPrice}
                    onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
                    placeholder="e.g. 2.50"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reference Images */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-[#FF6B00]" />
              <h2 className="font-semibold text-[#0A1628]">Reference Images</h2>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-[#FF6B00]/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drag & drop images here, or <span className="text-[#FF6B00] font-medium">browse</span></p>
              <p className="text-xs text-gray-400 mt-1">Max 5 images, JPG/PNG/WebP up to 5MB each</p>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-[9px] text-gray-500 mt-0.5 text-center truncate w-16">{img.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customization & Timeline */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-[#FF6B00]" />
              <h2 className="font-semibold text-[#0A1628]">Requirements</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customization Details</label>
                <textarea
                  rows={3}
                  value={form.customization}
                  onChange={(e) => setForm({ ...form, customization: e.target.value })}
                  placeholder="Logo printing, custom packaging, specific color codes, material requirements..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Timeline *</label>
                  <select
                    value={form.deliveryTimeline}
                    onChange={(e) => setForm({ ...form, deliveryTimeline: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
                  >
                    <option value="">Select timeline</option>
                    <option value="15">Within 15 days</option>
                    <option value="30">Within 30 days</option>
                    <option value="45">Within 45 days</option>
                    <option value="60">Within 60 days</option>
                    <option value="90">Within 90 days</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  {errors.deliveryTimeline && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.deliveryTimeline}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination Country</label>
                  <select
                    value={form.destinationCountry}
                    onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Manufacturer Selection */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#FF6B00]" />
              <h2 className="font-semibold text-[#0A1628]">Manufacturer Selection</h2>
            </div>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.broadcast}
                onChange={(e) => setForm({ ...form, broadcast: e.target.checked, selectedManufacturers: [] })}
                className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
              />
              <span className="text-sm text-gray-700">Broadcast to multiple manufacturers</span>
            </label>

            {!form.broadcast && (
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
                  <select
                    value={form.selectedCategory}
                    onChange={(e) => setForm({ ...form, selectedCategory: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {errors.manufacturers && (
                  <p className="mb-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.manufacturers}
                  </p>
                )}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredManufacturers.map((m) => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        form.selectedManufacturers.includes(m.id)
                          ? "border-[#FF6B00] bg-orange-50"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedManufacturers.includes(m.id)}
                        onChange={() => toggleManufacturer(m.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#0A1628] truncate">{m.name}</span>
                          {m.verified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{m.country} · {m.category} · ★ {m.rating}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {form.broadcast && (
              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                Your RFQ will be sent to all verified manufacturers matching your product category.
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <MapPin className="w-3 h-3 inline mr-1" />
              Delivery to: {form.destinationCountry}
            </p>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[#FF6B00] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e55f00] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit RFQ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
