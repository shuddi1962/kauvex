import Link from "next/link";
import * as Icons from "lucide-react";
import { categoryIcons } from "@/lib/data";

export default function CategoryIcons() {
  return (
    <section className="container-kauvex py-8">
      <h2 className="font-display font-bold text-2xl text-text-1 mb-6">Shop by Category</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {categoryIcons.map((c) => {
          const Icon = (Icons as any)[c.icon] ?? Icons.ShoppingBag;
          return (
            <Link
              key={c.id}
              href={c.href}
              className="flex flex-col items-center gap-3 group p-4 rounded-xl hover:bg-orange-50 transition-all duration-300"
            >
              <span className="w-16 h-16 rounded-full bg-gray-50 border border-border flex items-center justify-center text-text-3 group-hover:bg-orange group-hover:text-white group-hover:border-orange group-hover:-translate-y-1 transition-all duration-300">
                <Icon className="w-7 h-7" />
              </span>
              <span className="text-xs font-semibold text-text-3 group-hover:text-orange transition-colors">
                {c.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}