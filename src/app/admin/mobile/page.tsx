"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import {
  Smartphone, Save, Loader2, ToggleLeft, ToggleRight, Bell,
  Search, User, Users, Calendar, Clock, Send, Trash2,
  Apple, Globe, Flag, Settings, MessageCircle, Image,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw,
} from "lucide-react";

const featureFlags = [
  { id: "push_notifications", name: "Push Notifications", description: "Send push notifications to users", enabled: true },
  { id: "qr_scan", name: "QR Scanner", description: "Allow in-app QR code scanning", enabled: true },
  { id: "offline_mode", name: "Offline Mode", description: "Browse products without internet", enabled: false },
  { id: "dark_mode", name: "Dark Mode", description: "Dark theme for the app", enabled: true },
  { id: "biometric_auth", name: "Biometric Auth", description: "Login with fingerprint or face ID", enabled: true },
  { id: "in_app_chat", name: "In-App Chat", description: "Real-time messaging with vendors", enabled: true },
  { id: "order_tracking", name: "Live Order Tracking", description: "Real-time delivery tracking on map", enabled: true },
  { id: "voice_search", name: "Voice Search", description: "Search products using voice commands", enabled: false },
  { id: "ar_view", name: "AR Product View", description: "View products in augmented reality", enabled: false },
  { id: "social_login", name: "Social Login", description: "Sign in with Google, Apple, Facebook", enabled: true },
  { id: "wishlist_sync", name: "Wishlist Sync", description: "Sync wishlist across devices", enabled: true },
  { id: "price_alerts", name: "Price Drop Alerts", description: "Notify users when prices drop", enabled: true },
];

const sentNotifications = [
  { id: "NOTIF-001", title: "Flash Sale Starts Now!", body: "Up to 60% off on marine equipment. Limited time only!", target: "all", segments: "All Users", status: "sent", sentAt: "2026-03-15 10:00 AM", delivered: 28450, opened: 10240 },
  { id: "NOTIF-002", title: "Your Order Has Shipped", body: "Your Yamaha engine is on its way! Track your delivery.", target: "individual", segments: "Order Update", status: "sent", sentAt: "2026-03-14 02:30 PM", delivered: 342, opened: 289 },
  { id: "NOTIF-003", title: "Weekly Deals Are Here", body: "Check out this week's handpicked deals just for you.", target: "segment", segments: "Active Buyers", status: "scheduled", sentAt: "2026-03-17 09:00 AM", delivered: 0, opened: 0 },
  { id: "NOTIF-004", title: "Don't Miss Out!", body: "Items in your cart are selling fast. Complete your purchase now.", target: "segment", segments: "Cart Abandoners", status: "draft", sentAt: "-", delivered: 0, opened: 0 },
];

const demoUsers = [
  { id: "USR-001", name: "John Okafor", email: "john@example.com" },
  { id: "USR-002", name: "Amina Bello", email: "amina@example.com" },
  { id: "USR-003", name: "David Chen", email: "david@example.com" },
  { id: "USR-004", name: "Grace Nwankwo", email: "grace@example.com" },
];

const segments = [
  { id: "all", label: "All Users" },
  { id: "active_buyers", label: "Active Buyers" },
  { id: "new_users", label: "New Users (7 days)" },
  { id: "cart_abandoners", label: "Cart Abandoners" },
  { id: "high_value", label: "High Value (₦500k+)" },
  { id: "vendors", label: "Vendors" },
];

const statusColors: Record<string, string> = {
  sent: "bg-green-50 text-green-700",
  scheduled: "bg-blue-50 text-blue",
  draft: "bg-gray-100 text-text-4",
  failed: "bg-red-50 text-red",
};

export default function AdminMobilePage() {
  const [platform, setPlatform] = useState({
    iosVersion: "2.4.1",
    iosBuild: "247",
    iosMinVersion: "2.0.0",
    androidVersion: "2.4.1",
    androidBuild: "312",
    androidMinVersion: "2.0.0",
  });

  const [forceUpdate, setForceUpdate] = useState({ ios: false, android: false });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [appStoreLinks, setAppStoreLinks] = useState({
    ios: "https://apps.apple.com/app/kauvex/id0000000000",
    android: "https://play.google.com/store/apps/details?id=com.kauvex.app",
  });
  const [features, setFeatures] = useState(featureFlags);
  const [saving, setSaving] = useState(false);
  const [notifSearch, setNotifSearch] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const [notification, setNotification] = useState({
    title: "",
    body: "",
    imageUrl: "",
    targetType: "all" as "all" | "segment" | "individual",
    segment: "",
    individualUser: "",
    scheduleType: "now" as "now" | "later",
    scheduleDate: "",
    scheduleTime: "",
  });

  const [notifHistory, setNotifHistory] = useState(sentNotifications);

  const toggleFeature = (id: string) => {
    setFeatures((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      alert("Mobile app settings saved successfully!");
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const sendNotification = async () => {
    if (!notification.title || !notification.body) {
      alert("Title and body are required");
      return;
    }
    if (notification.targetType === "individual" && !notification.individualUser) {
      alert("Select a user to send to");
      return;
    }
    if (notification.scheduleType === "later" && (!notification.scheduleDate || !notification.scheduleTime)) {
      alert("Set a schedule date and time");
      return;
    }

    const newNotif = {
      id: `NOTIF-${String(notifHistory.length + 1).padStart(3, "0")}`,
      title: notification.title,
      body: notification.body,
      target: notification.targetType,
      segments: notification.targetType === "segment" ? notification.segment : notification.targetType === "individual" ? notification.individualUser : "All Users",
      status: notification.scheduleType === "later" ? "scheduled" : "sent",
      sentAt: notification.scheduleType === "later"
        ? `${notification.scheduleDate} ${notification.scheduleTime}`
        : new Date().toLocaleString(),
      delivered: 0,
      opened: 0,
    };

    setNotifHistory((prev) => [newNotif, ...prev]);
    setShowComposer(false);
    setNotification({ title: "", body: "", imageUrl: "", targetType: "all", segment: "", individualUser: "", scheduleType: "now", scheduleDate: "", scheduleTime: "" });
    alert("Notification sent!");
  };

  const filteredUsers = demoUsers.filter((u) =>
    u.name.toLowerCase().includes(notifSearch.toLowerCase()) || u.email.toLowerCase().includes(notifSearch.toLowerCase())
  );

  return (
    <AdminShell title="Mobile App" subtitle="Manage mobile app versions, features, and push notifications">
      <div className="space-y-6">
        {/* Platform Config */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Smartphone size={15} /> Platform Configuration</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Apple size={18} className="text-text-3" />
                <h4 className="text-sm font-semibold text-text-1">iOS</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${forceUpdate.ios ? "bg-red-50 text-red" : "bg-green-50 text-green-700"}`}>{forceUpdate.ios ? "Force Update" : "Optional"}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-text-4 block mb-0.5">Version</label>
                  <input value={platform.iosVersion} onChange={(e) => setPlatform({ ...platform, iosVersion: e.target.value })} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-text-4 block mb-0.5">Build</label>
                  <input value={platform.iosBuild} onChange={(e) => setPlatform({ ...platform, iosBuild: e.target.value })} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-text-4 block mb-0.5">Min Version</label>
                  <input value={platform.iosMinVersion} onChange={(e) => setPlatform({ ...platform, iosMinVersion: e.target.value })} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue font-mono" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-2">Force Update</span>
                <button onClick={() => setForceUpdate({ ...forceUpdate, ios: !forceUpdate.ios })}>
                  {forceUpdate.ios ? <ToggleRight size={24} className="text-red" /> : <ToggleLeft size={24} className="text-text-4" />}
                </button>
              </div>
              <div>
                <label className="text-[10px] text-text-4 block mb-0.5">App Store URL</label>
                <input value={appStoreLinks.ios} onChange={(e) => setAppStoreLinks({ ...appStoreLinks, ios: e.target.value })} className="w-full h-9 px-3 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-text-3" />
                <h4 className="text-sm font-semibold text-text-1">Android</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${forceUpdate.android ? "bg-red-50 text-red" : "bg-green-50 text-green-700"}`}>{forceUpdate.android ? "Force Update" : "Optional"}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-text-4 block mb-0.5">Version</label>
                  <input value={platform.androidVersion} onChange={(e) => setPlatform({ ...platform, androidVersion: e.target.value })} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-text-4 block mb-0.5">Build</label>
                  <input value={platform.androidBuild} onChange={(e) => setPlatform({ ...platform, androidBuild: e.target.value })} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-text-4 block mb-0.5">Min Version</label>
                  <input value={platform.androidMinVersion} onChange={(e) => setPlatform({ ...platform, androidMinVersion: e.target.value })} className="w-full h-9 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue font-mono" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-2">Force Update</span>
                <button onClick={() => setForceUpdate({ ...forceUpdate, android: !forceUpdate.android })}>
                  {forceUpdate.android ? <ToggleRight size={24} className="text-red" /> : <ToggleLeft size={24} className="text-text-4" />}
                </button>
              </div>
              <div>
                <label className="text-[10px] text-text-4 block mb-0.5">Play Store URL</label>
                <input value={appStoreLinks.android} onChange={(e) => setAppStoreLinks({ ...appStoreLinks, android: e.target.value })} className="w-full h-9 px-3 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${maintenanceMode ? "bg-red-50" : "bg-gray-100"}`}>
                <AlertTriangle size={18} className={maintenanceMode ? "text-red" : "text-text-4"} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-1">Maintenance Mode</p>
                <p className="text-xs text-text-4">When enabled, users will see a maintenance screen and cannot use the app</p>
              </div>
            </div>
            <button onClick={() => setMaintenanceMode(!maintenanceMode)}>
              {maintenanceMode ? <ToggleRight size={28} className="text-red" /> : <ToggleLeft size={28} className="text-text-4" />}
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
              {saving ? "Saving..." : "Save Platform Settings"}
            </Button>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Flag size={15} /> Feature Flags</h3>
            <span className="text-xs text-text-4">{features.filter((f) => f.enabled).length}/{features.length} enabled</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature) => (
              <div key={feature.id} className={`p-4 rounded-xl border transition-all ${feature.enabled ? "border-green-100 bg-green-50/30" : "border-gray-100 bg-gray-50/50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-text-1">{feature.name}</p>
                  <button onClick={() => toggleFeature(feature.id)}>
                    {feature.enabled ? <ToggleRight size={22} className="text-green-600" /> : <ToggleLeft size={22} className="text-text-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-text-4">{feature.description}</p>
                <span className={`text-[9px] mt-2 inline-block px-1.5 py-0.5 rounded-full font-medium ${feature.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-text-4"}`}>
                  {feature.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notification Composer */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Bell size={15} /> Push Notifications</h3>
            <Button size="sm" onClick={() => setShowComposer(!showComposer)}>
              {showComposer ? <XCircle size={14} className="mr-1" /> : <Send size={14} className="mr-1" />}
              {showComposer ? "Close" : "New Notification"}
            </Button>
          </div>

          {showComposer && (
            <div className="p-5 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-text-1 mb-4">Compose Notification</h4>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Title</label>
                    <input type="text" value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} placeholder="e.g. Flash Sale Now Live!" maxLength={100} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Body</label>
                    <textarea value={notification.body} onChange={(e) => setNotification({ ...notification, body: e.target.value })} rows={3} placeholder="Enter notification message..." maxLength={500} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Image URL (optional)</label>
                    <input type="url" value={notification.imageUrl} onChange={(e) => setNotification({ ...notification, imageUrl: e.target.value })} placeholder="https://..." className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Target Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["all", "segment", "individual"] as const).map((t) => (
                        <button key={t} onClick={() => setNotification({ ...notification, targetType: t })} className={`p-3 rounded-lg border text-center text-xs capitalize transition-all ${
                          notification.targetType === t ? "border-blue bg-blue-50 text-blue" : "border-gray-200 hover:border-gray-300 text-text-2"
                        }`}>
                          {t === "all" ? <Globe size={14} className="mx-auto mb-1" /> : t === "segment" ? <Users size={14} className="mx-auto mb-1" /> : <User size={14} className="mx-auto mb-1" />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {notification.targetType === "segment" && (
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Segment</label>
                      <select value={notification.segment} onChange={(e) => setNotification({ ...notification, segment: e.target.value })} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue">
                        <option value="">Select segment...</option>
                        {segments.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                  )}

                  {notification.targetType === "individual" && (
                    <div>
                      <label className="text-xs font-medium text-text-2 block mb-1">Search User</label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                        <input type="text" value={notifSearch} onChange={(e) => setNotifSearch(e.target.value)} placeholder="Search by name or email..." className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                      </div>
                      {notifSearch && (
                        <div className="mt-2 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
                          {filteredUsers.map((u) => (
                            <button key={u.id} onClick={() => { setNotification({ ...notification, individualUser: u.name }); setNotifSearch(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                              <User size={14} className="text-text-4" /> {u.name} <span className="text-text-4 text-xs">({u.email})</span>
                            </button>
                          ))}
                          {filteredUsers.length === 0 && <p className="px-3 py-2 text-xs text-text-4">No users found</p>}
                        </div>
                      )}
                      {notification.individualUser && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue text-xs rounded-full font-medium">
                          {notification.individualUser} <button onClick={() => setNotification({ ...notification, individualUser: "" })}><XCircle size={12} /></button>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-text-2 block mb-1">Schedule</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setNotification({ ...notification, scheduleType: "now" })} className={`p-3 rounded-lg border text-center text-xs transition-all ${
                        notification.scheduleType === "now" ? "border-blue bg-blue-50 text-blue" : "border-gray-200 hover:border-gray-300 text-text-2"
                      }`}>
                        <Clock size={14} className="mx-auto mb-1" /> Send Now
                      </button>
                      <button onClick={() => setNotification({ ...notification, scheduleType: "later" })} className={`p-3 rounded-lg border text-center text-xs transition-all ${
                        notification.scheduleType === "later" ? "border-blue bg-blue-50 text-blue" : "border-gray-200 hover:border-gray-300 text-text-2"
                      }`}>
                        <Calendar size={14} className="mx-auto mb-1" /> Schedule Later
                      </button>
                    </div>
                    {notification.scheduleType === "later" && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <input type="date" value={notification.scheduleDate} onChange={(e) => setNotification({ ...notification, scheduleDate: e.target.value })} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                        <input type="time" value={notification.scheduleTime} onChange={(e) => setNotification({ ...notification, scheduleTime: e.target.value })} className="w-full h-10 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h5 className="text-xs font-medium text-text-2 mb-2">Notification Preview</h5>
                <div className="bg-white rounded-xl p-4 border border-gray-200 max-w-sm mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue flex items-center justify-center shrink-0">
                      <Bell size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-text-1">KAUVEX</p>
                        <span className="text-[9px] text-text-4">now</span>
                      </div>
                      <p className="text-sm font-semibold text-text-1 mt-0.5">{notification.title || "Notification Title"}</p>
                      <p className="text-xs text-text-4 line-clamp-2">{notification.body || "Your notification message will appear here."}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowComposer(false)}>Discard</Button>
                <Button onClick={sendNotification}>
                  <Send size={14} className="mr-1" />
                  {notification.scheduleType === "later" ? "Schedule Notification" : "Send Now"}
                </Button>
              </div>
            </div>
          )}

          {/* Notification History */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Target</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Sent At</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Delivered</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Opened</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifHistory.map((n) => (
                  <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-1">{n.title}</p>
                      <p className="text-[10px] text-text-4 mt-0.5 line-clamp-1">{n.body}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-2">{n.segments}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[n.status]}`}>{n.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-2">{n.sentAt}</td>
                    <td className="px-4 py-3 text-sm text-right text-text-2">{n.delivered.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-right text-text-2">{n.opened.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View Details"><MessageCircle size={14} className="text-text-4" /></button>
                        {n.status === "draft" && <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} className="text-red" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
