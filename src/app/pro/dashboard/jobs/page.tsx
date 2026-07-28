"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  MapPin,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  "in-progress": "bg-orange/10 text-orange",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface Booking {
  id: string;
  title: string;
  client: string;
  clientEmail?: string;
  date: string;
  location: string;
  status: string;
  amount: number;
  description?: string;
}

export default function ProJobsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ professional: "me" });
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`/api/v1/kps/bookings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        } else {
          setBookings([]);
        }
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [statusFilter]);

  const filters = ["all", "pending", "confirmed", "in-progress", "completed", "cancelled"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/pro/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-navy mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-orange" /> My Jobs
        </h1>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button key={f} onClick={() => { setStatusFilter(f); setSelectedBooking(null); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === f
                  ? "bg-orange text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}>
              {f === "all" ? "All" : statusLabels[f] || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedBooking ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button onClick={() => setSelectedBooking(null)}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to list
            </button>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-navy">{selectedBooking.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Job #{selectedBooking.id.slice(0, 8)}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[selectedBooking.status] || "bg-gray-100 text-gray-600"}`}>
                {statusLabels[selectedBooking.status] || selectedBooking.status}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" /> {selectedBooking.client}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" /> {selectedBooking.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" /> {selectedBooking.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 text-gray-400" /> ${selectedBooking.amount}
              </div>
            </div>
            {selectedBooking.description && (
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Description</h3>
                <p className="text-sm text-gray-600">{selectedBooking.description}</p>
              </div>
            )}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy mb-1">No jobs found</h3>
            <p className="text-sm text-gray-500">
              {statusFilter === "all" ? "You have no bookings yet." : `No ${statusLabels[statusFilter]?.toLowerCase() || ""} jobs.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-navy">{booking.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[booking.status] || "bg-gray-100 text-gray-600"}`}>
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {booking.client}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {booking.location}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="font-semibold text-navy">${booking.amount}</div>
                    <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180 ml-auto mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}