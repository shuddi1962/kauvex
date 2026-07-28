"use client";

import Link from "next/link";
import {
  Shield,
  Search,
  Star,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Building2,
  UserCheck,
  Award,
  Diamond,
  Zap,
  Clock,
  Wrench,
  Users,
  HelpCircle,
  Sparkles,
} from "lucide-react";

const categories = [
  { name: "CCTV Installer", icon: Shield },
  { name: "Solar Installer", icon: Zap },
  { name: "Electrician", icon: Zap },
  { name: "Plumber", icon: Wrench },
  { name: "AC Technician", icon: Wrench },
  { name: "Network Engineer", icon: Users },
  { name: "Architect", icon: Building2 },
  { name: "Civil Engineer", icon: Building2 },
  { name: "Interior Designer", icon: Sparkles },
  { name: "Smart Home Specialist", icon: Zap },
  { name: "Security Consultant", icon: Shield },
  { name: "Welder/Fabricator", icon: Wrench },
];

const tiers = [
  {
    name: "Basic",
    icon: UserCheck,
    color: "bg-gray-500",
    textColor: "text-gray-600",
    borderColor: "border-gray-300",
    features: ["Identity verified", "Profile listing", "Limited search visibility"],
  },
  {
    name: "Certified",
    icon: Award,
    color: "bg-blue-600",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    features: ["All Basic features", "Credential verification", "Priority search ranking", "Certified badge"],
  },
  {
    name: "Gold",
    icon: Star,
    color: "bg-amber-500",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
    features: ["All Certified features", "Gold tier badge", "Featured in category pages", "Top 10 search ranking", "Priority support"],
  },
  {
    name: "Platinum",
    icon: Diamond,
    color: "bg-violet-600",
    textColor: "text-violet-700",
    borderColor: "border-violet-300",
    features: ["All Gold features", "Platinum tier badge", "Exclusive project invites", "#1 search placement", "Dedicated account manager", "Verified credentials highlighted"],
  },
];

const faqs = [
  { q: "What is Kauvex Pro Network?", a: "KPN is a platform connecting verified professionals with clients who need expert services across various trades and industries." },
  { q: "How do I get verified?", a: "Upload your credentials during registration. Our team reviews and verifies each qualification to assign your tier level." },
  { q: "Is there a fee to join?", a: "Basic registration is free. Premium tiers (Gold and Platinum) have a small monthly subscription for enhanced visibility and features." },
  { q: "How do clients find me?", a: "Clients search by category, location, and tier. Higher verification tiers get priority placement in search results." },
  { q: "Can I update my credentials later?", a: "Yes. You can add new credentials from your dashboard at any time. Each new credential goes through verification." },
  { q: "How do I get paid?", a: "Payment terms are agreed between you and the client. Kauvex Pro provides dispute resolution and escrow options for covered projects." },
];

export default function KPNLandingPage() {
  return (
    <div>
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 50%, rgba(255,107,0,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(255,107,0,0.15) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6">
              <Sparkles className="w-4 h-4 text-orange" />
              Trusted by 2,000+ verified professionals
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Hire Trusted<br />
              <span className="text-orange">Verified Professionals</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl mb-8">
              Kauvex Pro Network connects you with thoroughly vetted experts across
              engineering, trades, security, and design. Every professional is verified,
              rated, and ready to deliver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/pro/search"
                className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-8 py-3.5 rounded-lg transition-all shadow-lg shadow-orange/25"
              >
                <Search className="w-5 h-5" />
                Find a Professional
              </Link>
              <Link
                href="/pro/register"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-lg transition-colors"
              >
                <UserCheck className="w-5 h-5" />
                Join as a Professional
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-white/50">
              <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Verified</div>
              <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-orange" /> Insured</div>
              <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> Rated</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Find, vet, and hire in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, step: "01", title: "Search & Filter", desc: "Browse by category, location, tier, or rating to find the right professional for your project." },
              { icon: UserCheck, step: "02", title: "Review Profiles", desc: "Check credentials, ratings, past jobs, and verified badges to make an informed choice." },
              { icon: Star, step: "03", title: "Hire with Confidence", desc: "Contact, book, and pay with confidence knowing every pro is verified and accountable." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-orange" />
                </div>
                <div className="text-2xl font-bold text-navy/20 mb-1">{item.step}</div>
                <h3 className="font-semibold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">Professional Categories</h2>
            <p className="text-gray-500 max-w-xl mx-auto">32 categories spanning trades, engineering, design, and technology.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/pro/search?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:border-orange/30 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center">
                  <cat.icon className="w-5 h-5 text-orange" />
                </div>
                <span className="font-medium text-navy group-hover:text-orange transition-colors text-sm">{cat.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-orange transition-colors" />
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/pro/search"
              className="inline-flex items-center gap-2 text-orange font-semibold hover:underline"
            >
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">Verification Tiers</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Higher verification means greater trust, better visibility, and more opportunities.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {tiers.map((tier) => (
              <div key={tier.name} className={`rounded-xl border-2 ${tier.borderColor} p-6 bg-white hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 ${tier.color} rounded-xl flex items-center justify-center mb-4`}>
                  <tier.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-bold ${tier.textColor} mb-3`}>{tier.name}</h3>
                <ul className="space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-gray-200 group open:border-orange/30 open:ring-1 open:ring-orange/10">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-navy pr-4">{faq.q}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-white/70 mb-8">
            Whether you need a professional or want to offer your services, Kauvex Pro Network is your trusted platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pro/search"
              className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-10 py-4 rounded-lg transition-all shadow-lg shadow-orange/25 text-lg"
            >
              <Search className="w-5 h-5" /> Find a Professional
            </Link>
            <Link
              href="/pro/register"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-10 py-4 rounded-lg transition-colors text-lg"
            >
              <UserCheck className="w-5 h-5" /> Register as a Pro
            </Link>
          </div>
          <p className="text-white/40 text-sm mt-4">Free to join. No hidden fees.</p>
        </div>
      </section>
    </div>
  );
}