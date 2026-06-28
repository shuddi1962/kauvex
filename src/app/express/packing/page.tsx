"use client";

import { useState } from "react";
import { FileText, Printer, Download, Package } from "lucide-react";

const DEMO_LABELS = [
  { waybill: "KVX-EXP-82941", courier: "DHL Express", status: "ready" },
  { waybill: "KVX-EXP-82940", courier: "Kauvex Express", status: "ready" },
  { waybill: "KVX-EXP-82939", courier: "FedEx Intl", status: "printed" },
];

export default function PackingPage() {
  const [orderRef, setOrderRef] = useState("");
  const [waybill, setWaybill] = useState("");
  const [items, setItems] = useState("");
  const [format, setFormat] = useState("a4");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Packing & Labels</h1>
        <p className="text-gray-500 mt-1">
          Generate packing slips and print shipping labels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packing Slip Generator */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-lg font-semibold text-[#0A1628]">Packing Slip Generator</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Reference
                </label>
                <input
                  type="text"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  placeholder="ORD-XXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipment Waybill
                </label>
                <input
                  type="text"
                  value={waybill}
                  onChange={(e) => setWaybill(e.target.value)}
                  placeholder="KVX-XXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items (one per line)
              </label>
              <textarea
                value={items}
                onChange={(e) => setItems(e.target.value)}
                placeholder={"Item name · Qty · Weight\niPhone 15 Pro · 1 · 0.22 kg\nPhone case · 2 · 0.05 kg"}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none resize-none font-mono"
              />
            </div>
            <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors w-full">
              Generate Packing Slip
            </button>
          </div>
        </div>

        {/* Label Printing */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Printer className="w-5 h-5 text-[#FF6B00]" />
            <h2 className="text-lg font-semibold text-[#0A1628]">Label Printing</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Download or print labels directly. Compatible with thermal, A4, and A6 printers.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-700">Format:</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
            >
              <option value="a4">A4 PDF</option>
              <option value="thermal">Thermal 4×6&quot;</option>
              <option value="a6">A6</option>
            </select>
          </div>

          <div className="space-y-2">
            {DEMO_LABELS.map((label) => (
              <div
                key={label.waybill}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-[#0A1628]">{label.waybill}</p>
                  <p className="text-xs text-gray-500">{label.courier}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-[#FF6B00] text-white hover:bg-[#e55f00] transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
