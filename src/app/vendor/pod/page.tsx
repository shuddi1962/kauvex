"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Palette, ShoppingBag, TrendingUp, Download, Plus } from "lucide-react";
import Link from "next/link";

export default function VendorPODPage() {
  const stats = [
    { label: "My Designs", value: "12", icon: Palette, color: "bg-purple-50 text-purple-600" },
    { label: "POD Products", value: "28", icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
    { label: "POD Orders", value: "47", icon: TrendingUp, color: "bg-green-50 text-green-600" },
    { label: "Total Profit", value: "₦124,500", icon: Download, color: "bg-orange-50 text-orange-600" },
  ];

  const sideLinks = [
    { label: "Dashboard", href: "/vendor/pod", active: true },
    { label: "Design Studio", href: "/vendor/pod/design-studio" },
    { label: "My Products", href: "/vendor/pod/products" },
    { label: "Orders", href: "/vendor/pod/orders" },
    { label: "Analytics", href: "/vendor/pod/analytics" },
    { label: "Design Marketplace", href: "/pod-marketplace" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-200 p-4 space-y-1">
        <h2 className="font-bold text-[#0A1628] px-3 mb-4">POD Studio</h2>
        {sideLinks.map(l => (
          <Link key={l.label} href={l.href} className={`block px-3 py-2 rounded-lg text-sm ${l.active ? 'bg-[#FF6B00] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0A1628]">Print on Demand</h1>
          <Link href="/vendor/pod/design-studio">
            <Button className="bg-[#FF6B00] hover:bg-[#e86000]"><Plus size={16} className="mr-1" /> Create Design</Button>
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><Icon size={20} /></div>
                <p className="text-2xl font-bold text-[#0A1628]">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/vendor/pod/design-studio" className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-6 hover:shadow-lg transition-shadow">
            <Palette size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-1">Design Studio</h3>
            <p className="text-sm text-white/80">Create custom designs with our built-in editor. Add text, upload images, or use AI.</p>
          </Link>
          <Link href="/pod-marketplace" className="bg-gradient-to-br from-[#FF6B00] to-orange-600 text-white rounded-xl p-6 hover:shadow-lg transition-shadow">
            <ShoppingBag size={32} className="mb-3" />
            <h3 className="text-lg font-bold mb-1">Design Marketplace</h3>
            <p className="text-sm text-white/80">Browse and license designs from other creators. Apply to your products instantly.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
