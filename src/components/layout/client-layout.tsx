"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import TopBar from "@/components/home/top-bar";
import MainHeader from "@/components/home/main-header";
import CategoryNav from "@/components/home/category-nav";
import Footer from "@/components/home/footer";
import { StorefrontProvider } from "@/lib/storefront-context";
import ToastContainer from "@/components/notifications/toast-container";
import SocialProofPopup from "@/components/notifications/social-proof-popup";
import AIChatWidget from "@/components/chat/ai-chat-widget";
import WhatsAppButton from "@/components/chat/whatsapp-button";
import CampaignPopup from "@/components/popups/campaign-popup";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [isSticky, setIsSticky] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (isAdmin) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 180);
      setShowScrollTop(scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdmin]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Admin routes get no frontend chrome
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <StorefrontProvider>
      {/* KAUVEX Header */}
      <header>
        <TopBar />
        <MainHeader />
        <CategoryNav />
      </header>

      {/* Sticky Header (appears on scroll) */}
      {isSticky && (
        <div className="header-sticky">
          <MainHeader />
          <CategoryNav />
        </div>
      )}

      <main className="min-h-screen">{children}</main>

      <Footer />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top w-11 h-11 rounded-full bg-blue text-white shadow-strong flex items-center justify-center hover:bg-blue-600 transition-colors ${
          showScrollTop ? "visible" : ""
        }`}
        aria-label="Scroll to top"
      >
        <ChevronUp size={20} />
      </button>

      {/* Global Widgets */}
      <ToastContainer />
      <SocialProofPopup />
      <AIChatWidget />
      <WhatsAppButton />
      <CampaignPopup />
    </StorefrontProvider>
  );
}
