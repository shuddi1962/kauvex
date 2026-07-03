import Image from "next/image";
import ProductCard from "./ProductCard";
import { Product } from "@/lib/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CategoryBlock({
  title,
  bannerImage,
  bannerTag,
  products,
}: {
  title: string;
  bannerImage: string;
  bannerTag: string;
  products: Product[];
}) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="container-kauvex py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-2xl text-text-1">{title}</h2>
        <Link href={`/category/${slug}`} className="text-sm text-orange font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        <div className="relative rounded-2xl overflow-hidden h-full min-h-[260px] group cursor-pointer">
          <Image src={bannerImage} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <span className="inline-block bg-orange/90 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-2">
              Limited Time
            </span>
            <p className="font-display font-extrabold text-white text-xl leading-tight">{bannerTag}</p>
            <p className="text-xs text-white/70 mt-1">Shop the collection</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}