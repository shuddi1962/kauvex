"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, AlertTriangle, CheckCircle2, Building2, Sun, Ship,
  Monitor, Factory, Waves, Sprout, HardDrive, Users, Eye,
  ArrowRight, Calendar, DollarSign, FileText,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  open: "bg-green-50 text-green-700",
  reviewing: "bg-amber-50 text-amber-700",
  awarded: "bg-blue-50 text-blue-700",
  in_progress: "bg-violet-50 text-violet-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const TYPE_ICONS: Record<string, any> = {
  residential: Building2, commercial: Building2, energy: Sun,
  marine: Ship, "it-telecom": HardDrive, industrial: Factory,
  dredging: Waves, agriculture: Sprout,
};

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  budgetRange: string;
  location: string;
  milestonesCompleted: number;
  milestonesTotal: number;
  bidsCount: number;
  createdAt: string;
}

export default function MyProjectsPage() {
  const searchParams = useSearchParams();
  const created = searchParams.get("created");

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/kpn/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const json = await res.json();
      setProjects(json.data || json.projects || json || []);
    } catch {
      setProjects(getDemoProjects());
    } finally {
      setLoading(false);
    }
  };

  const getDemoProjects = (): Project[] => [
    {
      id: "1", name: "4-Bedroom Duplex in Lekki", type: "residential",
      status: "open", budgetRange: "₦50M - ₦100M", location: "Lekki Phase 1, Lagos",
      milestonesCompleted: 0, milestonesTotal: 6, bidsCount: 4, createdAt: "2026-07-20",
    },
    {
      id: "2", name: "Solar Mini-Grid for Estate", type: "energy",
      status: "reviewing", budgetRange: "₦20M - ₦50M", location: "Ibadan, Oyo",
      milestonesCompleted: 0, milestonesTotal: 4, bidsCount: 3, createdAt: "2026-07-18",
    },
    {
      id: "3", name: "CCTV Installation - 10-Storey Building", type: "it-telecom",
      status: "awarded", budgetRange: "₦5M - ₦20M", location: "Victoria Island, Lagos",
      milestonesCompleted: 1, milestonesTotal: 3, bidsCount: 6, createdAt: "2026-07-15",
    },
    {
      id: "4", name: "Commercial Poultry Farm", type: "agriculture",
      status: "in_progress", budgetRange: "₦20M - ₦50M", location: "Abeokuta, Ogun",
      milestonesCompleted: 3, milestonesTotal: 5, bidsCount: 5, createdAt: "2026-07-10",
    },
  ];

  const getTypeIcon = (type: string) => TYPE_ICONS[type] || FileText;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mx-auto mb-3" />
          <p className="text-gray-500">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-[#0A1628] transition-colors">Project Hub</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">My Projects</span>
        </div>
      </div>

      {created && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800">
              Project created successfully! We&apos;re analyzing your requirements and will notify you when bids start coming in.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1628]">My Projects</h1>
            <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <Link
            href="/projects/create"
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
          >
            New Project <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-[#0A1628] mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first project and get matched with top professionals.</p>
            <Link
              href="/projects/create"
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              Start a Project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const Icon = getTypeIcon(project.type);
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-soft hover:shadow-medium hover:border-[#FF6B00]/30 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[#FF6B00]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#0A1628] truncate group-hover:text-[#FF6B00] transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{project.type}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[project.status] || "bg-gray-100 text-gray-600"}`}>
                    {project.status.replace("_", " ")}
                  </span>

                  <div className="mt-4 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      {project.budgetRange}
                    </div>
                    {project.location && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {project.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      {project.bidsCount} bid{project.bidsCount !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Milestones</span>
                      <span className="font-semibold text-[#0A1628]">
                        {project.milestonesCompleted}/{project.milestonesTotal}
                      </span>
                    </div>
                    <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-[#FF6B00] h-1.5 rounded-full transition-all"
                        style={{
                          width: project.milestonesTotal > 0
                            ? `${(project.milestonesCompleted / project.milestonesTotal) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}