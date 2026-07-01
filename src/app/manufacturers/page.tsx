import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Find Manufacturers Worldwide — Kauvex",
  description:
    "Discover verified manufacturers across 19 categories and 30+ countries. Request quotes, compare prices, source with confidence.",
};

const categories = [
  { name: "Textiles & Apparel", icon: "🧵" },
  { name: "Footwear & Leather", icon: "👟" },
  { name: "Furniture & Woodwork", icon: "🪑" },
  { name: "Electronics & Hardware", icon: "⚡" },
  { name: "Food & Beverage Processing", icon: "🍎" },
  { name: "Cosmetics & Personal Care", icon: "💄" },
  { name: "Plastics & Packaging", icon: "📦" },
  { name: "Metal Works & Fabrication", icon: "🔩" },
  { name: "Toys & Children's Products", icon: "🧸" },
  { name: "Automotive & Parts", icon: "🚗" },
  { name: "Jewelry & Accessories", icon: "💍" },
  { name: "Printing & Stationery", icon: "📄" },
  { name: "Home Goods & Textiles", icon: "🏠" },
  { name: "Construction & Building Materials", icon: "🏗️" },
  { name: "Agricultural Processing", icon: "🌾" },
  { name: "Pharmaceuticals & Supplements", icon: "💊" },
  { name: "Custom/Promotional Products", icon: "🎁" },
  { name: "3D Printing & Rapid Prototyping", icon: "🖨️" },
  { name: "Renewable Energy Equipment", icon: "☀️" },
];

const hubs = [
  {
    name: "Shenzhen",
    country: "China",
    flag: "🇨🇳",
    specialty: "Electronics & Components",
    manufacturers: 12400,
  },
  {
    name: "Aba",
    country: "Nigeria",
    flag: "🇳🇬",
    specialty: "Textiles & Footwear",
    manufacturers: 3200,
  },
  {
    name: "Tiruppur",
    country: "India",
    flag: "🇮🇳",
    specialty: "Textiles & Apparel",
    manufacturers: 5800,
  },
  {
    name: "Istanbul",
    country: "Turkey",
    flag: "🇹🇷",
    specialty: "Textiles & Ceramics",
    manufacturers: 7400,
  },
  {
    name: "Guangzhou",
    country: "China",
    flag: "🇨🇳",
    specialty: "Consumer Goods & Machinery",
    manufacturers: 15600,
  },
  {
    name: "Dhaka",
    country: "Bangladesh",
    flag: "🇧🇩",
    specialty: "Textiles & Apparel",
    manufacturers: 4300,
  },
  {
    name: "Ho Chi Minh City",
    country: "Vietnam",
    flag: "🇻🇳",
    specialty: "Footwear & Electronics",
    manufacturers: 6100,
  },
  {
    name: "Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    specialty: "Packaging & Food Processing",
    manufacturers: 2800,
  },
];

const steps = [
  {
    number: 1,
    title: "Search",
    description: "Browse verified manufacturers by category, country, or product type.",
  },
  {
    number: 2,
    title: "Request Quote",
    description: "Send RFQs directly to manufacturers with your specifications.",
  },
  {
    number: 3,
    title: "Compare",
    description: "Review quotes, ratings, certifications, and production capabilities.",
  },
  {
    number: 4,
    title: "Order with Escrow",
    description: "Place orders with Kauvex escrow protection for secure transactions.",
  },
];

const trustBadges = [
  {
    title: "Factory Verified",
    description: "On-site or remote factory audit confirming production facilities exist and operate.",
  },
  {
    title: "Trade Assurance",
    description: "Orders backed by Kauvex escrow. Payment protected until delivery confirmed.",
  },
  {
    title: "Certified Manufacturer",
    description: "Holds recognized quality certifications (ISO, CE, FDA, GMP, etc.).",
  },
  {
    title: "Top Rated",
    description: "Consistently high buyer ratings across response time, quality, and reliability.",
  },
];

export default function ManufacturersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#0A1628] text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Source Directly from{" "}
              <span className="text-[#FF6B00]">Manufacturers</span> Worldwide
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
              Discover verified factories across 19 categories and 30+ countries.
              Request quotes, compare prices, source with confidence.
            </p>
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="flex items-center rounded-xl bg-white p-1.5 shadow-lg">
                <input
                  type="text"
                  placeholder="Search by product, category, or country..."
                  className="flex-1 rounded-lg border-0 bg-transparent px-4 py-3 text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-0"
                />
                <Link
                  href="/manufacturers/search"
                  className="rounded-lg bg-[#FF6B00] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#e55f00]"
                >
                  Search
                </Link>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                Try: &quot;USB cables in Shenzhen&quot; &middot; &quot;Textiles in Nigeria&quot; &middot; &quot;Ceramics in Turkey&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#0A1628]">Manufacturing Categories</h2>
        <p className="mt-2 text-gray-600">Browse 19 specialized manufacturing sectors</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/manufacturers/search?category=${encodeURIComponent(cat.name)}`}
              className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#FF6B00] hover:shadow-md"
            >
              <span className="text-3xl">{cat.icon}</span>
              <p className="mt-2 text-sm font-medium text-[#0A1628] group-hover:text-[#FF6B00]">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Manufacturing Hubs */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628]">Manufacturing Hubs</h2>
          <p className="mt-2 text-gray-600">Top sourcing destinations across the globe</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hubs.map((hub) => (
              <Link
                key={hub.name}
                href={`/manufacturers/search?country=${encodeURIComponent(hub.country)}`}
                className="group rounded-xl border border-gray-100 bg-gray-50 p-5 transition-all hover:border-[#FF6B00] hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{hub.flag}</span>
                  <div>
                    <p className="font-bold text-[#0A1628] group-hover:text-[#FF6B00]">
                      {hub.name}
                    </p>
                    <p className="text-xs text-gray-500">{hub.country}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600">{hub.specialty}</p>
                <p className="mt-1 text-xs font-medium text-[#FF6B00]">
                  {hub.manufacturers.toLocaleString()} manufacturers
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-[#0A1628]">How It Works</h2>
        <p className="mt-2 text-gray-600">From search to delivery in 4 simple steps</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B00] text-lg font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#0A1628]">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              {step.number < 4 && (
                <div className="absolute left-6 top-6 hidden h-0.5 w-full bg-gray-200 lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0A1628]">Why Source on Kauvex</h2>
          <p className="mt-2 text-gray-600">Every manufacturer is verified before listing</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A1628] text-[#FF6B00]">
                  ✓
                </div>
                <h3 className="mt-3 font-bold text-[#0A1628]">{badge.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A1628]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Ready to Source?</h2>
          <p className="mt-3 text-gray-300">
            Join thousands of buyers sourcing from verified manufacturers worldwide.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/manufacturers/search"
              className="rounded-lg bg-[#FF6B00] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#e55f00]"
            >
              Start Sourcing
            </Link>
            <Link
              href="/manufacturers/register"
              className="rounded-lg border border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-[#0A1628]"
            >
              Become a Manufacturer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
