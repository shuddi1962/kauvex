"use client";

import { Mail, ArrowRight, Check } from "lucide-react";
import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section className="bg-gradient-to-r from-navy to-navy-light py-12 mt-4">
      <div className="container-kauvex flex flex-col lg:flex-row items-center justify-between gap-6 text-white text-center lg:text-left">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 text-orange" />
          </span>
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Join the KAUVEX Insider List</h2>
            <p className="text-white/50 text-sm mt-1">Get early access to sales and new arrivals — no spam, ever.</p>
          </div>
        </div>

        {subscribed ? (
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-6 py-3">
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">You&apos;re subscribed!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md rounded-xl overflow-hidden bg-white p-1">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-sm text-text-1 outline-none placeholder:text-text-4"
            />
            <button
              type="submit"
              className="bg-orange hover:bg-orange/90 text-white text-sm font-bold px-7 rounded-lg transition-all flex items-center gap-1"
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}