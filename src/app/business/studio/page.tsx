"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Workflow, Plus, Trash2, ToggleLeft, ToggleRight,
  ArrowUp, ArrowDown, Zap, Clock, Webhook, Play,
  Condition, FileCode, Bot, ChevronDown, ChevronRight,
  Loader2, AlertCircle, Server, AlertTriangle, CheckCircle2,
  X, Save, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

type TriggerType = "Event" | "Schedule" | "Webhook" | "Manual";
type StepType = "condition" | "action" | "delay" | "notification" | "api_call" | "agent_task";

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_type: StepType;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface WorkflowData {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  trigger_config: Record<string, unknown>;
  is_active: boolean;
  step_count: number;
  steps?: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

const TRIGGER_TYPES: TriggerType[] = ["Event", "Schedule", "Webhook", "Manual"];
const STEP_TYPES: { value: StepType; label: string; icon: React.ElementType }[] = [
  { value: "condition", label: "Condition", icon: Condition },
  { value: "action", label: "Action", icon: Zap },
  { value: "delay", label: "Delay", icon: Clock },
  { value: "notification", label: "Notification", icon: Bot },
  { value: "api_call", label: "API Call", icon: FileCode },
  { value: "agent_task", label: "Agent Task", icon: Server },
];

const triggerIcons: Record<TriggerType, React.ElementType> = {
  Event: Zap,
  Schedule: Clock,
  Webhook: Webhook,
  Manual: Play,
};

const stepTypeColors: Record<StepType, string> = {
  condition: "bg-amber-50 text-amber-700 border-amber-200",
  action: "bg-blue-50 text-blue-700 border-blue-200",
  delay: "bg-purple-50 text-purple-700 border-purple-200",
  notification: "bg-green-50 text-green-700 border-green-200",
  api_call: "bg-cyan-50 text-cyan-700 border-cyan-200",
  agent_task: "bg-kauvex-orange-tint text-kauvex-orange border-kauvex-orange/20",
};

export default function KAIStudioPage() {
  const { user, loading: authLoading } = useAuthStore();
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"list" | "new">("list");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingStepWorkflow, setEditingStepWorkflow] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTriggerType, setFormTriggerType] = useState<TriggerType>("Event");
  const [formTriggerConfig, setFormTriggerConfig] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newStepType, setNewStepType] = useState<StepType>("action");
  const [newStepConfig, setNewStepConfig] = useState("");
  const [newStepSubmitting, setNewStepSubmitting] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/kai/workflows");
      if (!res.ok) throw new Error("Failed to load workflows");
      const data = await res.json();
      setWorkflows(Array.isArray(data) ? data : data.workflows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) fetchWorkflows();
  }, [authLoading, user, fetchWorkflows]);

  const createWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Workflow name is required");
      return;
    }
    setFormSubmitting(true);
    setFormError(null);
    try {
      let parsedConfig: Record<string, unknown> = {};
      if (formTriggerConfig.trim()) {
        try { parsedConfig = JSON.parse(formTriggerConfig); }
        catch { setFormError("Invalid JSON in trigger config"); setFormSubmitting(false); return; }
      }
      const res = await fetch("/api/v1/kai/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim() || null,
          trigger_type: formTriggerType,
          trigger_config: parsedConfig,
          is_active: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to create workflow");
      setFormName("");
      setFormDescription("");
      setFormTriggerType("Event");
      setFormTriggerConfig("");
      setTab("list");
      await fetchWorkflows();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleActive = async (wf: WorkflowData) => {
    try {
      const res = await fetch(`/api/v1/kai/workflows/${wf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !wf.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setWorkflows((prev) => prev.map((w) => w.id === wf.id ? { ...w, is_active: !w.is_active } : w));
    } catch { /* ignore */ }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Delete this workflow? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/v1/kai/workflows/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { /* ignore */ }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingStepWorkflow(null);
      return;
    }
    setExpandedId(id);
    setEditingStepWorkflow(null);
    try {
      const res = await fetch(`/api/v1/kai/workflows/${id}/steps`);
      if (!res.ok) throw new Error("Failed to load steps");
      const data = await res.json();
      const steps = Array.isArray(data) ? data : data.steps ?? [];
      setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, steps } : w));
    } catch { /* ignore */ }
  };

  const addStep = async (workflowId: string) => {
    setNewStepSubmitting(true);
    try {
      let parsedConfig: Record<string, unknown> = {};
      if (newStepConfig.trim()) {
        try { parsedConfig = JSON.parse(newStepConfig); }
        catch { setNewStepSubmitting(false); return; }
      }
      const wf = workflows.find((w) => w.id === workflowId);
      const nextOrder = (wf?.steps?.length ?? 0) + 1;
      const res = await fetch(`/api/v1/kai/workflows/${workflowId}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step_order: nextOrder,
          step_type: newStepType,
          config: parsedConfig,
        }),
      });
      if (!res.ok) throw new Error("Failed to add step");
      setNewStepType("action");
      setNewStepConfig("");
      const stepsRes = await fetch(`/api/v1/kai/workflows/${workflowId}/steps`);
      if (stepsRes.ok) {
        const stepsData = await stepsRes.json();
        const steps = Array.isArray(stepsData) ? stepsData : stepsData.steps ?? [];
        setWorkflows((prev) => prev.map((w) => w.id === workflowId ? { ...w, steps } : w));
      }
    } catch { /* ignore */ }
    finally { setNewStepSubmitting(false); }
  };

  const deleteStep = async (workflowId: string, stepId: string) => {
    try {
      const res = await fetch(`/api/v1/kai/workflows/${workflowId}/steps/${stepId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete step");
      const stepsRes = await fetch(`/api/v1/kai/workflows/${workflowId}/steps`);
      if (stepsRes.ok) {
        const stepsData = await stepsRes.json();
        const steps = Array.isArray(stepsData) ? stepsData : stepsData.steps ?? [];
        setWorkflows((prev) => prev.map((w) => w.id === workflowId ? { ...w, steps } : w));
      }
    } catch { /* ignore */ }
  };

  const reorderStep = async (workflowId: string, stepId: string, direction: "up" | "down") => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf?.steps) return;
    const idx = wf.steps.findIndex((s) => s.id === stepId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === wf.steps.length - 1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    const newSteps = [...wf.steps];
    [newSteps[idx], newSteps[newIdx]] = [newSteps[newIdx], newSteps[idx]];
    newSteps.forEach((s, i) => (s.step_order = i + 1));
    try {
      await fetch(`/api/v1/kai/workflows/${workflowId}/steps/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step_ids: newSteps.map((s) => ({ id: s.id, order: s.step_order })) }),
      });
      setWorkflows((prev) => prev.map((w) => w.id === workflowId ? { ...w, steps: newSteps } : w));
    } catch { /* ignore */ }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-kauvex-orange/30 border-t-kauvex-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-kauvex-navy flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-kauvex-orange-tint flex items-center justify-center">
              <Workflow className="w-5 h-5 text-kauvex-orange" />
            </div>
            Workflow Studio
          </h1>
          <p className="text-sm text-text-3 mt-0.5 ml-12">
            Build and manage automation workflows for your business
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 shadow-soft mb-6">
        <button
          onClick={() => setTab("list")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "list"
              ? "bg-kauvex-navy text-white shadow-sm"
              : "text-text-3 hover:text-kauvex-navy hover:bg-gray-50"
          )}
        >
          <Workflow className="w-4 h-4" />
          My Workflows
          {workflows.length > 0 && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded-full font-bold",
              tab === "list" ? "bg-white/20 text-white" : "bg-gray-100 text-text-3"
            )}>
              {workflows.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("new")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "new"
              ? "bg-kauvex-navy text-white shadow-sm"
              : "text-text-3 hover:text-kauvex-navy hover:bg-gray-50"
          )}
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Content */}
      {tab === "list" ? (
        <WorkflowList
          workflows={workflows}
          loading={loading}
          error={error}
          expandedId={expandedId}
          onToggleExpand={toggleExpand}
          onToggleActive={toggleActive}
          onDelete={deleteWorkflow}
          onReorderStep={reorderStep}
          onDeleteStep={deleteStep}
          editingStepWorkflow={editingStepWorkflow}
          setEditingStepWorkflow={setEditingStepWorkflow}
          newStepType={newStepType}
          setNewStepType={setNewStepType}
          newStepConfig={newStepConfig}
          setNewStepConfig={setNewStepConfig}
          onAddStep={addStep}
          newStepSubmitting={newStepSubmitting}
          onRefresh={fetchWorkflows}
        />
      ) : (
        <NewWorkflowForm
          name={formName}
          onNameChange={setFormName}
          description={formDescription}
          onDescriptionChange={setFormDescription}
          triggerType={formTriggerType}
          onTriggerTypeChange={setFormTriggerType}
          triggerConfig={formTriggerConfig}
          onTriggerConfigChange={setFormTriggerConfig}
          onSubmit={createWorkflow}
          submitting={formSubmitting}
          error={formError}
          onCancel={() => { setTab("list"); setFormError(null); }}
        />
      )}
    </div>
  );
}

function WorkflowList({
  workflows, loading, error, expandedId, onToggleExpand,
  onToggleActive, onDelete, onReorderStep, onDeleteStep,
  editingStepWorkflow, setEditingStepWorkflow,
  newStepType, setNewStepType, newStepConfig, setNewStepConfig,
  onAddStep, newStepSubmitting, onRefresh,
}: {
  workflows: WorkflowData[]; loading: boolean; error: string | null;
  expandedId: string | null; onToggleExpand: (id: string) => void;
  onToggleActive: (wf: WorkflowData) => void; onDelete: (id: string) => void;
  onReorderStep: (wfId: string, stepId: string, dir: "up" | "down") => void;
  onDeleteStep: (wfId: string, stepId: string) => void;
  editingStepWorkflow: string | null; setEditingStepWorkflow: (id: string | null) => void;
  newStepType: StepType; setNewStepType: (t: StepType) => void;
  newStepConfig: string; setNewStepConfig: (c: string) => void;
  onAddStep: (wfId: string) => void; newStepSubmitting: boolean;
  onRefresh: () => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-5 shadow-soft animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-700 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={onRefresh}>Try Again</Button>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-12 text-center shadow-soft">
        <div className="w-14 h-14 rounded-2xl bg-kauvex-orange-tint flex items-center justify-center mx-auto mb-4">
          <Workflow className="w-7 h-7 text-kauvex-orange" />
        </div>
        <h3 className="text-lg font-semibold text-kauvex-navy mb-1">No workflows yet</h3>
        <p className="text-sm text-text-3 mb-6 max-w-sm mx-auto">
          Create your first automation to streamline your business processes with KAI.
        </p>
        <Button onClick={onRefresh}>Create Your First Workflow</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workflows.map((wf) => {
        const isExpanded = expandedId === wf.id;
        const TriggerIcon = triggerIcons[wf.trigger_type];
        return (
          <div key={wf.id} className="bg-white rounded-xl border border-border shadow-soft overflow-hidden transition-all">
            {/* Header row */}
            <button
              onClick={() => onToggleExpand(wf.id)}
              className="w-full flex items-center gap-3 p-4 md:p-5 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                wf.is_active ? "bg-kauvex-orange-tint" : "bg-gray-100"
              )}>
                <TriggerIcon className={cn("w-4 h-4", wf.is_active ? "text-kauvex-orange" : "text-text-4")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-kauvex-navy truncate">{wf.name}</span>
                  <Badge variant={wf.is_active ? "orange" : "outline"} className="text-[10px] px-2 py-0.5">
                    {wf.trigger_type}
                  </Badge>
                </div>
                <p className="text-xs text-text-3 mt-0.5 truncate">
                  {wf.description || `${wf.step_count} step${wf.step_count !== 1 ? "s" : ""}`}
                  <span className="text-text-4 mx-1.5">·</span>
                  Updated {new Date(wf.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={wf.is_active ? "success" : "outline"} className="text-[10px] px-2 py-0.5 hidden sm:inline-flex">
                  {wf.step_count} step{wf.step_count !== 1 ? "s" : ""}
                </Badge>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleActive(wf); }}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    wf.is_active ? "text-green-600 hover:bg-green-50" : "text-text-3 hover:bg-gray-100"
                  )}
                  title={wf.is_active ? "Active" : "Inactive"}
                >
                  {wf.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(wf.id); }}
                  className="p-1.5 rounded-lg text-text-3 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronDown className={cn("w-4 h-4 text-text-3 transition-transform", isExpanded && "rotate-180")} />
              </div>
            </button>

            {/* Expanded steps pipeline */}
            {isExpanded && (
              <div className="border-t border-border bg-gray-50/50 px-4 md:px-5 pb-5">
                <div className="pt-4 space-y-0">
                  {/* Trigger pill at top of pipeline */}
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-kauvex-navy text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        <Play className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-kauvex-navy">{wf.trigger_type}</span>
                        <Badge variant="navy" className="text-[10px] px-1.5 py-0">Trigger</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline connector */}
                  <div className="flex items-center justify-center py-1">
                    <div className="w-0.5 h-6 bg-gray-300 rounded-full" />
                  </div>

                  {/* Steps */}
                  {(wf.steps ?? []).length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-text-4 mb-3">No steps defined yet</p>
                    </div>
                  ) : (
                    wf.steps!.map((step, idx) => (
                      <div key={step.id} className="relative">
                        <div className="flex items-stretch gap-3 group">
                          {/* Step number + connector */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0",
                              stepTypeColors[step.step_type].split(" ")[0]
                            )}>
                              {idx + 1}
                            </div>
                            {idx < wf.steps!.length - 1 && (
                              <div className="w-0.5 flex-1 min-h-[24px] bg-gray-300 rounded-full my-1" />
                            )}
                          </div>

                          {/* Step card */}
                          <div className="flex-1 min-w-0 pb-3">
                            <div className="bg-white rounded-lg border border-border p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {(() => {
                                    const st = STEP_TYPES.find((s) => s.value === step.step_type);
                                    const Icon = st?.icon || Zap;
                                    return <Icon className="w-3.5 h-3.5 text-text-3 flex-shrink-0 mt-0.5" />;
                                  })()}
                                  <div>
                                    <span className={cn(
                                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-md border",
                                      stepTypeColors[step.step_type]
                                    )}>
                                      {step.step_type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </span>
                                    {step.config && Object.keys(step.config).length > 0 && (
                                      <p className="text-xs text-text-3 mt-1 truncate max-w-xs">
                                        {JSON.stringify(step.config).slice(0, 80)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  <button
                                    onClick={() => onReorderStep(wf.id, step.id, "up")}
                                    disabled={idx === 0}
                                    className="p-1 rounded text-text-3 hover:text-kauvex-navy hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onReorderStep(wf.id, step.id, "down")}
                                    disabled={idx === wf.steps!.length - 1}
                                    className="p-1 rounded text-text-3 hover:text-kauvex-navy hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteStep(wf.id, step.id)}
                                    className="p-1 rounded text-text-3 hover:text-red-600 hover:bg-red-50"
                                    title="Delete step"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Arrow connector between steps */}
                        {idx < wf.steps!.length - 1 && (
                          <div className="flex items-center justify-center py-0">
                            <div className="w-0.5 h-4 bg-gray-300 rounded-full" />
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {/* Add step form */}
                  {editingStepWorkflow === wf.id ? (
                    <div className="mt-3 bg-white rounded-lg border border-dashed border-kauvex-orange/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Plus className="w-4 h-4 text-kauvex-orange" />
                        <span className="text-xs font-semibold text-kauvex-navy">New Step</span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] font-semibold text-text-3 block mb-1">Type</label>
                          <select
                            value={newStepType}
                            onChange={(e) => setNewStepType(e.target.value as StepType)}
                            className="w-full h-9 px-2.5 rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30"
                          >
                            {STEP_TYPES.map((st) => (
                              <option key={st.value} value={st.value}>{st.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-semibold text-text-3 block mb-1">Config (JSON)</label>
                          <input
                            value={newStepConfig}
                            onChange={(e) => setNewStepConfig(e.target.value)}
                            placeholder='{"key": "value"}'
                            className="w-full h-9 px-2.5 rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => onAddStep(wf.id)} loading={newStepSubmitting}>
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Save Step
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingStepWorkflow(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-green-50 border-2 border-dashed border-green-300 flex items-center justify-center">
                          <Plus className="w-3 h-3 text-green-500" />
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingStepWorkflow(wf.id)}
                        className="text-xs font-medium text-kauvex-orange hover:text-kauvex-orange-dark transition-colors"
                      >
                        + Add Step
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NewWorkflowForm({
  name, onNameChange, description, onDescriptionChange,
  triggerType, onTriggerTypeChange, triggerConfig, onTriggerConfigChange,
  onSubmit, submitting, error, onCancel,
}: {
  name: string; onNameChange: (v: string) => void;
  description: string; onDescriptionChange: (v: string) => void;
  triggerType: TriggerType; onTriggerTypeChange: (v: TriggerType) => void;
  triggerConfig: string; onTriggerConfigChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean; error: string | null; onCancel: () => void;
}) {
  const TriggerIcon = triggerIcons[triggerType];
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-border shadow-soft p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-kauvex-navy">Create New Workflow</h2>
          <p className="text-sm text-text-3 mt-0.5">
            Define an automation workflow triggered by events, schedules, or webhooks
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-3 block mb-1.5">
              Workflow Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., New Order Notification"
              className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-3 block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="What does this workflow do?"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-3 block mb-1.5">Trigger Type</label>
              <div className="relative">
                <select
                  value={triggerType}
                  onChange={(e) => onTriggerTypeChange(e.target.value as TriggerType)}
                  className="w-full h-11 pl-10 pr-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all appearance-none"
                >
                  {TRIGGER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <TriggerIcon className="w-4 h-4 text-text-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-3 block mb-1.5">Trigger Config (JSON)</label>
            <textarea
              value={triggerConfig}
              onChange={(e) => onTriggerConfigChange(e.target.value)}
              placeholder='{"schedule": "0 9 * * 1-5", "event": "order.created"}'
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" size="lg" loading={submitting}>
            {submitting ? "Creating..." : "Create Workflow"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
