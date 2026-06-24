import Link from "next/link";
import { Truck, Shield, MapPin, Clock } from "lucide-react";

export default function ExpressBanner() {
  return (
    <section className="py-10 lg:py-14 bg-gradient-to-br from-[#0A1628] to-blue-950 text-white">
      <div className="w-full max-w-[1440px] mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange flex items-center justify-center mb-5">
              <Truck size={24} className="text-white" />
            </div>
            <h2 className="text-2xl lg:text-4xl font-bold tracking-tight mb-3">
              Ship with <span className="text-orange">Kauvex Express</span>
            </h2>
            <p className="text-white/70 text-sm lg:text-base mb-6 max-w-lg leading-relaxed">
              Send packages anywhere in Nigeria and to 50+ countries worldwide. 
              Instant quotes, real-time tracking, and the best delivery experience.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-orange shrink-0" />
                <span className="text-xs text-white/80">Buyer Protection on every shipment</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-orange shrink-0" />
                <span className="text-xs text-white/80">36 states + 50 countries</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-orange shrink-0" />
                <span className="text-xs text-white/80">Same-day in your city</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-orange shrink-0" />
                <span className="text-xs text-white/80">Real-time GPS tracking</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/express/book"
                className="inline-flex items-center gap-2 px-6 h-11 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors"
              >
                Send a Package
              </Link>
              <Link
                href="/express/track"
                className="inline-flex items-center gap-2 px-6 h-11 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                Track Shipment
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-72 h-72 rounded-full bg-orange/10 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-orange/20 flex items-center justify-center">
                  <Truck size={80} className="text-orange" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-orange text-white text-xs font-bold px-4 py-2 rounded-full">
                From ₦2,500
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
