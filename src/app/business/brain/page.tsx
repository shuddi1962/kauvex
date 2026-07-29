"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Brain, Upload, FileText, Globe, Link, Database,
  Search, Filter, Trash2, CheckCircle2, XCircle,
  Loader2, AlertCircle, Plus, RefreshCw, FileCog,
  FileSpreadsheet, FileImage, File, BookOpen, FileCode,
  ChevronDown, ChevronRight, X, Zap, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

type DocType = "Catalogue" | "Price List" | "SOP" | "Manual" | "FAQ" | "Contract" | "Drawing" | "Other";
type ProviderType = "Website" | "ERP" | "CRM" | "Inventory" | "Accounting" | "Email";

interface DocumentData {
  id: string;
  name: string;
  type: DocType;
  source: string;
  indexed: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface ConnectionData {
  id: string;
  name: string;
  provider: ProviderType;
  connected: boolean;
  config: Record<string, unknown>;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

const DOC_TYPES: DocType[] = ["Catalogue", "Price List", "SOP", "Manual", "FAQ", "Contract", "Drawing", "Other"];
const PROVIDERS: ProviderType[] = ["Website", "ERP", "CRM", "Inventory", "Accounting", "Email"];

const docTypeIcons: Record<DocType, React.ElementType> = {
  Catalogue: FileSpreadsheet,
  "Price List": FileCog,
  SOP: FileCode,
  Manual: BookOpen,
  FAQ: FileText,
  Contract: FileCog,
  Drawing: FileImage,
  Other: File,
};

const providerIcons: Record<ProviderType, React.ElementType> = {
  Website: Globe,
  ERP: Database,
  CRM: Database,
  Inventory: Database,
  Accounting: FileSpreadsheet,
  Email: Link,
};

export default function CompanyBrainPage() {
  const { user, loading: authLoading } = useAuthStore();
  const [tab, setTab] = useState<"documents" | "connections">("documents");

  // Documents state
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docFilterType, setDocFilterType] = useState<DocType | "All">("All");
  const [docSearch, setDocSearch] = useState("");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [indexingId, setIndexingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connections state
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [connsLoading, setConnsLoading] = useState(true);
  const [connsError, setConnsError] = useState<string | null>(null);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [connName, setConnName] = useState("");
  const [connProvider, setConnProvider] = useState<ProviderType>("Website");
  const [connConfig, setConnConfig] = useState("");
  const [connSubmitting, setConnSubmitting] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try { setDocsLoading(true); setDocsError(null);
      const res = await fetch("/api/v1/kai/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : data.documents ?? []);
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setDocsLoading(false); }
  }, []);

  const fetchConnections = useCallback(async () => {
    try { setConnsLoading(true); setConnsError(null);
      const res = await fetch("/api/v1/kai/connections");
      if (!res.ok) throw new Error("Failed to load connections");
      const data = await res.json();
      setConnections(Array.isArray(data) ? data : data.connections ?? []);
    } catch (err) {
      setConnsError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setConnsLoading(false); }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDocuments();
      fetchConnections();
    }
  }, [authLoading, user, fetchDocuments, fetchConnections]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/kai/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      await fetchDocuments();
    } catch {
      setDocsError("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const indexDocument = async (docId: string) => {
    setIndexingId(docId);
    try {
      const res = await fetch(`/api/v1/kai/documents/${docId}/index`, { method: "POST" });
      if (!res.ok) throw new Error("Indexing failed");
      setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, indexed: true } : d));
    } catch { /* ignore */ }
    finally { setIndexingId(null); }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm("Delete this document? KAI will lose access to this knowledge.")) return;
    try {
      const res = await fetch(`/api/v1/kai/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (expandedDoc === docId) setExpandedDoc(null);
    } catch { /* ignore */ }
  };

  const addConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connName.trim()) { setConnError("Connection name is required"); return; }
    setConnSubmitting(true); setConnError(null);
    try {
      let parsedConfig: Record<string, unknown> = {};
      if (connConfig.trim()) {
        try { parsedConfig = JSON.parse(connConfig); }
        catch { setConnError("Invalid JSON in config"); setConnSubmitting(false); return; }
      }
      const res = await fetch("/api/v1/kai/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: connName.trim(),
          provider: connProvider,
          config: parsedConfig,
        }),
      });
      if (!res.ok) throw new Error("Failed to create connection");
      setConnName(""); setConnConfig(""); setConnProvider("Website");
      setShowAddConnection(false);
      await fetchConnections();
    } catch (err) {
      setConnError(err instanceof Error ? err.message : "Failed to create");
    } finally { setConnSubmitting(false); }
  };

  const syncConnection = async (connId: string) => {
    setSyncingId(connId);
    try {
      const res = await fetch(`/api/v1/kai/connections/${connId}/sync`, { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      setConnections((prev) => prev.map((c) => c.id === connId ? { ...c, last_sync_at: new Date().toISOString() } : c));
    } catch { /* ignore */ }
    finally { setSyncingId(null); }
  };

  const removeConnection = async (connId: string) => {
    if (!confirm("Remove this connection? KAI will lose access to this system.")) return;
    try {
      const res = await fetch(`/api/v1/kai/connections/${connId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Remove failed");
      setConnections((prev) => prev.filter((c) => c.id !== connId));
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

  const filteredDocs = documents.filter((d) => {
    if (docFilterType !== "All" && d.type !== docFilterType) return false;
    if (docSearch && !d.name.toLowerCase().includes(docSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-kauvex-navy flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-kauvex-orange-tint flex items-center justify-center">
              <Brain className="w-5 h-5 text-kauvex-orange" />
            </div>
            Company Brain
          </h1>
          <p className="text-sm text-text-3 mt-0.5 ml-12">
            Upload knowledge and connect systems to make KAI smarter about your business
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-border p-1 shadow-soft mb-6">
        <button
          onClick={() => setTab("documents")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "documents"
              ? "bg-kauvex-navy text-white shadow-sm"
              : "text-text-3 hover:text-kauvex-navy hover:bg-gray-50"
          )}
        >
          <FileText className="w-4 h-4" />
          Documents
          {documents.length > 0 && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-bold", tab === "documents" ? "bg-white/20 text-white" : "bg-gray-100 text-text-3")}>
              {documents.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("connections")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            tab === "connections"
              ? "bg-kauvex-navy text-white shadow-sm"
              : "text-text-3 hover:text-kauvex-navy hover:bg-gray-50"
          )}
        >
          <Globe className="w-4 h-4" />
          Connections
          {connections.length > 0 && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-bold", tab === "connections" ? "bg-white/20 text-white" : "bg-gray-100 text-text-3")}>
              {connections.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {tab === "documents" ? (
        <DocumentsTab
          documents={filteredDocs}
          loading={docsLoading}
          error={docsError}
          filterType={docFilterType}
          onFilterTypeChange={setDocFilterType}
          search={docSearch}
          onSearchChange={setDocSearch}
          expandedDoc={expandedDoc}
          onToggleExpand={setExpandedDoc}
          indexingId={indexingId}
          onIndex={indexDocument}
          onDelete={deleteDocument}
          uploading={uploading}
          onUpload={handleFileUpload}
          fileInputRef={fileInputRef}
          onRefresh={fetchDocuments}
        />
      ) : (
        <ConnectionsTab
          connections={connections}
          loading={connsLoading}
          error={connsError}
          showAdd={showAddConnection}
          onToggleAdd={() => { setShowAddConnection((p) => !p); setConnError(null); }}
          connName={connName}
          onConnNameChange={setConnName}
          connProvider={connProvider}
          onConnProviderChange={setConnProvider}
          connConfig={connConfig}
          onConnConfigChange={setConnConfig}
          connSubmitting={connSubmitting}
          connError={connError}
          onSubmit={addConnection}
          syncingId={syncingId}
          onSync={syncConnection}
          onRemove={removeConnection}
          onRefresh={fetchConnections}
        />
      )}
    </div>
  );
}

function DocumentsTab({
  documents, loading, error, filterType, onFilterTypeChange,
  search, onSearchChange, expandedDoc, onToggleExpand,
  indexingId, onIndex, onDelete, uploading, onUpload,
  fileInputRef, onRefresh,
}: {
  documents: DocumentData[]; loading: boolean; error: string | null;
  filterType: DocType | "All"; onFilterTypeChange: (v: DocType | "All") => void;
  search: string; onSearchChange: (v: string) => void;
  expandedDoc: string | null; onToggleExpand: (v: string | null) => void;
  indexingId: string | null; onIndex: (id: string) => void;
  onDelete: (id: string) => void; uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRefresh: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-6">
      {/* Upload dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file && fileInputRef.current) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInputRef.current.files = dt.files;
            onUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
        className={cn(
          "relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer group",
          dragOver
            ? "border-kauvex-orange bg-kauvex-orange-tint scale-[1.01]"
            : "border-gray-300 bg-white hover:border-kauvex-orange/50 hover:bg-gray-50/50"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onUpload}
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.json,.md,.png,.jpg,.jpeg"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-kauvex-orange animate-spin" />
            <p className="text-sm font-medium text-kauvex-navy">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              dragOver ? "bg-kauvex-orange text-white" : "bg-gray-100 text-text-3 group-hover:bg-kauvex-orange-tint group-hover:text-kauvex-orange"
            )}>
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-kauvex-navy">
                {dragOver ? "Drop file here" : "Upload files for KAI to learn"}
              </p>
              <p className="text-xs text-text-3 mt-0.5">
                PDF, Word, Excel, CSV, JSON, MD, Images
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all"
          />
        </div>
        <div className="relative w-full sm:w-44">
          <Filter className="w-4 h-4 text-text-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value as DocType | "All")}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange transition-all appearance-none"
          >
            <option value="All">All Types</option>
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 shadow-soft animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={onRefresh}>Try Again</Button>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-kauvex-orange-tint flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-kauvex-orange" />
          </div>
          <h3 className="text-lg font-semibold text-kauvex-navy mb-1">No documents yet</h3>
          <p className="text-sm text-text-3 mb-2 max-w-sm mx-auto">
            Upload documents to teach KAI about your business operations, products, and policies.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const isExpanded = expandedDoc === doc.id;
            const DocIcon = docTypeIcons[doc.type] || File;
            return (
              <div key={doc.id} className="bg-white rounded-xl border border-border shadow-soft overflow-hidden transition-all">
                <button
                  onClick={() => onToggleExpand(isExpanded ? null : doc.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <DocIcon className="w-4 h-4 text-text-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-kauvex-navy truncate">{doc.name}</span>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">{doc.type}</Badge>
                      <Badge variant="navy" className="text-[10px] px-2 py-0.5">{doc.source}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-medium",
                        doc.indexed ? "text-green-600" : "text-text-4"
                      )}>
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          doc.indexed ? "bg-green-500" : "bg-gray-300"
                        )} />
                        {doc.indexed ? "Indexed" : "Not Indexed"}
                      </span>
                      <span className="text-[10px] text-text-4">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-text-3 transition-transform flex-shrink-0", isExpanded && "rotate-180")} />
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3 bg-gray-50/50">
                    {doc.metadata && Object.keys(doc.metadata).length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wider mb-1.5">Metadata</p>
                        <pre className="bg-white rounded-lg border border-border p-3 text-xs font-mono text-text-3 overflow-x-auto max-h-32">
                          {JSON.stringify(doc.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {!doc.indexed && (
                        <Button size="sm" onClick={() => onIndex(doc.id)} loading={indexingId === doc.id}>
                          <Zap className="w-3.5 h-3.5 mr-1" />
                          Index Now
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => onDelete(doc.id)}>
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConnectionsTab({
  connections, loading, error, showAdd, onToggleAdd,
  connName, onConnNameChange, connProvider, onConnProviderChange,
  connConfig, onConnConfigChange, connSubmitting, connError,
  onSubmit, syncingId, onSync, onRemove, onRefresh,
}: {
  connections: ConnectionData[]; loading: boolean; error: string | null;
  showAdd: boolean; onToggleAdd: () => void;
  connName: string; onConnNameChange: (v: string) => void;
  connProvider: ProviderType; onConnProviderChange: (v: ProviderType) => void;
  connConfig: string; onConnConfigChange: (v: string) => void;
  connSubmitting: boolean; connError: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  syncingId: string | null; onSync: (id: string) => void;
  onRemove: (id: string) => void; onRefresh: () => void;
}) {
  const ProviderIcon = providerIcons[connProvider];

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-5 shadow-soft animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
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

  return (
    <div className="space-y-6">
      {/* Add connection form */}
      {showAdd && (
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-border shadow-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-kauvex-navy flex items-center gap-2">
              <Plus className="w-4 h-4 text-kauvex-orange" />
              New Connection
            </h3>
            <button type="button" onClick={onToggleAdd} className="p-1 rounded text-text-3 hover:text-red-600 hover:bg-red-50">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-text-3 block mb-1">Name</label>
              <input
                value={connName}
                onChange={(e) => onConnNameChange(e.target.value)}
                placeholder="e.g., My ERP System"
                className="w-full h-9 px-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30"
              />
            </div>
            <div className="relative">
              <label className="text-[10px] font-semibold text-text-3 block mb-1">Provider</label>
              <div className="relative">
                <select
                  value={connProvider}
                  onChange={(e) => onConnProviderChange(e.target.value as ProviderType)}
                  className="w-full h-9 pl-8 pr-2.5 rounded-lg border border-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 appearance-none"
                >
                  {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ProviderIcon className="w-3.5 h-3.5 text-text-3 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-text-3 block mb-1">Config (JSON)</label>
            <textarea
              value={connConfig}
              onChange={(e) => onConnConfigChange(e.target.value)}
              placeholder='{"api_url": "https://...", "api_key": "..."}'
              rows={3}
              className="w-full px-2.5 py-2 rounded-lg border border-border text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 resize-none"
            />
          </div>
          {connError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{connError}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" loading={connSubmitting}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Connection
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onToggleAdd}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Connection cards */}
      {connections.length === 0 && !showAdd ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-kauvex-orange-tint flex items-center justify-center mx-auto mb-4">
            <Globe className="w-7 h-7 text-kauvex-orange" />
          </div>
          <h3 className="text-lg font-semibold text-kauvex-navy mb-1">No connections yet</h3>
          <p className="text-sm text-text-3 mb-6 max-w-sm mx-auto">
            Connect your systems to give KAI real-time access to your business data.
          </p>
          <Button onClick={onToggleAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Connection
          </Button>
        </div>
      ) : (
        <>
          {!showAdd && (
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={onToggleAdd}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add Connection
              </Button>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {connections.map((conn) => {
              const Icon = providerIcons[conn.provider] || Database;
              return (
                <div key={conn.id} className="bg-white rounded-xl border border-border shadow-soft p-5 hover:shadow-medium transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      conn.connected ? "bg-green-50" : "bg-gray-100"
                    )}>
                      <Icon className={cn("w-5 h-5", conn.connected ? "text-green-600" : "text-text-3")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-kauvex-navy">{conn.name}</span>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">{conn.provider}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {conn.connected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[11px] font-medium text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-text-4" />
                            <span className="text-[11px] font-medium text-text-4">Not Connected</span>
                          </>
                        )}
                        {conn.last_sync_at && (
                          <>
                            <span className="text-text-4 text-[10px] mx-0.5">·</span>
                            <span className="text-[10px] text-text-4">
                              Synced {new Date(conn.last_sync_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant={conn.connected ? "outline" : "default"}
                          onClick={() => onSync(conn.id)}
                          loading={syncingId === conn.id}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          Sync Now
                        </Button>
                        <button
                          onClick={() => onRemove(conn.id)}
                          className="p-1.5 rounded-lg text-text-3 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
