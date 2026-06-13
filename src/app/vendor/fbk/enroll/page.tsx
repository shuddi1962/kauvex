"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Warehouse,
  Truck,
  DollarSign,
  Check,
  Clock,
  TrendingUp,
  Loader2,
  Building2,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

interface WarehouseOption {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

const BENEFITS = [
  { icon: Warehouse, title: "KAUVEX Storage", desc: "Store products in our warehouses nationwide" },
  { icon: Truck, title: "Fast Delivery", desc: "1-3 day delivery to major cities" },
  { icon: TrendingUp, title: "Boosted Visibility", desc: "FBK products rank higher in search" },
  { icon: DollarSign, title: "Lower Shipping Costs", desc: "Bulk rates at 40% less than retail" },
  { icon: Check, title: "Quality Check", desc: "Every item inspected before dispatch" },
  { icon: Clock, title: "24/7 Fulfillment", desc: "Orders processed around the clock" },
];

export default function FbkEnrollPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) return;

      const { data: vendorProfile } = await insforge.database
        .from("vendors")
        .select("id, business_name, phone, address")
        .eq("user_id", user.id)
        .single();

      if (vendorProfile) {
        setBusinessName(vendorProfile.business_name || "");
        setAddress(vendorProfile.address || "");
        setPhone(vendorProfile.phone || "");
      }

      const { data: whData } = await insforge.database
        .from("warehouses")
        .select("id, name, city, state, country")
        .eq("status", "active")
        .order("name");

      if (whData) setWarehouses(whData);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!businessName.trim()) { setError("Business name is required"); return; }
    setError("");
    setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session-token");
      const { token } = await tokenRes.json();
      if (!token) { setError("Authentication failed"); setSubmitting(false); return; }

      const res = await fetch("/api/v1/fbk/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to enroll");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <VendorShell title="Enroll in FBK" subtitle="Fulfillment By Kauvex">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </VendorShell>
    );
  }

  if (success) {
    return (
      <VendorShell title="Enroll in FBK" subtitle="Fulfillment By Kauvex">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Enrollment Submitted!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your FBK enrollment is under review. We will notify you within 48 hours.
          </p>
          <Button onClick={() => router.push("/vendor/fbk")}>
            Back to FBK Dashboard
          </Button>
        </div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Enroll in FBK" subtitle="Fulfillment By Kauvex">
      <div className="max-w-4xl mx-auto grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Package size={18} className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-sm">FBK Enrollment</h2>
                <p className="text-xs text-gray-400">Fill in your details to get started</p>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border bg-red-50 border-red-200 text-red-800 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Business Name</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Preferred Warehouse</label>
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                >
                  <option value="">Select a warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} — {w.city}, {w.state || w.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Business Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 resize-none"
                  placeholder="Your business address"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/vendor/fbk")}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Package size={14} className="mr-1" />
                )}
                Submit Enrollment
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-5 text-white">
            <h3 className="font-bold text-sm mb-1">Why join FBK?</h3>
            <p className="text-[10px] text-purple-200">Let KAUVEX handle fulfillment so you can scale</p>
          </div>
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs">{b.title}</h4>
                  <p className="text-[10px] text-gray-400">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VendorShell>
  );
}
