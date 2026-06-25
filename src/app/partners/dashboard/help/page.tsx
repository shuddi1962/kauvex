"use client";

import { useState } from "react";
import {
  HelpCircle, ChevronDown, MessageSquare, FileText,
  Video, Users, Code, Clock, Mail, Send, BookOpen,
  ExternalLink,
} from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    id: 1,
    question: "How are commissions calculated?",
    answer: "Commissions are calculated as a percentage of the total sale value (excluding taxes and shipping). Your commission rate is determined by your partnership tier: Standard (5-10%), Premium (10-15%), and Elite (15-20%). Rates may vary per product category and active promotional campaigns.",
  },
  {
    id: 2,
    question: "When are payouts processed?",
    answer: "Payouts are processed every Monday for earnings accrued up to the previous Friday. The minimum payout threshold is $50. Payments are sent via your selected payout method (Bank Transfer, PayPal, Payoneer, or Wise). International transfers may take 3-5 business days.",
  },
  {
    id: 3,
    question: "How do tracking links work?",
    answer: "Each partner is assigned a unique tracking ID (KAV-XXXX-XXXX). When you create a tracking link, this ID is embedded in the URL. When a customer clicks your link and makes a purchase within 30 days, the sale is attributed to you. You can create tracking links from the Quick Link Creator in your dashboard.",
  },
  {
    id: 4,
    question: "Can I customize my storefront?",
    answer: "Yes! Your storefront is fully customizable. You can add a profile photo, bio, social media links, organize products into collections, choose from 3 theme color presets, and upload a custom banner image. Visit the My Storefront section to get started.",
  },
  {
    id: 5,
    question: "How does the B2B referral program work?",
    answer: "The B2B referral program allows you to refer businesses to Kauvex. You earn a commission on the first year's subscription or service fee for each referred business. B2B commissions are typically 10-15% of the deal value. Submit referrals via the B2B Dashboard.",
  },
  {
    id: 6,
    question: "What are the compliance requirements?",
    answer: "All partners must disclose affiliate relationships in their content as required by FTC guidelines. Prohibited practices include spam, paid click fraud, trademark bidding on brand keywords, and misrepresentation of products. Violations may result in commission withholding or account suspension.",
  },
  {
    id: 7,
    question: "What tools are available for content creators?",
    answer: "Partners have access to: Quick Link Creator for generating tracking links, Storefront Builder for a personalized shop page, Promotions & Bounties for extra earnings opportunities, Content Insights for tracking platform performance, and detailed Reports for clicks, conversions, and commissions.",
  },
  {
    id: 8,
    question: "How do I update my account settings?",
    answer: "Go to Settings in your dashboard to update your profile information, payout method, notification preferences, and tax details. Changes to payout methods take effect for the next payout cycle. Notification preferences are updated immediately.",
  },
];

const quickLinks = [
  { label: "Documentation", icon: FileText, href: "#" },
  { label: "Video Tutorials", icon: Video, href: "#" },
  { label: "Community Forum", icon: Users, href: "#" },
  { label: "API Docs", icon: Code, href: "#" },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ subject: "", message: "" });
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Help & Support</h1>
        <p className="text-xs text-gray-500">Find answers to common questions or contact our support team</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:shadow-sm hover:border-[#FF6B00]/20 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
                <Icon size={15} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-800">{link.label}</p>
                <p className="text-[9px] text-gray-400 flex items-center gap-0.5">
                  Open <ExternalLink size={8} />
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
          <HelpCircle size={14} className="text-[#FF6B00]" /> Frequently Asked Questions
        </h3>
        <div className="space-y-1">
          {faqItems.map((faq) => (
            <div key={faq.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-semibold text-gray-800 pr-4">{faq.question}</span>
                <ChevronDown
                  size={12}
                  className={`text-gray-400 shrink-0 transition-transform ${
                    openFaq === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === faq.id && (
                <div className="px-3 pb-3">
                  <p className="text-[11px] text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-[#0A1628] mb-1 flex items-center gap-2">
          <MessageSquare size={14} className="text-[#FF6B00]" /> Contact Support
        </h3>
        <p className="text-[10px] text-gray-500 mb-4">
          Have a question not covered above? Send us a message and we&apos;ll get back to you within 24 hours.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Subject</label>
            <input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Payout delay inquiry"
              required
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00] placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 block mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Describe your issue or question in detail..."
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#FF6B00] resize-none placeholder:text-gray-300"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 h-9 px-5 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
            >
              <Send size={12} /> Submit
            </button>
            {submitted && (
              <span className="text-[11px] text-green-700 font-semibold">Message sent! We&apos;ll respond within 24 hours.</span>
            )}
          </div>
        </form>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-500">
          <Clock size={10} />
          <span>Available Mon-Fri 9AM-6PM WAT</span>
        </div>
      </div>
    </div>
  );
}
