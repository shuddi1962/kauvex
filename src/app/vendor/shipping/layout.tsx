"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FileText, Truck, ClipboardList, MapPin,
} from "lucide-react";

const subNav = [
  { label: "Shipping Profiles", href: "/vendor/shipping/profiles", icon: FileText },
  { label: "Drop-off Manifest", href: "/vendor/shipping/dropoff", icon: ClipboardList },
  { label: "Pickup Management", href: "/vendor/shipping/pickup", icon: Truck },
];

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-white px-6 shrink-0">
        {subNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                active
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}
