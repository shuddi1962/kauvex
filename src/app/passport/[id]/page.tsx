"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  ShieldCheck,
  Clock,
  User,
  FileText,
  Share2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PassportEvent {
  id: string
  eventType: string
  title: string
  description: string | null
  eventDate: string
  performedBy: string | null
  documents: any
  metadata: any
  createdAt: string
}

interface PassportData {
  id: string
  entityType: string
  entityId: string
  title: string
  status: string
  trustScore: number | null
  qrCode: string | null
  passportData: Record<string, any>
  documents: any[]
  ownerId: string | null
  isVerified: boolean
  createdAt: string
  updatedAt: string
  events: PassportEvent[]
}

const eventTypeStyles: Record<string, string> = {
  created: "bg-blue-100 text-blue-700 border-blue-200",
  updated: "bg-amber-100 text-amber-700 border-amber-200",
  verified: "bg-green-100 text-green-700 border-green-200",
  review: "bg-purple-100 text-purple-700 border-purple-200",
  transfer: "bg-indigo-100 text-indigo-700 border-indigo-200",
  compliance: "bg-rose-100 text-rose-700 border-rose-200",
  action: "bg-orange-100 text-orange-700 border-orange-200",
}

function getEventStyle(eventType: string): string {
  return eventTypeStyles[eventType] || "bg-gray-100 text-gray-700 border-gray-200"
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function TrustScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null
  const color =
    score < 40
      ? "text-red-600 bg-red-50 border-red-200"
      : score < 70
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-green-600 bg-green-50 border-green-200"
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold", color)}>
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          score < 40 ? "bg-red-500" : score < 70 ? "bg-amber-500" : "bg-green-500"
        )}
      />
      Trust Score: {score}/100
    </div>
  )
}

function QRCodeDisplay({ url }: { url: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function generateQR() {
      try {
        const QRCode = (await import("qrcode")) as any
        const dataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: { dark: "#0A1628", light: "#FFFFFF" },
        })
        if (!cancelled) setQrDataUrl(dataUrl)
      } catch {
        if (!cancelled) setQrError(true)
      }
    }
    generateQR()
    return () => { cancelled = true }
  }, [url])

  if (qrError) {
    return (
      <div className="w-48 h-48 bg-off-white rounded-xl border border-border flex items-center justify-center text-text-4 text-sm">
        QR unavailable
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div className="w-48 h-48 bg-off-white rounded-xl border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-text-4 animate-spin" />
      </div>
    )
  }

  return (
    <img
      src={qrDataUrl}
      alt="Passport QR Code"
      className="w-48 h-48 rounded-xl border border-border"
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 rounded-lg w-64" />
      <div className="h-4 bg-gray-200 rounded w-96" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="bg-white rounded-xl border border-border p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h2 className="font-syne font-700 text-xl text-text-1 mb-2">Passport Not Found</h2>
        <p className="text-text-3 mb-6">{message}</p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  )
}

export default function PassportViewerPage() {
  const params = useParams()
  const id = params.id as string

  const [passport, setPassport] = useState<PassportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchPassport = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/v1/kai/passports/${id}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Failed to load passport")
      } else {
        setPassport(json.data)
      }
    } catch {
      setError("Failed to load passport")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPassport() }, [fetchPassport])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error || !passport) return <ErrorState message={error || "Passport not found"} />

  const trustScore = passport.trustScore ?? 0
  const passportData = passport.passportData || {}
  const documents = Array.isArray(passport.documents) ? passport.documents : []
  const events = passport.events || []

  const trustColor =
    trustScore < 40
      ? "text-red-600 bg-red-50 border-red-200"
      : trustScore < 70
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-green-600 bg-green-50 border-green-200"

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-kauvex-orange bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {passport.entityType}
              </span>
              {passport.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <h1 className="font-syne font-700 text-2xl text-text-1">
              {passport.title}
            </h1>
            <p className="text-sm text-text-3 mt-1">
              ID: {passport.id.slice(0, 8)}... &middot; Updated {formatDate(passport.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <TrustScoreBadge score={trustScore} />
            <Button variant="outline" size="sm" onClick={handleShare}>
              {copied ? (
                <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Copied</>
              ) : (
                <><Share2 className="w-4 h-4 mr-1.5" /> Share</>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {Object.keys(passportData).length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h2 className="font-syne font-600 text-lg text-text-1 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-kauvex-orange" />
                  Passport Data
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(passportData).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs font-semibold text-text-4 uppercase tracking-wider">
                        {key.replace(/_/g, " ")}
                      </dt>
                      <dd className="text-sm text-text-1 mt-0.5 font-medium">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-syne font-600 text-lg text-text-1 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-kauvex-orange" />
                Timeline
                <span className="text-sm font-normal text-text-4 ml-1">
                  ({events.length} events)
                </span>
              </h2>

              {events.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="w-10 h-10 text-text-4/30 mx-auto mb-3" />
                  <p className="text-sm text-text-3">No events recorded yet</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {events.map((event) => (
                      <div key={event.id} className="relative pl-10">
                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-kauvex-navy shadow-sm" />
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span
                                className={cn(
                                  "text-xs font-semibold px-2 py-0.5 rounded-full border",
                                  getEventStyle(event.eventType)
                                )}
                              >
                                {event.eventType}
                              </span>
                              <span className="text-xs text-text-4 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(event.eventDate)}
                              </span>
                            </div>
                            <h3 className="font-syne font-600 text-sm text-text-1">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-sm text-text-3 mt-0.5 whitespace-pre-wrap">
                                {event.description}
                              </p>
                            )}
                            {event.performedBy && (
                              <p className="text-xs text-text-4 mt-1 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {event.performedBy}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border p-6 text-center">
              <h3 className="font-syne font-600 text-sm text-text-1 mb-3">
                Digital Passport QR
              </h3>
              <div className="flex justify-center mb-3">
                <QRCodeDisplay url={passport.qrCode || `${window.location.origin}/passport/${passport.id}`} />
              </div>
              <p className="text-xs text-text-4 break-all">
                {passport.qrCode || `${window.location.origin}/passport/${passport.id}`}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-syne font-600 text-sm text-text-1 mb-3">
                Trust Score
              </h3>
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke={trustScore < 40 ? "#DC2626" : trustScore < 70 ? "#D97706" : "#16A34A"}
                      strokeWidth="8"
                      strokeDasharray={`${(trustScore / 100) * 264} 264`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={cn("font-syne font-700 text-xl", trustColor.split(" ")[0])}>
                      {trustScore}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-xs text-text-3">
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-medium text-text-1 capitalize">{passport.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Events</span>
                  <span className="font-medium text-text-1">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents</span>
                  <span className="font-medium text-text-1">{documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified</span>
                  <span className="font-medium text-text-1">
                    {passport.isVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 inline" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 inline" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {documents.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-syne font-600 text-sm text-text-1 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-kauvex-orange" />
                  Documents ({documents.length})
                </h3>
                <ul className="space-y-2">
                  {documents.map((doc: any, i: number) => (
                    <li key={i}>
                      <a
                        href={doc.url || doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{doc.name || doc.label || `Document ${i + 1}`}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
