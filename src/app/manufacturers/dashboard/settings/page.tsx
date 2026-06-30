"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Save, Lock, Bell, Globe, CreditCard, Users,
  Loader2, CheckCircle2, Shield, Key, Trash2
} from "lucide-react";

type SettingsTab = "profile" | "notifications" | "security" | "payment" | "team";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    companyName: "Shenzhen Textile Manufacturing Co.",
    contactEmail: "sales@shenzhentextile.cn",
    phone: "+86 755 1234 5678",
    website: "https://shenzhentextile.cn",
    defaultCurrency: "USD",
    timezone: "Asia/Shanghai",
    language: "en",
  });

  const [notifications, setNotifications] = useState({
    newInquiry: true,
    quoteAccepted: true,
    orderUpdate: true,
    escrowRelease: true,
    reviewReceived: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  });

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profile", icon: Globe },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security", icon: Lock },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "team", label: "Team", icon: Users },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass = "w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]";
  const labelClass = "text-[10px] text-gray-500 uppercase tracking-wide block mb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Settings</h2>
              <p className="text-xs text-gray-500">Manage your account and preferences</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-[#FF6B00] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4">Company Profile</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Company Name</label>
                    <input value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Email</label>
                    <input type="email" value={profile.contactEmail} onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Default Currency</label>
                    <select value={profile.defaultCurrency} onChange={(e) => setProfile({ ...profile, defaultCurrency: e.target.value })} className={inputClass}>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="AED">AED - UAE Dirham</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Timezone</label>
                    <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} className={inputClass}>
                      <option value="Asia/Shanghai">Asia/Shanghai (GMT+8)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                      <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                      <option value="Europe/London">Europe/London (GMT+0)</option>
                      <option value="America/New_York">America/New_York (GMT-5)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4">Notification Preferences</h3>
                <div className="space-y-3">
                  {Object.entries({
                    newInquiry: "New inquiry received from buyer",
                    quoteAccepted: "Quote accepted — order created",
                    orderUpdate: "Production stage updates",
                    escrowRelease: "Escrow milestone payment released",
                    reviewReceived: "New buyer review submitted",
                    weeklyDigest: "Weekly performance digest",
                    marketingEmails: "Marketing & product updates",
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <span className="text-xs text-[#0A1628]">{label}</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={notifications[key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-9 h-5 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-[#FF6B00]" : "bg-gray-200"}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${notifications[key as keyof typeof notifications] ? "translate-x-4.5 ml-0.5" : "translate-x-0.5"}`} />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                    <Shield size={15} className="text-[#FF6B00]" /> Change Password
                  </h3>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                    <Key size={15} className="text-[#FF6B00]" /> Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-[#0A1628]">2FA is {security.twoFactorEnabled ? "enabled" : "disabled"}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        security.twoFactorEnabled
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {security.twoFactorEnabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                    <Trash2 size={15} className="text-red-500" /> Danger Zone
                  </h3>
                  <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <p className="text-xs font-semibold text-red-700">Delete Account</p>
                      <p className="text-[10px] text-red-500/70 mt-0.5">Permanently delete your manufacturer account and all data</p>
                    </div>
                    <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                  <CreditCard size={15} className="text-[#FF6B00]" /> Payment Settings
                </h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-[#0A1628]">Bank Account for Withdrawals</h4>
                      <button className="text-[10px] text-[#FF6B00] font-semibold hover:underline">Edit</button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 text-[10px] block">Bank</span>
                        <span className="font-medium text-[#0A1628]">China Merchants Bank</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block">Account</span>
                        <span className="font-medium text-[#0A1628]">**** **** **** 4521</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-[10px] block">Currency</span>
                        <span className="font-medium text-[#0A1628]">USD</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-xl">
                    <h4 className="text-xs font-semibold text-[#0A1628] mb-2">Escrow Payment Terms</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Default Deposit %</label>
                        <input type="number" defaultValue={30} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Payment Terms</label>
                        <select defaultValue="on_completion" className={inputClass}>
                          <option value="on_completion">Balance on Completion</option>
                          <option value="net_15">Net 15 Days</option>
                          <option value="net_30">Net 30 Days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "team" && (
              <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#0A1628]">Team Members</h3>
                  <button className="px-3 py-1.5 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition-colors">
                    + Add Member
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Li Wei", email: "liwei@shenzhentextile.cn", role: "Owner", status: "active" },
                    { name: "Zhang Min", email: "zhangmin@shenzhentextile.cn", role: "Sales Manager", status: "active" },
                    { name: "Chen Jie", email: "chenjie@shenzhentextile.cn", role: "Production Lead", status: "invited" },
                  ].map((member) => (
                    <div key={member.email} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{member.name.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#0A1628]">{member.name}</p>
                          <p className="text-[10px] text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          member.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {member.status}
                        </span>
                        <span className="text-[10px] text-gray-500 w-20 text-right">{member.role}</span>
                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
