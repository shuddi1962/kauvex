"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Save, Bell, CreditCard, Shield, User, ArrowLeft,
  Building2, Globe, Mail, Phone, MapPin, CheckCircle2,
  AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

export default function VendorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [vendor, setVendor] = useState<any>(null);

  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [shop, setShop] = useState({ name: "", description: "", logo: "", banner: "" });
  const [bank, setBank] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [notifications, setNotifications] = useState({
    orderEmail: true, orderSms: false, payoutEmail: true,
    reviewEmail: true, promotionEmail: false, lowStock: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await insforge.auth.getUser();
        if (user) {
          const { data: vendorData } = await insforge.database
            .from("vendors")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (vendorData) {
            setVendor(vendorData);
            setProfile({
              name: user.user_metadata?.name || vendorData.shop_name || "",
              email: user.email || "",
              phone: vendorData.shop_phone || "",
            });
            setShop({
              name: vendorData.shop_name || "",
              description: vendorData.shop_description || "",
              logo: vendorData.shop_logo || "",
              banner: vendorData.shop_banner || "",
            });
          }
        }
      } catch {
        // fallback to demo
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (vendor) {
        await insforge.database.from("vendors").update({
          shop_name: shop.name,
          shop_description: shop.description,
          shop_logo: shop.logo,
          shop_banner: shop.banner,
        }).eq("id", vendor.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <VendorShell title="Settings" subtitle="Manage your vendor account and store">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-purple-600" />
        </div>
      </VendorShell>
    );
  }

  return (
    <VendorShell title="Settings" subtitle="Manage your vendor account and store">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={14} /> Saved
            </span>
          )}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} className="mr-2" />
          {saving ? "Saving..." : "Save All"}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <User size={18} className="text-purple-600" />
            <h3 className="font-bold text-sm text-gray-900">Personal Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Full Name</label>
              <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Email</label>
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building2 size={18} className="text-purple-600" />
            <h3 className="font-bold text-sm text-gray-900">Store Information</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Store Name</label>
                <input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5 font-medium">Store Logo URL</label>
                <input value={shop.logo} onChange={(e) => setShop({ ...shop, logo: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Store Description</label>
              <textarea value={shop.description} onChange={(e) => setShop({ ...shop, description: e.target.value })}
                rows={3}
                className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <CreditCard size={18} className="text-purple-600" />
            <h3 className="font-bold text-sm text-gray-900">Payout Bank Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Bank Name</label>
              <select value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none">
                <option value="">Select bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="First Bank">First Bank</option>
                <option value="GTBank">GTBank</option>
                <option value="UBA">UBA</option>
                <option value="Zenith Bank">Zenith Bank</option>
                <option value="Polaris Bank">Polaris Bank</option>
                <option value="Fidelity Bank">Fidelity Bank</option>
                <option value="Union Bank">Union Bank</option>
                <option value="Ecobank">Ecobank</option>
                <option value="Stanbic IBTC">Stanbic IBTC</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Account Number</label>
              <input value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
                maxLength={10}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Account Name</label>
              <input value={bank.accountName} onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-blue mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">Payouts are processed every Monday. Ensure your bank details are correct to avoid delays.</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Bell size={18} className="text-purple-600" />
            <h3 className="font-bold text-sm text-gray-900">Notification Preferences</h3>
          </div>
          <div className="space-y-1">
            {[
              { key: "orderEmail", label: "New order email notifications" },
              { key: "orderSms", label: "New order SMS notifications (standard rates apply)" },
              { key: "payoutEmail", label: "Payout confirmation emails" },
              { key: "reviewEmail", label: "New review notifications" },
              { key: "promotionEmail", label: "Promotional emails from KAUVEX" },
              { key: "lowStock", label: "Low stock alerts" },
            ].map((n) => (
              <label key={n.key} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <span className="text-sm text-gray-700">{n.label}</span>
                <input
                  type="checkbox"
                  checked={notifications[n.key as keyof typeof notifications]}
                  onChange={(e) => setNotifications({ ...notifications, [n.key]: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Shield size={18} className="text-purple-600" />
            <h3 className="font-bold text-sm text-gray-900">Security</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Current Password</label>
              <input type="password" placeholder="Enter current password"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">New Password</label>
              <input type="password" placeholder="Enter new password"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none" />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => alert("Password update feature coming soon")}>
            Update Password
          </Button>
        </div>
      </div>
    </VendorShell>
  );
}
