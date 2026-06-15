"use client";

import { useState } from "react";
import {
  ShieldCheck, QrCode, Smartphone, CheckCircle, XCircle,
  Clock, Plus, X, Save, Search, AlertTriangle, Hash, UserCheck, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/admin-shell";

const authTabs = [
  { id: "codes", label: "Codes" },
  { id: "verification", label: "Verification Log" },
  { id: "settings", label: "Settings" },
];

const seedCodes = [
  { id: "1", product_id: "PROD-001", serial_number: "SN-2404-0001", authenticity_code: "KCC-AUTH-A1B2C3D4", nfc_tag_id: "NFC-001A", qr_code_url: "/qr/kcc-auth-a1b2c3d4", status: "active", verified_by: null, verified_at: null, created_at: "2026-01-15" },
  { id: "2", product_id: "PROD-002", serial_number: "SN-2404-0002", authenticity_code: "KCC-AUTH-E5F6G7H8", nfc_tag_id: "NFC-002B", qr_code_url: "/qr/kcc-auth-e5f6g7h8", status: "verified", verified_by: "Amara Obi", verified_at: "2026-03-20", created_at: "2026-01-20" },
  { id: "3", product_id: "PROD-003", serial_number: "SN-2404-0003", authenticity_code: "KCC-AUTH-I9J0K1L2", nfc_tag_id: "NFC-003C", qr_code_url: "/qr/kcc-auth-i9j0k1l2", status: "active", verified_by: null, verified_at: null, created_at: "2026-02-01" },
  { id: "4", product_id: "PROD-004", serial_number: "SN-2404-0004", authenticity_code: "KCC-AUTH-M3N4O5P6", nfc_tag_id: "NFC-004D", qr_code_url: "/qr/kcc-auth-m3n4o5p6", status: "revoked", verified_by: "Admin", verified_at: "2026-04-10", created_at: "2026-02-05" },
  { id: "5", product_id: "PROD-005", serial_number: "SN-2404-0005", authenticity_code: "KCC-AUTH-Q7R8S9T0", nfc_tag_id: "NFC-005E", qr_code_url: "/qr/kcc-auth-q7r8s9t0", status: "verified", verified_by: "Chidi Eze", verified_at: "2026-04-01", created_at: "2026-02-10" },
  { id: "6", product_id: "PROD-006", serial_number: "SN-2404-0006", authenticity_code: "KCC-AUTH-U1V2W3X4", nfc_tag_id: "NFC-006F", qr_code_url: "/qr/kcc-auth-u1v2w3x4", status: "active", verified_by: null, verified_at: null, created_at: "2026-02-15" },
  { id: "7", product_id: "PROD-007", serial_number: "SN-2404-0007", authenticity_code: "KCC-AUTH-Y5Z6A7B8", nfc_tag_id: "NFC-007G", qr_code_url: "/qr/kcc-auth-y5z6a7b8", status: "expired", verified_by: null, verified_at: null, created_at: "2025-06-01" },
  { id: "8", product_id: "PROD-008", serial_number: "SN-2404-0008", authenticity_code: "KCC-AUTH-C9D0E1F2", nfc_tag_id: "NFC-008H", qr_code_url: "/qr/kcc-auth-c9d0e1f2", status: "verified", verified_by: "Fatima Ali", verified_at: "2026-04-12", created_at: "2026-02-20" },
  { id: "9", product_id: "PROD-009", serial_number: "SN-2404-0009", authenticity_code: "KCC-AUTH-G3H4I5J6", nfc_tag_id: "NFC-009I", qr_code_url: "/qr/kcc-auth-g3h4i5j6", status: "active", verified_by: null, verified_at: null, created_at: "2026-03-01" },
  { id: "10", product_id: "PROD-010", serial_number: "SN-2404-0010", authenticity_code: "KCC-AUTH-K7L8M9N0", nfc_tag_id: "NFC-010J", qr_code_url: "/qr/kcc-auth-k7l8m9n0", status: "revoked", verified_by: "Admin", verified_at: "2026-04-15", created_at: "2026-03-05" },
  { id: "11", product_id: "PROD-011", serial_number: "SN-2404-0011", authenticity_code: "KCC-AUTH-O1P2Q3R4", nfc_tag_id: "NFC-011K", qr_code_url: "/qr/kcc-auth-o1p2q3r4", status: "active", verified_by: null, verified_at: null, created_at: "2026-03-10" },
  { id: "12", product_id: "PROD-012", serial_number: "SN-2404-0012", authenticity_code: "KCC-AUTH-S5T6U7V8", nfc_tag_id: "NFC-012L", qr_code_url: "/qr/kcc-auth-s5t6u7v8", status: "verified", verified_by: "Emeka Nwa", verified_at: "2026-04-18", created_at: "2026-03-15" },
  { id: "13", product_id: "PROD-013", serial_number: "SN-2404-0013", authenticity_code: "KCC-AUTH-W9X0Y1Z2", nfc_tag_id: "NFC-013M", qr_code_url: "/qr/kcc-auth-w9x0y1z2", status: "pending", verified_by: null, verified_at: null, created_at: "2026-04-01" },
  { id: "14", product_id: "PROD-014", serial_number: "SN-2404-0014", authenticity_code: "KCC-AUTH-A3B4C5D6", nfc_tag_id: "NFC-014N", qr_code_url: "/qr/kcc-auth-a3b4c5d6", status: "active", verified_by: null, verified_at: null, created_at: "2026-04-05" },
];

const seedVerifications = [
  { id: "1", code: "KCC-AUTH-E5F6G7H8", product: "PROD-002", verified_by: "Amara Obi", verified_at: "2026-03-20", method: "QR Scan", ip_address: "192.168.1.45", location: "Lagos, NG" },
  { id: "2", code: "KCC-AUTH-Q7R8S9T0", product: "PROD-005", verified_by: "Chidi Eze", verified_at: "2026-04-01", method: "NFC Tap", ip_address: "192.168.1.78", location: "Abuja, NG" },
  { id: "3", code: "KCC-AUTH-C9D0E1F2", product: "PROD-008", verified_by: "Fatima Ali", verified_at: "2026-04-12", method: "Manual Entry", ip_address: "192.168.1.12", location: "Port Harcourt, NG" },
  { id: "4", code: "KCC-AUTH-S5T6U7V8", product: "PROD-012", verified_by: "Emeka Nwa", verified_at: "2026-04-18", method: "QR Scan", ip_address: "192.168.1.34", location: "Kano, NG" },
  { id: "5", code: "KCC-AUTH-M3N4O5P6", product: "PROD-004", verified_by: "Admin", verified_at: "2026-04-10", method: "Admin Panel", ip_address: "10.0.0.1", location: "Internal" },
  { id: "6", code: "KCC-AUTH-K7L8M9N0", product: "PROD-010", verified_by: "Admin", verified_at: "2026-04-15", method: "Admin Panel", ip_address: "10.0.0.1", location: "Internal" },
];

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    active: "bg-green-50 text-green-700",
    verified: "bg-blue-50 text-blue",
    revoked: "bg-red-50 text-red",
    expired: "bg-gray-50 text-gray-500",
    pending: "bg-yellow-50 text-yellow-700",
  };
  return styles[status] || "bg-gray-50 text-gray-500";
};

export default function AuthenticityPage() {
  const [activeTab, setActiveTab] = useState("codes");
  const [codes, setCodes] = useState(seedCodes);
  const [search, setSearch] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [genForm, setGenForm] = useState({ product_id: "", quantity: 1 });

  const totalCodes = codes.length;
  const verifiedCount = codes.filter((c) => c.status === "verified").length;
  const activeCount = codes.filter((c) => c.status === "active").length;
  const revokedCount = codes.filter((c) => c.status === "revoked").length;
  const pendingCount = codes.filter((c) => c.status === "pending").length;

  const kpis = [
    { label: "Total Codes", value: totalCodes, icon: Hash, color: "text-blue" },
    { label: "Verified", value: verifiedCount, icon: CheckCircle, color: "text-green-600" },
    { label: "Active", value: activeCount, icon: ShieldCheck, color: "text-blue" },
    { label: "Revoked", value: revokedCount, icon: XCircle, color: "text-red" },
    { label: "Pending Verification", value: pendingCount, icon: Clock, color: "text-yellow-600" },
  ];

  const filteredCodes = codes.filter((c) =>
    !search || c.authenticity_code.toLowerCase().includes(search.toLowerCase()) || c.product_id.toLowerCase().includes(search.toLowerCase()) || c.serial_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = () => {
    const newCodes = [];
    for (let i = 0; i < genForm.quantity; i++) {
      const id = String(codes.length + newCodes.length + 1);
      const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
      newCodes.push({
        id,
        product_id: genForm.product_id,
        serial_number: `SN-${new Date().getFullYear()}-${String(codes.length + i + 1).padStart(4, "0")}`,
        authenticity_code: `KCC-AUTH-${rand}`,
        nfc_tag_id: `NFC-${String(codes.length + i + 1).padStart(3, "0").padStart(3, "0")}`,
        qr_code_url: `/qr/kcc-auth-${rand.toLowerCase()}`,
        status: "active",
        verified_by: null,
        verified_at: null,
        created_at: new Date().toISOString().split("T")[0],
      });
    }
    setCodes((prev) => [...newCodes, ...prev]);
    setShowGenerateModal(false);
    setGenForm({ product_id: "", quantity: 1 });
  };

  return (
    <AdminShell title="Authenticity System" subtitle="Product authenticity codes, NFC tags, and verification tracking">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-text-1">Product Authenticity</h1>
          <div className="flex gap-2">
            <input placeholder="Search codes..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 px-3 rounded-lg border border-border text-sm w-[220px] focus:outline-none focus:border-blue" />
            <Button size="sm" className="gap-1.5" onClick={() => setShowGenerateModal(true)}>
              <Plus size={14} /> Generate Codes
            </Button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {authTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue text-white" : "bg-white text-text-3 border border-border hover:bg-off-white"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon size={18} className={kpi.color} />
                  </div>
                </div>
                <p className="text-xl font-bold text-text-1">{kpi.value}</p>
                <p className="text-xs text-text-4 mt-0.5">{kpi.label}</p>
              </div>
            );
          })}
        </div>

        {activeTab === "codes" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><QrCode size={18} /> Authenticity Codes</h3>
              <span className="text-xs text-text-4">{filteredCodes.length} codes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Serial #</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Auth Code</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">NFC Tag</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">QR URL</th>
                    <th className="text-center px-5 py-3 font-medium text-text-4">Status</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Verified By</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Verified At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCodes.map((c) => (
                    <tr key={c.id} className="hover:bg-off-white transition-colors cursor-pointer" onClick={() => setShowDetailModal(c)}>
                      <td className="px-5 py-3 font-medium text-text-1">{c.product_id}</td>
                      <td className="px-5 py-3 font-mono text-xs text-text-2">{c.serial_number}</td>
                      <td className="px-5 py-3 font-mono text-xs text-blue">{c.authenticity_code}</td>
                      <td className="px-5 py-3 font-mono text-xs text-text-3">{c.nfc_tag_id}</td>
                      <td className="px-5 py-3 font-mono text-xs text-text-4">{c.qr_code_url}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3 text-text-3">{c.verified_by || "-"}</td>
                      <td className="px-5 py-3 text-text-4">{c.verified_at || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "verification" && (
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-semibold text-text-1 flex items-center gap-2"><UserCheck size={18} /> Verification Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-off-white">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Auth Code</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Product</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Verified By</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Method</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">IP Address</th>
                    <th className="text-left px-5 py-3 font-medium text-text-4">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {seedVerifications.map((v) => (
                    <tr key={v.id} className="hover:bg-off-white transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-blue">{v.code}</td>
                      <td className="px-5 py-3 font-medium text-text-1">{v.product}</td>
                      <td className="px-5 py-3 text-text-2">{v.verified_by}</td>
                      <td className="px-5 py-3 text-text-4">{v.verified_at}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue">{v.method}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-text-4">{v.ip_address}</td>
                      <td className="px-5 py-3 text-text-3">{v.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><ShieldCheck size={18} /> Authenticity Config</h3>
              <div className="space-y-4">
                {[
                  { label: "NFC Tagging", desc: "Require NFC tag scan for verification", enabled: true },
                  { label: "QR Code Expiry", desc: "Auto-expire codes after 365 days", enabled: true },
                  { label: "Blockchain Anchor", desc: "Anchor authenticity hashes on-chain", enabled: false },
                  { label: "Geo-Verification", desc: "Log GPS coordinates on verify", enabled: true },
                  { label: "Duplicate Detection", desc: "Alert on duplicate serial numbers", enabled: true },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-text-1">{s.label}</p>
                      <p className="text-xs text-text-4">{s.desc}</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors ${s.enabled ? "bg-blue" : "bg-gray-200"} relative cursor-pointer`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${s.enabled ? "left-5" : "left-1"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="font-semibold text-text-1 mb-4 flex items-center gap-2"><Smartphone size={18} /> NFC Tag Inventory</h3>
              <div className="space-y-3">
                {[
                  { batch: "NFC-BATCH-2026-01", total: 500, used: 342, status: "Active" },
                  { batch: "NFC-BATCH-2026-02", total: 1000, used: 158, status: "Active" },
                  { batch: "NFC-BATCH-2025-04", total: 300, used: 300, status: "Depleted" },
                ].map((b) => (
                  <div key={b.batch} className="p-4 rounded-lg border border-border">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium text-text-1">{b.batch}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>{b.status}</span>
                    </div>
                    <div className="h-2 bg-off-white rounded-full overflow-hidden">
                      <div className="h-full bg-blue rounded-full" style={{ width: `${(b.used / b.total) * 100}%` }} />
                    </div>
                    <p className="text-xs text-text-4 mt-1">{b.used} / {b.total} used</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowGenerateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[460px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">Generate Authenticity Codes</h2>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Product ID</label>
                <input value={genForm.product_id} onChange={(e) => setGenForm({ ...genForm, product_id: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" placeholder="e.g. PROD-015" />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Quantity</label>
                <input type="number" min={1} max={50} value={genForm.quantity} onChange={(e) => setGenForm({ ...genForm, quantity: Math.min(50, Math.max(1, +e.target.value)) })} className="w-full h-10 px-3 rounded-lg border border-border text-sm focus:outline-none focus:border-blue" />
              </div>
              <p className="text-xs text-text-4">Each code includes NFC tag ID, QR URL, and unique authenticity hash.</p>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <Button variant="outline" className="flex-1" onClick={() => setShowGenerateModal(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleGenerate} disabled={!genForm.product_id || genForm.quantity < 1}>
                <Save size={14} className="mr-1" /> Generate {genForm.quantity} Code{genForm.quantity !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-[480px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-syne font-bold text-lg">Code Detail</h2>
              <button onClick={() => setShowDetailModal(null)} className="p-2 rounded-lg hover:bg-off-white text-text-4"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Auth Code</p><p className="text-sm font-mono font-medium mt-0.5 text-blue">{showDetailModal.authenticity_code}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Status</p><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(showDetailModal.status)}`}>{showDetailModal.status}</span></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Product</p><p className="text-sm mt-0.5">{showDetailModal.product_id}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Serial #</p><p className="text-sm font-mono mt-0.5">{showDetailModal.serial_number}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">NFC Tag</p><p className="text-sm font-mono mt-0.5">{showDetailModal.nfc_tag_id}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">QR URL</p><p className="text-sm font-mono mt-0.5 text-text-4">{showDetailModal.qr_code_url}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Created</p><p className="text-sm mt-0.5">{showDetailModal.created_at}</p></div>
                <div><p className="text-[10px] text-text-4 uppercase font-semibold">Verified By</p><p className="text-sm mt-0.5">{showDetailModal.verified_by || "Not verified"}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
