import Link from "next/link";
import { Mail, Globe, ArrowRight } from "lucide-react";

const sellLinks = [
  { label: "Start Selling", url: "/sell" },
  { label: "Vendor Dashboard", url: "/vendor/dashboard" },
  { label: "Supplier Portal", url: "/supplier/register" },
  { label: "B2B/Wholesale", url: "/wholesale" },
  { label: "Manufacturer Portal", url: "/manufacturers" },
  { label: "Find Manufacturers", url: "/manufacturers/search" },
  { label: "Advertising", url: "/advertise" },
  { label: "FBK Fulfillment", url: "/vendor/fbk" },
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
];

const aboutLinks = [
  { label: "About Us", url: "/about" },
  { label: "Blog", url: "/blog" },
  { label: "Careers", url: "/about" },
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Terms of Service", url: "/terms" },
  { label: "Cookie Policy", url: "/privacy" },
];

const expressLinks = [
  { label: "Kauvex Express", url: "/express" },
  { label: "Track a Package", url: "/express/track" },
  { label: "Express for Business", url: "/express/business" },
  { label: "Become a Partner", url: "/logistics/register" },
  { label: "Partner Login", url: "/logistics/login" },
  { label: "Coverage Areas", url: "/express/coverage" },
];

const socialLinks = ["Instagram", "Twitter/X", "Facebook", "TikTok", "YouTube", "LinkedIn"];

const paymentIcons = ["Visa", "Mastercard", "PayPal", "Apple Pay", "Google Pay", "Stripe", "Paystack", "Flutterwave"];

export default function Footer() {
  return (
    <footer className="bg-navy text-white/70 mt-4">
      <div className="container-kauvex py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8 lg:gap-10">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-navy to-orange flex items-center justify-center">
                <span className="text-white font-bold text-base">K</span>
              </div>
              <span className="font-display font-extrabold text-xl text-white">KAUVEX</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-4">
              Your global marketplace for electronics, fashion, home essentials, and more.
              Shop millions of products from trusted sellers worldwide.
            </p>
            <div className="space-y-2 text-sm text-white/40 mb-5">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-orange shrink-0" />
                <span>support@kauvex.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-orange shrink-0" />
                <span>24/7 Global Support</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map((s) => (
                <span key={s} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange flex items-center justify-center text-xs font-bold text-white/50 hover:text-white cursor-pointer transition-all">
                  {s.charAt(0)}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-4">Sell on KAUVEX</h4>
            <ul className="space-y-2.5">
              {sellLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.url} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-4">Partners</h4>
            <ul className="space-y-2.5">
              {partnerLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.url} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-4">Help &amp; Policies</h4>
            <ul className="space-y-2.5">
              {helpLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.url} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-4">About</h4>
            <ul className="space-y-2.5">
              {aboutLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.url} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-4">Logistics</h4>
            <ul className="space-y-2.5">
              {expressLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.url} className="text-sm text-white/40 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-kauvex py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} KAUVEX Global Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60">Privacy</Link>
            <span className="text-white/10">|</span>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60">Terms</Link>
            <span className="text-white/10">|</span>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60">Cookies</Link>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {paymentIcons.map((i) => (
              <span key={i} className="h-6 px-2 bg-white/5 rounded text-[9px] font-mono text-white/30 flex items-center">{i}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}