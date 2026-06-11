"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { motion } from "framer-motion";

interface NewsletterSectionProps {
  title: string;
  subtitle: string;
  buttonText: string;
}

export default function NewsletterSection({ title, subtitle, buttonText }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="py-14 sm:py-20 bg-[#0A1628]">
      <div className="w-full max-w-[600px] mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/15 flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-[#FF6B00]" />
          </div>
          <h2 className="font-bold text-2xl sm:text-3xl text-white tracking-tight">{title}</h2>
          <p className="text-white/60 text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed">{subtitle}</p>

          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10"
            >
              <p className="text-white font-semibold">You&apos;re subscribed! 🎉</p>
              <p className="text-white/60 text-sm mt-1">Thanks for joining the KAUVEX community.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-11 sm:h-12 px-6 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg flex-shrink-0"
              >
                <Send size={14} />
                {buttonText}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
