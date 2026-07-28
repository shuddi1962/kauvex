"use client";

import Link from "next/link";
import {
  Gift,
  Users,
  TrendingUp,
  Building2,
  ArrowRight,
  BarChart3,
  Link2,
  DollarSign,
  Smartphone,
  Globe,
  CheckCircle,
  Star,
} from "lucide-react";

export default function PartnersLandingPage() {
  const programs = [
    {
      title: "Kauvex Associates",
      tagline: "Earn commissions on every sale you refer.",
      icon: Users,
      features: [
        "Up to 15% commission on referred sales",
        "30-day cookie window",
        "Real-time dashboard & analytics",
        "Dedicated affiliate tracking IDs",
        "Monthly payouts via Bank/PayPal/Payoneer",
        "Promotional banners & creatives",
      ],
      cta: "Join as an Associate",
      href: "/partners/register/associate",
      highlight: true,
    },
    {
      title: "Kauvex Influencers",
      tagline: "Monetize your audience with exclusive brand deals.",
      icon: Star,
      features: [
        "Custom discount codes for followers",
        "Sponsored product collaborations",
        "Tiered commission up to 25%",
        "Personal storefront to curate picks",
        "Early access to new products",
        "Performance bonuses & bounties",
      ],
      cta: "Join as an Influencer",
      href: "/partners/register/influencer",
      highlight: false,
    },
    {
      title: "B2B Referral Program",
      tagline: "Earn recurring commissions on business clients.",
      icon: Building2,
      features: [
        "Refer vendors, suppliers & merchants",
        "Recurring commission for 12 months",
        "Enterprise-level tracking",
        "Dedicated account manager",
        "White-label reporting",
        "Priority support",
      ],
      cta: "Join as B2B Partner",
      href: "/partners/register/b2b",
      highlight: false,
    },
  ];

  const stats = [
    { label: "Active Partners", value: "5,000+" },
    { label: "Commissions Paid", value: "₦125M+" },
    { label: "Products Available", value: "500K+" },
    { label: "Avg. Commission Rate", value: "12%" },
  ];

  const steps = [
    {
      step: "01",
      title: "Sign Up Free",
      desc: "Create your account in under 2 minutes. No upfront fees, no minimums.",
      icon: Gift,
    },
    {
      step: "02",
      title: "Share Your Links",
      desc: "Promote products you love using your unique tracking links across your channels.",
      icon: Link2,
    },
    {
      step: "03",
      title: "Track Performance",
      desc: "Monitor clicks, conversions, and commissions in real-time from your dashboard.",
      icon: BarChart3,
    },
    {
      step: "04",
      title: "Get Paid",
      desc: "Receive your earnings monthly via bank transfer, PayPal, Payoneer, or Kauvex Wallet.",
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full border border-white/20" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-white/10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6">
              <Gift className="w-4 h-4 text-orange" />
              Join 5,000+ partners already earning
            </div>
            <h1 className="font-syne font-800 text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Earn by sharing<br />
              <span className="text-orange">what you love.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl mb-8">
              Turn your influence into income. Join the Kauvex Partner Program and earn
              commissions on every sale you refer — whether you are a creator, blogger, or business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/partners/register/associate"
                className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-8 py-3.5 rounded-lg transition-all shadow-lg shadow-orange/25"
              >
                Start Earning Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/partners/register/influencer"
                className="inline-flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-3.5 rounded-lg transition-colors"
              >
                Influencer? Apply Here
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-syne font-800 text-navy mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-700 text-3xl text-navy mb-3">
              Choose Your Path
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Whether you are just starting out or already have an audience, there is a program for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div
                key={program.title}
                className={`rounded-2xl p-8 border transition-shadow ${
                  program.highlight
                    ? "bg-white border-orange/20 shadow-lg shadow-orange/5 ring-1 ring-orange/20"
                    : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  program.highlight ? "bg-orange" : "bg-navy"
                }`}>
                  <program.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-syne font-700 text-xl text-navy mb-2">{program.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{program.tagline}</p>
                <ul className="space-y-3 mb-8">
                  {program.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-orange mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={program.href}
                  className={`inline-flex items-center justify-center gap-2 w-full font-semibold px-6 py-2.5 rounded-lg transition-colors ${
                    program.highlight
                      ? "bg-orange text-white hover:bg-orange/90"
                      : "border-2 border-navy text-navy hover:bg-navy hover:text-white"
                  }`}
                >
                  {program.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syne font-700 text-3xl text-navy mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Four simple steps to start earning commissions.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((stepItem) => (
              <div key={stepItem.step} className="text-center">
                <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stepItem.icon className="w-7 h-7 text-orange" />
                </div>
                <div className="text-2xl font-syne font-800 text-navy/20 mb-1">{stepItem.step}</div>
                <h3 className="font-semibold text-navy mb-2">{stepItem.title}</h3>
                <p className="text-sm text-gray-500">{stepItem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange/5 via-orange/10 to-orange/5 rounded-2xl border border-orange/20 p-8 text-center">
            <h3 className="font-syne font-700 text-xl text-navy mb-2">Want higher commissions & exclusive perks?</h3>
            <p className="text-gray-500 text-sm mb-4 max-w-xl mx-auto">
              Our <strong>Creator Program</strong> offers up to 12% commission, early product access, co-branded content opportunities, and dedicated support for content creators with an audience.
            </p>
            <Link
              href="/creators"
              className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-all"
            >
              Explore the Creator Program <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-navy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne font-700 text-3xl text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-white/70 mb-8">
            Join thousands of partners who are already earning commissions by sharing products they love.
          </p>
          <Link
            href="/partners/register/associate"
            className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-10 py-4 rounded-lg transition-all shadow-lg shadow-orange/25 text-lg"
          >
            Join Kauvex Partners Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/40 text-sm mt-4">No credit card required. Free to join.</p>
        </div>
      </section>
    </div>
  );
}
