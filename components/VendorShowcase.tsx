import Image from "next/image";
import { vendors } from "@/lib/data";
import { Store, Star } from "lucide-react";

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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {vendors.map((v, i) => (
          <div key={v.id} className="bg-white rounded-xl border border-border shadow-card hover:shadow-card-hover p-4 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${v.gradient} text-white flex items-center justify-center shrink-0 font-bold text-lg`}>
                {v.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-text-1 truncate">{v.name}</p>
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
                    src={`https://images.unsplash.com/photo-${[1502920912430, 1505740043378, 1523278682452, 1608043158269, 1592078013020, 1496188132472][i * 3 + n] || 1505740043378}?w=150&h=150&fit=crop&q=80`}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}