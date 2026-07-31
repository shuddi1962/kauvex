"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Bot, Brain, BookOpen, Workflow, Scale, Search, FileText, UserCog, Package, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/kai", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kai/chat", label: "Master Orchestrator", icon: MessageSquare },
  { href: "/kai/agents", label: "Agents", icon: Bot },
  { href: "/kai/memory", label: "KAI Memory", icon: Brain },
  { href: "/kai/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { href: "/kai/flows", label: "Automation Flows", icon: Workflow },
  { href: "/kai/decisions", label: "Decision Support", icon: Scale },
  { href: "/kai/research", label: "Research Engine", icon: Search },
  { href: "/kai/content", label: "Content Factory", icon: FileText },
  { href: "/kai/employees", label: "Digital Employees", icon: UserCog },
  { href: "/kai/apps", label: "AI App Store", icon: Package },
  { href: "/kai/audit", label: "Safety & Audit", icon: ShieldCheck },
];

export default function KaiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-kauvex-navy transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-kauvex-orange flex items-center justify-center font-black text-white text-sm">K</div>
          <div>
            <p className="font-bold text-white text-sm leading-none">KAI Ecosystem</p>
            <p className="text-[10px] text-white/50 mt-0.5">Kauvex Artificial Intelligence</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/kai" && pathname.startsWith(item.href));
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-700">
              <Brain className="w-3 h-3" /> AI layer active
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-kauvex-navy/5 border border-kauvex-navy/10 px-3 py-1 text-xs font-semibold text-kauvex-navy">
              Canvas 12
            </span>
          </div>
          <div className="ml-auto" />
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
