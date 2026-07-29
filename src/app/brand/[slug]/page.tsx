"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, Star, ExternalLink } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useCurrencyStore } from "@/store/currency-store";

interface Product {
  id: string;
  name: string;
  slug: string;
  regularPrice: number;
  salePrice?: number;
  images: { url: string; alt: string }[];
  rating: number;
  reviewCount: number;
  badges: { type: string; active: boolean }[];
}

interface BrandData {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  productCount: number;
  website?: string;
}

const BRANDS_DB: Record<string, BrandData> = {
  hikvision: { id: "1", name: "Hikvision", slug: "hikvision", logo: "/brands/hikvision.png", description: "Global leader in surveillance and security solutions. Hikvision provides video surveillance products and vertical market solutions.", productCount: 89, website: "https://www.hikvision.com" },
  dahua: { id: "2", name: "Dahua Technology", slug: "dahua", logo: "/brands/dahua.png", description: "Dahua Technology is a leading provider of video surveillance products and solutions.", productCount: 76, website: "https://www.dahuasecurity.com" },
  samsung: { id: "3", name: "Samsung", slug: "samsung", logo: "/brands/samsung.png", description: "Samsung Electronics is a global leader in technology, offering a wide range of consumer electronics and business solutions.", productCount: 134, website: "https://www.samsung.com" },
  apple: { id: "4", name: "Apple", slug: "apple", logo: "/brands/apple.png", description: "Apple creates innovative products including iPhone, iPad, Mac, Apple Watch, and services.", productCount: 98, website: "https://www.apple.com" },
  sony: { id: "5", name: "Sony", slug: "sony", logo: "/brands/sony.png", description: "Sony Corporation is a multinational conglomerate corporation focused on electronics, gaming, and entertainment.", productCount: 87, website: "https://www.sony.com" },
  lg: { id: "6", name: "LG Electronics", slug: "lg", logo: "/brands/lg.png", description: "LG Electronics delivers innovative products across home appliances, mobile communications, and home entertainment.", productCount: 65, website: "https://www.lg.com" },
  bosch: { id: "7", name: "Bosch", slug: "bosch", logo: "/brands/bosch.png", description: "Bosch is a global supplier of technology and services with solutions for industry, mobility, and consumer goods.", productCount: 54, website: "https://www.bosch.com" },
  philips: { id: "8", name: "Philips", slug: "philips", logo: "/brands/philips.png", description: "Royal Philips is a diversified technology company focused on innovation and improving people's lives.", productCount: 72, website: "https://www.philips.com" },
  canon: { id: "9", name: "Canon", slug: "canon", logo: "/brands/canon.png", description: "Canon is a world leader in imaging and industrial products, including cameras, printers, and medical equipment.", productCount: 48, website: "https://www.canon.com" },
  nikon: { id: "10", name: "Nikon", slug: "nikon", logo: "/brands/nikon.png", description: "Nikon is a world leader in digital imaging, precision optics, and photo imaging technology.", productCount: 36, website: "https://www.nikon.com" },
  lenovo: { id: "11", name: "Lenovo", slug: "lenovo", logo: "/brands/lenovo.png", description: "Lenovo is a global technology company offering PCs, tablets, servers, and smart devices.", productCount: 82, website: "https://www.lenovo.com" },
  dell: { id: "12", name: "Dell", slug: "dell", logo: "/brands/dell.png", description: "Dell Technologies helps organizations and individuals build their digital future.", productCount: 67, website: "https://www.dell.com" },
};

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const formatPrice = useCurrencyStore((s) => s.formatPrice);

  useEffect(() => {
    // Try API first
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/products/search?brand=${slug}`);
        if (res.ok) {
          const json = await res.json();
          setProducts(json.data || json.products || []);
          if (json.brand) setBrand(json.brand);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Fallback to static brand data
    if (!brand) {
      setBrand(BRANDS_DB[slug] || null);
    }
  }, [slug]);

  if (!brand && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Brand Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">This brand page doesn&apos;t exist.</p>
          <Link href="/shop" className="text-sm text-[#FF6B00] hover:underline">← Browse Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Brand Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#0A1628]">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/brands" className="hover:text-[#0A1628]">Brands</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0A1628]">{brand?.name || slug}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-[#0A1628]">{brand?.name?.charAt(0) || "?"}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0A1628]">{brand?.name || slug}</h1>
              {brand?.description && (
                <p className="text-sm text-gray-500 mt-1 max-w-xl">{brand.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-gray-400">{brand?.productCount || 0} products</span>
                {brand?.website && (
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#FF6B00] hover:underline">
                    Official Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-lg font-bold text-[#0A1628] mb-4">
          {brand?.name} Products
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Package className="w-8 h-8 text-gray-300 animate-pulse" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-[#0A1628] mb-2">No products available yet</h3>
            <p className="text-sm text-gray-500 mb-4">New products from {brand?.name} are added regularly. Check back soon or browse all products.</p>
            <Link
              href="/shop"
              className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-[#e65c00] transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-[#0A1628] line-clamp-2 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-[#FF6B00]">
                      {formatPrice(product.salePrice || product.regularPrice)}
                    </span>
                    {product.salePrice && product.salePrice < product.regularPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.regularPrice)}
                      </span>
                    )}
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
