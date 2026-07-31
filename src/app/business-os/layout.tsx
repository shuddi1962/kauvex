"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, Target, FileText, ShoppingCart,
  Truck, Package, Warehouse, Factory, ClipboardList, Hammer,
  CalendarClock, UserCog, Banknote, Boxes, FolderOpen, CheckSquare,
  Bot, ShieldAlert, Wrench, Megaphone, BookOpen, Settings, Menu, X,
  ChevronRight, Sparkles, Blocks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const sections = [
  {
    label: "Overview",
    items: [
      { href: "/business-os", label: "Dashboard", icon: LayoutDashboard },
      { href: "/business-os/organization", label: "Organization", icon: Building2 },
    ],
  },
  {
    label: "Sales & CRM",
    items: [
      { href: "/business-os/crm", label: "Customers", icon: Users },
      { href: "/business-os/leads", label: "Leads", icon: Target },
      { href: "/business-os/pipeline", label: "Pipeline", icon: CheckSquare },
      { href: "/business-os/quotations", label: "Quotations", icon: FileText },
      { href: "/business-os/sales-orders", label: "Sales Orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Procurement",
    items: [
      { href: "/business-os/suppliers", label: "Suppliers", icon: Truck },
      { href: "/business-os/purchase-requests", label: "Purchase Requests", icon: ClipboardList },
      { href: "/business-os/purchase-orders", label: "Purchase Orders", icon: Package },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/business-os/inventory", label: "Inventory", icon: Boxes },
      { href: "/business-os/warehouses", label: "Warehouses", icon: Warehouse },
      { href: "/business-os/manufacturing", label: "Manufacturing", icon: Factory },
      { href: "/business-os/boms", label: "Bill of Materials", icon: Hammer },
      { href: "/business-os/projects", label: "Projects", icon: FolderOpen },
      { href: "/business-os/work-orders", label: "Field Service", icon: CalendarClock },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/business-os/employees", label: "Employees", icon: UserCog },
      { href: "/business-os/announcements", label: "Announcements", icon: Megaphone },
      { href: "/business-os/knowledge", label: "Knowledge Hub", icon: BookOpen },
    ],
  },
  {
    label: "Finance & Governance",
    items: [
      { href: "/business-os/finance", label: "Finance", icon: Banknote },
      { href: "/business-os/assets", label: "Assets", icon: Wrench },
      { href: "/business-os/documents", label: "Documents", icon: FolderOpen },
      { href: "/business-os/approvals", label: "Approvals", icon: CheckSquare },
      { href: "/business-os/quality", label: "Quality", icon: ShieldAlert },
      { href: "/business-os/hse", label: "HSE", icon: Wrench },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/business-os/automation", label: "Automation", icon: Bot },
      { href: "/business-os/modules", label: "Industry Modules", icon: Blocks },
      { href: "/business-os/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function BusinessOsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/auth/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-kauvex-orange/30 border-t-kauvex-orange rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-3">Loading Business OS...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-bg-page flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-kauvex-navy flex flex-col transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link href="/business-os" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-kauvex-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">KAUVEX</span>
              <span className="block text-[10px] text-kauvex-orange font-semibold tracking-widest uppercase">Business OS</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">{section.label}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        active ? "bg-kauvex-orange text-white shadow-sm" : "text-white/60 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 flex-shrink-0", active && "text-white")} />
                      <span className="truncate">{item.label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[11px] text-white/30 text-center">K Business OS v1.0</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-border sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 -ml-1.5 text-text-3 hover:text-kauvex-navy">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-kauvex-orange flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-kauvex-navy">Business OS</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
