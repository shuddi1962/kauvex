"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserCheck, ChevronRight, ArrowRight, Star, MapPin } from "lucide-react";

interface Hub {
  id: string;
  hubName: string;
  hubSlug: string;
  professionalCategories: string[];
}

export default function HubProfessionalsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/kpn/hubs/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setHub(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/industries" className="hover:text-kauvex-orange">Industries</Link>
            <ChevronRight size={14} />
            {hub && <Link href={`/industries/${slug}`} className="hover:text-kauvex-orange">{hub.hubName}</Link>}
            <ChevronRight size={14} />
            <span className="text-kauvex-navy font-medium">Professionals</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ) : hub ? (
          <>
            <h1 className="text-3xl font-bold text-kauvex-navy mb-2">{hub.hubName} Professionals</h1>
            <p className="text-gray-500 mb-8">
              Find qualified {hub.hubName} professionals on the Kauvex Professional Network.
            </p>

            {hub.professionalCategories?.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-kauvex-navy mb-3">Professional Categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {hub.professionalCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/pro/search?category=${encodeURIComponent(cat)}`}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-kauvex-orange/30 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-kauvex-orange/10 flex items-center justify-center mb-3">
                        <UserCheck size={20} className="text-kauvex-orange" />
                      </div>
                      <h3 className="font-semibold text-kauvex-navy mb-1 group-hover:text-kauvex-orange transition-colors">{cat}</h3>
                      <span className="text-xs text-gray-400">Search professionals</span>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {/* Sample professionals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-kauvex-navy to-kauvex-navy/70 flex items-center justify-center text-white font-bold text-sm">
                      P{i}
                    </div>
                    <div>
                      <h3 className="font-semibold text-kauvex-navy text-sm">Professional Name</h3>
                      <p className="text-xs text-gray-400">
                        {hub.professionalCategories?.[0] || "Category"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400" fill="currentColor" /> 4.8
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> Lagos
                    </span>
                    <span>24 jobs</span>
                  </div>
                  <Link
                    href={`/pro/search?category=${encodeURIComponent(hub.professionalCategories?.[0] || hub.hubName)}`}
                    className="text-xs font-medium text-kauvex-orange hover:underline"
                  >
                    View on Pro Network
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href={`/pro/search?category=${encodeURIComponent(hub.hubName)}`}
                className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-8 py-3 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
              >
                Find {hub.hubName} Professionals <ArrowRight size={18} />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-500">Hub not found</p>
            <Link href="/industries" className="text-kauvex-orange hover:underline text-sm mt-2 inline-block">
              Back to industries
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
