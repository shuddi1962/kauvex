"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2, Users, Upload, Key, CreditCard, FileText,
  TrendingUp, BarChart3, Shield, ChevronRight, CheckCircle2,
  Zap, Globe, Star, Loader2, ArrowLeft, Tag, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Building2,
    title: "Saved Addresses",
    desc: "Store frequently used pickup and dropoff locations for one-click selection.",
  },
  {
    icon: Users,
    title: "Team Access",
    desc: "Create sub-accounts for staff with role-based permissions and spending limits.",
  },
  {
    icon: Upload,
    title: "Bulk Shipment Upload",
    desc: "Upload CSV with multiple shipments and book them all at once.",
  },
  {
    icon: Key,
    title: "API Access",
    desc: "Integrate Kauvex Express into your own order management or e-commerce system.",
  },
  {
    icon: Tag,
    title: "Custom Waybill Branding",
    desc: "Your company logo on waybills instead of Kauvex branding.",
  },
  {
    icon: FileText,
    title: "Monthly Invoicing",
    desc: "Consolidate all shipments into one monthly invoice with 30-day payment terms.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    features: [
      "Up to 10 shipments/month",
      "2 courier options",
      "Basic tracking",
      "Email support",
    ],
    cta: "Current plan",
    ctaStyle: "bg-gray-100 text-gray-500",
    popular: false,
  },
  {
    name: "Business",
    price: "₦25,000",
    period: "/month",
    features: [
      "Unlimited shipments",
      "All 18+ couriers",
      "Priority pickup scheduling",
      "Branded tracking page",
      "Shipping rules & automation",
      "Shopify / WooCommerce sync",
      "Phone + chat support",
    ],
    cta: "Upgrade now →",
    ctaStyle: "bg-[#FF6B00] hover:bg-[#e55f00] text-white",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    features: [
      "Dedicated account manager",
      "Custom SLAs",
      "API access + webhooks",
      "White-label option",
      "Multi-user / team access",
      "Monthly invoicing",
      "24/7 dedicated support",
    ],
    cta: "Contact sales →",
    ctaStyle: "bg-[#0A1628] hover:bg-[#0A1628]/90 text-white",
    popular: false,
  },
];

const billingOptions = [
  { title: "Pay-Per-Shipment", desc: "Pay as you go with card or bank transfer. No commitment.", popular: false },
  { title: "Monthly Invoice", desc: "Consolidated monthly bill with 30-day terms. Ideal for 50+ shipments/month.", popular: true },
  { title: "Prepaid Wallet", desc: "Top up in bulk and get volume discounts. Best rates for frequent shippers.", popular: false },
];

const volumeTiers = [
  { tier: "Bronze", volume: "10–49/mo", discount: "5%", support: "Standard business" },
  { tier: "Silver", volume: "50–199/mo", discount: "10%", support: "Priority support" },
  { tier: "Gold", volume: "200–499/mo", discount: "15%", support: "Priority support" },
  { tier: "Platinum", volume: "500+/mo", discount: "Negotiated", support: "Dedicated manager" },
];

export default function ExpressBusinessPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "", contactName: "", email: "", phone: "",
    monthlyShipments: "10-49", billingType: "per_shipment",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/v1/shipping/business-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: form.companyName,
          contact_name: form.contactName,
          contact_email: form.email,
          contact_phone: form.phone,
          billing_type: form.billingType,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-off-white min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link>
          <span>/</span>
          <Link href="/express" className="hover:text-blue">Express</Link>
          <span>/</span>
          <span className="text-text-1 font-medium">For Business</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-navy/90 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-xl bg-orange flex items-center justify-center mb-5">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-syne font-800 mb-3">Shipping that scales with your business</h1>
            <p className="text-lg text-white/70 mb-8">
              Volume discounts, team access, API integration, and dedicated support.
              Trusted by hundreds of businesses across Nigeria.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setShowForm(true)} size="xl" className="bg-orange hover:bg-orange-600 text-white text-base px-8">
                Create Free Account <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Link href="/express/book">
                <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 text-base px-8">
                  Book a Shipment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers - Roshana Style */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-syne font-700 text-center text-text-1 mb-4">Choose your plan</h2>
          <p className="text-text-3 text-center max-w-xl mx-auto mb-10">Start free, upgrade when you need more power.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-6 relative ${
                  tier.popular
                    ? "border-[#FF6B00] ring-1 ring-[#FF6B00] shadow-lg"
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FF6B00] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <p className="text-sm font-semibold text-text-1 mb-1">{tier.name}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold font-syne text-text-1">{tier.price}</span>
                  <span className="text-xs text-text-4">{tier.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-text-3 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {tier.popular ? (
                  <Button className={`w-full ${tier.ctaStyle}`}>{tier.cta}</Button>
                ) : (
                  <button className={`w-full h-10 rounded-lg text-sm font-semibold transition-colors ${tier.ctaStyle}`}>
                    {tier.cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-syne font-700 text-center text-text-1 mb-12">Everything your business needs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white rounded-xl p-6 border border-border">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-orange" />
                  </div>
                  <h3 className="font-syne font-600 text-sm text-text-1 mb-1">{f.title}</h3>
                  <p className="text-xs text-text-4">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Billing Options */}
      <section className="py-16 lg:py-20 bg-off-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-syne font-700 text-center text-text-1 mb-4">Billing that fits your volume</h2>
          <p className="text-text-3 text-center max-w-xl mx-auto mb-10">Choose the billing method that works best for your business size.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {billingOptions.map((opt) => (
              <div key={opt.title} className={`bg-white rounded-xl border ${opt.popular ? "border-orange ring-1 ring-orange" : "border-border"} p-6 relative`}>
                {opt.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange text-white text-[10px] font-bold px-3 py-1 rounded-full">Most Popular</span>
                )}
                <h3 className="font-syne font-700 text-sm text-text-1 mb-2">{opt.title}</h3>
                <p className="text-xs text-text-4">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volume Tiers */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-syne font-700 text-center text-text-1 mb-4">Volume discount tiers</h2>
          <p className="text-text-3 text-center max-w-xl mx-auto mb-10">The more you ship, the less you pay per package.</p>
          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Tier</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Monthly Volume</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Discount</th>
                  <th className="text-left px-4 py-3 font-semibold text-text-1">Support</th>
                </tr>
              </thead>
              <tbody>
                {volumeTiers.map((t) => (
                  <tr key={t.tier} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-text-1">{t.tier}</td>
                    <td className="px-4 py-3 text-text-2">{t.volume}</td>
                    <td className="px-4 py-3 text-orange font-semibold">{t.discount}</td>
                    <td className="px-4 py-3 text-text-3">{t.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      {showForm && !submitted && (
        <section className="py-16 bg-off-white">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-white rounded-2xl border border-border p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-syne font-700 text-text-1">Create Business Account</h2>
                <button onClick={() => setShowForm(false)} className="text-sm text-text-4 hover:text-text-2"><ArrowLeft className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-3 mb-1">Company Name</label>
                  <input type="text" required value={form.companyName} onChange={e => update("companyName", e.target.value)} placeholder="Your Company Ltd" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-3 mb-1">Contact Name</label>
                  <input type="text" required value={form.contactName} onChange={e => update("contactName", e.target.value)} placeholder="John Doe" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1">Email</label>
                    <input type="email" required value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@company.com" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1">Phone</label>
                    <input type="tel" required value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="08031234567" className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-3 mb-1">Monthly Shipments</label>
                  <select value={form.monthlyShipments} onChange={e => update("monthlyShipments", e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange">
                    <option value="1-9">1–9 shipments</option>
                    <option value="10-49">10–49 shipments</option>
                    <option value="50-199">50–199 shipments</option>
                    <option value="200-499">200–499 shipments</option>
                    <option value="500+">500+ shipments</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-3 mb-1">Preferred Billing</label>
                  <select value={form.billingType} onChange={e => update("billingType", e.target.value)} className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange">
                    <option value="per_shipment">Pay Per Shipment</option>
                    <option value="monthly_invoice">Monthly Invoice</option>
                    <option value="prepaid_wallet">Prepaid Wallet</option>
                  </select>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button type="submit" disabled={submitting} className="w-full bg-orange hover:bg-orange-600 text-white font-bold h-10">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Creating Account...</> : "Create Business Account"}
                </Button>
                <p className="text-[10px] text-text-4 text-center">By creating an account, you agree to our <Link href="/express/terms" className="text-orange hover:underline">Terms of Service</Link>.</p>
              </form>
            </div>
          </div>
        </section>
      )}

      {submitted && (
        <section className="py-16 bg-off-white">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-syne font-700 text-text-1 mb-2">Registration submitted!</h2>
              <p className="text-sm text-text-3 mb-6">We will review your application and get back to you within 24 hours with your account details.</p>
              <Link href="/express/book">
                <Button className="bg-orange hover:bg-orange-600 text-white">Start Shipping</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!showForm && !submitted && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-orange to-orange-600 rounded-2xl p-8 lg:p-12 text-center">
              <h2 className="text-2xl lg:text-3xl font-syne font-700 text-white mb-2">Ready to transform your shipping?</h2>
              <p className="text-white/80 mb-6 max-w-lg mx-auto">Create a business account in minutes. No minimum volume required.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button onClick={() => setShowForm(true)} size="xl" className="bg-navy hover:bg-navy/90 text-white text-base px-10">
                  Create Business Account <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Link href="/contact">
                  <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10 text-base px-10">
                    Request Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
