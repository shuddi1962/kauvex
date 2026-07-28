"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight, Search, MapPin, Clock, DollarSign,
  Star, Briefcase, Building2, Ship, Wrench,
  Tractor, Fuel, HardHat, Phone, Mail,
  CheckCircle, Award, Filter, X, SlidersHorizontal,
  Users, BookOpen, Shield, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Professional {
  id: string;
  name: string;
  title: string;
  avatar: string;
  category: string;
  skills: string[];
  location: string;
  availability: "available" | "busy" | "unavailable";
  rating: number;
  reviewCount: number;
  hourlyRate: string;
  experience: string;
  credentials: string[];
  serviceAreas: string[];
  bio: string;
  featured: boolean;
}

const categories = [
  { id: "marine", name: "Marine & Offshore", icon: Ship, count: 128 },
  { id: "construction", name: "Construction & Civil", icon: HardHat, count: 245 },
  { id: "industrial", name: "Industrial & Manufacturing", icon: Wrench, count: 192 },
  { id: "oil-gas", name: "Oil & Gas", icon: Fuel, count: 87 },
  { id: "agriculture", name: "Agriculture & Farming", icon: Tractor, count: 64 },
  { id: "engineering", name: "Engineering & Design", icon: Building2, count: 156 },
];

const professionals: Professional[] = [
  {
    id: "p1", name: "Capt. Adewale Ogunlade", title: "Marine Chief Engineer",
    avatar: "AO", category: "Marine & Offshore",
    skills: ["Vessel Maintenance", "Engine Overhaul", "Safety Compliance", "Crew Management", "Survey & Inspection"],
    location: "Lagos, Nigeria", availability: "available",
    rating: 4.9, reviewCount: 43, hourlyRate: "₦85,000/hr",
    experience: "18 years",
    credentials: ["Chief Engineer COC (Class 1)", "STCW VI/6", "IMO 2010", "BSc Marine Engineering"],
    serviceAreas: ["Lagos", "Port Harcourt", "Warri", "Onne"],
    bio: "Class 1 Chief Engineer with extensive experience on offshore support vessels, tankers, and bulk carriers. Specializes in engine room management and dry-dock supervision.",
    featured: true
  },
  {
    id: "p2", name: "Engr. Funmi Adeyemi", title: "Structural Engineer",
    avatar: "FA", category: "Engineering & Design",
    skills: ["Structural Analysis", "AutoCAD", "Revit", "Steel Design", "Bridge Engineering"],
    location: "Abuja, Nigeria", availability: "available",
    rating: 4.8, reviewCount: 37, hourlyRate: "₦65,000/hr",
    experience: "12 years",
    credentials: ["COREN Registered", "NSE Member", "MSc Structural Engineering", "PMP Certified"],
    serviceAreas: ["Abuja", "Lagos", "Kaduna", "Enugu"],
    bio: "COREN-registered structural engineer with expertise in multi-story buildings, bridges, and industrial steel structures. Led design teams on 20+ major projects.",
    featured: true
  },
  {
    id: "p3", name: "Ibrahim Danjuma", title: "Project Manager - Oil & Gas",
    avatar: "ID", category: "Oil & Gas",
    skills: ["Project Planning", "Risk Management", "HSE", "P6 Primavera", "Contract Management"],
    location: "Port Harcourt, Nigeria", availability: "busy",
    rating: 4.7, reviewCount: 29, hourlyRate: "₦95,000/hr",
    experience: "15 years",
    credentials: ["PMP", "PRINCE2 Practitioner", "NEBOSH IGC", "BSc Petroleum Engineering"],
    serviceAreas: ["Port Harcourt", "Lagos", "Abuja", "Warri"],
    bio: "Experienced project manager in upstream oil & gas. Managed EPCI projects up to $200M with major IOCs. PMP and PRINCE2 certified.",
    featured: true
  },
  {
    id: "p4", name: "Chioma Eze", title: "Construction Site Manager",
    avatar: "CE", category: "Construction & Civil",
    skills: ["Site Supervision", "Quality Control", "Budget Management", "Team Leadership", "HSE Compliance"],
    location: "Lagos, Nigeria", availability: "available",
    rating: 4.8, reviewCount: 52, hourlyRate: "₦55,000/hr",
    experience: "10 years",
    credentials: ["COREN Registered", "MNSE", "IOSH Managing Safely", "BSc Civil Engineering"],
    serviceAreas: ["Lagos", "Ibadan", "Abeokuta", "Benin"],
    bio: "COREN-registered civil engineer and site manager with 10 years experience delivering commercial and residential projects on time and within budget.",
    featured: true
  },
  {
    id: "p5", name: "Dr. Segun Williams", title: "Agronomist & Farm Manager",
    avatar: "SW", category: "Agriculture & Farming",
    skills: ["Crop Science", "Irrigation Design", "Farm Planning", "Soil Analysis", "Supply Chain"],
    location: "Kaduna, Nigeria", availability: "available",
    rating: 4.6, reviewCount: 21, hourlyRate: "₦45,000/hr",
    experience: "14 years",
    credentials: ["PhD Agronomy", "Certified Farm Manager", "Irrigation Association", "MSc Soil Science"],
    serviceAreas: ["Kaduna", "Kano", "Jos", "Abuja"],
    bio: "PhD agronomist specializing in large-scale farming operations, irrigation systems, and sustainable agriculture. Manages 500-hectare commercial farm.",
    featured: false
  },
  {
    id: "p6", name: "Emeka Okonkwo", title: "Industrial Maintenance Manager",
    avatar: "EO", category: "Industrial & Manufacturing",
    skills: ["Predictive Maintenance", "PLC Programming", "Root Cause Analysis", "CMMS", "Lean Six Sigma"],
    location: "Ogun, Nigeria", availability: "available",
    rating: 4.5, reviewCount: 18, hourlyRate: "₦60,000/hr",
    experience: "11 years",
    credentials: ["Lean Six Sigma Black Belt", "Certified Maintenance Manager", "HND Mechanical Eng"],
    serviceAreas: ["Ogun", "Lagos", "Ibadan", "Benin"],
    bio: "Maintenance professional with expertise in FMCG and pharmaceutical manufacturing. Black Belt certified with a track record of reducing downtime by 40%.",
    featured: false
  },
  {
    id: "p7", name: "Yetunde Bello", title: "HSE Advisor",
    avatar: "YB", category: "Oil & Gas",
    skills: ["HSE Auditing", "ISO 45001", "Incident Investigation", "Risk Assessment", "Emergency Response"],
    location: "Lagos, Nigeria", availability: "unavailable",
    rating: 4.7, reviewCount: 33, hourlyRate: "₦50,000/hr",
    experience: "9 years",
    credentials: ["NEBOSH Diploma", "ISO 45001 Lead Auditor", "First Aid Instructor", "BSc Environmental Science"],
    serviceAreas: ["Lagos", "Port Harcourt", "Abuja", "Warri"],
    bio: "NEBOSH Diploma holder with oil & gas, construction, and manufacturing HSE experience. Lead auditor for ISO 45001 management systems.",
    featured: false
  },
  {
    id: "p8", name: "Olusegun Akinola", title: "Welding Engineer / NDT Specialist",
    avatar: "OA", category: "Construction & Civil",
    skills: ["SMAW/GTAW/GMAW", "NDT (UT/RT/MT)", "WPS/PQR", "Pipe Welding", "Structural Steel"],
    location: "Port Harcourt, Nigeria", availability: "available",
    rating: 4.9, reviewCount: 47, hourlyRate: "₦70,000/hr",
    experience: "16 years",
    credentials: ["CSWIP 3.1", "ASNT Level III", "API 1104", "AWS Certified Welding Inspector"],
    serviceAreas: ["Port Harcourt", "Lagos", "Warri", "Eket"],
    bio: "CSWIP 3.1 certified welding inspector with 16 years in oil & gas pipeline and structural welding. ASNT Level III in UT, RT, MT.",
    featured: true
  },
  {
    id: "p9", name: "Aisha Mohammed", title: "Marine Surveyor",
    avatar: "AM", category: "Marine & Offshore",
    skills: ["Cargo Survey", "Hull & Machinery", "IMO Compliance", "Draft Surveys", "Insurance Survey"],
    location: "Lagos, Nigeria", availability: "available",
    rating: 4.6, reviewCount: 25, hourlyRate: "₦75,000/hr",
    experience: "13 years",
    credentials: ["IIMS Accredited", "BSc Nautical Science", "MLC Inspector", "ISM Auditor"],
    serviceAreas: ["Lagos", "Onne", "Warri", "Calabar"],
    bio: "IIMS-accredited marine surveyor with expertise in cargo, hull & machinery, and condition surveys for P&I clubs and underwriters.",
    featured: false
  },
];

const availabilityColors = {
  available: "text-green-600 bg-green-50",
  busy: "text-orange-500 bg-orange-50",
  unavailable: "text-red-500 bg-red-50",
};

export default function WorkforcePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "busy" | "unavailable">("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "experience" | "rate">("rating");
  const [expandedBio, setExpandedBio] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    professionals.forEach((p) => p.skills.forEach((s) => skills.add(s)));
    return Array.from(skills).sort();
  }, []);

  const allLocations = useMemo(() => {
    const locs = new Set<string>();
    professionals.forEach((p) => {
      p.serviceAreas.forEach((a) => locs.add(a));
    });
    return Array.from(locs).sort();
  }, []);

  const filteredPros = useMemo(() => {
    let list = [...professionals];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)) ||
        p.location.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === categories.find((c) => c.id === activeCategory)?.name);
    }
    if (selectedSkills.length > 0) {
      list = list.filter((p) => selectedSkills.every((s) => p.skills.includes(s)));
    }
    if (availabilityFilter !== "all") {
      list = list.filter((p) => p.availability === availabilityFilter);
    }
    if (locationFilter !== "all") {
      list = list.filter((p) => p.serviceAreas.includes(locationFilter));
    }
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "experience") list.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    if (sortBy === "rate") {
      list.sort((a, b) => {
        const ra = parseInt(a.hourlyRate.replace(/[^0-9]/g, ""));
        const rb = parseInt(b.hourlyRate.replace(/[^0-9]/g, ""));
        return ra - rb;
      });
    }
    return list;
  }, [search, activeCategory, selectedSkills, availabilityFilter, locationFilter, sortBy]);

  const featuredPros = professionals.filter((p) => p.featured);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setActiveCategory("all");
    setSelectedSkills([]);
    setAvailabilityFilter("all");
    setLocationFilter("all");
    setSearch("");
  };

  const hasActiveFilters = activeCategory !== "all" || selectedSkills.length > 0 || availabilityFilter !== "all" || locationFilter !== "all";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#FF6B00]">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A1628] font-medium">Workforce Marketplace</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0A1628] to-[#162040] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-3xl">
            <div className="w-14 h-14 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center mb-4">
              <Users size={28} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Workforce Marketplace</h1>
            <p className="text-gray-300 text-lg">
              Connect with verified KPN professionals across marine, construction,
              oil & gas, industrial, and agriculture sectors.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, title, skill, or location..."
                className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value as typeof availabilityFilter)}
                  className="h-11 px-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00] appearance-none"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative hidden sm:block">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-11 px-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#FF6B00] appearance-none"
                >
                  <option value="all">All Locations</option>
                  {allLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter size={14} />
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Filters:</span>
              {activeCategory !== "all" && (
                <Badge variant="orange" className="cursor-pointer" onClick={() => setActiveCategory("all")}>
                  {categories.find((c) => c.id === activeCategory)?.name} <X size={10} className="ml-1" />
                </Badge>
              )}
              {selectedSkills.map((s) => (
                <Badge key={s} variant="info" className="cursor-pointer" onClick={() => toggleSkill(s)}>
                  {s} <X size={10} className="ml-1" />
                </Badge>
              ))}
              {availabilityFilter !== "all" && (
                <Badge variant="navy" className="cursor-pointer" onClick={() => setAvailabilityFilter("all")}>
                  {availabilityFilter} <X size={10} className="ml-1" />
                </Badge>
              )}
              {locationFilter !== "all" && (
                <Badge variant="warning" className="cursor-pointer" onClick={() => setLocationFilter("all")}>
                  {locationFilter} <X size={10} className="ml-1" />
                </Badge>
              )}
              <button onClick={clearFilters} className="text-xs text-[#FF6B00] hover:underline ml-2">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {!search && activeCategory === "all" && selectedSkills.length === 0 && availabilityFilter === "all" && locationFilter === "all" && (
          <>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(isActive ? "all" : cat.id)}
                    className={`bg-white rounded-xl border p-4 text-center hover:shadow-sm transition-all ${
                      isActive ? "border-[#FF6B00] ring-2 ring-[#FF6B00]/20" : "border-gray-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center ${
                      isActive ? "bg-[#FF6B00] text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                      <Icon size={20} />
                    </div>
                    <p className="text-xs font-medium text-[#0A1628]">{cat.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{cat.count} pros</p>
                  </button>
                );
              })}
            </div>

            <h2 className="text-xl font-bold text-[#0A1628] mb-4 flex items-center gap-2">
              <Award size={18} className="text-[#FF6B00]" /> Featured Professionals
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {featuredPros.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {p.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm text-[#0A1628] truncate">{p.name}</p>
<Badge variant="orange">Featured</Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{p.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {p.location}</span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" /> {p.rating}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.skills.slice(0, 4).map((s) => (
                      <span key={s} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{p.experience} exp</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      availabilityColors[p.availability]
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        p.availability === "available" ? "bg-green-500" :
                        p.availability === "busy" ? "bg-orange-500" : "bg-red-500"
                      }`} />
                      {p.availability.charAt(0).toUpperCase() + p.availability.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0A1628]">
              {activeCategory !== "all"
                ? categories.find((c) => c.id === activeCategory)?.name
                : "All Professionals"}
            </h2>
            <p className="text-sm text-gray-400">{filteredPros.length} professional{filteredPros.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort:</span>
            {(["rating", "experience", "rate"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === s ? "bg-[#0A1628] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s === "rating" ? "Rating" : s === "experience" ? "Experience" : "Rate (Low)"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <div className={`lg:w-56 shrink-0 space-y-4 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {allSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                      selectedSkills.includes(skill)
                        ? "bg-[#FFF4EC] text-[#FF6B00] font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Availability</h3>
              <div className="space-y-1">
                {(["available", "busy", "unavailable"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAvailabilityFilter(availabilityFilter === a ? "all" : a)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                      availabilityFilter === a
                        ? "bg-[#FFF4EC] text-[#FF6B00] font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Service Areas</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {allLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocationFilter(locationFilter === loc ? "all" : loc)}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all ${
                      locationFilter === loc
                        ? "bg-[#FFF4EC] text-[#FF6B00] font-medium"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {filteredPros.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#0A1628] mb-2">No Professionals Found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search.</p>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              filteredPros.map((p) => {
                const isExpanded = expandedBio === p.id;
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full bg-[#0A1628] text-white flex items-center justify-center text-lg font-bold shrink-0">
                          {p.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-[#0A1628]">{p.name}</h3>
                            {p.featured && <Badge variant="orange">Featured</Badge>}
                          </div>
                          <p className="text-sm text-gray-500">{p.title}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {p.location}</span>
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" /> {p.rating}
                              <span className="text-gray-300">({p.reviewCount})</span>
                            </span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {p.experience}</span>
                            <span className="flex items-center gap-1 font-medium text-[#FF6B00]">
                              <DollarSign size={12} /> {p.hourlyRate}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {p.skills.map((s) => (
                              <span key={s} className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{s}</span>
                            ))}
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              {isExpanded ? p.bio : p.bio.slice(0, 100) + "..."}
                              <button
                                onClick={() => setExpandedBio(isExpanded ? null : p.id)}
                                className="text-[#FF6B00] hover:underline ml-1"
                              >
                                {isExpanded ? "Show less" : "Read more"}
                              </button>
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2.5">
                            <div className="flex items-center gap-1">
                              <Award size={12} className="text-orange-500" />
                              <span className="text-[11px] text-gray-400">Credentials: </span>
                            </div>
                            {p.credentials.map((c) => (
                              <span key={c} className="inline-flex items-center gap-0.5 text-[10px] text-[#0A1628] bg-gray-50 px-1.5 py-0.5 rounded font-medium">
                                <CheckCircle size={8} className="text-green-500" /> {c}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-2 text-[11px] text-gray-400">
                            <Briefcase size={11} />
                            Service areas: {p.serviceAreas.join(", ")}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-2 lg:min-w-[140px] shrink-0">
                        <span className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          availabilityColors[p.availability]
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.availability === "available" ? "bg-green-500" :
                            p.availability === "busy" ? "bg-orange-500" : "bg-red-500"
                          }`} />
                          {p.availability.charAt(0).toUpperCase() + p.availability.slice(1)}
                        </span>
                        <Button size="sm" className="w-full">
                          <BookOpen size={14} className="mr-1.5" /> Book Now
                        </Button>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Phone size={14} />
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Mail size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
