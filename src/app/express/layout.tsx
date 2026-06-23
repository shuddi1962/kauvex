import Link from "next/link";
import { Package, Truck, ChevronDown } from "lucide-react";

export default function ExpressLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-navy border-b border-navy/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/express" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-syne font-700 text-lg tracking-tight">Kauvex</span>
                <span className="text-orange font-syne font-700 text-lg tracking-tight"> Express</span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/express" className="text-sm text-white/80 hover:text-orange transition-colors font-medium">Home</Link>
              <Link href="/express/book" className="text-sm text-white/80 hover:text-orange transition-colors font-medium">Send a Package</Link>
              <Link href="/express/track" className="text-sm text-white/80 hover:text-orange transition-colors font-medium">Track</Link>
              <Link href="/express/business" className="text-sm text-white/80 hover:text-orange transition-colors font-medium">Business</Link>
              <Link href="/contact" className="text-sm text-white/80 hover:text-orange transition-colors font-medium">Contact</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <span className="text-sm text-white/80 hover:text-orange transition-colors font-medium">Sign In</span>
              </Link>
              <Link
                href="/express/book"
                className="bg-orange hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                Ship Now
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-orange" />
                <span className="text-white font-syne font-700 text-lg">Kauvex Express</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                Ship anything, anywhere, fast. Powered by Nigeria&apos;s largest independent delivery network.
              </p>
            </div>
            <div>
              <h4 className="font-syne font-700 text-sm mb-4 text-white/90">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><Link href="/express/book" className="text-sm text-white/60 hover:text-orange transition-colors">Send a Package</Link></li>
                <li><Link href="/express/track" className="text-sm text-white/60 hover:text-orange transition-colors">Track Shipment</Link></li>
                <li><Link href="/express/business" className="text-sm text-white/60 hover:text-orange transition-colors">Express for Business</Link></li>
                <li><Link href="/express" className="text-sm text-white/60 hover:text-orange transition-colors">Get a Quote</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-syne font-700 text-sm mb-4 text-white/90">Services</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-white/60">Same-Day Delivery</span></li>
                <li><span className="text-sm text-white/60">Express Shipping</span></li>
                <li><span className="text-sm text-white/60">Standard Delivery</span></li>
                <li><span className="text-sm text-white/60">International Shipping</span></li>
                <li><span className="text-sm text-white/60">Freight & Cargo</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-syne font-700 text-sm mb-4 text-white/90">Contact</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-white/60">+234 700 528 839</span></li>
                <li><span className="text-sm text-white/60">express@kauvex.com</span></li>
                <li><span className="text-sm text-white/60">Mon–Sat, 8AM–6PM WAT</span></li>
                <li><span className="text-sm text-white/60">22 Allen Avenue, Ikeja, Lagos</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">© 2026 Kauvex Express. All rights reserved. A division of Kauvex Commerce Cloud.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-white/40 hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-white/40 hover:text-white/60 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
