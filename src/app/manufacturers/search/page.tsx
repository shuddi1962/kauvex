"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Manufacturer {
  id: string;
  slug: string;
  companyName: string;
  countryCode: string;
  city: string | null;
  verificationTier: string;
  ratingAverage: number | null;
  totalOrdersCompleted: number | null;
  categories: { category: string }[];
  capabilities: { defaultMoq?: number | null; defaultLeadTimeDays?: number | null }[];
}

import { MANUFACTURING_CATEGORIES } from "@/lib/manufacturers/categories";

const categoryOptions = Object.keys(MANUFACTURING_CATEGORIES);

const countryOptions = [
  "Nigeria","China","India","Turkey","Bangladesh","Vietnam","Indonesia",
  "Pakistan","Thailand","Mexico","Brazil","Egypt","Ethiopia","Kenya",
  "South Africa","Morocco","Ghana","United States","Germany","United Kingdom",
];

const verificationTiers = [
  { value: "unverified", label: "Unverified" },
  { value: "document_verified", label: "Document Verified" },
  { value: "factory_verified", label: "Factory Verified" },
  { value: "gold", label: "Gold Certified" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [verification, setVerification] = useState<string[]>([]);
  const [moqRange, setMoqRange] = useState("");
  const [leadTimeRange, setLeadTimeRange] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Manufacturer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      if (country) params.set("country", country);
      if (verification.length) params.set("verification", verification.join(","));
      if (moqRange) params.set("moq", moqRange);
      if (leadTimeRange) params.set("leadTime", leadTimeRange);
      params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/v1/manufacturers?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [query, category, country, verification, moqRange, leadTimeRange, sortBy, page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function toggleVerification(value: string) {
    setVerification((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0A1628]">Search Manufacturers</h1>
          <p className="mt-1 text-gray-600">Find verified factories worldwide</p>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by company name, product, or keyword..."
              className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
            />
            <Button onClick={() => fetchResults()} className="bg-[#FF6B00] hover:bg-[#e55f00]">
              Search
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="space-y-6 rounded-xl bg-white p-5 shadow-sm border border-gray-100">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1628]">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1628]">Country</label>
                <select
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="">All countries</option>
                  {countryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Verification */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1628]">Verification</label>
                <div className="mt-2 space-y-2">
                  {verificationTiers.map((tier) => (
                    <label key={tier.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verification.includes(tier.value)}
                        onChange={() => toggleVerification(tier.value)}
                        className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                      {tier.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* MOQ Range */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1628]">MOQ Range</label>
                <select
                  value={moqRange}
                  onChange={(e) => {
                    setMoqRange(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="">Any MOQ</option>
                  <option value="0-100">Under 100</option>
                  <option value="100-500">100 – 500</option>
                  <option value="500-1000">500 – 1,000</option>
                  <option value="1000-5000">1,000 – 5,000</option>
                  <option value="5000-10000">5,000 – 10,000</option>
                  <option value="10000+">10,000+</option>
                </select>
              </div>

              {/* Lead Time */}
              <div>
                <label className="block text-sm font-semibold text-[#0A1628]">Lead Time</label>
                <select
                  value={leadTimeRange}
                  onChange={(e) => {
                    setLeadTimeRange(e.target.value);
                    setPage(1);
                  }}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                >
                  <option value="">Any lead time</option>
                  <option value="0-7">Under 7 days</option>
                  <option value="7-14">7 – 14 days</option>
                  <option value="14-30">14 – 30 days</option>
                  <option value="30-60">30 – 60 days</option>
                  <option value="60+">60+ days</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setCategory("");
                  setCountry("");
                  setVerification([]);
                  setMoqRange("");
                  setLeadTimeRange("");
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Sort Bar */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {loading ? "Searching..." : `${results.length} manufacturer${results.length !== 1 ? "s" : ""} found`}
              </p>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              >
                <option value="rating">Sort by Rating</option>
                <option value="response_time">Sort by Response Time</option>
                <option value="moq">Sort by MOQ</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#FF6B00]" />
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-100">
                <div className="text-4xl">🔍</div>
                <h3 className="mt-4 text-lg font-bold text-[#0A1628]">No manufacturers found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Try adjusting your filters or search query.
                </p>
                <Button
                  onClick={() => {
                    setQuery("");
                    setCategory("");
                    setCountry("");
                    setVerification([]);
                    setMoqRange("");
                    setLeadTimeRange("");
                    setPage(1);
                  }}
                  className="mt-4 bg-[#FF6B00] hover:bg-[#e55f00]"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((m) => (
                    <Link
                      key={m.id}
                      href={`/manufacturers/${m.slug}`}
                      className="group rounded-xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:border-[#FF6B00] hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-[#0A1628] group-hover:text-[#FF6B00]">
                            {m.companyName}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {m.city ? `${m.city}, ` : ""}{m.countryCode}
                          </p>
                        </div>
                        {m.verificationTier && m.verificationTier !== "unverified" && (
                          <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-xs font-semibold text-green-700">
                            {m.verificationTier === "gold" ? "★ Gold" : m.verificationTier === "factory_verified" ? "✓ Verified" : "Doc Verified"}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {m.categories?.slice(0, 2).map((cat) => (
                          <span
                            key={cat.category}
                            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {cat.category}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                        <div className="text-center">
                          <p className="text-sm font-bold text-[#0A1628]">
                            {m.ratingAverage ? Number(m.ratingAverage).toFixed(1) : "—"}
                          </p>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-[#0A1628]">
                            {m.capabilities?.[0]?.defaultMoq?.toLocaleString() ?? "—"}
                          </p>
                          <p className="text-xs text-gray-500">MOQ</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-[#0A1628]">
                            {m.capabilities?.[0]?.defaultLeadTimeDays ?? "—"}d
                          </p>
                          <p className="text-xs text-gray-500">Lead Time</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="border-gray-300"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                      .reduce<(number | string)[]>((acc, p, i, arr) => {
                        if (i > 0 && (arr[i - 1] as number) < p - 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        typeof p === "string" ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`h-9 w-9 rounded-lg text-sm font-medium ${
                              page === p
                                ? "bg-[#FF6B00] text-white"
                                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="border-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
