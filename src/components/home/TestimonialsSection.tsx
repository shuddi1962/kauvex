"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  { name: "Chioma Eze", role: "Verified Buyer", text: "KAUVEX has completely changed how I shop for electronics. The prices are competitive and delivery to Port Harcourt is always on time.", rating: 5 },
  { name: "Ahmed Bello", role: "Verified Buyer", text: "I sell on KAUVEX and buy from KAUVEX. The platform is intuitive, support is responsive, and my sales have grown 300% in 6 months.", rating: 5 },
  { name: "Yetunde Ogunlesi", role: "Verified Buyer", text: "The buyer protection gave me confidence to try a new vendor. Product arrived perfectly and the quality exceeded expectations.", rating: 4 },
  { name: "Emeka Nwosu", role: "Premium Seller", text: "As a vendor, the analytics and advertising tools are game-changing. I can track exactly where my sales come from and optimize accordingly.", rating: 5 },
  { name: "Funmi Adeleke", role: "Verified Buyer", text: "From fashion to home appliances, I get everything on KAUVEX. The loyalty points are a nice bonus that keeps me coming back.", rating: 4 },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const t = testimonials[current];

  return (
    <section className="bg-navy py-16">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-syne font-bold text-3xl text-white mb-2">What Our Customers Say</h2>
          <p className="text-white/60 text-sm">Join millions of satisfied shoppers on KAUVEX</p>
        </div>

        <div className="max-w-2xl mx-auto relative"
          onMouseEnter={() => setAutoPlay(false)}
          onMouseLeave={() => setAutoPlay(true)}
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 text-center">
            <Quote size={32} className="text-white/10 mx-auto mb-6" />
            <p className="text-white/90 text-lg leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < t.rating ? "fill-yellow-400 text-yellow-400" : "text-white/20"} />
              ))}
            </div>
            <p className="text-white font-bold">{t.name}</p>
            <p className="text-white/50 text-sm">{t.role}</p>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === current ? "bg-white w-6" : "bg-white/30"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrent((prev) => (prev + 1) % testimonials.length)}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
