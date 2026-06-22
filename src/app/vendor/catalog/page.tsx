"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Search, Plus, Package, Grid3X3, List, Check, X, Loader2, AlertCircle, CheckCircle, ShoppingCart, ChevronRight, ChevronLeft, ChevronLast, Filter } from "lucide-react";

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
  isbn?: string;
}

const DEMO_PRODUCTS: CatalogProduct[] = [
  { id: "demo-001", title: "Hikvision 4MP IP Dome Camera DS-2CD2143G2-I", brand: "Hikvision", category_id: "cat-surveillance", images: [], seller_count: 4, is_active: true, sku: "HIK-4MP-DOME-01", upc: "846352000128", ean: "5901234567890", isbn: "9780141036144" },
  { id: "demo-002", title: "Dahua 8MP IR Bullet Network Camera", brand: "Dahua", category_id: "cat-surveillance", images: [], seller_count: 3, is_active: true, sku: "DAH-8MP-BULL-01", upc: "732628000233", ean: "5901234567891", isbn: "9780061120084" },
  { id: "demo-003", title: "Bosch Fire Alarm Control Panel FPA-5000", brand: "Bosch", category_id: "cat-fire", images: [], seller_count: 2, is_active: true, sku: "BOS-FPA5000-01", upc: "720754000449", ean: "5901234567893", isbn: "9780451524935" },
  { id: "demo-004", title: "Honeywell Addressable Smoke Detector", brand: "Honeywell", category_id: "cat-fire", images: [], seller_count: 5, is_active: true, sku: "HON-ADRSMK-01", upc: "562216000551", ean: "5901234567894", isbn: "9780143039433" },
  { id: "demo-005", title: "ZKTeco Biometric Access Control F18", brand: "ZKTeco", category_id: "cat-access", images: [], seller_count: 3, is_active: true, sku: "ZKT-F18-ACCESS-01", upc: "693104000662", ean: "5901234567895", isbn: "9780545010221" },
  { id: "demo-006", title: "Yamaha 4-Stroke Outboard F25", brand: "Yamaha", category_id: "cat-marine", images: [], seller_count: 1, is_active: true, sku: "YAM-F25-4STR-01", upc: "789452000773", ean: "5901234567897", isbn: "9780439708184" },
  { id: "demo-007", title: "TP-Link WiFi 6 Router Archer AX73", brand: "TP-Link", category_id: "cat-networking", images: [], seller_count: 6, is_active: true, sku: "TPL-AX73-WIFI6-01", upc: "693536405110", ean: "5901234567800", isbn: "9780060935467" },
  { id: "demo-008", title: "Cisco Catalyst 2960X Switch 48-Port", brand: "Cisco", category_id: "cat-networking", images: [], seller_count: 2, is_active: true, sku: "CIS-2960X-48P-01", upc: "887658000115", ean: "5901234567801", isbn: "9780743273565" },
  { id: "demo-009", title: "Marine GPS Navigator Garmin", brand: "Mercury", category_id: "cat-marine", images: [], seller_count: 3, is_active: true, sku: "MAR-GPS-GARMIN-01", upc: "753759000226", ean: "5901234567802", isbn: "9780316769488" },
  { id: "demo-010", title: "Solar Panel 450W Monocrystalline", brand: "Caterpillar", category_id: "cat-solar", images: [], seller_count: 2, is_active: true, sku: "SOL-450W-MONO-01", upc: "842167000771", ean: "5901234567807", isbn: "9780064401889" },
  { id: "demo-011", title: "UPS APC Smart-UPS 1500VA", brand: "Caterpillar", category_id: "cat-ups", images: [], seller_count: 4, is_active: true, sku: "APC-SUPS-1500VA-01", upc: "731304000882", ean: "5901234567808", isbn: "9780142407332" },
  { id: "demo-012", title: "Honeywell Safety Goggles Professional", brand: "Honeywell", category_id: "cat-safety", images: [], seller_count: 8, is_active: true, sku: "HON-SAFEGOG-01", upc: "625814000993", ean: "5901234567809", isbn: "9780399501487" },
];

function SellModal({ product, onClose, onSuccess }: { product: CatalogProduct | null; onClose: () => void; onSuccess: () => void }) {
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
    setError(""); setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session-token");
      const { token } = await tokenRes.json();
      const res = await fetch("/api/v1/vendors/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shared_product_id: product.id, price: parseFloat(price), inventory: parseInt(quantity), condition, fulfillment_type: fulfillment, shipping_days: parseInt(shippingDays), warranty }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed"); setSubmitting(false); return; }
      setSuccess(true); onSuccess();
    } catch { setError("Network error"); } finally { setSubmitting(false); }
  };

  if (success) return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
        <h3 className="font-bold text-lg text-text-1 mb-2">Product Listed!</h3>
        <p className="text-sm text-text-4 mb-4">{product.title} is now live.</p>
        <button onClick={onClose} className="px-6 py-2.5 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90">Done</button>
      </div>
    </div>
  );

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
          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center"><Package size={16} className="text-text-4" /></div>
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
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="1" className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
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
              <select value={fulfillment} onChange={e => setFulfillment(e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
                <option value="merchant">Merchant Fulfilled</option>
                <option value="FBK">FBK (Kauvex Fulfilled)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-1">Delivery (days)</label>
              <input type="number" value={shippingDays} onChange={e => setShippingDays(e.target.value)} placeholder="5" className="w-full h-10 px-3 border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-2 block mb-1">Warranty</label>
            <select value={warranty} onChange={e => setWarranty(e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-white">
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

export default function VendorCatalog() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sellProduct, setSellProduct] = useState<CatalogProduct | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [myOffers, setMyOffers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/v1/catalog?${params}`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setProducts(json.data);
      } else {
        let filtered = [...DEMO_PRODUCTS];
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          filtered = DEMO_PRODUCTS.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.sku && p.sku.toLowerCase().includes(q)) ||
            (p.upc && p.upc.toLowerCase().includes(q)) ||
            (p.ean && p.ean.toLowerCase().includes(q)) ||
            (p.isbn && p.isbn.toLowerCase().includes(q))
          );
        }
        setProducts(filtered);
      }
    } catch {
      let filtered = [...DEMO_PRODUCTS];
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filtered = DEMO_PRODUCTS.filter(p =>
          p.title.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.upc && p.upc.toLowerCase().includes(q)) ||
          (p.ean && p.ean.toLowerCase().includes(q)) ||
          (p.isbn && p.isbn.toLowerCase().includes(q))
        );
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchCatalog(); }, [fetchCatalog]);

  const fetchMyOffers = useCallback(async () => {
    try {
      const tokenRes = await fetch("/api/auth/session-token");
      const { token } = await tokenRes.json();
      if (!token) return;
      const res = await fetch("/api/v1/vendors/offers", { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.data) {
        const offered = new Set<string>();
        (json.data as any[]).forEach((o: any) => offered.add(o.shared_product_id));
        setMyOffers(offered);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchMyOffers(); }, [fetchMyOffers]);

  return (
    <VendorShell title="Shared Catalog" subtitle="Browse products and start selling existing catalog items">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, brand, SKU, UPC, EAN, or ISBN..."
              className="w-full h-10 pl-9 pr-3 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange/20" />
          </div>
          <button onClick={fetchCatalog} className="h-10 px-4 text-xs font-semibold bg-orange text-white rounded-xl hover:bg-orange/90">Search</button>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}>
              <Grid3X3 size={15} className="text-text-3" />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded ${view === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"}`}>
              <List size={15} className="text-text-3" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-orange" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-text-4">No catalog products found. Try a different search or create a new product.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-4">{products.length} product{products.length !== 1 ? "s" : ""} found</p>
            <div className={`${view === "grid" ? "grid grid-cols-2 lg:grid-cols-5 gap-3" : "space-y-2"}`}>
              {products.map(product => {
                const alreadySelling = myOffers.has(product.id);
                return (
                  <div key={product.id} className={`bg-white rounded-xl border border-border hover:shadow-md transition-all ${view === "list" ? "flex items-center gap-4 p-3" : "p-4"}`}>
                    <div className={`${view === "list" ? "flex items-center gap-4 flex-1" : "space-y-3"}`}>
                      <div className={`${view === "list" ? "" : "flex justify-center"}`}>
                        {product.images?.[0] ? (
                          <img src={product.images[0]} className="w-12 h-12 rounded-lg object-cover" alt="" />
                        ) : (
                          <div className={`${view === "list" ? "w-12 h-12" : "w-full h-24"} rounded-lg bg-gray-100 flex items-center justify-center`}>
                            <Package size={view === "list" ? 16 : 24} className="text-text-4" />
                          </div>
                        )}
                      </div>
                      <div className={view === "list" ? "flex-1" : ""}>
                        <p className="text-xs font-bold text-text-1 leading-tight">{product.title}</p>
                        <p className="text-[10px] text-text-4 mt-0.5">{product.brand || "Generic"}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                          {product.sku && <span className="text-[9px] text-gray-400">SKU: {product.sku}</span>}
                          {product.upc && <span className="text-[9px] text-gray-400">UPC: {product.upc}</span>}
                          {product.ean && <span className="text-[9px] text-gray-400">EAN: {product.ean}</span>}
                          {product.isbn && <span className="text-[9px] text-gray-400">ISBN: {product.isbn}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-text-4">{product.seller_count} seller{product.seller_count !== 1 ? "s" : ""}</span>
                          {alreadySelling && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">You Sell This</span>}
                        </div>
                      </div>
                    </div>
                    {alreadySelling ? (
                      <div className={`${view === "list" ? "shrink-0" : "mt-2"} text-center`}>
                        <span className="text-[10px] font-semibold text-green-600 flex items-center justify-center gap-1"><Check size={11} /> Listed</span>
                      </div>
                    ) : (
                      <button onClick={() => setSellProduct(product)} className={`w-full h-8 bg-orange text-white text-[10px] font-bold rounded-lg hover:bg-orange/90 transition-colors flex items-center justify-center gap-1 ${view === "list" ? "w-auto px-4 shrink-0" : ""}`}>
                        <Plus size={11} /> Sell This
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="bg-gray-50 rounded-xl border border-border p-4 flex items-center gap-3">
          <Package size={16} className="text-text-4" />
          <p className="text-xs text-text-4 flex-1">Can&apos;t find your product? Create a new product listing instead.</p>
          <Link href="/vendor/products" className="flex items-center gap-1 text-xs font-semibold text-orange hover:underline"><Plus size={12} /> Create Product</Link>
        </div>
      </div>

      {sellProduct && <SellModal product={sellProduct} onClose={() => { setSellProduct(null); fetchMyOffers(); }} onSuccess={() => { fetchMyOffers(); }} />}
    </VendorShell>
  );
}