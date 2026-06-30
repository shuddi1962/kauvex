"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, Globe } from "lucide-react";

const socialLinks = [
  { label: "Instagram", url: "https://instagram.com/kauvex" },
  { label: "Twitter/X", url: "https://x.com/kauvex" },
  { label: "Facebook", url: "https://facebook.com/kauvex" },
  { label: "WhatsApp", url: "https://wa.me/234700528839" },
  { label: "TikTok", url: "https://tiktok.com/@kauvex" },
  { label: "YouTube", url: "https://youtube.com/@kauvex" },
  { label: "LinkedIn", url: "https://linkedin.com/company/kauvex" },
];

const sellLinks = [
  { label: "Start Selling", url: "/sell" },
  { label: "Vendor Dashboard", url: "/vendor/dashboard" },
  { label: "Supplier Portal", url: "/supplier/register" },
  { label: "B2B/Wholesale", url: "/wholesale" },
  { label: "Manufacturer Portal", url: "/manufacturers" },
  { label: "Find Manufacturers", url: "/manufacturers/search" },
  { label: "Advertising", url: "/advertise" },
  { label: "Seller Resources", url: "/help" },
];

const partnerLinks = [
  { label: "Affiliate Program", url: "/partners" },
  { label: "Become an Associate", url: "/partners/register/associate" },
  { label: "Become an Influencer", url: "/partners/register/influencer" },
  { label: "B2B Referral Partner", url: "/partners/register/b2b" },
  { label: "Partner Login", url: "/partners/login" },
];

const helpLinks = [
  { label: "Help Center", url: "/help" },
  { label: "FAQ", url: "/faq" },
  { label: "Track Order", url: "/track-order" },
  { label: "Returns & Refunds", url: "/returns" },
  { label: "Shipping Info", url: "/express" },
  { label: "Contact Us", url: "/contact" },
  { label: "Report a Problem", url: "/contact" },
];

const aboutLinks = [
  { label: "About Us", url: "/about" },
  { label: "Blog", url: "/blog" },
  { label: "Careers", url: "/about" },
  { label: "Press & Media", url: "/about" },
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Terms of Service", url: "/terms" },
  { label: "Cookie Policy", url: "/privacy" },
];

const regionalStores = [
  { label: "KAUVEX Nigeria", url: "#" },
  { label: "KAUVEX UK", url: "#" },
  { label: "KAUVEX USA", url: "#" },
  { label: "KAUVEX UAE", url: "#" },
  { label: "KAUVEX South Africa", url: "#" },
  { label: "KAUVEX Kenya", url: "#" },
];

const paymentIcons = [
  "Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay",
  "Stripe", "Paystack", "Flutterwave", "UnionPay", "Discover",
];

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-[#0A1628] text-white/70">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-white tracking-tight">Stay in the Loop</h3>
              <p className="text-xs sm:text-sm text-white/40 mt-1">Get exclusive deals, new arrivals & insider updates.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-72">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF6B00] backdrop-blur-sm"
                />
              </div>
              <button className="h-11 px-6 rounded-lg bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white text-sm font-bold transition-colors shrink-0 flex items-center gap-1">
                Subscribe <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="w-full max-w-[1440px] mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0A1628] to-[#FF6B00] flex items-center justify-center">
                <span className="text-white font-bold text-base">K</span>
              </div>
              <div>
                <div className="font-bold text-[15px] text-white leading-tight tracking-tight">
                  KAUVEX
                </div>
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-4">
              Your global marketplace for electronics, fashion, home essentials, and more.
              Shop millions of products from trusted sellers worldwide with fast shipping and easy returns.
            </p>
            <div className="space-y-2 text-sm text-white/50 mb-5">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#FF6B00] shrink-0" />
                <span>support@kauvex.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe size={14} className="text-[#FF6B00] shrink-0" />
                <span>24/7 Global Customer Support</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#FF6B00] flex items-center justify-center text-xs font-bold text-white/60 hover:text-white transition-all"
                >
                  {social.label.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Sell on KAUVEX */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Sell on KAUVEX</h4>
            <ul className="space-y-2.5">
              {sellLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.url}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Partners</h4>
            <ul className="space-y-2.5">
              {partnerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.url}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Help &amp; Policies</h4>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.url}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About KAUVEX */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">About KAUVEX</h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.url}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logistics & Express */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Logistics &amp; Express</h4>
            <ul className="space-y-2.5">
              <li><Link href="/express" className="text-sm text-white/40 hover:text-white transition-colors">Kauvex Express</Link></li>
              <li><Link href="/logistics" className="text-sm text-white/40 hover:text-white transition-colors">Logistics Network</Link></li>
              <li><Link href="/express/track" className="text-sm text-white/40 hover:text-white transition-colors">Track a Package</Link></li>
              <li><Link href="/express/business" className="text-sm text-white/40 hover:text-white transition-colors">Express for Business</Link></li>
              <li><Link href="/logistics/register" className="text-sm text-white/40 hover:text-white transition-colors">Become a Partner</Link></li>
              <li><Link href="/logistics/login" className="text-sm text-white/40 hover:text-white transition-colors">Partner Login</Link></li>
              <li><Link href="/express/faq" className="text-sm text-white/40 hover:text-white transition-colors">Express FAQ</Link></li>
              <li><Link href="/express/coverage" className="text-sm text-white/40 hover:text-white transition-colors">Coverage Areas</Link></li>
              <li><Link href="/vendor/fbk" className="text-sm text-white/40 hover:text-white transition-colors">FBK Fulfillment</Link></li>
            </ul>
          </div>

          {/* Regional Stores */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4">Regional Stores</h4>
            <ul className="space-y-2.5">
              {regionalStores.map((store) => (
                <li key={store.label}>
                  <Link
                    href={store.url}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    {store.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="w-full max-w-[1440px] mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} KAUVEX Global Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
            <span className="text-white/10">|</span>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
            <span className="text-white/10">|</span>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Cookies</Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {paymentIcons.map((icon) => (
              <div
                key={icon}
                className="h-6 px-2 bg-white/5 rounded text-[9px] font-mono text-white/30 flex items-center"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
