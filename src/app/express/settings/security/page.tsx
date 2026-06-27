"use client";

import { useState } from "react";
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  Shield,
  Monitor,
  Smartphone,
  Globe,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Download,
  Save,
  Trash2,
  Clock,
} from "lucide-react";

interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface LoginEntry {
  date: string;
  ip: string;
  device: string;
  location: string;
  status: "success" | "failed";
}

export default function SecuritySettingsPage() {
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Windows Desktop",
      browser: "Chrome 126.0",
      ip: "102.89.23.45",
      location: "Lagos, Nigeria",
      lastActive: "2026-06-27T10:30:00",
      current: true,
    },
    {
      id: "2",
      device: "iPhone 15 Pro",
      browser: "Safari 19.0",
      ip: "102.89.23.46",
      location: "Lagos, Nigeria",
      lastActive: "2026-06-26T14:20:00",
      current: false,
    },
    {
      id: "3",
      device: "MacBook Pro",
      browser: "Firefox 128.0",
      ip: "41.204.82.12",
      location: "Abuja, Nigeria",
      lastActive: "2026-06-25T09:15:00",
      current: false,
    },
    {
      id: "4",
      device: "Samsung Galaxy S24",
      browser: "Chrome Mobile 126.0",
      ip: "105.112.45.78",
      location: "Port Harcourt, Nigeria",
      lastActive: "2026-06-23T18:45:00",
      current: false,
    },
  ]);

  const [loginHistory] = useState<LoginEntry[]>([
    { date: "2026-06-27 10:30", ip: "102.89.23.45", device: "Chrome / Windows", location: "Lagos", status: "success" },
    { date: "2026-06-26 14:20", ip: "102.89.23.46", device: "Safari / iPhone", location: "Lagos", status: "success" },
    { date: "2026-06-25 09:15", ip: "41.204.82.12", device: "Firefox / macOS", location: "Abuja", status: "success" },
    { date: "2026-06-24 22:10", ip: "185.56.80.12", device: "Unknown", location: "Unknown", status: "failed" },
    { date: "2026-06-23 18:45", ip: "105.112.45.78", device: "Chrome Mobile / Android", location: "PH", status: "success" },
    { date: "2026-06-22 11:00", ip: "102.89.23.45", device: "Chrome / Windows", location: "Lagos", status: "success" },
    { date: "2026-06-21 08:30", ip: "102.89.23.45", device: "Chrome / Windows", location: "Lagos", status: "success" },
    { date: "2026-06-20 16:00", ip: "41.204.82.12", device: "Firefox / macOS", location: "Abuja", status: "success" },
  ]);

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPassword || passwords.newPassword !== passwords.confirm) return;
    try {
      await fetch("/api/v1/express/settings/security/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current: passwords.current, newPassword: passwords.newPassword }),
      });
    } catch {}
    setPasswords({ current: "", newPassword: "", confirm: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const revokeAllSessions = () => {
    setSessions((prev) => prev.filter((s) => s.current));
    setShowRevokeConfirm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const strength = getPasswordStrength(passwords.newPassword);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Security Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Protect your account with passwords and 2FA</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle size={16} className="text-emerald-500" />
          <span className="text-emerald-700 text-sm font-medium">Security settings updated</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <Lock size={20} className="text-[#FF6B00]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Change Password</h2>
            <p className="text-xs text-gray-500">Use a strong password with at least 8 characters</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Current Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-10 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">New Password</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
            </div>
            {passwords.newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-gray-500">{strength.label}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
            </div>
            {passwords.confirm.length > 0 && passwords.newPassword !== passwords.confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={!passwords.current || !passwords.newPassword || passwords.newPassword !== passwords.confirm}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e55f00] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={14} />
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Shield size={20} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Two-Factor Authentication</h2>
              <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFA(!twoFA)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              twoFA ? "bg-[#FF6B00]" : "bg-gray-200"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                twoFA ? "left-6" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {twoFA && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-green-700 text-sm font-medium">Two-factor authentication is enabled</span>
            </div>
            <p className="text-xs text-green-600 mt-1 ml-6">
              Your account is protected with an authenticator app or SMS verification.
            </p>
          </div>
        )}

        {!twoFA && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <span className="text-amber-700 text-sm font-medium">Two-factor authentication is disabled</span>
            </div>
            <p className="text-xs text-amber-600 mt-1 ml-6">
              We recommend enabling 2FA to protect your account from unauthorized access.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Monitor size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Active Sessions</h2>
              <p className="text-xs text-gray-500">Devices currently signed in to your account</p>
            </div>
          </div>
          {!showRevokeConfirm ? (
            <button
              onClick={() => setShowRevokeConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Revoke All
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Revoke all other sessions?</span>
              <button
                onClick={revokeAllSessions}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowRevokeConfirm(false)}
                className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                session.current
                  ? "border-[#FF6B00]/30 bg-[#FF6B00]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                session.current ? "bg-[#FF6B00]/10" : "bg-gray-100"
              }`}>
                {session.device.includes("iPhone") || session.device.includes("Samsung") ? (
                  <Smartphone size={18} className={session.current ? "text-[#FF6B00]" : "text-gray-500"} />
                ) : (
                  <Monitor size={18} className={session.current ? "text-[#FF6B00]" : "text-gray-500"} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#0A1628]">{session.device}</p>
                  {session.current && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B00]/10 text-[#FF6B00]">
                      <div className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full animate-pulse" />
                      THIS DEVICE
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {session.browser} &bull; {session.ip} &bull; {session.location}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <Clock size={10} />
                  Last active {formatTimeAgo(session.lastActive)}
                </p>
              </div>
              {!session.current && (
                <button
                  onClick={() => revokeSession(session.id)}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Globe size={20} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Login History</h2>
            <p className="text-xs text-gray-500">Recent sign-in activity on your account</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider py-3 px-3">Date & Time</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider py-3 px-3">IP Address</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider py-3 px-3">Device</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider py-3 px-3">Location</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((entry, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-3 text-[#0A1628] font-medium">{entry.date}</td>
                  <td className="py-3 px-3 text-gray-500 font-mono text-xs">{entry.ip}</td>
                  <td className="py-3 px-3 text-gray-500">{entry.device}</td>
                  <td className="py-3 px-3 text-gray-500">{entry.location}</td>
                  <td className="py-3 px-3">
                    {entry.status === "success" ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle size={12} />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                        <AlertTriangle size={12} />
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center">
            <Download size={20} className="text-[#0A1628]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">Export Your Data</h2>
            <p className="text-xs text-gray-500">Download a copy of your account data</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Request a copy of all data associated with your Kauvex Express account. The export will be sent to your email address.
        </p>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-[#0A1628] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <Download size={14} />
          Request Data Export
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePasswordChange}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e55f00] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Save size={14} />
          Save Security Settings
        </button>
      </div>
    </div>
  );
}
