"use client";

import { useState, useEffect } from "react";
import { Megaphone, Clock, DollarSign, Percent, Link, Gift, Flame, ChevronRight, ExternalLink, Copy, Check } from "lucide-react";
import LinkNext from "next/link";

const activePromotions = [
  {
    id: 1,
    title: "Summer Electronics Blowout",
    banner: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=120&fit=crop",
    rate: "12%",
    type: "Commission",
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    clicks: 1240,
    conversions: 89,
    earnings: "$2,340.00",
    status: "active",
  },
  {
    id: 2,
    title: "Marine Equipment Sale",
    banner: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=120&fit=crop",
    rate: "15%",
    type: "Commission",
    endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    clicks: 892,
    conversions: 56,
    earnings: "$1,680.00",
    status: "active",
  },
  {
    id: 3,
    title: "Fitness Gear Flash Deal",
    banner: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=120&fit=crop",
    rate: "20%",
    type: "Commission",
    endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    clicks: 2104,
    conversions: 178,
    earnings: "$5,460.00",
    status: "active",
  },
  {
    id: 4,
    title: "Home Office Essentials",
    banner: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=120&fit=crop",
    rate: "10%",
    type: "Commission",
    endsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    clicks: 567,
    conversions: 34,
    earnings: "$850.00",
    status: "active",
  },
];

const bounties = [
  {
    id: 1,
    title: "Refer a Vendor – $50 Flat Fee",
    desc: "Get $50 for every new vendor you refer who lists 10+ products and completes registration.",
    reward: "$50",
    remaining: 200,
    icon: Gift,
  },
  {
    id: 2,
    title: "First Purchase Bounty – $25",
    desc: "Earn $25 when a referred customer makes their first purchase of $100+.",
    reward: "$25",
    remaining: 500,
    icon: DollarSign,
  },
  {
    id: 3,
    title: "High-Ticket Bonus – $200",
    desc: "Earn $200 for every referred sale of $2,000+ in Marine or Electronics categories.",
    reward: "$200",
    remaining: 50,
    icon: Flame,
  },
];

function CountdownTimer({ target }: { target: Date }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setRemaining("Ended");
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setRemaining(`${d}d ${h}h ${m}m`);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      <Clock size={10} /> {remaining}
    </span>
  );
}

export default function PromotionsPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyLink = (id: number) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Promotions</h1>
        <p className="text-xs text-gray-500">Active campaigns, bounties, and referral opportunities</p>
      </div>

      {/* Active Promotions */}
      <div>
        <h2 className="font-bold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
          <Megaphone size={14} className="text-[#FF6B00]" /> Active Promotions
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {activePromotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-20 bg-gray-200 relative">
                <img
                  src={promo.banner}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <CountdownTimer target={promo.endsAt} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <h3 className="text-white font-bold text-xs truncate">{promo.title}</h3>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-gray-500">{promo.type}</span>
                    <span className="text-xs font-bold text-[#FF6B00]">{promo.rate}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-green-700">Earned: {promo.earnings}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span>{promo.clicks.toLocaleString()} clicks</span>
                  <span>{promo.conversions} conversions</span>
                </div>
                <button
                  onClick={() => copyLink(promo.id)}
                  className={`w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[10px] font-bold transition-all ${
                    copiedId === promo.id
                      ? "bg-green-100 text-green-700"
                      : "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90"
                  }`}
                >
                  {copiedId === promo.id ? (
                    <><Check size={12} /> Copied!</>
                  ) : (
                    <><Link size={12} /> Get Links</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bounties */}
      <div>
        <h2 className="font-bold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
          <Gift size={14} className="text-[#FF6B00]" /> Bounties
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {bounties.map((bounty) => {
            const Icon = bounty.icon;
            return (
              <div key={bounty.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center mb-3">
                  <Icon size={15} />
                </div>
                <h3 className="text-xs font-bold text-[#0A1628] mb-1">{bounty.title}</h3>
                <p className="text-[10px] text-gray-500 mb-3">{bounty.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#FF6B00]">{bounty.reward}</span>
                  <span className="text-[9px] text-gray-400">{bounty.remaining} remaining</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promo Bar */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2a4a] rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="font-bold text-sm text-white flex items-center gap-2">
            <Percent size={14} className="text-[#FF6B00]" /> Create Your Own Promotion
          </p>
          <p className="text-[10px] text-white/60">Design custom discount codes and track performance</p>
        </div>
        <LinkNext
          href="/partners/dashboard/quick-links"
          className="flex items-center gap-1 h-8 px-4 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors shrink-0"
        >
          Get Started <ChevronRight size={12} />
        </LinkNext>
      </div>
    </div>
  );
}
