"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Store,
  Truck,
  Megaphone,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  Menu,
  ArrowLeft,
  Palette,
  Users,
  CreditCard,
  Building2,
} from "lucide-react";

const vendorNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/vendor/dashboard" },
  { label: "Products", icon: Package, href: "/vendor/products" },
  { label: "Orders", icon: ShoppingCart, href: "/vendor/orders" },
  { label: "Earnings", icon: DollarSign, href: "/vendor/earnings" },
  { label: "Shop Settings", icon: Store, href: "/vendor/shop" },
  { label: "Store Builder", icon: Palette, href: "/vendor/store-builder" },
  { label: "Shipping", icon: Truck, href: "/vendor/shipping" },
  { label: "Promotions", icon: Megaphone, href: "/vendor/promotions" },
  { label: "Advertising", icon: Megaphone, href: "/vendor/advertising" },
  { label: "FBK", icon: Package, href: "/vendor/fbk" },
  { label: "Analytics", icon: BarChart3, href: "/vendor/analytics" },
  { label: "Staff", icon: Users, href: "/vendor/dashboard/staff" },
  { label: "Subscription", icon: CreditCard, href: "/vendor/subscription" },
  { label: "Settings", icon: Settings, href: "/vendor/settings" },
];

interface VendorShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function VendorShell({ children, title, subtitle }: VendorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex h-screen bg-off-white overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-60 bg-white border-r border-border flex flex-col shrink-0 fixed lg:relative h-full z-50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } transition-all duration-300`}>
        <div className="p-4 border-b border-border flex items-center gap-2.5 shrink-0">
          <Link href="/vendor/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Store size={16} className="text-white" />
            </div>
            <div>
              <div className="font-syne font-bold text-xs text-text-1">Vendor Hub</div>
              <div className="text-[9px] text-text-4">Partner Portal</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {vendorNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-2 mx-2 rounded-lg text-xs transition-colors ${
                  isActive ? "bg-purple-50 text-purple-700 font-semibold" : "text-text-3 hover:bg-off-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <div className="bg-off-white rounded-lg p-3 text-center">
            <p className="text-[10px] text-text-4">Your Commission Rate</p>
            <p className="font-syne font-bold text-xl text-purple-700">12%</p>
            <p className="text-[10px] text-text-4 mt-1">Platform fee per sale</p>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-text-4 hover:text-text-2 text-xs py-2 mt-2 transition-colors"
          >
            <Building2 size={14} />
            <span>View Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-border h-14 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 hover:bg-off-white rounded-lg transition-colors"
            >
              <Menu size={20} className="text-text-3" />
            </button>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-text-4 hover:text-purple-700 text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="border-l border-border pl-3 hidden sm:block">
              <h1 className="font-syne font-bold text-base text-text-1 leading-tight">{title}</h1>
              {subtitle && <p className="text-[11px] text-text-4 -mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-1.5 hover:bg-off-white rounded-lg">
              <Bell size={18} className="text-text-3" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">VS</span>
              </div>
              <span className="text-xs font-semibold hidden sm:inline">Vendor</span>
              <ChevronDown size={14} className="text-text-4" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="sm:hidden mb-4">
            <h1 className="font-syne font-bold text-lg text-text-1">{title}</h1>
            {subtitle && <p className="text-xs text-text-4">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
