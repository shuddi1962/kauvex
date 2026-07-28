"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Package, Search, ChevronRight, ArrowRight } from "lucide-react";

interface Hub {
  id: string;
  hubName: string;
  hubSlug: string;
  productCategories: string[];
}

const SAMPLE_PRODUCTS = [
  { name: "Industrial Grade A", price: "₦245,000", category: "Equipment" },
  { name: "Professional Tool Kit", price: "₦89,500", category: "Tools" },
  { name: "Safety Inspection Kit", price: "₦34,200", category: "Safety" },
  { name: "Maintenance Bundle", price: "₦156,000", category: "Maintenance" },
  { name: "Certified Component X", price: "₦12,800", category: "Parts" },
  { name: "Installation Accessory Set", price: "₦67,400", category: "Accessories" },
];

export default function HubProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const category = searchParams.get("category") || "";
  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/kpn/hubs/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setHub(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/industries" className="hover:text-kauvex-orange">Industries</Link>
            <ChevronRight size={14} />
            {hub && <Link href={`/industries/${slug}`} className="hover:text-kauvex-orange">{hub.hubName}</Link>}
            <ChevronRight size={14} />
            <span className="text-kauvex-navy font-medium">Products</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ) : hub ? (
          <>
            <h1 className="text-3xl font-bold text-kauvex-navy mb-2">{hub.hubName} Products</h1>
            <p className="text-gray-500 mb-8">
              Browse {category || hub.hubName} products on the Kauvex marketplace.
              {category && <span> Category: <strong>{category}</strong></span>}
            </p>

            {/* Category filter */}
            {hub.productCategories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <Link
                  href={`/industries/${slug}/products`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!category ? 'bg-kauvex-orange text-white border-kauvex-orange' : 'bg-white text-gray-600 border-gray-200 hover:border-kauvex-orange'}`}
                >
                  All
                </Link>
                {hub.productCategories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/industries/${slug}/products?category=${encodeURIComponent(cat)}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${category === cat ? 'bg-kauvex-orange text-white border-kauvex-orange' : 'bg-white text-gray-600 border-gray-200 hover:border-kauvex-orange'}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {SAMPLE_PRODUCTS.map((product, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kauvex-orange/10 to-kauvex-orange/5 flex items-center justify-center mb-3">
                    <Package size={22} className="text-kauvex-orange" />
                  </div>
                  <h3 className="font-semibold text-kauvex-navy mb-1">{product.name}</h3>
                  <span className="text-xs text-gray-400">{product.category}</span>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-kauvex-orange">{product.price}</span>
                    <Link
                      href="/marketplace"
                      className="text-xs font-medium text-kauvex-navy hover:text-kauvex-orange transition-colors"
                    >
                      View on Marketplace
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href={`/marketplace?category=${encodeURIComponent(category || hub.hubName)}`}
                className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-8 py-3 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
              >
                View All {hub.hubName} Products <ArrowRight size={18} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-500">Hub not found</p>
            <Link href="/industries" className="text-kauvex-orange hover:underline text-sm mt-2 inline-block">
              Back to industries
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
