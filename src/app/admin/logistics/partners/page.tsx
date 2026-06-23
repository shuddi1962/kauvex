"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { insforge } from "@/lib/insforge";
import { Loader2, Search, Check, X, Eye, Filter, UserCheck, UserX, Star, MapPin, Phone, Mail } from "lucide-react";

interface Partner {
  id: string;
  partner_type: string;
  first_name: string;
  last_name: string;
  business_name: string | null;
  phone: string;
  email: string;
  base_city: string;
  status: string;
  is_verified: boolean;
  is_online: boolean;
  jobs_completed: number;
  rating: number;
  tier: string;
  created_at: string;
}

const partnerTypes = ["rider", "driver", "courier", "freight"];
const statusFilters = ["all", "pending", "active", "suspended", "rejected"];

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => { loadPartners(); }, []);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const { data } = await insforge.database.from("kv_logistics_partners").select("*").order("created_at", { ascending: false });
      if (data) setPartners(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    await insforge.database.from("kv_logistics_partners").update({ status, is_verified: status === "active" }).eq("id", id);
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status, is_verified: status === "active" } : p));
  };

  const filtered = partners.filter(p => {
    if (typeFilter !== "all" && p.partner_type !== typeFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${p.first_name} ${p.last_name}`.toLowerCase();
      if (!name.includes(q) && !p.email.toLowerCase().includes(q) && !p.phone.includes(q) && !(p.business_name || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const tierColors: Record<string, string> = {
    new: "bg-gray-100 text-gray-600", verified: "bg-blue-50 text-blue",
    trusted: "bg-purple-50 text-purple-600", premium: "bg-orange-50 text-orange",
  };
  const statusColors: Record<string, string> = {
    active: "bg-green-50 text-green-700", pending: "bg-amber-50 text-amber-700",
    suspended: "bg-red-50 text-red", rejected: "bg-gray-100 text-gray-500",
  };
  const typeLabels: Record<string, string> = { rider: "Rider", driver: "Driver", courier: "Courier Business", freight: "Freight Company" };

  return (
    <AdminShell title="Logistics Partners" subtitle="Manage all registered delivery partners">
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..." className="w-full h-10 pl-9 pr-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange/20" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-10 px-3 border border-border rounded-lg text-sm bg-white">
            <option value="all">All Types</option>
            {partnerTypes.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 border border-border rounded-lg text-sm bg-white">
            {statusFilters.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <span className="text-sm text-text-4">{filtered.length} partners</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-orange" size={32} /></div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  {["Partner", "Type", "Location", "Tier", "Jobs", "Rating", "Status", "Actions"].map(h => (
                    <th key={h} className="p-3 text-left text-xs font-medium text-text-4 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-text-4">No partners found</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-gray-50/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange">{p.first_name[0]}{p.last_name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-text-1 text-xs">{p.first_name} {p.last_name}</p>
                            {p.business_name && <p className="text-[10px] text-text-4">{p.business_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-text-2">{typeLabels[p.partner_type]}</span></td>
                      <td className="p-3"><span className="text-xs text-text-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{p.base_city}</span></td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColors[p.tier] || "bg-gray-100"}`}>{p.tier}</span></td>
                      <td className="p-3 text-xs text-text-2">{p.jobs_completed}</td>
                      <td className="p-3"><span className="flex items-center gap-1 text-xs text-amber-600"><Star className="w-3 h-3 fill-amber-400" />{p.rating}</span></td>
                      <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || "bg-gray-100"}`}>{p.status}</span></td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedPartner(p)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-text-4" /></button>
                          {p.status === "pending" && (
                            <>
                              <button onClick={() => updateStatus(p.id, "active")} className="p-1.5 hover:bg-green-50 rounded-lg"><Check className="w-4 h-4 text-green-600" /></button>
                              <button onClick={() => updateStatus(p.id, "rejected")} className="p-1.5 hover:bg-red-50 rounded-lg"><X className="w-4 h-4 text-red" /></button>
                            </>
                          )}
                          {p.status === "active" && (
                            <button onClick={() => updateStatus(p.id, "suspended")} className="p-1.5 hover:bg-red-50 rounded-lg"><UserX className="w-4 h-4 text-red" /></button>
                          )}
                          {p.status === "suspended" && (
                            <button onClick={() => updateStatus(p.id, "active")} className="p-1.5 hover:bg-green-50 rounded-lg"><UserCheck className="w-4 h-4 text-green-600" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedPartner && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPartner(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-text-1">Partner Details</h2>
                <button onClick={() => setSelectedPartner(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-text-4" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-orange">{selectedPartner.first_name[0]}{selectedPartner.last_name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-1">{selectedPartner.first_name} {selectedPartner.last_name}</p>
                    <p className="text-xs text-text-4">{typeLabels[selectedPartner.partner_type]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-xs text-text-4">Email</span><p className="font-medium flex items-center gap-1"><Mail className="w-3 h-3" />{selectedPartner.email}</p></div>
                  <div><span className="text-xs text-text-4">Phone</span><p className="font-medium flex items-center gap-1"><Phone className="w-3 h-3" />{selectedPartner.phone}</p></div>
                  <div><span className="text-xs text-text-4">Tier</span><p className="font-medium">{selectedPartner.tier}</p></div>
                  <div><span className="text-xs text-text-4">Jobs Completed</span><p className="font-medium">{selectedPartner.jobs_completed}</p></div>
                  <div><span className="text-xs text-text-4">Rating</span><p className="font-medium flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400" />{selectedPartner.rating}</p></div>
                  <div><span className="text-xs text-text-4">Location</span><p className="font-medium">{selectedPartner.base_city}</p></div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  {selectedPartner.status === "pending" && (
                    <>
                      <button onClick={() => { updateStatus(selectedPartner.id, "active"); setSelectedPartner(null); }} className="flex-1 h-10 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 text-sm">Approve</button>
                      <button onClick={() => { updateStatus(selectedPartner.id, "rejected"); setSelectedPartner(null); }} className="flex-1 h-10 bg-red text-white font-bold rounded-lg hover:bg-red/90 text-sm">Reject</button>
                    </>
                  )}
                  <button onClick={() => setSelectedPartner(null)} className="flex-1 h-10 border border-border rounded-lg text-sm text-text-3 hover:bg-gray-50">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
