"use client";

import { useState } from "react";
import {
  Zap,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  ArrowRight,
  Package,
  Globe,
  Shield,
  Truck,
} from "lucide-react";

const DEMO_RULES = [
  {
    id: 1,
    name: "Express anything under 2 kg to Lagos",
    condition: "If weight ≤ 2 kg AND destination = Lagos",
    action: "Use Kauvex Priority",
    active: true,
    icon: Zap,
  },
  {
    id: 2,
    name: "Always use DHL for international orders over ₦50,000",
    condition: "If country ≠ Nigeria AND value > ₦50,000",
    action: "Courier = DHL Express",
    active: true,
    icon: Globe,
  },
  {
    id: 3,
    name: "Auto-insure items over ₦100,000",
    condition: "If declared value > ₦100,000",
    action: "Add Comprehensive insurance",
    active: true,
    icon: Shield,
  },
  {
    id: 4,
    name: "Economy for heavy parcels to Abuja",
    condition: "If weight > 10 kg AND destination = Abuja",
    action: "Use Economy service",
    active: false,
    icon: Package,
  },
  {
    id: 5,
    name: "Fragile items get special handling",
    condition: "If item contains 'glass', 'ceramic', or 'fragile'",
    action: "Add fragile packaging + insurance",
    active: true,
    icon: Shield,
  },
];

export default function AutomationPage() {
  const [rules, setRules] = useState(DEMO_RULES);

  const toggleRule = (id: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Shipping Automation</h1>
          <p className="text-gray-500 mt-1">
            Set conditions and Kauvex automatically assigns the right courier, rate, and label
          </p>
        </div>
        <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Create Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Rules", value: rules.filter((r) => r.active).length.toString(), color: "text-green-600" },
          { label: "Shipments Automated", value: "1,247", color: "text-[#0A1628]" },
          { label: "Avg Savings/Ship", value: "₦820", color: "text-[#FF6B00]" },
          { label: "Time Saved", value: "34 hrs", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Rules List */}
      <section>
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Your Rules</h2>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-white border rounded-xl p-5 flex items-center gap-4 transition-all ${
                rule.active ? "border-gray-200" : "border-gray-200 opacity-60"
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                <rule.icon className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-[#0A1628]">{rule.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium">IF</span> {rule.condition} →{" "}
                  <span className="font-medium">THEN</span> {rule.action}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    rule.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {rule.active ? "Active" : "Paused"}
                </span>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    rule.active
                      ? "bg-green-50 text-green-600 hover:bg-green-100"
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {rule.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <button className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Templates */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Quick Rule Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Auto-select cheapest courier",
              desc: "Always pick the lowest rate from available carriers",
              icon: Package,
            },
            {
              title: "Express for high-value",
              desc: "Auto-upgrade to Express for orders over ₦200,000",
              icon: Zap,
            },
            {
              title: "Insurance threshold",
              desc: "Auto-add insurance for items over a set value",
              icon: Shield,
            },
          ].map((t) => (
            <div
              key={t.title}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#FF6B00] transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center mb-3">
                <t.icon className="w-4.5 h-4.5 text-[#FF6B00]" />
              </div>
              <h3 className="font-semibold text-sm text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">
                {t.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
              <button className="flex items-center gap-1 mt-3 text-xs font-medium text-[#FF6B00] opacity-0 group-hover:opacity-100 transition-opacity">
                Use template <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
