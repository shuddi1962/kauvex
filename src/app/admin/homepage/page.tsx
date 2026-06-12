"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Eye, EyeOff, Trash2, Save, ArrowUpDown, ChevronDown, ChevronUp, Sparkles, TrendingUp, Package, Store, Award, Star, Smartphone, MessageSquare, Zap, Clock, Percent, DollarSign, FileText, Globe, Megaphone } from "lucide-react";
import { insforge } from "@/lib/insforge";

const sectionTypes = [
  { value: "flash_deals", label: "Flash Deals", icon: Clock },
  { value: "trending", label: "Trending Products", icon: TrendingUp },
  { value: "featured", label: "Featured Products", icon: Star },
  { value: "ai_recommended", label: "AI Recommended", icon: Sparkles },
  { value: "new_arrivals", label: "New Arrivals", icon: Package },
  { value: "recently_viewed", label: "Recently Viewed", icon: Clock },
  { value: "best_sellers", label: "Best Sellers", icon: Award },
  { value: "featured_vendors", label: "Featured Vendors", icon: Store },
  { value: "featured_brands", label: "Featured Brands", icon: Award },
  { value: "product_collections", label: "Product Collections", icon: FileText },
  { value: "wholesale_deals", label: "Wholesale Deals", icon: DollarSign },
  { value: "clearance_deals", label: "Clearance Deals", icon: Percent },
  { value: "sponsored_products", label: "Sponsored Products", icon: Zap },
  { value: "sponsored_stores", label: "Sponsored Stores", icon: Store },
  { value: "country_promotions", label: "Country Promotions", icon: Globe },
  { value: "vendor_promotions", label: "Vendor Promotions", icon: Megaphone },
  { value: "limited_time_offers", label: "Limited Time Offers", icon: Clock },
  { value: "bundle_deals", label: "Bundle Deals", icon: Package },
  { value: "newsletter", label: "Newsletter", icon: MessageSquare },
  { value: "mobile_app_download", label: "Mobile App Download", icon: Smartphone },
  { value: "testimonials", label: "Testimonials", icon: MessageSquare },
  { value: "blog_posts", label: "Blog Posts", icon: FileText },
];

interface Section {
  id: string;
  section_type: string;
  title: string;
  subtitle: string | null;
  config: Record<string, any>;
  sort_order: number;
  is_visible: boolean;
}

export default function AdminHomepageBuilder() {
  const [sections, setSections] = useState<Section[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await insforge.database
        .from("homepage_sections")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setSections(data);
    })();
  }, []);

  const addSection = async (type: string) => {
    const template = sectionTypes.find((s) => s.value === type);
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.sort_order), -1);
    const newSection = {
      section_type: type,
      title: template?.label || type,
      subtitle: null,
      config: {},
      sort_order: maxOrder + 1,
      is_visible: true,
    };
    const { data, error } = await insforge.database.from("homepage_sections").insert([newSection]).select();
    if (!error && data) setSections((prev) => [...prev, ...data]);
  };

  const updateSection = async (id: string, updates: Partial<Section>) => {
    await insforge.database.from("homepage_sections").update(updates).eq("id", id);
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSection = async (id: string) => {
    await insforge.database.from("homepage_sections").delete().eq("id", id);
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    const reordered = updated.map((s, i) => ({ ...s, sort_order: i }));
    setSections(reordered);

    for (const s of reordered) {
      await insforge.database.from("homepage_sections").update({ sort_order: s.sort_order }).eq("id", s.id);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    for (const section of sections) {
      await insforge.database.from("homepage_sections").update({
        title: section.title,
        subtitle: section.subtitle,
        is_visible: section.is_visible,
        sort_order: section.sort_order,
      }).eq("id", section.id);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-lg text-text-1">Homepage Builder</h1>
          <p className="text-xs text-text-4">Drag to reorder sections, toggle visibility, and manage homepage content.</p>
        </div>
        <button onClick={saveAll} disabled={saving}
          className="flex items-center gap-1.5 bg-orange text-white text-xs font-bold h-9 px-4 rounded-lg hover:bg-orange/90 transition-colors disabled:opacity-50">
          <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Add Section */}
      <details className="mb-6 bg-white rounded-xl border border-border p-4">
        <summary className="text-sm font-semibold text-text-1 cursor-pointer flex items-center gap-2">
          <Plus size={16} className="text-orange" /> Add New Section
        </summary>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
          {sectionTypes.map((type) => {
            const Icon = type.icon;
            const isAdded = sections.some((s) => s.section_type === type.value);
            return (
              <button
                key={type.value}
                onClick={() => addSection(type.value)}
                disabled={isAdded}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-colors ${
                  isAdded
                    ? "border-green-200 bg-green-50 text-green-700 cursor-not-allowed"
                    : "border-border hover:border-orange hover:bg-orange-50 text-text-2"
                }`}
              >
                <Icon size={14} />
                {type.label}
                {isAdded && <span className="text-[9px] ml-auto">Added</span>}
              </button>
            );
          })}
        </div>
      </details>

      {/* Sections List */}
      <div className="space-y-2">
        {sections.map((section, index) => {
          const typeDef = sectionTypes.find((t) => t.value === section.section_type);
          const Icon = typeDef?.icon || Package;
          const isExpanded = expandedId === section.id;

          return (
            <div key={section.id} className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="cursor-grab text-text-4 hover:text-text-2">
                  <GripVertical size={16} />
                </div>

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  section.is_visible ? "bg-blue-50 text-blue" : "bg-gray-100 text-text-4"
                }`}>
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-1">{section.title}</span>
                    <span className="text-[9px] bg-gray-100 text-text-4 px-1.5 py-0.5 rounded font-mono">{section.section_type}</span>
                    {!section.is_visible && (
                      <span className="text-[9px] bg-red-50 text-red px-1.5 py-0.5 rounded">Hidden</span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-4">Order: {index + 1}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => moveSection(index, "up")} disabled={index === 0}
                    className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                    <ChevronUp size={14} className="text-text-4" />
                  </button>
                  <button onClick={() => moveSection(index, "down")} disabled={index === sections.length - 1}
                    className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                    <ChevronDown size={14} className="text-text-4" />
                  </button>
                  <button onClick={() => updateSection(section.id, { is_visible: !section.is_visible })}
                    className={`p-1.5 rounded-lg transition-colors ${section.is_visible ? "hover:bg-gray-100 text-text-4" : "bg-red-50 text-red"}`}>
                    {section.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => setExpandedId(isExpanded ? null : section.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowUpDown size={14} className="text-text-4" />
                  </button>
                  <button onClick={() => removeSection(section.id)}
                    className="p-1.5 hover:bg-red-50 text-text-4 hover:text-red rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
                  <div>
                    <label className="text-[10px] text-text-4 font-semibold uppercase">Title</label>
                    <input value={section.title} onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, title: e.target.value } : s))}
                      className="w-full h-9 px-3 text-xs border border-border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-4 font-semibold uppercase">Subtitle</label>
                    <input value={section.subtitle || ""} onChange={(e) => setSections((prev) => prev.map((s) => s.id === section.id ? { ...s, subtitle: e.target.value } : s))}
                      className="w-full h-9 px-3 text-xs border border-border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className="text-center py-12 text-text-4">
            <Package size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No sections configured yet. Add your first section above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
