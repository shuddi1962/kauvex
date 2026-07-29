"use client";

import { useState, useEffect } from "react";
import {
  Brain, Database, MessageSquare, Settings, RefreshCw, Search,
  Plus, Trash2, Key, Globe, CheckCircle2, XCircle, Loader2,
  BookOpen, FileText, BarChart3, Clock, Zap,
  CreditCard, Building2, Bot, Calendar,
  ChevronDown, ChevronRight, PencilLine, X, Save,
  GitBranch, Puzzle, Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminShell from "@/components/admin/admin-shell";

interface ConfigEntry {
  config_key: string;
  config_value: string;
  description: string;
  is_secret: boolean;
}

interface Chunk {
  id: string;
  category: string;
  subcategory: string | null;
  title: string;
  content: string;
  is_active: boolean;
  has_embedding: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  session_id: string;
  persona: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  currency: string;
  max_agents: number;
  max_kb_size_mb: number;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Subscription {
  id: string;
  business_id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  auto_renew: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  business?: { company_name: string };
  plan?: { name: string };
}

interface Business {
  id: string;
  company_name: string;
  industry: string | null;
  staff_count: number | null;
  description: string | null;
  products: string | null;
  services: string | null;
  locations: string[];
  website: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  onboarded: boolean;
  metadata: any;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  agents?: Agent[];
}

interface AgentPermission {
  id: string;
  agent_id: string;
  resource_type: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface Agent {
  id: string;
  business_id: string;
  name: string;
  role: string;
  avatar: string | null;
  color: string | null;
  description: string | null;
  system_prompt: string | null;
  knowledge_scope: string;
  model: string;
  temperature: number;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
  business?: { company_name: string };
  permissions?: AgentPermission[];
}

interface WorkflowStep {
  id?: string;
  type: string;
  config: any;
  order: number;
}

interface Workflow {
  id: string;
  name: string;
  trigger_type: string;
  steps: WorkflowStep[];
  is_active: boolean;
  business_id: string;
  business?: { company_name: string };
  created_at: string;
}

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  industry: string | null;
  capabilities: string[];
  system_prompt: string | null;
  price_monthly: number;
  install_count: number;
  rating: number | null;
  is_active: boolean;
  is_official: boolean;
  created_at: string;
}

interface SchemaField {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

interface PassportTemplate {
  id: string;
  entity_type: string;
  name: string;
  icon: string | null;
  color: string | null;
  schema: SchemaField[];
  is_active: boolean;
  created_at: string;
}

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { key: "conversations", label: "Conversations", icon: MessageSquare },
  { key: "config", label: "Configuration", icon: Settings },
  { key: "plans", label: "Plans", icon: CreditCard },
  { key: "subscriptions", label: "Subscriptions", icon: Calendar },
  { key: "businesses", label: "Businesses", icon: Building2 },
  { key: "agents", label: "Agents", icon: Bot },
  { key: "workflows", label: "Workflows", icon: GitBranch },
  { key: "skills", label: "Skills", icon: Puzzle },
  { key: "passport-templates", label: "Passport Templates", icon: Fingerprint },
];

export default function AdminKAIPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [config, setConfig] = useState<ConfigEntry[]>([]);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newChunk, setNewChunk] = useState({ category: "platform", subcategory: "", title: "", content: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [stats, setStats] = useState({ totalChunks: 0, indexedChunks: 0, totalConversations: 0, totalMessages: 0 });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPlanForm, setEditPlanForm] = useState({ name: "", description: "", price_monthly: 0, max_agents: 1, features: "[]", is_active: true });
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [addPlanForm, setAddPlanForm] = useState({ name: "", slug: "", description: "", price_monthly: 0, price_yearly: 0, max_agents: 1, features: "[]", is_active: true });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsError, setSubsError] = useState(false);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [bizLoading, setBizLoading] = useState(false);
  const [bizError, setBizError] = useState(false);
  const [expandedBiz, setExpandedBiz] = useState<string | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [workflowsError, setWorkflowsError] = useState(false);
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState(false);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [addSkillForm, setAddSkillForm] = useState({ name: "", slug: "", description: "", category: "general", industry: "", systemPrompt: "", priceMonthly: 0 });

  const [passportTemplates, setPassportTemplates] = useState<PassportTemplate[]>([]);
  const [ptLoading, setPtLoading] = useState(false);
  const [ptError, setPtError] = useState(false);
  const [expandedPt, setExpandedPt] = useState<string | null>(null);
  const [editingPt, setEditingPt] = useState<string | null>(null);
  const [editPtForm, setEditPtForm] = useState({ name: "", icon: "", color: "", is_active: true });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "plans") loadPlans();
    else if (activeTab === "subscriptions") loadSubscriptions();
    else if (activeTab === "businesses") loadBusinesses();
    else if (activeTab === "agents") loadAgents();
    else if (activeTab === "workflows") loadWorkflows();
    else if (activeTab === "skills") loadSkills();
    else if (activeTab === "passport-templates") loadPassportTemplates();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      const [configRes, chunksRes, convRes] = await Promise.all([
        fetch("/api/v1/kai/config"),
        fetch("/api/v1/kai/config?type=chunks"),
        fetch("/api/v1/kai/config?type=conversations"),
      ]);
      if (configRes.ok) {
        const d = await configRes.json();
        setConfig(d.config || []);
      }
      if (chunksRes.ok) {
        const d = await chunksRes.json();
        setChunks(d.chunks || []);
        setStats((s) => ({ ...s, totalChunks: d.chunks?.length || 0 }));
      }
      if (convRes.ok) {
        const d = await convRes.json();
        setConversations(d.conversations || []);
        setStats((s) => ({ ...s, totalConversations: d.conversations?.length || 0 }));
      }
    } catch (e) {
      console.error("Failed to load KAI data:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleReindex() {
    setReindexing(true);
    try {
      const res = await fetch("/api/v1/kai/config?action=reindex", { method: "POST" });
      const data = await res.json();
      if (data.count !== undefined) {
        setStats((s) => ({ ...s, indexedChunks: data.count }));
      }
    } catch (e) {
      console.error("Reindex failed:", e);
    } finally {
      setReindexing(false);
      loadData();
    }
  }

  async function saveConfig(key: string, value: string) {
    setSaving(key);
    try {
      await fetch("/api/v1/kai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config_key: key, config_value: value }),
      });
    } finally {
      setSaving(null);
    }
  }

  async function addChunk() {
    if (!newChunk.title || !newChunk.content) return;
    try {
      await fetch("/api/v1/kai/config?action=add_chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newChunk),
      });
      setNewChunk({ category: "platform", subcategory: "", title: "", content: "" });
      setShowAddForm(false);
      loadData();
    } catch (e) {
      console.error("Failed to add chunk:", e);
    }
  }

  async function deleteChunk(id: string) {
    try {
      await fetch(`/api/v1/kai/config?action=delete_chunk&id=${id}`, { method: "POST" });
      loadData();
    } catch (e) {
      console.error("Failed to delete chunk:", e);
    }
  }

  async function loadPlans() {
    setPlansLoading(true);
    setPlansError(false);
    try {
      const res = await fetch("/api/v1/kai/plans");
      if (res.ok) {
        const d = await res.json();
        setPlans(d.plans || []);
      } else {
        setPlansError(true);
      }
    } catch {
      setPlansError(true);
    } finally {
      setPlansLoading(false);
    }
  }

  async function savePlan(planId: string) {
    try {
      await fetch("/api/v1/kai/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: planId, action: "update", ...editPlanForm }),
      });
      setEditingPlan(null);
      loadPlans();
    } catch (e) {
      console.error("Failed to save plan:", e);
    }
  }

  async function createPlan() {
    try {
      await fetch("/api/v1/kai/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addPlanForm),
      });
      setShowAddPlan(false);
      setAddPlanForm({ name: "", slug: "", description: "", price_monthly: 0, price_yearly: 0, max_agents: 1, features: "[]", is_active: true });
      loadPlans();
    } catch (e) {
      console.error("Failed to create plan:", e);
    }
  }

  async function loadSubscriptions() {
    setSubsLoading(true);
    setSubsError(false);
    try {
      const res = await fetch("/api/v1/kai/subscriptions?all=true");
      if (res.ok) {
        const d = await res.json();
        setSubscriptions(d.subscriptions || []);
      } else {
        setSubsError(true);
      }
    } catch {
      setSubsError(true);
    } finally {
      setSubsLoading(false);
    }
  }

  async function cancelSubscription(id: string) {
    try {
      await fetch("/api/v1/kai/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "cancel" }),
      });
      loadSubscriptions();
    } catch (e) {
      console.error("Failed to cancel subscription:", e);
    }
  }

  async function loadBusinesses() {
    setBizLoading(true);
    setBizError(false);
    try {
      const res = await fetch("/api/v1/kai/business?all=true");
      if (res.ok) {
        const d = await res.json();
        setBusinesses(d.businesses || []);
      } else {
        setBizError(true);
      }
    } catch {
      setBizError(true);
    } finally {
      setBizLoading(false);
    }
  }

  async function loadAgents() {
    setAgentsLoading(true);
    setAgentsError(false);
    try {
      const res = await fetch("/api/v1/kai/agents?all=true");
      if (res.ok) {
        const d = await res.json();
        setAgents(d.agents || []);
      } else {
        setAgentsError(true);
      }
    } catch {
      setAgentsError(true);
    } finally {
      setAgentsLoading(false);
    }
  }

  async function toggleAgentStatus(agentId: string, currentStatus: boolean) {
    try {
      await fetch("/api/v1/kai/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId, action: "toggle-status", is_active: !currentStatus }),
      });
      loadAgents();
    } catch (e) {
      console.error("Failed to toggle agent status:", e);
    }
  }

  async function loadWorkflows() {
    setWorkflowsLoading(true);
    setWorkflowsError(false);
    try {
      const res = await fetch("/api/v1/kai/workflows?all=true");
      if (res.ok) {
        const d = await res.json();
        setWorkflows(d.workflows || []);
      } else {
        setWorkflowsError(true);
      }
    } catch {
      setWorkflowsError(true);
    } finally {
      setWorkflowsLoading(false);
    }
  }

  async function loadSkills() {
    setSkillsLoading(true);
    setSkillsError(false);
    try {
      const res = await fetch("/api/v1/kai/skills?all=true");
      if (res.ok) {
        const d = await res.json();
        setSkills(d.skills || []);
      } else {
        setSkillsError(true);
      }
    } catch {
      setSkillsError(true);
    } finally {
      setSkillsLoading(false);
    }
  }

  async function createSkill() {
    if (!addSkillForm.name || !addSkillForm.slug) return;
    try {
      await fetch("/api/v1/kai/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addSkillForm),
      });
      setShowAddSkill(false);
      setAddSkillForm({ name: "", slug: "", description: "", category: "general", industry: "", systemPrompt: "", priceMonthly: 0 });
      loadSkills();
    } catch (e) {
      console.error("Failed to create skill:", e);
    }
  }

  async function toggleSkillStatus(skillId: string, currentStatus: boolean) {
    try {
      await fetch(`/api/v1/kai/skills/${skillId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      loadSkills();
    } catch (e) {
      console.error("Failed to toggle skill status:", e);
    }
  }

  async function loadPassportTemplates() {
    setPtLoading(true);
    setPtError(false);
    try {
      const res = await fetch("/api/v1/kai/passport-templates");
      if (res.ok) {
        const d = await res.json();
        setPassportTemplates(d.templates || d.passportTemplates || []);
      } else {
        setPtError(true);
      }
    } catch {
      setPtError(true);
    } finally {
      setPtLoading(false);
    }
  }

  async function createPassportTemplate() {
    try {
      await fetch("/api/v1/kai/passport-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Template", entity_type: "professional", is_active: true }),
      });
      loadPassportTemplates();
    } catch (e) {
      console.error("Failed to create passport template:", e);
    }
  }

  async function updatePassportTemplate(templateId: string) {
    try {
      await fetch(`/api/v1/kai/passport-templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPtForm),
      });
      setEditingPt(null);
      loadPassportTemplates();
    } catch (e) {
      console.error("Failed to update template:", e);
    }
  }

  async function togglePassportTemplate(templateId: string, currentStatus: boolean) {
    try {
      await fetch(`/api/v1/kai/passport-templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      loadPassportTemplates();
    } catch (e) {
      console.error("Failed to toggle template:", e);
    }
  }

  const filteredChunks = chunks.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subcategory || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminShell title="KAI — AI Management">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-syne font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key ? "border-orange text-orange" : "border-transparent text-text-3 hover:text-text-1"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Knowledge Chunks", value: stats.totalChunks, icon: BookOpen, color: "text-blue" },
                { label: "Indexed (Embedded)", value: stats.indexedChunks || chunks.filter((c) => c.has_embedding).length, icon: Database, color: "text-success" },
                { label: "Conversations", value: stats.totalConversations, icon: MessageSquare, color: "text-purple" },
                { label: "Total Messages", value: conversations.reduce((s, c) => s + c.message_count, 0), icon: FileText, color: "text-orange" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon size={16} className={stat.color} />
                    <span className="text-xs text-text-4">{stat.label}</span>
                  </div>
                  <p className="font-syne font-bold text-2xl text-text-1">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="font-syne font-bold text-lg mb-4">Knowledge Base Indexing</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 bg-off-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-3">Indexed</span>
                    <span className="font-bold text-text-1">
                      {stats.indexedChunks || chunks.filter((c) => c.has_embedding).length} / {stats.totalChunks}
                    </span>
                  </div>
                  <div className="h-2 bg-off-white rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-orange rounded-full transition-all"
                      style={{ width: `${stats.totalChunks > 0 ? ((stats.indexedChunks || chunks.filter((c) => c.has_embedding).length) / stats.totalChunks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <Button onClick={handleReindex} disabled={reindexing} className="shrink-0">
                  {reindexing ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                  {reindexing ? "Indexing..." : "Reindex All"}
                </Button>
              </div>
              {reindexing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue">
                  Generating embeddings for unindexed chunks. This may take a few moments...
                </div>
              )}
            </div>
          </div>
        )}

        {/* KNOWLEDGE BASE TAB */}
        {activeTab === "knowledge" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search knowledge base..."
                  className="w-full h-9 pl-9 pr-3 text-sm border border-border rounded-lg"
                />
              </div>
              <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus size={14} className="mr-1" /> Add Entry
              </Button>
            </div>

            {showAddForm && (
              <div className="bg-off-white rounded-xl border border-border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newChunk.category}
                    onChange={(e) => setNewChunk({ ...newChunk, category: e.target.value })}
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  >
                    <option value="platform">Platform</option>
                    <option value="industry">Industry</option>
                    <option value="professional">Professional</option>
                    <option value="vendor">Vendor</option>
                    <option value="policy">Policy</option>
                  </select>
                  <input
                    type="text"
                    value={newChunk.subcategory}
                    onChange={(e) => setNewChunk({ ...newChunk, subcategory: e.target.value })}
                    placeholder="Subcategory (optional)"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  value={newChunk.title}
                  onChange={(e) => setNewChunk({ ...newChunk, title: e.target.value })}
                  placeholder="Title"
                  className="w-full h-9 px-3 text-sm border border-border rounded-lg"
                />
                <textarea
                  value={newChunk.content}
                  onChange={(e) => setNewChunk({ ...newChunk, content: e.target.value })}
                  placeholder="Content"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addChunk}>Save Entry</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border sticky top-0">
                    <tr>
                      {["Title", "Category", "Subcategory", "Embedded", "Status", "Created", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChunks.map((chunk) => (
                      <tr key={chunk.id} className="border-b border-border last:border-0 hover:bg-off-white/50">
                        <td className="px-4 py-3 font-semibold text-text-1 max-w-[250px] truncate">{chunk.title}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{chunk.category}</Badge></td>
                        <td className="px-4 py-3 text-text-4 text-xs">{chunk.subcategory || "—"}</td>
                        <td className="px-4 py-3">
                          {chunk.has_embedding ? (
                            <CheckCircle2 size={14} className="text-success" />
                          ) : (
                            <XCircle size={14} className="text-red" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={chunk.is_active ? "default" : "outline"} className={`text-[10px] ${chunk.is_active ? "bg-success/10 text-success" : "bg-amber-50 text-amber-600"}`}>
                            {chunk.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-text-4 text-xs">{chunk.created_at?.slice(0, 10)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteChunk(chunk.id)} className="text-text-4 hover:text-red transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredChunks.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-text-4 text-sm">No knowledge base entries found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONVERSATIONS TAB */}
        {activeTab === "conversations" && (
          <div className="space-y-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full h-9 pl-9 pr-3 text-sm border border-border rounded-lg"
              />
            </div>
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-off-white border-b border-border">
                  <tr>
                    {["Session", "Persona", "Messages", "Last Active", "Created"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((conv) => (
                    <tr key={conv.id} className="border-b border-border last:border-0 hover:bg-off-white/50">
                      <td className="px-4 py-3 font-mono text-xs text-text-2">{conv.session_id}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{conv.persona}</Badge></td>
                      <td className="px-4 py-3 font-bold text-text-1">{conv.message_count}</td>
                      <td className="px-4 py-3 text-xs text-text-4">{conv.updated_at?.slice(0, 16).replace("T", " ")}</td>
                      <td className="px-4 py-3 text-xs text-text-4">{conv.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))}
                  {conversations.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-text-4 text-sm">No conversations yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONFIGURATION TAB */}
        {activeTab === "config" && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <Globe size={16} className="text-orange mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-800">API Keys & Configuration</p>
                <p className="text-xs text-orange-700 mt-1">These values are stored in the database and can be set without environment variables. Leave blank to use env vars as fallback.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border divide-y divide-border">
              {config.map((entry) => (
                <div key={entry.config_key} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {entry.is_secret && <Key size={12} className="text-amber-500" />}
                      <span className="text-sm font-bold text-text-1">{entry.config_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                    </div>
                    <p className="text-[10px] text-text-4 mt-0.5">{entry.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-[400px]">
                    <input
                      type={entry.is_secret ? "password" : "text"}
                      defaultValue={entry.config_value}
                      placeholder={entry.is_secret ? "Enter API key..." : "Enter value..."}
                      className="flex-1 h-9 px-3 text-sm border border-border rounded-lg"
                      id={`cfg-${entry.config_key}`}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById(`cfg-${entry.config_key}`) as HTMLInputElement;
                        if (input) saveConfig(entry.config_key, input.value);
                      }}
                      disabled={saving === entry.config_key}
                    >
                      {saving === entry.config_key ? <Loader2 size={12} className="animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLANS TAB */}
        {activeTab === "plans" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne font-bold text-lg">Pricing Plans</h3>
              <Button size="sm" onClick={() => setShowAddPlan(!showAddPlan)}>
                <Plus size={14} className="mr-1" /> Add Plan
              </Button>
            </div>

            {showAddPlan && (
              <div className="bg-off-white rounded-xl border border-border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={addPlanForm.name}
                    onChange={(e) => setAddPlanForm({ ...addPlanForm, name: e.target.value })}
                    placeholder="Plan name"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                  <input
                    type="text"
                    value={addPlanForm.slug}
                    onChange={(e) => setAddPlanForm({ ...addPlanForm, slug: e.target.value })}
                    placeholder="Slug (e.g. pro-plan)"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  value={addPlanForm.description}
                  onChange={(e) => setAddPlanForm({ ...addPlanForm, description: e.target.value })}
                  placeholder="Description"
                  className="w-full h-9 px-3 text-sm border border-border rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={addPlanForm.price_monthly || ""}
                    onChange={(e) => setAddPlanForm({ ...addPlanForm, price_monthly: parseFloat(e.target.value) || 0 })}
                    placeholder="Monthly price"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                  <input
                    type="number"
                    value={addPlanForm.price_yearly || ""}
                    onChange={(e) => setAddPlanForm({ ...addPlanForm, price_yearly: parseFloat(e.target.value) || 0 })}
                    placeholder="Yearly price (optional)"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={addPlanForm.max_agents || ""}
                    onChange={(e) => setAddPlanForm({ ...addPlanForm, max_agents: parseInt(e.target.value) || 1 })}
                    placeholder="Max agents"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                </div>
                <textarea
                  value={addPlanForm.features}
                  onChange={(e) => setAddPlanForm({ ...addPlanForm, features: e.target.value })}
                  placeholder='Features as JSON array: ["Feature 1", "Feature 2"]'
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-border rounded-lg resize-none font-mono"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addPlanForm.is_active}
                    onChange={(e) => setAddPlanForm({ ...addPlanForm, is_active: e.target.checked })}
                    id="add-plan-active"
                  />
                  <label htmlFor="add-plan-active" className="text-sm text-text-2">Active</label>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={createPlan}>Create Plan</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddPlan(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {plansLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : plansError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Failed to load plans</p>
                <Button size="sm" variant="outline" onClick={loadPlans} className="mt-2">Retry</Button>
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <CreditCard size={32} className="mx-auto text-text-4 mb-2" />
                <p className="font-bold text-text-2">No plans yet</p>
                <p className="text-sm text-text-4">Create your first pricing plan</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Max Agents</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Features</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      editingPlan === plan.id ? (
                        <tr key={plan.id} className="bg-off-white">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-text-4 uppercase">Name</label>
                                <input
                                  type="text"
                                  value={editPlanForm.name}
                                  onChange={(e) => setEditPlanForm({ ...editPlanForm, name: e.target.value })}
                                  className="w-full h-8 px-2 text-xs border border-border rounded mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-4 uppercase">Price (monthly)</label>
                                <input
                                  type="number"
                                  value={editPlanForm.price_monthly}
                                  onChange={(e) => setEditPlanForm({ ...editPlanForm, price_monthly: parseFloat(e.target.value) || 0 })}
                                  className="w-full h-8 px-2 text-xs border border-border rounded mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-4 uppercase">Max Agents</label>
                                <input
                                  type="number"
                                  value={editPlanForm.max_agents}
                                  onChange={(e) => setEditPlanForm({ ...editPlanForm, max_agents: parseInt(e.target.value) || 1 })}
                                  className="w-full h-8 px-2 text-xs border border-border rounded mt-1"
                                />
                              </div>
                            </div>
                            <div className="mt-2">
                              <label className="text-[10px] font-bold text-text-4 uppercase">Description</label>
                              <input
                                type="text"
                                value={editPlanForm.description}
                                onChange={(e) => setEditPlanForm({ ...editPlanForm, description: e.target.value })}
                                className="w-full h-8 px-2 text-xs border border-border rounded mt-1"
                              />
                            </div>
                            <div className="mt-2">
                              <label className="text-[10px] font-bold text-text-4 uppercase">Features (JSON array)</label>
                              <textarea
                                value={editPlanForm.features}
                                onChange={(e) => setEditPlanForm({ ...editPlanForm, features: e.target.value })}
                                rows={2}
                                className="w-full px-2 py-1 text-xs border border-border rounded mt-1 resize-none font-mono"
                              />
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editPlanForm.is_active}
                                onChange={(e) => setEditPlanForm({ ...editPlanForm, is_active: e.target.checked })}
                                id={`edit-active-${plan.id}`}
                              />
                              <label htmlFor={`edit-active-${plan.id}`} className="text-xs text-text-2">Active</label>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" onClick={() => savePlan(plan.id)}>
                                <Save size={12} className="mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingPlan(null)}>
                                <X size={12} className="mr-1" /> Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={plan.id} className="border-b border-border last:border-0 hover:bg-off-white/50">
                          <td className="px-4 py-3 font-semibold text-text-1">{plan.name}</td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-text-1">${Number(plan.price_monthly).toFixed(2)}</span>
                            <span className="text-text-4 text-xs ml-1">/{plan.currency || "USD"}</span>
                          </td>
                          <td className="px-4 py-3">{plan.max_agents}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[300px]">
                              {(Array.isArray(plan.features) ? plan.features : []).map((f: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-[10px]">{f}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${plan.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {plan.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setEditingPlan(plan.id);
                                setEditPlanForm({
                                  name: plan.name,
                                  description: plan.description || "",
                                  price_monthly: Number(plan.price_monthly),
                                  max_agents: plan.max_agents,
                                  features: JSON.stringify(plan.features, null, 2),
                                  is_active: plan.is_active,
                                });
                              }}
                              className="text-text-4 hover:text-orange transition-colors"
                            >
                              <PencilLine size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            <h3 className="font-syne font-bold text-lg">Business Subscriptions</h3>

            {subsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : subsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Failed to load subscriptions</p>
                <Button size="sm" variant="outline" onClick={loadSubscriptions} className="mt-2">Retry</Button>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <Calendar size={32} className="mx-auto text-text-4 mb-2" />
                <p className="font-bold text-text-2">No subscriptions yet</p>
                <p className="text-sm text-text-4">Business subscriptions will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Business</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Plan</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Billing</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Period End</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <>
                        <tr
                          key={sub.id}
                          className="border-b border-border last:border-0 hover:bg-off-white/50 cursor-pointer"
                          onClick={() => setExpandedSub(expandedSub === sub.id ? null : sub.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-text-1">{sub.business?.company_name || "—"}</td>
                          <td className="px-4 py-3">{sub.plan?.name || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${
                              sub.status === "active" ? "bg-green-100 text-green-800" :
                              sub.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-text-2 capitalize">{sub.billing_cycle}</td>
                          <td className="px-4 py-3 text-xs text-text-4">
                            {sub.current_period_end?.slice(0, 10) || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {expandedSub === sub.id ? <ChevronDown size={14} className="text-text-4" /> : <ChevronRight size={14} className="text-text-4" />}
                              {sub.status === "active" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); cancelSubscription(sub.id); }}
                                  className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedSub === sub.id && (
                          <tr key={`${sub.id}-detail`} className="bg-off-white/50">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-text-4 uppercase">Metadata</h4>
                                <pre className="bg-white border border-border rounded-lg p-3 text-xs font-mono max-h-[200px] overflow-auto">
                                  {JSON.stringify(sub.metadata, null, 2)}
                                </pre>
                                <div className="grid grid-cols-3 gap-4 text-xs text-text-3">
                                  <div>
                                    <span className="font-bold text-text-4">ID: </span>
                                    <span className="font-mono">{sub.id}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-text-4">Auto-renew: </span>
                                    <Badge className={`text-[10px] ${sub.auto_renew ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                      {sub.auto_renew ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <span className="font-bold text-text-4">Created: </span>
                                    {sub.created_at?.slice(0, 10)}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BUSINESSES TAB */}
        {activeTab === "businesses" && (
          <div className="space-y-4">
            <h3 className="font-syne font-bold text-lg">Registered Businesses</h3>

            {bizLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : bizError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Failed to load businesses</p>
                <Button size="sm" variant="outline" onClick={loadBusinesses} className="mt-2">Retry</Button>
              </div>
            ) : businesses.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <Building2 size={32} className="mx-auto text-text-4 mb-2" />
                <p className="font-bold text-text-2">No businesses yet</p>
                <p className="text-sm text-text-4">Registered businesses will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Industry</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Staff</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Onboarded</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Agents</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((biz) => (
                      <>
                        <tr
                          key={biz.id}
                          className="border-b border-border last:border-0 hover:bg-off-white/50 cursor-pointer"
                          onClick={() => setExpandedBiz(expandedBiz === biz.id ? null : biz.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-text-1">{biz.company_name}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">{biz.industry || "—"}</Badge>
                          </td>
                          <td className="px-4 py-3">{biz.staff_count ?? "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${biz.onboarded ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {biz.onboarded ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">{biz.agents?.length || 0}</Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-text-4">{biz.created_at?.slice(0, 10)}</td>
                        </tr>
                        {expandedBiz === biz.id && (
                          <tr key={`${biz.id}-detail`} className="bg-off-white/50">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-2">Contact Info</h4>
                                    <div className="space-y-1 text-xs text-text-2">
                                      <p><span className="font-bold text-text-4">Email:</span> {biz.contact_email || "—"}</p>
                                      <p><span className="font-bold text-text-4">Phone:</span> {biz.contact_phone || "—"}</p>
                                      <p><span className="font-bold text-text-4">Website:</span> {biz.website || "—"}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-2">Locations</h4>
                                    <div className="space-y-1 text-xs text-text-2">
                                      {biz.locations?.length > 0 ? biz.locations.map((loc: string, i: number) => (
                                        <p key={i} className="flex items-center gap-1">
                                          <Globe size={10} className="shrink-0" /> {loc}
                                        </p>
                                      )) : <p className="text-text-4">No locations</p>}
                                    </div>
                                  </div>
                                </div>
                                {biz.description && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-1">Description</h4>
                                    <p className="text-xs text-text-2 bg-white border border-border rounded-lg p-3">{biz.description}</p>
                                  </div>
                                )}
                                {biz.agents && biz.agents.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-2">Agents</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {biz.agents.map((agent: Agent) => (
                                        <Badge key={agent.id} className="text-[10px] bg-blue-100 text-blue-800">
                                          {agent.name} ({agent.role})
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === "agents" && (
          <div className="space-y-4">
            <h3 className="font-syne font-bold text-lg">AI Agents</h3>

            {agentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : agentsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Failed to load agents</p>
                <Button size="sm" variant="outline" onClick={loadAgents} className="mt-2">Retry</Button>
              </div>
            ) : agents.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <Bot size={32} className="mx-auto text-text-4 mb-2" />
                <p className="font-bold text-text-2">No agents yet</p>
                <p className="text-sm text-text-4">AI agents will appear here once businesses create them</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Business</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Model</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Temp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <>
                        <tr
                          key={agent.id}
                          className="border-b border-border last:border-0 hover:bg-off-white/50 cursor-pointer"
                          onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-text-1 flex items-center gap-2">
                            {expandedAgent === agent.id ? <ChevronDown size={14} className="text-text-4 shrink-0" /> : <ChevronRight size={14} className="text-text-4 shrink-0" />}
                            {agent.avatar && <span className="text-base">{agent.avatar}</span>}
                            {agent.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">{agent.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-text-2">{agent.business?.company_name || "—"}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-text-3">{agent.model}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleAgentStatus(agent.id, agent.is_active); }}
                              className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                                agent.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {agent.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-xs text-text-3">{Number(agent.temperature).toFixed(2)}</td>
                        </tr>
                        {expandedAgent === agent.id && (
                          <tr key={`${agent.id}-detail`} className="bg-off-white/50">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-4">
                                {agent.description && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-1">Description</h4>
                                    <p className="text-xs text-text-2 bg-white border border-border rounded-lg p-3">{agent.description}</p>
                                  </div>
                                )}
                                {agent.system_prompt && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-1">System Prompt</h4>
                                    <pre className="bg-white border border-border rounded-lg p-3 text-[10px] font-mono max-h-[150px] overflow-auto whitespace-pre-wrap">{agent.system_prompt}</pre>
                                  </div>
                                )}
                                {agent.permissions && agent.permissions.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-2">Permissions</h4>
                                    <div className="bg-white border border-border rounded-lg overflow-hidden">
                                      <table className="w-full text-[10px]">
                                        <thead className="bg-off-white border-b border-border">
                                          <tr>
                                            <th className="text-left px-3 py-2 font-bold text-text-4 uppercase">Resource</th>
                                            <th className="text-center px-3 py-2 font-bold text-text-4 uppercase">View</th>
                                            <th className="text-center px-3 py-2 font-bold text-text-4 uppercase">Create</th>
                                            <th className="text-center px-3 py-2 font-bold text-text-4 uppercase">Edit</th>
                                            <th className="text-center px-3 py-2 font-bold text-text-4 uppercase">Delete</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {agent.permissions.map((perm: AgentPermission) => (
                                            <tr key={perm.id} className="border-b border-border last:border-0">
                                              <td className="px-3 py-2 font-semibold text-text-2">{perm.resource_type}</td>
                                              <td className="px-3 py-2 text-center">
                                                {perm.can_view ? <CheckCircle2 size={12} className="text-success mx-auto" /> : <XCircle size={12} className="text-red mx-auto" />}
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                {perm.can_create ? <CheckCircle2 size={12} className="text-success mx-auto" /> : <XCircle size={12} className="text-red mx-auto" />}
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                {perm.can_edit ? <CheckCircle2 size={12} className="text-success mx-auto" /> : <XCircle size={12} className="text-red mx-auto" />}
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                {perm.can_delete ? <CheckCircle2 size={12} className="text-success mx-auto" /> : <XCircle size={12} className="text-red mx-auto" />}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-xs text-text-3">
                                  <div>
                                    <span className="font-bold text-text-4">Knowledge Scope: </span>
                                    <Badge variant="outline" className="text-[10px]">{agent.knowledge_scope}</Badge>
                                  </div>
                                  <div>
                                    <span className="font-bold text-text-4">Agent ID: </span>
                                    <span className="font-mono text-[10px]">{agent.id}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* WORKFLOWS TAB */}
        {activeTab === "workflows" && (
          <div className="space-y-4">
            <h3 className="font-syne font-bold text-lg">Workflows</h3>

            {workflowsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : workflowsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Failed to load workflows</p>
                <Button size="sm" variant="outline" onClick={loadWorkflows} className="mt-2">Retry</Button>
              </div>
            ) : workflows.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <GitBranch size={32} className="mx-auto text-text-4 mb-2" />
                <p className="font-bold text-text-2">No workflows yet</p>
                <p className="text-sm text-text-4">Automated workflows will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Trigger</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Steps</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Active</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Business</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflows.map((wf) => (
                      <>
                        <tr
                          key={wf.id}
                          className="border-b border-border last:border-0 hover:bg-off-white/50 cursor-pointer"
                          onClick={() => setExpandedWorkflow(expandedWorkflow === wf.id ? null : wf.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-text-1 flex items-center gap-2">
                            {expandedWorkflow === wf.id ? <ChevronDown size={14} className="text-text-4 shrink-0" /> : <ChevronRight size={14} className="text-text-4 shrink-0" />}
                            {wf.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className="text-[10px] bg-blue-100 text-blue-800">{wf.trigger_type}</Badge>
                          </td>
                          <td className="px-4 py-3 text-text-2">{wf.steps?.length || 0}</td>
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${wf.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {wf.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-text-2">{wf.business?.company_name || "—"}</td>
                          <td className="px-4 py-3 text-xs text-text-4">{wf.created_at?.slice(0, 10)}</td>
                        </tr>
                        {expandedWorkflow === wf.id && (
                          <tr key={`${wf.id}-detail`} className="bg-off-white/50">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-text-4 uppercase">Steps</h4>
                                {(wf.steps || []).length === 0 ? (
                                  <p className="text-xs text-text-4">No steps defined</p>
                                ) : (
                                  <div className="space-y-2">
                                    {(wf.steps || []).sort((a: WorkflowStep, b: WorkflowStep) => a.order - b.order).map((step: WorkflowStep, i: number) => (
                                      <div key={step.id || i} className="flex items-start gap-3 bg-white border border-border rounded-lg p-3">
                                        <div className="w-6 h-6 rounded-full bg-orange/10 text-orange flex items-center justify-center text-xs font-bold shrink-0">
                                          {step.order}
                                        </div>
                                        <div>
                                          <Badge className="text-[10px] bg-purple-100 text-purple-800 mb-1">{step.type}</Badge>
                                          <pre className="text-[10px] font-mono text-text-3 mt-1 whitespace-pre-wrap">{JSON.stringify(step.config, null, 2)}</pre>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne font-bold text-lg">Skills Marketplace</h3>
              <Button size="sm" onClick={() => setShowAddSkill(!showAddSkill)}>
                <Plus size={14} className="mr-1" /> Add Skill
              </Button>
            </div>

            {showAddSkill && (
              <div className="bg-off-white rounded-xl border border-border p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={addSkillForm.name}
                    onChange={(e) => setAddSkillForm({ ...addSkillForm, name: e.target.value })}
                    placeholder="Skill name"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                  <input
                    type="text"
                    value={addSkillForm.slug}
                    onChange={(e) => setAddSkillForm({ ...addSkillForm, slug: e.target.value })}
                    placeholder="Slug (e.g. data-analyst)"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                </div>
                <input
                  type="text"
                  value={addSkillForm.description}
                  onChange={(e) => setAddSkillForm({ ...addSkillForm, description: e.target.value })}
                  placeholder="Description"
                  className="w-full h-9 px-3 text-sm border border-border rounded-lg"
                />
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={addSkillForm.category}
                    onChange={(e) => setAddSkillForm({ ...addSkillForm, category: e.target.value })}
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  >
                    <option value="general">General</option>
                    <option value="analytics">Analytics</option>
                    <option value="customer-support">Customer Support</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                  </select>
                  <select
                    value={addSkillForm.industry}
                    onChange={(e) => setAddSkillForm({ ...addSkillForm, industry: e.target.value })}
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  >
                    <option value="">All Industries</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="education">Education</option>
                  </select>
                  <input
                    type="number"
                    value={addSkillForm.priceMonthly || ""}
                    onChange={(e) => setAddSkillForm({ ...addSkillForm, priceMonthly: parseFloat(e.target.value) || 0 })}
                    placeholder="Price ($/mo)"
                    className="h-9 px-3 text-sm border border-border rounded-lg"
                  />
                </div>
                <textarea
                  value={addSkillForm.systemPrompt}
                  onChange={(e) => setAddSkillForm({ ...addSkillForm, systemPrompt: e.target.value })}
                  placeholder="System prompt"
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg resize-none font-mono"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={createSkill}>Create Skill</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddSkill(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {skillsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : skillsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Failed to load skills</p>
                <Button size="sm" variant="outline" onClick={loadSkills} className="mt-2">Retry</Button>
              </div>
            ) : skills.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <Puzzle size={32} className="mx-auto text-text-4 mb-2" />
                <p className="font-bold text-text-2">No skills yet</p>
                <p className="text-sm text-text-4">Marketplace skills will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Industry</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Installs</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Rating</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Official</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((skill) => (
                      <>
                        <tr
                          key={skill.id}
                          className="border-b border-border last:border-0 hover:bg-off-white/50 cursor-pointer"
                          onClick={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-text-1 flex items-center gap-2">
                            {expandedSkill === skill.id ? <ChevronDown size={14} className="text-text-4 shrink-0" /> : <ChevronRight size={14} className="text-text-4 shrink-0" />}
                            {skill.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">{skill.category}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">{skill.industry || "—"}</Badge>
                          </td>
                          <td className="px-4 py-3 font-bold text-text-1">${Number(skill.price_monthly).toFixed(2)}</td>
                          <td className="px-4 py-3 text-text-2">{skill.install_count}</td>
                          <td className="px-4 py-3 text-text-2">{skill.rating ? `${Number(skill.rating).toFixed(1)}` : "—"}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSkillStatus(skill.id, skill.is_active); }}
                              className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                                skill.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {skill.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {skill.is_official ? (
                              <Badge className="text-[10px] bg-blue-100 text-blue-800">Official</Badge>
                            ) : (
                              <span className="text-text-4 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                        {expandedSkill === skill.id && (
                          <tr key={`${skill.id}-detail`} className="bg-off-white/50">
                            <td colSpan={8} className="px-4 py-3">
                              <div className="space-y-3">
                                {skill.description && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-1">Description</h4>
                                    <p className="text-xs text-text-2 bg-white border border-border rounded-lg p-3">{skill.description}</p>
                                  </div>
                                )}
                                {skill.capabilities && skill.capabilities.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-2">Capabilities</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {skill.capabilities.map((cap: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {skill.system_prompt && (
                                  <div>
                                    <h4 className="text-xs font-bold text-text-4 uppercase mb-1">System Prompt</h4>
                                    <pre className="bg-white border border-border rounded-lg p-3 text-[10px] font-mono max-h-[200px] overflow-auto whitespace-pre-wrap">{skill.system_prompt}</pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PASSPORT TEMPLATES TAB */}
        {activeTab === "passport-templates" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-syne font-bold text-lg">Passport Templates</h3>
              <Button size="sm" onClick={createPassportTemplate}>
                <Plus size={14} className="mr-1" /> Add Template
              </Button>
            </div>

            {ptLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : ptError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600">Failed to load passport templates</p>
                <Button size="sm" variant="outline" onClick={loadPassportTemplates} className="mt-2">Retry</Button>
              </div>
            ) : passportTemplates.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <Fingerprint size={32} className="mx-auto text-text-4 mb-2" />
                <p className="font-bold text-text-2">No passport templates yet</p>
                <p className="text-sm text-text-4">Create your first passport template to define entity schemas</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-off-white border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Entity Type</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Icon</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Color</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Fields</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-text-4 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {passportTemplates.map((pt) => (
                      editingPt === pt.id ? (
                        <tr key={pt.id} className="bg-off-white">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid grid-cols-4 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-text-4 uppercase">Name</label>
                                <input
                                  type="text"
                                  value={editPtForm.name}
                                  onChange={(e) => setEditPtForm({ ...editPtForm, name: e.target.value })}
                                  className="w-full h-8 px-2 text-xs border border-border rounded mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-4 uppercase">Icon</label>
                                <input
                                  type="text"
                                  value={editPtForm.icon}
                                  onChange={(e) => setEditPtForm({ ...editPtForm, icon: e.target.value })}
                                  placeholder="emoji or icon name"
                                  className="w-full h-8 px-2 text-xs border border-border rounded mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-4 uppercase">Color</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <input
                                    type="color"
                                    value={editPtForm.color || "#0A1628"}
                                    onChange={(e) => setEditPtForm({ ...editPtForm, color: e.target.value })}
                                    className="w-8 h-8 border border-border rounded cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={editPtForm.color || ""}
                                    onChange={(e) => setEditPtForm({ ...editPtForm, color: e.target.value })}
                                    className="flex-1 h-8 px-2 text-xs border border-border rounded font-mono"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-text-4 uppercase">Active</label>
                                <div className="mt-2">
                                  <input
                                    type="checkbox"
                                    checked={editPtForm.is_active}
                                    onChange={(e) => setEditPtForm({ ...editPtForm, is_active: e.target.checked })}
                                    id={`edit-pt-active-${pt.id}`}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button size="sm" onClick={() => updatePassportTemplate(pt.id)}>
                                <Save size={12} className="mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingPt(null)}>
                                <X size={12} className="mr-1" /> Cancel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <>
                          <tr
                            key={pt.id}
                            className="border-b border-border last:border-0 hover:bg-off-white/50 cursor-pointer"
                            onClick={() => setExpandedPt(expandedPt === pt.id ? null : pt.id)}
                          >
                            <td className="px-4 py-3">
                              <Badge className="text-[10px] bg-blue-100 text-blue-800">{pt.entity_type}</Badge>
                            </td>
                            <td className="px-4 py-3 font-semibold text-text-1 flex items-center gap-2">
                              {expandedPt === pt.id ? <ChevronDown size={14} className="text-text-4 shrink-0" /> : <ChevronRight size={14} className="text-text-4 shrink-0" />}
                              {pt.name}
                            </td>
                            <td className="px-4 py-3 text-lg">{pt.icon || "—"}</td>
                            <td className="px-4 py-3">
                              {pt.color ? (
                                <span className="inline-block w-5 h-5 rounded-full border border-border" style={{ backgroundColor: pt.color }} />
                              ) : (
                                <span className="text-text-4 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-text-2">{(pt.schema || []).length}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); togglePassportTemplate(pt.id, pt.is_active); }}
                                className={`text-[10px] font-bold px-2 py-1 rounded-full transition-colors ${
                                  pt.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {pt.is_active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPt(pt.id);
                                  setEditPtForm({
                                    name: pt.name,
                                    icon: pt.icon || "",
                                    color: pt.color || "",
                                    is_active: pt.is_active,
                                  });
                                }}
                                className="text-text-4 hover:text-orange transition-colors"
                              >
                                <PencilLine size={14} />
                              </button>
                            </td>
                          </tr>
                          {expandedPt === pt.id && (
                            <tr key={`${pt.id}-detail`} className="bg-off-white/50">
                              <td colSpan={7} className="px-4 py-3">
                                <div className="space-y-3">
                                  <h4 className="text-xs font-bold text-text-4 uppercase">Schema Fields</h4>
                                  {(pt.schema || []).length === 0 ? (
                                    <p className="text-xs text-text-4">No schema fields defined</p>
                                  ) : (
                                    <div className="bg-white border border-border rounded-lg overflow-hidden">
                                      <table className="w-full text-[10px]">
                                        <thead className="bg-off-white border-b border-border">
                                          <tr>
                                            <th className="text-left px-3 py-2 font-bold text-text-4 uppercase">Key</th>
                                            <th className="text-left px-3 py-2 font-bold text-text-4 uppercase">Label</th>
                                            <th className="text-left px-3 py-2 font-bold text-text-4 uppercase">Type</th>
                                            <th className="text-center px-3 py-2 font-bold text-text-4 uppercase">Required</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {pt.schema.map((field: SchemaField, i: number) => (
                                            <tr key={i} className="border-b border-border last:border-0">
                                              <td className="px-3 py-2 font-mono font-semibold text-text-2">{field.key}</td>
                                              <td className="px-3 py-2 text-text-2">{field.label}</td>
                                              <td className="px-3 py-2">
                                                <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                                              </td>
                                              <td className="px-3 py-2 text-center">
                                                {field.required ? (
                                                  <CheckCircle2 size={12} className="text-success mx-auto" />
                                                ) : (
                                                  <XCircle size={12} className="text-red mx-auto" />
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
