"use client";

import { useState } from "react";
import { BookOpen, Plus, ToggleLeft, ToggleRight, Edit3, Trash2, Copy, ArrowRight } from "lucide-react";

const RULES = [
  { id: 1, name: "Lagos → GIG Logistics", condition: "Destination = Lagos & Weight ≤ 5kg", action: "Assign GIG Logistics", priority: 1, enabled: true },
  { id: 2, name: "Express Priority Override", condition: "Service = Express & Value > ₦50,000", action: "Assign DHL Express", priority: 2, enabled: true },
  { id: 3, name: "Heavy Cargo Routing", condition: "Weight > 30kg", action: "Assign Haulage Partner", priority: 3, enabled: true },
  { id: 4, name: "International Default", condition: "Destination = International", action: "Assign FedEx International", priority: 4, enabled: false },
  { id: 5, name: "Free Shipping Threshold", condition: "Order Value > ₦100,000", action: "Apply Free Standard Shipping", priority: 5, enabled: true },
  { id: 6, name: "Weekend Surcharge", condition: "Pickup Day = Sat/Sun", action: "Add ₦500 Weekend Fee", priority: 6, enabled: false },
];

export default function ShippingRulesPage() {
  const [rules, setRules] = useState(RULES);

  const toggleRule = (id: number) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Shipping Rules</h1>
          <p className="text-gray-500 text-sm mt-1">Automate carrier selection and shipping logic</p>
        </div>
        <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Rules</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{rules.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active Rules</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{rules.filter((r) => r.enabled).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Disabled Rules</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{rules.filter((r) => !r.enabled).length}</p>
        </div>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className={`bg-white rounded-xl border p-5 transition-all ${rule.enabled ? "border-gray-200 hover:shadow-md" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white bg-[#0A1628] rounded-full w-6 h-6 flex items-center justify-center">{rule.priority}</span>
                  <h3 className="font-semibold text-[#0A1628]">{rule.name}</h3>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-9">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-mono">{rule.condition}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="text-xs bg-[#FF6B00]/10 text-[#FF6B00] px-2 py-1 rounded-lg font-mono font-medium">{rule.action}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleRule(rule.id)} className="p-1" title={rule.enabled ? "Disable" : "Enable"}>
                  {rule.enabled ? (
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-300" />
                  )}
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Duplicate">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Edit">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
