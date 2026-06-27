"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Bike,
  Car,
  Building2,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  MapPin,
  CreditCard,
  ShieldCheck,
  User,
  Phone,
  Mail,
  IdCard,
  Clock,
  Globe,
  Package,
  Weight,
  DollarSign,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const partnerTypes = [
  { id: "rider", label: "Rider", icon: Bike, desc: "Motorcycle / scooter courier — local deliveries under 10kg", color: "bg-blue-100 text-blue" },
  { id: "driver", label: "Driver", icon: Car, desc: "Car / van driver — local & regional deliveries up to 100kg", color: "bg-emerald-100 text-emerald-700" },
  { id: "courier", label: "Courier Business", icon: Building2, desc: "Fleet operator with multiple vehicles & drivers", color: "bg-purple-100 text-purple-700" },
  { id: "freight", label: "Freight Company", icon: Package, desc: "Trucking / cargo — intercity & heavy freight (500kg+)", color: "bg-orange/10 text-orange" },
];

const vehicleOptions: Record<string, { id: string; label: string; capacity: string; weight: string }[]> = {
  rider: [
    { id: "motorcycle", label: "Motorcycle", capacity: "1-5 packages", weight: "Up to 10 kg" },
    { id: "scooter", label: "Scooter", capacity: "1-3 packages", weight: "Up to 5 kg" },
  ],
  driver: [
    { id: "sedan", label: "Sedan", capacity: "5-10 packages", weight: "Up to 50 kg" },
    { id: "suv", label: "SUV", capacity: "10-20 packages", weight: "Up to 100 kg" },
    { id: "van", label: "Cargo Van", capacity: "20-50 packages", weight: "Up to 150 kg" },
  ],
  courier: [
    { id: "small-fleet", label: "Small Fleet (2-5 vehicles)", capacity: "50-200 packages/day", weight: "Up to 500 kg" },
    { id: "medium-fleet", label: "Medium Fleet (6-20 vehicles)", capacity: "200-1000 packages/day", weight: "Up to 2000 kg" },
    { id: "large-fleet", label: "Large Fleet (20+ vehicles)", capacity: "1000+ packages/day", weight: "5000+ kg" },
  ],
  freight: [
    { id: "light-truck", label: "Light Truck", capacity: "Single pallet", weight: "500-2000 kg" },
    { id: "heavy-truck", label: "Heavy Truck", capacity: "Multi-pallet", weight: "2000-10000 kg" },
    { id: "trailer", label: "Trailer / Container", capacity: "Full container load", weight: "10000+ kg" },
  ],
};

const payoutSchedules = [
  { id: "daily", label: "Daily", desc: "Every day for completed deliveries" },
  { id: "weekly", label: "Weekly", desc: "Every Monday for previous week" },
  { id: "biweekly", label: "Bi-Weekly", desc: "Every 2 weeks" },
  { id: "monthly", label: "Monthly", desc: "1st of every month" },
];

const intercityRoutes = [
  "Lagos — Ibadan", "Lagos — Abuja", "Lagos — Port Harcourt", "Abuja — Kaduna",
  "Port Harcourt — Enugu", "Lagos — Benin", "Abuja — Lagos", "Kano — Kaduna",
  "Enugu — Onitsha", "Ibadan — Lagos",
];

function StepIndicator({ current, total, labels }: { current: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            i < current ? "bg-orange text-white" : i === current ? "bg-orange/10 text-orange border border-orange/20" : "bg-white/5 text-white/30 border border-white/10"
          }`}>
            {i < current ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{labels[i]}</span>
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-px mx-1 ${i < current ? "bg-orange" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function LogisticsRegister() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    businessName: "", businessReg: "",
    baseLocation: "", radius: "10",
    vehicleType: "", vehicleReg: "",
    bankName: "", accountNumber: "", accountName: "",
    payoutSchedule: "weekly",
  });
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const totalSteps = 5;
  const stepLabels = ["Type", "Verification", "Coverage", "Vehicle", "Payout"];

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleDocUpload = (doc: string) => {
    if (!uploadedDocs.includes(doc)) setUploadedDocs(prev => [...prev, doc]);
  };

  const toggleRoute = (route: string) => {
    setSelectedRoutes(prev => prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return selectedType !== "";
      case 1: {
        const base = form.firstName && form.lastName && form.phone && form.email;
        if (!base) return false;
        if (selectedType === "courier" || selectedType === "freight") return base && form.businessName && form.businessReg;
        return uploadedDocs.length >= 1;
      }
      case 2: {
        if (!form.baseLocation) return false;
        if (selectedType === "freight") return selectedRoutes.length > 0;
        return true;
      }
      case 3: return form.vehicleType !== "" && form.vehicleReg !== "";
      case 4: return form.bankName && form.accountNumber && form.accountName;
      default: return false;
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/v1/logistics/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          partnerType: selectedType,
          businessName: form.businessName,
          businessReg: form.businessReg,
          baseLocation: form.baseLocation,
          radius: form.radius,
          vehicleType: form.vehicleType,
          vehicleReg: form.vehicleReg,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountName: form.accountName,
          payoutSchedule: form.payoutSchedule,
          coverageRoutes: selectedRoutes,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error || "Registration failed. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange/10 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-orange" />
          </div>
          <h1 className="text-3xl font-syne font-700 text-white mb-3">Application Submitted!</h1>
          <p className="text-white/60 text-sm mb-2">Thank you for applying to join the Kauvex Logistics Network.</p>
          <p className="text-white/40 text-sm mb-8">Your application has been received and is under review. We&apos;ll notify you via email within 2-3 business days.</p>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
            <h3 className="text-white font-semibold text-sm">What happens next?</h3>
            <div className="flex items-start gap-3 text-sm text-white/60">
              <span className="w-6 h-6 rounded-full bg-orange/10 text-orange flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
              <span>Our team reviews your application and documents</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-white/60">
              <span className="w-6 h-6 rounded-full bg-orange/10 text-orange flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
              <span>Verification call or document confirmation if needed</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-white/60">
              <span className="w-6 h-6 rounded-full bg-orange/10 text-orange flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
              <span>Onboarding &amp; activation — start receiving delivery requests!</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Link href="/logistics/dashboard" className="px-6 py-3 bg-orange text-white font-bold rounded-xl hover:bg-orange/90 transition-colors">Go to Dashboard</Link>
            <Link href="/" className="px-6 py-3 text-white/50 hover:text-white transition-colors text-sm">Back to Kauvex</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-syne font-700 text-white">Become a Logistics Partner</h1>
          <p className="text-white/50 text-sm mt-2">Join the Kauvex delivery network and start earning</p>
        </div>

        <StepIndicator current={step} total={totalSteps} labels={stepLabels} />

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
          {/* Step 1: Partner Type */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-syne font-700 text-white mb-1">Choose Your Partner Type</h2>
                <p className="text-white/40 text-sm">Select the category that best describes your delivery capability</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {partnerTypes.map(pt => {
                  const Icon = pt.icon;
                  const isSelected = selectedType === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedType(pt.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected ? "border-orange bg-orange/5" : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${pt.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className={`text-sm font-bold mb-1 ${isSelected ? "text-orange" : "text-white"}`}>{pt.label}</h3>
                      <p className="text-xs text-white/40">{pt.desc}</p>
                      {isSelected && <div className="mt-2 flex items-center gap-1 text-orange text-xs font-medium"><Check className="w-3 h-3" /> Selected</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Identity & Business Verification */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-syne font-700 text-white mb-1">Identity & Business Verification</h2>
                <p className="text-white/40 text-sm">Provide your details so we can verify your identity</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="John" className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Doe" className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+234 800 000 0000" className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={form.email} onChange={e => update("email", e.target.value)} placeholder="john@example.com" className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
              </div>

              {(selectedType === "courier" || selectedType === "freight") && (
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Business / Company Name</label>
                    <input value={form.businessName} onChange={e => update("businessName", e.target.value)} placeholder="Your Business Ltd" className="w-full h-10 px-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-1">Business Registration No.</label>
                    <input value={form.businessReg} onChange={e => update("businessReg", e.target.value)} placeholder="RC-123456" className="w-full h-10 px-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Upload Identification Documents</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["National ID", "Driver's License", "Passport", "Voter's Card", "Business Certificate", "Tax ID"].filter(d => {
                    if (selectedType === "rider" || selectedType === "driver") return ["National ID", "Driver's License", "Passport"].includes(d);
                    return true;
                  }).map(doc => (
                    <button
                      key={doc}
                      onClick={() => handleDocUpload(doc)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all ${
                        uploadedDocs.includes(doc) ? "border-orange bg-orange/5 text-orange" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/[0.08]"
                      }`}
                    >
                      {uploadedDocs.includes(doc) ? <Check className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                      {doc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Coverage Configuration */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-syne font-700 text-white mb-1">Coverage Configuration</h2>
                <p className="text-white/40 text-sm">Define your service area and delivery range</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Base Location / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={form.baseLocation} onChange={e => update("baseLocation", e.target.value)} placeholder="e.g. Lagos, Nigeria" className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Delivery Radius (km)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <select value={form.radius} onChange={e => update("radius", e.target.value)} className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange/50 appearance-none">
                      {["5", "10", "15", "20", "25", "30", "50", "100"].map(r => (
                        <option key={r} value={r}>{r} km</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedType === "freight" && (
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-2">Intercity Routes (select all that apply)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {intercityRoutes.map(route => (
                      <button
                        key={route}
                        onClick={() => toggleRoute(route)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-all ${
                          selectedRoutes.includes(route) ? "border-orange bg-orange/5 text-orange" : "border-white/10 bg-white/5 text-white/50 hover:bg-white/[0.08]"
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {route}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Vehicle & Capacity */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-syne font-700 text-white mb-1">Vehicle & Capacity Details</h2>
                <p className="text-white/40 text-sm">Tell us about your vehicle(s) and capacity</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Vehicle Type</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {(vehicleOptions[selectedType] || vehicleOptions.driver).map(v => (
                    <button
                      key={v.id}
                      onClick={() => update("vehicleType", v.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        form.vehicleType === v.id ? "border-orange bg-orange/5" : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <Car className={`w-4 h-4 ${form.vehicleType === v.id ? "text-orange" : "text-white/30"}`} />
                        <span className={`text-sm font-bold ${form.vehicleType === v.id ? "text-orange" : "text-white"}`}>{v.label}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" />{v.capacity}</span>
                        <span className="flex items-center gap-1"><Weight className="w-3 h-3" />{v.weight}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Vehicle Registration / Plate Number</label>
                <input value={form.vehicleReg} onChange={e => update("vehicleReg", e.target.value)} placeholder="e.g. ABC-123-XY" className="w-full h-10 px-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
              </div>
            </div>
          )}

          {/* Step 5: Payout Setup */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-syne font-700 text-white mb-1">Payout Setup</h2>
                <p className="text-white/40 text-sm">Configure how you&apos;ll receive earnings</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Bank Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={form.bankName} onChange={e => update("bankName", e.target.value)} placeholder="e.g. GTBank" className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1">Account Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input value={form.accountNumber} onChange={e => update("accountNumber", e.target.value)} placeholder="0123456789" className="w-full h-10 pl-9 pr-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Account Holder Name</label>
                <input value={form.accountName} onChange={e => update("accountName", e.target.value)} placeholder="John Doe" className="w-full h-10 px-3 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2">Payout Schedule</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {payoutSchedules.map(ps => (
                    <button
                      key={ps.id}
                      onClick={() => update("payoutSchedule", ps.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.payoutSchedule === ps.id ? "border-orange bg-orange/5" : "border-white/10 bg-white/5 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className={`w-3.5 h-3.5 ${form.payoutSchedule === ps.id ? "text-orange" : "text-white/30"}`} />
                        <span className={`text-xs font-bold ${form.payoutSchedule === ps.id ? "text-orange" : "text-white"}`}>{ps.label}</span>
                      </div>
                      <p className="text-[10px] text-white/40">{ps.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Step {step + 1} of {totalSteps}</span>
              {step < totalSteps - 1 ? (
                <button
                  onClick={() => canProceed() && setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-orange text-white font-bold rounded-lg hover:bg-orange/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {submitError && (
                    <p className="text-xs text-red-400 max-w-xs text-right">{submitError}</p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || submitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-orange text-white font-bold rounded-lg hover:bg-orange/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Submit Application</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
