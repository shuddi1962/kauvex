"use client";

import { useState } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
  Unlock,
  MapPin,
  Copy,
  QrCode,
  ArrowUpRight,
  Calendar,
  RotateCcw,
} from "lucide-react";

interface LockerBooking {
  id: string;
  lockerName: string;
  lockerAddress: string;
  compartmentSize: string;
  compartmentId: string;
  pickupCode: string;
  status: "active" | "picked_up" | "expired" | "returning";
  sender: string;
  trackingNumber: string;
  created_at: string;
  expires_at: string;
  weight: string;
  dimensions: string;
}

const bookings: LockerBooking[] = [
  {
    id: "LBK-001",
    lockerName: "Lekki Phase 1 Locker Hub",
    lockerAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    compartmentSize: "Medium (A3)",
    compartmentId: "LKR1-M-014",
    pickupCode: "847291",
    status: "active",
    sender: "Kauvex Express",
    trackingNumber: "KVX-2026-LAG-00412",
    created_at: "2026-06-25T14:30:00Z",
    expires_at: "2026-06-28T14:30:00Z",
    weight: "1.2 kg",
    dimensions: "30 × 20 × 15 cm",
  },
  {
    id: "LBK-002",
    lockerName: "Victoria Island Express Locker",
    lockerAddress: "Plot 1231, Ahmadu Bello Way, Victoria Island, Lagos",
    compartmentSize: "Small (A4)",
    compartmentId: "LKR2-S-007",
    pickupCode: "391056",
    status: "active",
    sender: "TechHub Electronics",
    trackingNumber: "KVX-2026-LAG-00398",
    created_at: "2026-06-24T09:15:00Z",
    expires_at: "2026-06-27T09:15:00Z",
    weight: "0.3 kg",
    dimensions: "20 × 15 × 8 cm",
  },
  {
    id: "LBK-003",
    lockerName: "Lekki Mall Drive-Thru Locker",
    lockerAddress: "14 Admiralty Road, Lekki, Lagos",
    compartmentSize: "Large (A2)",
    compartmentId: "LKR4-L-003",
    pickupCode: "726483",
    status: "picked_up",
    sender: "Fashion House NG",
    trackingNumber: "KVX-2026-LAG-00385",
    created_at: "2026-06-22T16:00:00Z",
    expires_at: "2026-06-25T16:00:00Z",
    weight: "3.5 kg",
    dimensions: "50 × 40 × 30 cm",
  },
  {
    id: "LBK-004",
    lockerName: "Ikeja City Mall Pickup Point",
    lockerAddress: "Obafemi Awolowo Way, Ikeja, Lagos",
    compartmentSize: "Medium (A3)",
    compartmentId: "LKR3-M-011",
    pickupCode: "503817",
    status: "expired",
    sender: "GadgetWorld",
    trackingNumber: "KVX-2026-LAG-00372",
    created_at: "2026-06-18T11:45:00Z",
    expires_at: "2026-06-21T11:45:00Z",
    weight: "0.8 kg",
    dimensions: "25 × 18 × 12 cm",
  },
  {
    id: "LBK-005",
    lockerName: "Yaba Tech Hub Locker",
    lockerAddress: "12 Herbert Macaulay Way, Yaba, Lagos",
    compartmentSize: "Small (A4)",
    compartmentId: "LKR6-S-002",
    pickupCode: "618294",
    status: "returning",
    sender: "Home Essentials Co.",
    trackingNumber: "KVX-2026-LAG-00359",
    created_at: "2026-06-20T08:30:00Z",
    expires_at: "2026-06-23T08:30:00Z",
    weight: "0.5 kg",
    dimensions: "22 × 16 × 10 cm",
  },
];

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Package; label: string }> = {
  active: { color: "text-green-600", bg: "bg-green-50 border-green-200", icon: Lock, label: "Ready for Pickup" },
  picked_up: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: CheckCircle2, label: "Picked Up" },
  expired: { color: "text-red-500", bg: "bg-red-50 border-red-200", icon: AlertTriangle, label: "Expired" },
  returning: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: RotateCcw, label: "Returning to Sender" },
};

export default function LockerBookingsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredBookings = activeTab === "active"
    ? bookings.filter((b) => b.status === "active")
    : bookings;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getTimeRemaining = (expires: string) => {
    const diff = new Date(expires).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1628] text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
            <a href="/express" className="hover:text-white transition">Express</a>
            <ChevronRight className="w-3 h-3" />
            <a href="/express/lockers" className="hover:text-white transition">Lockers</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">My Bookings</span>
          </div>
          <h1 className="text-2xl font-bold">My Locker Bookings</h1>
          <p className="text-white/70 mt-1">Track and manage your locker pickups</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0A1628]">
                  {bookings.filter((b) => b.status === "active").length}
                </div>
                <div className="text-xs text-gray-500">Ready for Pickup</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0A1628]">
                  {bookings.filter((b) => b.status === "picked_up").length}
                </div>
                <div className="text-xs text-gray-500">Picked Up</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0A1628]">
                  {bookings.filter((b) => b.status === "expired").length}
                </div>
                <div className="text-xs text-gray-500">Expired</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#0A1628]">
                  {bookings.filter((b) => b.status === "returning").length}
                </div>
                <div className="text-xs text-gray-500">Returning</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === "active"
                ? "bg-white text-[#0A1628] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active ({bookings.filter((b) => b.status === "active").length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === "all"
                ? "bg-white text-[#0A1628] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const config = statusConfig[booking.status];
            const StatusIcon = config.icon;
            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A1628]">{booking.lockerName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.lockerAddress}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  {booking.status === "active" && (
                    <div className="bg-[#0A1628] rounded-xl p-4 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-white/60 mb-2">Your Pickup Code</div>
                        <div className="text-3xl font-mono font-bold text-[#FF6B00] tracking-[0.3em]">
                          {booking.pickupCode}
                        </div>
                        <div className="text-xs text-white/50 mt-2">
                          Compartment: {booking.compartmentId}
                        </div>
                        <div className="flex gap-2 justify-center mt-3">
                          <button
                            onClick={() => copyCode(booking.pickupCode)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition"
                          >
                            {copiedCode === booking.pickupCode ? (
                              <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
                            ) : (
                              <><Copy className="w-3.5 h-3.5" /> Copy Code</>
                            )}
                          </button>
                          <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition">
                            <QrCode className="w-3.5 h-3.5" /> Show QR
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 text-center">
                        <div className="text-xs text-amber-400 font-medium">
                          ⏱ {getTimeRemaining(booking.expires_at)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <div className="text-gray-500 mb-0.5">Size</div>
                      <div className="font-medium text-[#0A1628]">{booking.compartmentSize}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-0.5">From</div>
                      <div className="font-medium text-[#0A1628]">{booking.sender}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-0.5">Tracking</div>
                      <div className="font-medium text-[#FF6B00]">{booking.trackingNumber}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-0.5">Placed</div>
                      <div className="font-medium text-[#0A1628]">{formatDate(booking.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-0.5">Expires</div>
                      <div className="font-medium text-[#0A1628]">{formatDate(booking.expires_at)}</div>
                    </div>
                  </div>

                  {booking.status === "active" && (
                    <div className="mt-4 flex gap-2">
                      <a
                        href={`/express/track/${booking.trackingNumber}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0A1628] text-xs font-medium rounded-lg transition"
                      >
                        Track Package <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`/express/lockers/map`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0A1628] text-xs font-medium rounded-lg transition"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Directions
                      </a>
                    </div>
                  )}

                  {booking.status === "expired" && (
                    <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <div className="text-xs text-red-700">
                        <p className="font-medium">This booking has expired.</p>
                        <p className="mt-1">Your package has been returned to the sender. Contact support for assistance.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredBookings.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0A1628]">No Active Bookings</h3>
              <p className="text-sm text-gray-500 mt-1">When you book a locker compartment, it will appear here.</p>
              <a
                href="/express/lockers/map"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition"
              >
                <MapPin className="w-4 h-4" /> Find a Locker
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
