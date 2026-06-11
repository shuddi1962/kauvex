"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ---- Types ----

export interface SearchFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  vendor?: string;
  storefrontId?: string;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  page?: number;
  limit?: number;
}

export interface SearchFacets {
  categories: { id: string; name: string; slug: string; count: number }[];
  priceRanges: { label: string; min: number; max: number; count: number }[];
  ratings: { value: number; count: number }[];
}

export interface SearchResult<T = any> {
  products: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: SearchFacets;
}

export interface AutocompleteResult {
  products: any[];
  categories: any[];
  brands: any[];
  popularSearches: string[];
}

// ---- API calls ----

export async function fetchSearchResults(
  filters: SearchFilters
): Promise<SearchResult> {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.rating) params.set("rating", String(filters.rating));
  if (filters.vendor) params.set("vendor", filters.vendor);
  if (filters.storefrontId)
    params.set("storefrontId", filters.storefrontId);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Search request failed");
  }
  return res.json();
}

export async function fetchAutocomplete(
  query: string
): Promise<AutocompleteResult> {
  if (!query || query.length < 2) {
    return { products: [], categories: [], brands: [], popularSearches: [] };
  }

  const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error("Autocomplete request failed");
  }
  return res.json();
}

// ---- Recent searches (localStorage) ----

const RECENT_SEARCHES_KEY = "kauvex-recent-searches";
const MAX_RECENT = 5;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const recent = getRecentSearches().filter(
      (s) => s.toLowerCase() !== query.toLowerCase().trim()
    );
    recent.unshift(query.trim());
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // silently fail
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // silently fail
  }
}

// ---- Popular searches tracking ----

const POPULAR_KEY = "kauvex-popular-searches";
const MAX_POPULAR = 10;

export function getPopularSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(POPULAR_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function trackSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const popular = getPopularSearches().filter(
      (s) => s.toLowerCase() !== query.toLowerCase().trim()
    );
    popular.unshift(query.trim());
    localStorage.setItem(
      POPULAR_KEY,
      JSON.stringify(popular.slice(0, MAX_POPULAR))
    );
  } catch {
    // silently fail
  }
}

// ---- useSearchQuery hook with debounce ----

export function useSearchQuery(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    (q: string) => {
      setQuery(q);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }

      if (!q || q.trim().length < 2) {
        setResults(null);
        setIsSearching(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setError(null);

      timerRef.current = setTimeout(async () => {
        try {
          const data = await fetchSearchResults({ q: q.trim(), limit: 20 });
          setResults(data);
          trackSearch(q.trim());
        } catch (err) {
          setError(err instanceof Error ? err.message : "Search failed");
          setResults(null);
        } finally {
          setIsSearching(false);
        }
      }, debounceMs);
    },
    [debounceMs]
  );

  const clear = useCallback(() => {
    setQuery("");
    setResults(null);
    setIsSearching(false);
    setError(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return { query, results, isSearching, error, search, clear };
}
