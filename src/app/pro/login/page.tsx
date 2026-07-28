"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, LogIn, Eye, EyeOff, X } from "lucide-react";

export default function ProLoginPage() {
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
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/partners/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, type: "professional" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid email or password.");
      }

      router.push("/pro/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link href="/pro" className="inline-flex items-center gap-2 text-gray-500 hover:text-navy mb-8 text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to KPN Home
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-7 h-7 text-orange" />
            </div>
            <h1 className="text-2xl font-bold text-navy">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your KPN professional account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                placeholder="you@example.com" autoComplete="email" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange/50"
                  placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/pro/register" className="text-orange font-semibold hover:underline">Register here</Link>
            </p>
            <p className="text-xs text-gray-400">
              <Link href="/pro" className="hover:underline">Back to KPN Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}