"use client";

import { useState } from "react";
import { topProducts } from "@/lib/data";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

const tabs = Object.keys(topProducts);

export default function TopProducts() {
  const [active, setActive] = useState(tabs[0]);

  return (
    <section className="container-kauvex py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-navy" />
          </div>
          <h2 className="font-display font-bold text-2xl text-text-1">Top Products</h2>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${
                active === tab ? "bg-orange text-white shadow-sm" : "text-text-3 hover:text-text-1"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {topProducts[active].map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-orange font-semibold hover:gap-3 transition-all"
        >
          View All Products <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}