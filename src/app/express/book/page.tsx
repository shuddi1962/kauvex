"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package, MapPin, User, CreditCard, Check, ArrowLeft, ArrowRight,
  Truck, Clock, Wallet, Zap, Building2, Phone, Mail, FileText,
  Shield, ChevronRight, Download, CheckCircle2, Copy, LogIn, UserCheck,
  Globe, Search, Hash, Box, AlertTriangle, Battery, Droplets,
  QrCode, Plus, Minus, ToggleLeft, ToggleRight, X, Home,
  Scale, Ruler, Tag, Info, Star, Sparkles, Gift, RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PACKAGING_OPTIONS } from "@/lib/logistics/packaging-options";

const STEP_LABELS = [
  "Instant Quote",
  "Quote Results",
  "Shipment Details",
  "Payment",
  "Confirmation",
  "Account",
];

const COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "\u20A6" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "\u00A3" },
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", symbol: "AED" },
  { code: "IN", name: "India", currency: "INR", symbol: "\u20B9" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "\u20AC" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$" },
  { code: "GH", name: "Ghana", currency: "GHS", symbol: "GH\u20B5" },
  { code: "KE", name: "Kenya", currency: "KES", symbol: "KSh" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "SAR" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "\u00A5" },
  { code: "FR", name: "France", currency: "EUR", symbol: "\u20AC" },
];

const SIZE_PRESETS = [
  { label: "Letter / Document", l: 35, w: 25, h: 2, weight: 0.3 },
  { label: "Small Parcel", l: 30, w: 20, h: 15, weight: 2 },
  { label: "Medium Parcel", l: 45, w: 35, h: 25, weight: 5 },
  { label: "Large Parcel", l: 60, w: 50, h: 40, weight: 10 },
  { label: "Extra Large", l: 80, w: 60, h: 50, weight: 20 },
  { label: "Pallet", l: 120, w: 100, h: 80, weight: 50 },
];

const CONTENTS_TYPES = [
  "Document",
  "Gift",
  "Commercial sample",
  "Returned goods",
  "Other merchandise",
];

const FALLBACK_SERVICES = [
  {
    id: "economy",
    name: "Economy",
    deliveryTime: "5\u20137 business days",
    price: 4500,
    currency: "NGN",
    features: ["Tracked delivery", "Up to 5kg", "Email notifications"],
    isInternational: false,
  },
  {
    id: "standard",
    name: "Standard",
    deliveryTime: "2\u20134 business days",
    price: 7200,
    currency: "NGN",
    features: ["Priority handling", "Up to 15kg", "SMS + email", "Photo proof"],
    isInternational: false,
  },
  {
    id: "express",
    name: "Express",
    deliveryTime: "1\u20132 business days",
    price: 12500,
    currency: "NGN",
    features: ["Fastest standard", "Up to 25kg", "Real-time tracking", "SMS + email", "Photo proof"],
    isInternational: false,
  },
  {
    id: "same-day",
    name: "Same Day",
    deliveryTime: "Same day by 6PM",
    price: 18500,
    currency: "NGN",
    features: ["City-only (Lagos, Abuja, PH)", "Up to 10kg", "Live GPS tracking", "Dedicated rider"],
    isInternational: false,
  },
];

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const [accountUser, setAccountUser] = useState<{
    id: string;
    email: string;
    name: string;
    accountId: string | null;
  } | null>(null);

  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");

  const [fromCountry, setFromCountry] = useState("NG");
  const [fromCity, setFromCity] = useState("");
  const [fromPostcode, setFromPostcode] = useState("");
  const [fromAddress, setFromAddress] = useState("");

  const [toCountry, setToCountry] = useState("NG");
  const [toCity, setToCity] = useState("");
  const [toPostcode, setToPostcode] = useState("");
  const [toAddress, setToAddress] = useState("");

  const [weight, setWeight] = useState(5);
  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const [contentsType, setContentsType] = useState("Document");
  const [declaredValue, setDeclaredValue] = useState(0);
  const [isFragile, setIsFragile] = useState(false);
  const [hasBatteries, setHasBatteries] = useState(false);
  const [hasLiquids, setHasLiquids] = useState(false);

  const [quoteOptions, setQuoteOptions] = useState(FALLBACK_SERVICES);
  const [selectedService, setSelectedService] = useState("standard");

  const [pickupLine1, setPickupLine1] = useState("");
  const [pickupLine2, setPickupLine2] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupState, setPickupState] = useState("");
  const [pickupPostcode, setPickupPostcode] = useState("");
  const [pickupCountry, setPickupCountry] = useState("NG");

  const [dropoffLine1, setDropoffLine1] = useState("");
  const [dropoffLine2, setDropoffLine2] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [dropoffState, setDropoffState] = useState("");
  const [dropoffPostcode, setDropoffPostcode] = useState("");
  const [dropoffCountry, setDropoffCountry] = useState("NG");

  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [what3words, setWhat3words] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [packForMe, setPackForMe] = useState(false);
  const [selectedPackagingType, setSelectedPackagingType] = useState("standard_box");

  const [paymentMethod, setPaymentMethod] = useState("card");

  const [insurance, setInsurance] = useState(false);
  const [ddpUpgrade, setDdpUpgrade] = useState(false);

  const [waybillNumber, setWaybillNumber] = useState("");
  const [waybillCopied, setWaybillCopied] = useState(false);

  const fromCountryData = COUNTRIES.find((c) => c.code === fromCountry)!;
  const toCountryData = COUNTRIES.find((c) => c.code === toCountry)!;
  const isInternational = fromCountry !== toCountry;
  const selectedSvc = quoteOptions.find((s) => s.id === selectedService) || quoteOptions[1];
  const weightDisplay = weightUnit === "lb" ? +(weight * 2.20462).toFixed(1) : weight;
  const weightKg = weightUnit === "lb" ? +(weight / 2.20462).toFixed(2) : weight;

  const insuranceCost = insurance ? Math.round(declaredValue * 0.015) : 0;
  const selectedPkgData = PACKAGING_OPTIONS.find((p) => p.type === selectedPackagingType);
  const packagingFee = packForMe && selectedPkgData ? 800 : 0;
  const shippingFee = selectedSvc?.price || 0;
  const ddpFee = isInternational && ddpUpgrade ? Math.round(declaredValue * 0.08) : 0;
  const vat = Math.round((shippingFee + packagingFee + insuranceCost) * 0.075);
  const total = shippingFee + packagingFee + insuranceCost + ddpFee + vat;

  const getCurrencySymbol = useCallback(() => {
    if (isInternational) return toCountryData?.symbol || "$";
    return fromCountryData?.symbol || "\u20A6";
  }, [isInternational, toCountryData, fromCountryData]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const user = session.user;
      const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer";
      try {
        const res = await fetch(`/api/v1/express/accounts?userId=${user.id}`);
        const json = await res.json();
        const acct = json?.accounts?.[0] || null;
        const accountId = acct?.id || null;
        setAccountUser({ id: user.id, email: user.email || "", name, accountId });
        setSenderName(acct?.business_name || acct?.businessName || name);
        setSenderEmail(user.email || "");
        if (accountId && acct) {
          setPickupCountry(acct.country_code || "NG");
        }
      } catch {
        setAccountUser({ id: user.id, email: user.email || "", name, accountId: null });
      }
    });
  }, []);

  useEffect(() => {
    if (isInternational) {
      setPickupCountry(fromCountry);
      setDropoffCountry(toCountry);
    }
  }, [fromCountry, toCountry, isInternational]);

  const handleGetQuote = async () => {
    if (!fromCountry || !toCountry || weightKg <= 0) {
      setError("Please fill in FROM, TO, and package weight.");
      return;
    }
    setError("");
    setLoadingQuote(true);
    try {
      const res = await fetch("/api/v1/express/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originCountry: fromCountry,
          originCity: fromCity,
          destCountry: toCountry,
          destCity: toCity,
          weightKg,
          lengthCm: length,
          widthCm: width,
          heightCm: height,
          contentsType,
          declaredValue,
          isFragile,
          hasBatteries,
          hasLiquids,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Quote failed");
      if (json.data?.options && json.data.options.length > 0) {
        setQuoteOptions(json.data.options.map((o: any) => ({
          id: o.id || o.service_level,
          name: o.name || o.label || o.service_level,
          deliveryTime: o.deliveryTime || o.delivery_time || o.eta || "2\u20134 days",
          price: o.price || o.total || o.cost || 5000,
          currency: o.currency || "NGN",
          features: o.features || [],
          isInternational: o.isInternational || false,
        })));
      }
      setStep(2);
    } catch (e: any) {
      setQuoteOptions(FALLBACK_SERVICES);
      setStep(2);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleBook = async () => {
    setBooking(true);
    setError("");
    try {
      const body = {
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_email: senderEmail,
        receiver_name: receiverName,
        receiver_phone: receiverPhone,
        pickup_address: `${pickupLine1}${pickupLine2 ? ", " + pickupLine2 : ""}`,
        pickup_city: pickupCity || fromCity,
        pickup_state: pickupState,
        pickup_postcode: pickupPostcode || fromPostcode,
        pickup_country: pickupCountry,
        dropoff_address: `${dropoffLine1}${dropoffLine2 ? ", " + dropoffLine2 : ""}`,
        dropoff_city: dropoffCity || toCity,
        dropoff_state: dropoffState,
        dropoff_postcode: dropoffPostcode || toPostcode,
        dropoff_country: dropoffCountry,
        contents_type: contentsType,
        contents_description: contentsType,
        weight_kg: weightKg,
        length_cm: length,
        width_cm: width,
        height_cm: height,
        declared_value: declaredValue,
        currency: isInternational ? toCountryData.currencyCode : fromCountryData.currencyCode,
        service_level: selectedService,
        insurance_purchased: insurance,
        insurance_premium: insuranceCost,
        pack_for_me: packForMe,
        pack_for_me_fee: packagingFee,
        packaging_type: packForMe ? selectedPackagingType : null,
        special_instructions: `${specialInstructions}${what3words ? " | What3Words: " + what3words : ""}`,
        what3words: what3words || null,
        signature_required: false,
        payment_method: paymentMethod,
        ddp: isInternational && ddpUpgrade,
        ddp_fee: ddpFee,
        business_account_id: accountUser?.accountId || null,
        price_paid: total,
        is_international: isInternational,
        is_fragile: isFragile,
        has_batteries: hasBatteries,
        has_liquids: hasLiquids,
      };
      const res = await fetch("/api/v1/express/waybills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Booking failed");
      setWaybillNumber(json.waybill_number || json.data?.waybill_number || `KVX-EXP-${Date.now().toString(36).toUpperCase()}`);
      setStep(5);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const inputCls = "w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";
  const sectionCls = "space-y-4";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/express" className="hover:text-[#0A1628] transition-colors">Express</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">Book a Shipment</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Account Banner */}
        {accountUser ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0A1628] truncate">Logged in as {accountUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{accountUser.email} &middot; Shipment will be linked to your account</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <LogIn className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <p className="text-sm text-gray-500">
              <Link href="/auth/login" className="font-medium text-[#FF6B00] hover:underline">Log in</Link>{" "}
              to link this shipment to your Express account, or continue as guest.
            </p>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isPast = step > stepNum;
            return (
              <div key={label} className="flex items-center shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPast ? "bg-[#0A1628] text-white" : isActive ? "bg-[#FF6B00] text-white ring-4 ring-[#FF6B00]/20" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isPast ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <p className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${isActive ? "text-[#FF6B00]" : isPast ? "text-[#0A1628]" : "text-gray-400"}`}>
                    {label}
                  </p>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-8 md:w-14 h-0.5 mx-1.5 mb-5 ${isPast ? "bg-[#0A1628]" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm">

          {/* ============ STEP 1: INSTANT QUOTE ============ */}
          {step === 1 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Get an Instant Quote</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* FROM */}
              <div className={sectionCls}>
                <div className="bg-gray-50 rounded-xl p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>From</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Country</label>
                      <select value={fromCountry} onChange={(e) => setFromCountry(e.target.value)} className={inputCls}>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>City</label>
                      <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="e.g. Lagos" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Postcode / ZIP</label>
                      <input type="text" value={fromPostcode} onChange={(e) => setFromPostcode(e.target.value)} placeholder="e.g. 100001" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Full address <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="text" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="e.g. 25 Broad Street, Lagos Island" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* TO */}
                <div className="bg-gray-50 rounded-xl p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-[#0A1628]/10 flex items-center justify-center">
                      <Home className="w-3.5 h-3.5 text-[#0A1628]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>To</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Country</label>
                      <select value={toCountry} onChange={(e) => setToCountry(e.target.value)} className={inputCls}>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>City</label>
                      <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="e.g. Abuja" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Postcode / ZIP</label>
                      <input type="text" value={toPostcode} onChange={(e) => setToPostcode(e.target.value)} placeholder="e.g. 900001" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Full address <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="e.g. 42 Aminu Kano Crescent, Wuse 2" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* PACKAGE */}
                <div className="bg-gray-50 rounded-xl p-4 md:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>Package</h3>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                      <button onClick={() => setWeightUnit("kg")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${weightUnit === "kg" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500"}`}>kg</button>
                      <button onClick={() => setWeightUnit("lb")} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${weightUnit === "lb" ? "bg-white text-[#0A1628] shadow-sm" : "text-gray-500"}`}>lb</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div>
                      <label className={labelCls}>Weight ({weightUnit})</label>
                      <input type="number" min={0.1} step={0.1} value={weightDisplay} onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setWeight(weightUnit === "lb" ? +(val / 2.20462).toFixed(2) : val);
                      }} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Length (cm)</label>
                      <input type="number" min={1} step={0.5} value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 1)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Width (cm)</label>
                      <input type="number" min={1} step={0.5} value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 1)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Height (cm)</label>
                      <input type="number" min={1} step={0.5} value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 1)} className={inputCls} />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">Or pick a size preset:</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {SIZE_PRESETS.map((preset, idx) => (
                      <button key={preset.label} onClick={() => {
                        setLength(preset.l); setWidth(preset.w); setHeight(preset.h);
                        setWeight(preset.weight); setSelectedPreset(idx);
                      }} className={`px-2 py-2.5 rounded-lg border text-center transition-all ${
                        selectedPreset === idx
                          ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <p className="text-[10px] font-semibold text-[#0A1628] leading-tight">{preset.label}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5">{preset.l}x{preset.w}x{preset.h}cm</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONTENTS & DECLARED VALUE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className={labelCls}>Contents Type</label>
                    <select value={contentsType} onChange={(e) => setContentsType(e.target.value)} className={inputCls}>
                      {CONTENTS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className={labelCls}>Declared Value ({getCurrencySymbol()})</label>
                    <input type="number" min={0} step={1} value={declaredValue || ""} onChange={(e) => setDeclaredValue(parseInt(e.target.value) || 0)} placeholder="e.g. 50000" className={inputCls} />
                  </div>
                </div>

                {/* TOGGLES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { label: "Is this fragile?", icon: Shield, state: isFragile, setter: setIsFragile, desc: "Extra handling care" },
                    { label: "Contains batteries?", icon: Battery, state: hasBatteries, setter: setHasBatteries, desc: "Lithium / alkaline" },
                    { label: "Contains liquids?", icon: Droplets, state: hasLiquids, setter: setHasLiquids, desc: "Sealed containers" },
                  ].map(({ label, icon: Icon, state, setter, desc }) => (
                    <button key={label} onClick={() => setter(!state)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      state ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                      {state ? <ToggleRight className="w-6 h-6 text-[#FF6B00] flex-shrink-0" /> : <ToggleLeft className="w-6 h-6 text-gray-400 flex-shrink-0" />}
                      <div className="text-left">
                        <p className="text-xs font-semibold text-[#0A1628]">{label}</p>
                        <p className="text-[10px] text-gray-400">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button onClick={handleGetQuote} disabled={loadingQuote} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                  {loadingQuote ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Getting Quote...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Get Quote
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============ STEP 2: QUOTE RESULTS ============ */}
          {step === 2 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Choose Your Service</h2>
              <p className="text-sm text-gray-500 mb-6">
                {fromCountry} {fromCity ? `\u2014 ${fromCity}` : ""} → {toCountry} {toCity ? `\u2014 ${toCity}` : ""} &middot; {weightKg}kg &middot; {length}x{width}x{height}cm
              </p>

              <div className="space-y-3">
                {quoteOptions.map((svc) => {
                  const Icon = svc.id === "economy" ? Wallet : svc.id === "express" ? Zap : svc.id === "same-day" ? Sparkles : Clock;
                  const isSelected = selectedService === svc.id;
                  return (
                    <button key={svc.id} onClick={() => setSelectedService(svc.id)} className={`w-full text-left rounded-xl border p-4 md:p-5 transition-all ${
                      isSelected ? "border-[#FF6B00] bg-[#FF6B00]/5 ring-1 ring-[#FF6B00]" : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[#FF6B00]" : "bg-gray-100"}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-gray-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-bold text-base ${isSelected ? "text-[#FF6B00]" : "text-[#0A1628]"}`} style={{ fontFamily: "Syne, sans-serif" }}>
                              {svc.name}
                            </p>
                            <p className="font-bold text-base text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>
                              {getCurrencySymbol()}{svc.price.toLocaleString()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{svc.deliveryTime}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {svc.features.map((f) => (
                              <span key={f} className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] text-gray-600">{f}</span>
                            ))}
                          </div>

                          {/* International extras */}
                          {isInternational && (
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Est. duties/taxes</span>
                                <span className="font-medium text-[#0A1628]">{getCurrencySymbol()}{Math.round(declaredValue * 0.08).toLocaleString()}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setDdpUpgrade(!ddpUpgrade); }} className={`flex items-center gap-2 text-xs font-medium transition-all ${ddpUpgrade ? "text-[#FF6B00]" : "text-gray-500"}`}>
                                {ddpUpgrade ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                DDP Upgrade — duties paid upfront
                              </button>
                            </div>
                          )}

                          {/* Insurance option */}
                          {declaredValue > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <button onClick={(e) => { e.stopPropagation(); setInsurance(!insurance); }} className={`flex items-center gap-2 text-xs font-medium transition-all ${insurance ? "text-[#FF6B00]" : "text-gray-500"}`}>
                                {insurance ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                Insurance — 1.5% of declared value ({getCurrencySymbol()}{insuranceCost.toLocaleString()})
                              </button>
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0 mt-1">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(3)} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============ STEP 3: SHIPMENT DETAILS ============ */}
          {step === 3 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Shipment Details</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Pickup Address */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>Pickup Address</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Address Line 1</label>
                      <input type="text" value={pickupLine1} onChange={(e) => setPickupLine1(e.target.value)} placeholder="e.g. 25 Broad Street" className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Address Line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="text" value={pickupLine2} onChange={(e) => setPickupLine2(e.target.value)} placeholder="Suite / Floor / Building" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>City</label>
                      <input type="text" value={pickupCity} onChange={(e) => setPickupCity(e.target.value)} placeholder="Lagos" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>State / Province</label>
                      <input type="text" value={pickupState} onChange={(e) => setPickupState(e.target.value)} placeholder="Lagos State" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Postcode</label>
                      <input type="text" value={pickupPostcode} onChange={(e) => setPickupPostcode(e.target.value)} placeholder="100001" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <select value={pickupCountry} onChange={(e) => setPickupCountry(e.target.value)} className={inputCls}>
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#0A1628]/10 flex items-center justify-center">
                      <Home className="w-3.5 h-3.5 text-[#0A1628]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>Delivery Address</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Address Line 1</label>
                      <input type="text" value={dropoffLine1} onChange={(e) => setDropoffLine1(e.target.value)} placeholder="e.g. 42 Aminu Kano Crescent" className={inputCls} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Address Line 2 <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input type="text" value={dropoffLine2} onChange={(e) => setDropoffLine2(e.target.value)} placeholder="Suite / Floor / Building" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>City</label>
                      <input type="text" value={dropoffCity} onChange={(e) => setDropoffCity(e.target.value)} placeholder="Abuja" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>State / Province</label>
                      <input type="text" value={dropoffState} onChange={(e) => setDropoffState(e.target.value)} placeholder="FCT" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Postcode</label>
                      <input type="text" value={dropoffPostcode} onChange={(e) => setDropoffPostcode(e.target.value)} placeholder="900001" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Country</label>
                      <select value={dropoffCountry} onChange={(e) => setDropoffCountry(e.target.value)} className={inputCls}>
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sender */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#FF6B00]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>Sender</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g. John Doe" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="tel" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="+234 803 123 4567" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="john@example.com" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* Receiver */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#0A1628]/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#0A1628]" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>Receiver</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input type="text" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="e.g. Jane Doe" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="tel" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="+234 809 876 5432" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email <span className="text-gray-400 font-normal">(tracking updates)</span></label>
                      <input type="email" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} placeholder="jane@example.com" className={inputCls} />
                    </div>
                  </div>
                </div>

                {/* What3Words */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                      <Hash className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>What3Words Address</h3>
                  </div>
                  <label className={labelCls}>Or use What3Words</label>
                  <input type="text" value={what3words} onChange={(e) => setWhat3words(e.target.value)} placeholder="e.g. ///filled.count.soap" className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1">Precise 3-word location for accurate pickup/delivery</p>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className={labelCls}>Special Delivery Instructions</label>
                  <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} rows={3} placeholder="e.g. Leave with security guard, fragile handle with care" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#0A1628] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none transition-all" />
                </div>

                {/* Pack For Me */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                        <Box className="w-3.5 h-3.5 text-[#FF6B00]" />
                      </div>
                      <h3 className="font-semibold text-sm text-[#0A1628]" style={{ fontFamily: "Syne, sans-serif" }}>Pack For Me</h3>
                    </div>
                    <button onClick={() => setPackForMe(!packForMe)} className="flex items-center gap-2 text-sm font-medium">
                      {packForMe ? <ToggleRight className="w-7 h-7 text-[#FF6B00]" /> : <ToggleLeft className="w-7 h-7 text-gray-40" />}
                      <span className={packForMe ? "text-[#FF6B00]" : "text-gray-500"}>{packForMe ? "ON" : "OFF"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    {packForMe ? "Choose your packaging type below. Kauvex packs your item professionally." : "Use your own packaging materials."}
                  </p>

                  {packForMe && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PACKAGING_OPTIONS.map((pkg) => {
                        const isSelected = selectedPackagingType === pkg.type;
                        return (
                          <button key={pkg.type} onClick={() => setSelectedPackagingType(pkg.type)} className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                            isSelected ? "border-[#FF6B00] bg-[#FF6B00]/5 shadow-md" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          }`}>
                            {pkg.badge && (
                              <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-[#FF6B00] text-white">
                                {pkg.badge}
                              </span>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 left-2 w-5 h-5 bg-[#FF6B00] text-white rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                            <span className="text-2xl block mb-1.5">{pkg.icon}</span>
                            <p className="font-bold text-xs text-[#0A1628]">{pkg.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{pkg.sizes[0]?.dimensions || ""}</p>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{pkg.description}</p>
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-[10px] text-gray-500">{pkg.innerProtection}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => setStep(4)} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============ STEP 4: PAYMENT ============ */}
          {step === 4 && (
            <div>
              <h2 className="font-bold text-xl text-[#0A1628] mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Payment</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Payment Methods */}
                <div>
                  <h3 className="font-semibold text-sm text-[#0A1628] mb-3" style={{ fontFamily: "Syne, sans-serif" }}>Payment Method</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "card", label: "Card", desc: "Visa, Mastercard", icon: CreditCard },
                      { id: "bank-transfer", label: "Bank Transfer", desc: "Direct transfer", icon: Building2 },
                      { id: "ussd", label: "USSD", desc: "Bank USSD code", icon: Phone },
                      { id: "mobile-money", label: "Mobile Money", desc: "M-Pesa, MTN MoMo", icon: Wallet },
                    ].map(({ id, label, desc, icon: Icon }) => (
                      <button key={id} onClick={() => setPaymentMethod(id)} className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === id ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-200 hover:border-gray-300"
                      }`}>
                        <Icon className={`w-5 h-5 mb-2 ${paymentMethod === id ? "text-[#FF6B00]" : "text-gray-400"}`} />
                        <p className={`text-sm font-semibold ${paymentMethod === id ? "text-[#FF6B00]" : "text-[#0A1628]"}`}>{label}</p>
                        <p className="text-[10px] text-gray-400">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-[#0A1628] rounded-xl p-5 text-white">
                  <h3 className="font-semibold text-sm text-white/80 mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Cost Breakdown</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Shipping ({selectedSvc.name})</span>
                      <span>{getCurrencySymbol()}{shippingFee.toLocaleString()}</span>
                    </div>
                    {packForMe && selectedPkgData && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Packaging ({selectedPkgData.name})</span>
                        <span>{getCurrencySymbol()}{packagingFee.toLocaleString()}</span>
                      </div>
                    )}
                    {insurance && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Insurance (1.5%)</span>
                        <span>{getCurrencySymbol()}{insuranceCost.toLocaleString()}</span>
                      </div>
                    )}
                    {isInternational && ddpUpgrade && (
                      <div className="flex justify-between">
                        <span className="text-white/60">DDP Duties</span>
                        <span>{getCurrencySymbol()}{ddpFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/60">VAT (7.5%)</span>
                      <span>{getCurrencySymbol()}{vat.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2.5 flex justify-between">
                      <span className="font-bold text-base" style={{ fontFamily: "Syne, sans-serif" }}>Total</span>
                      <span className="font-bold text-lg text-[#FF6B00]" style={{ fontFamily: "Syne, sans-serif" }}>{getCurrencySymbol()}{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4 text-[#FF6B00] mt-0.5 shrink-0" />
                  <span>Your payment is secured with 256-bit SSL encryption. Kauvex Buyer Protection covers every shipment.</span>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleBook} disabled={booking} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                  {booking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Pay {getCurrencySymbol()}{total.toLocaleString()} & Book
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============ STEP 5: CONFIRMATION ============ */}
          {step === 5 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-bold text-2xl text-[#0A1628] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Booking Confirmed!</h2>
              <p className="text-sm text-gray-500 mb-6">Your shipment has been booked successfully.</p>

              {/* Waybill Number */}
              <div className="bg-[#0A1628] rounded-xl p-6 mb-6">
                <p className="text-xs text-white/50 mb-1.5">Waybill Number</p>
                <p className="text-2xl md:text-3xl font-bold text-[#FF6B00] tracking-wider" style={{ fontFamily: "Syne, sans-serif", letterSpacing: "0.1em" }}>
                  {waybillNumber}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(waybillNumber);
                    setWaybillCopied(true);
                    setTimeout(() => setWaybillCopied(false), 2000);
                  }}
                  className="mt-3 flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors mx-auto"
                >
                  {waybillCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {waybillCopied ? "Copied!" : "Copy waybill number"}
                </button>
              </div>

              {/* QR Code placeholder */}
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 mb-6 inline-block">
                <QrCode className="w-24 h-24 text-gray-300" />
                <p className="text-[10px] text-gray-400 mt-2">Scan to track</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service</span>
                  <span className="font-semibold text-[#0A1628]">{selectedSvc.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pickup</span>
                  <span className="font-semibold text-[#0A1628]">{pickupCity || fromCity || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dropoff</span>
                  <span className="font-semibold text-[#0A1628]">{dropoffCity || toCity || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-bold text-lg text-[#FF6B00]" style={{ fontFamily: "Syne, sans-serif" }}>{getCurrencySymbol()}{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="flex items-center justify-center gap-2 bg-[#0A1628] hover:bg-[#152238] text-white font-semibold px-6 py-3 rounded-xl transition-all">
                  <Download className="w-4 h-4" /> Download Waybill (PDF)
                </button>
                <Link href={`/express/track?wb=${waybillNumber}`}>
                  <button className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 hover:border-gray-300 text-[#0A1628] font-semibold px-6 py-3 rounded-xl transition-all">
                    Track Shipment
                  </button>
                </Link>
              </div>

              <button onClick={() => setStep(6)} className="mt-6 text-sm text-gray-500 hover:text-[#0A1628] font-medium transition-colors flex items-center gap-1 mx-auto">
                Book Another Shipment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============ STEP 6: ACCOUNT CREATION PROMPT ============ */}
          {step === 6 && (
            <div className="text-center py-8 max-w-md mx-auto">
              {!accountUser ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mx-auto mb-5">
                    <Sparkles className="w-8 h-8 text-[#FF6B00]" />
                  </div>
                  <h2 className="font-bold text-xl text-[#0A1628] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Create a free account</h2>
                  <p className="text-sm text-gray-500 mb-6">Never lose track of a shipment again.</p>

                  <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 space-y-3">
                    <p className="text-xs font-semibold text-[#0A1628] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Create a free account to:</p>
                    {[
                      "Track all shipments in one place",
                      "Save addresses for faster booking",
                      "Unlock volume discounts",
                      "Full shipping history & receipts",
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#FF6B00] flex-shrink-0" />
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link href="/auth/register">
                      <button className="w-full bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all">
                        Create Account
                      </button>
                    </Link>
                    <Link href="/express/dashboard/overview">
                      <button className="w-full text-sm text-gray-500 hover:text-[#0A1628] font-medium py-2 transition-colors">
                        Maybe later
                      </button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="font-bold text-xl text-[#0A1628] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>You&apos;re all set!</h2>
                  <p className="text-sm text-gray-500 mb-6">Your shipment is linked to your account.</p>
                  <Link href="/express/dashboard/overview">
                    <button className="bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3 rounded-xl transition-all">
                      Go to Dashboard
                    </button>
                  </Link>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
