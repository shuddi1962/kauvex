"use client";

import { useState } from "react";
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Mail,
  Phone,
  Building2,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Globe,
  Lock,
  Key,
  Monitor,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";

type TabKey = "profile" | "notifications" | "payment" | "security";

export default function ExpressSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@kauvex.com",
    phone: "+234 801 234 5678",
    businessName: "Doe Enterprises",
    accountType: "business",
  });

  // Notification state
  const [notifications, setNotifications] = useState({
    shipmentUpdates: { email: true, sms: true, push: true },
    deliveryAlerts: { email: true, sms: true, push: true },
    priceAlerts: { email: true, sms: false, push: true },
    promotions: { email: false, sms: false, push: true },
    billing: { email: true, sms: true, push: false },
    securityAlerts: { email: true, sms: true, push: true },
  });

  // Payment state
  const [cards, setCards] = useState([
    { id: "1", last4: "4242", brand: "Visa", expiry: "12/27", isDefault: true },
    { id: "2", last4: "8888", brand: "Mastercard", expiry: "06/28", isDefault: false },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "", name: "" });

  // Security state
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState([
    { id: "1", device: "Chrome on Windows", ip: "102.89.23.45", location: "Lagos, Nigeria", lastActive: "2026-06-26T16:30:00", current: true },
    { id: "2", device: "Safari on iPhone", ip: "102.89.23.46", location: "Lagos, Nigeria", lastActive: "2026-06-25T14:20:00", current: false },
    { id: "3", device: "Firefox on macOS", ip: "41.204.82.12", location: "Abuja, Nigeria", lastActive: "2026-06-20T09:15:00", current: false },
  ]);
  const [loginHistory] = useState([
    { date: "2026-06-26 16:30", ip: "102.89.23.45", status: "success", device: "Chrome / Windows" },
    { date: "2026-06-25 14:20", ip: "102.89.23.46", status: "success", device: "Safari / iPhone" },
    { date: "2026-06-24 08:45", ip: "102.89.23.45", status: "success", device: "Chrome / Windows" },
    { date: "2026-06-23 22:10", ip: "185.56.80.12", status: "failed", device: "Unknown" },
    { date: "2026-06-22 11:00", ip: "102.89.23.45", status: "success", device: "Chrome / Windows" },
  ]);

  const handleSave = async () => {
    try {
      await fetch("/api/v1/express/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: activeTab, data: activeTab === "profile" ? profile : activeTab === "notifications" ? notifications : {} }),
      });
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (event: keyof typeof notifications, channel: "email" | "sms" | "push") => {
    setNotifications((prev) => ({
      ...prev,
      [event]: {
        ...prev[event],
        [channel]: !prev[event][channel],
      },
    }));
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User size={16} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { key: "payment", label: "Payment Methods", icon: <CreditCard size={16} /> },
    { key: "security", label: "Security", icon: <Shield size={16} /> },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
            <Settings className="text-[#FF6B00]" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-white/50 text-sm">Manage your account preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === t.key
                  ? "bg-[#FF6B00] text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Save Banner */}
        {saved && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Settings saved successfully</span>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-white/60 text-sm block mb-1.5">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">Business Name</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">Account Type</label>
                <select
                  value={profile.accountType}
                  onChange={(e) => setProfile({ ...profile, accountType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                >
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={14} /> Save Profile
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-bold text-lg mb-6">Notification Preferences</h2>

            {/* Header */}
            <div className="grid grid-cols-4 gap-4 mb-4 px-4">
              <div />
              <div className="text-center">
                <Mail size={16} className="text-white/40 mx-auto mb-1" />
                <p className="text-white/40 text-xs">Email</p>
              </div>
              <div className="text-center">
                <Smartphone size={16} className="text-white/40 mx-auto mb-1" />
                <p className="text-white/40 text-xs">SMS</p>
              </div>
              <div className="text-center">
                <Bell size={16} className="text-white/40 mx-auto mb-1" />
                <p className="text-white/40 text-xs">Push</p>
              </div>
            </div>

            <div className="space-y-1">
              {Object.entries(notifications).map(([event, channels]) => (
                <div
                  key={event}
                  className="grid grid-cols-4 gap-4 items-center p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                >
                  <p className="text-white text-sm capitalize">
                    {event.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  {(["email", "sms", "push"] as const).map((channel) => (
                    <div key={channel} className="flex justify-center">
                      <button
                        onClick={() => toggleNotification(event as keyof typeof notifications, channel)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${
                          channels[channel] ? "bg-[#FF6B00]" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            channels[channel] ? "left-5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={14} /> Save Notifications
            </button>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Saved Cards</h2>
                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={14} /> Add Card
                </button>
              </div>

              <div className="space-y-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                      <CreditCard size={20} className="text-white/60" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm">{card.brand}</p>
                        {card.isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00]">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-xs">**** **** **** {card.last4} &bull; Expires {card.expiry}</p>
                    </div>
                    {!card.isDefault && (
                      <button className="text-white/40 hover:text-white text-xs">Set Default</button>
                    )}
                    <button className="text-white/40 hover:text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Card Form */}
            {showAddCard && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4">Add New Card</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-white/60 text-sm block mb-1.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={newCard.number}
                      onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm block mb-1.5">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-white/60 text-sm block mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={newCard.name}
                      onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowAddCard(false)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newCard.number.length >= 12) {
                        setCards((prev) => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            last4: newCard.number.slice(-4),
                            brand: newCard.number.startsWith("4") ? "Visa" : "Mastercard",
                            expiry: newCard.expiry,
                            isDefault: false,
                          },
                        ]);
                        setNewCard({ number: "", expiry: "", cvv: "", name: "" });
                        setShowAddCard(false);
                      }
                    }}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-6">Change Password</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">New Password</label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Save size={14} /> Update Password
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-bold text-lg">Two-Factor Authentication</h2>
                  <p className="text-white/50 text-sm mt-1">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={() => setTwoFA(!twoFA)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${twoFA ? "bg-[#FF6B00]" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${twoFA ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
              {twoFA && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 text-sm">Two-factor authentication is enabled</span>
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Active Sessions</h2>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      session.current ? "bg-[#FF6B00]/5 border-[#FF6B00]/20" : "bg-white/[0.02] border-white/10"
                    }`}
                  >
                    <Monitor size={18} className={session.current ? "text-[#FF6B00]" : "text-white/40"} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium">{session.device}</p>
                        {session.current && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00]">
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs">
                        {session.ip} &bull; {session.location} &bull; Last active{" "}
                        {new Date(session.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {!session.current && (
                      <button className="text-white/40 hover:text-red-400 text-xs">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Login History */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Login History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/40 font-medium py-2 px-3">Date</th>
                      <th className="text-left text-white/40 font-medium py-2 px-3">IP</th>
                      <th className="text-left text-white/40 font-medium py-2 px-3">Device</th>
                      <th className="text-left text-white/40 font-medium py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((entry, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2.5 px-3 text-white/70">{entry.date}</td>
                        <td className="py-2.5 px-3 text-white/50 font-mono text-xs">{entry.ip}</td>
                        <td className="py-2.5 px-3 text-white/50">{entry.device}</td>
                        <td className="py-2.5 px-3">
                          {entry.status === "success" ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs">
                              <CheckCircle size={12} /> Success
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-xs">
                              <AlertTriangle size={12} /> Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
