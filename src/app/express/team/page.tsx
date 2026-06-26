"use client";

import { useState } from "react";
import { Users, UserPlus, Shield, Mail, Phone, MoreHorizontal, Search, CheckCircle2, Clock, XCircle, Settings, Eye, Package, BarChart3 } from "lucide-react";

const TEAM_MEMBERS = [
  { id: 1, name: "John Doe", email: "john@company.com", phone: "+234 801 234 5678", role: "Owner", status: "active", avatar: "JD", shipments: 342, lastActive: "2 min ago", permissions: ["all"] },
  { id: 2, name: "Amina Bello", email: "amina@company.com", phone: "+234 805 678 9012", role: "Manager", status: "active", avatar: "AB", shipments: 218, lastActive: "15 min ago", permissions: ["ship", "track", "analytics", "team"] },
  { id: 3, name: "Chukwuemeka O.", email: "chukwuemeka@company.com", phone: "+234 803 456 7890", role: "Shipper", status: "active", avatar: "CO", shipments: 156, lastActive: "1 hr ago", permissions: ["ship", "track"] },
  { id: 4, name: "Fatima Abubakar", email: "fatima@company.com", phone: "+234 809 012 3456", role: "Viewer", status: "active", avatar: "FA", shipments: 0, lastActive: "3 hrs ago", permissions: ["track", "analytics"] },
  { id: 5, name: "David Okonkwo", email: "david@company.com", phone: "+234 807 890 1234", role: "Shipper", status: "invited", avatar: "DO", shipments: 0, lastActive: "Pending", permissions: ["ship", "track"] },
  { id: 6, name: "Grace Mensah", email: "grace@company.com", phone: "+233 24 567 8901", role: "Manager", status: "active", avatar: "GM", shipments: 89, lastActive: "30 min ago", permissions: ["ship", "track", "analytics", "billing"] },
];

const ROLES = [
  { name: "Owner", desc: "Full access to everything", color: "bg-purple-100 text-purple-700", count: 1 },
  { name: "Manager", desc: "Manage team, view analytics, ship", color: "bg-blue-100 text-blue-700", count: 2 },
  { name: "Shipper", desc: "Create and manage shipments", color: "bg-green-100 text-green-700", count: 2 },
  { name: "Viewer", desc: "View-only access to tracking and reports", color: "bg-gray-100 text-gray-600", count: 1 },
];

const PERMISSION_MATRIX = [
  { action: "Create Shipments", owner: true, manager: true, shipper: true, viewer: false },
  { action: "Track Shipments", owner: true, manager: true, shipper: true, viewer: true },
  { action: "View Analytics", owner: true, manager: true, shipper: false, viewer: true },
  { action: "Manage Billing", owner: true, manager: true, shipper: false, viewer: false },
  { action: "Manage Team", owner: true, manager: false, shipper: false, viewer: false },
  { action: "View Invoices", owner: true, manager: true, shipper: false, viewer: false },
  { action: "File Claims", owner: true, manager: true, shipper: true, viewer: false },
  { action: "Manage Returns", owner: true, manager: true, shipper: true, viewer: false },
  { action: "Access API Keys", owner: true, manager: false, shipper: false, viewer: false },
  { action: "Edit Settings", owner: true, manager: false, shipper: false, viewer: false },
];

const ACTIVITY_LOG = [
  { user: "John Doe", action: "Created shipment KVX-7847", time: "5 min ago", icon: Package },
  { user: "Amina Bello", action: "Viewed analytics report", time: "15 min ago", icon: BarChart3 },
  { user: "Chukwuemeka O.", action: "Filed claim CLM-003", time: "1 hr ago", icon: Shield },
  { user: "Grace Mensah", action: "Approved return RTN-1001", time: "2 hrs ago", icon: CheckCircle2 },
  { user: "John Doe", action: "Invited David Okonkwo to team", time: "3 hrs ago", icon: UserPlus },
  { user: "Fatima Abubakar", action: "Downloaded invoice INV-2026-0602", time: "4 hrs ago", icon: Package },
];

export default function TeamPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Shipper");

  const filtered = TEAM_MEMBERS.filter(
    (m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    active: { label: "Active", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    invited: { label: "Invited", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    inactive: { label: "Inactive", color: "bg-gray-100 text-gray-600", icon: XCircle },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Team Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members, roles, and permissions.</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E56000] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ROLES.map((r) => (
          <div key={r.name} className="bg-white rounded-xl border border-gray-200 p-4">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${r.color}`}>{r.name}</span>
            <p className="text-xl font-bold text-[#0A1628] mt-2">{r.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Invite Team Member</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30">
              {ROLES.filter((r) => r.name !== "Owner").map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <button onClick={() => { setShowInvite(false); setInviteEmail(""); }} className="bg-[#FF6B00] hover:bg-[#E56000] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">Send Invite</button>
          </div>
        </div>
      )}

      {/* Team Members + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team members..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30" />
          </div>
          <div className="space-y-3">
            {filtered.map((m) => {
              const sc = statusConfig[m.status];
              const isSelected = selectedMember === m.id;
              return (
                <div key={m.id} onClick={() => setSelectedMember(isSelected ? null : m.id)} className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${isSelected ? "border-[#FF6B00] ring-1 ring-[#FF6B00]/30 shadow-md" : "border-gray-200 hover:shadow-md"}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0A1628] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{m.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-[#0A1628]">{m.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{m.email}</p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs font-medium text-[#0A1628]">{m.role}</p>
                      <p className="text-[11px] text-gray-500">{m.shipments} shipments</p>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <p className="text-[11px] text-gray-500">{m.lastActive}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                        <div><span className="text-gray-500 block">Phone</span><span className="font-medium text-[#0A1628]">{m.phone}</span></div>
                        <div><span className="text-gray-500 block">Role</span><span className="font-medium text-[#0A1628]">{m.role}</span></div>
                        <div><span className="text-gray-500 block">Shipments</span><span className="font-medium text-[#0A1628]">{m.shipments}</span></div>
                        <div><span className="text-gray-500 block">Last Active</span><span className="font-medium text-[#0A1628]">{m.lastActive}</span></div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.permissions.map((p) => (
                            <span key={p} className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-medium capitalize">{p === "all" ? "Full Access" : p}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"><Mail className="w-3.5 h-3.5 inline mr-1" />Email</button>
                        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"><Settings className="w-3.5 h-3.5 inline mr-1" />Edit Role</button>
                        {m.role !== "Owner" && <button className="px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50">Remove</button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel — Activity + Permissions */}
        <div className="space-y-5">
          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {ACTIVITY_LOG.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <a.icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#0A1628]"><span className="font-semibold">{a.user}</span> {a.action}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-[#0A1628] mb-4">Role Permissions</h3>
            <div className="space-y-2">
              {PERMISSION_MATRIX.map((p) => (
                <div key={p.action} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 text-gray-600 truncate">{p.action}</span>
                  <div className="flex gap-1.5">
                    {[p.owner, p.manager, p.shipper, p.viewer].map((has, i) => (
                      <span key={i} className={`w-5 h-5 rounded flex items-center justify-center ${has ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {has ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                <span className="flex-1" />
                <div className="flex gap-1.5">
                  <span className="w-5 text-center">Own</span>
                  <span className="w-5 text-center">Mgr</span>
                  <span className="w-5 text-center">Ship</span>
                  <span className="w-5 text-center">View</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
