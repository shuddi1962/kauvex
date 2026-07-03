import { brands } from "@/lib/homepage-data";

export default function BrandSlider() {
  const loop = [...brands, ...brands];

  return (
    <section className="border-y border-border bg-gray-50/50 py-6 overflow-hidden">
      <div className="container-kauvex mb-4">
        <p className="font-display font-semibold text-sm text-text-4">Trusted Brands</p>
      </div>
      <div className="flex gap-16 w-max animate-marquee">
        {loop.map((b, i) => (
          <span
            key={`${b.id}-${i}`}
            className="text-xl font-display font-bold text-text-4/30 hover:text-orange transition-colors whitespace-nowrap cursor-pointer"
          >
            {b.name}
          </span>
        ))}
      </div>
    </section>
  );
}