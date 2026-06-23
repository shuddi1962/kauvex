"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Truck, ChevronRight } from "lucide-react";

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/logistics/login" || pathname === "/logistics/register";

  return (
    <div className="min-h-screen bg-off-white">
      {!isAuthPage && (
        <header className="bg-navy border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-orange" />
              <span className="text-white font-syne font-700 text-lg">Kauvex Logistics</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/logistics/dashboard" className="text-white/70 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/logistics/register" className="text-white/70 hover:text-white transition-colors">Become a Partner</Link>
              <Link href="/logistics/login" className="px-4 py-2 bg-orange text-white font-semibold rounded-lg hover:bg-orange/90 transition-colors text-sm">Partner Login</Link>
            </nav>
          </div>
        </header>
      )}
      {children}
      {!isAuthPage && (
        <footer className="bg-navy border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>&copy; {new Date().getFullYear()} Kauvex Logistics Network</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-white transition-colors">Kauvex.com</Link>
              <Link href="/logistics/register" className="hover:text-white transition-colors">Partner Registration</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
