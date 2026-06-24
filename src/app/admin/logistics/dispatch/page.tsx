"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Save, Clock, Globe, Zap, Percent, Loader2 } from "lucide-react";

interface DispatchConfig {
  tier1AcceptanceWindow: number;
  tier1RadiusDefault: number;
  tier1RadiusPerCountry: Record<string, number>;
  surgeEnabled: boolean;
  surgeMultiplier: number;
  fallbackCarrierOrder: string[];
  autoDispatchEnabled: boolean;
  partnerFallbackAttempts: number;
}

const defaultConfig: DispatchConfig = {
  tier1AcceptanceWindow: 15,
  tier1RadiusDefault: 60,
  tier1RadiusPerCountry: { NG: 60, GH: 50, KE: 50, ZA: 80, US: 40, GB: 50 },
  surgeEnabled: false,
  surgeMultiplier: 1.5,
  fallbackCarrierOrder: ["gig", "kwik", "dhl", "fedex"],
  autoDispatchEnabled: true,
  partnerFallbackAttempts: 3,
};

export default function AdminDispatchPage() {
  const [config, setConfig] = useState<DispatchConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/v1/logistics/dispatch");
        const json = await res.json();
        if (json.success && json.data) {
          setConfig({ ...defaultConfig, ...json.data });
        }
      } catch { /* use defaults */ }
      finally { setLoading(false); }
    };
    fetchConfig();
  }, []);

  const updateRadius = (country: string, value: number) => {
    setConfig(prev => ({ ...prev, tier1RadiusPerCountry: { ...prev.tier1RadiusPerCountry, [country]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/logistics/dispatch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch { /* fallback */ }
    finally { setSaving(false); }
  };

  if (loading) {
    return <AdminShell title="Dispatch Settings" subtitle="Configure dispatch engine behavior and fallback rules">
      <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange" /></div>
    </AdminShell>;
  }

  return (
    <AdminShell title="Dispatch Settings" subtitle="Configure dispatch engine behavior and fallback rules">
      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <h3 className="font-bold text-text-1 flex items-center gap-2"><Clock className="w-4 h-4 text-orange" />Tier 1 Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1">Acceptance Window (minutes)</label>
              <input type="number" value={config.tier1AcceptanceWindow} onChange={e => setConfig(prev => ({ ...prev, tier1AcceptanceWindow: +e.target.value }))} className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
              <p className="text-[10px] text-text-4 mt-1">Job offer expires after X minutes</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1">Default Radius (km)</label>
              <input type="number" value={config.tier1RadiusDefault} onChange={e => setConfig(prev => ({ ...prev, tier1RadiusDefault: +e.target.value }))} className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-3 block mb-2">Radius Per Country (km)</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(config.tier1RadiusPerCountry).map(([country, radius]) => (
                <div key={country} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-text-2 w-8">{country}</span>
                  <input type="number" value={radius} onChange={e => updateRadius(country, +e.target.value)} className="flex-1 h-9 px-2 border border-border rounded-lg text-xs" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <h3 className="font-bold text-text-1 flex items-center gap-2"><Globe className="w-4 h-4 text-orange" />Auto-Dispatch</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-1">Auto-Dispatch Mode</p>
              <p className="text-xs text-text-4">Jobs are automatically offered to matching partners</p>
            </div>
            <button onClick={() => setConfig(prev => ({ ...prev, autoDispatchEnabled: !prev.autoDispatchEnabled }))} className={`relative w-12 h-6 rounded-full transition-colors ${config.autoDispatchEnabled ? "bg-orange" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.autoDispatchEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1">Partner Fallback Attempts</label>
              <input type="number" value={config.partnerFallbackAttempts} onChange={e => setConfig(prev => ({ ...prev, partnerFallbackAttempts: +e.target.value }))} className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
              <p className="text-[10px] text-text-4 mt-1">Number of partners offered before carrier fallback</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1">Fallback Carrier Order</label>
              <div className="flex gap-1 flex-wrap">
                {config.fallbackCarrierOrder.map((c, i) => (
                  <span key={c} className="text-xs px-2 py-1 bg-gray-100 rounded-lg">{i + 1}. {c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <h3 className="font-bold text-text-1 flex items-center gap-2"><Zap className="w-4 h-4 text-orange" />Surge Pricing</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-1">Enable Surge Pricing</p>
              <p className="text-xs text-text-4">Multiplier applied during peak periods</p>
            </div>
            <button onClick={() => setConfig(prev => ({ ...prev, surgeEnabled: !prev.surgeEnabled }))} className={`relative w-12 h-6 rounded-full transition-colors ${config.surgeEnabled ? "bg-orange" : "bg-gray-300"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.surgeEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          {config.surgeEnabled && (
            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1"><Percent className="w-3 h-3 inline" /> Surge Multiplier</label>
              <input type="number" step={0.1} value={config.surgeMultiplier} onChange={e => setConfig(prev => ({ ...prev, surgeMultiplier: +e.target.value }))} className="w-full h-10 px-3 border border-border rounded-lg text-sm max-w-[200px]" />
              <p className="text-[10px] text-text-4 mt-1">1.5 = 50% above base rate. Configure surge periods in Surge Pricing admin.</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="h-10 px-6 bg-orange text-white font-bold rounded-lg hover:bg-orange/90 disabled:opacity-40 flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Settings saved!</span>}
        </div>
      </div>
    </AdminShell>
  );
}
