"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  TrendingUp,
  Headphones,
  Package,
  Layers,
  Users,
  DollarSign,
  Megaphone,
  ClipboardCheck,
  Crown,
  Calculator,
  Wrench,
  Shield,
  Building2,
  Ship,
  Sun,
  Bot,
  Star,
  Download,
  Check,
  X,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Grid3X3,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Zap,
  PanelRightOpen,
  Briefcase,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, typeof Bot> = {
  TrendingUp,
  Headphones,
  Package,
  Layers,
  Users,
  DollarSign,
  Megaphone,
  ClipboardCheck,
  Crown,
  Calculator,
  Wrench,
  Shield,
  Building2,
  Ship,
  Sun,
  Bot,
};

type SkillCategory = "function" | "tool" | "industry-pack";
type SortOption = "popular" | "price-asc" | "price-desc" | "newest";

interface Skill {
  id: string;
  name: string;
  icon: string;
  category: SkillCategory;
  industry: string | null;
  description: string;
  shortDescription: string;
  price: number;
  rating: number;
  reviewCount: number;
  installCount: number;
  capabilities: string[];
  systemPrompt: string;
}

interface IndustryPack {
  id: string;
  name: string;
  icon: string;
  industry: string;
  description: string;
  price: number;
  skillCount: number;
  knowledgeBaseCount: number;
  skills: Skill[];
  gradient: string;
}

type ModalState =
  | { type: "skill"; skill: Skill }
  | { type: "pack"; pack: IndustryPack }
  | null;

const categoryTabs = [
  { id: "all", label: "All" },
  { id: "function", label: "Functions" },
  { id: "tool", label: "Tools" },
  { id: "industry-pack", label: "Industry Packs" },
] as const;

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

const starIcons = (rating: number) => {
  return Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={cn(
        "w-3 h-3",
        i < Math.floor(rating)
          ? "fill-amber-400 text-amber-400"
          : "fill-gray-200 text-gray-200"
      )}
    />
  ));
};

const packGradients: Record<string, string> = {
  Marine:
    "from-blue-500/20 via-cyan-500/10 to-blue-600/20 border-blue-500/30",
  Agriculture:
    "from-green-500/20 via-emerald-500/10 to-green-600/20 border-green-500/30",
  Construction:
    "from-amber-500/20 via-orange-500/10 to-amber-600/20 border-amber-500/30",
  "Solar Energy":
    "from-yellow-500/20 via-amber-500/10 to-yellow-600/20 border-yellow-500/30",
  "Oil & Gas":
    "from-red-500/20 via-orange-500/10 to-red-600/20 border-red-500/30",
  "Logistics & Transport":
    "from-orange-500/20 via-kauvex-orange/10 to-orange-600/20 border-kauvex-orange/30",
  Manufacturing:
    "from-violet-500/20 via-purple-500/10 to-violet-600/20 border-violet-500/30",
  Healthcare:
    "from-rose-500/20 via-pink-500/10 to-rose-600/20 border-rose-500/30",
  Technology:
    "from-blue-600/20 via-indigo-500/10 to-blue-700/20 border-blue-600/30",
  "Security & Surveillance":
    "from-slate-500/20 via-gray-500/10 to-slate-600/20 border-slate-500/30",
  "Dredging & Mining":
    "from-stone-500/20 via-amber-500/10 to-stone-600/20 border-stone-500/30",
  Education:
    "from-sky-500/20 via-blue-500/10 to-sky-600/20 border-sky-500/30",
};

const packIconColors: Record<string, string> = {
  Marine: "text-blue-500 bg-blue-50",
  Agriculture: "text-green-500 bg-green-50",
  Construction: "text-amber-500 bg-amber-50",
  "Solar Energy": "text-yellow-500 bg-yellow-50",
  "Oil & Gas": "text-red-500 bg-red-50",
  "Logistics & Transport": "text-kauvex-orange bg-kauvex-orange-tint",
  Manufacturing: "text-violet-500 bg-violet-50",
  Healthcare: "text-rose-500 bg-rose-50",
  Technology: "text-blue-600 bg-blue-50",
  "Security & Surveillance": "text-slate-500 bg-slate-100",
  "Dredging & Mining": "text-stone-500 bg-stone-100",
  Education: "text-sky-500 bg-sky-50",
};

const SkillIcon = ({ icon, className }: { icon: string; className?: string }) => {
  const IconComponent = iconMap[icon] || Bot;
  return <IconComponent className={className || "w-5 h-5"} />;
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-soft p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="h-6 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-100 rounded w-24" />
      </div>
    </div>
  );
}

export default function SkillMarketplacePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [packs, setPacks] = useState<IndustryPack[]>([]);
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("popular");
  const [showSort, setShowSort] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [packModalSkill, setPackModalSkill] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [skillsRes, packsRes, installedRes] = await Promise.all([
        fetch("/api/v1/kai/skills"),
        fetch("/api/v1/kai/packs"),
        fetch("/api/v1/kai/skills/installed"),
      ]);

      if (!skillsRes.ok) throw new Error("Failed to load skills");
      if (!packsRes.ok) throw new Error("Failed to load packs");

      const skillsData = await skillsRes.json();
      const packsData = await packsRes.json();
      let installedData: string[] = [];

      if (installedRes.ok) {
        const data = await installedRes.json();
        installedData = Array.isArray(data)
          ? data
          : data.ids || data.skills?.map((s: Skill) => s.id) || [];
      }

      setSkills(
        (Array.isArray(skillsData) ? skillsData : skillsData.skills || skillsData.data || []).map(
          (s: Skill) => ({
            ...s,
            rating: s.rating || 0,
            reviewCount: s.reviewCount || 0,
            installCount: s.installCount || 0,
            capabilities: s.capabilities || [],
            systemPrompt: s.systemPrompt || "",
            shortDescription: s.shortDescription || s.description || "",
          })
        )
      );
      setPacks(
        (Array.isArray(packsData) ? packsData : packsData.packs || packsData.data || []).map(
          (p: IndustryPack) => ({
            ...p,
            skills: p.skills || [],
            skillCount: p.skillCount || p.skills?.length || 0,
            knowledgeBaseCount: p.knowledgeBaseCount || 0,
            gradient: p.gradient || packGradients[p.industry] || "from-gray-500/20 via-gray-400/10 to-gray-600/20",
          })
        )
      );
      setInstalledIds(installedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketplace");
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (skillId: string) => {
    setInstalling(skillId);
    try {
      const res = await fetch("/api/v1/kai/skills/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId }),
      });

      if (!res.ok) throw new Error("Install failed");

      const data = await res.json();
      if (data.installed) {
        setInstalledIds((prev) => [...prev, skillId]);
      }
    } catch {
      setError("Failed to install skill. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setInstalling(null);
    }
  };

  const handlePurchasePack = async (packId: string) => {
    setPurchasingPack(packId);
    try {
      const res = await fetch(`/api/v1/kai/packs/${packId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Purchase failed");

      const data = await res.json();
      if (data.purchased) {
        if (data.skillIds) {
          setInstalledIds((prev) => [...new Set([...prev, ...data.skillIds])]);
        }
        setModal(null);
      }
    } catch {
      setError("Failed to purchase pack. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setPurchasingPack(null);
    }
  };

  const filteredSkills = useMemo(() => {
    let result = skills;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          (s.industry && s.industry.toLowerCase().includes(q))
      );
    }

    if (category !== "all") {
      if (category === "industry-pack") {
        return [];
      }
      result = result.filter((s) => s.category === category);
    }

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        break;
      default:
        result.sort((a, b) => b.installCount - a.installCount);
    }

    return result;
  }, [skills, search, category, sort]);

  const filteredPacks = useMemo(() => {
    let result = packs;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.industry.toLowerCase().includes(q)
      );
    }

    if (category !== "all" && category === "industry-pack") {
      return result;
    }

    if (category !== "all" && category !== "industry-pack") {
      return [];
    }

    if (search.trim() && category !== "industry-pack") {
      return result;
    }

    if (category !== "industry-pack" && !search.trim()) {
      return [];
    }

    return result;
  }, [packs, search, category]);

  const showIndustryPacks =
    category === "all" || category === "industry-pack";

  const handleModalBackdrop = () => {
    setModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kauvex-navy-tint to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12 animate-pulse">
            <div className="w-16 h-16 rounded-2xl bg-gray-200 mx-auto mb-4" />
            <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-3" />
            <div className="h-4 bg-gray-100 rounded w-[480px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && skills.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-kauvex-navy-tint to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-strong p-10 max-w-md mx-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-kauvex-navy mb-2">
            Failed to Load Marketplace
          </h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Button variant="orange" onClick={fetchData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const isInstalled = (id: string) => installedIds.includes(id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-kauvex-navy-tint to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0F2040] to-[#162040]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-kauvex-orange/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-kauvex-orange/3 blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kauvex-orange/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-kauvex-orange" />
              <span className="text-xs font-medium text-white/80">
                Extend Your AI Team
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight animate-slide-up">
              AI Employee
              <span className="bg-gradient-to-r from-kauvex-orange to-kauvex-orange-light bg-clip-text text-transparent"> Marketplace</span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in">
              Extend your KAI agents with specialized skills and industry
              knowledge. Browse, install, and deploy AI capabilities in one
              click.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto animate-slide-up">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/40" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills, industry packs, or capabilities..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/50 focus:border-kauvex-orange/50 transition-all backdrop-blur-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-gray-500">
              <span className="hidden sm:flex items-center gap-1.5">
                <Grid3X3 className="w-3.5 h-3.5" />
                <span className="font-medium text-kauvex-navy">{skills.length}</span>{" "}
                Skills
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="font-medium text-kauvex-navy">
                  {packs.length}
                </span>{" "}
                Packs
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span className="font-medium text-kauvex-navy">
                  {installedIds.length}
                </span>{" "}
                Installed
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-kauvex-navy transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {sortOptions.find((o) => o.value === sort)?.label || "Sort"}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-strong py-1 z-40 animate-fade-in">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value);
                        setShowSort(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm transition-colors",
                        sort === option.value
                          ? "text-kauvex-orange bg-kauvex-orange-tint font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 pb-3 overflow-x-auto scrollbar-none">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap",
                  category === tab.id
                    ? "bg-kauvex-navy text-white shadow-sm"
                    : "text-gray-500 hover:text-kauvex-navy hover:bg-gray-100"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Toast */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-slide-down">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Industry Packs Section */}
        {showIndustryPacks && packs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-kauvex-navy">
                  Industry Packs
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Curated skill bundles for your industry
                </p>
              </div>
              <Badge variant="premium" className="text-xs">
                Bundle & Save
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPacks.length === 0 && search.trim() ? (
                <div className="col-span-full text-center py-12">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No packs match your search
                  </p>
                </div>
              ) : (
                filteredPacks.map((pack) => {
                  const IconComponent = iconMap[pack.icon] || Building2;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setModal({ type: "pack", pack })}
                      className={cn(
                        "group relative bg-white rounded-xl border-2 p-5 text-left transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5 overflow-hidden",
                        pack.gradient
                      )}
                    >
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              packIconColors[pack.industry] || "bg-gray-100 text-gray-600"
                            )}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-kauvex-orange transition-colors" />
                        </div>

                        <h3 className="font-bold text-kauvex-navy mb-1">
                          {pack.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {pack.description}
                        </p>

                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full",
                              packIconColors[pack.industry] || "bg-gray-100 text-gray-600"
                            )}
                          >
                            {pack.industry}
                          </span>
                          <Badge variant="premium" className="text-[10px] px-1.5 py-0.5">
                            Pack
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {pack.skillCount} skills
                          </span>
                          {pack.knowledgeBaseCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              {pack.knowledgeBaseCount} KB
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-lg font-bold text-kauvex-navy">
                            ${pack.price.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            variant={isInstalled(pack.id) ? "success" : "orange"}
                            className="pointer-events-none"
                          >
                            {isInstalled(pack.id) ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Owned
                              </>
                            ) : (
                              "Get Pack"
                            )}
                          </Button>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Skills Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-kauvex-navy">
                {category === "industry-pack"
                  ? "Individual Skills"
                  : "Available Skills"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {filteredSkills.length} skill{filteredSkills.length !== 1 ? "s" : ""}
                {category !== "all" && ` in ${categoryTabs.find((t) => t.id === category)?.label}`}
              </p>
            </div>
          </div>

          {filteredSkills.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-kauvex-navy mb-1">
                No Skills Found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {search.trim()
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "No skills available in this category yet."}
              </p>
              {search.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSkills.map((skill) => {
                const IconComponent = iconMap[skill.icon] || Bot;
                const installed = isInstalled(skill.id);
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      "group bg-white rounded-xl border shadow-soft p-5 transition-all duration-300 hover:shadow-medium hover:-translate-y-0.5",
                      installed
                        ? "border-green-200/60"
                        : "border-gray-100"
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                          installed
                            ? "bg-green-50 text-green-600"
                            : "bg-kauvex-orange-tint text-kauvex-orange group-hover:bg-kauvex-orange/10"
                        )}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className="font-bold text-kauvex-navy text-sm truncate cursor-pointer hover:text-kauvex-orange transition-colors"
                            onClick={() => setModal({ type: "skill", skill })}
                          >
                            {skill.name}
                          </h3>
                          {installed && (
                            <Badge
                              variant="success"
                              className="text-[10px] px-1.5 py-0 gap-1 flex-shrink-0"
                            >
                              <Check className="w-2.5 h-2.5" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant={
                              skill.category === "function"
                                ? "orange"
                                : "navy"
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {skill.category === "function" ? "Function" : "Tool"}
                          </Badge>
                          {skill.industry && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              {skill.industry}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p
                      className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed cursor-pointer"
                      onClick={() => setModal({ type: "skill", skill })}
                    >
                      {skill.shortDescription || skill.description}
                    </p>

                    {/* Rating & Installs */}
                    <div className="flex items-center gap-3 mb-4">
                      {skill.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="flex">{starIcons(skill.rating)}</div>
                          <span className="text-[10px] text-gray-400 font-medium">
                            ({skill.reviewCount})
                          </span>
                        </div>
                      )}
                      <span className="text-[10px] text-gray-400 flex items-center gap-1 ml-auto">
                        <Download className="w-3 h-3" />
                        {skill.installCount.toLocaleString()}
                      </span>
                    </div>

                    {/* Price & Install */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <span className="font-bold text-kauvex-navy">
                          ${skill.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-0.5">
                          /mo
                        </span>
                      </div>
                      {installed ? (
                        <Button
                          size="sm"
                          variant="success"
                          className="gap-1 cursor-default"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Installed
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="orange"
                          loading={installing === skill.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstall(skill.id);
                          }}
                          className="gap-1 group-hover:shadow-md transition-shadow"
                        >
                          {installing === skill.id ? (
                            "Installing..."
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              Install
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Skill Detail Modal */}
      {modal?.type === "skill" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleModalBackdrop}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-modal max-w-lg w-full max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-kauvex-navy hover:bg-gray-200 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-kauvex-orange-tint flex items-center justify-center flex-shrink-0">
                  <SkillIcon icon={modal.skill.icon} className="w-7 h-7 text-kauvex-orange" />
                </div>
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="text-xl font-bold text-kauvex-navy">
                    {modal.skill.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant={
                        modal.skill.category === "function" ? "orange" : "navy"
                      }
                      className="text-xs"
                    >
                      {modal.skill.category === "function" ? "Function" : "Tool"}
                    </Badge>
                    {modal.skill.industry && (
                      <Badge variant="outline" className="text-xs">
                        {modal.skill.industry}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              {modal.skill.rating > 0 && (
                <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
                  <div className="flex">{starIcons(modal.skill.rating)}</div>
                  <span className="text-sm font-medium text-kauvex-navy">
                    {modal.skill.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({modal.skill.reviewCount} review{modal.skill.reviewCount !== 1 ? "s" : ""})
                  </span>
                  <span className="text-xs text-gray-300 mx-1">|</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {modal.skill.installCount.toLocaleString()} installs
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {modal.skill.description || modal.skill.shortDescription}
                </p>
              </div>

              {/* Capabilities */}
              {modal.skill.capabilities.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {modal.skill.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-full bg-kauvex-navy-tint text-kauvex-navy font-medium"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* System Prompt */}
              {modal.skill.systemPrompt && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    System Prompt Preview
                  </h4>
                  <div className="bg-kauvex-navy-tint rounded-xl p-4">
                    <pre className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">
                      {modal.skill.systemPrompt}
                    </pre>
                  </div>
                </div>
              )}

              {/* Price & Install */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div>
                  <span className="text-2xl font-bold text-kauvex-navy">
                    ${modal.skill.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 ml-0.5">/mo</span>
                </div>
                {isInstalled(modal.skill.id) ? (
                  <Button variant="success" className="gap-1.5" disabled>
                    <Check className="w-4 h-4" />
                    Installed
                  </Button>
                ) : (
                  <Button
                    variant="orange"
                    size="lg"
                    loading={installing === modal.skill.id}
                    onClick={() => handleInstall(modal.skill.id)}
                    className="gap-1.5 min-w-[130px]"
                  >
                    {installing === modal.skill.id ? (
                      "Installing..."
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Install Skill
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Industry Pack Modal */}
      {modal?.type === "pack" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleModalBackdrop}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-modal max-w-lg w-full max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-kauvex-navy hover:bg-gray-200 transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className={cn(
                "p-6 rounded-t-2xl border-b",
                modal.pack.gradient
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                    packIconColors[modal.pack.industry] || "bg-gray-100 text-gray-600"
                  )}
                >
                  <SkillIcon icon={modal.pack.icon} className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-kauvex-navy">
                    {modal.pack.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        packIconColors[modal.pack.industry] || "bg-gray-100 text-gray-600"
                      )}
                    >
                      {modal.pack.industry}
                    </span>
                    <Badge variant="premium" className="text-xs">
                      Industry Pack
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {modal.pack.description}
              </p>

              {/* Stats */}
              <div className="flex gap-4 mb-5">
                <div className="flex-1 bg-kauvex-navy-tint rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-kauvex-navy">
                    {modal.pack.skillCount}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Skills Included
                  </div>
                </div>
                <div className="flex-1 bg-kauvex-navy-tint rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-kauvex-navy">
                    {modal.pack.knowledgeBaseCount}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Knowledge Bases
                  </div>
                </div>
              </div>

              {/* Included Skills */}
              {modal.pack.skills.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Included Skills
                  </h4>
                  <div className="space-y-2">
                    {modal.pack.skills.map((skill) => {
                      const Icon = iconMap[skill.icon] || Bot;
                      return (
                        <div
                          key={skill.id}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-kauvex-navy-tint group cursor-pointer hover:bg-kauvex-orange-tint transition-colors"
                          onClick={() => setPackModalSkill(packModalSkill === skill.id ? null : skill.id)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-kauvex-navy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-kauvex-navy truncate">
                              {skill.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {skill.description?.slice(0, 60)}
                            </div>
                          </div>
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price & Purchase */}
              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div>
                  <span className="text-2xl font-bold text-kauvex-navy">
                    ${modal.pack.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 ml-0.5">/mo</span>
                </div>
                <Button
                  variant="orange"
                  size="lg"
                  loading={purchasingPack === modal.pack.id}
                  onClick={() => handlePurchasePack(modal.pack.id)}
                  className="gap-1.5 min-w-[140px]"
                >
                  {purchasingPack === modal.pack.id ? (
                    "Processing..."
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Purchase Pack
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click-outside close for sort dropdown */}
      {showSort && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowSort(false)}
        />
      )}
    </div>
  );
}
