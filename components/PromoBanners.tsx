import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function PromoBanners() {
  const banners = [
    { title: "Black Friday", subtitle: "Up to 70% off everything", size: "lg", theme: "from-navy to-navy-light", tag: "Ends Soon" },
    { title: "Cyber Monday", subtitle: "24 hours only", size: "md", theme: "from-orange to-orange-dark", tag: "Flash" },
    { title: "Weekend Deals", subtitle: "Fresh drops every Friday", size: "md", theme: "from-violet-600 to-violet-700", tag: "New" },
  ];

  return (
    <section className="container-kauvex py-6">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <Link
          href="/deals"
          className={`relative rounded-2xl overflow-hidden h-56 bg-gradient-to-br ${banners[0].theme} flex flex-col justify-center px-8 text-white group`}
        >
          <span className="inline-block w-fit bg-orange text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            {banners[0].tag}
          </span>
          <p className="font-display font-extrabold text-3xl text-white">{banners[0].title}</p>
          <p className="text-white/70 mt-1 text-sm">{banners[0].subtitle}</p>
          <span className="inline-flex items-center gap-1 text-xs text-orange font-semibold mt-3 group-hover:gap-2 transition-all">
            Shop Now <ArrowRight size={12} />
          </span>
        </Link>

        <div className="grid grid-rows-2 gap-4">
          {banners.slice(1).map((b) => (
            <Link
              key={b.title}
              href="/deals"
              className={`relative rounded-2xl overflow-hidden px-6 flex flex-col justify-center text-white bg-gradient-to-br ${b.theme} group`}
            >
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Zap size={16} className="text-white/40" />
              </div>
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{b.tag}</span>
              <p className="font-display font-bold text-xl text-white mt-0.5">{b.title}</p>
              <p className="text-white/70 text-sm">{b.subtitle}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}