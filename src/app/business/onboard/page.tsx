"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Check,
  Building2,
  Package,
  Bot,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const industries = [
  "Marine",
  "Construction",
  "Solar Energy",
  "Security & Surveillance",
  "Dredging & Mining",
  "Agriculture",
  "Oil & Gas",
  "Logistics & Transport",
  "Manufacturing",
  "Technology",
  "Healthcare",
  "Education",
  "Other",
];

const aiEmployees = [
  { id: "sales-manager", label: "Sales Manager", description: "Helps close deals", icon: "📈" },
  { id: "customer-support", label: "Customer Support", description: "Handles tickets", icon: "🎧" },
  { id: "procurement-agent", label: "Procurement Agent", description: "Manages suppliers", icon: "🔗" },
  { id: "inventory-manager", label: "Inventory Manager", description: "Tracks stock", icon: "📦" },
  { id: "hr-assistant", label: "HR Assistant", description: "Manages people", icon: "👥" },
  { id: "finance-analyst", label: "Finance Analyst", description: "Handles numbers", icon: "💰" },
  { id: "marketing-strategist", label: "Marketing Strategist", description: "Campaigns", icon: "📣" },
  { id: "operations-coordinator", label: "Operations Coordinator", description: "Daily ops", icon: "⚙️" },
];

const steps = [
  { id: 1, label: "Company Info", icon: Building2 },
  { id: 2, label: "Products & Services", icon: Package },
  { id: 3, label: "KAI Setup", icon: Bot },
];

type Step1Data = {
  companyName: string;
  industry: string;
  staffCount: string;
  website: string;
  description: string;
};

type Step2Data = {
  productsServices: string;
  locations: string;
  contactEmail: string;
  contactPhone: string;
};

type Agent = {
  id: string;
  label: string;
  icon: string;
  role: string;
};

export default function KAIOnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdAgents, setCreatedAgents] = useState<Agent[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [s1, setS1] = useState<Step1Data>({
    companyName: "",
    industry: "",
    staffCount: "",
    website: "",
    description: "",
  });

  const [s2, setS2] = useState<Step2Data>({
    productsServices: "",
    locations: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!s1.companyName.trim()) e.companyName = "Company name is required";
    if (!s1.industry) e.industry = "Please select an industry";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (!s2.productsServices.trim()) e.productsServices = "Please describe your products or services";
    if (!s2.locations.trim()) e.locations = "Please enter your locations";
    if (!s2.contactEmail.trim()) e.contactEmail = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s2.contactEmail)) e.contactEmail = "Invalid email format";
    if (!s2.contactPhone.trim()) e.contactPhone = "Contact phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: Record<string, string> = {};
    if (selectedAgents.length === 0) e.agents = "Select at least one AI employee";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goForward = () => {
    setDirection("forward");
    if (step === 0 && validateStep1()) setStep(1);
    else if (step === 1 && validateStep2()) setStep(2);
    else if (step === 2 && validateStep3()) handleSubmit();
  };

  const goBack = () => {
    setDirection("back");
    setErrors({});
    if (step > 0) setStep(step - 1);
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
    if (errors.agents) setErrors((prev) => ({ ...prev, agents: "" }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const businessData = {
      ...s1,
      staffCount: Number(s1.staffCount) || 0,
      ...s2,
      locations: s2.locations.split(",").map((l) => l.trim()).filter(Boolean),
      aiEmployees: selectedAgents,
      onboarded: true,
    };

    try {
      const res = await fetch("/api/v1/kai/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessData),
      });

      if (!res.ok) throw new Error("Failed to onboard business");

      const business = await res.json();
      const agents: Agent[] = [];
      for (const agentId of selectedAgents) {
        const emp = aiEmployees.find((a) => a.id === agentId);
        if (!emp) continue;
        const agentRes = await fetch("/api/v1/kai/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: business.id,
            type: agentId,
            name: `${emp.label} - ${s1.companyName}`,
            role: emp.label,
          }),
        });
        if (agentRes.ok) {
          agents.push({
            id: agentId,
            label: emp.label,
            icon: emp.icon,
            role: emp.description,
          });
        }
      }

      setCreatedAgents(agents);
      setSuccess(true);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleS1Change = (field: keyof Step1Data, value: string) => {
    setS1((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleS2Change = (field: keyof Step2Data, value: string) => {
    setS2((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (success) {
    return <SuccessScreen agents={createdAgents} companyName={s1.companyName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-kauvex-navy-tint to-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-kauvex-orange transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/business" className="hover:text-kauvex-orange transition-colors">
            Business
          </Link>
          <ChevronRight size={12} />
          <span className="text-kauvex-navy font-medium">KAI Onboarding</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-kauvex-orange/10 mb-4">
            <Bot className="w-6 h-6 text-kauvex-orange" />
          </div>
          <h1 className="text-2xl font-bold text-kauvex-navy">
            Set Up Your AI Team
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Deploy Kauvex AI (KAI) employees to run your business operations
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-8">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                        i < step
                          ? "bg-kauvex-orange text-white"
                          : i === step
                          ? "bg-kauvex-orange text-white ring-4 ring-kauvex-orange/20"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {i < step ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <s.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium mt-1.5 hidden sm:block transition-colors",
                        i <= step ? "text-kauvex-navy" : "text-gray-400"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-3 mt-[-1.5rem]">
                      <div className="h-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full bg-kauvex-orange rounded-full transition-all duration-500",
                            i < step ? "w-full" : "w-0"
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="overflow-hidden">
            <div
              className={cn(
                "transition-all duration-400 ease-in-out",
                direction === "forward"
                  ? "animate-slide-up"
                  : "animate-fade-in"
              )}
              key={step}
            >
              {step === 0 && (
                <Step1
                  data={s1}
                  onChange={handleS1Change}
                  errors={errors}
                />
              )}
              {step === 1 && (
                <Step2
                  data={s2}
                  onChange={handleS2Change}
                  errors={errors}
                />
              )}
              {step === 2 && (
                <Step3
                  selected={selectedAgents}
                  onToggle={toggleAgent}
                  errors={errors}
                />
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {errors.submit}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <div>
              {step > 0 ? (
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={submitting}
                  className="gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                Step {step + 1} of {steps.length}
              </span>
              <Button
                onClick={goForward}
                loading={submitting}
                size="lg"
                className="min-w-[140px]"
              >
                {submitting ? (
                  "Setting Up..."
                ) : step < 2 ? (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Deploy AI Team
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1({
  data,
  onChange,
  errors,
}: {
  data: Step1Data;
  onChange: (field: keyof Step1Data, value: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-kauvex-navy">Company Information</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Tell us about your business so we can tailor your AI team
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            value={data.companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
            placeholder="Kauvex Technologies Ltd"
            className={cn(
              "w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all",
              errors.companyName
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-white"
            )}
          />
          {errors.companyName && (
            <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Industry <span className="text-red-500">*</span>
          </label>
          <select
            value={data.industry}
            onChange={(e) => onChange("industry", e.target.value)}
            className={cn(
              "w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all bg-white",
              errors.industry
                ? "border-red-300 bg-red-50"
                : "border-gray-200"
            )}
          >
            <option value="">Select industry</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-xs text-red-500 mt-1">{errors.industry}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Staff Count
          </label>
          <input
            type="number"
            min={0}
            value={data.staffCount}
            onChange={(e) => onChange("staffCount", e.target.value)}
            placeholder="e.g., 50"
            className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Website
          </label>
          <input
            value={data.website}
            onChange={(e) => onChange("website", e.target.value)}
            placeholder="https://kauvex.com"
            className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Briefly describe what your business does..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

function Step2({
  data,
  onChange,
  errors,
}: {
  data: Step2Data;
  onChange: (field: keyof Step2Data, value: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-kauvex-navy">Products & Services</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Help us understand what you offer and where you operate
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Products / Services Offered <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.productsServices}
          onChange={(e) => onChange("productsServices", e.target.value)}
          placeholder="Describe the products you sell or services you provide..."
          rows={3}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all resize-none",
            errors.productsServices
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          )}
        />
        {errors.productsServices && (
          <p className="text-xs text-red-500 mt-1">{errors.productsServices}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Locations of Operation <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.locations}
          onChange={(e) => onChange("locations", e.target.value)}
          placeholder="Lagos, Abuja, Port Harcourt, Dubai"
          rows={2}
          className={cn(
            "w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all resize-none",
            errors.locations
              ? "border-red-300 bg-red-50"
              : "border-gray-200 bg-white"
          )}
        />
        <p className="text-xs text-gray-400 mt-1">
          Separate locations with commas
        </p>
        {errors.locations && (
          <p className="text-xs text-red-500 mt-1">{errors.locations}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Contact Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={data.contactEmail}
            onChange={(e) => onChange("contactEmail", e.target.value)}
            placeholder="hello@company.com"
            className={cn(
              "w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all",
              errors.contactEmail
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-white"
            )}
          />
          {errors.contactEmail && (
            <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">
            Contact Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onChange("contactPhone", e.target.value)}
            placeholder="+234 800 000 0000"
            className={cn(
              "w-full h-11 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all",
              errors.contactPhone
                ? "border-red-300 bg-red-50"
                : "border-gray-200 bg-white"
            )}
          />
          {errors.contactPhone && (
            <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Step3({
  selected,
  onToggle,
  errors,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-kauvex-navy">Choose Your AI Employees</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Select the KAI agents you want to deploy. You can always add more later.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {aiEmployees.map((emp) => {
          const isSelected = selected.includes(emp.id);
          return (
            <button
              key={emp.id}
              type="button"
              onClick={() => onToggle(emp.id)}
              className={cn(
                "relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                isSelected
                  ? "border-kauvex-orange bg-kauvex-orange-tint ring-1 ring-kauvex-orange/20"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{emp.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isSelected ? "text-kauvex-orange" : "text-kauvex-navy"
                    )}
                  >
                    {emp.label}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-kauvex-orange flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{emp.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {errors.agents && (
        <p className="text-xs text-red-500 mt-1">{errors.agents}</p>
      )}

      {selected.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
          <Users className="w-3.5 h-3.5" />
          <span>
            {selected.length} agent{selected.length !== 1 ? "s" : ""} selected
          </span>
        </div>
      )}
    </div>
  );
}

function SuccessScreen({
  agents,
  companyName,
}: {
  agents: Agent[];
  companyName: string;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-kauvex-navy-tint to-white flex items-center justify-center relative overflow-hidden">
      {/* Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="confetti-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              backgroundColor: [
                "#FF6B00",
                "#0A1628",
                "#FF8C3A",
                "#16A34A",
                "#2563EB",
                "#7C3AED",
                "#D97706",
              ][Math.floor(Math.random() * 7)],
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 text-center animate-slide-up">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-strong p-8">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-kauvex-navy mb-1">
            Your AI Team is Ready!
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-semibold text-kauvex-navy">{companyName}</span> is now powered by Kauvex AI
          </p>

          <div className="bg-kauvex-navy-tint rounded-xl p-5 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Deployed Agents
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {agents.map((agent) => (
                <Badge
                  key={agent.id}
                  variant="orange"
                  className="text-xs px-3 py-1.5 gap-1.5"
                >
                  <span>{agent.icon}</span>
                  {agent.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push("/admin/kai")}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/business")}
            >
              Invite Team Members
            </Button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Your KAI agents are now live and ready to assist your team
          </p>
        </div>
      </div>

      <style>{`
        .confetti-particle {
          position: absolute;
          top: -10px;
          animation: confettiFall linear infinite;
          opacity: 0.8;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
