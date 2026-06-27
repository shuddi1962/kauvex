"use client";

import { useState, useEffect } from "react";
import {
  Gift, Share2, Users, DollarSign, Copy, CheckCircle2,
  TrendingUp, Link as LinkIcon, Mail, MessageCircle, Hash,
  Globe, ChevronRight, Star, Award, Zap, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralStats {
  totalReferrals: number;
  earnedRewards: string;
  pendingRewards: string;
  conversionRate: string;
}

interface ReferralEntry {
  id: string;
  name: string;
  email: string;
  date: string;
  status: string;
  reward: string;
}

interface RewardRule {
  action: string;
  reward: string;
  desc: string;
}

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState<ReferralStats>({ totalReferrals: 0, earnedRewards: "₦0", pendingRewards: "₦0", conversionRate: "0%" });
  const [referralHistory, setReferralHistory] = useState<ReferralEntry[]>([]);
  const [rewards, setRewards] = useState<RewardRule[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/account/referrals");
        if (res.ok) {
          const d = await res.json();
          if (d.code) setReferralCode(d.code);
          if (d.link) setReferralLink(d.link);
          else if (d.code) setReferralLink(`https://kauvex.com/ref/${d.code}`);
          if (d.stats) setStats(d.stats);
          if (Array.isArray(d.history)) setReferralHistory(d.history);
          if (Array.isArray(d.rewards)) setRewards(d.rewards);
        }
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareVia = (platform: string) => {
    const text = `Shop on Kauvex! Use my referral link: ${referralLink}`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}&u=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=Join Kauvex&body=${encodeURIComponent(text)}`,
    };
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  const statCards = [
    { label: "Total Referrals", value: stats.totalReferrals, icon: Users, color: "text-blue", bg: "bg-blue-50" },
    { label: "Earned Rewards", value: stats.earnedRewards, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Rewards", value: stats.pendingRewards, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Conversion Rate", value: stats.conversionRate, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-blue" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-bold text-2xl text-text-1 mb-6">Referral Program</h1>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-blue via-blue-900 to-blue-800 rounded-2xl p-6 md:p-8 text-white mb-6">
        <div className="flex items-start justify-between">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={20} className="text-yellow-400" />
              <span className="text-sm text-white/60 font-medium">Refer & Earn</span>
            </div>
            <h2 className="font-bold text-2xl md:text-3xl mb-2">Invite Friends, Earn Rewards</h2>
            <p className="text-white/70 text-sm mb-4">Share your referral link and earn ₦10,000 for every friend who signs up, plus 5% commission on their purchases!</p>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <LinkIcon size={18} className="text-white/60 shrink-0" />
              <code className="flex-1 text-sm font-mono text-white/90 truncate">{referralLink}</code>
              <Button onClick={copyLink} className="bg-white text-blue hover:bg-white/90 gap-1.5 shrink-0">
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => shareVia("whatsapp")} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <MessageCircle size={18} />
              </button>
              <button onClick={() => shareVia("twitter")} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Hash size={18} />
              </button>
              <button onClick={() => shareVia("facebook")} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Globe size={18} />
              </button>
              <button onClick={() => shareVia("email")} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <Mail size={18} />
              </button>
            </div>
          </div>
          <Award size={64} className="text-white/10 hidden md:block" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <Icon size={18} className={stat.color} />
              </div>
              <p className="text-xl font-bold text-text-1">{stat.value}</p>
              <p className="text-xs text-text-4">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* How It Works */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><Zap size={18} /> How It Works</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {rewards.map((r, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-off-white">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue font-bold text-lg">{i + 1}</span>
                </div>
                <p className="font-semibold text-sm text-text-1 mb-1">{r.action}</p>
                <p className="text-lg font-bold text-blue mb-1">{r.reward}</p>
                <p className="text-xs text-text-4">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><Users size={18} /> Your Referral Code</h3>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <p className="text-xs text-text-4 mb-2">Share this code</p>
            <p className="text-3xl font-bold tracking-widest text-blue mb-3">{referralCode}</p>
            <Button onClick={copyLink} variant="outline" size="sm" className="w-full gap-1.5">
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-xl border border-border">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-text-1 flex items-center gap-2"><Users size={18} /> Referral History</h3>
          <select className="text-sm border border-border rounded-lg px-3 py-1.5 text-text-3">
            <option>All</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
        </div>
        <div className="divide-y divide-border">
          {referralHistory.map((ref) => (
            <div key={ref.id} className="flex items-center gap-4 px-5 py-4 hover:bg-off-white transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ref.status === "completed" ? "bg-green-50" : "bg-yellow-50"}`}>
                <Users size={18} className={ref.status === "completed" ? "text-green-600" : "text-yellow-600"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-1">{ref.name}</p>
                <p className="text-xs text-text-4">{ref.email} · {ref.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">{ref.reward}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ref.status === "completed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {ref.status}
                </span>
              </div>
              <ChevronRight size={14} className="text-text-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
