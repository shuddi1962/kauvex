"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Lock,
  MapPin,
  Copy,
  QrCode,
  ArrowUpRight,
  RotateCcw,
  Search,
  Plus,
  X,
  ShieldCheck,
  Box,
  Thermometer,
  Cpu,
} from "lucide-react";

interface LockerBooking {
  id: string;
  lockerName: string;
  lockerAddress: string;
  compartmentSize: string;
  compartmentId: string;
  pinCode: string;
  waybillNumber: string;
  status: "awaiting_delivery" | "delivered_to_locker" | "collected" | "expired" | "returned";
  sender: string;
  createdAt: string;
  expiresAt: string;
}

interface Locker {
  id: string;
  name: string;
  type: "standard" | "drive_through" | "refrigerated" | "smart_wall";
  address: string;
  distance: string;
  operatingHours: string;
  availableCompartments: Record<string, number>;
}

const BOOKINGS: LockerBooking[] = [
  {
    id: "LBK-001",
    lockerName: "Lekki Phase 1 Locker Hub",
    lockerAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    compartmentSize: "Medium",
    compartmentId: "LKR1-M-014",
    pinCode: "847291",
    waybillNumber: "KVX-2026-LAG-00412",
    status: "delivered_to_locker",
    sender: "Kauvex Express",
    createdAt: "2026-06-24T14:30:00Z",
    expiresAt: "2026-06-27T14:30:00Z",
  },
  {
    id: "LBK-002",
    lockerName: "Victoria Island Express Locker",
    lockerAddress: "Plot 1231, Ahmadu Bello Way, Victoria Island, Lagos",
    compartmentSize: "Small",
    compartmentId: "LKR2-S-007",
    pinCode: "391056",
    waybillNumber: "KVX-2026-LAG-00398",
    status: "delivered_to_locker",
    sender: "TechHub Electronics",
    createdAt: "2026-06-23T09:15:00Z",
    expiresAt: "2026-06-26T09:15:00Z",
  },
  {
    id: "LBK-003",
    lockerName: "Lekki Mall Drive-Thru Locker",
    lockerAddress: "14 Admiralty Road, Lekki, Lagos",
    compartmentSize: "Large",
    compartmentId: "LKR4-L-003",
    pinCode: "726483",
    waybillNumber: "KVX-2026-LAG-00385",
    status: "awaiting_delivery",
    sender: "Fashion House NG",
    createdAt: "2026-06-25T16:00:00Z",
    expiresAt: "2026-06-28T16:00:00Z",
  },
  {
    id: "LBK-004",
    lockerName: "Ikeja City Mall Pickup Point",
    lockerAddress: "Obafemi Awolowo Way, Ikeja, Lagos",
    compartmentSize: "Medium",
    compartmentId: "LKR3-M-011",
    pinCode: "503817",
    waybillNumber: "KVX-2026-LAG-00372",
    status: "collected",
    sender: "GadgetWorld",
    createdAt: "2026-06-18T11:45:00Z",
    expiresAt: "2026-06-21T11:45:00Z",
  },
  {
    id: "LBK-005",
    lockerName: "Yaba Tech Hub Locker",
    lockerAddress: "12 Herbert Macaulay Way, Yaba, Lagos",
    compartmentSize: "Small",
    compartmentId: "LKR6-S-002",
    pinCode: "618294",
    waybillNumber: "KVX-2026-LAG-00359",
    status: "expired",
    sender: "Home Essentials Co.",
    createdAt: "2026-06-15T08:30:00Z",
    expiresAt: "2026-06-18T08:30:00Z",
  },
  {
    id: "LBK-006",
    lockerName: "Surulere Community Locker",
    lockerAddress: "56 Adeniran Ogunsanya St, Surulere, Lagos",
    compartmentSize: "Medium",
    compartmentId: "LKR5-M-009",
    pinCode: "482163",
    waybillNumber: "KVX-2026-LAG-00341",
    status: "returned",
    sender: "BookStore NG",
    createdAt: "2026-06-10T13:20:00Z",
    expiresAt: "2026-06-13T13:20:00Z",
  },
];

const LOCKERS: Locker[] = [
  { id: "LKR-001", name: "Lekki Phase 1 Locker Hub", type: "standard", address: "14 Admiralty Way, Lekki Phase 1", distance: "0.8 km", operatingHours: "24/7", availableCompartments: { XS: 5, S: 12, M: 8, L: 3, XL: 1 } },
  { id: "LKR-002", name: "Victoria Island Express Locker", type: "smart_wall", address: "Plot 1231, Ahmadu Bello Way, VI", distance: "2.3 km", operatingHours: "24/7", availableCompartments: { XS: 8, S: 18, M: 14, L: 6, XL: 2 } },
  { id: "LKR-003", name: "Lekki Mall Drive-Thru Locker", type: "drive_through", address: "14 Admiralty Road, Lekki", distance: "1.5 km", operatingHours: "6AM - 11PM", availableCompartments: { XS: 3, S: 22, M: 16, L: 8, XL: 3 } },
  { id: "LKR-004", name: "Ikeja City Mall Locker", type: "refrigerated", address: "Obafemi Awolowo Way, Ikeja", distance: "12.1 km", operatingHours: "8AM - 10PM", availableCompartments: { XS: 0, S: 0, M: 2, L: 1, XL: 0 } },
  { id: "LKR-005", name: "Yaba Tech Hub Locker", type: "standard", address: "12 Herbert Macaulay Way, Yaba", distance: "6.2 km", operatingHours: "7AM - 10PM", availableCompartments: { XS: 4, S: 9, M: 4, L: 1, XL: 0 } },
  { id: "LKR-006", name: "Surulere Community Locker", type: "standard", address: "56 Adeniran Ogunsanya St", distance: "8.7 km", operatingHours: "24/7", availableCompartments: { XS: 2, S: 5, M: 0, L: 2, XL: 0 } },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: typeof Package }> = {
  awaiting_delivery: { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "Awaiting Delivery", icon: Clock },
  delivered_to_locker: { color: "text-green-600", bg: "bg-green-50 border-green-200", label: "Delivered to Locker", icon: CheckCircle2 },
  collected: { color: "text-blue-600", bg: "bg-blue-50 border-blue-200", label: "Collected", icon: Package },
  expired: { color: "text-red-500", bg: "bg-red-50 border-red-200", label: "Expired", icon: AlertTriangle },
  returned: { color: "text-gray-500", bg: "bg-gray-50 border-gray-200", label: "Returned", icon: RotateCcw },
};

const TYPE_BADGES: Record<string, { label: string; color: string; icon: typeof Package }> = {
  standard: { label: "Standard", color: "bg-gray-100 text-gray-700", icon: Box },
  drive_through: { label: "Drive-Through", color: "bg-purple-100 text-purple-700", icon: ArrowUpRight },
  refrigerated: { label: "Refrigerated", color: "bg-cyan-100 text-cyan-700", icon: Thermometer },
  smart_wall: { label: "Smart Wall", color: "bg-orange-100 text-orange-700", icon: Cpu },
};

type Tab = "bookings" | "find" | "dropoff" | "history";

function getTimeRemaining(expiresAt: string, now: number): string {
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LockerBookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<LockerBooking[]>(BOOKINGS);
  const [pinVisible, setPinVisible] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [findSearch, setFindSearch] = useState("");
  const [dropoffLocker, setDropoffLocker] = useState<Locker | null>(null);
  const [dropoffSize, setDropoffSize] = useState<string>("");
  const [showCollectModal, setShowCollectModal] = useState<string | null>(null);
  const [collectPin, setCollectPin] = useState("");
  const [collectError, setCollectError] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => { setNow(Date.now()); }, []);

  const togglePin = useCallback((id: string) => {
    setPinVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const copyPin = useCallback((id: string, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const filteredFindLockers = LOCKERS.filter((l) => {
    if (findSearch && !l.name.toLowerCase().includes(findSearch.toLowerCase()) && !l.address.toLowerCase().includes(findSearch.toLowerCase())) return false;
    return true;
  });

  const activeBookings = bookings.filter((b) => b.status === "awaiting_delivery" || b.status === "delivered_to_locker");
  const historyBookings = bookings.filter((b) => b.status === "collected" || b.status === "expired" || b.status === "returned");

  const handleCollect = (bookingId: string) => {
    setCollectPin("");
    setCollectError("");
    setShowCollectModal(bookingId);
  };

  const submitCollect = () => {
    if (!showCollectModal) return;
    const booking = bookings.find((b) => b.id === showCollectModal);
    if (!booking) return;
    if (collectPin !== booking.pinCode) {
      setCollectError("Incorrect PIN. Please try again.");
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === showCollectModal ? { ...b, status: "collected" as const } : b))
    );
    setShowCollectModal(null);
    setCollectPin("");
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "bookings", label: "My Bookings", count: activeBookings.length },
    { key: "find", label: "Find a Locker" },
    { key: "dropoff", label: "Drop Off" },
    { key: "history", label: "History", count: historyBookings.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1628] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
            <a href="/express" className="hover:text-white transition">Express</a>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Lockers</span>
          </div>
          <h1 className="text-2xl font-bold">Locker Services</h1>
          <p className="text-white/70 mt-1">Book, collect, and manage locker pickups</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? "border-[#FF6B00] text-[#FF6B00]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "bg-gray-100 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ===== MY BOOKINGS TAB ===== */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0A1628]">Active Bookings</h2>
              <button
                onClick={() => setActiveTab("find")}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition"
              >
                <Plus className="w-4 h-4" /> New Booking
              </button>
            </div>

            {activeBookings.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#0A1628]">No Active Bookings</h3>
                <p className="text-sm text-gray-500 mt-1">Book a locker compartment to get started.</p>
                <button
                  onClick={() => setActiveTab("find")}
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition"
                >
                  <MapPin className="w-4 h-4" /> Find a Locker
                </button>
              </div>
            )}

            {activeBookings.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status];
              const StatusIcon = cfg.icon;
              const isDelivered = booking.status === "delivered_to_locker";
              return (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                  <div className="p-5">
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                          <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#0A1628]">{booking.lockerName}</h3>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {booking.lockerAddress}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* PIN & QR Section */}
                    {(booking.status === "awaiting_delivery" || booking.status === "delivered_to_locker") && (
                      <div className="bg-[#0A1628] rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-xs text-white/60 mb-1">PIN Code</div>
                            <div className="text-2xl font-mono font-bold text-[#FF6B00] tracking-[0.3em]">
                              {pinVisible[booking.id] ? booking.pinCode : "••••••"}
                            </div>
                            <div className="text-[10px] text-white/40 mt-1">Compartment: {booking.compartmentId}</div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                              <QrCode className="w-10 h-10 text-white/40" />
                            </div>
                            <span className="text-[10px] text-white/40">Scan QR</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => togglePin(booking.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {pinVisible[booking.id] ? "Hide PIN" : "Reveal PIN"}
                          </button>
                          <button
                            onClick={() => copyPin(booking.id, booking.pinCode)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition"
                          >
                            {copiedId === booking.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === booking.id ? "Copied!" : "Copy PIN"}
                          </button>
                        </div>
                        {/* Countdown */}
                        <div className="mt-3 pt-3 border-t border-white/10 text-center">
                          <div className="text-xs text-amber-400 font-medium">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {now > 0 ? getTimeRemaining(booking.expiresAt, now) : "—"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                      <div>
                        <div className="text-gray-500 mb-0.5">Size</div>
                        <div className="font-medium text-[#0A1628]">{booking.compartmentSize}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-0.5">Waybill</div>
                        <div className="font-medium text-[#FF6B00]">{booking.waybillNumber}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-0.5">Placed</div>
                        <div className="font-medium text-[#0A1628]">{formatDate(booking.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-0.5">Expires</div>
                        <div className="font-medium text-[#0A1628]">{formatDate(booking.expiresAt)}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {isDelivered && (
                        <button
                          onClick={() => handleCollect(booking.id)}
                          className="flex items-center gap-1.5 px-5 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition"
                        >
                          <Lock className="w-3.5 h-3.5" /> Collect Now
                        </button>
                      )}
                      <a
                        href={`/express/track/${booking.waybillNumber}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0A1628] text-xs font-medium rounded-lg transition"
                      >
                        Track <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href="/express/lockers/map"
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0A1628] text-xs font-medium rounded-lg transition"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Directions
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== FIND A LOCKER TAB ===== */}
        {activeTab === "find" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lockers by name or address..."
                value={findSearch}
                onChange={(e) => setFindSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFindLockers.map((locker) => {
                const badge = TYPE_BADGES[locker.type];
                const BadgeIcon = badge.icon;
                const totalAvail = Object.values(locker.availableCompartments).reduce((a, b) => a + b, 0);
                return (
                  <div key={locker.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#0A1628] text-sm truncate">{locker.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{locker.address}</p>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" /> {badge.label}
                      </span>
                    </div>

                    {/* Compartment Sizes */}
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                      {(["XS", "S", "M", "L", "XL"] as const).map((size) => (
                        <div key={size} className="text-center">
                          <div className={`text-[10px] font-medium rounded py-1 ${
                            locker.availableCompartments[size] > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-50 text-gray-400"
                          }`}>
                            {size}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{locker.availableCompartments[size]}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {locker.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {locker.operatingHours}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{totalAvail} compartments free</span>
                      <button className="px-4 py-1.5 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition">
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== DROP OFF TAB ===== */}
        {activeTab === "dropoff" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0A1628]">Self Drop-Off</h2>
            <p className="text-sm text-gray-500">Select a locker and compartment size for your drop-off.</p>

            {!dropoffLocker ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LOCKERS.filter((l) => Object.values(l.availableCompartments).some((v) => v > 0)).map((locker) => {
                  const badge = TYPE_BADGES[locker.type];
                  const BadgeIcon = badge.icon;
                  return (
                    <button
                      key={locker.id}
                      onClick={() => setDropoffLocker(locker)}
                      className="text-left bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-[#FF6B00] transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[#0A1628] text-sm">{locker.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{locker.address}</p>
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" /> {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>{locker.distance}</span>
                        <span>{locker.operatingHours}</span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        {(["XS", "S", "M", "L", "XL"] as const).map((size) => (
                          <span
                            key={size}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              locker.availableCompartments[size] > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-50 text-gray-400"
                            }`}
                          >
                            {size}:{locker.availableCompartments[size]}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[#0A1628]">{dropoffLocker.name}</h3>
                    <p className="text-xs text-gray-500">{dropoffLocker.address}</p>
                  </div>
                  <button
                    onClick={() => { setDropoffLocker(null); setDropoffSize(""); }}
                    className="p-1 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-[#0A1628] mb-2 block">Select Compartment Size</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["XS", "S", "M", "L", "XL"] as const).map((size) => (
                      <button
                        key={size}
                        disabled={dropoffLocker.availableCompartments[size] === 0}
                        onClick={() => setDropoffSize(size)}
                        className={`py-3 rounded-lg text-sm font-semibold transition border-2 ${
                          dropoffSize === size
                            ? "border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]"
                            : dropoffLocker.availableCompartments[size] > 0
                            ? "border-gray-200 hover:border-gray-300 text-[#0A1628]"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        {size}
                        <div className="text-[10px] font-normal mt-0.5">
                          {dropoffLocker.availableCompartments[size]} free
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={!dropoffSize}
                  className={`w-full py-3 rounded-lg text-sm font-semibold transition ${
                    dropoffSize
                      ? "bg-[#FF6B00] text-white hover:bg-[#e55f00]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {dropoffSize ? `Drop Off — ${dropoffSize} Compartment` : "Select a Size"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0A1628]">Booking History</h2>

            {historyBookings.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#0A1628]">No History Yet</h3>
                <p className="text-sm text-gray-500 mt-1">Past bookings will appear here.</p>
              </div>
            )}

            {historyBookings.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status];
              const StatusIcon = cfg.icon;
              const created = new Date(booking.createdAt);
              const expires = new Date(booking.expiresAt);
              const durationHours = Math.round((expires.getTime() - created.getTime()) / (1000 * 60 * 60));

              return (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A1628] text-sm">{booking.lockerName}</h3>
                        <p className="text-xs text-gray-500">{booking.compartmentSize} compartment</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-gray-500">Date</div>
                      <div className="font-medium text-[#0A1628]">{formatDate(booking.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Waybill</div>
                      <div className="font-medium text-[#FF6B00]">{booking.waybillNumber}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Duration</div>
                      <div className="font-medium text-[#0A1628]">{durationHours}h</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Status</div>
                      <div className="font-medium text-[#0A1628]">{cfg.label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collect Modal */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0A1628]">Enter PIN to Collect</h3>
              <button onClick={() => setShowCollectModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Enter the 6-digit PIN shown on your booking to open the compartment.</p>
            <input
              type="text"
              maxLength={6}
              value={collectPin}
              onChange={(e) => { setCollectPin(e.target.value.replace(/\D/g, "")); setCollectError(""); }}
              className="w-full text-center text-2xl font-mono font-bold tracking-[0.3em] py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              placeholder="••••••"
              autoFocus
            />
            {collectError && (
              <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {collectError}
              </div>
            )}
            <button
              onClick={submitCollect}
              disabled={collectPin.length !== 6}
              className={`w-full mt-4 py-3 rounded-xl text-sm font-semibold transition ${
                collectPin.length === 6
                  ? "bg-[#FF6B00] text-white hover:bg-[#e55f00]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Open Compartment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
