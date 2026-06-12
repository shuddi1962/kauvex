"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { insforge } from "@/lib/insforge";
import { ShoppingCart, Check } from "lucide-react";

interface BundleProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
}

export default function FrequentlyBoughtTogether({ productId }: { productId: string }) {
  const [products, setProducts] = useState<BundleProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set([productId]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: bundles } = await insforge.database
        .from("product_bundles")
        .select("products")
        .contains("products", [productId])
        .limit(1);

      if (bundles && bundles.length > 0) {
        const allIds: string[] = bundles[0].products || [];
        if (allIds.length > 1) {
          const { data: productsData } = await insforge.database
            .from("products")
            .select("id, name, slug, price, images")
            .in("id", allIds)
            .limit(6);

          if (productsData) {
            setProducts(productsData.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: Number(p.price),
              image: p.images?.[0] || "/placeholder.png",
            })));
            setSelected(new Set(allIds));
          }
        }
      }
      setLoading(false);
    })();
  }, [productId]);

  if (loading || products.length <= 1) return null;

  const totalPrice = products.filter((p) => selected.has(p.id)).reduce((sum, p) => sum + p.price, 0);
  const discount = totalPrice * 0.05;

  const toggleProduct = (id: string) => {
    if (id === productId) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="border border-border rounded-xl p-4">
      <h3 className="font-bold text-sm mb-3">Frequently Bought Together</h3>

      <div className="flex items-center gap-3 mb-4 overflow-x-auto">
        {products.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            {i > 0 && <span className="text-text-4 text-lg font-bold">+</span>}
            <div
              onClick={() => toggleProduct(p.id)}
              className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden cursor-pointer transition-all shrink-0 ${
                selected.has(p.id) ? "border-orange" : "border-border hover:border-gray-300"
              }`}
            >
              <Image src={p.image} alt={p.name} fill className="object-cover" unoptimized />
              {selected.has(p.id) && (
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-orange rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1 mb-4">
        {products.map((p) => (
          <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={selected.has(p.id)}
              onChange={() => toggleProduct(p.id)}
              disabled={p.id === productId}
              className="accent-orange"
            />
            <Link href={`/product/${p.slug}`} className="text-text-2 hover:text-orange transition-colors">{p.name}</Link>
            <span className="font-semibold text-text-1 ml-auto">${p.price.toFixed(2)}</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="text-xs text-text-4">Total price:</p>
          <p className="text-lg font-bold text-text-1">${totalPrice.toFixed(2)}</p>
          {discount > 0 && (
            <p className="text-[10px] text-green font-medium">
              Save ${discount.toFixed(2)} with this bundle
            </p>
          )}
        </div>
        <button className="flex items-center gap-1.5 bg-orange text-white text-xs font-bold h-9 px-4 rounded-lg hover:bg-orange/90 transition-colors">
          <ShoppingCart size={14} /> Add All to Cart
        </button>
      </div>
    </div>
  );
}
