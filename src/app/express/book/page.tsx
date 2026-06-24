"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package, MapPin, User, CreditCard, Check, ArrowLeft, ArrowRight,
  Truck, Clock, Wallet, Zap, Building2, Phone, Mail, FileText,
  Shield, ChevronRight, Download, CheckCircle2, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { id: 1, label: "Shipment Details", icon: Package },
  { id: 2, label: "Service", icon: Truck },
  { id: 3, label: "Sender & Receiver", icon: User },
  { id: 4, label: "Review & Pay", icon: CreditCard },
];

const services = [
  { id: "economy", name: "Economy", price: 4500, eta: "5-7 business days", icon: Wallet, desc: "Budget-friendly for non-urgent shipments" },
  { id: "standard", name: "Standard", price: 7200, eta: "2-4 business days", icon: Clock, desc: "Best value for everyday shipping" },
  { id: "express", name: "Express", price: 12500, eta: "1-2 business days", icon: Zap, desc: "Priority handling for time-sensitive packages" },
  { id: "same-day", name: "Same Day", price: 18500, eta: "Same day by 6PM", icon: Truck, desc: "Select cities — Lagos, Abuja, PH" },
];

const nigerianStates = [
  "Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Kaduna", "Enugu", "Delta",
  "Ogun", "Anambra", "Edo", "Cross River", "Imo", "Abia", "Ondo", "Kwara",
];

const paymentMethods = [
  { id: "card", name: "Debit / Credit Card", desc: "Visa, Mastercard, Verve", icon: CreditCard },
  { id: "bank-transfer", name: "Bank Transfer", desc: "Direct transfer to Kauvex account", icon: Building2 },
  { id: "wallet", name: "Kauvex Wallet", desc: "Pay from wallet balance", icon: Wallet },
  { id: "pay-on-delivery", name: "Pay on Delivery", desc: "Cash or POS to driver", icon: Truck },
];



export default function BookPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [waybillNumber, setWaybillNumber] = useState("");
  const [packForMe, setPackForMe] = useState(false);
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [declaredValue, setDeclaredValue] = useState(0);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    pickupAddress: "",
    pickupState: "",
    dropoffAddress: "",
    dropoffState: "",
    weight: 5,
    length: 30,
    width: 20,
    height: 10,
    contents: "Documents",
    specialRequirements: "",
    senderName: "",
    senderPhone: "",
    senderEmail: "",
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
  });

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedSvc = services.find((s) => s.id === selectedService)!;
  const serviceCost = selectedSvc.price;
  const insuranceCost = insurance ? Math.round(declaredValue * 0.015) : 0;
  const packForMeCost = packForMe ? (form.weight <= 1 ? 500 : form.weight <= 5 ? 800 : form.weight <= 15 ? 1200 : 2000) : 0;
  const vat = Math.round((serviceCost + insuranceCost + packForMeCost) * 0.075);
  const total = serviceCost + insuranceCost + packForMeCost + vat;

  const handleBook = async () => {
    setBooking(true);
    setError("");
    try {
      const body = {
        sender_name: form.senderName,
        sender_phone: form.senderPhone,
        sender_email: form.senderEmail,
        receiver_name: form.receiverName,
        receiver_phone: form.receiverPhone,
        receiver_email: form.receiverEmail,
        pickup_address: form.pickupAddress,
        pickup_city: form.pickupState,
        pickup_country: "Nigeria",
        dropoff_address: form.dropoffAddress,
        dropoff_city: form.dropoffState,
        dropoff_country: "Nigeria",
        contents_type: form.contents,
        contents_description: form.contents,
        weight_kg: form.weight,
        length_cm: form.length,
        width_cm: form.width,
        height_cm: form.height,
        declared_value: declaredValue,
        currency: "NGN",
        service_level: selectedService,
        insurance_purchased: insurance,
        pack_for_me: packForMe,
        special_instructions: form.specialRequirements,
        signature_required: signatureRequired,
        payment_method: paymentMethod,
      };
      const res = await fetch("/api/v1/express/waybills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Booking failed");
      setWaybillNumber(json.data?.waybill_number || json.data?.waybillNumber || `KEX-2026-${String(Math.floor(Math.random() * 9000000) + 1000000)}`);
      setBooked(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-border p-8 lg:p-12 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-syne font-700 text-text-1 mb-2">Booking Confirmed!</h1>
            <p className="text-text-3 mb-6">Your shipment has been booked successfully.</p>

            <div className="bg-navy rounded-xl p-6 mb-6">
              <p className="text-xs text-white/50 mb-1">Waybill Number</p>
              <p className="text-2xl font-syne font-800 text-orange tracking-wider">{waybillNumber || "KEX-2026-0084729"}</p>
            </div>

            <div className="space-y-3 text-left bg-gray-50 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-3">Service</span>
                <span className="font-semibold text-text-1">{selectedSvc.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-3">Pickup</span>
                <span className="font-semibold text-text-1">{form.pickupAddress || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-3">Dropoff</span>
                <span className="font-semibold text-text-1">{form.dropoffAddress || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-3">Total Paid</span>
                <span className="font-syne font-700 text-lg text-orange">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="navy" size="lg" className="gap-2">
                <Download className="w-4 h-4" /> Download Waybill (PDF)
              </Button>
              <Link href="/express/track">
                <Button variant="outline" size="lg" className="gap-2">
                  Track Shipment
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <Link href="/express">
                <Button variant="ghost" size="sm" className="text-text-3">
                  Back to Express Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-3">
          <Link href="/" className="hover:text-blue">Home</Link>
          <span>/</span>
          <Link href="/express" className="hover:text-blue">Express</Link>
          <span>/</span>
          <span className="text-text-1 font-medium">Book a Shipment</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isPast = currentStep > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? "bg-success text-white"
                        : isActive
                        ? "bg-orange text-white ring-4 ring-orange/20"
                        : "bg-gray-100 text-text-4"
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <p className={`text-[11px] mt-1.5 font-medium ${
                    isActive ? "text-orange" : isPast ? "text-success" : "text-text-4"
                  }`}>
                    {s.label}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 md:w-20 h-0.5 mx-2 mb-5 ${
                    isPast ? "bg-success" : "bg-border"
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-soft">
          {currentStep === 1 && (
            <div>
              <h2 className="font-syne font-700 text-xl text-text-1 mb-6">Shipment Details</h2>
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Pickup Address</label>
                    <input
                      type="text"
                      value={form.pickupAddress}
                      onChange={(e) => update("pickupAddress", e.target.value)}
                      placeholder="e.g. 25 Broad Street, Lagos Island"
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Pickup State</label>
                    <select
                      value={form.pickupState}
                      onChange={(e) => update("pickupState", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    >
                      <option value="">Select state</option>
                      {nigerianStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Dropoff Address</label>
                    <input
                      type="text"
                      value={form.dropoffAddress}
                      onChange={(e) => update("dropoffAddress", e.target.value)}
                      placeholder="e.g. 42 Aminu Kano Crescent, Wuse 2"
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Dropoff State</label>
                    <select
                      value={form.dropoffState}
                      onChange={(e) => update("dropoffState", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    >
                      <option value="">Select state</option>
                      {nigerianStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={form.weight}
                      onChange={(e) => update("weight", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Contents Type</label>
                    <select
                      value={form.contents}
                      onChange={(e) => update("contents", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    >
                      <option>Documents</option>
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Fragile Items</option>
                      <option>Food & Perishables</option>
                      <option>Automotive Parts</option>
                      <option>Medical Supplies</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Declared Value (₦)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Length (cm)</label>
                    <input
                      type="number" min={1} step={0.5}
                      value={form.length}
                      onChange={(e) => update("length", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Width (cm)</label>
                    <input
                      type="number" min={1} step={0.5}
                      value={form.width}
                      onChange={(e) => update("width", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-3 mb-1.5">Height (cm)</label>
                    <input
                      type="number" min={1} step={0.5}
                      value={form.height}
                      onChange={(e) => update("height", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-semibold text-sm text-text-1 mb-3">Add-ons</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={packForMe} onChange={(e) => setPackForMe(e.target.checked)} className="rounded" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-text-1">Pack For Me</p>
                        <p className="text-[10px] text-text-4">We pack your item professionally</p>
                      </div>
                      <span className="text-xs font-semibold text-orange">₦{form.weight <= 1 ? "500" : form.weight <= 5 ? "800" : form.weight <= 15 ? "1,200" : "2,000"}</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={signatureRequired} onChange={(e) => setSignatureRequired(e.target.checked)} className="rounded" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-text-1">Signature Required</p>
                        <p className="text-[10px] text-text-4">Receiver must sign on delivery</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="rounded" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-text-1">Insurance</p>
                        <p className="text-[10px] text-text-4">1.5% of declared value</p>
                      </div>
                    </label>
                  </div>
                  {insurance && (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-text-3 mb-1.5">Declared Value (₦)</label>
                      <input
                        type="number" min={0}
                        value={declaredValue}
                        onChange={(e) => setDeclaredValue(parseInt(e.target.value) || 0)}
                        placeholder="e.g. 50000"
                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-3 mb-1.5">Special Requirements</label>
                  <textarea
                    value={form.specialRequirements}
                    onChange={(e) => update("specialRequirements", e.target.value)}
                    placeholder="e.g. Fragile — handle with care, leave with security guard"
                    rows={3}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <Button onClick={() => setCurrentStep(2)} size="lg" className="bg-orange hover:bg-orange-600">
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="font-syne font-700 text-xl text-text-1 mb-6">Select Service</h2>
              <div className="space-y-3">
                {services.map((svc) => {
                  const Icon = svc.icon;
                  const isSelected = selectedService === svc.id;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc.id)}
                      className={`w-full text-left rounded-xl border p-5 flex items-center gap-4 transition-all ${
                        isSelected
                          ? "border-orange bg-orange-50 ring-1 ring-orange"
                          : "border-border bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-orange" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-text-3"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-syne font-700 text-base ${isSelected ? "text-orange" : "text-text-1"}`}>
                            {svc.name}
                          </p>
                          <p className="font-syne font-700 text-base text-text-1">₦{svc.price.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-text-4 mt-0.5">{svc.eta}</p>
                        <p className="text-xs text-text-3 mt-1">{svc.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-orange flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} size="lg" className="bg-orange hover:bg-orange-600">
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="font-syne font-700 text-xl text-text-1 mb-6">Sender & Receiver Details</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-orange/10 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-orange" />
                    </div>
                    <h3 className="font-syne font-600 text-sm text-text-1">Sender Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-3 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.senderName}
                        onChange={(e) => update("senderName", e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-3 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={form.senderPhone}
                        onChange={(e) => update("senderPhone", e.target.value)}
                        placeholder="e.g. 08031234567"
                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-3 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={form.senderEmail}
                        onChange={(e) => update("senderEmail", e.target.value)}
                        placeholder="e.g. john@example.com"
                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-orange/10 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-orange" />
                    </div>
                    <h3 className="font-syne font-600 text-sm text-text-1">Receiver Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-text-3 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={form.receiverName}
                        onChange={(e) => update("receiverName", e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-3 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={form.receiverPhone}
                        onChange={(e) => update("receiverPhone", e.target.value)}
                        placeholder="e.g. 08098765432"
                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-text-3 mb-1.5">Email (for tracking updates)</label>
                      <input
                        type="email"
                        value={form.receiverEmail}
                        onChange={(e) => update("receiverEmail", e.target.value)}
                        placeholder="e.g. jane@example.com"
                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-1 focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={() => setCurrentStep(4)} size="lg" className="bg-orange hover:bg-orange-600">
                  Review Order <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="font-syne font-700 text-xl text-text-1 mb-6">Review & Payment</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  <h3 className="font-syne font-600 text-sm text-text-1 mb-3">Shipment Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-text-4">Pickup</p>
                      <p className="font-medium text-text-1">{form.pickupAddress || "N/A"}, {form.pickupState}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Dropoff</p>
                      <p className="font-medium text-text-1">{form.dropoffAddress || "N/A"}, {form.dropoffState}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Service</p>
                      <p className="font-medium text-text-1">{selectedSvc.name} — {selectedSvc.eta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Weight</p>
                      <p className="font-medium text-text-1">{form.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Contents</p>
                      <p className="font-medium text-text-1">{form.contents}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Sender</p>
                      <p className="font-medium text-text-1">{form.senderName || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-syne font-600 text-sm text-text-1 mb-3">Select Payment Method</h3>
                  <div className="space-y-2">
                    {paymentMethods.map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`w-full text-left rounded-xl border p-4 flex items-center gap-3 transition-all ${
                            isSelected
                              ? "border-orange bg-orange-50"
                              : "border-border bg-white hover:border-gray-300"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? "text-orange" : "text-text-3"}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${isSelected ? "text-orange" : "text-text-1"}`}>{pm.name}</p>
                            <p className="text-xs text-text-4">{pm.desc}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-orange" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-navy rounded-xl p-5 text-white">
                  <h3 className="font-syne font-600 text-sm text-white/80 mb-3">Price Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">{selectedSvc.name} Shipping</span>
                      <span>₦{serviceCost.toLocaleString()}</span>
                    </div>
                    {packForMe && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Pack For Me</span>
                        <span>₦{packForMeCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/60">Insurance {insurance ? "(1.5%)" : ""}</span>
                      <span>₦{insuranceCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">VAT (7.5%)</span>
                      <span>₦{vat.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between">
                      <span className="font-syne font-700">Total</span>
                      <span className="font-syne font-700 text-lg text-orange">₦{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-text-4">
                  <Shield className="w-4 h-4 text-orange mt-0.5 shrink-0" />
                  <span>Your payment is secured with 256-bit SSL encryption. Kauvex Buyer Protection covers every shipment.</span>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleBook} size="lg" className="bg-orange hover:bg-orange-600">
                  Pay ₦{total.toLocaleString()} & Book <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
