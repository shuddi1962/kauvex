"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, Plus, Loader2, MapPin,
  Clock, DollarSign, Users, Briefcase, Anchor,
  Building2, Tractor, Fuel, HardHat, Ship,
  Wrench, Oil, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const jobCategories = [
  {
    id: "marine", name: "Marine Crew", icon: Ship, color: "bg-blue-50 text-blue-600",
    roles: ["Captain", "Engineer", "Deck Hand", "Fishing Master", "Marine Technician"],
  },
  {
    id: "construction", name: "Construction", icon: Building2, color: "bg-orange-50 text-orange-600",
    roles: ["Site Manager", "Foreman", "Crane Operator", "Welder", "Electrician"],
  },
  {
    id: "oil-gas", name: "Oil & Gas", icon: Fuel, color: "bg-red-50 text-red-600",
    roles: ["Drilling Engineer", "Roughneck", "HSE Officer", "Pipeline Tech", "Geologist"],
  },
  {
    id: "industrial", name: "Industrial", icon: Wrench, color: "bg-purple-50 text-purple-600",
    roles: ["Plant Manager", "Maintenance Tech", "Quality Control", "Production Supervisor", "Logistics Coordinator"],
  },
  {
    id: "agriculture", name: "Agriculture", icon: Tractor, color: "bg-green-50 text-green-600",
    roles: ["Farm Manager", "Agronomist", "Equipment Operator", "Irrigation Specialist", "Livestock Tech"],
  },
];

const sampleJobs = [
  { id: "1", title: "Marine Chief Engineer", category: "Marine Crew", roleType: "Contract", company: "Kauvex Maritime", location: "Lagos, Nigeria", salary: "$6,000 - $8,000/mo", deadline: "2026-09-15", posted: "2d ago" },
  { id: "2", title: "Construction Site Manager", category: "Construction", roleType: "Permanent", company: "Julius Berger", location: "Abuja, Nigeria", salary: "$4,500 - $6,000/mo", deadline: "2026-08-30", posted: "1w ago" },
  { id: "3", title: "Drilling Engineer", category: "Oil & Gas", roleType: "Contract", company: "Shell Nigeria", location: "Port Harcourt, Nigeria", salary: "$8,000 - $12,000/mo", deadline: "2026-09-01", posted: "3d ago" },
  { id: "4", title: "Plant Maintenance Manager", category: "Industrial", roleType: "Permanent", company: "Dangote Cement", location: "Obajana, Nigeria", salary: "$5,000 - $7,000/mo", deadline: "2026-10-01", posted: "5d ago" },
  { id: "5", title: "Farm Operations Manager", category: "Agriculture", roleType: "Permanent", company: "Greenfields Agriculture", location: "Kaduna, Nigeria", salary: "$3,500 - $5,000/mo", deadline: "2026-09-20", posted: "1w ago" },
  { id: "6", title: "Welding Foreman", category: "Construction", roleType: "Freelance", company: "Lekki Freeport", location: "Lagos, Nigeria", salary: "$2,500 - $3,500/mo", deadline: "2026-08-25", posted: "4d ago" },
  { id: "7", title: "HSE Officer", category: "Oil & Gas", roleType: "Contract", company: "TotalEnergies", location: "Port Harcourt, Nigeria", salary: "$4,000 - $5,500/mo", deadline: "2026-09-10", posted: "6d ago" },
  { id: "8", title: "Crane Operator", category: "Construction", roleType: "Freelance", company: "CCECC Nigeria", location: "Abuja, Nigeria", salary: "$2,800 - $4,000/mo", deadline: "2026-09-05", posted: "2w ago" },
];

export default function WorkforcePage() {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredJobs = sampleJobs.filter((j) => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== "all" && j.category !== jobCategories.find((c) => c.id === activeCategory)?.name) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Workforce Marketplace</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">Workforce Marketplace</h1>
            <p className="text-gray-500 mt-1">Find skilled professionals for industrial and marine operations</p>
          </div>
          <Link href="/workforce/post">
            <Button>
              <Plus size={16} className="mr-2" /> Post a Job
            </Button>
          </Link>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies..."
            className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {jobCategories.map((cat) => {
            const Icon = cat.icon;
            const isExpanded = expandedCat === cat.id;
            return (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-[#0A1628]">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{cat.roles.length} role types</p>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-1 border-t border-gray-100 pt-3">
                    {cat.roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          activeCategory === cat.id ? "bg-[#FFF4EC] text-[#FF6B00] font-medium" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Jobs Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((j) => (
              <div key={j.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#0A1628]">{j.title}</h3>
                      <Badge variant={j.roleType === "Permanent" ? "navy" : j.roleType === "Contract" ? "warning" : "info"}>
                        {j.roleType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{j.company}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {j.location}</span>
                      <span className="flex items-center gap-1"><DollarSign size={14} /> {j.salary}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {j.posted}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Button size="sm">Apply Now</Button>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
