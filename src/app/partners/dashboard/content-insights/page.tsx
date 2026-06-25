"use client";

import { useState } from "react";
import {
  TrendingUp, Image, Music2, Video, Globe, Users,
  MousePointerClick, DollarSign, Calendar, Link, Plus,
  ArrowUp, ArrowDown, Check, X, ExternalLink,
} from "lucide-react";

type Platform = "instagram" | "tiktok" | "youtube" | "twitter";

interface PlatformData {
  id: Platform;
  name: string;
  icon: typeof Image;
  connected: boolean;
  followers: number;
  engagement: string;
  topContent: string;
  topClicks: number;
}

const platforms: PlatformData[] = [
  { id: "instagram", name: "Instagram", icon: Image, connected: true, followers: 12450, engagement: "3.8%", topContent: "Summer Haul 2026", topClicks: 2340 },
  { id: "tiktok", name: "TikTok", icon: Music2, connected: true, followers: 8230, engagement: "5.2%", topContent: "Tech Gadgets Compilation", topClicks: 4100 },
  { id: "youtube", name: "YouTube", icon: Video, connected: false, followers: 0, engagement: "0%", topContent: "", topClicks: 0 },
  { id: "twitter", name: "Twitter / X", icon: Globe, connected: true, followers: 2100, engagement: "1.4%", topContent: "Thread: Best Budget Finds", topClicks: 890 },
];

const contentPerformance = [
  { platform: "Instagram", content: "Summer Haul 2026", clicks: 2340, conversions: 124, commission: "$1,240.00", date: "2026-06-22" },
  { platform: "TikTok", content: "Tech Gadgets Compilation", clicks: 4100, conversions: 238, commission: "$2,380.00", date: "2026-06-20" },
  { platform: "Instagram", content: "Home Office Setup Tour", clicks: 1850, conversions: 92, commission: "$920.00", date: "2026-06-18" },
  { platform: "Twitter / X", content: "Thread: Best Budget Finds", clicks: 890, conversions: 45, commission: "$450.00", date: "2026-06-15" },
  { platform: "TikTok", content: "Unboxing: Smart Watch Ultra", clicks: 3100, conversions: 176, commission: "$1,760.00", date: "2026-06-12" },
  { platform: "Instagram", content: "Marine Gear Review", clicks: 1580, conversions: 78, commission: "$780.00", date: "2026-06-10" },
];

const platformIcons: Record<string, typeof Image> = {
  Instagram: Image,
  TikTok: Music2,
  YouTube: Video,
  "Twitter / X": Globe,
};

const platformColors: Record<string, string> = {
  Instagram: "bg-pink-50 text-pink-600",
  TikTok: "bg-gray-100 text-gray-900",
  YouTube: "bg-red-50 text-red-600",
  "Twitter / X": "bg-blue-50 text-blue-500",
};

export default function ContentInsightsPage() {
  const [platformsState, setPlatformsState] = useState(platforms);

  const toggleConnect = (id: Platform) => {
    setPlatformsState((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: !p.connected } : p))
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Content Insights</h1>
        <p className="text-xs text-gray-500">Track performance across your connected social platforms</p>
      </div>

      {/* Connected Platforms */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {platformsState.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  platform.connected ? "bg-[#FF6B00]/10 text-[#FF6B00]" : "bg-gray-100 text-gray-400"
                }`}>
                  <Icon size={15} />
                </div>
                <div className={`flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                  platform.connected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {platform.connected ? <><Check size={8} /> Connected</> : <><X size={8} /> Disconnected</>}
                </div>
              </div>
              <p className="text-xs font-bold text-[#0A1628] mb-2">{platform.name}</p>
              {platform.connected ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">Followers</span>
                    <span className="text-[11px] font-bold text-gray-800">{platform.followers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">Engagement</span>
                    <span className="text-[11px] font-bold text-green-700">{platform.engagement}</span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-100">
                    <p className="text-[9px] text-gray-400 mb-0.5">Top Content</p>
                    <p className="text-[10px] font-semibold text-gray-700 truncate">{platform.topContent}</p>
                    <p className="text-[9px] text-[#FF6B00]">{platform.topClicks.toLocaleString()} clicks</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-3">
                  <p className="text-[10px] text-gray-400 mb-2">Not connected</p>
                  <button
                    onClick={() => toggleConnect(platform.id)}
                    className="flex items-center gap-1 h-7 px-3 bg-[#FF6B00] text-white text-[9px] font-bold rounded-lg hover:bg-[#FF6B00]/90 transition-colors"
                  >
                    <Plus size={10} /> Connect Platform
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
            <TrendingUp size={14} className="text-[#FF6B00]" /> Content Performance
          </h3>
          <button className="flex items-center gap-1 h-7 px-3 bg-gray-100 text-gray-700 text-[9px] font-bold rounded-lg hover:bg-gray-200 transition-colors">
            <Calendar size={10} /> Last 30 Days
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Platform</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3">Content</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3 text-right">Clicks</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3 text-right">Conversions</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 pr-3 text-right">Commission</th>
                <th className="text-[10px] font-semibold text-gray-400 uppercase pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {contentPerformance.map((item, idx) => {
                const PIcon = platformIcons[item.platform] || Globe;
                return (
                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded flex items-center justify-center ${platformColors[item.platform] || "bg-gray-100 text-gray-500"}`}>
                          <PIcon size={9} />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-700">{item.platform}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <p className="text-[11px] text-gray-700 truncate max-w-[200px]">{item.content}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <p className="text-[11px] font-semibold text-gray-800">{item.clicks.toLocaleString()}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <p className="text-[11px] font-semibold text-gray-800">{item.conversions}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <p className="text-[11px] font-semibold text-green-700">{item.commission}</p>
                    </td>
                    <td className="py-2.5 text-right">
                      <p className="text-[10px] text-gray-500">{item.date}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-500 mb-1">Total Followers</p>
          <p className="font-bold text-lg text-[#0A1628]">22,780</p>
          <span className="text-[9px] text-green-600 font-semibold flex items-center gap-0.5 mt-1"><ArrowUp size={9} /> +8.3% this month</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-500 mb-1">Total Clicks</p>
          <p className="font-bold text-lg text-[#0A1628]">13,860</p>
          <span className="text-[9px] text-green-600 font-semibold flex items-center gap-0.5 mt-1"><ArrowUp size={9} /> +22.1% this month</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-500 mb-1">Total Conversions</p>
          <p className="font-bold text-lg text-[#0A1628]">753</p>
          <span className="text-[9px] text-green-600 font-semibold flex items-center gap-0.5 mt-1"><ArrowUp size={9} /> +15.4% this month</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] text-gray-500 mb-1">Commission Earned</p>
          <p className="font-bold text-lg text-[#0A1628]">$7,530</p>
          <span className="text-[9px] text-green-600 font-semibold flex items-center gap-0.5 mt-1"><ArrowUp size={9} /> +18.7% this month</span>
        </div>
      </div>
    </div>
  );
}
