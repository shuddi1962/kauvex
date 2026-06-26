"use client";

import { useState } from "react";
import { MapPin, Package, ArrowRight, Truck, Clock, Shield, ChevronDown, ChevronUp, Zap, Plus, Weight, Ruler } from "lucide-react";

const SERVICES = [
  { id: "express", label: "Express", desc: "1-2 business days", price: 12.99, popular: true },
  { id: "standard", label: "Standard", desc: "3-5 business days", price: 7.99, popular: false },
  { id: "economy", label: "Economy", desc: "5-8 business days", price: 4.99, popular: false },
];

const PACKAGING = [
  { id: "own", label: "Own Packaging", price: 0 },
  { id: "envelope", label: "Express Envelope", price: 0.5 },
  { id: "box-s", label: "Small Box (30x20x15cm)", price: 1.2 },
  { id: "box-m", label: "Medium Box (40x30x20cm)", price: 2.0 },
  { id: "box-l", label: "Large Box (60x40x30cm)", price: 3.5 },
];

const INSURANCE = [
  { id: "none", label: "No Insurance", coverage: "Basic liability only", price: 0 },
  { id: "basic", label: "Basic Cover", coverage: "Up to $100", price: 1.5 },
  { id: "standard", label: "Standard Cover", coverage: "Up to $500", price: 4.99 },
  { id: "premium", label: "Premium Cover", coverage: "Up to $2,000", price: 12.99 },
];

const SAVED = [
  { id: 1, label: "Home", address: "15 Admiralty Way, Lekki Phase 1, Lagos" },
  { id: 2, label: "Office", address: "42 Marina, Lagos Island, Lagos" },
  { id: 3, label: "Warehouse", address: "Block C, Amuwo Odofin, Lagos" },
];

export default function QuickShipPage() {
  const [service, setService] = useState("express");
  const [packaging, setPackaging] = useState("own");
  const [insurance, setInsurance] = useState("none");
  const [senderExpanded, setSenderExpanded] = useState(true);
  const [recipientExpanded, setRecipientExpanded] = useState(true);
  const [showRecent, setShowRecent] = useState(false);
  const [form, setForm] = useState({
    senderName: "", senderPhone: "", senderAddress: "",
    recipientName: "", recipientPhone: "", recipientCity: "",
    recipientCountry: "NG", recipientAddress: "",
    weight: "", length: "", width: "", height: "",
    desc: "", declaredValue: "",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const svc = SERVICES.find((s) => s.id === service)!;
  const pkg = PACKAGING.find((p) => p.id === packaging)!;
  const ins = INSURANCE.find((i) => i.id === insurance)!;
  const total = svc.price + pkg.price + ins.price;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Quick Ship</h1>
          <p className="text-sm text-gray-500 mt-1">Get an instant quote and book your shipment in seconds.</p>
        </div>
        <button onClick={() => setShowRecent(!showRecent)} className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium text-[#0A1628] transition-colors">
          <Clock className="w-4 h-4" /> Recent
        </button>
      </div>

      {showRecent && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-3">Recent Recipients</h3>
          {[{ name: "Chukwuemeka O.", addr: "22 Wuse Zone 5, Abuja" }, { name: "Amina Bello", addr: "8 Allen Avenue, Ikeja, Lagos" }].map((r, i) => (
            <button key={i} onClick={() => { set("recipientName", r.name); set("recipientAddress", r.addr); setShowRecent(false); }} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors text-left mb-2">
              <div className="w-8 h-8 bg-[#0A1628] rounded-full flex items-center justify-center text-white text-xs font-bold">{r.name.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#0A1628]">{r.name}</p>
                <p className="text-xs text-gray-500 truncate">{r.addr}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Sender */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setSenderExpanded(!senderExpanded)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-600" /></div>
                <div className="text-left"><h3 className="text-sm font-semibold text-[#0A1628]">Sender Details</h3><p className="text-xs text-gray-500">Pickup address &amp; contact</p></div>
              </div>
              {senderExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {senderExpanded && (
              <div className="px-5 pb-5 space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SAVED.map((a) => <button key={a.id} onClick={() => set("senderAddress", a.address)} className="shrink-0 text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#FF6B00] hover:bg-orange-50 transition-colors">{a.label}</button>)}
                  <button className="shrink-0 text-xs border border-dashed border-gray-300 rounded-lg px-3 py-1.5 hover:border-[#FF6B00] transition-colors flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label><input type="text" value={form.senderName} onChange={(e) => set("senderName", e.target.value)} placeholder="John Doe" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Phone *</label><input type="tel" value={form.senderPhone} onChange={(e) => set("senderPhone", e.target.value)} placeholder="+234 801 234 5678" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]" /></div>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Pickup Address *</label><input type="text" value={form.senderAddress} onChange={(e) => set("senderAddress", e.target.value)} placeholder="15 Admiralty Way, Lekki, Lagos" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]" /></div>
              </div>
            )}
          </div>

          {/* Recipient */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setRecipientExpanded(!recipientExpanded)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-[#FF6B00]" /></div>
                <div className="text-left"><h3 className="text-sm font-semibold text-[#0A1628]">Recipient Details</h3><p className="text-xs text-gray-500">Delivery address &amp; contact</p></div>
              </div>
              {recipientExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {recipientExpanded && (
              <div className="px-5 pb-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label><input type="text" value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} placeholder="Chukwuemeka O." className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Phone *</label><input type="tel" value={form.recipientPhone} onChange={(e) => set("recipientPhone", e.target.value)} placeholder="+234 803 456 7890" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1.5">City *</label><input type="text" value={form.recipientCity} onChange={(e) => set("recipientCity", e.target.value)} placeholder="Abuja" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Country *</label><select value={form.recipientCountry} onChange={(e) => set("recipientCountry", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"><option value="NG">Nigeria</option><option value="GH">Ghana</option><option value="KE">Kenya</option><option value="ZA">South Africa</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="AE">UAE</option></select></div>
                </div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Delivery Address *</label><input type="text" value={form.recipientAddress} onChange={(e) => set("recipientAddress", e.target.value)} placeholder="22 Wuse Zone 5, Abuja" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]" /></div>
              </div>
            )}
          </div>

          {/* Package */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-purple-600" /></div>
              <div><h3 className="text-sm font-semibold text-[#0A1628]">Package Details</h3><p className="text-xs text-gray-500">Dimensions, weight, and contents</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5"><Weight className="w-3 h-3 inline mr-1" />Weight (kg)</label><input type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="2.5" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5"><Ruler className="w-3 h-3 inline mr-1" />Length (cm)</label><input type="number" value={form.length} onChange={(e) => set("length", e.target.value)} placeholder="30" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Width (cm)</label><input type="number" value={form.width} onChange={(e) => set("width", e.target.value)} placeholder="20" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Height (cm)</label><input type="number" value={form.height} onChange={(e) => set("height", e.target.value)} placeholder="15" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Contents Description *</label><input type="text" value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Electronics, clothing..." className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Declared Value ($)</label><input type="number" value={form.declaredValue} onChange={(e) => set("declaredValue", e.target.value)} placeholder="150.00" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" /></div>
            </div>
          </div>
        </div>

        {/* Right sidebar — Quote */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#0A1628]">Service Level</h3>
            {SERVICES.map((s) => (
              <button key={s.id} onClick={() => setService(s.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${service === s.id ? "border-[#FF6B00] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${service === s.id ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-500"}`}><Truck className="w-5 h-5" /></div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-[#0A1628]">{s.label}</span>{s.popular && <span className="text-[10px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full font-bold">POPULAR</span>}</div>
                  <span className="text-xs text-gray-500">{s.desc}</span>
                </div>
                <span className="text-sm font-bold text-[#0A1628]">${s.price.toFixed(2)}</span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#0A1628]">Packaging</h3>
            <select value={packaging} onChange={(e) => setPackaging(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30">
              {PACKAGING.map((p) => <option key={p.id} value={p.id}>{p.label} {p.price > 0 ? `(+${p.price.toFixed(2)})` : "(Free)"}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-[#0A1628]">Insurance</h3><Shield className="w-4 h-4 text-gray-400" /></div>
            <div className="space-y-2">
              {INSURANCE.map((i) => (
                <button key={i.id} onClick={() => setInsurance(i.id)} className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${insurance === i.id ? "border-[#FF6B00] bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div><span className="text-xs font-medium text-[#0A1628]">{i.label}</span><p className="text-[11px] text-gray-500">{i.coverage}</p></div>
                  <span className="text-xs font-bold text-[#0A1628]">{i.price ? `$${i.price.toFixed(2)}` : "Free"}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0A1628] rounded-xl p-5 text-white space-y-3">
            <h3 className="text-sm font-semibold">Quote Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/70">{svc.label} shipping</span><span>${svc.price.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-white/70">{pkg.label}</span><span>{pkg.price > 0 ? `$${pkg.price.toFixed(2)}` : "Free"}</span></div>
              {ins.price > 0 && <div className="flex justify-between"><span className="text-white/70">{ins.label}</span><span>${ins.price.toFixed(2)}</span></div>}
              <div className="border-t border-white/20 pt-2 flex justify-between text-base font-bold">
                <span>Estimated Total</span><span className="text-[#FF6B00]">${total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full bg-[#FF6B00] hover:bg-[#E56000] text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Book Shipment
            </button>
            <p className="text-[11px] text-white/40 text-center">Final price calculated at pickup</p>
          </div>
        </div>
      </div>
    </div>
  );
}
