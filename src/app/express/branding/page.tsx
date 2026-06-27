"use client";

import { useState } from "react";
import {
  Palette,
  Upload,
  Eye,
  Save,
  CheckCircle,
  Lock,
  Truck,
  Mail,
  MapPin,
  Package,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";

export default function ExpressBrandingPage() {
  const [planTier] = useState<"business" | "enterprise">("business");
  const [saved, setSaved] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [branding, setBranding] = useState({
    primaryColor: "#FF6B00",
    secondaryColor: "#0A1628",
    companyName: "Doe Enterprises",
    showLogo: true,
    customMessage: "Thank you for choosing our delivery service!",
  });

  const handleLogoUpload = () => {
    setLogo("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjEyIiBmaWxsPSIjRkY2QjAwIi8+PHRleHQgeD0iNTAiIHk9IjU4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsIj5MRzwvdGV4dD48L3N2Zz4=");
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (planTier === "free") {
    return (
      <div style={{ backgroundColor: "#F5F7FA" }} className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto">
            <Lock size={28} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>Custom Branding</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Custom branding is available on the Express Business plan and above. Upgrade to personalize your tracking pages, emails, and documents with your brand identity.
          </p>
          <button className="px-6 py-3 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: "#FF6B00" }}>
            Upgrade to Business
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F5F7FA" }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
              <Palette className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#0A1628" }}>Custom Branding</h1>
              <p className="text-gray-500 text-sm">Personalize tracking pages and email templates with your brand</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: "#FF6B00" }}>
            BUSINESS PLAN
          </span>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle size={16} className="text-emerald-600" />
            <span className="text-emerald-700 text-sm font-medium">Branding settings saved successfully</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
              <h3 className="font-bold" style={{ color: "#0A1628" }}>Logo</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Upload size={24} className="text-gray-300" />
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleLogoUpload}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                    style={{ backgroundColor: "#FF6B00" }}
                  >
                    <Upload size={12} /> Upload Logo
                  </button>
                  {logo && (
                    <button onClick={() => setLogo(null)} className="block text-xs text-gray-400 hover:text-red-500">
                      Remove
                    </button>
                  )}
                  <p className="text-[10px] text-gray-400">PNG, SVG, or JPG. Max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
              <h3 className="font-bold" style={{ color: "#0A1628" }}>Brand Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex gap-1">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: branding.primaryColor }} />
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: branding.secondaryColor }} />
                </div>
                <span className="text-xs text-gray-400">Preview</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
              <h3 className="font-bold" style={{ color: "#0A1628" }}>Company Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={branding.companyName}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Custom Tracking Message</label>
                  <textarea
                    value={branding.customMessage}
                    onChange={(e) => setBranding({ ...branding, customMessage: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: "#FF6B00" }}
            >
              <Save size={14} /> Save Branding Settings
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
              <div className="flex items-center gap-2">
                <Eye size={18} style={{ color: "#FF6B00" }} />
                <h3 className="font-bold" style={{ color: "#0A1628" }}>Tracking Page Preview</h3>
              </div>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4" style={{ backgroundColor: branding.primaryColor }}>
                  <div className="flex items-center gap-2">
                    {logo && <img src={logo} alt="" className="w-6 h-6 rounded" />}
                    <span className="text-white font-bold text-sm">{branding.companyName}</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Shipment</p>
                    <p className="font-mono text-xs font-semibold" style={{ color: "#0A1628" }}>KVE-2026-000001</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}15`, color: branding.primaryColor }}>
                      <CheckCircle size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: "#0A1628" }}>Delivered</p>
                      <p className="text-[10px] text-gray-400">Jun 26, 2026 at 2:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}15`, color: branding.primaryColor }}>
                      <Truck size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: "#0A1628" }}>In Transit</p>
                      <p className="text-[10px] text-gray-400">Jun 25, 2026 at 9:15 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}15`, color: branding.primaryColor }}>
                      <Package size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: "#0A1628" }}>Picked Up</p>
                      <p className="text-[10px] text-gray-400">Jun 24, 2026 at 4:00 PM</p>
                    </div>
                  </div>
                  {branding.customMessage && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.secondaryColor}08`, borderLeft: `3px solid ${branding.secondaryColor}` }}>
                      <p className="text-xs" style={{ color: branding.secondaryColor }}>{branding.customMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-5 bg-white space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={18} style={{ color: "#0A1628" }} />
                <h3 className="font-bold" style={{ color: "#0A1628" }}>Email Template Preview</h3>
              </div>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3 text-center" style={{ backgroundColor: branding.primaryColor }}>
                  <span className="text-white font-bold text-sm">{branding.companyName}</span>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-sm font-semibold" style={{ color: "#0A1628" }}>Your shipment has been delivered!</p>
                  <p className="text-xs text-gray-500">Hello valued customer,</p>
                  <p className="text-xs text-gray-500">Your package with tracking number <span className="font-mono font-semibold" style={{ color: "#0A1628" }}>KVE-2026-000001</span> has been successfully delivered to your address.</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-600">22 Allen Avenue, Ikeja, Lagos</span>
                  </div>
                  <div className="pt-2">
                    <button className="w-full py-2.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: branding.primaryColor }}>
                      Track Your Shipment
                    </button>
                  </div>
                </div>
                <div className="p-3 text-center bg-gray-50 border-t border-gray-200">
                  <p className="text-[10px] text-gray-400">Powered by Kauvex Express • {branding.companyName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
