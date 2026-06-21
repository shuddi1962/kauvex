"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import VendorShell from "@/components/vendor/vendor-shell";
import { insforge } from "@/lib/insforge";
import {
  Save, X, Loader2, Package, Image as ImageIcon, Upload, Star, Trash2,
  Edit, Eye, Plus, Info, Tag, Sliders, Shield, FileText, List, Grid3X3,
  ChevronDown, Sparkles, Globe, Check, AlertCircle, ArrowLeft,
} from "lucide-react";

const tabs = [
  { key: "vital", label: "Vital Info", icon: Info },
  { key: "variations", label: "Variations", icon: Grid3X3 },
  { key: "offer", label: "Offer", icon: Tag },
  { key: "compliance", label: "Compliance", icon: Shield },
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "description", label: "Description", icon: FileText },
  { key: "keywords", label: "Keywords", icon: List },
  { key: "details", label: "More Details", icon: Sliders },
];

const listingLanguages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "ar", label: "Arabic" },
];

const conditions = ["new", "like_new", "used_good", "refurbished"];
const fulfillmentTypes = ["merchant", "FBK"];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("vital");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const [form, setForm] = useState({
    name: "", sku: "", product_type: "simple", status: "draft",
    listing_language: "en",
    condition: "new",
    fulfillment_type: "merchant",
    regular_price: 0, sale_price: null as number | null, cost_price: null as number | null,
    stock_quantity: 0, manage_stock: false,
    description: "", short_description: "",
    bullets: [""],
    images: [] as string[],
    category_id: "", brand_id: "",
    tags: [] as string[], tagInput: "",
    keywords: [""],
    weight: null as number | null,
    length: "", width: "", height: "",
    hs_code: "", origin_country: "",
    warranty: "no_warranty",
    shipping_days: 5,
    variations: [] as any[],
    varName: "", varOptions: "", varPrice: "",
    amazon_id: "", ebay_id: "",
  });

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database.from("products").select("*").eq("id", params.id).single();
      if (error) throw error;
      if (data) {
        setForm(prev => ({
          ...prev,
          name: data.name || "",
          sku: data.sku || "",
          product_type: data.product_type || "simple",
          status: data.status || "draft",
          regular_price: data.regular_price || 0,
          sale_price: data.sale_price,
          cost_price: data.cost_price,
          stock_quantity: data.stock_quantity || 0,
          manage_stock: data.manage_stock || false,
          description: data.description || "",
          short_description: data.short_description || "",
          images: data.images || [],
          category_id: data.category_id || "",
          brand_id: data.brand_id || "",
          tags: data.tags || [],
          weight: data.weight,
          length: data.dimensions?.length?.toString() || "",
          width: data.dimensions?.width?.toString() || "",
          height: data.dimensions?.height?.toString() || "",
          variations: data.variations || [],
        }));
      }
    } catch (e: any) {
      showToast("error", e.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        product_type: form.product_type,
        status: form.status,
        regular_price: form.regular_price,
        sale_price: form.sale_price,
        cost_price: form.cost_price,
        stock_quantity: form.stock_quantity,
        manage_stock: form.manage_stock,
        description: form.description,
        short_description: form.short_description,
        images: form.images,
        category_id: form.category_id || null,
        brand_id: form.brand_id || null,
        tags: form.tags,
        weight: form.weight,
        dimensions: (form.length || form.width || form.height) ? {
          length: Number(form.length) || 0,
          width: Number(form.width) || 0,
          height: Number(form.height) || 0,
        } : null,
        variations: form.product_type === "variable" ? form.variations : null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await insforge.database.from("products").update(payload).eq("id", params.id);
      if (error) throw error;
      showToast("success", "Product updated successfully!");
    } catch (e: any) {
      showToast("error", e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addBullet = () => setForm(prev => ({ ...prev, bullets: [...prev.bullets, ""] }));
  const updateBullet = (i: number, v: string) => {
    const bullets = [...form.bullets];
    bullets[i] = v;
    setForm(prev => ({ ...prev, bullets }));
  };
  const removeBullet = (i: number) => setForm(prev => ({ ...prev, bullets: prev.bullets.filter((_, idx) => idx !== i) }));

  const addKeyword = () => setForm(prev => ({ ...prev, keywords: [...prev.keywords, ""] }));
  const updateKeyword = (i: number, v: string) => {
    const keywords = [...form.keywords];
    keywords[i] = v;
    setForm(prev => ({ ...prev, keywords }));
  };
  const removeKeyword = (i: number) => setForm(prev => ({ ...prev, keywords: prev.keywords.filter((_, idx) => idx !== i) }));

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await fileToBase64(files[i]);
        newImages.push(base64);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  };

  const removeImage = (index: number) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

  const setMainImage = (index: number) => {
    setForm(prev => {
      const newImages = [...prev.images];
      const [main] = newImages.splice(index, 1);
      return { ...prev, images: [main, ...newImages] };
    });
  };

  const addTag = () => {
    if (form.tagInput.trim() && !form.tags.includes(form.tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, prev.tagInput.trim()], tagInput: "" }));
    }
  };
  const removeTag = (tag: string) => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));

  const addVariation = () => {
    if (!form.varName.trim() || !form.varOptions.trim()) return;
    setForm(prev => ({
      ...prev,
      variations: [...prev.variations, {
        name: prev.varName.trim(), options: prev.varOptions.split(",").map(o => o.trim()).filter(Boolean),
        price_adjustment: Number(prev.varPrice) || 0,
      }],
      varName: "", varOptions: "", varPrice: "",
    }));
  };
  const removeVariation = (index: number) => setForm(prev => ({ ...prev, variations: prev.variations.filter((_, i) => i !== index) }));

  if (loading) {
    return (
      <VendorShell title="Edit Product" subtitle="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-orange" />
        </div>
      </VendorShell>
    );
  }

  const discountPercent = form.regular_price > 0 && form.sale_price ? Math.round(((form.regular_price - form.sale_price) / form.regular_price) * 100) : 0;

  return (
    <VendorShell title="Edit Product" subtitle={form.name || "Untitled"}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={form.listing_language} onChange={e => setForm(prev => ({ ...prev, listing_language: e.target.value }))}
              className="h-9 px-3 text-xs border border-border rounded-lg bg-white">
              {listingLanguages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <div className="flex gap-1">
              {["draft", "active", "inactive"].map(s => (
                <button key={s} onClick={() => setForm(prev => ({ ...prev, status: s }))}
                  className={`px-3 h-8 text-[10px] font-bold rounded-lg capitalize transition-colors ${
                    form.status === s
                      ? s === "active" ? "bg-green-600 text-white" : s === "inactive" ? "bg-gray-600 text-white" : "bg-gray-800 text-white"
                      : "bg-gray-100 text-text-4 hover:bg-gray-200"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/vendor/products" className="flex items-center gap-1.5 h-9 px-4 border border-border text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <ArrowLeft size={13} /> Back
            </Link>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 h-9 px-5 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-border p-1 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.key ? "bg-orange text-white shadow-sm" : "text-text-4 hover:bg-gray-100 hover:text-text-2"
                }`}>
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-xl border border-border p-6">
          {/* Vital Info */}
          {activeTab === "vital" && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="font-bold text-sm text-text-1">Vital Info</h3>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter product name"
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => setForm(prev => ({ ...prev, sku: e.target.value }))} placeholder="Unique SKU"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Product Type</label>
                  <select value={form.product_type} onChange={e => setForm(prev => ({ ...prev, product_type: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                    <option value="simple">Simple Product</option>
                    <option value="variable">Variable Product</option>
                    <option value="grouped">Grouped Product</option>
                    <option value="service">Service</option>
                    <option value="digital">Digital Product</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Short Description</label>
                <textarea value={form.short_description} onChange={e => setForm(prev => ({ ...prev, short_description: e.target.value }))}
                  rows={3} placeholder="Brief product description for search results" className="w-full px-3 py-2 text-sm border border-border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Category</label>
                <select value={form.category_id} onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                  <option value="">Select Category</option>
                  <option value="cat_1">Electronics {`>`} Marine GPS</option>
                  <option value="cat_2">Marine {`>`} Anchoring</option>
                  <option value="cat_3">Marine {`>`} Lighting</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Brand</label>
                <input value={form.brand_id} onChange={e => setForm(prev => ({ ...prev, brand_id: e.target.value }))} placeholder="Brand name"
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
              </div>
            </div>
          )}

          {/* Variations */}
          {activeTab === "variations" && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="font-bold text-sm text-text-1">Variations</h3>
              {form.product_type === "variable" ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <input value={form.varName} onChange={e => setForm(prev => ({ ...prev, varName: e.target.value }))} placeholder="Attribute (e.g. Color)"
                      className="h-10 px-3 text-sm border border-border rounded-lg" />
                    <input value={form.varOptions} onChange={e => setForm(prev => ({ ...prev, varOptions: e.target.value }))} placeholder="Options (comma separated)"
                      className="h-10 px-3 text-sm border border-border rounded-lg" />
                    <input value={form.varPrice} onChange={e => setForm(prev => ({ ...prev, varPrice: e.target.value }))} placeholder="Price adj. (₦)"
                      type="number" className="h-10 px-3 text-sm border border-border rounded-lg" />
                  </div>
                  <button onClick={addVariation} className="flex items-center gap-1.5 px-4 h-9 bg-gray-100 text-xs font-semibold rounded-lg hover:bg-gray-200">
                    <Plus size={13} /> Add Variation
                  </button>
                  {form.variations.length > 0 && (
                    <div className="space-y-2">
                      {form.variations.map((v, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-xs">
                          <span className="font-semibold text-text-1">{v.name}:</span>
                          <span className="text-text-4">{v.options.join(", ")}</span>
                          {v.price_adjustment !== 0 && <span className="text-green-700 font-semibold">₦{v.price_adjustment}</span>}
                          <button onClick={() => removeVariation(i)} className="ml-auto"><Trash2 size={12} className="text-red-500" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-text-4">Switch product type to &quot;Variable Product&quot; to add variations.</p>
              )}
            </div>
          )}

          {/* Offer */}
          {activeTab === "offer" && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="font-bold text-sm text-text-1">Offer</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Regular Price (₦) *</label>
                  <input type="number" value={form.regular_price || ""} onChange={e => setForm(prev => ({ ...prev, regular_price: Number(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Sale Price (₦)</label>
                  <input type="number" value={form.sale_price || ""} onChange={e => setForm(prev => ({ ...prev, sale_price: Number(e.target.value) || null }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Cost Price (₦)</label>
                  <input type="number" value={form.cost_price || ""} onChange={e => setForm(prev => ({ ...prev, cost_price: Number(e.target.value) || null }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
              </div>
              {discountPercent > 0 && <p className="text-xs text-green-700 font-semibold">Discount: {discountPercent}% off</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Condition</label>
                  <select value={form.condition} onChange={e => setForm(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                    {conditions.map(c => <option key={c} value={c}>{c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Fulfillment Type</label>
                  <select value={form.fulfillment_type} onChange={e => setForm(prev => ({ ...prev, fulfillment_type: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                    {fulfillmentTypes.map(f => <option key={f} value={f}>{f === "merchant" ? "Merchant Fulfilled" : "FBK (Kauvex Fulfilled)"}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Warranty</label>
                  <select value={form.warranty} onChange={e => setForm(prev => ({ ...prev, warranty: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                    <option value="no_warranty">No Warranty</option>
                    <option value="3_months">3 Months</option>
                    <option value="6_months">6 Months</option>
                    <option value="1_year">1 Year</option>
                    <option value="2_years">2 Years</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Shipping (business days)</label>
                  <input type="number" value={form.shipping_days} onChange={e => setForm(prev => ({ ...prev, shipping_days: Number(e.target.value) || 5 }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.manage_stock} onChange={e => setForm(prev => ({ ...prev, manage_stock: e.target.checked }))} className="rounded" />
                <span className="text-xs font-semibold text-text-2">Manage stock</span>
              </label>
              {form.manage_stock && (
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Stock Quantity</label>
                  <input type="number" value={form.stock_quantity || ""} onChange={e => setForm(prev => ({ ...prev, stock_quantity: Number(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
              )}
            </div>
          )}

          {/* Compliance */}
          {activeTab === "compliance" && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="font-bold text-sm text-text-1">Compliance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">HS Code (Harmonized System)</label>
                  <input value={form.hs_code} onChange={e => setForm(prev => ({ ...prev, hs_code: e.target.value }))} placeholder="e.g. 8471.30"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Country of Origin</label>
                  <select value={form.origin_country} onChange={e => setForm(prev => ({ ...prev, origin_country: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                    <option value="">Select Country</option>
                    <option value="CN">China</option>
                    <option value="US">United States</option>
                    <option value="DE">Germany</option>
                    <option value="NG">Nigeria</option>
                    <option value="JP">Japan</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={15} className="text-amber shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">Accurate HS codes help with customs clearance and tax calculation. Incorrect codes may result in shipping delays.</p>
              </div>
            </div>
          )}

          {/* Images */}
          {activeTab === "images" && (
            <div className="space-y-5">
              <h3 className="font-bold text-sm text-text-1">Images</h3>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 px-5 h-10 border border-border rounded-xl text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload size={15} /> Upload Images
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              {form.images.length > 0 ? (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group border border-border rounded-xl overflow-hidden">
                      <img src={img} alt="" className="w-full h-24 object-cover" />
                      {i === 0 && <span className="absolute top-1.5 left-1.5 bg-orange text-white text-[8px] px-1.5 py-0.5 rounded font-bold">MAIN</span>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {i > 0 && <button onClick={() => setMainImage(i)} className="p-1.5 bg-white/80 rounded-lg" title="Set as main"><Star size={12} /></button>}
                        <button onClick={() => removeImage(i)} className="p-1.5 bg-white/80 rounded-lg" title="Remove"><Trash2 size={12} className="text-red-600" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                  <ImageIcon size={32} className="mx-auto text-text-4 mb-2" />
                  <p className="text-sm text-text-4">No images yet. Upload product images above.</p>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {activeTab === "description" && (
            <div className="space-y-5 max-w-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-text-1">Description</h3>
                <button className="flex items-center gap-1.5 px-3 h-8 bg-gradient-to-r from-orange to-amber text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity">
                  <Sparkles size={12} /> AI Rewrite
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Full Description</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={8} placeholder="Detailed product description. Include features, benefits, specifications..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-text-2">Key Features / Bullet Points</label>
                  <button onClick={addBullet} className="flex items-center gap-1 text-[10px] font-semibold text-orange hover:underline">
                    <Plus size={11} /> Add Bullet
                  </button>
                </div>
                <div className="space-y-2">
                  {form.bullets.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={b} onChange={e => updateBullet(i, e.target.value)} placeholder={`Bullet point ${i + 1}`}
                        className="flex-1 h-10 px-3 text-sm border border-border rounded-lg" />
                      <button onClick={() => removeBullet(i)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={13} className="text-text-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Keywords */}
          {activeTab === "keywords" && (
            <div className="space-y-5 max-w-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-text-1">Keywords & Search Terms</h3>
                <button className="flex items-center gap-1.5 px-3 h-8 bg-gradient-to-r from-orange to-amber text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity">
                  <Sparkles size={12} /> AI Suggest
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 block mb-1">Tags</label>
                <div className="flex gap-2">
                  <input value={form.tagInput} onChange={e => setForm(prev => ({ ...prev, tagInput: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Type and press Enter to add tags"
                    className="flex-1 h-10 px-3 text-sm border border-border rounded-lg" />
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-[10px] rounded-lg font-medium">
                        {tag} <button onClick={() => removeTag(tag)}><X size={10} className="text-text-4" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-text-2">Search Terms</label>
                  <button onClick={addKeyword} className="flex items-center gap-1 text-[10px] font-semibold text-orange hover:underline">
                    <Plus size={11} /> Add Keyword
                  </button>
                </div>
                <div className="space-y-2">
                  {form.keywords.map((kw, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={kw} onChange={e => updateKeyword(i, e.target.value)} placeholder="Enter search term"
                        className="flex-1 h-10 px-3 text-sm border border-border rounded-lg" />
                      <button onClick={() => removeKeyword(i)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={13} className="text-text-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* More Details */}
          {activeTab === "details" && (
            <div className="space-y-5 max-w-2xl">
              <h3 className="font-bold text-sm text-text-1">More Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Weight (kg)</label>
                  <input type="number" value={form.weight || ""} onChange={e => setForm(prev => ({ ...prev, weight: Number(e.target.value) || null }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Length (cm)</label>
                  <input value={form.length} onChange={e => setForm(prev => ({ ...prev, length: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Width (cm)</label>
                  <input value={form.width} onChange={e => setForm(prev => ({ ...prev, width: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-2 block mb-1">Height (cm)</label>
                  <input value={form.height} onChange={e => setForm(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
                </div>
              </div>
              <div className="border-t border-border pt-5">
                <h4 className="text-xs font-semibold text-text-2 mb-3">External IDs</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-2 block mb-1">Amazon ASIN (if applicable)</label>
                    <input value={form.amazon_id} onChange={e => setForm(prev => ({ ...prev, amazon_id: e.target.value }))} placeholder="B0XXXXXXXXX"
                      className="w-full h-10 px-3 border border-border rounded-lg text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text-2 block mb-1">eBay Item ID (if applicable)</label>
                    <input value={form.ebay_id} onChange={e => setForm(prev => ({ ...prev, ebay_id: e.target.value }))} placeholder="eBay item ID"
                      className="w-full h-10 px-3 border border-border rounded-lg text-sm font-mono" />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-border rounded-xl p-4">
                <h4 className="text-xs font-semibold text-text-2 mb-2">Product Dimensions Summary</h4>
                {form.length || form.width || form.height ? (
                  <p className="text-sm text-text-1">{form.length || 0} × {form.width || 0} × {form.height || 0} cm · {form.weight || "N/A"} kg</p>
                ) : (
                  <p className="text-xs text-text-4">No dimensions set</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </VendorShell>
  );
}
