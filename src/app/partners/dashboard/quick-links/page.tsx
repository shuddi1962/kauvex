"use client";

import { useState } from "react";
import {
  Link2, Plus, Copy, Check, ExternalLink, BarChart3,
  Trash2, Search, Clock, MousePointerClick, TrendingUp,
} from "lucide-react";

const initialLinks = [
  {
    id: 1,
    originalUrl: "https://kauvex.com/products/wireless-headphones-001",
    shortUrl: "kauvex.com/go/KAV-A3F8D2",
    trackingId: "KAV-A3F8D2",
    campaign: "SummerElectronics",
    source: "instagram",
    medium: "story",
    clicks: 1240,
    created: "2026-06-20",
    status: "active",
  },
  {
    id: 2,
    originalUrl: "https://kauvex.com/products/marine-gps-420",
    shortUrl: "kauvex.com/go/KAV-B7E1C9",
    trackingId: "KAV-B7E1C9",
    campaign: "MarineEquipment",
    source: "youtube",
    medium: "description",
    clicks: 892,
    created: "2026-06-18",
    status: "active",
  },
  {
    id: 3,
    originalUrl: "https://kauvex.com/category/fitness-gear",
    shortUrl: "kauvex.com/go/KAV-C4F9A1",
    trackingId: "KAV-C4F9A1",
    campaign: "FitnessFlash",
    source: "tiktok",
    medium: "bio",
    clicks: 2104,
    created: "2026-06-15",
    status: "active",
  },
  {
    id: 4,
    originalUrl: "https://kauvex.com/deals/home-office",
    shortUrl: "kauvex.com/go/KAV-D2E5B3",
    trackingId: "KAV-D2E5B3",
    campaign: "HomeOffice",
    source: "blog",
    medium: "article",
    clicks: 567,
    created: "2026-06-12",
    status: "inactive",
  },
  {
    id: 5,
    originalUrl: "https://kauvex.com/promotions/summer-sale",
    shortUrl: "kauvex.com/go/KAV-E8A4F7",
    trackingId: "KAV-E8A4F7",
    campaign: "SummerSale2026",
    source: "twitter",
    medium: "post",
    clicks: 3451,
    created: "2026-06-10",
    status: "active",
  },
];

function generateTrackingId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "KAV-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function QuickLinksPage() {
  const [url, setUrl] = useState("");
  const [trackingId, setTrackingId] = useState(generateTrackingId());
  const [campaign, setCampaign] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [links, setLinks] = useState(initialLinks);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshTrackingId = () => setTrackingId(generateTrackingId());

  const generateLink = () => {
    if (!url.trim()) return;
    const newLink = {
      id: Date.now(),
      originalUrl: url,
      shortUrl: `kauvex.com/go/${trackingId}`,
      trackingId,
      campaign: campaign || "General",
      source: source || "direct",
      medium: medium || "link",
      clicks: 0,
      created: new Date().toISOString().slice(0, 10),
      status: "active" as const,
    };
    setLinks([newLink, ...links]);
    setUrl("");
    setCampaign("");
    setSource("");
    setMedium("");
    refreshTrackingId();
  };

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteLink = (id: number) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const filteredLinks = links.filter(
    (l) =>
      l.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.campaign.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Quick Link Creator</h1>
        <p className="text-xs text-gray-500">Generate and manage your affiliate tracking links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
              <Link2 size={13} />
            </div>
            <span className="text-[10px] text-gray-500">Total Links</span>
          </div>
          <p className="font-bold text-sm text-[#0A1628] ml-9">{links.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MousePointerClick size={13} />
            </div>
            <span className="text-[10px] text-gray-500">Total Clicks</span>
          </div>
          <p className="font-bold text-sm text-[#0A1628] ml-9">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp size={13} />
            </div>
            <span className="text-[10px] text-gray-500">Active</span>
          </div>
          <p className="font-bold text-sm text-[#0A1628] ml-9">{links.filter((l) => l.status === "active").length}</p>
        </div>
      </div>

      {/* Create Link */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
          <Plus size={14} className="text-[#FF6B00]" /> Create New Tracking Link
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Destination URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://kauvex.com/products/..."
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Tracking ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={trackingId}
                readOnly
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-xs font-mono font-bold bg-gray-50 text-[#FF6B00]"
              />
              <button
                onClick={refreshTrackingId}
                className="h-9 px-3 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-[10px] font-semibold"
              >
                Refresh
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Campaign Name</label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="e.g. SummerSale"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            >
              <option value="">Select source</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter / X</option>
              <option value="blog">Blog</option>
              <option value="email">Email</option>
              <option value="website">Website</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Medium</label>
            <select
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            >
              <option value="">Select medium</option>
              <option value="story">Story</option>
              <option value="post">Post</option>
              <option value="bio">Bio / Link in Bio</option>
              <option value="description">Description</option>
              <option value="article">Article</option>
              <option value="newsletter">Newsletter</option>
              <option value="banner">Banner</option>
            </select>
          </div>
        </div>
        <button
          onClick={generateLink}
          disabled={!url.trim()}
          className="mt-4 h-9 px-6 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Link2 size={12} /> Generate Short Link
        </button>
      </div>

      {/* Recent Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
            <BarChart3 size={14} className="text-[#FF6B00]" /> Recent Links
          </h2>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search links..."
              className="h-8 w-48 pl-7 pr-3 rounded-lg border border-gray-200 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Original URL</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Short URL</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link) => (
                <tr key={link.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink size={10} className="text-gray-300 shrink-0" />
                      <span className="text-[10px] text-gray-600 truncate max-w-[160px] block" title={link.originalUrl}>
                        {link.originalUrl}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 block ml-4">
                      {link.source} / {link.medium}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-semibold text-[#FF6B00]">{link.shortUrl}</span>
                      <button
                        onClick={() => copyToClipboard(link.id, `https://${link.shortUrl}`)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === link.id ? (
                          <Check size={10} className="text-green-600" />
                        ) : (
                          <Copy size={10} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] font-medium text-gray-700">{link.campaign}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MousePointerClick size={9} className="text-gray-400" />
                      <span className="text-[10px] font-semibold">{link.clicks.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="text-[10px] text-gray-500">{link.created}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                      link.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {link.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLinks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[10px] text-gray-400">
                    No links found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
