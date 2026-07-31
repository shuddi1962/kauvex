"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, Store, KeyRound, Webhook, Activity, Wallet, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/k-platform", label: "Dashboard", icon: LayoutDashboard },
  { href: "/k-platform/marketplace", label: "Module Marketplace", icon: Store },
  { href: "/k-platform/keys", label: "API Keys", icon: KeyRound },
  { href: "/k-platform/oauth", label: "OAuth Apps", icon: ShieldCheck },
  { href: "/k-platform/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/k-platform/events", label: "Event Bus", icon: Activity },
  { href: "/k-platform/earnings", label: "Developer Earnings", icon: Wallet },
];

export default function KPlatformLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-kauvex-navy transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-kauvex-orange flex items-center justify-center font-black text-white text-sm">K</div>
          <div>
            <p className="font-bold text-white text-sm leading-none">K Platform</p>
            <p className="text-[10px] text-white/50 mt-0.5">SDK & Developer Ecosystem</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/k-platform" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-kauvex-orange text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/business-os" className="block text-center rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5">
            Back to Business OS
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-border flex items-center gap-3 px-4 lg:px-8">
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg border border-border text-kauvex-navy">
            <span className="block w-4 h-0.5 bg-current mb-1" />
            <span className="block w-4 h-0.5 bg-current mb-1" />
            <span className="block w-4 h-0.5 bg-current" />
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
              <Store className="w-3 h-3" /> Developer platform live
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-kauvex-navy/5 border border-kauvex-navy/10 px-3 py-1 text-xs font-semibold text-kauvex-navy">
              Canvas 13
            </span>
          </div>
          <div className="ml-auto" />
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
