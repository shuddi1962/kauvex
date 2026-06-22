"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Search, Plus, Package, Grid3X3, List, Check, Loader2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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
  lowestPrice?: number;
}

const DEMO_PRODUCTS: CatalogProduct[] = [
  { id: "948248aa-8d9f-5dc6-51a5-91469165008e", title: "Hikvision 4MP IP Dome Camera DS-2CD2143G2-I", brand: "Hikvision", category_id: "cat-surveillance", images: [], seller_count: 4, is_active: true, sku: "HIK-4MP-DOME-01", upc: "846352000128", ean: "5901234567890", isbn: "9780141036144", lowestPrice: 89.99 },
  { id: "194974f5-2b16-628d-5fe6-2fb53a57f6f3", title: "Dahua 8MP IR Bullet Network Camera", brand: "Dahua", category_id: "cat-surveillance", images: [], seller_count: 3, is_active: true, sku: "DAH-8MP-BULL-01", upc: "732628000233", ean: "5901234567891", isbn: "9780061120084", lowestPrice: 74.99 },
  { id: "41e6e293-8f26-4d57-5232-7a689d24fd23", title: "Bosch Fire Alarm Control Panel FPA-5000", brand: "Bosch", category_id: "cat-fire", images: [], seller_count: 2, is_active: true, sku: "BOS-FPA5000-01", upc: "720754000449", ean: "5901234567893", isbn: "9780451524935", lowestPrice: 149.99 },
  { id: "f957a10c-b65b-8c97-ed76-6d89a9771546", title: "Honeywell Addressable Smoke Detector", brand: "Honeywell", category_id: "cat-fire", images: [], seller_count: 5, is_active: true, sku: "HON-ADRSMK-01", upc: "562216000551", ean: "5901234567894", isbn: "9780143039433", lowestPrice: 24.99 },
  { id: "cde27df1-eab5-130d-666b-c5526437a80a", title: "ZKTeco Biometric Access Control F18", brand: "ZKTeco", category_id: "cat-access", images: [], seller_count: 3, is_active: true, sku: "ZKT-F18-ACCESS-01", upc: "693104000662", ean: "5901234567895", isbn: "9780545010221", lowestPrice: 199.99 },
  { id: "b4cbb152-e8b0-6e21-2a24-f8fc02d94fa1", title: "Yamaha 4-Stroke Outboard F25", brand: "Yamaha", category_id: "cat-marine", images: [], seller_count: 1, is_active: true, sku: "YAM-F25-4STR-01", upc: "789452000773", ean: "5901234567897", isbn: "9780439708184", lowestPrice: 2499.99 },
  { id: "cf7deeb8-fc0c-73a0-7c6e-21a23326c654", title: "TP-Link WiFi 6 Router Archer AX73", brand: "TP-Link", category_id: "cat-networking", images: [], seller_count: 6, is_active: true, sku: "TPL-AX73-WIFI6-01", upc: "693536405110", ean: "5901234567800", isbn: "9780060935467", lowestPrice: 59.99 },
  { id: "01ab2b4a-11e5-929a-4567-97eee429411f", title: "Cisco Catalyst 2960X Switch 48-Port", brand: "Cisco", category_id: "cat-networking", images: [], seller_count: 2, is_active: true, sku: "CIS-2960X-48P-01", upc: "887658000115", ean: "5901234567801", isbn: "9780743273565", lowestPrice: 899.99 },
  { id: "4afd5a73-79f8-812f-b0e8-4f97a160d270", title: "Marine GPS Navigator Garmin", brand: "Mercury", category_id: "cat-marine", images: [], seller_count: 3, is_active: true, sku: "MAR-GPS-GARMIN-01", upc: "753759000226", ean: "5901234567802", isbn: "9780316769488", lowestPrice: 399.99 },
  { id: "44dbbbb9-b94f-a8e3-b9ac-a264ede0cfc9", title: "Solar Panel 450W Monocrystalline", brand: "Caterpillar", category_id: "cat-solar", images: [], seller_count: 2, is_active: true, sku: "SOL-450W-MONO-01", upc: "842167000771", ean: "5901234567807", isbn: "9780064401889", lowestPrice: 199.99 },
  { id: "56e3e5e8-1981-7a6c-4211-15617d022c7a", title: "UPS APC Smart-UPS 1500VA", brand: "Caterpillar", category_id: "cat-ups", images: [], seller_count: 4, is_active: true, sku: "APC-SUPS-1500VA-01", upc: "731304000882", ean: "5901234567808", isbn: "9780142407332", lowestPrice: 229.99 },
  { id: "04df0a8c-826a-b9a1-3cd5-b277dc90d752", title: "Honeywell Safety Goggles Professional", brand: "Honeywell", category_id: "cat-safety", images: [], seller_count: 8, is_active: true, sku: "HON-SAFEGOG-01", upc: "625814000993", ean: "5901234567809", isbn: "9780399501487", lowestPrice: 12.99 },
];

export default function VendorCatalog() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
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
                          {product.lowestPrice ? <span className="text-[10px] font-bold text-orange">From {formatPrice(product.lowestPrice, "USD")}</span> : null}
                          {alreadySelling && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">You Sell This</span>}
                        </div>
                      </div>
                    </div>
                    {alreadySelling ? (
                      <Link href={`/vendor/products/${product.id}/offer`} className={`${view === "list" ? "shrink-0" : "mt-2"} text-center block`}>
                        <span className="text-[10px] font-semibold text-green-600 flex items-center justify-center gap-1"><Check size={11} /> Listed</span>
                      </Link>
                    ) : (
                      <Link href={`/vendor/products/approval-request?productId=${product.id}&brand=${encodeURIComponent(product.brand || "")}&category=${encodeURIComponent(product.category_id || "")}`} className={`w-full h-8 bg-orange text-white text-[10px] font-bold rounded-lg hover:bg-orange/90 transition-colors flex items-center justify-center gap-1 ${view === "list" ? "w-auto px-4 shrink-0" : ""}`}>
                        <Plus size={11} /> List Product
                      </Link>
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

      
    </VendorShell>
  );
}