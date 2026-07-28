"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, Sun, MapPin, Zap, Calculator,
  BarChart3, FileText, Loader2, DollarSign,
} from "lucide-react";

const SYSTEM_TYPES = [
  { value: "residential", label: "Residential", desc: "Home backup and self-consumption" },
  { value: "commercial", label: "Commercial", desc: "Office buildings and retail spaces" },
  { value: "industrial", label: "Industrial", desc: "Factories and warehouses" },
  { value: "agricultural", label: "Agricultural", desc: "Farm irrigation and processing" },
  { value: "off-grid", label: "Off-Grid", desc: "Complete standalone system" },
  { value: "hybrid", label: "Hybrid", desc: "Grid-tied with battery backup" },
  { value: "solar-pump", label: "Solar Pump", desc: "Water pumping solution" },
];

const APPLIANCES = [
  { name: "LED Lights (per bulb)", watts: 10 },
  { name: "Ceiling Fan", watts: 75 },
  { name: "TV (32\")", watts: 60 },
  { name: "TV (55\")", watts: 120 },
  { name: "Fridge (single door)", watts: 150 },
  { name: "Fridge (double door)", watts: 250 },
  { name: "Deep Freezer", watts: 350 },
  { name: "Air Conditioner (1HP)", watts: 900 },
  { name: "Air Conditioner (1.5HP)", watts: 1400 },
  { name: "Air Conditioner (2HP)", watts: 1800 },
  { name: "Washing Machine", watts: 500 },
  { name: "Microwave", watts: 1000 },
  { name: "Electric Kettle", watts: 1500 },
  { name: "Water Pump (0.5HP)", watts: 375 },
  { name: "Water Pump (1HP)", watts: 750 },
  { name: "Laptop", watts: 60 },
  { name: "Desktop Computer", watts: 300 },
  { name: "Router/WiFi", watts: 15 },
  { name: "Electric Iron", watts: 1000 },
  { name: "Security Camera (per cam)", watts: 10 },
];

const STEPS = ["System Type", "Location", "Power Consumption", "Auto-Calculated Spec", "Component Selection", "Financial Analysis", "Review"];

export default function SolarConfiguratorPage() {
  const [step, setStep] = useState(1);
  const [systemType, setSystemType] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [monthlyBill, setMonthlyBill] = useState("");
  const [appliances, setAppliances] = useState<{ name: string; watts: number; qty: number; hours: number }[]>([]);
  const [panelBrand, setPanelBrand] = useState("standard");
  const [inverterBrand, setInverterBrand] = useState("standard");
  const [batteryBrand, setBatteryBrand] = useState("standard");
  const [calculated, setCalculated] = useState<{ panelCount: number; inverterKva: number; batteryKwh: number } | null>(null);

  const addAppliance = (app: typeof APPLIANCES[0]) => {
    setAppliances((prev) => {
      const existing = prev.find((a) => a.name === app.name);
      if (existing) return prev.map((a) => a.name === app.name ? { ...a, qty: a.qty + 1 } : a);
      return [...prev, { name: app.name, watts: app.watts, qty: 1, hours: 5 }];
    });
  };

  const updateAppliance = (name: string, key: "qty" | "hours", value: number) => {
    setAppliances((prev) => prev.map((a) => a.name === name ? { ...a, [key]: value } : a));
  };

  const removeAppliance = (name: string) => {
    setAppliances((prev) => prev.filter((a) => a.name !== name));
  };

  const totalLoad = useMemo(() => {
    return appliances.reduce((sum, a) => sum + a.watts * a.qty, 0);
  }, [appliances]);

  const totalDailyKwh = useMemo(() => {
    return appliances.reduce((sum, a) => sum + (a.watts * a.qty * a.hours) / 1000, 0);
  }, [appliances]);

  const calculateSystem = () => {
    const dailyKwh = totalDailyKwh || (parseFloat(monthlyBill) / 30 / 150 * 1000 || 0);
    const panelCount = Math.ceil((dailyKwh * 1.3) / 0.55);
    const inverterKva = Math.ceil((totalLoad * 1.25) / 1000);
    const batteryKwh = Math.ceil(dailyKwh * 0.7);
    setCalculated({ panelCount, inverterKva, batteryKwh });
    setStep(4);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!systemType;
      case 2: return !!country;
      case 3: return appliances.length > 0 || !!monthlyBill;
      case 4: return !!calculated;
      case 5: case 6: case 7: return true;
      default: return false;
    }
  };

  const inputCls = "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

  const STEPS_LABELS = STEPS;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/configure" className="hover:text-[#0A1628] transition-colors">Design Studio</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">Solar System Configurator</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-[#0A1628] rounded-2xl p-5 mb-8 text-white">
          <div className="flex items-center gap-3 mb-1">
            <Sun className="w-5 h-5 text-[#FF6B00]" />
            <h1 className="font-bold text-lg">Solar System Configurator</h1>
          </div>
          <p className="text-sm text-gray-400">Step {step} of {STEPS.length} &mdash; {STEPS_LABELS[step - 1]}</p>
          <div className="mt-3 flex gap-1">
            {STEPS_LABELS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-[#FF6B00]" : "bg-white/20"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">System Type</h2>
              <p className="text-sm text-gray-500 mb-6">Select the type of solar installation.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SYSTEM_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setSystemType(t.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      systemType === t.value
                        ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    {systemType === t.value && <Check className="w-4 h-4 text-[#FF6B00] shrink-0" />}
                    <div>
                      <p className={`text-sm font-semibold ${systemType === t.value ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{t.label}</p>
                      <p className="text-xs text-gray-500">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Location</h2>
              <p className="text-sm text-gray-500 mb-6">Where is the system being installed?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                    <option value="">Select country</option>
                    <option value="NG">Nigeria</option>
                    <option value="GH">Ghana</option>
                    <option value="KE">Kenya</option>
                    <option value="ZA">South Africa</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AE">UAE</option>
                    <option value="IN">India</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lagos" className={inputCls + " pl-9"} />
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                  Location data is used to estimate solar irradiance and optimal panel tilt for maximum efficiency.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Power Consumption</h2>
              <p className="text-sm text-gray-500 mb-4">Add appliances or use your monthly bill estimate.</p>

              <div className="mb-6">
                <label className={labelCls}>Or enter your monthly electricity bill amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" value={monthlyBill} onChange={(e) => setMonthlyBill(e.target.value)}
                    placeholder="e.g. 50000" className={inputCls + " pl-9"} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className={labelCls}>Add Appliances</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {APPLIANCES.map((app) => (
                    <button key={app.name} onClick={() => addAppliance(app)}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">
                      <span className="block font-semibold truncate">{app.name}</span>
                      <span className="text-gray-400">{app.watts}W</span>
                    </button>
                  ))}
                </div>

                {appliances.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left font-semibold text-gray-500 pb-2">Appliance</th>
                          <th className="text-center font-semibold text-gray-500 pb-2">Qty</th>
                          <th className="text-center font-semibold text-gray-500 pb-2">Hours/Day</th>
                          <th className="text-right font-semibold text-gray-500 pb-2">Daily Wh</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {appliances.map((a) => (
                          <tr key={a.name}>
                            <td className="py-2 text-[#0A1628] text-xs">{a.name}</td>
                            <td className="py-2 text-center">
                              <input type="number" min={1} value={a.qty} onChange={(e) => updateAppliance(a.name, "qty", parseInt(e.target.value) || 1)}
                                className="w-14 text-center text-xs rounded border border-gray-200 px-1 py-0.5" />
                            </td>
                            <td className="py-2 text-center">
                              <input type="number" min={0.5} step={0.5} value={a.hours} onChange={(e) => updateAppliance(a.name, "hours", parseFloat(e.target.value) || 1)}
                                className="w-14 text-center text-xs rounded border border-gray-200 px-1 py-0.5" />
                            </td>
                            <td className="py-2 text-right text-xs font-medium text-[#0A1628]">
                              {(a.watts * a.qty * a.hours).toLocaleString()}
                            </td>
                            <td>
                              <button onClick={() => removeAppliance(a.name)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td className="pt-2 font-semibold text-[#0A1628] text-xs">Total</td>
                          <td />
                          <td />
                          <td className="pt-2 text-right font-bold text-[#FF6B00]">{(totalDailyKwh * 1000).toLocaleString()} Wh/day</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calculator className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">Auto-Calculated System Spec</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Based on your consumption, here is the recommended system configuration.
              </p>

              {calculated && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#FF6B00]/5 rounded-xl border border-[#FF6B00]/20 p-5 text-center">
                    <Sun className="w-8 h-8 text-[#FF6B00] mx-auto mb-2" />
                    <p className="text-3xl font-bold text-[#0A1628]">{calculated.panelCount}</p>
                    <p className="text-xs text-gray-500">Solar Panels (550W)</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 text-center">
                    <Zap className="w-8 h-8 text-blue mx-auto mb-2" />
                    <p className="text-3xl font-bold text-[#0A1628]">{calculated.inverterKva}kVA</p>
                    <p className="text-xs text-gray-500">Inverter Capacity</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 text-center">
                    <svg className="w-8 h-8 text-emerald mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2" /><line x1="23" y1="10" x2="23" y2="14" /><line x1="7" y1="2" x2="7" y2="6" /><line x1="11" y1="2" x2="11" y2="6" /></svg>
                    <p className="text-3xl font-bold text-[#0A1628]">{calculated.batteryKwh}kWh</p>
                    <p className="text-xs text-gray-500">Battery Storage</p>
                  </div>
                </div>
              )}

              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-[#0A1628] mb-2">System Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Total Load: {totalLoad.toLocaleString()}W</p>
                  <p>Daily Consumption: {totalDailyKwh.toFixed(2)} kWh</p>
                  <p>Panel Configuration: {calculated?.panelCount} panels &times; 550W = {((calculated?.panelCount || 0) * 550 / 1000).toFixed(1)} kWp</p>
                  <p>Battery Autonomy: ~{calculated ? Math.round(calculated.batteryKwh / totalDailyKwh) : 0} hours</p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2">Component Selection</h2>
              <p className="text-sm text-gray-500 mb-6">Choose quality level for each component.</p>

              <div className="space-y-4">
                {[
                  { label: "Solar Panels", value: panelBrand, setter: setPanelBrand,
                    options: [
                      { value: "economy", label: "Economy", desc: "Polycrystalline, 18% efficiency" },
                      { value: "standard", label: "Standard", desc: "Monocrystalline, 21% efficiency", rec: true },
                      { value: "premium", label: "Premium", desc: "Half-cell monocrystalline, 23% efficiency" },
                    ] },
                  { label: "Inverter", value: inverterBrand, setter: setInverterBrand,
                    options: [
                      { value: "economy", label: "Economy", desc: "Modified sine wave, 1yr warranty" },
                      { value: "standard", label: "Standard", desc: "Pure sine wave, 2yr warranty", rec: true },
                      { value: "premium", label: "Premium", desc: "Pure sine wave, MPPT, 5yr warranty" },
                    ] },
                  { label: "Battery", value: batteryBrand, setter: setBatteryBrand,
                    options: [
                      { value: "economy", label: "Economy", desc: "Lead-acid deep cycle" },
                      { value: "standard", label: "Standard", desc: "Gel/AGM deep cycle", rec: true },
                      { value: "premium", label: "Premium", desc: "Lithium-ion (LiFePO4), 10yr warranty" },
                    ] },
                ].map((section) => (
                  <div key={section.label}>
                    <label className={labelCls}>{section.label}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {section.options.map((opt) => (
                        <button key={opt.value} onClick={() => section.setter(opt.value)}
                          className={`relative p-3 rounded-xl border text-left transition-all ${
                            section.value === opt.value
                              ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}>
                          {opt.rec && <span className="absolute top-1 right-1 text-[8px] font-bold text-green-600">✓</span>}
                          <p className="text-xs font-semibold text-[#0A1628]">{opt.label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">Financial Analysis</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Estimated costs, savings, and return on investment.</p>

              <div className="bg-[#0A1628] rounded-xl p-5 text-white mb-4">
                <h3 className="font-semibold text-sm text-white/80 mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-white/60">Solar Panels</span><span className="font-semibold">₦4,950,000</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Inverter</span><span className="font-semibold">₦2,300,000</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Battery Bank</span><span className="font-semibold">₦3,800,000</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Mounting & Accessories</span><span className="font-semibold">₦1,200,000</span></div>
                  <div className="flex justify-between"><span className="text-white/60">Installation</span><span className="font-semibold">₦850,000</span></div>
                  <div className="border-t border-white/20 my-2" />
                  <div className="flex justify-between text-base"><span className="font-semibold">Total Investment</span><span className="font-bold text-[#FF6B00]">₦13,100,000</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs text-green-600">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-700">₦375,000</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs text-amber-600">Payback Period</p>
                  <p className="text-2xl font-bold text-amber-700">~2.9 years</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-xs text-blue-600">ROI (10 years)</p>
                  <p className="text-2xl font-bold text-blue-700">245%</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-xs text-emerald-600">CO₂ Reduction</p>
                  <p className="text-2xl font-bold text-emerald-700">4.2 tons/yr</p>
                </div>
              </div>
            </div>
          )}

          {step === 7 && calculated && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 text-[#FF6B00]" />
                <h2 className="font-bold text-xl text-[#0A1628]">Review & BOM</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Complete bill of materials and system overview.</p>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-2">System Overview</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Type:</span> <span className="font-semibold text-[#0A1628] capitalize">{systemType}</span></div>
                    <div><span className="text-gray-500">Location:</span> <span className="font-semibold text-[#0A1628]">{city || country}</span></div>
                    <div><span className="text-gray-500">Total Load:</span> <span className="font-semibold text-[#0A1628]">{totalLoad.toLocaleString()}W</span></div>
                    <div><span className="text-gray-500">Daily Use:</span> <span className="font-semibold text-[#0A1628]">{totalDailyKwh.toFixed(1)} kWh</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-2">Bill of Materials</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left font-semibold text-gray-500 pb-2">Item</th>
                        <th className="text-right font-semibold text-gray-500 pb-2">Qty</th>
                        <th className="text-right font-semibold text-gray-500 pb-2">Unit Price</th>
                        <th className="text-right font-semibold text-gray-500 pb-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { item: `Solar Panel (550W ${panelBrand})`, qty: calculated.panelCount, up: 450000, total: calculated.panelCount * 450000 },
                        { item: `Inverter (${calculated.inverterKva}kVA ${inverterBrand})`, qty: 1, up: 2300000, total: 2300000 },
                        { item: `Battery Bank (${calculated.batteryKwh}kWh ${batteryBrand})`, qty: 1, up: 3800000, total: 3800000 },
                        { item: "Mounting Structure", qty: 1, up: 800000, total: 800000 },
                        { item: "Cables & Accessories", qty: 1, up: 400000, total: 400000 },
                        { item: "Installation & Labour", qty: 1, up: 850000, total: 850000 },
                      ].map((row) => (
                        <tr key={row.item}>
                          <td className="py-2 text-[#0A1628]">{row.item}</td>
                          <td className="py-2 text-right text-gray-500">{row.qty}</td>
                          <td className="py-2 text-right text-gray-500">₦{row.up.toLocaleString()}</td>
                          <td className="py-2 text-right font-medium text-[#0A1628]">₦{row.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td colSpan={3} className="pt-2 font-bold text-[#0A1628]">Total</td>
                        <td className="pt-2 text-right font-bold text-[#FF6B00]" id="total-cost">₦13,100,000</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-700">Matching Installers</p>
                  <p className="text-sm text-amber-800 mt-1">3 verified solar installers available in {city || "your area"}</p>
                  <button className="mt-2 text-xs font-semibold text-[#FF6B00] hover:underline">Request installation quotes →</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors disabled:opacity-30">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length && (
              <button
                onClick={() => {
                  if (step === 3) { calculateSystem(); return; }
                  setStep(Math.min(STEPS.length, step + 1));
                }}
                disabled={!canProceed()}
                className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {step === 3 ? "Calculate System" : "Continue"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === STEPS.length && (
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                Save Configuration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
