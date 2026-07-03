import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAUVEX — Everything. Everywhere. Delivered.",
  description:
    "The world's most ambitious marketplace. Shop millions of products from verified sellers across 100+ countries with blazing-fast delivery.",
  keywords: "ecommerce, marketplace, shopping, electronics, fashion, home, beauty, Nigeria, global delivery",
  openGraph: {
    type: "website",
    title: "KAUVEX — Everything. Everywhere. Delivered.",
    description: "Shop millions of products from verified sellers worldwide.",
    siteName: "KAUVEX",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}