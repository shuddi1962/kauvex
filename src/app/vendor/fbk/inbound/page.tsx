"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Package,
  Warehouse,
  Loader2,
  Plus,
  X,
  Check,
  AlertTriangle,
  MapPin,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

interface ProductOption {
  id: string;
  name: string;
  sku: string;
}

interface WarehouseOption {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
}

interface InboundPlanResult {
  id: string;
  status: string;
  warehouse_id: string;
  notes: string | null;
  created_at: string;
  items: { product_id: string; quantity_shipped: number; sku: string }[];
}

export default function FbkInboundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<InboundPlanResult | null>(null);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) { setLoading(false); return; }

      let { data: vendorProfile } = await insforge.database
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // Auto-create vendor record if missing
      if (!vendorProfile) {
        try {
          const tokRes = await fetch("/api/auth/session-token");
          const { token } = await tokRes.json();
          if (token) {
            const regRes = await fetch("/api/v1/vendors/auto-register", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (regRes.ok) {
              const regJson = await regRes.json();
              vendorProfile = regJson.data;
            }
          }
        } catch { /* ignore */ }
      }

      if (vendorProfile) {
        let { data: productData } = await insforge.database
          .from("products")
          .select("id, name, sku")
          .eq("vendor_id", vendorProfile.id)
          .order("name");

        // Seed demo products if empty
        if (!productData || productData.length === 0) {
          try {
            const tokRes = await fetch("/api/auth/session-token");
            const { token } = await tokRes.json();
            if (token) {
              await fetch("/api/v1/vendors/seed-demo", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              });
            }
          } catch { /* ignore */ }

          // Re-fetch
          const { data: refetched } = await insforge.database
            .from("products")
            .select("id, name, sku")
            .eq("vendor_id", vendorProfile.id)
            .order("name");
          productData = refetched;
        }

        if (productData) setProducts(productData);
      }

      // Fetch warehouses via API (bypasses RLS)
      const whRes = await fetch("/api/warehouses?status=active");
      if (whRes.ok) {
        const whJson = await whRes.json();
        setWarehouses(whJson.warehouses || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = productSearch
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.sku.toLowerCase().includes(productSearch.toLowerCase())
      )
    : products;

  const handleSubmit = async () => {
    if (!selectedProduct) { setError("Please select a product"); return; }
    if (quantity < 1) { setError("Quantity must be at least 1"); return; }
    if (!warehouseId) { setError("Please select a warehouse"); return; }
    setError("");
    setSubmitting(true);

    try {
      const tokenRes = await fetch("/api/auth/session-token");
      const { token } = await tokenRes.json();
      if (!token) { setError("Authentication failed"); setSubmitting(false); return; }

      const res = await fetch("/api/v1/fbk/inbound", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          product_id: selectedProduct,
          quantity,
          warehouse_id: warehouseId,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to create inbound plan");
        setSubmitting(false);
        return;
      }

      setResult(json.data.plan || json.data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <VendorShell title="Create Inbound Plan" subtitle="Send inventory to KAUVEX warehouses">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </VendorShell>
    );
  }

  if (result) {
    return (
      <VendorShell title="Create Inbound Plan" subtitle="Send inventory to KAUVEX warehouses">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Inbound Plan Created!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Plan <span className="font-mono font-bold text-purple-600">{result.id.slice(0, 8)}</span> has been
            created with status <span className="font-semibold">{result.status}</span>.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left text-xs space-y-2 mb-6">
            <p className="text-gray-500">
              Items: {(result.items || []).length} product(s)
            </p>
            {result.warehouse_id && (
              <p className="text-gray-500">Warehouse ID: {result.warehouse_id.slice(0, 8)}</p>
            )}
            <p className="text-gray-500">
              Created: {new Date(result.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push("/vendor/fbk")}>
              Back to FBK
            </Button>
            <Button onClick={() => setResult(null)}>
              <Plus size={14} className="mr-1" /> Create Another
            </Button>
          </div>
        </div>
      </VendorShell>
    );
  }

  const selectedWarehouse = warehouses.find((w) => w.id === warehouseId);

  return (
    <VendorShell title="Create Inbound Plan" subtitle="Send inventory to KAUVEX warehouses">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Truck size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-sm">New Inbound Plan</h2>
              <p className="text-xs text-gray-400">Send inventory to a KAUVEX warehouse</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 rounded-lg border bg-red-50 border-red-200 text-red-800 text-xs">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Product</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                />
              </div>
              <div className="mt-1 max-h-32 overflow-y-auto border border-gray-100 rounded-lg">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 p-2">No products found</p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProduct(p.id); setProductSearch(p.name); }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-gray-50 ${
                        selectedProduct === p.id ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-700"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] text-gray-400">{p.sku}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Warehouse</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              >
                <option value="">Select a warehouse...</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.city}, {w.state || w.country}
                  </option>
                ))}
              </select>
            </div>

            {selectedWarehouse && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Selected Warehouse</p>
                <div className="text-[10px] text-gray-500 space-y-0.5">
                  <p>{selectedWarehouse.name}</p>
                  <p className="flex items-center gap-1">
                    <MapPin size={10} /> {selectedWarehouse.city}, {selectedWarehouse.state || selectedWarehouse.country}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 resize-none"
                placeholder="Any special instructions..."
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/vendor/fbk")}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!selectedProduct || !warehouseId || submitting}
            >
              {submitting ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Truck size={14} className="mr-1" />
              )}
              Create Plan
            </Button>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
