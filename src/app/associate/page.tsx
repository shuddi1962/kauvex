"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Gift, TrendingUp, DollarSign, Users, BarChart3, Link2, Globe, ArrowRight, Check, ShoppingCart, Target, CheckCircle } from "lucide-react";

function RegisteredBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("registered") !== "true") return null;
  return (
    <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-300 shrink-0 mt-0.5" />
      <div>
        <p className="text-green-200 font-semibold text-sm">Registration Successful!</p>
        <p className="text-green-300 text-sm">Your account has been created. <Link href="/partners/login" className="underline font-semibold hover:text-white">Sign in to your dashboard</Link></p>
      </div>
    </div>
  );
}

const benefits = [
  { icon: DollarSign, title: "Up to 15% Commission", desc: "Earn competitive commissions on every sale you refer — no cap on earnings" },
  { icon: Gift, title: "30-Day Cookie Window", desc: "Earn commission on any purchase made within 30 days of a referral click" },
  { icon: BarChart3, title: "Real-Time Dashboard", desc: "Track clicks, conversions, and commissions in real-time from your dashboard" },
  { icon: Link2, title: "Unique Tracking IDs", desc: "Get dedicated affiliate links and tracking IDs for every campaign you run" },
  { icon: Globe, title: "Global Products", desc: "Promote millions of products across 15 countries with localized storefronts" },
  { icon: Users, title: "Dedicated Support", desc: "Access promotional creatives, banners, and a dedicated affiliate success team" },
];

const tiers = [
  {
    name: "Starter",
    commission: "Up to 10%",
    requirements: "0-20 sales/month",
    color: "from-gray-500 to-gray-600",
    features: ["Standard commission rates", "Real-time dashboard", "Affiliate tracking links", "Email support"],
  },
  {
    name: "Professional",
    commission: "Up to 12%",
    requirements: "21-100 sales/month",
    color: "from-orange to-orange-600",
    popular: true,
    features: ["Increased commission rates", "Advanced analytics", "Promotional banners", "Priority support", "Monthly bonus opportunities"],
  },
  {
    name: "Elite",
    commission: "Up to 15%",
    requirements: "100+ sales/month",
    color: "from-navy to-blue-800",
    features: ["Highest commission rates", "Full analytics suite", "Custom creatives", "Dedicated account manager", "Exclusive early access"],
  },
];

const steps = [
  { number: "01", title: "Sign Up Free", desc: "Create your account in under 2 minutes — no fees, no minimums" },
  { number: "02", title: "Grab Your Links", desc: "Get unique affiliate links for any product on Kauvex" },
  { number: "03", title: "Share & Earn", desc: "Share your links on social media, blogs, or anywhere your audience is" },
  { number: "04", title: "Get Paid", desc: "Receive monthly payouts via bank transfer, PayPal, or Payoneer" },
];

export default function AssociateLandingPage() {
  return (
    <Suspense fallback={null}>
      <AssociatePage />
    </Suspense>
  );
}

function AssociatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-blue-900 to-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <RegisteredBanner />
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-6">
              <Gift className="w-4 h-4 text-orange" />
              <span>Kauvex Partners — Associate Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-800 leading-tight mb-4">
              Earn Commissions<br />
              on Every <span className="text-orange">Sale You Refer</span>
            </h1>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl">
              Join the Kauvex Associate Program and earn up to 15% commission on every sale you refer.
              No inventory, no customer service — just share links and earn.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/partners/register/associate"
                className="bg-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
              >
                Join for Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/partners/login"
                className="border border-white/30 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
              >
                Associate Login
              </Link>
            </div>
            <p className="text-blue-300 text-sm mt-4">Also explore our <Link href="/creators" className="underline hover:text-white">Influencer Program</Link> or <Link href="/b2b-referral" className="underline hover:text-white">B2B Referral Program</Link></p>
          </div>
        </div>
        <div className="h-2 bg-gradient-to-r from-orange via-yellow-500 to-orange" />
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "15%", label: "Max Commission" },
              { value: "5,000+", label: "Active Associates" },
              { value: "500K+", label: "Products to Promote" },
              { value: "₦125M+", label: "Commissions Paid" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-800 text-navy">{stat.value}</div>
                <div className="text-sm text-text-3 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-800 text-navy text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-14 h-14 rounded-full bg-orange/10 text-orange flex items-center justify-center text-lg font-800 mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-semibold text-navy mb-1">{step.title}</h3>
                <p className="text-sm text-text-3">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-800 text-navy text-center mb-4">Why Join the Associate Program?</h2>
          <p className="text-text-3 text-center mb-12 max-w-xl mx-auto">Everything you need to start earning — no upfront costs, no inventory, no hassle</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-orange" />
                  </div>
                  <h3 className="font-semibold text-navy mb-1">{b.title}</h3>
                  <p className="text-sm text-text-3">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-800 text-navy text-center mb-4">Commission Tiers</h2>
          <p className="text-text-3 text-center mb-12 max-w-xl mx-auto">The more you sell, the more you earn. Unlock higher rates as your volume grows</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div key={tier.name} className={`relative bg-white rounded-xl border ${tier.popular ? "border-orange ring-2 ring-orange/20" : "border-border"} p-6 hover:shadow-lg transition-shadow`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={`h-2 rounded-full bg-gradient-to-r ${tier.color} mb-4`} />
                <h3 className="text-lg font-700 text-navy">{tier.name}</h3>
                <div className="text-3xl font-800 text-navy my-3">{tier.commission}</div>
                <p className="text-xs text-text-4 mb-4">{tier.requirements}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="text-sm text-text-2 flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 border-y border-border">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-800 text-navy text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: "How do I become an Associate?", a: "Sign up for free in under 2 minutes. Once approved, you get access to your dashboard and can start generating affiliate links immediately." },
              { q: "How much can I earn?", a: "Commission rates start at up to 10% and go up to 15% based on your monthly sales volume. There is no cap on how much you can earn." },
              { q: "How do I get paid?", a: "Payouts are processed monthly via bank transfer, PayPal, or Payoneer. Minimum payout threshold is ₦5,000 or equivalent." },
              { q: "What can I promote?", a: "Any of the 500,000+ products on Kauvex across electronics, fashion, home, beauty, and more. You get unique tracking links for each product." },
              { q: "How long does the cookie last?", a: "Our cookie window is 30 days. Any qualifying purchase made within 30 days of a customer clicking your link is credited to you." },
              { q: "Is there a cost to join?", a: "No. The Associate Program is completely free to join. No membership fees, no minimum sales requirements." },
            ].map((faq) => (
              <details key={faq.q} className="bg-white rounded-xl border border-border group">
                <summary className="px-5 py-4 font-medium text-sm text-navy cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-text-3 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-sm text-text-3">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-navy to-blue-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-800 mb-3">Ready to Start Earning?</h2>
          <p className="text-blue-200 mb-8">Join thousands of associates already earning on Kauvex. It's free to join.</p>
          <Link
            href="/partners/register/associate"
            className="bg-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
          >
            Join Kauvex Associates Free <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-blue-300 text-sm mt-4">Check out our <Link href="/creators" className="underline hover:text-white">Influencer Program</Link> or <Link href="/b2b-referral" className="underline hover:text-white">B2B Referral Program</Link></p>
        </div>
      </section>
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}