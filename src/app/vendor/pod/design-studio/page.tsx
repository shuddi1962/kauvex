"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Type, Image, Shapes, Layers, Wand2, Save, Eye, Undo2, Redo2, ZoomIn, ZoomOut } from "lucide-react";

export default function DesignStudioPage() {
  const [activeTool, setActiveTool] = useState<string>("text");

  const tools = [
    { id: "text", label: "Text", icon: Type },
    { id: "image", label: "Images", icon: Image },
    { id: "shapes", label: "Shapes", icon: Shapes },
    { id: "ai", label: "AI Generate", icon: Wand2 },
    { id: "layers", label: "Layers", icon: Layers },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-[#0A1628]">Design Studio</h1>
          <span className="text-xs text-gray-400">Untitled Design</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Undo2 size={16} /></button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Redo2 size={16} /></button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ZoomOut size={16} /></button>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ZoomIn size={16} /></button>
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <Button variant="outline" size="sm"><Eye size={14} className="mr-1" /> Preview</Button>
          <Button size="sm" className="bg-[#FF6B00] hover:bg-[#e86000]"><Save size={14} className="mr-1" /> Save</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-2 gap-1">
          {tools.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTool(t.id)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${activeTool === t.id ? 'bg-[#FF6B00] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title={t.label}>
                <Icon size={18} />
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex items-center justify-center bg-gray-200 p-8">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg aspect-square flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <p className="text-gray-400 text-sm">T-Shirt Canvas</p>
            </div>
            <div className="absolute bottom-3 left-3 bg-white/90 text-xs px-2 py-1 rounded text-gray-500">
              Printable Area: 12 x 14 inches
            </div>
          </div>
        </div>

        <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          {activeTool === "text" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-[#0A1628]">Text Tool</h3>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Font</label>
                <select className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm">
                  <option>Inter</option><option>Playfair Display</option><option>Roboto</option>
                  <option>Montserrat</option><option>Pacifico</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Text</label>
                <textarea rows={3} placeholder="Enter your text..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Size</label>
                  <input type="number" defaultValue={24} className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Color</label>
                  <input type="color" defaultValue="#000000" className="w-full h-9 rounded-lg border border-gray-200" />
                </div>
              </div>
              <div className="flex gap-2">
                {["B", "I", "U"].map(f => (
                  <button key={f} className="w-8 h-8 rounded border border-gray-200 text-sm font-bold hover:bg-gray-50">{f}</button>
                ))}
              </div>
              <Button className="w-full bg-[#FF6B00] hover:bg-[#e86000]" size="sm">Add Text</Button>
            </div>
          )}

          {activeTool === "image" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-[#0A1628]">Image Tool</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#FF6B00] cursor-pointer">
                <Image size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Upload PNG, SVG, or JPG</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium">AI Generate Image</p>
                <input placeholder="Describe the image you want..." className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm" />
                <Button size="sm" variant="outline" className="w-full"><Wand2 size={14} className="mr-1" /> Generate</Button>
              </div>
            </div>
          )}

          {activeTool === "ai" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-[#0A1628]">AI Design Assistant</h3>
              <p className="text-xs text-gray-500">Describe your design idea and AI will generate it for you.</p>
              <textarea rows={4} placeholder="e.g. A minimalist geometric pattern in navy and orange for a premium t-shirt..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              <select className="w-full h-9 px-2 rounded-lg border border-gray-200 text-sm">
                <option>Modern & Minimal</option><option>Bold & Vibrant</option>
                <option>Elegant & Premium</option><option>Playful & Fun</option>
              </select>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm"><Wand2 size={14} className="mr-1" /> Generate Design</Button>
            </div>
          )}

          {activeTool === "layers" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-[#0A1628]">Layers</h3>
              <p className="text-xs text-gray-400">No layers yet. Add text, images, or shapes to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
