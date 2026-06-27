"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Star,
  Gift,
  Crown,
  Gem,
  Medal,
  Award,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tier {
  name: string;
  minPoints: number;
  color: string;
  benefits: string[];
}

interface HistoryEntry {
  id: string;
  action: string;
  points: number;
  type: "earned" | "redeemed";
  date: string;
}

interface RedeemOption {
  points: number;
  value: string;
}

const tierIcons: Record<string, typeof Medal> = {
  Bronze: Medal, Silver: Award, Gold: Crown, Platinum: Gem,
};

export default function LoyaltyPage() {
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [currentTier, setCurrentTier] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [redeemOptions, setRedeemOptions] = useState<RedeemOption[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/account/loyalty");
        if (res.ok) {
          const d = await res.json();
          if (Array.isArray(d.tiers)) setTiers(d.tiers);
          if (d.points !== undefined) setCurrentPoints(d.points);
          if (d.tier) setCurrentTier(d.tier);
          if (Array.isArray(d.history)) setHistory(d.history);
          if (Array.isArray(d.redeemOptions)) setRedeemOptions(d.redeemOptions);
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const nextTier = tiers.find((t) => t.minPoints > currentPoints) || tiers[tiers.length - 1];
  const currentTierData = tiers.find((t) => t.name === currentTier);
  const progress = nextTier ? (nextTier.minPoints > 0 ? Math.min((currentPoints / nextTier.minPoints) * 100, 100) : 100) : 0;

  const redeem = async (points: number) => {
    try {
      await fetch("/api/v1/account/loyalty/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ points }) });
      setCurrentPoints((p) => p - points);
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold text-2xl text-text-1 mb-6">Loyalty & Rewards</h1>

      {/* Current Tier Card */}
      <div className={`bg-gradient-to-br ${currentTierData?.color || "from-gray-400 to-gray-600"} rounded-2xl p-6 md:p-8 text-white mb-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <Crown size={28} />
            </div>
            <div>
              <p className="text-white/60 text-sm">{currentTier || "Member"} Member</p>
              <h2 className="font-bold text-3xl">{currentPoints.toLocaleString()}</h2>
              <p className="text-white/60 text-xs">loyalty points</p>
            </div>
          </div>
          <Trophy size={48} className="text-white/10" />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/60">{currentTier}</span>
            <span className="text-white/80">{nextTier?.name} — {nextTier?.minPoints.toLocaleString()} pts</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/50 mt-2">
            {nextTier ? `${(nextTier.minPoints - currentPoints).toLocaleString()} more points to reach ${nextTier.name}` : "Maximum tier reached!"}
          </p>
        </div>
      </div>

      {/* Tier Comparison */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {tiers.map((tier) => {
          const Icon = tierIcons[tier.name] || Star;
          const isCurrent = tier.name === currentTier;
          return (
            <div
              key={tier.name}
              className={`rounded-xl border p-4 ${
                isCurrent ? "border-blue bg-blue-50" : "border-border bg-white"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className={isCurrent ? "text-blue" : "text-text-4"} />
                <h4 className={`text-sm font-semibold ${isCurrent ? "text-blue" : "text-text-2"}`}>
                  {tier.name}
                </h4>
                {isCurrent && (
                  <span className="text-[10px] bg-blue text-white px-2 py-0.5 rounded-full ml-auto">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-text-4 mb-2">{tier.minPoints.toLocaleString()} pts required</p>
              <ul className="space-y-1">
                {tier.benefits.map((b) => (
                  <li key={b} className="text-xs text-text-3 flex items-start gap-1.5">
                    <Star size={10} className="text-yellow-500 mt-0.5 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Redeem Points */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-lg text-text-1 mb-4 flex items-center gap-2">
            <Gift size={18} /> Redeem Points
          </h3>
          <div className="space-y-3">
            {redeemOptions.map((opt) => (
              <div
                key={opt.points}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-blue transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Zap size={16} className="text-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-1">{opt.value}</p>
                    <p className="text-xs text-text-4">{opt.points} points</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={currentPoints >= opt.points ? "default" : "outline"}
                  disabled={currentPoints < opt.points}
                  onClick={() => redeem(opt.points)}
                >
                  Redeem
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Points History */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-lg text-text-1 mb-4 flex items-center gap-2">
            <Star size={18} /> Points History
          </h3>
          <div className="space-y-0 divide-y divide-border">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-text-1">{h.action}</p>
                  <p className="text-xs text-text-4">{h.date}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    h.type === "earned" ? "text-green-600" : "text-red"
                  }`}
                >
                  {h.type === "earned" ? "+" : ""}{h.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
