"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import {
  Search, Loader2, Globe, Check, X, ToggleLeft, ToggleRight,
  ArrowLeftRight, Save,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  storefronts: string[];
}

interface Storefront {
  id: string;
  name: string;
  slug: string;
}

export default function ProductStorefrontsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [assignments, setAssignments] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, sfRes] = await Promise.all([
        insforge.database.from("products").select("id, name, sku").eq("status", "active").order("name").limit(50),
        insforge.database.from("storefronts").select("id, name, slug").eq("status", "active").order("name"),
      ]);

      const storefrontList: Storefront[] = (sfRes.data || []).map((s: any) => ({
        id: s.id, name: s.name, slug: s.slug,
      }));
      setStorefronts(storefrontList);

      const productList: Product[] = (prodRes.data || []).map((p: any) => ({
        id: p.id, name: p.name, sku: p.sku || "", storefronts: [],
      }));
      setProducts(productList);

      // Load existing assignments
      const { data: assignData } = await insforge.database
        .from("product_storefronts")
        .select("product_id, storefront_id");

      const assignMap = new Map<string, Set<string>>();
      (assignData || []).forEach((a: any) => {
        if (!assignMap.has(a.product_id)) assignMap.set(a.product_id, new Set());
        assignMap.get(a.product_id)!.add(a.storefront_id);
      });
      setAssignments(assignMap);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally { setLoading(false); }
  };

  const toggleAssignment = async (productId: string, storefrontId: string) => {
    const newAssign = new Map(assignments);
    if (!newAssign.has(productId)) newAssign.set(productId, new Set());
    const sfs = newAssign.get(productId)!;
    if (sfs.has(storefrontId)) {
      sfs.delete(storefrontId);
    } else {
      sfs.add(storefrontId);
    }
    if (sfs.size === 0) newAssign.delete(productId);
    setAssignments(newAssign);
  };

  const saveAssignments = async () => {
    setSaving(true);
    try {
      for (const [productId, sfIds] of assignments) {
        await insforge.database.from("product_storefronts").delete().eq("product_id", productId);
        if (sfIds.size > 0) {
          const inserts = Array.from(sfIds).map((sfId, i) => ({
            product_id: productId,
            storefront_id: sfId,
            is_active: true,
            sort_order: i,
          }));
          await insforge.database.from("product_storefronts").insert(inserts);
        }
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally { setSaving(false); }
  };

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    : products;

  if (loading) {
    return (
      <AdminShell title="Product Storefront Assignment" subtitle="Assign products to storefronts">
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-blue" size={32} /></div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Product Storefront Assignment" subtitle="Assign products to storefronts">
      <p className="text-xs text-text-4 mb-4">
        Select products and assign them to specific storefronts. Products only appear in assigned storefronts.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" />
        </div>
        <button
          onClick={saveAssignments}
          disabled={saving}
          className="flex items-center gap-1.5 h-9 px-4 bg-blue text-white rounded-lg text-xs font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          <Save size={14} /> {saving ? "Saving..." : "Save All Assignments"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-semibold text-text-4 w-12">#</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">Product</th>
                <th className="text-left px-4 py-2.5 font-semibold text-text-4">SKU</th>
                {storefronts.map(sf => (
                  <th key={sf.id} className="text-center px-2 py-2.5 font-semibold text-text-4 text-[10px]">
                    <div className="flex items-center justify-center gap-1">
                      <Globe size={10} />
                      <span>{sf.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const productSfs = assignments.get(p.id);
                return (
                  <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${selectedProduct === p.id ? "bg-blue-50/50" : ""}`}
                    onClick={() => setSelectedProduct(p.id === selectedProduct ? null : p.id)}
                  >
                    <td className="px-4 py-2.5 text-text-4">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium max-w-[250px] truncate">{p.name}</td>
                    <td className="px-4 py-2.5 text-text-4">{p.sku || "—"}</td>
                    {storefronts.map(sf => {
                      const assigned = productSfs?.has(sf.id);
                      return (
                        <td key={sf.id} className="px-2 py-2.5 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleAssignment(p.id, sf.id); }}
                            className={`p-1 rounded-lg transition-all ${
                              assigned
                                ? "text-green-600 bg-green-50 hover:bg-green-100"
                                : "text-text-4 hover:bg-gray-100"
                            }`}
                          >
                            {assigned ? <Check size={14} /> : <X size={14} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-text-4">No products found</div>
        )}
      </div>
    </AdminShell>
  );
}
