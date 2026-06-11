"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgeVerificationProps {
  minAge?: number;
}

const COOKIE_KEY = "kauvex-age-verified";
const COOKIE_EXPIRY_DAYS = 30;

export default function AgeVerification({ minAge = 18 }: AgeVerificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(COOKIE_KEY);
    if (!verified) {
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem(COOKIE_KEY, "true");
    setShow(false);
  };

  const handleDeny = () => {
    window.location.href = "https://www.google.com";
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl text-center relative animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={36} className="text-amber-600" />
        </div>

        <h2 className="font-bold text-2xl text-text-1 mb-2">Age Verification</h2>
        <p className="text-sm text-text-3 mb-6 leading-relaxed">
          This storefront contains products that require you to be{" "}
          <span className="font-bold text-text-1">{minAge}+</span> years old.
          Please confirm your age to continue.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleVerify}
            className="w-full h-12 text-base font-bold"
          >
            <Check size={18} className="mr-2" /> I am {minAge} or older
          </Button>
          <Button
            variant="outline"
            onClick={handleDeny}
            className="w-full h-12 text-base"
          >
            <X size={18} className="mr-2" /> I am under {minAge}
          </Button>
        </div>

        <p className="text-[10px] text-text-4 mt-4">
          Your preference will be saved for {COOKIE_EXPIRY_DAYS} days.
        </p>
      </div>
    </div>
  );
}
