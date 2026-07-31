"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Bot, Workflow, Brain, Puzzle,
  Passport, Menu, X, ChevronRight, Sparkles, MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { href: "/admin/kai", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kai?tab=agents", label: "AI Employee", icon: Bot },
  { href: "/business/ai", label: "Ask KAI", icon: MessageSquare },
  { href: "/business/studio", label: "Workflow Studio", icon: Workflow },
  { href: "/business/brain", label: "Company Brain", icon: Brain },
  { href: "/business/skills", label: "Skills Marketplace", icon: Puzzle },
  { href: "/account/passports", label: "Digital Passports", icon: Passport },
];

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
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
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-kauvex-orange/30 border-t-kauvex-orange rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-3">Loading business portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-page flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-kauvex-navy flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
          <Link href="/admin/kai" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-kauvex-orange flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">KAUVEX</span>
              <span className="block text-[10px] text-kauvex-orange font-semibold tracking-widest uppercase">AI Studio</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/60 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-kauvex-orange text-white shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-white")} />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[11px] text-white/30 text-center">
            Kauvex AI Studio v2.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 text-text-3 hover:text-kauvex-navy"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-kauvex-orange flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-kauvex-navy">KAI Studio</span>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
