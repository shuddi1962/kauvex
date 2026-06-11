"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gift, CreditCard, Send, Check, ChevronRight,
  Shield, Heart, Mail, MessageSquare, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";

const presetAmounts = [10, 25, 50, 100, 200, 500];

export default function GiftCardsPage() {
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const displayAmount = customAmount ? Number(customAmount) : amount;

  const handlePurchase = async () => {
    if (displayAmount < 5) { setError("Minimum amount is $5"); return; }
    if (!recipientEmail) { setError("Recipient email is required"); return; }
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await insforge.auth.getUser();
      if (!user) {
        setError("Please sign in to purchase a gift certificate");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/gift-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: displayAmount,
          recipient_email: recipientEmail,
          recipient_name: recipientName || undefined,
          message: message || undefined,
        }),
      });
      const json = await res.json();
      if (json.error) { setError(json.error); setLoading(false); return; }
      setCode(json.data?.code || "KVX-XXXX-XXXX");
      setPurchased(true);
    } catch {
      setError("Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (purchased) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-green-600" />
          </div>
          <h1 className="font-bold text-3xl text-text-1 mb-2">Gift Certificate Purchased!</h1>
          <p className="text-text-3 mb-6">Your gift certificate code is below. Share it with your recipient.</p>
          <div className="bg-white rounded-2xl border border-border p-8 mb-6">
            <div className="text-xs text-text-4 mb-2">Gift Certificate Code</div>
            <div className="font-mono font-bold text-2xl text-blue tracking-wider bg-blue-50 rounded-xl py-4 px-6">
              {code}
            </div>
            <div className="mt-4 text-sm text-text-3">
              <p>Amount: <span className="font-bold text-text-1">${displayAmount.toFixed(2)}</span></p>
              {recipientEmail && <p>Sent to: <span className="font-bold text-text-1">{recipientEmail}</span></p>}
            </div>
          </div>
          <p className="text-xs text-text-4 mb-6">The code was also sent to {recipientEmail}. It expires in 1 year.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/"><Button variant="outline">Back to Home</Button></Link>
            <Button onClick={() => { setPurchased(false); setCode(""); setAmount(50); setCustomAmount(""); setRecipientEmail(""); setRecipientName(""); setMessage(""); }}>
              Buy Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Breadcrumb */}
      <div className="bg-white/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-text-4">
          <Link href="/" className="hover:text-blue">Home</Link>
          <ChevronRight size={12} />
          <span className="text-text-2 font-medium">Gift Certificates</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Hero */}
          <div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
              <Gift size={32} className="text-white" />
            </div>
            <h1 className="font-bold text-4xl text-text-1 mb-3">Give the Gift of Choice</h1>
            <p className="text-text-3 leading-relaxed mb-6">
              Let your loved ones choose exactly what they want from millions of products on KAUVEX.
              Our digital gift certificates are delivered instantly and never expire for 12 months.
            </p>
            <div className="space-y-4">
              {[
                { icon: Send, text: "Instant delivery via email" },
                { icon: Heart, text: "Redeemable on any product" },
                { icon: Shield, text: "Secure and guaranteed" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-purple-600" />
                    </div>
                    <span className="text-sm text-text-2">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchase Form */}
          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            <h2 className="font-bold text-xl text-text-1 mb-6">Create Gift Certificate</h2>

            {/* Amount */}
            <div className="mb-6">
              <label className="text-xs font-bold text-text-2 block mb-3">Select Amount</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setCustomAmount(""); }}
                    className={`h-12 rounded-xl text-sm font-bold border-2 transition-all ${
                      amount === a && !customAmount
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-border text-text-2 hover:border-purple-300"
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-text-4 block mb-1">Or custom amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-4">$</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); }}
                    className="w-full h-10 pl-7 pr-3 text-sm border border-border rounded-lg focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-text-2 block mb-1">Recipient Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm border border-border rounded-lg focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-text-2 block mb-1">Recipient Name (optional)</label>
                <div className="relative">
                  <Heart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input
                    placeholder="Friend's name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm border border-border rounded-lg focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-text-2 block mb-1">Message (optional)</label>
                <div className="relative">
                  <MessageSquare size={14} className="absolute left-3 top-3 text-text-4" />
                  <textarea
                    placeholder="Write a personal message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full pl-9 pr-3 pt-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <Button
              className="w-full h-12 text-base font-bold"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <CreditCard size={18} className="mr-2" />}
              {loading ? "Processing..." : `Purchase $${displayAmount.toFixed(2)} Gift Certificate`}
            </Button>

            <p className="text-[10px] text-text-4 text-center mt-3">
              By purchasing, you agree to our Gift Certificate terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
