"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Building2, Anchor, Cpu, Tractor, Shield,
  HardDrive, Wind, Truck, Search, ChevronRight,
  Plus, MapPin, Calendar, DollarSign, CheckCircle,
  AlertCircle, X, ChevronLeft, ShieldCheck, Clock,
  Info, CreditCard, Banknote, Loader2, Star,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "construction", name: "Construction Equipment", icon: Building2, count: 24, color: "bg-blue-50 text-blue-600" },
  { id: "marine", name: "Marine Equipment", icon: Anchor, count: 12, color: "bg-cyan-50 text-cyan-600" },
  { id: "industrial", name: "Industrial Machinery", icon: Cpu, count: 18, color: "bg-purple-50 text-purple-600" },
  { id: "agricultural", name: "Agricultural Machinery", icon: Tractor, count: 15, color: "bg-green-50 text-green-600" },
  { id: "security", name: "Security Equipment", icon: Shield, count: 8, color: "bg-red-50 text-red-600" },
  { id: "ict", name: "ICT Equipment", icon: HardDrive, count: 21, color: "bg-indigo-50 text-indigo-600" },
  { id: "power", name: "Power & Energy Equipment", icon: Wind, count: 10, color: "bg-amber-50 text-amber-600" },
  { id: "transportation", name: "Transportation Equipment", icon: Truck, count: 16, color: "bg-orange-50 text-orange-600" },
];

const insurancePlans = [
  { id: "basic", name: "Basic Coverage", price: 0.05, description: "Covers accidental damage up to $1,000", icon: Shield },
  { id: "standard", name: "Standard Coverage", price: 0.08, description: "Covers damage & theft up to $5,000", icon: ShieldCheck },
  { id: "premium", name: "Premium Coverage", price: 0.12, description: "Full coverage including third-party liability", icon: Star },
];

const sampleListings = [
  { id: "1", name: "Komatsu PC200 Excavator", category: "Construction Equipment", price: 450, period: "day", location: "Lagos, Nigeria", owner: "BuildRite Nigeria", ownerRating: 4.8, image: null, depositRequired: true, depositPercent: 0.25 },
  { id: "2", name: "Caterpillar D6 Dozer", category: "Construction Equipment", price: 850, period: "day", location: "Abuja, Nigeria", owner: "HeavyQuip Ltd", ownerRating: 4.6, image: null, depositRequired: true, depositPercent: 0.25 },
  { id: "3", name: "Yanmar 6LY Marine Engine", category: "Marine Equipment", price: 220, period: "day", location: "Port Harcourt, Nigeria", owner: "MarineTech NG", ownerRating: 4.9, image: null, depositRequired: true, depositPercent: 0.3 },
  { id: "4", name: "John Deere Tractor 5075E", category: "Agricultural Machinery", price: 350, period: "day", location: "Kaduna, Nigeria", owner: "FarmEquip Co", ownerRating: 4.7, image: null, depositRequired: true, depositPercent: 0.2 },
  { id: "5", name: "Himoinsa 500kVA Generator", category: "Power & Energy Equipment", price: 600, period: "day", location: "Lagos, Nigeria", owner: "PowerHire NG", ownerRating: 4.5, image: null, depositRequired: true, depositPercent: 0.3 },
  { id: "6", name: "Toyota Hilux (2023)", category: "Transportation Equipment", price: 120, period: "day", location: "Accra, Ghana", owner: "DriveHire GH", ownerRating: 4.4, image: null, depositRequired: true, depositPercent: 0.25 },
];

interface BookingState {
  listing: typeof sampleListings[0];
  startDate: string;
  endDate: string;
  insurance: typeof insurancePlans[0] | null;
  totalDays: number;
  rentalTotal: number;
  depositAmount: number;
  insuranceTotal: number;
  grandTotal: number;
  status: "selecting" | "review" | "payment" | "confirmed";
}

export default function RentalsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [booking, setBooking] = useState<BookingState | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | "bank">("wallet");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const filteredListings = sampleListings.filter((l) => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== "all") {
      const cat = categories.find((c) => c.id === activeCategory);
      if (cat && l.category !== cat.name) return false;
    }
    if (maxPrice && l.price > Number(maxPrice)) return false;
    return true;
  });

  const startBooking = (listing: typeof sampleListings[0]) => {
    setBooking({
      listing,
      startDate: "",
      endDate: "",
      insurance: null,
      totalDays: 0,
      rentalTotal: 0,
      depositAmount: 0,
      insuranceTotal: 0,
      grandTotal: 0,
      status: "selecting",
    });
    setPaymentError("");
    setConfirmedBooking(null);
  };

  const updateDates = (start: string, end: string) => {
    if (!booking) return;
    const days = start && end ? Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1) : 0;
    const rental = days * booking.listing.price;
    const deposit = booking.listing.depositRequired ? rental * booking.listing.depositPercent : 0;
    const insuranceTotal = booking.insurance ? days * (booking.listing.price * booking.insurance.price) : 0;
    setBooking({
      ...booking,
      startDate: start,
      endDate: end,
      totalDays: days,
      rentalTotal: rental,
      depositAmount: deposit,
      insuranceTotal,
      grandTotal: rental + deposit + insuranceTotal,
    });
  };

  const toggleInsurance = (plan: typeof insurancePlans[0] | null) => {
    if (!booking) return;
    const insTotal = plan ? booking.totalDays * (booking.listing.price * plan.price) : 0;
    setBooking({
      ...booking,
      insurance: plan,
      insuranceTotal: insTotal,
      grandTotal: booking.rentalTotal + booking.depositAmount + insTotal,
    });
  };

  const confirmPayment = async () => {
    if (!booking) return;
    setProcessingPayment(true);
    setPaymentError("");
    try {
      const bookingData = {
        listingId: booking.listing.id,
        listingName: booking.listing.name,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalDays: booking.totalDays,
        rentalTotal: booking.rentalTotal,
        depositAmount: booking.depositAmount,
        insurance: booking.insurance?.id || null,
        insuranceTotal: booking.insuranceTotal,
        grandTotal: booking.grandTotal,
        paymentMethod,
      };

      const existing = localStorage.getItem("kauvex_rental_bookings");
      const bookings = existing ? JSON.parse(existing) : [];
      const newBooking = {
        id: `rb_${Date.now()}`,
        ...bookingData,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      bookings.push(newBooking);
      localStorage.setItem("kauvex_rental_bookings", JSON.stringify(bookings));

      setConfirmedBooking(newBooking);
      setBooking({ ...booking, status: "confirmed" });
    } catch (err: any) {
      setPaymentError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const closeBooking = () => {
    setBooking(null);
    setConfirmedBooking(null);
    setPaymentError("");
  };

  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Equipment Rentals</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Equipment Rental Exchange</h1>
            <p className="text-gray-500 mt-1">Rent equipment by the day, week, or month with deposit & insurance protection</p>
          </div>
          <Link href="/marketplace/rentals/list">
            <Button>
              <Plus size={16} className="mr-2" /> List Equipment for Rent
            </Button>
          </Link>
        </div>

        <div className="flex gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment..." className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
          </div>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price/day" className="w-40 h-11 pl-8 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <button onClick={() => setActiveCategory("all")} className={`p-4 rounded-xl border-2 text-left transition-all ${activeCategory === "all" ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 bg-white hover:border-[#FF6B00]/30"}`}>
            <h3 className="font-semibold text-[#0A1628]">All Categories</h3>
            <p className="text-xs text-gray-400 mt-1">{sampleListings.length} listings</p>
          </button>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${activeCategory === cat.id ? "border-[#FF6B00] bg-[#FFF4EC]" : "border-gray-200 bg-white hover:border-[#FF6B00]/30"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-sm text-[#0A1628]">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.count} listings</p>
              </button>
            );
          })}
        </div>

        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Truck size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Equipment Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((l) => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <PackageIcon size={48} className="text-gray-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{l.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-amber-600"><Star size={10} className="fill-amber-400" />{l.ownerRating}</div>
                  </div>
                  <p className="text-xs text-gray-400">{l.category} &middot; {l.owner}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {l.location}</span>
                    {l.depositRequired && <span className="flex items-center gap-1 text-amber-600"><Shield size={12} /> Deposit required</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-bold text-[#FF6B00]">${l.price}<span className="text-sm font-normal text-gray-400">/{l.period}</span></span>
                    </div>
                    <Button size="sm" onClick={() => startBooking(l)}>Rent Now</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {booking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget && booking.status !== "payment") closeBooking(); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {booking.status === "confirmed" ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle size={16} className="text-green-600" /></div>
                ) : (
                  <div className="w-8 h-8 bg-orange/10 rounded-full flex items-center justify-center"><Calendar size={16} className="text-orange" /></div>
                )}
                <div>
                  <h2 className="font-bold text-[#0A1628] text-sm">{booking.status === "selecting" ? "Book Rental" : booking.status === "review" ? "Review Booking" : booking.status === "payment" ? "Payment" : "Booking Confirmed"}</h2>
                  <p className="text-[11px] text-gray-400">{booking.listing.name}</p>
                </div>
              </div>
              {booking.status !== "payment" && (
                <button onClick={closeBooking} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"><X size={16} className="text-gray-400" /></button>
              )}
            </div>

            <div className="p-6 space-y-5">
              {booking.status === "confirmed" && confirmedBooking ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-600" /></div>
                  <h3 className="text-lg font-bold text-[#0A1628] mb-1">Booking Confirmed!</h3>
                  <p className="text-sm text-gray-500 mb-4">Your rental has been booked successfully.</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Reference</span><span className="font-mono font-semibold text-navy">{confirmedBooking.id}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Equipment</span><span className="font-semibold">{confirmedBooking.listingName}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Period</span><span className="font-semibold">{confirmedBooking.startDate} to {confirmedBooking.endDate} ({confirmedBooking.totalDays} days)</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Total Paid</span><span className="font-bold text-orange">${confirmedBooking.grandTotal.toFixed(2)}</span></div>
                    {confirmedBooking.depositAmount > 0 && (
                      <div className="text-[11px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-1"><Info size={12} /> Security deposit will be refunded upon return inspection.</div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={closeBooking} variant="outline" className="flex-1">Close</Button>
                    <Button onClick={closeBooking} className="flex-1">View My Rentals</Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Dates */}
                  <div>
                    <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2"><Calendar size={14} className="text-orange" /> Rental Period</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">Start Date</label>
                        <input type="date" value={booking.startDate} min={minDate} max={maxDate} onChange={(e) => updateDates(e.target.value, booking.endDate)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-500 mb-1 block">End Date</label>
                        <input type="date" value={booking.endDate} min={booking.startDate || minDate} max={maxDate} onChange={(e) => updateDates(booking.startDate, e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50" />
                      </div>
                    </div>
                    {booking.totalDays > 0 && (
                      <p className="text-xs text-gray-500 mt-2">{booking.totalDays} day{booking.totalDays > 1 ? "s" : ""} rental period</p>
                    )}
                  </div>

                  {/* Step 2: Insurance */}
                  <div>
                    <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2"><ShieldCheck size={14} className="text-orange" /> Rental Insurance</h3>
                    <div className="text-[11px] text-gray-500 mb-2">Protect your rental against damage, theft, and liability.</div>
                    <div className="space-y-2">
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${!booking.insurance ? "border-orange bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                        <input type="radio" name="insurance" checked={!booking.insurance} onChange={() => toggleInsurance(null)} className="accent-orange" />
                        <div className="flex-1"><div className="text-sm font-semibold text-navy">No Insurance</div><div className="text-[11px] text-gray-400">Self-insure, no additional cost</div></div>
                        <span className="text-sm font-semibold text-gray-400">$0</span>
                      </label>
                      {insurancePlans.map((plan) => {
                        const Icon = plan.icon;
                        const dailyCost = booking.listing.price * plan.price;
                        return (
                          <label key={plan.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${booking.insurance?.id === plan.id ? "border-orange bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                            <input type="radio" name="insurance" checked={booking.insurance?.id === plan.id} onChange={() => toggleInsurance(plan)} className="accent-orange" />
                            <Icon size={18} className={`${plan.id === "premium" ? "text-amber-500" : plan.id === "standard" ? "text-blue-500" : "text-gray-400"} shrink-0`} />
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-navy">{plan.name}</div>
                              <div className="text-[11px] text-gray-400">{plan.description}</div>
                            </div>
                            <span className="text-sm font-semibold text-orange">${(booking.totalDays * dailyCost).toFixed(2)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  {booking.totalDays > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <h3 className="text-xs font-semibold text-navy mb-2">Cost Breakdown</h3>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Rental ({booking.totalDays} days @ ${booking.listing.price}/day)</span><span className="font-semibold">${booking.rentalTotal.toFixed(2)}</span></div>
                      {booking.depositAmount > 0 && (
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Security Deposit ({(booking.listing.depositPercent * 100)}%)</span><span className="font-semibold text-amber-600">${booking.depositAmount.toFixed(2)}</span></div>
                      )}
                      {booking.insuranceTotal > 0 && (
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Insurance ({booking.insurance?.name})</span><span className="font-semibold">${booking.insuranceTotal.toFixed(2)}</span></div>
                      )}
                      <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-navy"><span>Total</span><span className="text-orange">${booking.grandTotal.toFixed(2)}</span></div>
                      {booking.depositAmount > 0 && <p className="text-[10px] text-amber-600 flex items-center gap-1"><Info size={10} /> Deposit is refundable upon return inspection.</p>}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    {booking.status !== "payment" ? (
                      <>
                        <button onClick={closeBooking} className="px-4 py-2.5 text-sm text-gray-500 hover:text-navy transition-colors">Cancel</button>
                        <button onClick={() => {
                          if (!booking.startDate || !booking.endDate) { setPaymentError("Please select rental dates."); return; }
                          setBooking({ ...booking, status: "payment" });
                          setPaymentError("");
                        }} disabled={!booking.startDate || !booking.endDate} className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
                          <CreditCard size={16} className="inline mr-2" /> Continue to Payment
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setBooking({ ...booking, status: "selecting" })} disabled={processingPayment} className="px-4 py-2.5 text-sm text-gray-500 hover:text-navy transition-colors disabled:opacity-50">
                          <ChevronLeft size={14} className="inline mr-1" /> Back
                        </button>
                        <button onClick={confirmPayment} disabled={processingPayment} className="flex-1 bg-orange hover:bg-orange/90 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          {processingPayment ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><CheckCircle size={16} /> Pay ${booking.grandTotal.toFixed(2)}</>}
                        </button>
                      </>
                    )}
                  </div>

                  {paymentError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-700">
                      <AlertCircle size={16} className="shrink-0" /> {paymentError}
                    </div>
                  )}

                  {/* Payment Method (only in payment step) */}
                  {booking.status === "payment" && (
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="text-sm font-semibold text-navy mb-3 flex items-center gap-2"><CreditCard size={14} className="text-orange" /> Payment Method</h3>
                      <div className="space-y-2">
                        {[
                          { id: "wallet", label: "Kauvex Wallet", balance: "$2,450.00", icon: Banknote },
                          { id: "card", label: "Credit/Debit Card", balance: "Pay with card", icon: CreditCard },
                          { id: "bank", label: "Bank Transfer", balance: "Generate virtual account", icon: Banknote },
                        ].map((pm) => {
                          const Icon = pm.icon;
                          return (
                            <label key={pm.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id ? "border-orange bg-[#FFF4EC]" : "border-gray-200 hover:border-gray-300"}`}>
                              <input type="radio" name="payment" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id as any)} className="accent-orange" />
                              <Icon size={18} className="text-gray-400 shrink-0" />
                              <div className="flex-1"><div className="text-sm font-semibold text-navy">{pm.label}</div><div className="text-[11px] text-gray-400">{pm.balance}</div></div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageIcon({ size, className }: { size: number; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}