"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, AlertTriangle, CheckCircle2, Building2, Clock, DollarSign,
  Users, FileText, MessageSquare, Calendar, ClipboardList, PenSquare,
  Send, Eye, Plus, Download, ChevronRight, MapPin, Shield, Sun, Cloud,
  CloudRain, HelpCircle, Target, UserCheck, FileCheck, FileX, Edit3,
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

  // RFIs
  const [rfis, setRfis] = useState([
    { id: "rfi1", question: "Confirm soil bearing capacity for foundation design", scope: "Foundation", priority: "high", status: "answered", submittedBy: "Eng. Adebayo", date: "2026-09-10", answer: "Soil test report shows 180 kN/m² capacity. Design accordingly." },
    { id: "rfi2", question: "Provide structural steel specification for mezzanine floor", scope: "Superstructure", priority: "medium", status: "open", submittedBy: "Site Engineer", date: "2026-09-15", answer: "" },
    { id: "rfi3", question: "Clarify MEP routing for ground floor HVAC ducts", scope: "MEP Installation", priority: "low", status: "closed", submittedBy: "MEP Contractor", date: "2026-09-08", answer: "Ducts to run through ceiling void as per drawing MEP-03 rev B." },
  ]);
  const [rfiQuestion, setRfiQuestion] = useState("");
  const [rfiScope, setRfiScope] = useState("General");
  const [rfiPriority, setRfiPriority] = useState("medium");

  // Site Diary
  const [diaryEntries, setDiaryEntries] = useState([
    { id: "de1", date: "2026-09-12", weather: "sunny", workDescription: "Site clearing and excavation for foundation footings", workforceCount: 18, equipment: "1 excavator, 2 dump trucks", issues: "Delayed cement delivery by 2 hours" },
    { id: "de2", date: "2026-09-13", weather: "cloudy", workDescription: "Foundation trench excavation and reinforcement placement", workforceCount: 22, equipment: "1 excavator, 1 concrete mixer", issues: "Minor water ingress in trench" },
    { id: "de3", date: "2026-09-14", weather: "rainy", workDescription: "Limited work - site drainage improvement", workforceCount: 8, equipment: "Hand tools only", issues: "Heavy rainfall, work suspended from 2pm" },
  ]);
  const [diaryForm, setDiaryForm] = useState({ date: new Date().toISOString().split('T')[0], weather: "sunny", workDescription: "", workforceCount: "", equipment: "", issues: "" });

  // Variation Orders
  const [vos, setVos] = useState([
    { id: "vo1", voNumber: "VO-001", description: "Additional bathroom window (en-suite)", costImpact: "₦180,000", scheduleImpact: "+3 days", status: "approved", submittedBy: "Client", date: "2026-09-11", approvalDate: "2026-09-13" },
    { id: "vo2", voNumber: "VO-002", description: "Upgrade kitchen countertop to granite", costImpact: "₦450,000", scheduleImpact: "+5 days", status: "draft", submittedBy: "Architect", date: "2026-09-14", approvalDate: "" },
    { id: "vo3", voNumber: "VO-003", description: "Relocate electrical panel to utility room", costImpact: "₦95,000", scheduleImpact: "+1 day", status: "rejected", submittedBy: "Contractor", date: "2026-09-10", approvalDate: "" },
  ]);
  const [voDescription, setVoDescription] = useState("");
  const [voCostImpact, setVoCostImpact] = useState("");
  const [voScheduleImpact, setVoScheduleImpact] = useState("");

  // Milestone Tracker
  const [detailedMilestones, setDetailedMilestones] = useState([
    { id: "ms1", name: "Foundation", plannedDate: "2026-09-30", actualDate: "", status: "in_progress", completion: 45, assignedContractor: "BuildRight Construction Ltd", notes: "Excavation completed. Reinforcement in progress." },
    { id: "ms2", name: "Superstructure", plannedDate: "2026-12-15", actualDate: "", status: "not_started", completion: 0, assignedContractor: "", notes: "" },
    { id: "ms3", name: "Roofing", plannedDate: "2027-02-28", actualDate: "", status: "not_started", completion: 0, assignedContractor: "", notes: "" },
    { id: "ms4", name: "MEP Installation", plannedDate: "2027-04-15", actualDate: "", status: "not_started", completion: 0, assignedContractor: "", notes: "" },
    { id: "ms5", name: "Finishing", plannedDate: "2027-05-30", actualDate: "", status: "not_started", completion: 0, assignedContractor: "", notes: "" },
    { id: "ms6", name: "Handover", plannedDate: "2027-06-30", actualDate: "", status: "not_started", completion: 0, assignedContractor: "", notes: "" },
  ]);
  const [msForm, setMsForm] = useState({ name: "", plannedDate: "", assignedContractor: "", notes: "" });

  // Handlers
  const addRfi = () => {
    if (!rfiQuestion.trim()) return;
    const newRfi = { id: `rfi${Date.now()}`, question: rfiQuestion, scope: rfiScope, priority: rfiPriority, status: "open", submittedBy: "You", date: new Date().toISOString().split('T')[0], answer: "" };
    setRfis([newRfi, ...rfis]);
    setRfiQuestion("");
  };

  const addDiaryEntry = () => {
    const { date, weather, workDescription, workforceCount, equipment, issues } = diaryForm;
    if (!workDescription.trim()) return;
    const entry = { id: `de${Date.now()}`, date, weather, workDescription, workforceCount: parseInt(workforceCount) || 0, equipment, issues };
    setDiaryEntries([entry, ...diaryEntries]);
    setDiaryForm({ date: new Date().toISOString().split('T')[0], weather: "sunny", workDescription: "", workforceCount: "", equipment: "", issues: "" });
  };

  const addVo = () => {
    if (!voDescription.trim()) return;
    const voNumber = `VO-${String(vos.length + 1).padStart(3, "0")}`;
    const newVo = { id: `vo${Date.now()}`, voNumber, description: voDescription, costImpact: voCostImpact, scheduleImpact: voScheduleImpact, status: "draft", submittedBy: "You", date: new Date().toISOString().split('T')[0], approvalDate: "" };
    setVos([newVo, ...vos]);
    setVoDescription(""); setVoCostImpact(""); setVoScheduleImpact("");
  };

  const addMilestone = () => {
    if (!msForm.name.trim() || !msForm.plannedDate) return;
    const newMs = { id: `ms${Date.now()}`, name: msForm.name, plannedDate: msForm.plannedDate, actualDate: "", status: "not_started", completion: 0, assignedContractor: msForm.assignedContractor, notes: msForm.notes };
    setDetailedMilestones([...detailedMilestones, newMs]);
    setMsForm({ name: "", plannedDate: "", assignedContractor: "", notes: "" });
  };

  const finalizeMilestone = (id: string) => {
    setDetailedMilestones(prev => prev.map(m => m.id === id ? { ...m, status: "completed", completion: 100, actualDate: new Date().toISOString().split('T')[0] } : m));
  };

  const weatherIcon = (w: string) => {
    if (w === "sunny") return <Sun className="w-4 h-4 text-amber-500" />;
    if (w === "cloudy") return <Cloud className="w-4 h-4 text-gray-400" />;
    if (w === "rainy") return <CloudRain className="w-4 h-4 text-blue-500" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "text-red-600 bg-red-50";
    if (p === "medium") return "text-amber-600 bg-amber-50";
    return "text-green-600 bg-green-50";
  };

  const rfiStatusColor = (s: string) => {
    if (s === "open") return "bg-amber-50 text-amber-700";
    if (s === "answered") return "bg-blue-50 text-blue-700";
    return "bg-gray-50 text-gray-500";
  };

  const voStatusColor = (s: string) => {
    if (s === "approved") return "bg-green-50 text-green-700";
    if (s === "rejected") return "bg-red-50 text-red-700";
    return "bg-gray-50 text-gray-500";
  };

  const msStatusColor = (s: string) => {
    if (s === "in_progress") return "bg-blue-50 text-blue-700";
    if (s === "completed") return "bg-green-50 text-green-700";
    if (s === "delayed") return "bg-red-50 text-red-700";
    return "bg-gray-50 text-gray-500";
  };

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

              {/* RFIs */}
              {activeTab === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#0A1628] mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#FF6B00]" /> Submit New RFI
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <textarea value={rfiQuestion} onChange={(e) => setRfiQuestion(e.target.value)} placeholder="Describe the information you need..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <select value={rfiScope} onChange={(e) => setRfiScope(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                          {["General", "Foundation", "Superstructure", "Roofing", "MEP Installation", "Finishing"].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={rfiPriority} onChange={(e) => setRfiPriority(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                      <button onClick={addRfi} className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm">
                        <Send className="w-3.5 h-3.5" /> Submit RFI
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {rfis.map((rfi) => (
                      <div key={rfi.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#0A1628] text-sm">{rfi.question}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs text-gray-500">{rfi.scope}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor(rfi.priority)}`}>{rfi.priority}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rfiStatusColor(rfi.status)}`}>{rfi.status}</span>
                              <span className="text-xs text-gray-400">{rfi.date}</span>
                            </div>
                          </div>
                          <MessageSquare className="w-4 h-4 text-gray-300 shrink-0" />
                        </div>
                        {rfi.answer && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-0.5">Response:</p>
                            <p className="text-sm text-gray-700">{rfi.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Site Diary */}
              {activeTab === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#0A1628] mb-3 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-[#FF6B00]" /> Add Daily Entry
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Date</label>
                          <input type="date" value={diaryForm.date} onChange={(e) => setDiaryForm({ ...diaryForm, date: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Weather</label>
                          <select value={diaryForm.weather} onChange={(e) => setDiaryForm({ ...diaryForm, weather: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]">
                            <option value="sunny">Sunny</option>
                            <option value="cloudy">Cloudy</option>
                            <option value="rainy">Rainy</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Workforce Count</label>
                          <input type="number" value={diaryForm.workforceCount} onChange={(e) => setDiaryForm({ ...diaryForm, workforceCount: e.target.value })} placeholder="e.g. 15" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Work Description</label>
                        <textarea value={diaryForm.workDescription} onChange={(e) => setDiaryForm({ ...diaryForm, workDescription: e.target.value })} rows={2} placeholder="Describe today's work..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Equipment Used</label>
                          <input type="text" value={diaryForm.equipment} onChange={(e) => setDiaryForm({ ...diaryForm, equipment: e.target.value })} placeholder="e.g. excavator, mixer" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Issues Encountered</label>
                          <input type="text" value={diaryForm.issues} onChange={(e) => setDiaryForm({ ...diaryForm, issues: e.target.value })} placeholder="e.g. delayed materials" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                      </div>
                      <button onClick={addDiaryEntry} className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm">
                        <Plus className="w-3.5 h-3.5" /> Add Entry
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {diaryEntries.map((entry) => (
                      <div key={entry.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {weatherIcon(entry.weather)}
                            <span className="font-semibold text-[#0A1628] text-sm">{entry.date}</span>
                            <span className="text-xs text-gray-400 capitalize">{entry.weather}</span>
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {entry.workforceCount} workers</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{entry.workDescription}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          {entry.equipment && <span><span className="font-medium">Equipment:</span> {entry.equipment}</span>}
                          {entry.issues && <span className="text-red-500"><span className="font-medium">Issues:</span> {entry.issues}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variation Orders */}
              {activeTab === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#0A1628] mb-3 flex items-center gap-2">
                      <PenSquare className="w-4 h-4 text-[#FF6B00]" /> Create Variation Order
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <textarea value={voDescription} onChange={(e) => setVoDescription(e.target.value)} placeholder="Describe the variation..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] resize-none" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Cost Impact</label>
                          <input type="text" value={voCostImpact} onChange={(e) => setVoCostImpact(e.target.value)} placeholder="e.g. ₦250,000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Schedule Impact</label>
                          <input type="text" value={voScheduleImpact} onChange={(e) => setVoScheduleImpact(e.target.value)} placeholder="e.g. +5 days" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                      </div>
                      <button onClick={addVo} className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm">
                        <Plus className="w-3.5 h-3.5" /> Create VO
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {vos.map((vo) => (
                      <div key={vo.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{vo.voNumber}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${voStatusColor(vo.status)}`}>{vo.status}</span>
                            </div>
                            <p className="font-semibold text-[#0A1628] text-sm mt-1">{vo.description}</p>
                          </div>
                          {vo.status === "draft" && <Edit3 className="w-4 h-4 text-gray-300 shrink-0" />}
                          {vo.status === "approved" && <FileCheck className="w-4 h-4 text-green-500 shrink-0" />}
                          {vo.status === "rejected" && <FileX className="w-4 h-4 text-red-500 shrink-0" />}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                          <span><span className="font-medium">Cost:</span> {vo.costImpact}</span>
                          <span><span className="font-medium">Schedule:</span> {vo.scheduleImpact}</span>
                          <span><span className="font-medium">Submitted:</span> {vo.date}</span>
                          {vo.approvalDate && <span className="text-green-600"><span className="font-medium">Approved:</span> {vo.approvalDate}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone Tracker */}
              {activeTab === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-[#0A1628] mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#FF6B00]" /> Add Milestone
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Milestone Name</label>
                          <input type="text" value={msForm.name} onChange={(e) => setMsForm({ ...msForm, name: e.target.value })} placeholder="e.g. Floor Tiling" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Planned Date</label>
                          <input type="date" value={msForm.plannedDate} onChange={(e) => setMsForm({ ...msForm, plannedDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Assigned Contractor</label>
                          <input type="text" value={msForm.assignedContractor} onChange={(e) => setMsForm({ ...msForm, assignedContractor: e.target.value })} placeholder="Contractor name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Notes</label>
                          <input type="text" value={msForm.notes} onChange={(e) => setMsForm({ ...msForm, notes: e.target.value })} placeholder="Optional notes" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]" />
                        </div>
                      </div>
                      <button onClick={addMilestone} className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm">
                        <Plus className="w-3.5 h-3.5" /> Add Milestone
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {detailedMilestones.map((ms) => (
                      <div key={ms.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[#0A1628] text-sm">{ms.name}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${msStatusColor(ms.status)}`}>
                                {ms.status.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Planned: {ms.plannedDate}</span>
                              {ms.actualDate && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Actual: {ms.actualDate}</span>}
                            </div>
                          </div>
                          {ms.status === "in_progress" && (
                            <button onClick={() => finalizeMilestone(ms.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0">
                              Mark Complete
                            </button>
                          )}
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-semibold text-[#0A1628]">{ms.completion}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ms.completion}%`, backgroundColor: ms.completion === 100 ? "#059669" : ms.completion > 0 ? "#FF6B00" : "#E5E7EB" }} />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                          {ms.assignedContractor && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {ms.assignedContractor}</span>}
                          {ms.notes && <span><span className="font-medium">Notes:</span> {ms.notes}</span>}
                        </div>
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
