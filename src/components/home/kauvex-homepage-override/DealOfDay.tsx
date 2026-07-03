"use client";

import Image from "next/image";
import { dealOfDayProducts } from "@/lib/homepage-data";
import CountdownTimer from "./CountdownTimer";
import Link from "next/link";
import { Clock, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";

const addToCartStore = (product: typeof dealOfDayProducts[0], setAdded: (v: boolean) => void) => {
  useCartStore.getState().addItem(
    {
      id: `deal-${product.id}`,
      name: product.title,
      slug: product.title.toLowerCase().replace(/\s+/g, "-"),
      type: "simple",
      sku: product.id,
      shortDescription: product.title,
      longDescription: product.title,
      brand: { id: "", name: "", slug: "", logo: "", productCount: 0 },
      category: { id: "", name: product.category, slug: product.category?.toLowerCase().replace(/\s+/g, "-") || "", productCount: 0 },
      regularPrice: product.oldPrice || product.price,
      salePrice: product.price,
      images: [{ id: "1", url: product.image, alt: product.title, position: 0, watermark: false }],
      badges: [],
      inventory: [{ locationId: "main", locationName: "Main", quantity: 10, lowStockThreshold: 2, backorderEnabled: false }],
      seo: { metaTitle: product.title, metaDescription: product.title, focusKeyword: "", altTexts: [] },
      tags: [product.category],
      rating: product.rating,
      reviewCount: product.reviews,
      featured: false,
      status: "published",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any,
    1,
    undefined,
    "phc-main"
  );
  setAdded(true);
  setTimeout(() => setAdded(false), 2000);
};

export default function DealOfDay() {
  const hero = dealOfDayProducts[0];
  const side = dealOfDayProducts.slice(1);
  const [addedStates, setAddedStates] = useState<Record<string, boolean>>({});

  return (
    <section className="container-kauvex py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange/10 flex items-center justify-center">
            <Clock size={18} className="text-orange" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-text-1">Deal of the Day</h2>
            <p className="text-text-4 text-sm">Score up to 60% off while these deals last</p>
          </div>
        </div>
        <CountdownTimer hours={26} />
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
        {/* Hero deal */}
        <div className="relative group rounded-2xl overflow-hidden bg-white border border-border shadow-card hover:shadow-card-hover transition-all">
          <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden">
            <Image src={hero.image} alt={hero.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 bg-orange text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              -{hero.discount}% OFF
            </span>
          </div>
          <div className="p-5">
            <p className="text-[11px] uppercase tracking-widest text-text-4 font-medium">{hero.category}</p>
            <h3 className="font-bold text-lg text-text-1 mt-1 group-hover:text-orange transition-colors">{hero.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-orange font-bold text-2xl font-display">${hero.price.toFixed(2)}</span>
              {hero.oldPrice && <span className="text-text-4 text-sm line-through">${hero.oldPrice.toFixed(2)}</span>}
            </div>
              <Link href={hero.title ? `/search?q=${encodeURIComponent(hero.title.split(" ").slice(0, 3).join(" "))}` : "/deals"} className="mt-4 w-full h-11 bg-orange hover:bg-orange/90 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-orange/20 flex items-center justify-center">
                Grab the Deal
              </Link>
          </div>
        </div>

        {/* Side deals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {side.map((p) => (
            <div key={p.id} className="group bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                <span className="absolute top-2 left-2 bg-orange text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  -{p.discount}%
                </span>
              </div>
              <div className="p-3">
                <h4 className="text-xs font-semibold text-text-1 line-clamp-2 leading-snug group-hover:text-orange transition-colors">{p.title}</h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-orange font-bold text-sm font-display">${p.price.toFixed(2)}</span>
                  {p.oldPrice && <span className="text-text-4 text-[10px] line-through">${p.oldPrice.toFixed(2)}</span>}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const key = p.id;
                    setAddedStates((prev) => ({ ...prev, [key]: true }));
                    addToCartStore(p, (v) => setAddedStates((prev) => ({ ...prev, [key]: v })));
                  }}
                  className={`mt-2 w-full h-8 text-[10px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    addedStates[p.id] ? "bg-emerald-500 text-white" : "bg-navy hover:bg-navy/90 text-white"
                  }`}
                >
                  {addedStates[p.id] ? <Check size={11} /> : <ShoppingCart size={11} />}
                  {addedStates[p.id] ? "Added" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}