"use client";

import { useState } from "react";
import { Printer, Wifi, WifiOff, Settings, CheckCircle2, Plus, Trash2 } from "lucide-react";

const PRINTERS = [
  { id: 1, name: "Zebra ZD421", type: "Thermal 4×6", connection: "USB", status: "online", default: true },
  { id: 2, name: "DYMO LabelWriter 450", type: "Thermal 4×2", connection: "USB", status: "online", default: false },
  { id: 3, name: "HP LaserJet Pro", type: "A4 Laser", connection: "WiFi", status: "offline", default: false },
];

export default function PrintingPage() {
  const [printers, setPrinters] = useState(PRINTERS);
  const [autoPrint, setAutoPrint] = useState(true);
  const [printFormat, setPrintFormat] = useState("4x6");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0A1628]">Printing</h1>
        <p className="text-gray-500 text-sm mt-1">Configure label printers and printing preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A1628]">Connected Printers</h2>
              <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add Printer
              </button>
            </div>
            <div className="space-y-3">
              {printers.map((printer) => (
                <div key={printer.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all ${printer.default ? "border-[#FF6B00]/30 bg-[#FF6B00]/5" : "border-gray-100 hover:bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${printer.status === "online" ? "bg-green-100" : "bg-gray-100"}`}>
                      <Printer className={`w-5 h-5 ${printer.status === "online" ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0A1628]">{printer.name}</span>
                        {printer.default && <span className="text-[10px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full font-medium">DEFAULT</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{printer.type}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{printer.connection}</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className={`text-xs font-medium ${printer.status === "online" ? "text-green-600" : "text-gray-400"}`}>
                          {printer.status === "online" ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!printer.default && (
                      <button className="text-xs text-[#FF6B00] hover:text-[#e55f00] font-medium px-2 py-1 rounded-lg hover:bg-[#FF6B00]/5">Set Default</button>
                    )}
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Settings">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-[#0A1628] mb-4">Print Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Label Format</label>
                <div className="flex gap-2 mt-2">
                  {["4x6", "4x2", "A4"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setPrintFormat(fmt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${printFormat === fmt ? "bg-[#0A1628] text-white border-[#0A1628]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0A1628]">Auto-Print Labels</p>
                  <p className="text-xs text-gray-500 mt-0.5">Print when shipment is created</p>
                </div>
                <button onClick={() => setAutoPrint(!autoPrint)} className="p-1">
                  {autoPrint ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-300" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0A1628]">Batch Printing</p>
                  <p className="text-xs text-gray-500 mt-0.5">Queue multiple labels</p>
                </div>
                <button className="p-1">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-[#0A1628] mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Print Test Label</button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Download Label Template</button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Calibrate Printer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
