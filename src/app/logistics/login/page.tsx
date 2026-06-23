"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LogisticsLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push("/logistics/dashboard");
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange/10 rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-orange" />
          </div>
          <h1 className="text-2xl font-syne font-700 text-white">Partner Login</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to the Kauvex Logistics Network</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full h-11 pl-10 pr-4 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50 focus:ring-1 focus:ring-orange/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 pl-10 pr-11 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-orange/50 focus:ring-1 focus:ring-orange/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-navy text-orange focus:ring-orange/20" />
              <span className="text-xs text-white/50">Remember me</span>
            </label>
            <button type="button" className="text-xs text-orange hover:underline">Forgot password?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-orange text-white font-bold rounded-lg hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-white/40">
            Don&apos;t have an account?{" "}
            <Link href="/logistics/register" className="text-orange hover:underline font-medium">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
