"use client";

import { useState } from "react";
import { Building2, Upload, Save } from "lucide-react";

export default function CompanySettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Company Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your business details and branding</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#FF6B00] cursor-pointer transition-colors">
            <div className="text-center">
              <Upload className="w-5 h-5 text-gray-400 mx-auto" />
              <span className="text-[10px] text-gray-400 mt-1 block">Logo</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#0A1628]">Company Logo</h3>
            <p className="text-xs text-gray-500 mt-0.5">PNG, JPG or SVG. Max 2MB. Recommended 400×400px.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</label>
            <input type="text" defaultValue="Doe Business Ltd" className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trading Name</label>
            <input type="text" defaultValue="Doe Store" className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Address</label>
          <input type="text" defaultValue="123 Victoria Island, Lagos, Nigeria" className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tax ID / RC Number</label>
            <input type="text" defaultValue="RC12345678" className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">VAT Number</label>
            <input type="text" defaultValue="" placeholder="Optional" className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
            <input type="tel" defaultValue="+234 801 234 5678" className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Website</label>
            <input type="url" defaultValue="https://doestore.com" className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Category</label>
          <select className="w-full mt-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 bg-white">
            <option>E-commerce</option>
            <option>Retail</option>
            <option>Manufacturing</option>
            <option>Wholesale</option>
            <option>Services</option>
            <option>Other</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Changes saved successfully</span>}
        </div>
      </div>
    </div>
  );
}
