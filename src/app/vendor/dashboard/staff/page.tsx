"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Mail,
  UserPlus,
  Shield,
  X,
  Check,
  Search,
  Loader2,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

const STAFF_ROLES = [
  {
    value: "vendor_manager",
    label: "Vendor Manager",
    desc: "Full access to manage products, orders, and settings",
    color: "purple",
  },
  {
    value: "vendor_support",
    label: "Vendor Support",
    desc: "Can view and respond to customer inquiries and reviews",
    color: "blue",
  },
  {
    value: "vendor_warehouse",
    label: "Vendor Warehouse",
    desc: "Access to inventory, shipping labels, and fulfillment",
    color: "green",
  },
];

const mockStaff = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@vendorshop.com",
    role: "vendor_manager",
    status: "active",
    lastActive: "2026-06-10T14:30:00",
    avatar: "AJ",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@vendorshop.com",
    role: "vendor_support",
    status: "active",
    lastActive: "2026-06-09T09:15:00",
    avatar: "BS",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@vendorshop.com",
    role: "vendor_warehouse",
    status: "invited",
    lastActive: null,
    avatar: "CD",
  },
];

const activityLog: Record<string, { action: string; timestamp: string }[]> = {
  "1": [
    { action: "Updated product 'Yamaha F150' pricing", timestamp: "2026-06-10T14:30:00" },
    { action: "Approved order VND-0124", timestamp: "2026-06-10T12:00:00" },
    { action: "Changed shop banner image", timestamp: "2026-06-09T16:45:00" },
  ],
  "2": [
    { action: "Responded to customer review on Marine LED Kit", timestamp: "2026-06-09T09:15:00" },
    { action: "Resolved support ticket #892", timestamp: "2026-06-08T11:30:00" },
  ],
  "3": [
    { action: "Staff member invited — pending acceptance", timestamp: "2026-06-07T10:00:00" },
  ],
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function StaffPage() {
  const [staff, setStaff] = useState(mockStaff);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("vendor_support");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    const initials = inviteEmail[0].toUpperCase();
    setStaff([
      ...staff,
      {
        id: String(Date.now()),
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        status: "invited",
        lastActive: null,
        avatar: initials,
      },
    ]);
    setInviteEmail("");
    setShowInviteForm(false);
    setProcessing(false);
  };

  const handleRevoke = async (id: string) => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setStaff(staff.filter((s) => s.id !== id));
    setRevokeConfirm(null);
    setProcessing(false);
  };

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <VendorShell title="Staff Management" subtitle="Manage your vendor team members">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Manage your vendor team members</p>
        <Button size="sm" onClick={() => setShowInviteForm(true)}>
          <UserPlus size={14} className="mr-1" /> Invite Staff
        </Button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff..."
              className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg"
            />
          </div>
          <span className="text-xs text-gray-400">
            {staff.length} {staff.length === 1 ? "member" : "members"}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Member</th>
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Role</th>
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Status</th>
                <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Last Active</th>
                <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No staff members found</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const roleInfo = STAFF_ROLES.find((r) => r.value === member.role);
                  return (
                    <tr key={member.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              member.status === "active"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {member.avatar}
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{member.name}</p>
                            <p className="text-[10px] text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            roleInfo?.color === "purple"
                              ? "bg-purple-100 text-purple-700"
                              : roleInfo?.color === "blue"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {roleInfo?.label || member.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            member.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {member.status === "active" ? "Active" : "Invited"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-xs text-gray-500">
                          {member.lastActive ? formatTime(member.lastActive) : "—"}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="View Activity"
                          >
                            <Activity size={14} />
                          </button>
                          {revokeConfirm === member.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleRevoke(member.id)}
                                disabled={processing}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Confirm"
                              >
                                {processing ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Check size={14} />
                                )}
                              </button>
                              <button
                                onClick={() => setRevokeConfirm(null)}
                                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRevokeConfirm(member.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Revoke Access"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selectedMember && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Activity size={16} className="text-purple-600" /> Activity Log
                <span className="text-xs font-normal text-gray-400">
                  — {staff.find((s) => s.id === selectedMember)?.name}
                </span>
              </h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {(activityLog[selectedMember] || []).map((entry, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-700">{entry.action}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{formatTime(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
              {(activityLog[selectedMember] || []).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No activity recorded yet</p>
              )}
            </div>
          </div>
        )}

        {showInviteForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setShowInviteForm(false)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <UserPlus size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Invite Staff Member</h3>
                  <p className="text-xs text-gray-400">Send an invitation email</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-2">Role</label>
                  <div className="space-y-2">
                    {STAFF_ROLES.map((role) => (
                      <button
                        key={role.value}
                        onClick={() => setInviteRole(role.value)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          inviteRole === role.value
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Shield
                            size={14}
                            className={
                              role.color === "purple"
                                ? "text-purple-600"
                                : role.color === "blue"
                                  ? "text-blue-500"
                                  : "text-green-500"
                            }
                          />
                          <p className="text-xs font-semibold">{role.label}</p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5 ml-6">{role.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleInvite}
                  disabled={!inviteEmail || processing}
                >
                  {processing ? (
                    <Loader2 size={14} className="mr-1 animate-spin" />
                  ) : (
                    <Mail size={14} className="mr-1" />
                  )}
                  Send Invite
                </Button>
              </div>
            </div>
          </div>
        )}

        {revokeConfirm && !document.querySelector('[data-revoke-active]') && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 hidden" />
        )}
      </div>
    </VendorShell>
  );
}
