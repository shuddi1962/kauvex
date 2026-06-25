"use client";

import { useState } from "react";
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Download,
  FileText, Camera, Video, Play, X, FileEdit,
  BookOpen, ClipboardCheck, MessageSquare,
} from "lucide-react";

const platforms = [
  { id: "instagram", label: "Instagram", icon: Camera },
  { id: "tiktok", label: "TikTok", icon: Video },
  { id: "youtube", label: "YouTube", icon: Play },
  { id: "blog", label: "Blog / Website", icon: FileText },
  { id: "twitter", label: "Twitter / X", icon: X },
];

const disclosureTemplates: Record<string, string> = {
  instagram: `I may earn a small commission if you purchase through my links. #ad #kauvexpartner`,
  tiktok: `This post contains affiliate links. I may earn a commission if you shop through these links. #ad #kauvex`,
  youtube: `This video is sponsored by Kauvex. Some links in the description are affiliate links — I may earn a commission at no extra cost to you. Thank you for supporting my channel!`,
  blog: `Disclosure: Some of the links in this post are affiliate links. If you click through and make a purchase, I may receive a commission at no additional cost to you. As a Kauvex Affiliate Partner, I only recommend products I believe in.`,
  twitter: `Some links in this post are affiliate links. I may earn a commission if you purchase. #ad`,
};

const violationData = [
  {
    id: "VIO-001",
    platform: "Instagram",
    issue: "Missing disclosure in Story highlight",
    status: "resolved",
    date: "2026-06-20",
  },
  {
    id: "VIO-002",
    platform: "TikTok",
    issue: "Affiliate link in bio without #ad",
    status: "warning",
    date: "2026-06-18",
  },
  {
    id: "VIO-003",
    platform: "YouTube",
    issue: "Description missing commission disclosure",
    status: "flagged",
    date: "2026-06-15",
  },
  {
    id: "VIO-004",
    platform: "Blog",
    issue: "Old article without updated disclosure",
    status: "resolved",
    date: "2026-06-10",
  },
  {
    id: "VIO-005",
    platform: "Twitter",
    issue: "Promotional tweet without #ad hashtag",
    status: "flagged",
    date: "2026-06-08",
  },
];

const bestPractices = [
  "Always use #ad or #sponsored in social posts with affiliate links",
  "Place disclosure ABOVE the fold on blog posts and landing pages",
  "Include disclosure in video descriptions, not just the video itself",
  "Use clear, unambiguous language — avoid burying disclosures",
  "Apply disclosures to ALL platforms where your link appears",
  "Update old content when you join new affiliate programs",
  "Never use URL shorteners that hide the affiliate destination",
  "Keep records of your affiliate posts for compliance audits",
  "Review FTC Endorsement Guides annually for updates",
  "Add disclosure to Instagram Story text overlay, not just the link sticker",
];

const statusIcon = (status: string) => {
  switch (status) {
    case "flagged": return <AlertTriangle size={11} className="text-red-500" />;
    case "warning": return <AlertTriangle size={11} className="text-amber-500" />;
    case "resolved": return <CheckCircle size={11} className="text-emerald-500" />;
    default: return <XCircle size={11} className="text-gray-400" />;
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case "flagged":
      return "bg-red-100 text-red-700";
    case "warning":
      return "bg-amber-100 text-amber-700";
    case "resolved":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

export default function CompliancePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const copyDisclosure = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">Compliance Center</h1>
        <p className="text-xs text-gray-500">FTC disclosure tools, violation tracking, and best practices</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Disclosure Generator */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <Shield size={14} className="text-[#FF6B00]" /> Disclosure Template Generator
          </h2>
          <p className="text-[10px] text-gray-500 mb-3">Select a platform to generate an FTC-compliant disclosure text</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[10px] font-semibold transition-all ${
                    selectedPlatform === platform.id
                      ? "bg-[#FF6B00] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={12} /> {platform.label}
                </button>
              );
            })}
          </div>

          {selectedPlatform ? (
            <div className="bg-[#0A1628] rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-green-400 text-[11px] leading-relaxed font-mono">
                  {disclosureTemplates[selectedPlatform]}
                </p>
                <button
                  onClick={() => copyDisclosure(disclosureTemplates[selectedPlatform])}
                  className={`shrink-0 h-7 px-3 rounded-lg text-[9px] font-bold transition-all ${
                    copySuccess
                      ? "bg-emerald-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <MessageSquare size={18} className="text-gray-300 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">Select a platform above to generate a disclosure</p>
            </div>
          )}
        </div>

        {/* Quick Templates */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
            <FileEdit size={14} className="text-[#FF6B00]" /> Ready-to-Use Templates
          </h2>
          <div className="space-y-2">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => copyDisclosure(disclosureTemplates[platform.id])}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 hover:bg-[#FF6B00]/5 border border-transparent hover:border-[#FF6B00]/20 transition-all text-left"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center shrink-0">
                    <Icon size={11} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-700">{platform.label}</p>
                    <p className="text-[8px] text-gray-400 truncate">{disclosureTemplates[platform.id].slice(0, 60)}...</p>
                  </div>
                  <ClipboardCheck size={11} className="text-gray-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Violation Tracker */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#FF6B00]" /> Violation Tracker
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {violationData.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] font-mono font-semibold text-gray-600">{v.id}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] text-gray-700">{v.platform}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      {statusIcon(v.status)}
                      <span className="text-[10px] text-gray-600">{v.issue}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${statusBadge(v.status)}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="text-[10px] text-gray-500">{v.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-sm text-[#0A1628] mb-3 flex items-center gap-2">
            <BookOpen size={14} className="text-[#FF6B00]" /> FTC Best Practices Checklist
          </h2>
          <div className="space-y-1.5">
            {bestPractices.map((practice, index) => (
              <button
                key={index}
                onClick={() => toggleCheck(index)}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checkedItems.includes(index)
                    ? "bg-[#FF6B00] border-[#FF6B00] text-white"
                    : "border-gray-300"
                }`}>
                  {checkedItems.includes(index) && <span className="text-[8px] font-bold">✓</span>}
                </div>
                <span className={`text-[10px] leading-relaxed ${
                  checkedItems.includes(index) ? "text-gray-400 line-through" : "text-gray-700"
                }`}>
                  {practice}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#0A1628] to-[#1a2a4a] rounded-xl p-5 text-center">
            <Download size={22} className="text-[#FF6B00] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-white mb-1">Compliance Guide</h3>
            <p className="text-[10px] text-white/60 mb-3">Download our complete FTC compliance handbook for affiliate marketers</p>
            <button
              onClick={() => {}}
              className="h-8 px-5 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <Download size={11} /> Download Guide
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-xs text-[#0A1628] mb-2 flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-500" /> Compliance Score
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-[#0A1628]">{Math.round((checkedItems.length / bestPractices.length) * 100)}%</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6B00] rounded-full transition-all duration-500"
                  style={{ width: `${(checkedItems.length / bestPractices.length) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-1">{checkedItems.length} of {bestPractices.length} practices checked</p>
          </div>
        </div>
      </div>
    </div>
  );
}
