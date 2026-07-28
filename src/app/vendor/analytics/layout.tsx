"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart3, Package, Users, Search, DollarSign, LayoutDashboard } from "lucide-react";

const tabs = [
  { label: "Overview", href: "/vendor/analytics", icon: LayoutDashboard },
  { label: "Products", href: "/vendor/analytics/products", icon: Package },
  { label: "Customers", href: "/vendor/analytics/customers", icon: Users },
  { label: "Competitors", href: "/vendor/analytics/competitors", icon: Search },
  { label: "Financial", href: "/vendor/analytics/financial", icon: DollarSign },
];

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-6 py-2 border-b border-border bg-white shrink-0">
        <Link href="/vendor/dashboard" className="text-[10px] text-text-4 hover:text-orange transition-colors">
          Dashboard
        </Link>
        <span className="text-[10px] text-text-4">/</span>
        <span className="text-[10px] font-semibold text-text-2">Analytics</span>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-border bg-white px-6 shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.href === "/vendor/analytics"
            ? pathname === "/vendor/analytics"
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                active
                  ? "border-orange text-orange"
                  : "border-transparent text-text-4 hover:text-text-2 hover:border-gray-300"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
