"use client";

import { User, Building2, CreditCard, Shield, Bell, MapPin, Users, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";

const ACCOUNT_SECTIONS = [
  { icon: User, label: "Profile", description: "Name, email, password, and profile picture", href: "/express/settings/profile" },
  { icon: Building2, label: "Company", description: "Business name, logo, address, and tax ID", href: "/express/settings/company" },
  { icon: MapPin, label: "Addresses", description: "Saved pickup and delivery addresses", href: "/express/addresses" },
  { icon: Users, label: "Team", description: "Manage team members and their roles", href: "/express/team" },
  { icon: CreditCard, label: "Payment Methods", description: "Saved cards, bank accounts, and payment settings", href: "/express/payment-methods" },
  { icon: CreditCard, label: "Billing", description: "Invoices, transactions, and billing history", href: "/express/billing" },
  { icon: CreditCard, label: "Subscription", description: "Current plan, usage, and upgrade options", href: "/express/subscription" },
  { icon: Bell, label: "Notifications", description: "Email, push, and SMS notification preferences", href: "/express/notifications" },
  { icon: Shield, label: "Security", description: "Two-factor authentication and login history", href: "/express/settings/security" },
  { icon: Settings, label: "Settings", description: "General account and platform settings", href: "/express/settings" },
];

export default function AccountPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Account</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-[#0A1628] rounded-full flex items-center justify-center text-white text-xl font-bold">JD</div>
          <div>
            <h2 className="text-lg font-semibold text-[#0A1628]">John Doe</h2>
            <p className="text-sm text-gray-500">john@doebusiness.com</p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Business Silver</span>
          </div>
        </div>
        <Link href="/express/settings/profile" className="text-sm text-[#FF6B00] hover:text-[#e55f00] font-medium">Edit profile →</Link>
      </div>

      <div className="space-y-2">
        {ACCOUNT_SECTIONS.map((section) => (
          <Link key={section.label} href={section.href} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#FF6B00]/10 transition-colors">
                <section.icon className="w-5 h-5 text-gray-500 group-hover:text-[#FF6B00] transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#0A1628]">{section.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#FF6B00] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
