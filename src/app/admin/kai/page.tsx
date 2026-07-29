"use client";

import { useState, useEffect } from "react";
import {
  Brain, Database, MessageSquare, Settings, RefreshCw, Search,
  Plus, Trash2, Key, Globe, CheckCircle2, XCircle, Loader2,
  BookOpen, FileText, BarChart3, Clock, Zap,
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

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "knowledge", label: "Knowledge Base", icon: BookOpen },
  { key: "conversations", label: "Conversations", icon: MessageSquare },
  { key: "config", label: "Configuration", icon: Settings },
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

  useEffect(() => {
    loadData();
  }, []);

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
      </div>
    </AdminShell>
  );
}