"use client";

import Link from "next/link";
import { ChevronLeft, LifeBuoy } from "lucide-react";

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-3 hover:text-text-1 hover:bg-off-white transition-colors"
        >
          <ChevronLeft size={16} />
        </Link>
        <div className="flex items-center gap-2">
          <LifeBuoy size={20} className="text-blue" />
          <h1 className="font-syne font-700 text-xl text-text-1">Support</h1>
        </div>
      </div>
      {children}
    </div>
  );
}
