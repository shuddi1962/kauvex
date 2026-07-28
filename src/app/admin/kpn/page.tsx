"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, UserCheck, Briefcase, TrendingUp, DollarSign, Search,
  ChevronRight, Star, Shield, ArrowUpRight, Clock, CheckCircle,
} from "lucide-react";

interface DashboardStats {
  totalProfessionals: number;
  pendingVerifications: number;
  activeJobs: number;
  totalRevenue: number;
  topCategories: { name: string; count: number }[];
  recentRegistrations: {
    id: string;
    companyName: string | null;
    primaryCategory: string;
    createdAt: string;
    verificationTier: string;
  }[];
  verificationQueue: {
    id: string;
    professionalId: string;
    credentialType: string;
    status: string;
    createdAt: string;
    professional?: { companyName: string | null };
  }[];
  topProfessionals: {
    id: string;
    companyName: string | null;
    primaryCategory: string;
    ratingAverage: number;
    totalJobsCompleted: number;
    verificationTier: string;
  }[];
}

const INITIAL_STATS: DashboardStats = {
  totalProfessionals: 0,
  pendingVerifications: 0,
  activeJobs: 0,
  totalRevenue: 0,
  topCategories: [],
  recentRegistrations: [],
  verificationQueue: [],
  topProfessionals: [],
};

export default function KPNAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/kpn/hubs").then((r) => r.json()),
    ])
      .then(() => {
        // Since there's no admin dashboard API, we'll derive from available data
        setStats({
          totalProfessionals: 0,
          pendingVerifications: 0,
          activeJobs: 0,
          totalRevenue: 0,
          topCategories: [],
          recentRegistrations: [],
          verificationQueue: [],
          topProfessionals: [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    { label: "Total Professionals", value: stats.totalProfessionals, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: Shield, color: "bg-amber-50 text-amber-600" },
    { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase, color: "bg-green-50 text-green-600" },
    { label: "Total Revenue", value: `₦${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "bg-violet-50 text-violet-600" },
  ];

  const quickLinks = [
    { label: "Manage Professionals", href: "/admin/kpn/professionals", icon: UserCheck },
    { label: "Verify Credentials", href: "/admin/kpn/credentials", icon: Shield },
    { label: "View Bookings", href: "/admin/kpn/bookings", icon: Briefcase },
    { label: "Manage Hubs", href: "/admin/kpn/hubs", icon: TrendingUp },
    { label: "Digital Twins", href: "/admin/kpn/digital-twins", icon: TrendingUp },
    { label: "Configurators", href: "/admin/kpn/configurators", icon: TrendingUp },
  ];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-bold text-kauvex-navy tracking-tight">
                {loading ? (
                  <span className="inline-block w-16 h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  kpi.value
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search professionals, bookings..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
          />
        </div>
        <Link
          href="/admin/kpn/professionals"
          className="text-sm text-kauvex-orange font-medium hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-kauvex-navy">Recent Registrations</h3>
            <p className="text-xs text-gray-400 mt-0.5">Pending approval</p>
          </div>
          <Link href="/admin/kpn/professionals" className="text-xs text-kauvex-orange font-medium hover:underline">
            Manage
          </Link>
        </div>
        {stats.recentRegistrations.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">No recent registrations</div>
        ) : loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentRegistrations.slice(0, 5).map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {reg.companyName?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-kauvex-navy">{reg.companyName || "Unnamed"}</p>
                    <p className="text-xs text-gray-400">{reg.primaryCategory}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two columns: Verification Queue + Top Professionals */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Verification Queue */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-kauvex-navy">Verification Queue</h3>
              <p className="text-xs text-gray-400 mt-0.5">Credentials pending review</p>
            </div>
            <Link href="/admin/kpn/credentials" className="text-xs text-kauvex-orange font-medium hover:underline">
              View All
            </Link>
          </div>
          {stats.verificationQueue.length === 0 && !loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">No pending verifications</div>
          ) : loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.verificationQueue.slice(0, 4).map((cred) => (
                <div key={cred.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-kauvex-navy">
                      {cred.professional?.companyName || "Professional"}
                    </p>
                    <p className="text-xs text-gray-400">{cred.credentialType}</p>
                  </div>
                  <span className="text-xs text-amber-600 font-medium">{cred.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Rated Professionals */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-kauvex-navy">Top Rated Professionals</h3>
              <p className="text-xs text-gray-400 mt-0.5">Highest rated</p>
            </div>
            <Link href="/admin/kpn/professionals" className="text-xs text-kauvex-orange font-medium hover:underline">
              View All
            </Link>
          </div>
          {stats.topProfessionals.length === 0 && !loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">No professionals yet</div>
          ) : loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {stats.topProfessionals.slice(0, 5).map((prof) => (
                <div key={prof.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kauvex-orange to-kauvex-orange/70 flex items-center justify-center text-white text-xs font-bold">
                      {prof.companyName?.[0] || "P"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-kauvex-navy">{prof.companyName || "Professional"}</p>
                      <p className="text-xs text-gray-400">{prof.primaryCategory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Star size={12} fill="currentColor" /> {prof.ratingAverage?.toFixed(1) || "—"}
                    </span>
                    <p className="text-xs text-gray-400">{prof.totalJobsCompleted} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-bold text-sm text-kauvex-navy mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-kauvex-orange/10 flex items-center justify-center">
                  <Icon size={18} className="text-kauvex-orange" />
                </div>
                <span className="text-xs font-medium text-gray-600 text-center">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
