"use client";

import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Save,
  Smartphone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
}

interface NotificationPref {
  label: string;
  desc: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface PrivacySetting {
  label: string;
  desc: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
  });

  const [notPrefs, setNotPrefs] = useState<NotificationPref[]>([
    { label: "Order updates", desc: "Status changes, shipping, delivery", email: true, sms: true, push: true },
    { label: "Promotions & deals", desc: "Sales, coupons, special offers", email: true, sms: true, push: true },
    { label: "Price drop alerts", desc: "When wishlist items go on sale", email: true, sms: true, push: true },
    { label: "Back in stock", desc: "When out-of-stock items are available", email: true, sms: true, push: true },
    { label: "New arrivals", desc: "Products in your favorite categories", email: true, sms: true, push: true },
    { label: "Blog & articles", desc: "Industry news and guides", email: true, sms: true, push: true },
    { label: "Account activity", desc: "Login, password changes, security", email: true, sms: true, push: true },
  ]);

  const [privacy, setPrivacy] = useState<PrivacySetting[]>([
    { label: "Show profile to other users", desc: "Allow other users to see your profile", enabled: true },
    { label: "Allow product recommendations", desc: "Personalized suggestions based on history", enabled: true },
    { label: "Allow review visibility", desc: "Show your reviews publicly", enabled: true },
    { label: "Marketing data usage", desc: "Use purchase data for better recommendations", enabled: true },
  ]);

  useEffect(() => {
    async function load() {
      try {
        const [profRes, notifRes, privRes] = await Promise.all([
          fetch("/api/v1/account/profile"),
          fetch("/api/v1/account/notifications/preferences"),
          fetch("/api/v1/account/privacy"),
        ]);
        if (profRes.ok) {
          const d = await profRes.json();
          setProfile((p) => ({ ...p, ...d }));
        }
        if (notifRes.ok) {
          const d = await notifRes.json();
          if (Array.isArray(d)) setNotPrefs(d);
        }
        if (privRes.ok) {
          const d = await privRes.json();
          if (Array.isArray(d)) setPrivacy(d);
        }
      } catch {
        // keep defaults on failure
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const initials = (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "");
  const memberSince = profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    } finally {
      setSaving(false);
    }
  };

  const saveNotPrefs = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/account/notifications/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notPrefs) });
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    setSaving(true);
    try {
      await fetch("/api/v1/account/privacy", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(privacy) });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold text-2xl text-text-1 mb-6">Account Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-blue text-white"
                  : "bg-white text-text-3 border border-border hover:bg-off-white"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                {initials || "?"}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue text-white flex items-center justify-center shadow-md">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-text-1">{profile.firstName} {profile.lastName}</h3>
              <p className="text-sm text-text-3">Member since {memberSince || "N/A"}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-2 mb-1.5 block">First Name</label>
              <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-2 mb-1.5 block">Last Name</label>
              <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-2 mb-1.5 block">Email</label>
              <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} type="email" className="w-full h-11 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-2 mb-1.5 block">Phone</label>
              <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-2 mb-1.5 block">Date of Birth</label>
              <input type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-2 mb-1.5 block">Gender</label>
              <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-border text-sm">
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
              </select>
            </div>
          </div>
          <Button className="mt-5 gap-2" onClick={saveProfile} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
          </Button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg text-text-1 mb-4">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium text-text-2 mb-1.5 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full h-11 px-3 pr-10 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-2 mb-1.5 block">New Password</label>
                <input type="password" className="w-full h-11 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue" />
              </div>
              <div>
                <label className="text-sm font-medium text-text-2 mb-1.5 block">Confirm New Password</label>
                <input type="password" className="w-full h-11 px-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue" />
              </div>
              <Button>Update Password</Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg text-text-1 mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-text-3 mb-4">Add an extra layer of security to your account</p>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-text-3" />
                <div>
                  <p className="text-sm font-medium text-text-1">Authenticator App</p>
                  <p className="text-xs text-text-4">Use Google Authenticator or similar</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg text-text-1 mb-4">Active Sessions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-blue bg-blue-50">
                <div>
                  <p className="text-sm font-medium text-text-1">Chrome on Windows &middot; Lagos</p>
                  <p className="text-xs text-text-4">Current session &middot; Last active now</p>
                </div>
                <span className="text-xs text-blue font-medium">This device</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-text-1">Safari on iPhone &middot; Lagos</p>
                  <p className="text-xs text-text-4">Last active 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm" className="text-red hover:bg-red-50">Revoke</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-lg text-text-1 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {notPrefs.map((pref, idx) => (
              <div key={pref.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-1">{pref.label}</p>
                  <p className="text-xs text-text-4">{pref.desc}</p>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-text-3">
                    <input type="checkbox" checked={pref.email} onChange={(e) => { const n = [...notPrefs]; n[idx] = { ...n[idx], email: e.target.checked }; setNotPrefs(n); }} className="rounded" /> Email
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-text-3">
                    <input type="checkbox" checked={pref.sms} onChange={(e) => { const n = [...notPrefs]; n[idx] = { ...n[idx], sms: e.target.checked }; setNotPrefs(n); }} className="rounded" /> SMS
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-text-3">
                    <input type="checkbox" checked={pref.push} onChange={(e) => { const n = [...notPrefs]; n[idx] = { ...n[idx], push: e.target.checked }; setNotPrefs(n); }} className="rounded" /> Push
                  </label>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-5 gap-2" onClick={saveNotPrefs} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Preferences
          </Button>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === "privacy" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg text-text-1 mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              {privacy.map((setting, idx) => (
                <div key={setting.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-text-1">{setting.label}</p>
                    <p className="text-xs text-text-4">{setting.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={setting.enabled} onChange={(e) => { const p = [...privacy]; p[idx] = { ...p[idx], enabled: e.target.checked }; setPrivacy(p); }} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
            <Button className="mt-5 gap-2" onClick={savePrivacy} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Privacy
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-red/20 p-6">
            <h3 className="font-semibold text-lg text-red mb-2">Danger Zone</h3>
            <p className="text-sm text-text-3 mb-4">Permanently delete your account and all associated data</p>
            <Button variant="destructive" size="sm">Delete My Account</Button>
          </div>
        </div>
      )}
    </div>
  );
}
