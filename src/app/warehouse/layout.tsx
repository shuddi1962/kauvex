"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Truck, BarChart3, Box, FileText,
  Menu, X, Bell, LogOut, Warehouse,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { supabase } from "@/lib/insforge";

const navItems = [
  { label: "Today's Tasks", href: "/warehouse", icon: LayoutDashboard },
  { label: "Inbound", href: "/warehouse/inbound", icon: Truck },
  { label: "Outbound", href: "/warehouse/outbound", icon: Package },
  { label: "Inventory", href: "/warehouse/inventory", icon: BarChart3 },
  { label: "Packaging Stock", href: "/warehouse/packaging-stock", icon: Box },
  { label: "Reports", href: "/warehouse/reports", icon: FileText },
];

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localUser, setLocalUser] = useState<{ id: string; email: string; name?: string; role: string } | null>(null);
  const { user, loading, signOut } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        const meta = u.user_metadata as Record<string, string> | undefined;
        let role = meta?.role || "customer";
        const { data: profileRows } = await supabase.from("profiles").select("role").eq("id", u.id).limit(1);
        if (profileRows && profileRows.length > 0 && profileRows[0].role) {
          role = profileRows[0].role;
        }
        setLocalUser({ id: u.id, email: u.email || "", name: meta?.name, role });
      } else {
        router.replace("/auth/login?redirect=/warehouse");
      }
    };
    init();
  }, [router]);

  if (!localUser && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!localUser && !loading && !user) return null;

  const u = localUser || user;
  if (!u) return null;

  const initials = u.name
    ? u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : u.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0A1628] text-white px-4 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link href="/warehouse" className="flex items-center gap-2">
            <Warehouse size={20} className="text-[#FF6B00]" />
            <span className="font-bold text-sm">Kauvex Warehouse</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span>{u.name || u.email}</span>
            <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] uppercase tracking-wider">{u.role.replace(/-/g, " ")}</span>
          </div>
          <Bell size={16} className="text-gray-400" />
          <div className="w-7 h-7 bg-[#FF6B00] rounded-full flex items-center justify-center text-xs font-bold">{initials}</div>
        </div>
      </div>

      <div className="flex">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)] shrink-0 ${sidebarOpen ? "fixed left-0 top-14 bottom-0 z-30" : "hidden lg:block"}`}>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    active ? "bg-[#FF6B00] text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200">
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
