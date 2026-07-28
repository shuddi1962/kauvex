"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, TrendingUp, DollarSign, Star, Users, Share2, BarChart3, Gift, ArrowRight, Check, CheckCircle } from "lucide-react";

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
  { icon: DollarSign, title: "Up to 12% Commission", desc: "Earn more than standard affiliates with our creator commission tiers" },
  { icon: Gift, title: "Early Product Access", desc: "Get free samples and early access to launch new products before anyone else" },
  { icon: BarChart3, title: "Content Analytics", desc: "See exactly which content drives sales and optimize your strategy" },
  { icon: Star, title: "Exclusive Deals", desc: "Partner with top brands for exclusive discount codes your audience will love" },
  { icon: Users, title: "Dedicated Support", desc: "Priority support and a dedicated creator success manager" },
  { icon: Share2, title: "Co-Branded Content", desc: "Get featured on Kauvex channels — blog, social media, and email" },
];

const tiers = [
  {
    name: "Creator",
    commission: "8%",
    requirements: "0-5K followers",
    color: "from-gray-500 to-gray-600",
    features: ["Standard commission rates", "Basic analytics", "Product catalog access", "Standard support"],
  },
  {
    name: "Premium Creator",
    commission: "10%",
    requirements: "5K-50K followers",
    color: "from-orange to-orange-600",
    popular: true,
    features: ["Higher commission rates", "Advanced analytics", "Early product access", "Dedicated support", "Co-branded opportunities"],
  },
  {
    name: "Elite Creator",
    commission: "12%+",
    requirements: "50K+ followers",
    color: "from-navy to-blue-800",
    features: ["Highest commission rates", "Full analytics suite", "Custom partnership deals", "Priority support", "Featured placement in Kauvex Live", "Annual creator summit invite"],
  },
];

const steps = [
  { number: "01", title: "Apply", desc: "Fill out our quick application form with your social profiles and niche" },
  { number: "02", title: "Get Approved", desc: "Our team reviews your application within 48 hours" },
  { number: "03", title: "Start Creating", desc: "Access your dashboard, pick products, and start sharing your affiliate links" },
  { number: "04", title: "Earn & Grow", desc: "Track your earnings, unlock higher tiers, and build your creator business" },
];

export default function InfluencerLandingPage() {
  return (
    <Suspense fallback={null}>
      <InfluencerPage />
    </Suspense>
  );
}

function InfluencerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-blue-900 to-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <RegisteredBanner />
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-6">
              <Camera className="w-4 h-4 text-orange" />
              <span>Kauvex Partners — Influencer Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-800 leading-tight mb-4">
              Turn Your Content<br />
              Into <span className="text-orange">Revenue</span>
            </h1>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl">
              Join the Kauvex Influencer Program and earn up to 12% commission on every sale you drive.
              Get early product access, exclusive deals, and tools to grow your creator business.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/partners/register/influencer"
                className="bg-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/partners/login"
                className="border border-white/30 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
              >
                Creator Login
              </Link>
            </div>
          </div>
        </div>
        <div className="h-2 bg-gradient-to-r from-orange via-yellow-500 to-orange" />
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "12%", label: "Max Commission" },
              { value: "10,000+", label: "Active Creators" },
              { value: "48hrs", label: "Approval Time" },
              { value: "₦500M+", label: "Paid to Creators" },
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
          <h2 className="text-2xl font-800 text-navy text-center mb-4">Why Join the Influencer Program?</h2>
          <p className="text-text-3 text-center mb-12 max-w-xl mx-auto">More than just commissions — tools, support, and opportunities to grow your brand</p>
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
          <h2 className="text-2xl font-800 text-navy text-center mb-4">Creator Tiers</h2>
          <p className="text-text-3 text-center mb-12 max-w-xl mx-auto">The more you grow, the more you earn. Unlock higher tiers as your audience expands</p>
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
              { q: "Who can join the Creator Program?", a: "Anyone with a social media following, blog, or content platform. We accept creators across all niches — tech, fashion, beauty, food, lifestyle, and more." },
              { q: "How do I get paid?", a: "You can receive payments via bank transfer, PayPal, Payoneer, or your Kauvex Wallet. Payouts are processed monthly for confirmed commissions." },
              { q: "How are commissions tracked?", a: "When your followers click your unique affiliate link and make a purchase within 30 days, you earn commission. Our tracking system records every click and conversion." },
              { q: "Can I upgrade my tier?", a: "Yes! Tiers are automatically reviewed monthly based on your follower growth and sales performance. Higher tiers unlock better rates and benefits." },
              { q: "Is there a cost to join?", a: "No. The Kauvex Creator Program is completely free to join. You only earn money — there are no fees or subscription costs." },
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
          <p className="text-lg text-blue-200 mb-8 max-w-2xl">
                Join thousands of influencers already earning on Kauvex
              </p>
<Link
                href="/partners/register/associate"
                className="bg-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
              >
                Join Kauvex Partners <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-blue-200 text-sm">Not an influencer? Explore the <Link href="/b2b-referral" className="underline hover:text-white">B2B Referral Program</Link></p>
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