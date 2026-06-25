"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Truck, BarChart3, Box, FileText,
  Menu, X, Bell, ChevronDown, LogOut, Warehouse,
} from "lucide-react";

const navItems = [
  { label: "Today's Tasks", href: "/warehouse", icon: LayoutDashboard },
  { label: "Inbound", href: "/warehouse/inbound", icon: Truck },
  { label: "Outbound", href: "/warehouse/outbound", icon: Package },
  { label: "Inventory", href: "/warehouse/inventory", icon: BarChart3 },
  { label: "Packaging Stock", href: "/warehouse/packaging-stock", icon: Box },
  { label: "Reports", href: "/warehouse/reports", icon: FileText },
];

const roleOptions = ["warehouse_manager", "picker", "packer", "receiver"];

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("warehouse_manager");

  const roleLabels: Record<string, string> = {
    warehouse_manager: "Warehouse Manager",
    picker: "Picker",
    packer: "Packer",
    receiver: "Receiver",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
          <div className="flex items-center gap-2 text-xs">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-[10px]"
            >
              {roleOptions.map((r) => (
                <option key={r} value={r} className="text-black">{roleLabels[r]}</option>
              ))}
            </select>
          </div>
          <Bell size={16} className="text-gray-400" />
          <div className="w-7 h-7 bg-[#FF6B00] rounded-full flex items-center justify-center text-xs font-bold">WM</div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
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
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg w-full">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
