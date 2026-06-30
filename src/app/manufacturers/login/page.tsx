"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const MANUFACTURER_ROLES = ["vendor", "manufacturer"];

export default function ManufacturerLoginPage() {
  const router = useRouter();
  const { signIn, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      const { user } = useAuthStore.getState();
      if (!user || !MANUFACTURER_ROLES.includes(user.role)) {
        setError("Access denied. This account does not have manufacturer privileges.");
        setIsSubmitting(false);
        return;
      }
      router.push("/manufacturers/dashboard");
    } catch {
      setError(useAuthStore.getState().error || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d1f3c] to-[#1a1040] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full border border-white/20" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-orange-500/10" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <Factory className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-syne font-800 text-2xl text-white mb-1">Manufacturer Portal</h1>
          <p className="text-orange-300 text-sm">Global B2B manufacturing marketplace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-border p-8">
          <div className="mb-6">
            <h2 className="font-syne font-700 text-xl text-text-1 mb-1">Manufacturer Sign In</h2>
            <p className="text-text-3 text-xs">Enter your manufacturer credentials to access your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-2 mb-1.5">Factory Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  placeholder="factory@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-2 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-text-3">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-[#FF6B00] hover:underline">Forgot password?</Link>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#e86000] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Access Manufacturer Dashboard
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <p className="text-center text-sm text-text-3">
              New manufacturer?{" "}
              <Link href="/manufacturers/register" className="text-[#FF6B00] font-semibold hover:underline">
                Register Your Factory
              </Link>
            </p>
            <p className="text-center text-xs text-text-4 space-x-3">
              <Link href="/manufacturers" className="hover:text-text-2 transition-colors">Manufacturer info</Link>
              <span>|</span>
              <Link href="/auth/login" className="hover:text-text-2 transition-colors">Customer login</Link>
              <span>|</span>
              <Link href="/wholesale/login" className="hover:text-text-2 transition-colors">Wholesale login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
