"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  ChevronLeft,
  Bell,
  Globe,
  ToggleLeft,
  MapPin,
  User,
  Save,
  CheckCircle,
  X,
} from "lucide-react";

export default function ProSettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [available, setAvailable] = useState(true);
  const [coverageArea, setCoverageArea] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    jobAlerts: true,
    marketing: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const updateProfile = (field: string, value: string) => setProfile((prev) => ({ ...prev, [field]: value }));
  const toggleNotification = (key: string) => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/v1/kpn/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, available, coverageArea, notifications }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/pro/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange" /> Settings
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Settings saved successfully.
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange" />
              <h2 className="font-bold text-navy text-lg">Profile Information</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">First Name</label>
                <input type="text" value={profile.firstName} onChange={(e) => updateProfile("firstName", e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Last Name</label>
                <input type="text" value={profile.lastName} onChange={(e) => updateProfile("lastName", e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="Doe" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
                <input type="email" value={profile.email} onChange={(e) => updateProfile("email", e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Phone</label>
                <input type="tel" value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" placeholder="+234 800 000 0000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Professional Bio</label>
              <textarea value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50 resize-none"
                placeholder="Tell clients about your expertise..." />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <ToggleLeft className="w-5 h-5 text-orange" />
              <h2 className="font-bold text-navy text-lg">Availability</h2>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-medium text-navy text-sm">Available for new jobs</p>
                <p className="text-xs text-gray-500">Toggle to show or hide your availability to clients</p>
              </div>
              <button onClick={() => setAvailable(!available)}
                className={`relative w-12 h-6 rounded-full transition-colors ${available ? "bg-green-500" : "bg-gray-300"}`}>
                <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow-sm ${available ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </label>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange" />
              <h2 className="font-bold text-navy text-lg">Coverage Area</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Service areas (comma separated)</label>
              <input type="text" value={coverageArea} onChange={(e) => setCoverageArea(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                placeholder="e.g., Lagos, Abuja, Port Harcourt" />
              <p className="text-xs text-gray-400 mt-1">List the cities or regions you serve.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange" />
              <h2 className="font-bold text-navy text-lg">Notification Preferences</h2>
            </div>
            <div className="space-y-3">
              {[
                { key: "email", label: "Email notifications", desc: "Receive updates via email" },
                { key: "push", label: "Push notifications", desc: "Browser push notifications" },
                { key: "sms", label: "SMS notifications", desc: "Text message alerts" },
                { key: "jobAlerts", label: "New job alerts", desc: "Get notified when new jobs match your category" },
                { key: "marketing", label: "Marketing updates", desc: "Tips, features, and promotional content" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <p className="text-sm font-medium text-navy">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]}
                    onChange={() => toggleNotification(item.key)}
                    className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange/50" />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-8 py-2.5 rounded-lg transition-all disabled:opacity-50">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Settings</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}