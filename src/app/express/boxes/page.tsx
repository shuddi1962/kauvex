"use client";

import { useState } from "react";
import { Package, Plus, Edit3, Trash2, Ruler } from "lucide-react";

const DEFAULT_BOXES = [
  { id: 1, name: "Small Parcel", l: 20, w: 15, h: 10, maxWeight: 2 },
  { id: 2, name: "Medium Box", l: 40, w: 30, h: 25, maxWeight: 10 },
  { id: 3, name: "Large Box", l: 60, w: 50, h: 40, maxWeight: 30 },
  { id: 4, name: "Document Envelope", l: 35, w: 25, h: 2, maxWeight: 0.5 },
  { id: 5, name: "Custom Box", l: 0, w: 0, h: 0, maxWeight: 0 },
];

export default function BoxesPage() {
  const [boxes, setBoxes] = useState(DEFAULT_BOXES);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Box Presets</h1>
          <p className="text-gray-500 mt-1">
            Save package dimensions for fast reuse at checkout
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Box
        </button>
      </div>

      {/* Box Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {boxes.map((box) => (
          <div
            key={box.id}
            className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-[#FF6B00] hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-sm text-[#0A1628]">{box.name}</h3>
            {box.l > 0 ? (
              <>
                <p className="text-xs text-gray-500 mt-1">
                  {box.l} × {box.w} × {box.h} cm
                </p>
                <p className="text-[11px] text-gray-400">Max {box.maxWeight} kg</p>
              </>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Custom dimensions</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Add New Box</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Small Parcel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Weight (kg)</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
              Save Box
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <Ruler className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-sm text-blue-800">Volumetric Weight</h3>
          <p className="text-xs text-blue-600 mt-1">
            Courier rates use the greater of actual weight or volumetric weight (L × W × H ÷ 5000).
            Accurate box dimensions ensure you&apos;re charged correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
