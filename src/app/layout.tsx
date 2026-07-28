import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/auth-provider";
import ClientLayout from "@/components/layout/client-layout";
import GeoInitializer from "@/components/geo/geo-initializer";
import CookieConsent from "@/components/geo/cookie-consent";
import ServiceWorkerRegister from "@/components/pwa/sw-register";
import InstallPrompt from "@/components/pwa/install-prompt";
import AgeVerificationGate from "@/components/popups/age-verification-gate";

export const metadata: Metadata = {
  metadataBase: new URL("https://kauvex.com"),
  title: {
    default: "KAUVEX — Everything. Everywhere. Delivered.",
    template: "%s | KAUVEX",
  },
  description:
    "Shop millions of products from verified sellers worldwide. Electronics, fashion, home, beauty, sports, automotive and more. Fast shipping. Buyer protection guaranteed.",
  keywords: [
    "online shopping", "marketplace", "electronics", "fashion", "home & living",
    "beauty", "sports", "automotive", "digital products", "global shipping",
  ],
  openGraph: {
    title: "KAUVEX — Everything. Everywhere. Delivered.",
    description: "Shop millions of products from verified sellers worldwide. Fast shipping. Buyer protection guaranteed.",
    type: "website",
    locale: "en_US",
    siteName: "KAUVEX",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KAUVEX — Everything. Everywhere. Delivered.",
    description: "Shop millions of products from verified sellers worldwide.",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "KAUVEX",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A1628",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "KAUVEX",
  url: "https://kauvex.com",
  logo: "https://kauvex.com/logo.png",
  sameAs: [
    "https://facebook.com/kauvex",
    "https://twitter.com/kauvex",
    "https://instagram.com/kauvex",
    "https://youtube.com/@kauvex",
    "https://linkedin.com/company/kauvex",
  ],
  description: "Everything. Everywhere. Delivered. Shop millions of products from verified sellers worldwide.",
  slogan: "Everything. Everywhere. Delivered.",
  areaServed: "Worldwide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0A1628" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-off-white text-text-1">
        <AuthProvider>
          <GeoInitializer />
          <ClientLayout>{children}</ClientLayout>
          <CookieConsent />
          <AgeVerificationGate />
          <ServiceWorkerRegister />
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
