"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, LogIn, ArrowRight } from "lucide-react";

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/partners/login") || pathname.startsWith("/partners/register");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-navy border-b border-navy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/partners" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-syne font-700 text-lg text-white">Kauvex</span>
                <span className="text-orange font-semibold text-lg ml-1">Partners</span>
              </div>
            </Link>
            {isAuthPage ? (
              <Link
                href="/partners"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Back to Home
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/partners/login"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  href="/partners/register/associate"
                  className="flex items-center gap-2 bg-orange hover:bg-orange/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Join Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-navy border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-orange" />
                <span className="font-syne font-700 text-white">Kauvex Partners</span>
              </div>
              <p className="text-sm text-white/50">
                Earn by sharing what you love.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Programs</h4>
              <ul className="space-y-2">
                <li><Link href="/partners/register/associate" className="text-sm text-white/50 hover:text-white transition-colors">Associates</Link></li>
                <li><Link href="/partners/register/influencer" className="text-sm text-white/50 hover:text-white transition-colors">Influencers</Link></li>
                <li><Link href="/partners/register/associate" className="text-sm text-white/50 hover:text-white transition-colors">B2B Referral</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/partners" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/partners" className="text-sm text-white/50 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/partners" className="text-sm text-white/50 hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/partners" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/partners" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/partners" className="text-sm text-white/50 hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} Kauvex Commerce Cloud. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
