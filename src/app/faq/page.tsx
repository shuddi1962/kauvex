"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqCategories = [
  {
    name: "General",
    faqs: [
      { q: "What is KAUVEX?", a: "KAUVEX is a leading marketplace for quality products across electronics, fashion, home, beauty, sports, and more. We serve customers worldwide with a seamless shopping experience." },
      { q: "Where are you located?", a: "Our headquarters is in Lagos, Nigeria. We also have offices in Abuja and Bayelsa." },
      { q: "Do you ship internationally?", a: "Yes, we ship to over 20 countries worldwide. International shipping rates and delivery estimates are calculated at checkout." },
      { q: "What brands do you carry?", a: "We carry top brands including Apple, Samsung, Sony, Nike, Adidas, LG, Dyson, Puma, and many more across all categories." },
    ],
  },
  {
    name: "Orders & Shipping",
    faqs: [
      { q: "How do I track my order?", a: "Visit the Track Order page from the top navigation or go to /track-order. Enter your order ID to see real-time tracking with timeline updates." },
      { q: "How long does delivery take?", a: "Standard: 3-5 business days. Express: 1-2 business days. International: 7-14 business days depending on destination." },
      { q: "Can I choose which branch fulfills my order?", a: "Yes. During checkout, you can select the fulfillment branch. The system auto-selects the nearest branch with stock, but you can override this." },
      { q: "Is free shipping available?", a: "Orders over ₦100,000 qualify for free standard shipping within Nigeria. Free shipping promotions are also available during sales events." },
    ],
  },
  {
    name: "Payments & Pricing",
    faqs: [
      { q: "What payment methods do you accept?", a: "Credit/Debit Cards, Bank Transfer, USSD, Mobile Money, Cryptocurrency (Bitcoin, USDT), KAUVEX Wallet, and Pay on Delivery (select areas)." },
      { q: "Why do I see prices in a different currency?", a: "We auto-detect your location and display prices in your local currency. The NGN equivalent is always shown below. You can change currency from the top navigation." },
      { q: "Are all payments processed in Naira?", a: "Yes. Regardless of the display currency, all payments are processed in Nigerian Naira (NGN). Your bank handles the conversion." },
      { q: "Do you offer bulk/wholesale pricing?", a: "Yes. Apply for a B2B account at /wholesale to access wholesale pricing, volume discounts, and NET payment terms." },
    ],
  },
  {
    name: "Products & Warranty",
    faqs: [
      { q: "Are your products genuine?", a: "100% genuine. We work with authorized distributors and verified sellers. Every product comes with manufacturer warranty or seller guarantee." },
      { q: "How does the warranty work?", a: "Register your product in My Account after purchase. Warranty covers manufacturing defects. Duration varies by product (typically 1-3 years). Visit /services/maintenance for warranty claims." },
      { q: "Can you source products not listed?", a: "Yes. Use our Quote & Sourcing system at /quote. Describe what you need and we'll source it from our global supplier network, usually within 3-7 days." },
      { q: "Do you have a mobile app?", a: "Yes! Our mobile app is available for iOS and Android. Download it for a faster shopping experience, push notifications, and exclusive app-only deals." },
    ],
  },
  {
    name: "Services & Installation",
    faqs: [
      { q: "How do I track my order?", a: "Visit the Track Order page from the top navigation or go to /track-order. Enter your order ID to see real-time tracking with timeline updates." },
      { q: "Can I return an item?", a: "Most items can be returned within 14 days of delivery if unused and in original packaging. Visit our Returns page to initiate a return." },
      { q: "How do I contact customer support?", a: "You can reach us via live chat, email at support@kauvex.com, or call us during business hours. Visit our Contact page for more details." },
      { q: "Do you offer volume discounts?", a: "Yes. Apply for a B2B account at /wholesale to access wholesale pricing, volume discounts, and NET payment terms." },
    ],
  },
  {
    name: "Account & Security",
    faqs: [
      { q: "How do I create an account?", a: "Click My Account in the header → Create Account. Fill in your details and verify your email. Your account gives you access to order tracking, wishlists, wallet, and more." },
      { q: "How does the loyalty program work?", a: "Earn points on every purchase. Progress through tiers (Bronze → Silver → Gold → Platinum) for increasing perks: discounts, free shipping, priority support, and exclusive access to deals." },
      { q: "How does the wallet work?", a: "Top up via bank transfer or card. Use wallet balance for instant checkout. Receive refunds and loyalty rewards directly in your wallet. Withdraw to bank anytime." },
      { q: "Can I become a vendor/seller?", a: "Yes. Register as a vendor at /vendor/register. Once approved, you get your own dashboard, product listings, and storefront." },
    ],
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    faqs: cat.faqs.filter(
      (faq) =>
        !searchQuery ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.faqs.length > 0);

  return (
    <div className="bg-off-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link>
          <span>/</span>
          <span className="text-text-1 font-medium">FAQ</span>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-navy to-blue-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-syne font-800 text-3xl mb-4">Frequently Asked Questions</h1>
          <p className="text-blue-200 mb-6">Find quick answers to common questions</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm text-text-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {filteredCategories.map((category) => (
          <div key={category.name} className="mb-8">
            <h2 className="font-syne font-700 text-lg text-text-1 mb-4">{category.name}</h2>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              {category.faqs.map((faq, i) => {
                const key = `${category.name}-${i}`;
                return (
                  <div key={key} className="border-b border-border last:border-0">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-off-white/50 transition-colors"
                    >
                      <span className="font-syne font-600 text-sm text-text-1 pr-4">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-text-4 flex-shrink-0 transition-transform ${expanded === key ? "rotate-180" : ""}`} />
                    </button>
                    {expanded === key && (
                      <div className="px-5 pb-5 -mt-2">
                        <p className="text-sm text-text-3 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <Search className="w-12 h-12 text-text-4/30 mx-auto mb-3" />
            <h3 className="font-syne font-600 text-text-1 mb-1">No results found</h3>
            <p className="text-sm text-text-3">Try different keywords or browse our help center</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-8 bg-white rounded-xl border border-border p-8 text-center">
          <h3 className="font-syne font-700 text-xl text-text-1 mb-2">Didn&apos;t find your answer?</h3>
          <p className="text-sm text-text-3 mb-6">Our support team is here to help</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact">
              <Button variant="default" size="sm">
                <Mail className="w-3 h-3 mr-1" /> Email Us
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <MessageCircle className="w-3 h-3 mr-1" /> Live Chat
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="w-3 h-3 mr-1" /> Call Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
