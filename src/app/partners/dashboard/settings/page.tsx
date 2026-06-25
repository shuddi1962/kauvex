"use client";

import { useState } from "react";
import { User, Globe, Link, Bell, Shield, Wallet, Save } from "lucide-react";

const payoutMethods = [
  { value: "bank", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "payoneer", label: "Payoneer" },
  { value: "wise", label: "Wise" },
];

const notificationOptions = [
  { id: "earnings", label: "Earnings & Payouts", desc: "Daily earning summary, payout confirmations" },
  { id: "promotions", label: "Promotion Updates", desc: "New promotions, bounty campaigns" },
  { id: "clicks", label: "Click & Conversion Alerts", desc: "Milestone achievements, conversion dips" },
  { id: "content", label: "Content Insights", desc: "Weekly content performance digest" },
  { id: "system", label: "System Announcements", desc: "Platform updates, maintenance notices" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    displayName: "Alex Johnson",
    bio: "Tech reviewer & affiliate marketer specializing in consumer electronics and marine equipment. 50k+ YouTube subscribers.",
    website: "https://alexjohnson.reviews",
    twitter: "@alexj_reviews",
    instagram: "@alexj_reviews",
    youtube: "@AlexJReviews",
  });
  const [payout, setPayout] = useState({
    method: "bank",
    accountName: "Alex Johnson",
    accountNumber: "0123456789",
    bankName: "First Bank of Commerce",
    routingNumber: "021000021",
  });
  const [notifications, setNotifications] = useState([
    { ...notificationOptions[0], enabled: true },
    { ...notificationOptions[1], enabled: true },
    { ...notificationOptions[2], enabled: true },
    { ...notificationOptions[3], enabled: false },
    { ...notificationOptions[4], enabled: true },
  ]);
  const [taxInfo, setTaxInfo] = useState({
    taxId: "XX-XXXXXXX",
    country: "United States",
    legalName: "Alex Johnson",
    address: "123 Main Street, Suite 400, New York, NY 10001",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Settings</h1>
        <p className="text-xs text-gray-500">Manage your profile, payout, and notification preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-[#FF6B00]" />
          <h3 className="font-bold text-sm text-[#0A1628]">Profile</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Display Name</label>
            <input
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Website URL</label>
            <input
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00] resize-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">
              <Globe size={10} className="inline mr-1" /> Twitter/X
            </label>
            <input
              value={profile.twitter}
              onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">
              <Link size={10} className="inline mr-1" /> Instagram
            </label>
            <input
              value={profile.instagram}
              onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">
              <Link size={10} className="inline mr-1" /> YouTube
            </label>
            <input
              value={profile.youtube}
              onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={15} className="text-[#FF6B00]" />
          <h3 className="font-bold text-sm text-[#0A1628]">Payout Settings</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Payout Method</label>
            <select
              value={payout.method}
              onChange={(e) => setPayout({ ...payout, method: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            >
              {payoutMethods.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Account Name</label>
            <input
              value={payout.accountName}
              onChange={(e) => setPayout({ ...payout, accountName: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Account Number</label>
            <input
              value={payout.accountNumber}
              onChange={(e) => setPayout({ ...payout, accountNumber: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Bank Name</label>
            <input
              value={payout.bankName}
              onChange={(e) => setPayout({ ...payout, bankName: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Routing Number</label>
            <input
              value={payout.routingNumber}
              onChange={(e) => setPayout({ ...payout, routingNumber: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={15} className="text-[#FF6B00]" />
          <h3 className="font-bold text-sm text-[#0A1628]">Notification Preferences</h3>
        </div>
        <div className="space-y-3">
          {notifications.map((n) => (
            <label key={n.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={n.enabled}
                onChange={() =>
                  setNotifications((prev) =>
                    prev.map((x) => (x.id === n.id ? { ...x, enabled: !x.enabled } : x))
                  )
                }
                className="mt-0.5 accent-[#FF6B00]"
              />
              <div>
                <p className="text-xs font-semibold text-gray-800">{n.label}</p>
                <p className="text-[10px] text-gray-400">{n.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-[#FF6B00]" />
          <h3 className="font-bold text-sm text-[#0A1628]">Tax Information</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Tax ID / SSN / EIN</label>
            <input
              value={taxInfo.taxId}
              onChange={(e) => setTaxInfo({ ...taxInfo, taxId: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Country</label>
            <input
              value={taxInfo.country}
              onChange={(e) => setTaxInfo({ ...taxInfo, country: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Legal Name</label>
            <input
              value={taxInfo.legalName}
              onChange={(e) => setTaxInfo({ ...taxInfo, legalName: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Address</label>
            <input
              value={taxInfo.address}
              onChange={(e) => setTaxInfo({ ...taxInfo, address: e.target.value })}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 h-10 px-5 bg-[#FF6B00] text-white font-bold text-xs rounded-xl hover:bg-[#FF6B00]/90 transition-colors"
        >
          <Save size={14} /> Save Changes
        </button>
        {saved && (
          <span className="text-[11px] text-green-700 font-semibold">Settings saved successfully!</span>
        )}
      </div>
    </div>
  );
}
