"use client";

import { useState } from "react";
import { Image, FileText, Layout, Monitor, Smartphone, CheckCircle, X, Plus, Eye, Edit3, Trash2, GripVertical, AlertCircle } from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const moduleTypes = [
  { id: "image_text", label: "Image + Text", icon: Image, desc: "Side-by-side image and descriptive text" },
  { id: "comparison_chart", label: "Comparison Chart", icon: FileText, desc: "Compare product features in a table" },
  { id: "image_carousel", label: "Image Carousel", icon: Layout, desc: "Scrollable product images" },
  { id: "brand_story", label: "Brand Story Banner", icon: Layout, desc: "Full-width brand narrative" },
  { id: "video_text", label: "Video + Text", icon: Layout, desc: "Embedded video with supporting text" },
  { id: "four_grid", label: "Four Image Grid", icon: Image, desc: "Grid of 4 product images" },
  { id: "qa_module", label: "Q&A Module", icon: FileText, desc: "Expandable FAQ section" },
];

const demoContent = [
  { id: "A+001", name: "NavPro Marine GPS - Enhanced", status: "published", product: "Marine GPS Navigator", updated: "2026-06-10", modules: 4 },
  { id: "A+002", name: "Yacht Anchor Pro Story", status: "draft", product: "Yacht Anchor Chain 20mm", updated: "2026-06-14", modules: 2 },
  { id: "A+003", name: "LED Lights Comparison", status: "pending_review", product: "LED Navigation Lights", updated: "2026-06-16", modules: 3 },
  { id: "A+004", name: "VHF Radio Brand Banner", status: "published", product: "Marine VHF Radio", updated: "2026-06-08", modules: 5 },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-text-4",
  pending_review: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
};

const demoProducts = [
  "Marine GPS Navigator",
  "Yacht Anchor Chain 20mm",
  "LED Navigation Lights (Set)",
  "Marine VHF Radio",
  "Boat Cover Heavy Duty",
];

export default function APlusContentPage() {
  const [tab, setTab] = useState<"builder" | "manage">("manage");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <VendorShell title="A+ Content Manager" subtitle="Create enhanced brand content for your product pages">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowPreview(false)}>
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-text-1">Preview</h3>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button onClick={() => setPreviewMode("desktop")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${previewMode === "desktop" ? "bg-white shadow-sm text-text-1" : "text-text-4"}`}>
                      <Monitor size={14} className="inline mr-1" /> Desktop
                    </button>
                    <button onClick={() => setPreviewMode("mobile")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${previewMode === "mobile" ? "bg-white shadow-sm text-text-1" : "text-text-4"}`}>
                      <Smartphone size={14} className="inline mr-1" /> Mobile
                    </button>
                  </div>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
              </div>
              <div className={`p-6 ${previewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
                {selectedModules.length === 0 ? (
                  <div className="text-center py-12 text-text-4 text-sm">No modules selected. Add modules in the builder.</div>
                ) : (
                  <div className="space-y-4">
                    {selectedModules.map((mid) => {
                      const mt = moduleTypes.find((m) => m.id === mid);
                      if (!mt) return null;
                      const Icon = mt.icon;
                      return (
                        <div key={mid} className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
                          <div className="flex items-center gap-2 mb-3 text-text-4">
                            <Icon size={16} />
                            <span className="text-xs font-semibold uppercase tracking-wider">{mt.label}</span>
                          </div>
                          <div className="h-32 bg-white rounded-lg border border-border flex items-center justify-center">
                            <p className="text-xs text-text-4">{mt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button onClick={() => setTab("manage")} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === "manage" ? "bg-orange text-white" : "bg-white border border-border text-text-3 hover:border-orange"}`}>
            <FileText size={14} className="inline mr-1.5" /> My Content
          </button>
          <button onClick={() => setTab("builder")} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === "builder" ? "bg-orange text-white" : "bg-white border border-border text-text-3 hover:border-orange"}`}>
            <Layout size={14} className="inline mr-1.5" /> Module Builder
          </button>
        </div>

        {/* Manage Tab */}
        {tab === "manage" && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-4">{demoContent.length} A+ content pages</p>
              <button onClick={() => { setTab("builder"); showToast("Switched to Module Builder", "success"); }} className="px-4 py-2 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 flex items-center gap-1.5">
                <Plus size={14} /> Create New
              </button>
            </div>
            <div className="bg-white rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50 text-left">
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Modules</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Updated</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[10px] font-semibold text-text-4 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {demoContent.map((c) => (
                    <tr key={c.id} className="border-b border-border hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-text-1">{c.name}</p>
                        <p className="text-[10px] text-text-4 font-mono">{c.id}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-2">{c.product}</td>
                      <td className="px-4 py-3 text-xs text-text-2">{c.modules} modules</td>
                      <td className="px-4 py-3 text-xs text-text-4">{new Date(c.updated).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>{c.status.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Edit"><Edit3 size={14} className="text-text-4" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Preview"><Eye size={14} className="text-text-4" /></button>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Delete"><Trash2 size={14} className="text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Builder Tab */}
        {tab === "builder" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Module Palette */}
            <div className="bg-white rounded-xl border border-border p-5 lg:col-span-1">
              <h3 className="font-bold text-sm text-text-1 mb-3 flex items-center gap-2">
                <Plus size={15} className="text-orange" /> Module Types
              </h3>
              <div className="space-y-2">
                {moduleTypes.map((mt) => {
                  const Icon = mt.icon;
                  const selected = selectedModules.includes(mt.id);
                  return (
                    <button
                      key={mt.id}
                      onClick={() => toggleModule(mt.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        selected ? "border-orange bg-orange-50" : "border-border hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? "bg-orange text-white" : "bg-gray-100 text-text-4"}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-1">{mt.label}</p>
                        <p className="text-[9px] text-text-4">{mt.desc}</p>
                      </div>
                      {selected && <CheckCircle size={14} className="text-orange shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Canvas / Product Assignment */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-border p-5">
                <h3 className="font-bold text-sm text-text-1 mb-3">Attach to Product</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-2 mb-1.5">Select Product *</label>
                    <select className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                      <option value="">Choose a product...</option>
                      {demoProducts.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-2 mb-1.5">Content Name *</label>
                    <input className="w-full px-3 py-2.5 border border-border rounded-lg text-sm" placeholder="e.g. Brand Story - Product Name" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-text-1">Content Canvas</h3>
                  <span className="text-xs text-text-4">{selectedModules.length} modules selected</span>
                </div>

                {selectedModules.length === 0 ? (
                  <div className="py-12 text-center">
                    <Layout size={36} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-text-4">Select modules from the left panel to build your content</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedModules.map((mid, idx) => {
                      const mt = moduleTypes.find((m) => m.id === mid);
                      const Icon = mt?.icon || Layout;
                      return (
                        <div key={mid} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                          <GripVertical size={14} className="text-text-4 cursor-grab" />
                          <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center">
                            <Icon size={14} className="text-text-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-text-1">{mt?.label}</p>
                            <p className="text-[9px] text-text-4">{mt?.desc}</p>
                          </div>
                          <button onClick={() => setSelectedModules((prev) => prev.filter((m) => m !== mid))} className="p-1 hover:bg-gray-200 rounded">
                            <X size={12} className="text-text-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedModules.length > 0 && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                    <button onClick={() => setShowPreview(true)} className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-text-2 hover:bg-gray-50 flex items-center gap-1.5">
                      <Eye size={14} /> Preview
                    </button>
                    <button onClick={() => showToast("A+ Content saved as draft", "success")} className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-text-2 hover:bg-gray-50">
                      Save Draft
                    </button>
                    <button onClick={() => showToast("A+ Content submitted for review", "success")} className="px-6 py-2 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 flex items-center gap-1.5">
                      <CheckCircle size={14} /> Submit for Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorShell>
  );
}
