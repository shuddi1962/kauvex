"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Warehouse,
  Truck,
  DollarSign,
  Plus,
  Check,
  AlertTriangle,
  Loader2,
  Clock,
  TrendingUp,
  MapPin,
  ArrowRight,
  ClipboardList,
  ExternalLink,
  Box,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

interface FbkEnrollment {
  id: string;
  vendor_id: string;
  status: string;
  storage_limit: number | null;
  approved_at: string | null;
  created_at: string;
}

interface InboundItem {
  id: string;
  product_id: string;
  quantity_shipped: number;
  sku: string;
}

interface WarehouseInfo {
  name: string;
  city: string;
  country: string;
}

interface InboundPlan {
  id: string;
  warehouse_id: string;
  status: string;
  notes: string | null;
  estimated_arrival: string | null;
  created_at: string;
  items: InboundItem[] | null;
  warehouse: WarehouseInfo | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-600",
  in_transit: "bg-purple-100 text-purple-600",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function FbkPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<FbkEnrollment | null>(null);
  const [inboundPlans, setInboundPlans] = useState<InboundPlan[]>([]);
  const [stats, setStats] = useState({ totalUnits: 0, activePlans: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) { setLoading(false); return; }

      let { data: vendorProfile } = await insforge.database
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Auto-create vendor record if missing
      if (!vendorProfile) {
        try {
          const tokRes = await fetch("/api/auth/session-token");
          const { token } = await tokRes.json();
          if (token) {
            const regRes = await fetch("/api/v1/vendors/auto-register", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (regRes.ok) {
              const regJson = await regRes.json();
              vendorProfile = regJson.data;
            }
          }
        } catch { /* ignore */ }
      }

      if (vendorProfile) {
        let { data: enrollData } = await insforge.database
          .from("fbk_enrollments")
          .select("*")
          .eq("vendor_id", vendorProfile.id)
          .maybeSingle();

        // DEMO: auto-create enrollment if missing (via API to bypass RLS)
        if (!enrollData) {
          try {
            const tokRes = await fetch("/api/auth/session-token");
            const { token } = await tokRes.json();
            if (token) {
              const res = await fetch("/api/v1/fbk/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({}),
              });
              if (res.ok) {
                const json = await res.json();
                enrollData = json.data;
              }
            }
          } catch { /* fallback handled below */ }

          // If API failed, try direct insert as second fallback
          if (!enrollData) {
            try {
              const { data: newEnroll } = await insforge.database
                .from("fbk_enrollments")
                .insert({
                  vendor_id: vendorProfile.id,
                  status: "active",
                  storage_limit: 1000,
                  monthly_fee: 29.99,
                  pick_pack_fee: 2.50,
                  storage_fee: 0.75,
                  returns_fee: 3.50,
                  approved_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .select("*")
                .maybeSingle();
              if (newEnroll) enrollData = newEnroll;
            } catch { /* ignore */ }
          }
        }

        setEnrollment(enrollData || null);
      }

      // Fetch inbound plans via API
      if (vendorProfile) {
        try {
          const tokRes = await fetch("/api/auth/session-token");
          const { token } = await tokRes.json();
          if (token) {
            const plansRes = await fetch("/api/v1/fbk/inbound?limit=10", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (plansRes.ok) {
              const plansJson = await plansRes.json();
              const planList: InboundPlan[] = plansJson.data?.plans || [];
              setInboundPlans(planList);
              const totalUnits = planList.reduce(
                (sum, p) => sum + (p.items || []).reduce((s, i) => s + i.quantity_shipped, 0),
                0
              );
              const activePlans = planList.filter((p) =>
                ["pending", "processing", "in_transit"].includes(p.status)
              ).length;
              setStats({ totalUnits, activePlans });
            }
          }
        } catch { /* fallback to empty */ }
      }
    } catch {
      setError("Failed to load FBK data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <VendorShell title="FBK Fulfillment" subtitle="Fulfillment By Kauvex - Inventory Management">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </VendorShell>
    );
  }

  const isEnrolled = enrollment && ["active", "pending"].includes(enrollment.status);

  const renderNotEnrolled = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 text-white">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Package size={20} />
            <h2 className="text-xl font-bold">Fulfillment by Kauvex</h2>
          </div>
          <p className="text-purple-100 text-sm mb-6">
            Let KAUVEX handle storage, packing, and delivery. Focus on what matters — growing your business.
          </p>
          <Link href="/vendor/fbk/enroll">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50">
              <Package size={16} className="mr-2" />
              Enroll in FBK
            </Button>
          </Link>
          <p className="text-[10px] text-purple-200 mt-2">
            By enrolling, you agree to the FBK Terms of Service and Fee Schedule
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Warehouse, title: "KAUVEX Storage", desc: "Store your products in our warehouses across the country" },
          { icon: Truck, title: "Fast Delivery", desc: "1-3 day delivery to major cities" },
          { icon: TrendingUp, title: "Boosted Visibility", desc: "Products marked 'Fulfilled by KAUVEX' rank higher" },
          { icon: DollarSign, title: "Lower Shipping Costs", desc: "Bulk shipping rates at 40% less than retail" },
          { icon: Check, title: "Quality Check", desc: "Every item inspected before dispatch" },
          { icon: Clock, title: "24/7 Fulfillment", desc: "Orders processed around the clock" },
        ].map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <Icon size={16} className="text-purple-600" />
              </div>
              <h4 className="font-semibold text-xs">{b.title}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{b.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderEnrolled = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-4 gap-4">
        {[
          { label: "Total Units Stored", value: stats.totalUnits, icon: Box, color: "text-purple-600" },
          { label: "Active Inbound Plans", value: stats.activePlans, icon: ClipboardList, color: "text-blue-600" },
          { label: "Pending Shipments", value: stats.activePlans, icon: Truck, color: "text-orange-600" },
          { label: "Storage Used", value: `${stats.totalUnits} units`, icon: Warehouse, color: "text-green-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={stat.color} />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Truck size={16} className="text-purple-600" /> Recent Inbound Plans
        </h3>
        <div className="flex gap-2">
          <Link href="/vendor/fbk/inbound">
            <Button size="sm">
              <Plus size={14} className="mr-1" /> Create Inbound Plan
            </Button>
          </Link>
        </div>
      </div>

      {inboundPlans.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">No inbound plans yet</p>
          <p className="text-xs text-gray-300 mt-1">Create a plan to send inventory to KAUVEX warehouses</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inboundPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs">{plan.id.slice(0, 8)}</span>
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      statusColors[plan.status] || "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {plan.status.replace("_", " ")}
                  </span>
                </div>
                <Link
                  href={`/vendor/fbk/inbound?id=${plan.id}`}
                  className="text-[10px] text-purple-600 hover:underline flex items-center gap-0.5"
                >
                  View Details <ArrowRight size={10} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[10px] text-gray-400">Warehouse</p>
                  <p className="font-semibold">{plan.warehouse?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Items</p>
                  <p className="font-semibold">{(plan.items || []).length} products</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Estimated Arrival</p>
                  <p className="font-semibold">
                    {plan.estimated_arrival
                      ? new Date(plan.estimated_arrival).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Created</p>
                  <p className="font-semibold">{new Date(plan.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {plan.items && plan.items.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {plan.items.slice(0, 3).map((item, i) => (
                    <span
                      key={item.id || i}
                      className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                    >
                      {item.sku || item.product_id.slice(0, 8)} x {item.quantity_shipped}
                    </span>
                  ))}
                  {plan.items.length > 3 && (
                    <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                      +{plan.items.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/vendor/fbk/inbound">
          <Button>
            <Plus size={14} className="mr-1" /> Create Inbound Plan
          </Button>
        </Link>
        <Link href="/vendor/orders">
          <Button variant="outline">
            <ShoppingCart size={14} className="mr-1" /> View Shipments
          </Button>
        </Link>
      </div>
    </div>
  );

  const enrollmentBanner = () => {
    if (!enrollment) return null;
    const banners: Record<string, { color: string; text: string; icon: React.ElementType }> = {
      pending: {
        color: "bg-amber-50 border-amber-200 text-amber-800",
        text: "Your FBK enrollment is under review. We'll notify you within 48 hours.",
        icon: Clock,
      },
      active: {
        color: "bg-green-50 border-green-200 text-green-800",
        text: "FBK is active. Your products are being fulfilled by KAUVEX.",
        icon: Check,
      },
      rejected: {
        color: "bg-red-50 border-red-200 text-red-800",
        text: "Your FBK enrollment was rejected. Please contact support for more information.",
        icon: AlertTriangle,
      },
    };
    const banner = banners[enrollment.status];
    if (!banner) return null;
    const Icon = banner.icon;
    return (
      <div className={`flex items-start gap-2 p-3 rounded-lg border ${banner.color}`}>
        <Icon size={14} className="mt-0.5 shrink-0" />
        <p className="text-xs">{banner.text}</p>
      </div>
    );
  };

  return (
    <VendorShell title="FBK Fulfillment" subtitle="Fulfillment By Kauvex - Inventory Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Warehouse storage and order fulfillment</p>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            !enrollment
              ? "bg-gray-100 text-gray-500"
              : enrollment.status === "active"
                ? "bg-green-100 text-green-700"
                : enrollment.status === "pending"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
          }`}
        >
          {!enrollment ? "Not Enrolled" : enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {enrollmentBanner()}
        <div className="mt-6">{isEnrolled ? renderEnrolled() : renderNotEnrolled()}</div>
      </div>
    </VendorShell>
  );
}
