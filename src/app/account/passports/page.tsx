"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileText,
  ShieldCheck,
  Clock,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  ExternalLink,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PassportListItem {
  id: string
  entityType: string
  entityId: string
  title: string
  status: string
  trustScore: number | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
  events: { id: string }[]
}

function TrustScoreRing({ score }: { score: number | null }) {
  const val = score ?? 0
  const color =
    val < 40 ? "#DC2626" : val < 70 ? "#D97706" : "#16A34A"
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${(val / 100) * 264} 264`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-syne font-700">{val}</span>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

type SortKey = "newest" | "oldest" | "trust"

export default function AccountPassportsPage() {
  const router = useRouter()
  const [passports, setPassports] = useState<PassportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [entityFilter, setEntityFilter] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("newest")

  useEffect(() => {
    async function fetchPassports() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/v1/kai/passports")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to load passports")
        setPassports(json.data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPassports()
  }, [])

  const entityTypes = [...new Set(passports.map((p) => p.entityType))]

  let filtered = entityFilter
    ? passports.filter((p) => p.entityType === entityFilter)
    : [...passports]

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "trust":
        return (b.trustScore ?? 0) - (a.trustScore ?? 0)
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-syne font-700 text-2xl text-text-1">Digital Passports</h1>
          <p className="text-sm text-text-3 mt-1">Loading your passports...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="font-syne font-700 text-2xl text-text-1">Digital Passports</h1>
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h3 className="font-syne font-600 text-lg text-text-1 mb-2">Failed to load</h3>
          <p className="text-sm text-text-3 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne font-700 text-2xl text-text-1">Digital Passports</h1>
          <p className="text-sm text-text-3 mt-1">
            {passports.length} passport{passports.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {passports.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-kauvex-orange/20 focus:border-kauvex-orange appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-lg text-text-1 focus:outline-none focus:ring-2 focus:ring-kauvex-orange/20 focus:border-kauvex-orange appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="trust">Highest Trust</option>
            </select>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-off-white flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-text-4/40" />
          </div>
          <h3 className="font-syne font-600 text-lg text-text-1 mb-2">
            {entityFilter ? "No matching passports" : "No digital passports yet"}
          </h3>
          <p className="text-sm text-text-3 mb-6 max-w-sm mx-auto">
            {entityFilter
              ? `No passports found for type "${entityFilter}".`
              : "Digital passports provide a verifiable record of an entity's history, credentials, and trust score on the Kauvex platform. They are automatically created when you interact with supported services."}
          </p>
          {entityFilter && (
            <Button variant="outline" onClick={() => setEntityFilter("")}>
              Clear Filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/passport/${p.id}`}
              className="bg-white rounded-xl border border-border p-5 hover:border-kauvex-orange/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <TrustScoreRing score={p.trustScore} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-kauvex-orange bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      {p.entityType}
                    </span>
                    {p.isVerified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <h3 className="font-syne font-600 text-sm text-text-1 line-clamp-2 group-hover:text-kauvex-orange transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(p.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {p.events?.length || 0} events
                    </span>
                    <span className={cn(
                      "capitalize",
                      p.status === "active" ? "text-green-600" : p.status === "verified" ? "text-blue-600" : "text-text-4"
                    )}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-4 group-hover:text-kauvex-orange transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
