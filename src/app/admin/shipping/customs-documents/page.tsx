"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Search, FileText, CheckCircle2, XCircle, AlertTriangle, Clock, Eye, RefreshCw } from "lucide-react";

const DEMO_DOCS = [
  {
    id: "cd1",
    shipment_id: "SH-2026-001234",
    shipment_type: "marketplace",
    document_type: "commercial_invoice",
    hs_codes: [{ code: "8517.12", description: "Smartphones", quantity: 2 }, { code: "8504.40", description: "Chargers", quantity: 3 }],
    declared_value: 1850.00,
    currency: "USD",
    origin_country: "NG",
    dest_country: "GB",
    customs_status: "cleared",
    duties_estimated: 0,
    duties_actual: 0,
    duties_paid_by: "customer",
    created_at: "2026-06-25T10:30:00Z",
  },
  {
    id: "cd2",
    shipment_id: "SH-2026-001235",
    shipment_type: "express",
    document_type: "cn23",
    hs_codes: [{ code: "6109.10", description: "Cotton T-shirts", quantity: 50 }],
    declared_value: 450.00,
    currency: "USD",
    origin_country: "NG",
    dest_country: "US",
    customs_status: "pending",
    duties_estimated: 0,
    duties_actual: null,
    duties_paid_by: "customer",
    created_at: "2026-06-26T08:15:00Z",
  },
  {
    id: "cd3",
    shipment_id: "SH-2026-001180",
    shipment_type: "marketplace",
    document_type: "commercial_invoice",
    hs_codes: [
      { code: "3304.99", description: "Skincare cream", quantity: 20 },
      { code: "3303.00", description: "Perfume", quantity: 10 },
      { code: "6703.00", description: "Hair extensions", quantity: 30 },
    ],
    declared_value: 3200.00,
    currency: "USD",
    origin_country: "NG",
    dest_country: "AE",
    customs_status: "held",
    duties_estimated: 160.00,
    duties_actual: null,
    duties_paid_by: "customer",
    created_at: "2026-06-24T14:00:00Z",
  },
  {
    id: "cd4",
    shipment_id: "SH-2026-001100",
    shipment_type: "express",
    document_type: "commercial_invoice",
    hs_codes: [{ code: "8471.30", description: "Laptop — MacBook Air M2", quantity: 1 }],
    declared_value: 999.00,
    currency: "USD",
    origin_country: "US",
    dest_country: "NG",
    customs_status: "cleared",
    duties_estimated: 49.95,
    duties_actual: 52.30,
    duties_paid_by: "customer",
    created_at: "2026-06-20T09:00:00Z",
  },
  {
    id: "cd5",
    shipment_id: "SH-2026-001050",
    shipment_type: "marketplace",
    document_type: "packing_list",
    hs_codes: [{ code: "9503.00", description: "Toys — action figures", quantity: 100 }],
    declared_value: 750.00,
    currency: "USD",
    origin_country: "CN",
    dest_country: "NG",
    customs_status: "submitted",
    duties_estimated: 112.50,
    duties_actual: null,
    duties_paid_by: "kauvex",
    created_at: "2026-06-22T11:30:00Z",
  },
  {
    id: "cd6",
    shipment_id: "SH-2026-000980",
    shipment_type: "express",
    document_type: "cn22",
    hs_codes: [{ code: "4901.99", description: "Books — programming textbooks", quantity: 4 }],
    declared_value: 120.00,
    currency: "GBP",
    origin_country: "GB",
    dest_country: "NG",
    customs_status: "cleared",
    duties_estimated: 0,
    duties_actual: 0,
    duties_paid_by: "customer",
    created_at: "2026-06-18T16:00:00Z",
  },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
  submitted: { label: "Submitted", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  cleared: { label: "Cleared", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  held: { label: "Held", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
};

export default function CustomsDocumentsPage() {
  const [documents] = useState(DEMO_DOCS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<typeof DEMO_DOCS[0] | null>(null);

  const filtered = documents.filter((d) => {
    if (filterStatus !== "all" && d.customs_status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.shipment_id.toLowerCase().includes(q) || d.hs_codes.some((h) => h.description.toLowerCase().includes(q));
    }
    return true;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.customs_status === "pending").length,
    cleared: documents.filter((d) => d.customs_status === "cleared").length,
    held: documents.filter((d) => d.customs_status === "held").length,
  };

  return (
    <AdminShell title="Customs Documents" subtitle="Manage customs declarations, duties, and compliance">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Documents</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Cleared</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.cleared}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Held</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{stats.held}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shipment ID or HS code description..."
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 px-3 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none"
        >
          <option value="all">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Document</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Shipment</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">HS Codes</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Value</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Duties Est.</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="p-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((doc) => {
              const status = STATUS_CONFIG[doc.customs_status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              return (
                <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <span className="text-sm font-medium text-[#0A1628] capitalize">{doc.document_type.replace(/_/g, " ")}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-mono text-gray-500">{doc.shipment_id}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{doc.origin_country} → {doc.dest_country}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {doc.hs_codes.slice(0, 2).map((hs, i) => (
                        <span key={i} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {hs.code}
                        </span>
                      ))}
                      {doc.hs_codes.length > 2 && (
                        <span className="text-[10px] text-gray-400">+{doc.hs_codes.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm font-medium text-[#0A1628]">
                    {doc.currency} {doc.declared_value.toLocaleString()}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {doc.currency} {doc.duties_estimated.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setSelectedDoc(null)}>
          <div className="bg-white rounded-2xl w-[560px] p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0A1628]">Customs Document</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600 text-lg">X</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Shipment</span><span className="font-mono font-medium">{selectedDoc.shipment_id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{selectedDoc.document_type.replace(/_/g, " ")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-medium">{selectedDoc.origin_country} → {selectedDoc.dest_country}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Declared Value</span><span className="font-medium">{selectedDoc.currency} {selectedDoc.declared_value.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duties (Estimated)</span><span className="font-medium">{selectedDoc.currency} {selectedDoc.duties_estimated.toLocaleString()}</span></div>
              {selectedDoc.duties_actual !== null && (
                <div className="flex justify-between"><span className="text-gray-500">Duties (Actual)</span><span className="font-medium">{selectedDoc.currency} {selectedDoc.duties_actual.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">Paid By</span><span className="font-medium capitalize">{selectedDoc.duties_paid_by}</span></div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-500 mb-2">HS Codes</p>
                <div className="space-y-1">
                  {selectedDoc.hs_codes.map((hs, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-mono text-xs font-semibold">{hs.code}</span>
                      <span className="text-xs text-gray-600 flex-1 mx-3">{hs.description}</span>
                      <span className="text-xs text-gray-400">x{hs.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
