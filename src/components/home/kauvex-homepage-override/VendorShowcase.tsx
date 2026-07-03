import Image from "next/image";
import Link from "next/link";
import { vendors } from "@/lib/homepage-data";
import { Store, Star, ArrowRight } from "lucide-react";

const vendorImages = [
  "https://images.unsplash.com/photo-1505740043?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523278682?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502920912?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1608043158?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1592078013?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1496188132?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1549298911?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1593032256?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1547940927?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524592092?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1591561951?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1576566697?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1555048774?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598024456?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1578749550?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1602875436?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1567625837?w=150&h=150&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580674686?w=150&h=150&fit=crop&q=80",
];

export default function VendorShowcase() {
  return (
    <section className="container-kauvex py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center">
            <Store size={18} className="text-navy" />
          </div>
          <h2 className="font-display font-bold text-2xl text-text-1">Featured Vendors</h2>
        </div>
        <Link href="/shop?vendor=featured" className="text-sm text-orange font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {vendors.map((v, i) => (
          <Link key={v.id} href={`/search?q=${encodeURIComponent(v.name)}`} className="bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover p-4 transition-all hover:-translate-y-1 block group">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${v.gradient} text-white flex items-center justify-center shrink-0 font-bold text-lg`}>
                {v.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-text-1 truncate group-hover:text-orange transition-colors">{v.name}</p>
                <div className="flex items-center gap-1 text-xs text-text-4">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span>{v.rating} · {v.items} products</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((n) => (
                <div key={n} className="relative aspect-square rounded-md overflow-hidden bg-gray-50">
                  <Image
                    src={vendorImages[(i * 3 + n) % vendorImages.length]}
                    alt={`${v.name} product ${n + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}