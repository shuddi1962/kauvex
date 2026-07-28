"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Briefcase,
  Award,
  CheckCircle,
  Mail,
  Phone,
  ChevronLeft,
  Clock,
  Shield,
  Quote,
  Calendar,
} from "lucide-react";

const tierColors: Record<string, string> = {
  basic: "bg-gray-500",
  certified: "bg-blue-600",
  gold: "bg-amber-500",
  platinum: "bg-violet-600",
};

interface Credential {
  id: string;
  type: string;
  issuingBody: string;
  certificateNumber: string;
  status: string;
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Professional {
  id: string;
  name: string;
  category: string;
  tier: string;
  rating: number;
  jobsCompleted: number;
  location: string;
  hourlyRate: number;
  bio: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  coverageArea: string;
  credentials: Credential[];
  reviews: Review[];
  memberSince: string;
}

export default function ProDetailPage() {
  const params = useParams();
  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPro = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/kpn/professionals/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setPro(data);
        }
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchPro();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
          <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2"><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-100 rounded w-1/4" /></div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy mb-1">Professional Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">This profile may have been removed or is unavailable.</p>
          <Link href="/pro/search" className="text-orange font-semibold hover:underline">Back to Search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/pro/search" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Search
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-navy to-navy-light px-8 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
                {pro.photoUrl ? (
                  <img src={pro.photoUrl} alt={pro.name} className="w-full h-full object-cover" />
                ) : (
                  pro.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{pro.name}</h1>
                  <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${tierColors[pro.tier] || "bg-gray-500"}`}>
                    {pro.tier.charAt(0).toUpperCase() + pro.tier.slice(1)}
                  </span>
                </div>
                <p className="text-white/70 mt-1">{pro.category}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {pro.rating.toFixed(1)}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {pro.jobsCompleted} jobs completed</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Member since {pro.memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" /> {pro.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" /> Coverage: {pro.coverageArea}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-navy mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{pro.bio || "No bio provided."}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-orange" />
                <h2 className="text-lg font-bold text-navy">Verified Credentials</h2>
              </div>
              {pro.credentials.length === 0 ? (
                <p className="text-sm text-gray-400">No credentials listed yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {pro.credentials.map((cred) => (
                    <div key={cred.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-navy text-sm">{cred.type}</h4>
                          <p className="text-xs text-gray-500">{cred.issuingBody}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{cred.certificateNumber}</p>
                          {cred.status === "verified" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-5 h-5 text-orange" />
                <h2 className="text-lg font-bold text-navy">Reviews</h2>
              </div>
              {pro.reviews.length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-400">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pro.reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-navy text-sm">{review.clientName}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              {pro.email && (
                <a href={`mailto:${pro.email}`}
                  className="flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors flex-1">
                  <Mail className="w-4 h-4" /> Send Message
                </a>
              )}
              {pro.phone && (
                <a href={`tel:${pro.phone}`}
                  className="flex items-center justify-center gap-2 border-2 border-navy text-navy hover:bg-navy hover:text-white font-semibold px-6 py-2.5 rounded-lg transition-colors flex-1">
                  <Phone className="w-4 h-4" /> Call {pro.phone}
                </a>
              )}
              <div className="flex items-center justify-center gap-2 border-2 border-orange text-orange font-semibold px-6 py-2.5 rounded-lg flex-1 cursor-pointer hover:bg-orange/5 transition-colors">
                <Calendar className="w-4 h-4" /> Book Service
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}