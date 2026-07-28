"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, Plus, Loader2, Clock,
  DollarSign, Building2, FileText, CheckCircle,
  AlertCircle, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  "All Categories",
  "Construction",
  "Marine",
  "Industrial",
  "Agriculture",
  "Security",
  "ICT",
  "Power & Energy",
  "Transportation",
];

const sampleTenders = [
  { id: "1", title: "Supply of 10 Excavators for Road Project", organization: "Federal Ministry of Works", category: "Construction", budget: "$2,500,000", deadline: "2026-09-15", status: "open", bids: 4 },
  { id: "2", title: "Marine Engine Maintenance Contract", organization: "Nigerian Ports Authority", category: "Marine", budget: "$850,000", deadline: "2026-08-30", status: "open", bids: 2 },
  { id: "3", title: "ICT Infrastructure Upgrade", organization: "Lagos State Government", category: "ICT", budget: "$1,200,000", deadline: "2026-10-01", status: "open", bids: 6 },
  { id: "4", title: "Agricultural Equipment Lease", organization: "Green Farms Ltd", category: "Agriculture", budget: "$350,000", deadline: "2026-08-20", status: "open", bids: 3 },
  { id: "5", title: "Power Generator Supply & Installation", organization: "Abuja Electricity Co", category: "Power & Energy", budget: "$1,800,000", deadline: "2026-09-01", status: "open", bids: 8 },
  { id: "6", title: "Security Systems Upgrade", organization: "Port Harcourt Airport", category: "Security", budget: "$600,000", deadline: "2026-09-10", status: "open", bids: 5 },
  { id: "7", title: "Fleet Maintenance Contract (Awarded)", organization: "Lagos BRT", category: "Transportation", budget: "$2,100,000", deadline: "2026-07-15", status: "awarded", bids: 12 },
  { id: "8", title: "Industrial Machinery Supply", organization: "Dangote Cement", category: "Industrial", budget: "$4,500,000", deadline: "2026-07-01", status: "awarded", bids: 9 },
];

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState("open");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  const filtered = sampleTenders.filter((t) => {
    if (activeTab === "open" && t.status !== "open") return false;
    if (activeTab === "awarded" && t.status !== "awarded") return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.organization.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All Categories" && t.category !== category) return false;
    return true;
  });

  const getDaysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days left` : "Closed";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/marketplace" className="hover:text-[#FF6B00]">Marketplace</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Procurement</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Procurement Marketplace</h1>
            <p className="text-gray-500 mt-1">Browse tenders, submit bids, win contracts</p>
          </div>
          <Link href="/marketplace/procurement/post">
            <Button>
              <Plus size={16} className="mr-2" /> Post a Tender
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "open", label: "Open Tenders" },
            { id: "awarded", label: "Awarded" },
            { id: "mybids", label: "My Bids" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#FF6B00] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#FF6B00]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenders..."
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {activeTab === "mybids" ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Bids Submitted</h3>
            <p className="text-sm text-gray-500 mb-6">You haven't submitted any bids yet. Browse open tenders to get started.</p>
            <Button onClick={() => setActiveTab("open")}>Browse Open Tenders</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Tenders Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => {
              const daysLeft = getDaysLeft(t.deadline);
              return (
                <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#0A1628]">{t.title}</h3>
                        <Badge variant={t.status === "open" ? "success" : "navy"}>{t.status}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1"><Building2 size={14} /> {t.organization}</span>
                        <span>{t.category}</span>
                        <span className="flex items-center gap-1"><DollarSign size={14} /> {t.budget}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {daysLeft}</span>
                        <span>{t.bids} bids</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      {t.status === "open" && activeTab === "open" && (
                        <Button size="sm">Submit Bid</Button>
                      )}
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
