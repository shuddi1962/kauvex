"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, AlertTriangle, CheckCircle2, Building2, Clock, DollarSign,
  Users, FileText, MessageSquare, Calendar, ClipboardList, PenSquare,
  Send, Eye, Plus, Download, ChevronRight, MapPin, Shield,
} from "lucide-react";

interface Project {
  id: string; name: string; type: string; status: string; budgetRange: string;
  location: string; description: string; startDate: string; endDate: string;
  milestones: { name: string; completed: boolean }[];
  bids: {
    id: string; companyName: string; amount: string; proposedStart: string;
    proposedEnd: string; status: string; methodology: string;
  }[];
  materials: { name: string; quantity: string; estimatedCost: string }[];
}

const TABS = ["Documents", "RFIs", "Site Diary", "Variation Orders", "Milestone Tracker"];

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/kpn/projects/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      const json = await res.json();
      setProject(json.data || json);
    } catch {
      setProject({
        id: params.id as string, name: "4-Bedroom Duplex in Lekki",
        type: "residential", status: "open", budgetRange: "₦50M - ₦100M",
        location: "Lekki Phase 1, Lagos, Nigeria",
        description: "Construction of a modern 4-bedroom duplex with a swimming pool, parking for 3 cars, and landscaped garden.",
        startDate: "2026-09-01", endDate: "2027-06-30",
        milestones: [
          { name: "Foundation", completed: false },
          { name: "Superstructure", completed: false },
          { name: "Roofing", completed: false },
          { name: "MEP Installation", completed: false },
          { name: "Finishing", completed: false },
          { name: "Handover", completed: false },
        ],
        bids: [
          { id: "b1", companyName: "BuildRight Construction Ltd", amount: "₦68,500,000", proposedStart: "2026-09-15", proposedEnd: "2027-08-30", status: "pending", methodology: "Reinforced concrete frame with sandcrete block infill walls. All materials sourced locally." },
          { id: "b2", companyName: "Sturdy Homes Nigeria Ltd", amount: "₦72,000,000", proposedStart: "2026-10-01", proposedEnd: "2027-09-15", status: "pending", methodology: "Insulated concrete form (ICF) construction for superior thermal efficiency." },
          { id: "b3", companyName: "Premium Developers Ltd", amount: "₦65,000,000", proposedStart: "2026-09-01", proposedEnd: "2027-07-31", status: "shortlisted", methodology: "Traditional block work with reinforced columns and beams." },
          { id: "b4", companyName: "EcoStruct Builders", amount: "₦59,800,000", proposedStart: "2026-12-01", proposedEnd: "2027-11-30", status: "pending", methodology: "Sustainable materials with solar-ready infrastructure." },
        ],
        materials: [
          { name: "Reinforced Steel (16mm)", quantity: "2,500 kg", estimatedCost: "₦1,875,000" },
          { name: "Portland Cement (Grade 42.5)", quantity: "850 bags", estimatedCost: "₦4,250,000" },
          { name: "Sharp Sand", quantity: "1,200 tonnes", estimatedCost: "₦2,400,000" },
          { name: "Granite Chippings (3/4\")", quantity: "900 tonnes", estimatedCost: "₦2,700,000" },
          { name: "PVC Conduit Pipes (20mm)", quantity: "500 lengths", estimatedCost: "₦350,000" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAward = async (bidId: string) => {
    try {
      await fetch(`/api/v1/kpn/projects/${params.id}/bids/${bidId}/award`, { method: "POST" });
      alert("Bid awarded successfully!");
      fetchProject();
    } catch {
      alert("Failed to award bid. Please try again.");
    }
  };

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-600", open: "bg-green-50 text-green-700",
      reviewing: "bg-amber-50 text-amber-700", awarded: "bg-blue-50 text-blue-700",
      in_progress: "bg-violet-50 text-violet-700", completed: "bg-emerald-50 text-emerald-700",
      cancelled: "bg-red-50 text-red-700",
    };
    return colors[s] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00] mx-auto mb-3" />
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-[#0A1628] transition-colors">Project Hub</Link>
          <span>/</span>
          <Link href="/projects/my-projects" className="hover:text-[#0A1628] transition-colors">My Projects</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium truncate max-w-[200px]">{project.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#0A1628]">{project.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor(project.status)}`}>
                  {project.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-gray-500 capitalize mb-4">{project.type} &bull; {project.location}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/projects/${params.id}/bid`}
                className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                <Send className="w-4 h-4" /> Submit a Bid
              </Link>
              <button className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-[#0A1628] font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Budget Range</p>
              <p className="font-semibold text-[#0A1628] mt-0.5">{project.budgetRange}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Timeline</p>
              <p className="font-semibold text-[#0A1628] mt-0.5">{project.startDate} &rarr; {project.endDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Bids Received</p>
              <p className="font-semibold text-[#0A1628] mt-0.5">{project.bids.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Milestones</p>
              <p className="font-semibold text-[#0A1628] mt-0.5">{project.milestones.filter(m => m.completed).length}/{project.milestones.length}</p>
            </div>
          </div>

          {project.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-bold text-[#0A1628] mb-4">Project Timeline</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Start:</span>
                  <span className="font-semibold text-[#0A1628]">{project.startDate}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">End:</span>
                  <span className="font-semibold text-[#0A1628]">{project.endDate}</span>
                </div>
              </div>
            </div>

            {/* Bids */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#0A1628]">Bids</h2>
                <Link href={`/projects/${params.id}/bid`} className="text-xs font-semibold text-[#FF6B00] hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Submit Bid
                </Link>
              </div>
              {project.bids.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No bids yet. Be the first to submit.</p>
              ) : (
                <div className="space-y-3">
                  {project.bids.map((bid) => (
                    <div key={bid.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#0A1628]">{bid.companyName}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bid.status === "shortlisted" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                              {bid.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{bid.proposedStart} &rarr; {bid.proposedEnd}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{bid.methodology}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-[#0A1628]">{bid.amount}</p>
                          {bid.status !== "awarded" && (
                            <button
                              onClick={() => handleAward(bid.id)}
                              className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-all"
                            >
                              Award
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-bold text-[#0A1628] mb-3">Milestone Progress</h2>
              <div className="space-y-2">
                {project.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {m.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                    )}
                    <span className={m.completed ? "text-green-700" : "text-gray-500"}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="font-bold text-[#0A1628] mb-3">Material List</h2>
              <div className="space-y-2">
                {project.materials.map((mat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-[#0A1628] font-medium">{mat.name}</p>
                      <p className="text-xs text-gray-500">{mat.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[#0A1628]">{mat.estimatedCost}</p>
                  </div>
                ))}
              </div>
              <button className="mt-3 w-full text-xs font-semibold text-[#FF6B00] hover:underline flex items-center justify-center gap-1">
                <Download className="w-3 h-3" /> Download Full BOQ
              </button>
            </div>
          </div>
        </div>

        {/* Digital Project Room */}
        <div className="mt-8">
          <h2 className="font-bold text-xl text-[#0A1628] mb-4">Digital Project Room</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto border-b border-gray-200 hide-scrollbar">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`shrink-0 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                    activeTab === i
                      ? "text-[#FF6B00] border-[#FF6B00]"
                      : "text-gray-500 border-transparent hover:text-[#0A1628]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No documents uploaded yet.</p>
                  <button className="mt-3 text-sm font-semibold text-[#FF6B00] hover:underline flex items-center gap-1 justify-center">
                    <Plus className="w-4 h-4" /> Upload Document
                  </button>
                </div>
              )}
              {activeTab === 1 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No RFIs yet. Submit a request for information.</p>
                  <button className="mt-3 text-sm font-semibold text-[#FF6B00] hover:underline flex items-center gap-1 justify-center">
                    <Plus className="w-4 h-4" /> New RFI
                  </button>
                </div>
              )}
              {activeTab === 2 && (
                <div className="text-center py-8">
                  <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Site diary entries will appear once construction begins.</p>
                </div>
              )}
              {activeTab === 3 && (
                <div className="text-center py-8">
                  <PenSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No variation orders yet.</p>
                  <button className="mt-3 text-sm font-semibold text-[#FF6B00] hover:underline flex items-center gap-1 justify-center">
                    <Plus className="w-4 h-4" /> Create Variation Order
                  </button>
                </div>
              )}
              {activeTab === 4 && (
                <div>
                  <div className="space-y-2">
                    {project.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          {m.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                          <span className="font-medium text-sm text-[#0A1628]">{m.name}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.completed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                          {m.completed ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Share2(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
