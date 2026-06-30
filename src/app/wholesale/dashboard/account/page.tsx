"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Building2, CreditCard, Mail, Phone, Save, Shield } from "lucide-react";

export default function WholesaleAccountPage() {
  const [form, setForm] = useState({
    companyName: "Acme Enterprises Ltd",
    contactName: "John Adeyemi",
    email: "john@acme-ent.com",
    phone: "+234 801 234 5678",
    address: "123 Business District, Lagos, Nigeria",
    taxId: "12345678-0001",
    industry: "Electronics & Security",
    creditLimit: "$50,000",
    netTerms: "NET 30",
    accountStatus: "Active",
    memberSince: "2025-08-15",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/wholesale/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Account Settings</h2>
            <p className="text-xs text-gray-500">Manage your wholesale account details</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Account Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0A1628] flex items-center justify-center">
                <span className="text-lg font-bold text-white">AE</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{form.companyName}</p>
                <p className="text-xs text-gray-500">Member since {new Date(form.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">{form.accountStatus}</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">{form.netTerms}</span>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-[#FF6B00]" /> Company Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
              <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tax ID</label>
              <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={15} className="text-[#FF6B00]" /> Primary Contact
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Name</label>
              <input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" />
            </div>
          </div>
        </div>

        {/* Credit Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={15} className="text-[#FF6B00]" /> Credit & Payment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-500 uppercase">Credit Limit</p>
              <p className="text-lg font-bold text-gray-900">{form.creditLimit}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-500 uppercase">Payment Terms</p>
              <p className="text-lg font-bold text-gray-900">{form.netTerms}</p>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00]">
          <Save size={14} /> Save Changes
        </button>
      </div>
    </div>
  );
}
