"use client";

import { useState } from "react";
import {
  Shield, Smartphone, Key, Lock, Globe, Clock, CheckCircle2,
  XCircle, AlertTriangle, Copy, Eye, EyeOff, RefreshCw, History,
  Monitor, Tablet, Laptop, ChevronRight, QrCode,
  ToggleLeft, ToggleRight, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const demoDevices = [
  { id: "1", name: "iPhone 15 Pro", type: "mobile", browser: "Safari", ip: "192.168.1.42", lastActive: "2 min ago", isCurrent: true },
  { id: "2", name: "MacBook Pro", type: "desktop", browser: "Chrome 124", ip: "192.168.1.42", lastActive: "1 hour ago", isCurrent: false },
  { id: "3", name: "Samsung Galaxy S24", type: "mobile", browser: "Chrome Mobile", ip: "10.0.0.15", lastActive: "2 days ago", isCurrent: false },
];

const loginHistory = [
  { id: "1", date: "2026-04-05 09:15 AM", device: "iPhone 15 Pro", location: "Lagos, NG", ip: "192.168.1.42", success: true },
  { id: "2", date: "2026-04-04 07:30 PM", device: "MacBook Pro", location: "Lagos, NG", ip: "192.168.1.42", success: true },
  { id: "3", date: "2026-04-03 02:15 AM", device: "Unknown", location: "Beijing, CN", ip: "203.0.113.42", success: false },
  { id: "4", date: "2026-04-02 06:45 PM", device: "Samsung Galaxy S24", location: "Abuja, NG", ip: "10.0.0.15", success: true },
  { id: "5", date: "2026-04-01 11:30 AM", device: "iPhone 15 Pro", location: "Lagos, NG", ip: "192.168.1.42", success: true },
];

const recoveryCodes = ["KX7A-9B2C", "M4P8-R1T5", "W3N6-E8K9", "J2H5-L7Q4", "F1G8-V3N6", "D9C2-X5M7", "B4K7-P1R9", "S8T3-Y6W2"];

const deviceIcons: Record<string, typeof Smartphone> = {
  mobile: Smartphone, desktop: Monitor, tablet: Tablet, laptop: Laptop,
};

export default function SecurityPage() {
  const [showCodes, setShowCodes] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  const checkPasswordStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setPasswordStrength(score);
  };

  return (
    <div>
      <h1 className="font-bold text-2xl text-text-1 mb-6">Security Settings</h1>

      <div className="space-y-6 max-w-3xl">
        {/* Two-Factor Authentication */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Shield size={20} className="text-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-text-1">Two-Factor Authentication</h3>
                <p className="text-xs text-text-4">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={() => { setTwoFAEnabled(!twoFAEnabled); if (!twoFAEnabled) setShowSetup(true); else setShowSetup(false); }}
              className={`relative w-12 h-6 rounded-full transition-colors ${twoFAEnabled ? "bg-blue" : "bg-gray-300"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFAEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {showSetup && !twoFAEnabled && (
            <div className="space-y-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                <QrCode size={40} className="text-blue shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-1">Scan with Authenticator App</p>
                  <p className="text-xs text-text-4 mt-1">Use Google Authenticator, Authy, or similar to scan the QR code</p>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 bg-white border-2 border-dashed border-border rounded-xl">
                <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode size={80} className="text-text-4/50" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-text-2 mb-1">Or enter setup key manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono text-text-1">KXVX AY2D MRSX G5DF QL3T N4W7</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard("KXVXAY2DMRSXG5DFQL3TN4W7", 99)}>
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-text-2 block mb-1">Verify Code</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="Enter 6-digit code" maxLength={6}
                    className="flex-1 h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue text-center tracking-widest font-mono text-lg"
                  />
                  <Button onClick={() => { if (verifyCode.length === 6) { setTwoFAEnabled(true); setShowSetup(false); setVerifyCode(""); } }}>
                    <CheckCircle2 size={16} className="mr-1" /> Verify & Enable
                  </Button>
                </div>
              </div>
            </div>
          )}

          {twoFAEnabled && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                <CheckCircle2 size={16} /> Two-factor authentication is enabled
              </div>
              <div>
                <p className="text-xs font-medium text-text-2 mb-2">Recovery Codes</p>
                <p className="text-xs text-text-4 mb-2">Save these codes in a secure place. Each code can be used only once.</p>
                <Button variant="outline" size="sm" onClick={() => { setShowCodes(!showCodes); setCodesRevealed(true); }} className="mb-3">
                  {showCodes ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                  {showCodes ? "Hide Codes" : "Show Recovery Codes"}
                </Button>
                {showCodes && (
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <code className="flex-1 text-sm font-mono text-text-1">{code}</code>
                        <button onClick={() => copyToClipboard(code, i)} className="text-text-4 hover:text-blue">
                          {copiedIndex === i ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" className="text-red hover:text-red border-red/20 hover:bg-red-50" onClick={() => { setTwoFAEnabled(false); }}>
                  <XCircle size={14} className="mr-1" /> Disable 2FA
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Device Management */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Smartphone size={20} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-text-1">Device Management</h3>
                <p className="text-xs text-text-4">Manage devices connected to your account</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {demoDevices.map((device) => {
              const Icon = deviceIcons[device.type] || Monitor;
              return (
                <div key={device.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-off-white transition-colors">
                  <Icon size={18} className="text-text-4" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-1">{device.name}</p>
                      {device.isCurrent && <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue rounded-full font-medium">Current</span>}
                    </div>
                    <p className="text-xs text-text-4">{device.browser} · IP: {device.ip} · Active {device.lastActive}</p>
                  </div>
                  {!device.isCurrent && (
                    <Button variant="outline" size="sm" className="text-red hover:text-red border-red/20 hover:bg-red-50 text-xs">
                      <XCircle size={12} className="mr-1" /> Revoke
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Login History */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <History size={20} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-1">Login History</h3>
              <p className="text-xs text-text-4">Recent login attempts on your account</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-border">
            {loginHistory.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-3">
                {log.success ? (
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-text-1">{log.device}</p>
                  <p className="text-xs text-text-4">{log.location} · IP: {log.ip}</p>
                </div>
                <span className="text-xs text-text-4">{log.date}</span>
                {!log.success && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-red-50 text-red rounded-full font-medium">Failed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Lock size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-text-1">Change Password</h3>
              <p className="text-xs text-text-4">Update your account password</p>
            </div>
          </div>
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="text-xs font-medium text-text-2 block mb-1">Current Password</label>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
            </div>
            <div>
              <label className="text-xs font-medium text-text-2 block mb-1">New Password</label>
              <input type="password" value={passwordForm.newPass} onChange={(e) => { setPasswordForm({ ...passwordForm, newPass: e.target.value }); checkPasswordStrength(e.target.value); }}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
              {passwordForm.newPass && (
                <div className="flex gap-1 mt-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full ${i <= passwordStrength ? (i <= 2 ? "bg-red" : i === 3 ? "bg-yellow-500" : "bg-green-500") : "bg-gray-200"}`} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-text-2 block mb-1">Confirm New Password</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border focus:outline-none focus:border-blue" />
            </div>
            <Button disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm || passwordStrength < 3}>
              <Save size={16} className="mr-1" /> Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
