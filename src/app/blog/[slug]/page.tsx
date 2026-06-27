"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar, Clock, User, ArrowLeft, Share2, Tag } from "lucide-react";

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  tags: string[];
}

const BLOG_DATA: Record<string, BlogPost> = {
  "future-of-e-commerce-in-africa": {
    title: "The Future of E-Commerce in Africa",
    slug: "future-of-e-commerce-in-africa",
    excerpt: "How digital commerce is transforming African markets and creating new opportunities for businesses and consumers.",
    content: `
      <p>Africa's e-commerce landscape is undergoing a dramatic transformation. With over 600 million internet users and mobile penetration rates climbing rapidly, the continent is poised to become one of the world's fastest-growing digital commerce markets.</p>
      <h2>Mobile-First Revolution</h2>
      <p>Unlike Western markets where desktop e-commerce came first, Africa leapfrogged directly to mobile. Over 80% of online transactions in major African markets now occur on mobile devices. This mobile-first approach has created unique opportunities for platforms like Kauvex to build commerce experiences tailored to African consumers.</p>
      <h2>Logistics Innovation</h2>
      <p>The biggest challenge in African e-commerce has always been logistics. Last-mile delivery in cities like Lagos, Nairobi, and Johannesburg requires creative solutions. From motorcycle couriers to drone delivery trials, innovative logistics solutions are emerging to bridge the delivery gap.</p>
      <h2>Payments Evolution</h2>
      <p>Mobile money platforms like M-Pesa, combined with new fintech solutions, are making online payments more accessible. BNPL (Buy Now Pay Later) services are also gaining traction, allowing consumers to spread payments over time.</p>
      <h2>What This Means for Sellers</h2>
      <p>For vendors and brands, the African e-commerce opportunity is massive. Platforms that offer multi-country logistics, local payment methods, and seller-friendly tools will capture the lion's share of this growing market.</p>
    `,
    author: "Kauvex Editorial",
    date: "2026-05-15",
    readTime: "5 min read",
    category: "Industry Insights",
    image: "/blog/ecommerce-africa.jpg",
    tags: ["e-commerce", "Africa", "logistics", "fintech"],
  },
  "how-to-sell-online-nigeria": {
    title: "Complete Guide: How to Start Selling Online in Nigeria",
    slug: "how-to-sell-online-nigeria",
    excerpt: "Everything you need to know about launching your online store in Nigeria, from product sourcing to delivery.",
    content: `
      <p>Nigeria is Africa's largest e-commerce market with over 100 million internet users. Here's your step-by-step guide to launching a successful online business.</p>
      <h2>Step 1: Choose Your Products</h2>
      <p>Start with products you know well. Popular categories include electronics, fashion, beauty products, and home goods. Consider demand, competition, and shipping feasibility.</p>
      <h2>Step 2: Set Up Your Store</h2>
      <p>Platforms like Kauvex make it easy to create a professional online store. You can list products, manage inventory, and process payments all from one dashboard.</p>
      <h2>Step 3: Logistics & Delivery</h2>
      <p>Partner with reliable logistics providers. Kauvex Express offers nationwide delivery with real-time tracking, making it easier to get products to your customers.</p>
      <h2>Step 4: Payment Processing</h2>
      <p>Offer multiple payment options: cards, bank transfers, USSD, and wallet payments. The more payment options you provide, the more customers you can serve.</p>
    `,
    author: "Kauvex Editorial",
    date: "2026-04-20",
    readTime: "8 min read",
    category: "Seller Guide",
    image: "/blog/sell-online-ng.jpg",
    tags: ["Nigeria", "seller guide", "getting started"],
  },
  "kauvex-express-delivery-guide": {
    title: "Kauvex Express: Your Complete Delivery Guide",
    slug: "kauvex-express-delivery-guide",
    excerpt: "Everything you need to know about shipping with Kauvex Express — from booking to tracking to delivery.",
    content: `
      <p>Kauvex Express is your reliable delivery partner for sending packages across Nigeria and internationally. Here's how to make the most of our services.</p>
      <h2>Booking a Shipment</h2>
      <p>Visit express.kauvex.com and use our 6-step booking wizard. Enter pickup and dropoff details, package dimensions, and select your preferred service level.</p>
      <h2>Service Levels</h2>
      <p>We offer Same-Day, Express, Standard, and International shipping. Choose the speed that matches your needs and budget.</p>
      <h2>Real-Time Tracking</h2>
      <p>Track your shipment in real-time with GPS updates. Share tracking links with recipients so they know exactly when to expect delivery.</p>
    `,
    author: "Kauvex Express Team",
    date: "2026-03-10",
    readTime: "4 min read",
    category: "Express",
    image: "/blog/express-guide.jpg",
    tags: ["express", "delivery", "shipping", "tracking"],
  },
  "top-10-electronics-2026": {
    title: "Top 10 Must-Have Electronics of 2026",
    slug: "top-10-electronics-2026",
    excerpt: "From smart home devices to the latest smartphones, these are the electronics everyone's talking about this year.",
    content: `
      <p>The tech world moves fast, and 2026 has already brought some exciting innovations. Here are the top electronics you should check out.</p>
      <h2>1. Smart Home Hubs</h2>
      <p>The latest smart home hubs integrate with everything from lights to security cameras, all controllable from your phone.</p>
      <h2>2. Budget 5G Smartphones</h2>
      <p>5G connectivity is now available in budget-friendly phones, making high-speed internet accessible to more people.</p>
      <h2>3. Wireless Earbuds</h2>
      <p>Active noise cancellation and 30+ hour battery life are now standard in mid-range wireless earbuds.</p>
    `,
    author: "Tech Review Team",
    date: "2026-06-01",
    readTime: "6 min read",
    category: "Product Reviews",
    image: "/blog/electronics-2026.jpg",
    tags: ["electronics", "reviews", "2026", "smartphones"],
  },
  "fraud-protection-online-shopping": {
    title: "How to Stay Safe Shopping Online",
    slug: "fraud-protection-online-shopping",
    excerpt: "Protect yourself from online fraud with these essential tips for safe e-commerce transactions.",
    content: `
      <p>Online shopping is convenient, but it's important to stay vigilant. Here are essential tips to protect yourself.</p>
      <h2>Use Secure Payment Methods</h2>
      <p>Always pay through the platform's payment system. Never transfer money directly to a seller's personal account.</p>
      <h2>Verify Sellers</h2>
      <p>Check seller ratings, reviews, and verified badges before making a purchase. Established platforms like Kauvex vet their sellers.</p>
      <h2>Keep Records</h2>
      <p>Save order confirmations, tracking numbers, and communication with sellers. These are essential if you need to file a dispute.</p>
    `,
    author: "Kauvex Security Team",
    date: "2026-02-28",
    readTime: "4 min read",
    category: "Security",
    image: "/blog/fraud-protection.jpg",
    tags: ["security", "fraud", "safe shopping"],
  },
  "bnpl-buy-now-pay-later": {
    title: "Understanding Buy Now Pay Later (BNPL)",
    slug: "bnpl-buy-now-pay-later",
    excerpt: "How BNPL works, its benefits, and what to know before using installment payments online.",
    content: `
      <p>Buy Now Pay Later is revolutionizing how people shop online. Here's everything you need to know.</p>
      <h2>How BNPL Works</h2>
      <p>With Kauvex Pay, you pay 25% upfront and receive your items immediately. The remaining 75% is split into 3 installments over 9 weeks.</p>
      <h2>Who's Eligible</h2>
      <p>Accounts at least 3 months old with 2+ completed orders can access BNPL. Limits increase with your order history.</p>
      <h2>Benefits</h2>
      <p>BNPL makes purchases more accessible without requiring traditional credit checks. It's a great way to manage your budget.</p>
    `,
    author: "Kauvex Pay Team",
    date: "2026-01-15",
    readTime: "5 min read",
    category: "Kauvex Pay",
    image: "/blog/bnpl-guide.jpg",
    tags: ["BNPL", "payments", "installments", "kauvex pay"],
  },
  "b2b-wholesale-marketplace": {
    title: "Kauvex B2B: Wholesale Made Simple",
    slug: "b2b-wholesale-marketplace",
    excerpt: "How businesses are leveraging Kauvex B2B for bulk purchasing, volume discounts, and streamlined procurement.",
    content: `
      <p>Kauvex B2B connects businesses with wholesale suppliers, offering volume discounts and streamlined procurement.</p>
      <h2>Volume Pricing Tiers</h2>
      <p>The more you buy, the more you save. Our tiered pricing system automatically applies discounts based on order volume.</p>
      <h2>Request for Quotation</h2>
      <p>Need custom pricing? Submit an RFQ and receive competitive quotes from multiple verified suppliers.</p>
    `,
    author: "Kauvex B2B Team",
    date: "2026-05-01",
    readTime: "4 min read",
    category: "B2B",
    image: "/blog/b2b-wholesale.jpg",
    tags: ["B2B", "wholesale", "procurement"],
  },
  "vendor-success-stories": {
    title: "Vendor Success Stories: Growing on Kauvex",
    slug: "vendor-success-stories",
    excerpt: "Real stories from vendors who scaled their businesses using Kauvex's marketplace tools and FBK fulfillment.",
    content: `
      <p>Meet the vendors who transformed their businesses on Kauvex.</p>
      <h2>TechHub Lagos</h2>
      <p>Started with 50 products, now sells 500+ electronics items monthly using FBK fulfillment.</p>
      <h2>Fashion Forward NG</h2>
      <p>Leveraged the storefront builder and affiliate network to reach customers across 3 countries.</p>
    `,
    author: "Kauvex Editorial",
    date: "2026-04-10",
    readTime: "6 min read",
    category: "Success Stories",
    image: "/blog/vendor-success.jpg",
    tags: ["vendors", "success stories", "FBK"],
  },
};

export default function BlogArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // In production, this would fetch from a CMS or API
    setPost(BLOG_DATA[slug] || null);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0A1628] mb-2">Article Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">This blog post doesn&apos;t exist or has been removed.</p>
          <Link href="/" className="text-sm text-[#FF6B00] hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="w-full h-64 md:h-96 bg-gradient-to-br from-[#0A1628] to-[#1a2d4a] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-6xl font-bold">KAUVEX</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#0A1628]">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-[#0A1628]">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0A1628]">{post.category}</span>
          </div>

          {/* Category Tag */}
          <span className="inline-block px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] text-xs font-medium rounded-full mb-3">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {post.author}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-sm max-w-none text-gray-600 leading-relaxed
              [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#0A1628] [&_h2]:mt-8 [&_h2]:mb-3
              [&_p]:mb-4 [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-8 pt-6 border-t border-gray-100">
              <Tag className="w-4 h-4 text-gray-400" />
              {post.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0A1628]">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
