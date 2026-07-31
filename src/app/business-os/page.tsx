"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Target, CheckSquare, FileText, ShoppingCart, Truck, Package,
  Boxes, Factory, FolderOpen, Banknote, Wrench, Zap, Loader2, Building2,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { PageHeader, StatCard, StatusBadge, fmtMoney, fmtDate } from "@/components/business-os/shared";
import { useAuthStore } from "@/store/auth-store";

export default function BusinessOsDashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/v1/business-os/dashboard");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load dashboard");
        }
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-7 h-7 text-kauvex-orange animate-spin" />
        <p className="text-sm text-text-3">Loading your business overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-border p-10 text-center">
        <Building2 className="w-10 h-10 text-kauvex-orange mx-auto mb-3" />
        <h2 className="font-bold text-kauvex-navy mb-1">Set up your company</h2>
        <p className="text-sm text-text-3 mb-5">{error ?? "No organization found"}</p>
        <Link href="/business-os/organization" className="inline-flex items-center gap-2 rounded-lg bg-kauvex-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-kauvex-orange/90">
          Create organization
        </Link>
      </div>
    );
  }

  const c = data.counts;
  const f = data.finance;
  const net = Number(f.revenue) - Number(f.spend);
  const stats = [
    { label: "Revenue", value: fmtMoney(f.revenue), icon: <TrendingUp className="w-4 h-4" />, hint: "Invoices paid + partial" },
    { label: "Spend", value: fmtMoney(f.spend), icon: <TrendingDown className="w-4 h-4" />, hint: "Payables paid + partial" },
    { label: "Pipeline", value: fmtMoney(f.pipeline), icon: <CheckSquare className="w-4 h-4" />, hint: `${c.deals} open deals` },
    { label: "Open Orders", value: fmtMoney(f.ordersOpen), icon: <ShoppingCart className="w-4 h-4" />, hint: `${c.salesOrders} total orders` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${user?.user_metadata?.name ? `, ${String(user.user_metadata.name).split(" ")[0]}` : ""}`}
        subtitle={`Net position ${fmtMoney(net)} · ${c.projects} projects · ${c.productionOrders} production orders`}
        icon={<Building2 className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Customers", value: c.customers, href: "/business-os/crm", icon: <Users className="w-4 h-4" /> },
            { label: "Leads", value: c.leads, href: "/business-os/leads", icon: <Target className="w-4 h-4" /> },
            { label: "Quotations", value: c.quotations, href: "/business-os/quotations", icon: <FileText className="w-4 h-4" /> },
            { label: "Suppliers", value: c.suppliers, href: "/business-os/suppliers", icon: <Truck className="w-4 h-4" /> },
            { label: "Purchase Orders", value: c.purchaseOrders, href: "/business-os/purchase-orders", icon: <Package className="w-4 h-4" /> },
            { label: "Items", value: c.items, href: "/business-os/inventory", icon: <Boxes className="w-4 h-4" /> },
            { label: "Production", value: c.productionOrders, href: "/business-os/manufacturing", icon: <Factory className="w-4 h-4" /> },
            { label: "Projects", value: c.projects, href: "/business-os/projects", icon: <FolderOpen className="w-4 h-4" /> },
            { label: "Employees", value: c.employees, href: "/business-os/employees", icon: <Users className="w-4 h-4" /> },
            { label: "Invoices", value: c.invoices, href: "/business-os/finance", icon: <Banknote className="w-4 h-4" /> },
            { label: "Assets", value: c.assets, href: "/business-os/assets", icon: <Wrench className="w-4 h-4" /> },
            { label: "Work Orders", value: c.workOrders, href: "/business-os/work-orders", icon: <Wrench className="w-4 h-4" /> },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="bg-white rounded-xl border border-border p-4 hover:border-kauvex-orange/50 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 text-text-3 mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-kauvex-navy/5 flex items-center justify-center text-kauvex-orange">{s.icon}</span>
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-kauvex-navy">{s.value}</p>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          {data.pendingApprovals.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-kauvex-navy">Pending Approvals</h3>
              </div>
              <div className="space-y-2.5">
                {data.pendingApprovals.map((a: any) => (
                  <Link key={a.id} href="/business-os/approvals" className="block p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 hover:border-amber-300">
                    <p className="text-xs font-semibold text-kauvex-navy truncate">{a.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] text-text-3">{a.module} · {fmtMoney(a.amount)}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.lowStock.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-kauvex-navy">Low Stock</h3>
              </div>
              <div className="space-y-2.5">
                {data.lowStock.slice(0, 5).map((i: any) => (
                  <Link key={i.id} href="/business-os/inventory" className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/60 border border-red-100 hover:border-red-300">
                    <div>
                      <p className="text-xs font-semibold text-kauvex-navy">{i.name}</p>
                      <p className="text-[11px] text-text-3">{i.sku || "No SKU"}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600">{Number(i.stockOnHand)} {i.unit}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {data.activeProduction.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-4">
              <h3 className="text-sm font-bold text-kauvex-navy mb-3">Active Production</h3>
              <div className="space-y-2.5">
                {data.activeProduction.slice(0, 5).map((p: any) => (
                  <Link key={p.id} href="/business-os/manufacturing" className="block p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 hover:border-blue-300">
                    <p className="text-xs font-semibold text-kauvex-navy">{p.productionNumber}</p>
                    <p className="text-[11px] text-text-3 mt-0.5">{p.workCenter || "No work center"} · {Number(p.quantityProduced)}/{Number(p.quantity)} units</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-kauvex-orange" />
              <h3 className="text-sm font-bold text-kauvex-navy">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "New Quotation", href: "/business-os/quotations" },
                { label: "New PO", href: "/business-os/purchase-orders" },
                { label: "Add Item", href: "/business-os/inventory" },
                { label: "New Project", href: "/business-os/projects" },
                { label: "New Employee", href: "/business-os/employees" },
                { label: "Post NCR", href: "/business-os/quality" },
              ].map((a) => (
                <Link key={a.label} href={a.href} className="text-center rounded-lg bg-kauvex-navy/5 px-2 py-2.5 text-xs font-semibold text-kauvex-navy hover:bg-kauvex-orange hover:text-white transition-colors">
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
