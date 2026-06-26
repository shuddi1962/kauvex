"use client";

import { useState, useMemo } from "react";
import {
  Package, DollarSign, TrendingUp, Clock, Users, Lock,
  MapPin, Truck, Eye, Search, Filter, Download, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Zap, BarChart3, CheckCircle,
  AlertTriangle, Plus, ExternalLink, RefreshCw, ChevronDown,
  Settings, Fuel, Building2, Tag, Percent, ToggleLeft, ToggleRight,
  Edit3, Save, X, Check, ChevronLeft, ChevronRight,
} from "lucide-react";

type ShipmentType = "guest" | "personal" | "business";
type ServiceTier = "economy" | "standard" | "express" | "same_day";
type ShipmentStatus = "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled" | "returned";

interface Shipment {
  id: string;
  waybill: string;
  type: ShipmentType;
  sender: string;
  receiver: string;
  origin: string;
  originCountry: string;
  destination: string;
  destCountry: string;
  tier: ServiceTier;
  status: ShipmentStatus;
  carrier: string;
  revenue: number;
  weight: string;
  date: string;
  time: string;
}

interface BusinessAccount {
  id: string;
  name: string;
  tier: string;
  monthlyVolume: number;
  monthlyRevenue: number;
  accountHealth: string;
  status: "active" | "suspended" | "pending";
  contact: string;
  email: string;
}

interface RateCard {
  id: string;
  country: string;
  countryCode: string;
  tier: ServiceTier;
  baseFee: number;
  perKg: number;
  minFee: number;
  maxFee: number;
  currency: string;
  sla: string;
  active: boolean;
}

interface PackagingFee {
  id: string;
  country: string;
  countryCode: string;
  polyMailer: number;
  boxSmall: number;
  boxMedium: number;
  boxLarge: number;
  fragile: number;
  cold: number;
  currency: string;
}

interface VolumeDiscount {
  id: string;
  tier: string;
  minMonthly: number;
  discountPercent: number;
  description: string;
}

const statusConfig: Record<ShipmentStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-gray-400", bg: "bg-gray-400/10" },
  picked_up: { label: "Picked Up", color: "text-blue-400", bg: "bg-blue-400/10" },
  in_transit: { label: "In Transit", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange", bg: "bg-orange/10" },
  delivered: { label: "Delivered", color: "text-green-400", bg: "bg-green-400/10" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
  returned: { label: "Returned", color: "text-purple-400", bg: "bg-purple-400/10" },
};

const tierConfig: Record<ServiceTier, { label: string; color: string; bg: string }> = {
  economy: { label: "Economy", color: "text-gray-400", bg: "bg-gray-400/10" },
  standard: { label: "Standard", color: "text-blue-400", bg: "bg-blue-400/10" },
  express: { label: "Express", color: "text-orange", bg: "bg-orange/10" },
  same_day: { label: "Same Day", color: "text-green-400", bg: "bg-green-400/10" },
};

const typeConfig: Record<ShipmentType, { label: string; color: string; bg: string }> = {
  guest: { label: "Guest", color: "text-gray-400", bg: "bg-gray-400/10" },
  personal: { label: "Personal", color: "text-blue-400", bg: "bg-blue-400/10" },
  business: { label: "Business", color: "text-purple-400", bg: "bg-purple-400/10" },
};

const shipments: Shipment[] = [
  { id: "1", waybill: "KX-EX-10001", type: "business", sender: "TechPro Solutions", receiver: "Amina Bello", origin: "Lagos", originCountry: "NG", destination: "Abuja", destCountry: "NG", tier: "express", status: "delivered", carrier: "DHL", revenue: 12500, weight: "2.3kg", date: "2026-06-26", time: "10:30" },
  { id: "2", waybill: "KX-EX-10002", type: "personal", sender: "Tunde Adeyemi", receiver: "Grace Eze", origin: "Port Harcourt", originCountry: "NG", destination: "Lagos", destCountry: "NG", tier: "standard", status: "in_transit", carrier: "FedEx", revenue: 8500, weight: "1.1kg", date: "2026-06-26", time: "14:00" },
  { id: "3", waybill: "KX-EX-10003", type: "guest", sender: "Walk-in Guest", receiver: "Musa Abdullahi", origin: "Abuja", originCountry: "NG", destination: "Kano", destCountry: "NG", tier: "same_day", status: "out_for_delivery", carrier: "GIG", revenue: 18000, weight: "4.5kg", date: "2026-06-26", time: "07:00" },
  { id: "4", waybill: "KX-EX-10004", type: "personal", sender: "Blessing Okonkwo", receiver: "Emeka Nwachukwu", origin: "Lagos", originCountry: "NG", destination: "Port Harcourt", destCountry: "NG", tier: "economy", status: "picked_up", carrier: "Kwik", revenue: 6500, weight: "0.8kg", date: "2026-06-26", time: "09:00" },
  { id: "5", waybill: "KX-EX-10005", type: "business", sender: "Global Security", receiver: "Yusuf Hassan", origin: "Warri", originCountry: "NG", destination: "Benin", destCountry: "NG", tier: "express", status: "pending", carrier: "DHL", revenue: 11000, weight: "3.2kg", date: "2026-06-26", time: "08:30" },
  { id: "6", waybill: "KX-EX-10006", type: "guest", sender: "Walk-in Guest", receiver: "Ibrahim Musa", origin: "Lagos", originCountry: "NG", destination: "Abuja", destCountry: "NG", tier: "same_day", status: "delivered", carrier: "GIG", revenue: 22000, weight: "5.1kg", date: "2026-06-26", time: "06:15" },
  { id: "7", waybill: "KX-EX-10007", type: "personal", sender: "Emeka Obi", receiver: "Fatima Bello", origin: "Enugu", originCountry: "NG", destination: "Lagos", destCountry: "NG", tier: "standard", status: "in_transit", carrier: "FedEx", revenue: 9200, weight: "2.0kg", date: "2026-06-26", time: "11:45" },
  { id: "8", waybill: "KX-EX-10008", type: "business", sender: "SunPower Electronics", receiver: "Chukwuemeka O.", origin: "Kano", originCountry: "NG", destination: "Lagos", destCountry: "NG", tier: "express", status: "delivered", carrier: "DHL", revenue: 14500, weight: "1.8kg", date: "2026-06-25", time: "16:20" },
  { id: "9", waybill: "KX-EX-10009", type: "guest", sender: "Walk-in Guest", receiver: "Ngozi Okafor", origin: "Lagos", originCountry: "NG", destination: "Ibadan", destCountry: "NG", tier: "economy", status: "cancelled", carrier: "Kwik", revenue: 5500, weight: "0.5kg", date: "2026-06-25", time: "13:00" },
  { id: "10", waybill: "KX-EX-10010", type: "personal", sender: "Yemi Oladipo", receiver: "Blessing Amadi", origin: "Abuja", originCountry: "NG", destination: "PH", destCountry: "NG", tier: "standard", status: "pending", carrier: "FedEx", revenue: 10000, weight: "2.7kg", date: "2026-06-26", time: "09:15" },
  { id: "11", waybill: "KX-EX-10011", type: "business", sender: "Abuja Solar Dist.", receiver: "John Doe", origin: "Abuja", originCountry: "NG", destination: "Lagos", destCountry: "NG", tier: "express", status: "in_transit", carrier: "DHL", revenue: 15800, weight: "6.2kg", date: "2026-06-26", time: "07:30" },
  { id: "12", waybill: "KX-EX-10012", type: "guest", sender: "Walk-in Guest", receiver: "Jane Smith", origin: "Lagos", originCountry: "NG", destination: "Accra", destCountry: "GH", tier: "express", status: "in_transit", carrier: "DHL International", revenue: 45000, weight: "3.4kg", date: "2026-06-25", time: "12:00" },
];

const businessAccounts: BusinessAccount[] = [
  { id: "BA-001", name: "TechPro Solutions Ltd", tier: "enterprise", monthlyVolume: 234, monthlyRevenue: 2890000, accountHealth: "excellent", status: "active", contact: "Chidi Okafor", email: "chidi@techpro.ng" },
  { id: "BA-002", name: "Global Security Systems", tier: "business", monthlyVolume: 189, monthlyRevenue: 2100000, accountHealth: "good", status: "active", contact: "Tunde Adeyemi", email: "tunde@gss.ng" },
  { id: "BA-003", name: "SunPower Electronics", tier: "business", monthlyVolume: 156, monthlyRevenue: 1780000, accountHealth: "good", status: "active", contact: "Kunle Ajayi", email: "kunle@sunpower.ng" },
  { id: "BA-004", name: "Abuja Solar Distributors", tier: "standard", monthlyVolume: 98, monthlyRevenue: 1200000, accountHealth: "fair", status: "active", contact: "Musa Abdullahi", email: "musa@abjSolar.ng" },
  { id: "BA-005", name: "PH Marine Supplies", tier: "standard", monthlyVolume: 67, monthlyRevenue: 890000, accountHealth: "poor", status: "suspended", contact: "Grace Eze", email: "grace@phmarine.ng" },
];

const initialRateCards: RateCard[] = [
  { id: "rc-1", country: "Nigeria", countryCode: "NG", tier: "economy", baseFee: 1500, perKg: 200, minFee: 1500, maxFee: 8000, currency: "NGN", sla: "3-5 days", active: true },
  { id: "rc-2", country: "Nigeria", countryCode: "NG", tier: "standard", baseFee: 2500, perKg: 350, minFee: 2500, maxFee: 15000, currency: "NGN", sla: "2-3 days", active: true },
  { id: "rc-3", country: "Nigeria", countryCode: "NG", tier: "express", baseFee: 4000, perKg: 600, minFee: 4000, maxFee: 25000, currency: "NGN", sla: "1-2 days", active: true },
  { id: "rc-4", country: "Nigeria", countryCode: "NG", tier: "same_day", baseFee: 6000, perKg: 1000, minFee: 6000, maxFee: 40000, currency: "NGN", sla: "Same day", active: true },
  { id: "rc-5", country: "United Kingdom", countryCode: "GB", tier: "economy", baseFee: 5.99, perKg: 1.20, minFee: 5.99, maxFee: 25.00, currency: "GBP", sla: "5-7 days", active: true },
  { id: "rc-6", country: "United Kingdom", countryCode: "GB", tier: "standard", baseFee: 8.99, perKg: 2.00, minFee: 8.99, maxFee: 40.00, currency: "GBP", sla: "3-4 days", active: true },
  { id: "rc-7", country: "United Kingdom", countryCode: "GB", tier: "express", baseFee: 14.99, perKg: 3.50, minFee: 14.99, maxFee: 65.00, currency: "GBP", sla: "1-2 days", active: true },
  { id: "rc-8", country: "Ghana", countryCode: "GH", tier: "economy", baseFee: 25.00, perKg: 5.00, minFee: 25.00, maxFee: 120.00, currency: "GHS", sla: "3-5 days", active: true },
  { id: "rc-9", country: "Ghana", countryCode: "GH", tier: "express", baseFee: 65.00, perKg: 12.00, minFee: 65.00, maxFee: 350.00, currency: "GHS", sla: "1-2 days", active: true },
];

const initialPackagingFees: PackagingFee[] = [
  { id: "pf-1", country: "Nigeria", countryCode: "NG", polyMailer: 200, boxSmall: 500, boxMedium: 800, boxLarge: 1200, fragile: 1500, cold: 2500, currency: "NGN" },
  { id: "pf-2", country: "United Kingdom", countryCode: "GB", polyMailer: 1.00, boxSmall: 2.50, boxMedium: 4.00, boxLarge: 6.00, fragile: 8.00, cold: 12.00, currency: "GBP" },
  { id: "pf-3", country: "Ghana", countryCode: "GH", polyMailer: 5.00, boxSmall: 12.00, boxMedium: 20.00, boxLarge: 30.00, fragile: 40.00, cold: 60.00, currency: "GHS" },
];

const volumeDiscounts: VolumeDiscount[] = [
  { id: "vd-1", tier: "Bronze", minMonthly: 0, discountPercent: 0, description: "Standard pricing" },
  { id: "vd-2", tier: "Silver", minMonthly: 50, discountPercent: 5, description: "50+ shipments/month" },
  { id: "vd-3", tier: "Gold", minMonthly: 150, discountPercent: 10, description: "150+ shipments/month" },
  { id: "vd-4", tier: "Platinum", minMonthly: 500, discountPercent: 15, description: "500+ shipments/month" },
  { id: "vd-5", tier: "Enterprise", minMonthly: 1000, discountPercent: 20, description: "1000+ shipments/month" },
];

export default function AdminExpressManagementPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "shipments" | "accounts" | "pricing">("overview");

  // Shipments filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterCarrier, setFilterCarrier] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pricing state
  const [rateCards, setRateCards] = useState(initialRateCards);
  const [packagingFees, setPackagingFees] = useState(initialPackagingFees);
  const [fuelSurchargeActive, setFuelSurchargeActive] = useState(true);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editingPkg, setEditingPkg] = useState<string | null>(null);
  const [promoRates, setPromoRates] = useState<{ id: string; country: string; tier: string; discount: number; expires: string }[]>([
    { id: "pr-1", country: "NG", tier: "express", discount: 15, expires: "2026-07-15" },
    { id: "pr-2", country: "GH", tier: "economy", discount: 10, expires: "2026-06-30" },
  ]);

  // Computed
  const todayShipments = shipments.filter((s) => s.date === "2026-06-26");
  const todayRevenue = todayShipments.reduce((sum, s) => sum + s.revenue, 0);
  const activeCount = shipments.filter((s) => ["picked_up", "in_transit", "out_for_delivery"].includes(s.status)).length;
  const deliveredCount = todayShipments.filter((s) => s.status === "delivered").length;
  const avgDeliveryMin = 42;
  const successRate = todayShipments.length > 0 ? Math.round((deliveredCount / todayShipments.length) * 100) : 0;

  const countries = useMemo(() => [...new Set(shipments.map((s) => s.originCountry))], []);
  const carriers = useMemo(() => [...new Set(shipments.map((s) => s.carrier))], []);

  const filteredShipments = shipments.filter((s) => {
    if (filterType !== "all" && s.type !== filterType) return false;
    if (filterTier !== "all" && s.tier !== filterTier) return false;
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterCountry !== "all" && s.originCountry !== filterCountry && s.destCountry !== filterCountry) return false;
    if (filterCarrier !== "all" && s.carrier !== filterCarrier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.waybill.toLowerCase().includes(q) && !s.sender.toLowerCase().includes(q) && !s.receiver.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const updateRateCard = (id: string, field: keyof RateCard, value: number) => {
    setRateCards((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const updatePackagingFee = (id: string, field: keyof PackagingFee, value: number) => {
    setPackagingFees((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#FF6B00]/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#FF6B00]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Kauvex Express Management</h1>
              <p className="text-[10px] text-white/40 mt-0.5">Shipments, business accounts, and pricing — KSP8.2</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs transition">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-medium hover:bg-[#e55f00] transition">
              <Plus className="h-3.5 w-3.5" />
              New Shipment
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-1 border-b border-white/10 -mb-4">
          {([
            { key: "overview", icon: BarChart3, label: "Overview" },
            { key: "shipments", icon: Package, label: "All Shipments" },
            { key: "accounts", icon: Building2, label: "Business Accounts" },
            { key: "pricing", icon: DollarSign, label: "Pricing Management" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-[#FF6B00] text-[#FF6B00]"
                  : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <tab.icon className="inline h-3.5 w-3.5 mr-1.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Shipments Today", value: todayShipments.length.toLocaleString(), sub: `${shipments.length} total`, icon: Package, color: "text-[#FF6B00]", bg: "bg-[#FF6B00]/10" },
                { label: "Revenue Today", value: `₦${todayRevenue.toLocaleString()}`, sub: "Express only", icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
                { label: "Active Right Now", value: activeCount.toString(), sub: "In transit", icon: Truck, color: "text-blue-400", bg: "bg-blue-400/10" },
                { label: "Avg Delivery Time", value: `${avgDeliveryMin}min`, sub: "Today", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-400/10" },
                { label: "Success Rate", value: `${successRate}%`, sub: "Today", icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Shipments + Status Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="col-span-2 rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Recent Shipments</h3>
                <div className="space-y-2">
                  {shipments.slice(0, 6).map((s) => {
                    const st = statusConfig[s.status];
                    const sv = tierConfig[s.tier];
                    const tp = typeConfig[s.type];
                    return (
                      <div key={s.id} className="flex items-center gap-4 rounded-lg bg-white/5 px-4 py-3 hover:bg-white/8 transition-colors">
                        <div className="w-24">
                          <div className="text-xs font-mono font-bold text-white">{s.waybill}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white/80 truncate">{s.sender} → {s.receiver}</div>
                          <div className="text-[10px] text-white/40">{s.origin} → {s.destination}</div>
                        </div>
                        <div className={`rounded px-2 py-0.5 text-[10px] font-medium ${tp.bg} ${tp.color}`}>{tp.label}</div>
                        <div className={`rounded px-2 py-0.5 text-[10px] font-medium ${sv.bg} ${sv.color}`}>{sv.label}</div>
                        <div className={`rounded px-2 py-0.5 text-[10px] font-medium ${st.bg} ${st.color}`}>{st.label}</div>
                        <div className="text-xs font-bold text-white w-20 text-right">₦{s.revenue.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Tier Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(tierConfig).map(([key, cfg]) => {
                      const count = shipments.filter((s) => s.tier === key).length;
                      const pct = Math.round((count / shipments.length) * 100);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={cfg.color}>{cfg.label}</span>
                            <span className="text-white/50">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${cfg.color.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Type Mix</h3>
                  <div className="space-y-3">
                    {Object.entries(typeConfig).map(([key, cfg]) => {
                      const count = shipments.filter((s) => s.type === key).length;
                      const pct = Math.round((count / shipments.length) * 100);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={cfg.color}>{cfg.label}</span>
                            <span className="text-white/50">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className={`h-full rounded-full ${cfg.color.replace("text-", "bg-")}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Status Summary</h3>
                  <div className="space-y-2">
                    {Object.entries(statusConfig).map(([key, cfg]) => {
                      const count = shipments.filter((s) => s.status === key).length;
                      if (count === 0) return null;
                      return (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-white/60">{cfg.label}</span>
                          <span className="font-bold text-white">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ALL SHIPMENTS TAB ==================== */}
        {activeTab === "shipments" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search waybill, sender, receiver..."
                  className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6B00]/50"
                />
              </div>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none">
                <option value="all">All Types</option>
                <option value="guest">Guest</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
              <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none">
                <option value="all">All Tiers</option>
                <option value="economy">Economy</option>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="same_day">Same Day</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none">
                <option value="all">All Status</option>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none">
                <option value="all">All Countries</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterCarrier} onChange={(e) => setFilterCarrier(e.target.value)} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white focus:outline-none">
                <option value="all">All Carriers</option>
                {carriers.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-xs text-white/30 ml-auto">{filteredShipments.length} results</span>
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Waybill</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Origin</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Destination</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Tier</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Carrier</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Revenue</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipments.map((s) => {
                      const st = statusConfig[s.status];
                      const sv = tierConfig[s.tier];
                      const tp = typeConfig[s.type];
                      return (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-mono font-bold text-[#FF6B00]">{s.waybill}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${tp.bg} ${tp.color}`}>{tp.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-white/80">{s.origin}</div>
                            <div className="text-[10px] text-white/40">{s.originCountry}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-white/80">{s.destination}</div>
                            <div className="text-[10px] text-white/40">{s.destCountry}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${sv.bg} ${sv.color}`}>{sv.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${st.bg} ${st.color}`}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-white/70">{s.carrier}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold text-white">₦{s.revenue.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white" title="View">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white" title="Track">
                                <Truck className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredShipments.length === 0 && (
                <div className="py-12 text-center text-white/30 text-xs">No shipments match your filters</div>
              )}
            </div>
          </div>
        )}

        {/* ==================== BUSINESS ACCOUNTS TAB ==================== */}
        {activeTab === "accounts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Business Accounts ({businessAccounts.length})</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-medium hover:bg-[#e55f00] transition">
                <Plus className="h-3.5 w-3.5" />
                Add Account
              </button>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Account Name</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Tier</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">Monthly Volume</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">Monthly Revenue</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Account Health</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-white/40 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businessAccounts.map((account) => {
                      const healthColor = account.accountHealth === "excellent" ? "text-green-400" : account.accountHealth === "good" ? "text-blue-400" : account.accountHealth === "fair" ? "text-yellow-400" : "text-red-400";
                      const healthBg = account.accountHealth === "excellent" ? "bg-green-400/10" : account.accountHealth === "good" ? "bg-blue-400/10" : account.accountHealth === "fair" ? "bg-yellow-400/10" : "bg-red-400/10";
                      const tierColor = account.tier === "enterprise" ? "text-yellow-400 bg-yellow-400/10" : account.tier === "business" ? "text-blue-400 bg-blue-400/10" : "text-white/50 bg-white/10";
                      const statusColor = account.status === "active" ? "text-green-400" : account.status === "suspended" ? "text-red-400" : "text-yellow-400";
                      return (
                        <tr key={account.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center text-xs font-bold text-[#FF6B00]">
                                {account.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{account.name}</div>
                                <div className="text-[10px] text-white/40">{account.id} — {account.contact}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${tierColor}`}>{account.tier}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold text-white">{account.monthlyVolume}</span>
                            <span className="text-[10px] text-white/40 ml-1">shipments</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold text-green-400">₦{account.monthlyRevenue.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-medium capitalize ${healthColor} ${healthBg}`}>{account.accountHealth}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className={`h-2 w-2 rounded-full ${account.status === "active" ? "bg-green-400" : account.status === "suspended" ? "bg-red-400" : "bg-yellow-400"}`} />
                              <span className={`text-xs capitalize ${statusColor}`}>{account.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white" title="View">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white" title="Edit">
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PRICING MANAGEMENT TAB ==================== */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            {/* Rate Cards */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#FF6B00]" />
                  Rate Cards (Per Country, Per Tier)
                </h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-medium hover:bg-[#e55f00] transition">
                  <Plus className="h-3.5 w-3.5" />
                  Add Rate
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-2 text-left text-[10px] font-bold text-white/40 uppercase">Country</th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold text-white/40 uppercase">Tier</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Base Fee</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Per Kg</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Min</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Max</th>
                      <th className="px-3 py-2 text-left text-[10px] font-bold text-white/40 uppercase">SLA</th>
                      <th className="px-3 py-2 text-center text-[10px] font-bold text-white/40 uppercase">Active</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateCards.map((rc) => {
                      const isEditing = editingRate === rc.id;
                      return (
                        <tr key={rc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-3 py-2">
                            <div className="text-xs text-white/80">{rc.country}</div>
                            <div className="text-[10px] text-white/40">{rc.countryCode}</div>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${tierConfig[rc.tier].bg} ${tierConfig[rc.tier].color}`}>{tierConfig[rc.tier].label}</span>
                          </td>
                          {(["baseFee", "perKg", "minFee", "maxFee"] as const).map((field) => (
                            <td key={field} className="px-3 py-2 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={rc[field]}
                                  onChange={(e) => updateRateCard(rc.id, field, Number(e.target.value))}
                                  className="w-20 text-right rounded bg-white/10 border border-[#FF6B00]/50 px-2 py-1 text-xs text-white focus:outline-none"
                                />
                              ) : (
                                <span className="text-xs text-white/70">{rc.currency} {rc[field].toLocaleString()}</span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            <span className="text-[10px] text-green-400">{rc.sla}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className={`h-2 w-2 rounded-full mx-auto ${rc.active ? "bg-green-400" : "bg-white/20"}`} />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => setEditingRate(isEditing ? null : rc.id)}
                              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white"
                            >
                              {isEditing ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Edit3 className="h-3.5 w-3.5" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Packaging Fees */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#FF6B00]" />
                  Packaging Fees (Per Country)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-2 text-left text-[10px] font-bold text-white/40 uppercase">Country</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Poly Mailer</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Box S</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Box M</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Box L</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Fragile</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Cold</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold text-white/40 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagingFees.map((pf) => {
                      const isEditing = editingPkg === pf.id;
                      return (
                        <tr key={pf.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-3 py-2">
                            <div className="text-xs text-white/80">{pf.country}</div>
                            <div className="text-[10px] text-white/40">{pf.countryCode}</div>
                          </td>
                          {(["polyMailer", "boxSmall", "boxMedium", "boxLarge", "fragile", "cold"] as const).map((field) => (
                            <td key={field} className="px-3 py-2 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={pf[field]}
                                  onChange={(e) => updatePackagingFee(pf.id, field, Number(e.target.value))}
                                  className="w-16 text-right rounded bg-white/10 border border-[#FF6B00]/50 px-2 py-1 text-xs text-white focus:outline-none"
                                />
                              ) : (
                                <span className="text-xs text-white/70">{pf.currency} {pf[field]}</span>
                              )}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => setEditingPkg(isEditing ? null : pf.id)}
                              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white"
                            >
                              {isEditing ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Edit3 className="h-3.5 w-3.5" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Volume Discounts */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#FF6B00]" />
                  Volume Discount Tiers
                </h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs transition">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {volumeDiscounts.map((vd, i) => (
                  <div key={vd.id} className={`rounded-xl border p-4 ${i === volumeDiscounts.length - 1 ? "bg-[#FF6B00]/5 border-[#FF6B00]/30" : "bg-white/5 border-white/10"}`}>
                    <div className="text-xs font-bold text-white mb-2">{vd.tier}</div>
                    <div className="text-2xl font-black text-[#FF6B00]">{vd.discountPercent}%</div>
                    <div className="text-[10px] text-white/40 mt-1">{vd.description}</div>
                    <div className="text-[10px] text-white/30 mt-2">Min: {vd.minMonthly} ships/mo</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promotional Rates + Fuel Surcharges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Promotional Rates */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                    <Percent className="h-4 w-4 text-[#FF6B00]" />
                    Promotional Rates
                  </h3>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B00] text-white text-xs font-medium hover:bg-[#e55f00] transition">
                    <Plus className="h-3.5 w-3.5" />
                    Add Promo
                  </button>
                </div>
                <div className="space-y-2">
                  {promoRates.map((pr) => (
                    <div key={pr.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="h-8 w-8 rounded bg-[#FF6B00]/10 flex items-center justify-center text-[10px] font-bold text-[#FF6B00]">{pr.country}</div>
                      <div className="flex-1">
                        <div className="text-xs text-white/80">{pr.tier.charAt(0).toUpperCase() + pr.tier.slice(1)} — {pr.discount}% off</div>
                        <div className="text-[10px] text-white/40">Expires: {pr.expires}</div>
                      </div>
                      <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fuel Surcharge Toggle */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Fuel className="h-4 w-4 text-[#FF6B00]" />
                  Fuel Surcharge
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-white">Enable Fuel Surcharge</div>
                      <div className="text-[10px] text-white/40 mt-0.5">Auto-adjusts based on fuel prices</div>
                    </div>
                    <button
                      onClick={() => setFuelSurchargeActive(!fuelSurchargeActive)}
                      className="text-[#FF6B00] hover:text-[#e55f00] transition"
                    >
                      {fuelSurchargeActive ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7 text-white/30" />}
                    </button>
                  </div>
                  {fuelSurchargeActive && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-[10px] text-white/40">Current Rate</div>
                          <div className="text-lg font-bold text-white">3.5%</div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <div className="text-[10px] text-white/40">Max Cap</div>
                          <div className="text-lg font-bold text-white">8.0%</div>
                        </div>
                      </div>
                      <div className="p-3 bg-white/5 rounded-lg">
                        <div className="text-[10px] text-white/40 mb-2">Last Updated</div>
                        <div className="text-xs text-white/70">2026-06-26 08:00 UTC — based on NNPC pump price</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
