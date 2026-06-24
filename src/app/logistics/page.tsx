"use client";

import Link from "next/link";
import { Truck, Bike, Car, Building2, Users, Star, TrendingUp, Shield, CheckCircle2, ArrowRight, Zap, Package, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const partnerTypes = [
  { icon: Bike, title: "Independent Rider", vehicle: "Bicycle / Motorcycle", capacity: "Up to 20kg", coverage: "Local same-day", badge: "Start earning" },
  { icon: Car, title: "Independent Driver", vehicle: "Car / Station Wagon", capacity: "Up to 100kg", coverage: "Local same-day", badge: "Flexible hours" },
  { icon: Building2, title: "Courier Business", vehicle: "Multiple Riders/Drivers", capacity: "Varies by fleet", coverage: "Local + wider area", badge: "Scale your business" },
  { icon: Truck, title: "Freight Company", vehicle: "Vans / Trucks / Lorries", capacity: "100kg to tonnes", coverage: "Intercity interstate", badge: "High value loads" },
];

const stats = [
  { label: "Active Partners", value: "2,400+" },
  { label: "Cities Covered", value: "47" },
  { label: "Deliveries Completed", value: "850K+" },
  { label: "Avg. Partner Earnings", value: "₦180K/mo" },
];

export default function LogisticsNetworkPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="bg-navy border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <Link href="/logistics" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Kauvex <span className="text-orange">Logistics</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/logistics" className="text-sm text-white/80 hover:text-orange transition-colors">Home</Link>
            <Link href="/logistics/dashboard" className="text-sm text-white/80 hover:text-orange transition-colors">Dashboard</Link>
            <Link href="/logistics/register" className="text-sm text-white/80 hover:text-orange transition-colors">Become a Partner</Link>
            <Link href="/express" className="text-sm text-white/80 hover:text-orange transition-colors">Send a Package</Link>
          </nav>
          <Link href="/logistics/login" className="px-5 py-2 bg-orange text-white text-sm font-bold rounded-lg hover:bg-orange/90 transition-colors">Partner Login</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-navy/90 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-xl bg-orange flex items-center justify-center mb-5">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">Nigeria&apos;s largest independent delivery network</h1>
            <p className="text-lg text-white/70 mb-8 max-w-2xl">
              Join thousands of riders, drivers, courier businesses, and freight companies earning 
              on the Kauvex Logistics Network. Set your own hours, choose your jobs, get paid weekly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/logistics/register">
                <Button size="xl" className="bg-orange hover:bg-orange-600 text-white text-base px-8">
                  Become a Partner <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/express">
                <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 text-base px-8">
                  Send a Package
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl lg:text-3xl font-bold text-orange">{s.value}</p>
                <p className="text-sm text-text-4 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-text-1 mb-4">Choose your vehicle, earn on your terms</h2>
          <p className="text-text-3 text-center max-w-xl mx-auto mb-10">Four partner types — one platform. Whether you ride, drive, or run a fleet, there&apos;s a place for you.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerTypes.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-white rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-orange" />
                  </div>
                  <h3 className="font-bold text-text-1 mb-1">{p.title}</h3>
                  <span className="inline-block text-[10px] bg-orange-50 text-orange font-semibold px-2 py-0.5 rounded-full mb-3">{p.badge}</span>
                  <div className="space-y-1.5 text-xs text-text-4">
                    <p>Vehicle: {p.vehicle}</p>
                    <p>Capacity: {p.capacity}</p>
                    <p>Coverage: {p.coverage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-text-1 mb-4">How it works</h2>
          <p className="text-text-3 text-center max-w-xl mx-auto mb-10">Four simple steps to start earning.</p>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Register", desc: "Sign up with your details, vehicle info, and documents." },
              { step: "2", title: "Get Verified", desc: "We review and approve your application within 24 hours." },
              { step: "3", title: "Go Online", desc: "Set your availability and start receiving job offers." },
              { step: "4", title: "Earn", desc: "Complete deliveries, earn 70-80% of each fee. Paid weekly." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h3 className="font-bold text-text-1 text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-text-4">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Tiers */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-text-1 mb-4">Partner tier benefits</h2>
          <p className="text-text-3 text-center max-w-xl mx-auto mb-10">The more you deliver, the more you earn. Every tier unlocks better rewards.</p>
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Tier</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Requirements</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Payout</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Support</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { tier: "🟢 New Partner", req: "0–49 jobs", payout: "Weekly", support: "Self-service", bonus: "—" },
                  { tier: "🥉 Verified Partner", req: "50–199 jobs, 4.0+ rating", payout: "Daily or Weekly", support: "Email", bonus: "Priority jobs" },
                  { tier: "🥈 Trusted Partner", req: "200–999 jobs, 4.5+ rating", payout: "Daily", support: "Priority email + WhatsApp", bonus: "₦500/job above 98% on-time" },
                  { tier: "🥇 Premium Partner", req: "1000+ jobs, 4.8+ rating", payout: "Daily + same-day option", support: "Dedicated manager", bonus: "₦20K–₦100K monthly" },
                ].map((t) => (
                  <tr key={t.tier} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-text-1">{t.tier}</td>
                    <td className="px-4 py-3 text-text-2 text-xs">{t.req}</td>
                    <td className="px-4 py-3 text-text-2">{t.payout}</td>
                    <td className="px-4 py-3 text-text-2">{t.support}</td>
                    <td className="px-4 py-3 text-orange font-semibold text-xs">{t.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-text-1 mb-10">Why partner with Kauvex?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Zap, title: "Set your own schedule", desc: "Work when you want. Go online and offline from your dashboard." },
              { icon: TrendingUp, title: "Transparent earnings", desc: "See exactly what you'll earn before you accept any job." },
              { icon: Shield, title: "Kauvex Buyer Protection", desc: "You're protected. Disputes handled fairly with our support team." },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-xl border border-border p-6 text-center">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-orange" />
                  </div>
                  <h3 className="font-bold text-text-1 text-sm mb-1">{b.title}</h3>
                  <p className="text-xs text-text-4">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ship With The Network */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-text-1 mb-4">Send anything, anywhere</h2>
          <p className="text-text-3 text-center max-w-xl mx-auto mb-8">Pick a service level below and get an instant quote. No account needed.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {[
              { title: "Same-Day Courier", desc: "Within same city. 2-6 hours. For documents, parcels & small packages.", icon: Truck, price: "From ₦2,500", route: "/express/book?service=same-day" },
              { title: "Intercity Freight", desc: "Between cities/states. 1-3 days. For bulk goods, furniture & equipment.", icon: Package, price: "From ₦7,500", route: "/express/book?service=standard" },
              { title: "International", desc: "50+ countries. 3-14 days. For commercial & personal shipments worldwide.", icon: Globe, price: "From ₦25,000", route: "/express/book?service=express" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.title} href={s.route} className="bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-orange transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                    <Icon className="w-6 h-6 text-orange" />
                  </div>
                  <h3 className="font-bold text-text-1 mb-1">{s.title}</h3>
                  <p className="text-xs text-text-4 mb-3">{s.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-orange">{s.price}</span>
                    <span className="text-xs text-text-4 group-hover:text-orange flex items-center gap-1">Book Now <ArrowRight className="w-3 h-3" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center">
            <p className="text-sm text-text-4 mb-4">Not sure what you need? Use our instant quote calculator.</p>
            <Link href="/express">
              <Button size="lg" className="bg-orange hover:bg-orange-600 text-white px-8">
                Get a Quote <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} Kauvex Logistics. A division of Kauvex Commerce Cloud.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">Kauvex.com</Link>
            <Link href="/express" className="hover:text-white transition-colors">Express</Link>
            <Link href="/express/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
