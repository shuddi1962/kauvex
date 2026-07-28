"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Landmark } from "lucide-react";

interface Project {
  id: string;
  projectName: string;
  projectType: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  currencyCode: string;
  escrowAmount: number | null;
  totalMilestones: number;
  completedMilestones: number;
  createdAt: string;
  _count?: { bids: number };
}

const STATUS_OPTIONS = ["all", "posted", "receiving_bids", "contractor_selected", "in_progress", "completed", "cancelled", "disputed"];
const TYPE_OPTIONS = ["all", "residential_construction", "commercial_construction", "energy", "marine", "it_infrastructure", "industrial", "dredging", "agriculture"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProjects = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "15");

    fetch(`/api/v1/kpn/projects?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProjects(res.data.data || res.data || []);
          setTotalPages(res.data.totalPages || 1);
        }
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, [page, statusFilter, typeFilter]);

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      posted: "bg-gray-50 text-gray-700",
      receiving_bids: "bg-blue-50 text-blue-700",
      contractor_selected: "bg-violet-50 text-violet-700",
      in_progress: "bg-amber-50 text-amber-700",
      completed: "bg-green-50 text-green-700",
      cancelled: "bg-red-50 text-red-700",
      disputed: "bg-red-50 text-red-700",
    };
    return colors[status] || "bg-gray-50 text-gray-600";
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-kauvex-orange"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "all" ? "All Status" : s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="appearance-none h-10 pl-3 pr-8 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-kauvex-orange"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All Types" : t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-kauvex-navy">Escrow <ArrowUpDown size={11} /></button>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Milestones</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Bids</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No projects found</td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-kauvex-navy text-sm">{project.projectName}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{project.projectType.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {project.currencyCode} {project.budgetMin?.toLocaleString() || "—"} – {project.budgetMax?.toLocaleString() || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {project.escrowAmount ? (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Landmark size={13} className="text-kauvex-orange" />
                          {project.currencyCode} {project.escrowAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {project.completedMilestones}/{project.totalMilestones}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{project._count?.bids || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(project.status)}`}>
                        {project.status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-kauvex-navy" title="View details">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronLeft size={15} className="text-gray-500" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30">
              <ChevronRight size={15} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
