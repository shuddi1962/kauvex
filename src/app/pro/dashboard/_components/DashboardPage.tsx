"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  Calendar,
  Star,
  Settings,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const sidebarLinks = [
  { label: "Overview", href: "/pro/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/pro/dashboard/jobs", icon: Briefcase },
  { label: "Earnings", href: "/pro/dashboard", icon: DollarSign },
  { label: "Calendar", href: "/pro/dashboard", icon: Calendar },
  { label: "Reviews", href: "/pro/dashboard", icon: Star },
  { label: "Credentials", href: "/pro/dashboard/credentials", icon: CheckCircle },
  { label: "Settings", href: "/pro/dashboard/settings", icon: Settings },
];

interface DashboardData {
  stats: { activeJobs: number; completedJobs: number; totalEarnings: number; pendingVerification: number };
  upcomingJobs: { id: string; title: string; client: string; date: string; status: string }[];
  recentActivity: { id: string; action: string; timestamp: string }[];
  earningsData: { month: string; amount: number }[];
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/v1/kpn/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-navy text-white hidden lg:flex flex-col flex-shrink-0 min-h-screen">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold text-lg">
            <span className="text-orange">KPN</span> Dashboard
          </h2>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                link.href === "/pro/dashboard" ? "bg-orange/20 text-orange font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}>
              <link.icon className="w-4 h-4" /> {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/pro/search" className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors">
            <ArrowRight className="w-3 h-3" /> Browse public profile
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {welcome && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3">
            <p className="text-green-700 font-medium flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Welcome to KPN! Your profile is now live. Complete your credentials to get verified.
            </p>
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold text-navy mb-6">Dashboard</h1>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
                    <div className="h-7 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 h-64">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
                <div className="h-full bg-gray-50 rounded" />
              </div>
            </div>
          ) : !data ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-1">Unable to load dashboard</h3>
              <p className="text-sm text-gray-500">Please try again later.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Briefcase className="w-4 h-4" /> Active Jobs
                  </div>
                  <div className="text-2xl font-bold text-navy">{data.stats.activeJobs}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <CheckCircle className="w-4 h-4" /> Completed Jobs
                  </div>
                  <div className="text-2xl font-bold text-navy">{data.stats.completedJobs}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <DollarSign className="w-4 h-4" /> Total Earnings
                  </div>
                  <div className="text-2xl font-bold text-green-600">${data.stats.totalEarnings.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" /> Pending Verification
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{data.stats.pendingVerification}</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-navy">Earnings Overview</h2>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    {data.earningsData.length > 0 ? (
                      <div className="h-48 flex items-end gap-2">
                        {data.earningsData.map((item) => {
                          const max = Math.max(...data.earningsData.map((d) => d.amount));
                          const height = max > 0 ? (item.amount / max) * 100 : 0;
                          return (
                            <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[10px] text-gray-400 font-medium">${item.amount}</span>
                              <div className="w-full bg-orange/10 rounded-t-md" style={{ height: `${height}%`, minHeight: height > 0 ? "12px" : "0" }}>
                                <div className="w-full bg-orange rounded-t-md transition-all duration-500" style={{ height: "100%" }} />
                              </div>
                              <span className="text-[10px] text-gray-500">{item.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-10">No earnings data yet.</p>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-navy">Recent Activity</h2>
                    </div>
                    {data.recentActivity.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No recent activity.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-orange mt-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-gray-700">{activity.action}</p>
                              <p className="text-xs text-gray-400">{activity.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-navy">Upcoming Jobs</h2>
                      <Link href="/pro/dashboard/jobs" className="text-xs text-orange hover:underline">View all</Link>
                    </div>
                    {data.upcomingJobs.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No upcoming jobs.</p>
                    ) : (
                      <div className="space-y-3">
                        {data.upcomingJobs.map((job) => (
                          <div key={job.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                            <h4 className="font-medium text-navy text-sm">{job.title}</h4>
                            <p className="text-xs text-gray-500">{job.client}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">{job.date}</span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                job.status === "confirmed" ? "bg-green-50 text-green-600" :
                                job.status === "pending" ? "bg-amber-50 text-amber-600" :
                                "bg-blue-50 text-blue-600"
                              }`}>
                                {job.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}