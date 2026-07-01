"use client";

import AdminShell from "@/components/admin/admin-shell";
import {
  Shield,
  ExternalLink,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  CreditCard,
  Eye,
  FileWarning,
  Cloud,
  MessageSquare,
  Bot,
  Globe,
} from "lucide-react";

type VarStatus = "configured" | "missing" | "rotate";

interface EnvVar {
  name: string;
  status: VarStatus;
  lastChecked: string;
}

interface ServiceGroup {
  name: string;
  icon: React.ReactNode;
  vars: EnvVar[];
  rotationDays: number;
}

const services: ServiceGroup[] = [
  {
    name: "Core Platform",
    icon: <Database size={18} className="text-[#FF6B00]" />,
    rotationDays: 180,
    vars: [
      { name: "NEXT_PUBLIC_SUPABASE_URL", status: "configured", lastChecked: "2026-06-28" },
      { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", status: "configured", lastChecked: "2026-06-28" },
      { name: "SUPABASE_SERVICE_ROLE_KEY", status: "configured", lastChecked: "2026-06-28" },
      { name: "NEXT_PUBLIC_SITE_URL", status: "configured", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "Payments",
    icon: <CreditCard size={18} className="text-[#FF6B00]" />,
    rotationDays: 90,
    vars: [
      { name: "PAYSTACK_SECRET_KEY", status: "configured", lastChecked: "2026-06-28" },
      { name: "PAYSTACK_PUBLIC_KEY", status: "configured", lastChecked: "2026-06-28" },
      { name: "FLUTTERWAVE_SECRET_KEY", status: "missing", lastChecked: "2026-06-28" },
      { name: "STRIPE_SECRET_KEY", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "Security — Sentry",
    icon: <Eye size={18} className="text-[#FF6B00]" />,
    rotationDays: 180,
    vars: [
      { name: "NEXT_PUBLIC_SENTRY_DSN", status: "missing", lastChecked: "2026-06-28" },
      { name: "SENTRY_AUTH_TOKEN", status: "missing", lastChecked: "2026-06-28" },
      { name: "SENTRY_ORG", status: "missing", lastChecked: "2026-06-28" },
      { name: "SENTRY_PROJECT", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "Security — KYC",
    icon: <Shield size={18} className="text-[#FF6B00]" />,
    rotationDays: 90,
    vars: [
      { name: "SMILE_IDENTITY_API_KEY", status: "missing", lastChecked: "2026-06-28" },
      { name: "SMILE_IDENTITY_PARTNER_ID", status: "missing", lastChecked: "2026-06-28" },
      { name: "ONFIDO_API_TOKEN", status: "missing", lastChecked: "2026-06-28" },
      { name: "PERSONA_API_KEY", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "Security — File Scanning",
    icon: <FileWarning size={18} className="text-[#FF6B00]" />,
    rotationDays: 90,
    vars: [
      { name: "VIRUSTOTAL_API_KEY", status: "missing", lastChecked: "2026-06-28" },
      { name: "SIGHTENGINE_API_USER", status: "missing", lastChecked: "2026-06-28" },
      { name: "SIGHTENGINE_API_SECRET", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "Security — Backups",
    icon: <Cloud size={18} className="text-[#FF6B00]" />,
    rotationDays: 90,
    vars: [
      { name: "CLOUDFLARE_R2_ACCESS_KEY", status: "missing", lastChecked: "2026-06-28" },
      { name: "CLOUDFLARE_R2_SECRET_KEY", status: "missing", lastChecked: "2026-06-28" },
      { name: "CLOUDFLARE_R2_BUCKET", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "SMS / Email",
    icon: <MessageSquare size={18} className="text-[#FF6B00]" />,
    rotationDays: 90,
    vars: [
      { name: "TWILIO_ACCOUNT_SID", status: "missing", lastChecked: "2026-06-28" },
      { name: "TWILIO_AUTH_TOKEN", status: "missing", lastChecked: "2026-06-28" },
      { name: "TERMII_API_KEY", status: "missing", lastChecked: "2026-06-28" },
      { name: "RESEND_API_KEY", status: "rotate", lastChecked: "2026-03-15" },
      { name: "SENDGRID_API_KEY", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "AI",
    icon: <Bot size={18} className="text-[#FF6B00]" />,
    rotationDays: 90,
    vars: [
      { name: "OPENROUTER_API_KEY", status: "missing", lastChecked: "2026-06-28" },
      { name: "OPENAI_API_KEY", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
  {
    name: "Domain / CDN",
    icon: <Globe size={18} className="text-[#FF6B00]" />,
    rotationDays: 180,
    vars: [
      { name: "CF_API_TOKEN", status: "rotate", lastChecked: "2026-01-10" },
      { name: "VERCEL_API_TOKEN", status: "missing", lastChecked: "2026-06-28" },
    ],
  },
];

const statusDot: Record<VarStatus, { color: string; label: string }> = {
  configured: { color: "bg-emerald-400", label: "Configured" },
  missing: { color: "bg-red-400", label: "Missing" },
  rotate: { color: "bg-amber-400", label: "Rotate" },
};

function StatusIndicator({ status }: { status: VarStatus }) {
  const s = statusDot[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${s.color}`} />
      <span className="text-xs text-gray-300">{s.label}</span>
    </span>
  );
}

export default function AdminEnvironmentPage() {
  const allVars = services.flatMap((s) => s.vars);
  const totalCount = allVars.length;
  const configuredCount = allVars.filter((v) => v.status === "configured").length;
  const missingCount = allVars.filter((v) => v.status === "missing").length;
  const rotateCount = allVars.filter((v) => v.status === "rotate").length;

  return (
    <AdminShell title="Environment Variables" subtitle="Manage and track all external service API keys">
      <div className="space-y-8 max-w-6xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-text-4 uppercase tracking-wider">Total Variables</p>
            <p className="text-3xl font-bold text-text-1 mt-1">{totalCount}</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle size={12} /> Configured
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{configuredCount}</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle size={12} /> Missing
            </p>
            <p className="text-3xl font-bold text-red-600 mt-1">{missingCount}</p>
          </div>
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={12} /> Needs Rotation
            </p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{rotateCount}</p>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-text-1">Service Variables</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {services.map((service) => {
              const svcConfigured = service.vars.filter((v) => v.status === "configured").length;
              return (
                <div key={service.name} className="bg-white border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-gray-50/50">
                    <div className="flex items-center gap-2.5">
                      {service.icon}
                      <span className="font-semibold text-sm text-text-1">{service.name}</span>
                      <span className="text-[10px] bg-gray-100 text-text-3 px-2 py-0.5 rounded-full">
                        {svcConfigured}/{service.vars.length}
                      </span>
                    </div>
                    <a
                      href="https://vercel.com/dashboard/settings/environment-variables"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF6B00] hover:text-[#e65f00] transition-colors"
                    >
                      Set in Vercel <ExternalLink size={10} />
                    </a>
                  </div>
                  <div className="px-5 py-3">
                    <div className="space-y-2">
                      {service.vars.map((v) => (
                        <div key={v.name} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                          <span className="font-mono text-xs text-text-2">{v.name}</span>
                          <StatusIndicator status={v.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Set Variables */}
        <div className="bg-[#0A1628] border border-[#FF6B00]/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-[#FF6B00] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">How to Set Variables</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Environment variables are managed in{" "}
                <span className="text-white font-medium">Vercel Dashboard → Settings → Environment Variables</span>.
                Add variables for <span className="text-white font-medium">Production</span>,{" "}
                <span className="text-white font-medium">Preview</span>, and{" "}
                <span className="text-white font-medium">Development</span> scopes. Never commit API keys to the repository.
              </p>
            </div>
          </div>
        </div>

        {/* Rotation Policy Table */}
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#FF6B00]" />
              <h3 className="font-semibold text-sm text-text-1">Rotation Policy</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-4">
                  <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider">Service</th>
                  <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider">Variables</th>
                  <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider">Recommended Rotation</th>
                  <th className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider">Last Checked</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.name} className="border-b border-border/50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-text-1 text-xs">{service.name}</td>
                    <td className="px-5 py-3 text-text-3 text-xs">{service.vars.length} keys</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${service.rotationDays <= 90 ? "text-amber-600" : "text-gray-500"}`}>
                        <Clock size={10} />
                        {service.rotationDays} days
                      </span>
                    </td>
                    <td className="px-5 py-3 text-text-4 text-xs">
                      {new Date(service.vars[0]?.lastChecked || "2026-06-28").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
