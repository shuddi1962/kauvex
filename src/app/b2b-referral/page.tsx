"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, TrendingUp, DollarSign, Users, Shield, Globe, BarChart3, Gift, ArrowRight, Check, Briefcase, Handshake, CheckCircle } from "lucide-react";

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
  { icon: DollarSign, title: "5% Recurring Commission", desc: "Earn for 12 months on every referred business account's net revenue" },
  { icon: Shield, title: "Dedicated Account Manager", desc: "Get a personal account manager to help close deals and track performance" },
  { icon: BarChart3, title: "Enterprise Tracking", desc: "Real-time dashboard with referral status, earnings, and conversion data" },
  { icon: Globe, title: "Global Reach", desc: "Refer businesses from any of our 15 operating countries worldwide" },
  { icon: Gift, title: "White-Label Reporting", desc: "Share branded performance reports with your network or stakeholders" },
  { icon: Users, title: "Priority Support", desc: "Fast-track support with dedicated B2B partner success team" },
];

const tiers = [
  {
    name: "Starter",
    commission: "5%",
    requirements: "0-5 referrals/month",
    color: "from-gray-500 to-gray-600",
    features: ["5% recurring commission (12 months)", "Standard reporting", "Email support", "90-day cookie window"],
  },
  {
    name: "Professional",
    commission: "7%",
    requirements: "6-20 referrals/month",
    color: "from-orange to-orange-600",
    popular: true,
    features: ["7% recurring commission (12 months)", "Advanced reporting", "Dedicated account manager", "90-day cookie window", "Co-branded materials"],
  },
  {
    name: "Enterprise",
    commission: "10%",
    requirements: "20+ referrals/month",
    color: "from-navy to-blue-800",
    features: ["10% recurring commission (12 months)", "White-label reporting", "Priority support", "Custom deal structures", "Quarterly business reviews"],
  },
];

const steps = [
  { number: "01", title: "Register", desc: "Create your B2B partner account in minutes — no fees, no commitments" },
  { number: "02", title: "Refer", desc: "Share Kauvex with businesses in your network using your unique referral link" },
  { number: "03", title: "Convert", desc: "We handle onboarding — you earn commission on every qualifying sale" },
  { number: "04", title: "Get Paid", desc: "Receive monthly recurring commissions via bank transfer, PayPal, or mobile money" },
];

export default function B2BReferralLandingPage() {
  return (
    <Suspense fallback={null}>
      <B2BPage />
    </Suspense>
  );
}

function B2BPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-blue-900 to-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <RegisteredBanner />
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-6">
              <Building2 className="w-4 h-4 text-orange" />
              <span>Kauvex Partners — B2B Referral Program</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-800 leading-tight mb-4">
              Refer Businesses.<br />
              Earn <span className="text-orange">Recurring</span> Commission.
            </h1>
            <p className="text-lg text-blue-200 mb-8 max-w-2xl">
              Earn up to 10% recurring commission for 12 months on every business you refer to Kauvex.
              Vendors, suppliers, and merchants — all qualify.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/partners/register/b2b"
                className="bg-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
              >
                Join as B2B Partner <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/partners/login"
                className="border border-white/30 hover:bg-white/10 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
              >
                Partner Login
              </Link>
            </div>
            <p className="text-blue-300 text-sm mt-4">Not a business referrer? Check out the <Link href="/creators" className="underline hover:text-white">Influencer Program</Link></p>
          </div>
        </div>
        <div className="h-2 bg-gradient-to-r from-orange via-yellow-500 to-orange" />
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10%", label: "Max Commission" },
              { value: "12 Months", label: "Recurring Period" },
              { value: "500+", label: "Active B2B Partners" },
              { value: "₦85M+", label: "Paid in Commissions" },
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
          <h2 className="text-2xl font-800 text-navy text-center mb-4">Why Join the B2B Referral Program?</h2>
          <p className="text-text-3 text-center mb-12 max-w-xl mx-auto">Recurring income, enterprise tools, and a dedicated team to help you succeed</p>
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
          <p className="text-text-3 text-center mb-12 max-w-xl mx-auto">The more businesses you refer, the higher your commission rate</p>
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
          <p className="text-center text-sm text-text-4 mt-6">Commissions recur monthly for 12 months from each referred business's first payment. No cap.</p>
        </div>
      </section>

      {/* Who Should Join */}
      <section className="py-16 bg-gray-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-800 text-navy text-center mb-4">Who Should Join?</h2>
          <p className="text-text-3 text-center mb-12 max-w-xl mx-auto">If you have a business network, you can earn</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Briefcase, title: "Consultants & Agencies", desc: "Refer your clients to Kauvex for their e-commerce needs and earn recurring income" },
              { icon: Handshake, title: "Industry Associations", desc: "Recommend Kauvex to your members and create a new revenue stream for your organization" },
              { icon: TrendingUp, title: "Sales Professionals", desc: "Leverage your existing network of business contacts to earn passive commission" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-xl border border-border p-5 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="font-semibold text-navy mb-1">{item.title}</h3>
                  <p className="text-sm text-text-3">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-800 text-navy text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: "What qualifies as a B2B referral?", a: "Any business (vendor, supplier, or merchant) that signs up on Kauvex through your referral link and completes at least one qualifying purchase within 90 days." },
              { q: "How long do commissions last?", a: "You earn commission for 12 months from the date of the referred business's first qualifying payment. Commission is paid monthly." },
              { q: "What commission rate do I get?", a: "Rates start at 5% and scale up to 10% based on your monthly referral volume. Tiers are reviewed monthly." },
              { q: "How do I get paid?", a: "Payouts are processed monthly via bank transfer, PayPal, or mobile money. Minimum payout threshold is $50." },
              { q: "Can I refer businesses from any country?", a: "Yes. Kauvex operates in 15 countries. You can refer businesses from any of our active markets." },
              { q: "Is there a cost to join?", a: "No. The B2B Referral Program is completely free. No fees, no subscriptions, no upfront costs." },
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
          <h2 className="text-3xl font-800 mb-3">Ready to Start Referring?</h2>
          <p className="text-blue-200 mb-4">Join hundreds of B2B partners earning recurring commissions</p>
          <Link
            href="/partners/register/b2b"
            className="bg-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
          >
            Join as B2B Partner <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-blue-300 text-sm mt-4">Not a business referrer? Check out the <Link href="/creators" className="underline hover:text-white">Influencer Program</Link></p>
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