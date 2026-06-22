"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { insforge } from "@/lib/insforge";
import { Search, Plus, Upload, Package, X, ChevronRight, AlertCircle, Check, Loader2, CheckCircle, ShoppingCart, ChevronLeft, ChevronLast, Filter } from "lucide-react";

interface CatalogProduct {
  id: string;
  title: string;
  description?: string | null;
  brand: string | null;
  category_id: string | null;
  images: string[];
  is_active: boolean;
  seller_count: number;
  sku?: string;
  upc?: string;
  ean?: string;
}

interface Category {
  id: string;
  name: string;
}

interface RestrictedGate {
  category_id: string | null;
  brand_id: string | null;
  category_name: string | null;
  brand_name: string | null;
  requires_approval: boolean;
}

const DEMO_PRODUCTS: CatalogProduct[] = [
  { id: "demo-001", title: "Hikvision 4MP IP Dome Camera DS-2CD2143G2-I", brand: "Hikvision", category_id: "cat-surveillance", images: [], seller_count: 4, is_active: true, sku: "HIK-4MP-DOME-01", upc: "846352000128", ean: "5901234567890" },
  { id: "demo-002", title: "Dahua 8MP IR Bullet Network Camera", brand: "Dahua", category_id: "cat-surveillance", images: [], seller_count: 3, is_active: true, sku: "DAH-8MP-BULL-01", upc: "732628000233", ean: "5901234567891" },
  { id: "demo-003", title: "Bosch Fire Alarm Control Panel FPA-5000", brand: "Bosch", category_id: "cat-fire", images: [], seller_count: 2, is_active: true, sku: "BOS-FPA5000-01", upc: "720754000449", ean: "5901234567893" },
  { id: "demo-004", title: "Honeywell Addressable Smoke Detector", brand: "Honeywell", category_id: "cat-fire", images: [], seller_count: 5, is_active: true, sku: "HON-ADRSMK-01", upc: "562216000551", ean: "5901234567894" },
  { id: "demo-005", title: "ZKTeco Biometric Access Control F18", brand: "ZKTeco", category_id: "cat-access", images: [], seller_count: 3, is_active: true, sku: "ZKT-F18-ACCESS-01", upc: "693104000662", ean: "5901234567895" },
  { id: "demo-006", title: "Yamaha 4-Stroke Outboard F25", brand: "Yamaha", category_id: "cat-marine", images: [], seller_count: 1, is_active: true, sku: "YAM-F25-4STR-01", upc: "789452000773", ean: "5901234567897" },
  { id: "demo-007", title: "TP-Link WiFi 6 Router Archer AX73", brand: "TP-Link", category_id: "cat-networking", images: [], seller_count: 6, is_active: true, sku: "TPL-AX73-WIFI6-01", upc: "693536405110", ean: "5901234567800" },
  { id: "demo-008", title: "Cisco Catalyst 2960X Switch 48-Port", brand: "Cisco", category_id: "cat-networking", images: [], seller_count: 2, is_active: true, sku: "CIS-2960X-48P-01", upc: "887658000115", ean: "5901234567801" },
  { id: "demo-009", title: "Marine GPS Navigator Garmin", brand: "Mercury", category_id: "cat-marine", images: [], seller_count: 3, is_active: true, sku: "MAR-GPS-GARMIN-01", upc: "753759000226", ean: "5901234567802" },
  { id: "demo-010", title: "Solar Panel 450W Monocrystalline", brand: "Caterpillar", category_id: "cat-solar", images: [], seller_count: 2, is_active: true, sku: "SOL-450W-MONO-01", upc: "842167000771", ean: "5901234567807" },
  { id: "demo-011", title: "UPS APC Smart-UPS 1500VA", brand: "Caterpillar", category_id: "cat-ups", images: [], seller_count: 4, is_active: true, sku: "APC-SUPS-1500VA-01", upc: "731304000882", ean: "5901234567808" },
  { id: "demo-012", title: "Honeywell Safety Goggles Professional", brand: "Honeywell", category_id: "cat-safety", images: [], seller_count: 8, is_active: true, sku: "HON-SAFEGOG-01", upc: "625814000993", ean: "5901234567809" },
];

const DEMO_CATEGORIES: Category[] = [
  { id: "cat-surveillance", name: "Surveillance & CCTV" },
  { id: "cat-fire", name: "Fire Alarm Systems" },
  { id: "cat-access", name: "Access Control" },
  { id: "cat-solar", name: "Solar & Power" },
  { id: "cat-networking", name: "Networking" },
  { id: "cat-marine", name: "Marine Accessories" },
  { id: "cat-safety", name: "Safety Equipment" },
  { id: "cat-ups", name: "UPS & Inverters" },
];

const DEMO_BRANDS = ["Hikvision", "Dahua", "Bosch", "Honeywell", "ZKTeco", "Yamaha", "Mercury", "TP-Link", "Cisco", "Caterpillar", "Axis"];

interface SellModalProps {
  product: CatalogProduct | null;
  onClose: () => void;
  onSuccess: () => void;
}

function SellModal({ product, onClose, onSuccess }: SellModalProps) {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState("new");
  const [fulfillment, setFulfillment] = useState("merchant");
  const [shippingDays, setShippingDays] = useState("5");
  const [warranty, setWarranty] = useState("no_warranty");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!product) return null;

  const handleSubmit = async () => {
    if (!price || parseFloat(price) <= 0) { setError("Enter a valid price"); return; }
    setError("");
    setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session-token");
      const { token } = await tokenRes.json();
      const res = await fetch("/api/v1/vendors/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          shared_product_id: product.id,
          price: parseFloat(price),
          inventory: parseInt(quantity),
          condition,
          fulfillment_type: fulfillment,
          shipping_days: parseInt(shippingDays),
          warranty,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to list product"); setSubmitting(false); return; }
      setSuccess(true);
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-bold text-lg text-text-1 mb-2">Product Listed!</h3>
          <p className="text-sm text-text-4 mb-4">{product.title} is now live on the marketplace.</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90">Done</button>
        </div>
      </div>
    );
  }

  const commission = parseFloat(price || "0") * 0.12;
  const earnings = parseFloat(price || "0") - commission;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-text-1">Sell This Product</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
          {product.images?.[0] ? (
            <img src={product.images[0]} className="w-10 h-10 rounded object-cover" alt="" />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center"><Package size={16} className="text-text-4" /></div>
          )}
          <div>
            <p className="text-sm font-bold text-text-1">{product.title}</p>
            <p className="text-xs text-text-4">{product.brand || "Generic"}</p>
          </div>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-text-2 block mb-1">Your Price (USD)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Quantity</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="1" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 bg-white">
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="used_good">Used - Good</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Fulfillment</label>
              <select value={fulfillment} onChange={e => setFulfillment(e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 bg-white">
                <option value="merchant">Merchant Fulfilled</option>
                <option value="FBK">FBK (Kauvex Fulfilled)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Delivery (days)</label>
              <input type="number" value={shippingDays} onChange={e => setShippingDays(e.target.value)} placeholder="5" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-2 block mb-1">Warranty</label>
            <select value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 bg-white">
              <option value="no_warranty">No Warranty</option>
              <option value="3_months">3 Months</option>
              <option value="6_months">6 Months</option>
              <option value="1_year">1 Year</option>
              <option value="2_years">2 Years</option>
            </select>
          </div>
        </div>
        {price && parseFloat(price) > 0 && (
          <div className="bg-amber-50 border border-amber/20 rounded-xl p-3 mb-4">
            <div className="text-xs text-amber-800 space-y-1">
              <p>Platform commission (12%): <strong>-${commission.toFixed(2)}</strong></p>
              <p>Your estimated earnings: <strong>${earnings.toFixed(2)}</strong></p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red/20 rounded-xl p-3 flex items-start gap-2 mb-4">
            <AlertCircle size={14} className="text-red shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
        <button onClick={handleSubmit} disabled={submitting} className="w-full h-11 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={15} />}
          {submitting ? "Listing..." : "List This Product"}
        </button>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [myOffers, setMyOffers] = useState<Set<string>>(new Set());
  const [sellProduct, setSellProduct] = useState<CatalogProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [restrictedGates, setRestrictedGates] = useState<RestrictedGate[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      let fallback = false;
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (categoryFilter) params.set("category_id", categoryFilter);
        if (brandFilter) params.set("brand", brandFilter);
        params.set("page", String(page));
        params.set("limit", String(pageSize));
        const res = await fetch(`/api/v1/catalog?${params}`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setProducts(json.data);
          setTotalCount(json.total || json.count || 0);
        } else {
          fallback = true;
        }
      } catch {
        fallback = true;
      }
      if (fallback) {
        let filtered = [...DEMO_PRODUCTS];
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.upc && p.upc.toLowerCase().includes(q)) ||
            (p.ean && p.ean.toLowerCase().includes(q))
          );
        }
        if (categoryFilter) {
          filtered = filtered.filter(p => p.category_id === categoryFilter);
        }
        if (brandFilter) {
          filtered = filtered.filter(p => p.brand === brandFilter);
        }
        setProducts(filtered);
        setTotalCount(filtered.length);
      }
      setLoading(false);
    };
    fetchCatalog();
  }, [debouncedSearch, categoryFilter, brandFilter, page, pageSize]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const { data: cats } = await insforge.database
          .from("categories")
          .select("id, name")
          .eq("status", "active")
          .order("name", { ascending: true });
        if (cats && cats.length > 0) {
          setCategories(cats as Category[]);
        } else {
          setCategories(DEMO_CATEGORIES);
        }

        const { data: brds } = await insforge.database
          .from("shared_catalog_products")
          .select("brand")
          .not("brand", "is", null)
          .order("brand", { ascending: true });
        if (brds && brds.length > 0) {
          const unique = [...new Set(brds.map((b: any) => b.brand).filter(Boolean))] as string[];
          setBrands(unique);
        } else {
          setBrands(DEMO_BRANDS);
        }

        const { data: gates } = await insforge.database
          .from("kv_restricted_categories")
          .select("*")
          .eq("is_active", true);
        if (gates) setRestrictedGates(gates as RestrictedGate[]);
      } catch {
        setCategories(DEMO_CATEGORIES);
        setBrands(DEMO_BRANDS);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchMyOffers = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session-token");
        const { token } = await tokenRes.json();
        if (!token) return;
        const res = await fetch("/api/v1/vendors/offers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.data) {
          const offered = new Set<string>();
          (json.data as any[]).forEach((o: any) => offered.add(o.shared_product_id));
          setMyOffers(offered);
        }
      } catch {}
    };
    fetchMyOffers();
  }, []);

  const isGated = useCallback((product: CatalogProduct) => {
    return restrictedGates.some(g =>
      (g.category_id && g.category_id === product.category_id) ||
      (g.brand_name && g.brand_name.toLowerCase() === (product.brand || "").toLowerCase())
    );
  }, [restrictedGates]);

  const searched = debouncedSearch.length > 0;

  return (
    <VendorShell title="Add Product" subtitle="List a new product for sale on Kauvex">
      <div className="max-w-5xl mx-auto space-y-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
            {toast.message}
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-orange text-white rounded-full font-bold">1</span>
          <span className="font-semibold text-text-1">Find or create</span>
          <ChevronRight size={14} className="text-text-4" />
          <span className="px-3 py-1.5 bg-gray-100 text-text-4 rounded-full font-bold">2</span>
          <span className="text-text-4">Set price & details</span>
          <ChevronRight size={14} className="text-text-4" />
          <span className="px-3 py-1.5 bg-gray-100 text-text-4 rounded-full font-bold">3</span>
          <span className="text-text-4">Publish</span>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-bold text-lg text-text-1 mb-1">Find your product in Kauvex&apos;s catalog</h2>
          <p className="text-sm text-text-4 mb-4">Search the shared catalog to see if your product already exists. If it does, you can start selling immediately.</p>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => { setSearch(e.target.value); }}
              placeholder="Search by product name, brand, or category..."
              className="w-full h-12 pl-10 pr-4 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange/20" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-text-4" />
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange/20">
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter size={13} className="text-text-4" />
              <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange/20">
                <option value="">All brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-orange" />
          </div>
        )}

        {/* Search results */}
        {!loading && searched && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <p className="text-sm font-semibold text-text-1">{totalCount} product{totalCount !== 1 ? "s" : ""} found</p>
              <span className="text-[10px] text-text-4">Category/Brand gating may apply</span>
            </div>
            {products.length === 0 ? (
              <div className="p-8 text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-text-4">No catalog matches. You can add a new product instead.</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map(product => {
                    const alreadySelling = myOffers.has(product.id);
                    const gated = isGated(product);
                    return (
                      <div key={product.id} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-all">
                        <div className="flex justify-center mb-3">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} className="w-full h-32 rounded-lg object-cover" alt="" />
                          ) : (
                            <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package size={28} className="text-text-4" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-bold text-text-1 leading-tight line-clamp-2">{product.title}</p>
                        <p className="text-[10px] text-text-4 mt-1">{product.brand || "Generic"}</p>
                        {product.sku && <p className="text-[9px] text-gray-400 mt-0.5">SKU: {product.sku}</p>}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-text-4">{product.seller_count} seller{product.seller_count !== 1 ? "s" : ""}</span>
                          {gated && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Gated</span>}
                        </div>
                        <div className="mt-3">
                          {alreadySelling ? (
                            <span className="w-full h-8 flex items-center justify-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 rounded-lg"><Check size={11} /> You Sell This</span>
                          ) : (
                            <button onClick={() => setSellProduct(product)} className="w-full h-8 bg-orange text-white text-[10px] font-bold rounded-lg hover:bg-orange/90 transition-colors flex items-center justify-center gap-1">
                              <Plus size={11} /> Sell This
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (page <= 4) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = page - 3 + i;
                      }
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)}
                          className={`h-8 min-w-[2rem] px-2 flex items-center justify-center text-xs font-semibold rounded-lg transition-colors ${
                            page === pageNum ? "bg-orange text-white" : "border border-border hover:bg-gray-50 text-text-2"
                          }`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                      <ChevronLast size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No search yet */}
        {!loading && !searched && (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <Search size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-text-4">Type a product name, brand, or category above to search the catalog.</p>
          </div>
        )}

        {/* Three paths */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/vendor/catalog" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Search size={18} />
            </div>
            <h3 className="font-bold text-sm text-text-1 mb-1">Search & Match</h3>
            <p className="text-xs text-text-4">Find your product in the shared catalog and start selling with one click.</p>
          </Link>
          <Link href="/vendor/products" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={18} />
            </div>
            <h3 className="font-bold text-sm text-text-1 mb-1">Add New Product</h3>
            <p className="text-xs text-text-4">Create a brand new listing from scratch with all details.</p>
          </Link>
          <Link href="/vendor/products/bulk-upload" className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload size={18} />
            </div>
            <h3 className="font-bold text-sm text-text-1 mb-1">Bulk Upload</h3>
            <p className="text-xs text-text-4">Upload multiple products at once using a CSV file.</p>
          </Link>
        </div>

        {/* Category/Brand Gating Info */}
        <div className="bg-amber-50 border border-amber/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={16} className="text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 mb-0.5">Category & Brand Gating</p>
            <p className="text-[10px] text-amber-700">Some categories and brands require approval before you can list products. If your category or brand is gated, you&apos;ll need to submit an approval request with documentation. <Link href="/vendor/products/approval-request" className="font-bold hover:underline">Submit Approval Request</Link></p>
          </div>
        </div>

        {/* Quick switch */}
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
          <Package size={20} className="text-text-4" />
          <div className="flex-1">
            <p className="text-xs font-bold text-text-1">Have a list of products?</p>
            <p className="text-[10px] text-text-4">Use the bulk upload tool to add many products at once.</p>
          </div>
          <Link href="/vendor/products/bulk-upload" className="shrink-0 px-4 py-2 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90">Bulk Upload</Link>
        </div>
      </div>

      {sellProduct && <SellModal product={sellProduct} onClose={() => { setSellProduct(null); }} onSuccess={() => {
        const fetchMyOffers = async () => {
          try {
            const tokenRes = await fetch("/api/auth/session-token");
            const { token } = await tokenRes.json();
            if (!token) return;
            const res = await fetch("/api/v1/vendors/offers", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.data) {
              const offered = new Set<string>();
              (json.data as any[]).forEach((o: any) => offered.add(o.shared_product_id));
              setMyOffers(offered);
            }
          } catch {}
        };
        fetchMyOffers();
      }} />}
    </VendorShell>
  );
}
