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
        let enrollData: any = null;

        // Fetch enrollment via API (bypasses RLS)
        const tokRes = await fetch("/api/auth/session-token");
        const token = (await tokRes.json()).token;

        if (token) {
          const getRes = await fetch("/api/v1/fbk/enroll", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (getRes.ok) {
            const json = await getRes.json();
            enrollData = json.data;
          }
        }

        // Auto-create or upgrade enrollment if missing/pending
        if (!enrollData || enrollData.status === "pending") {
          const postRes = await fetch("/api/v1/fbk/enroll", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({}),
          });
          if (postRes.ok) {
            const json = await postRes.json();
            enrollData = json.data;
          } else if (postRes.status === 409) {
            // Already enrolled with active status - fetch again
            const retryRes = await fetch("/api/v1/fbk/enroll", {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (retryRes.ok) {
              const json = await retryRes.json();
              enrollData = json.data;
            }
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

  const renderEnrolled = () => {
    const monthlyFees = enrollment ? Number((enrollment as any).monthly_fee || 29.99) : 29.99;
    const pickPackFee = enrollment ? Number((enrollment as any).pick_pack_fee || 2.50) : 2.50;
    const storageFee = enrollment ? Number((enrollment as any).storage_fee || 0.75) : 0.75;
    const storageLimit = enrollment ? Number((enrollment as any).storage_limit || 1000) : 1000;

    return (
      <div className="space-y-6">
        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Units Stored", value: stats.totalUnits, icon: Box, color: "text-purple-600", change: "+12% this month" },
            { label: "Active Inbound Plans", value: stats.activePlans, icon: ClipboardList, color: "text-blue-600", change: `${inboundPlans.length} total` },
            { label: "Storage Used", value: `${Math.round((stats.totalUnits / storageLimit) * 100)}%`, icon: Warehouse, color: "text-green-600", change: `${stats.totalUnits} / ${storageLimit} units` },
            { label: "Est. Monthly Fees", value: `$${monthlyFees.toFixed(2)}`, icon: DollarSign, color: "text-orange-600", change: `$${pickPackFee.toFixed(2)} / unit pick & pack` },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className={stat.color} />
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Quick actions row */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-sm">FBK Dashboard</h3>
              <p className="text-[10px] text-purple-200 mt-0.5">Manage your fulfillment operations</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/vendor/fbk/inbound">
                <Button size="sm" className="bg-white text-purple-700 hover:bg-purple-50">
                  <Plus size={14} className="mr-1" /> Create Inbound Plan
                </Button>
              </Link>
              <Link href="/vendor/inventory">
                <Button size="sm" className="bg-purple-500 text-white hover:bg-purple-400 border border-purple-400">
                  <Package size={14} className="mr-1" /> Manage Inventory
                </Button>
              </Link>
              <Link href="/vendor/orders">
                <Button size="sm" className="bg-purple-500 text-white hover:bg-purple-400 border border-purple-400">
                  <ShoppingCart size={14} className="mr-1" /> View Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Two-column: Performance + Fee Summary */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-600" /> Fulfillment Performance
              </h3>
              <span className="text-[10px] text-gray-400">Last 30 days</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-28 mb-2">
              {[
                { label: "Week 1", value: 65 },
                { label: "Week 2", value: 80 },
                { label: "Week 3", value: 72 },
                { label: "Week 4", value: 90 },
              ].map((w) => (
                <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-purple-100 rounded-t-md relative" style={{ height: `${w.value}%` }}>
                    <div className="absolute bottom-0 w-full bg-purple-600 rounded-t-md" style={{ height: `${w.value * 0.7}%` }} />
                  </div>
                  <span className="text-[9px] text-gray-400">{w.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-500">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-purple-600" /> Orders Fulfilled</div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-purple-200" /> Target</div>
            </div>
          </div>

          {/* Fee Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" /> FBK Fee Summary
              </h3>
              <span className="text-[10px] text-gray-400">Current billing period</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Monthly Subscription", value: `$${monthlyFees.toFixed(2)}`, freq: "/month" },
                { label: "Storage Fee", value: `$${storageFee.toFixed(2)}`, freq: "/unit/month" },
                { label: "Pick & Pack Fee", value: `$${pickPackFee.toFixed(2)}`, freq: "/unit" },
                { label: "Estimated Total", value: `$${(monthlyFees + stats.totalUnits * storageFee + stats.totalUnits * pickPackFee).toFixed(2)}`, freq: "this period", bold: true },
              ].map((fee) => (
                <div key={fee.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{fee.label}</span>
                  <span className={`text-xs ${fee.bold ? "font-bold text-gray-900" : "text-gray-700"}`}>
                    {fee.value} <span className="text-[9px] text-gray-400">{fee.freq}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Box size={16} className="text-blue-600" /> FBK Inventory Health
            </h3>
            <Link href="/vendor/inventory" className="text-[10px] text-purple-600 hover:underline flex items-center gap-0.5">
              View All <ArrowRight size={10} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Selling Fast", count: 3, color: "text-green-700 bg-green-50 border-green-200", desc: "Replenish within 7 days" },
              { label: "Low Stock", count: 0, color: "text-amber-700 bg-amber-50 border-amber-200", desc: "Replenish within 14 days" },
              { label: "Over 180 Days", count: 0, color: "text-red-700 bg-red-50 border-red-200", desc: "Long-term storage surcharge applies" },
            ].map((h) => (
              <div key={h.label} className={`rounded-lg border p-3 ${h.color}`}>
                <p className="text-lg font-bold">{h.count}</p>
                <p className="text-xs font-semibold">{h.label}</p>
                <p className="text-[9px] mt-0.5 opacity-75">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inbound Plans */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Truck size={16} className="text-purple-600" /> Recent Inbound Plans
          </h3>
          <Link href="/vendor/fbk/inbound">
            <Button size="sm">
              <Plus size={14} className="mr-1" /> Create Inbound Plan
            </Button>
          </Link>
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
      </div>
    );
  };

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
