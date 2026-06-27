"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, UserPlus, Save, X, Search, Users, Globe,
  CheckCircle2, AlertCircle, Mail, Eye, EyeOff, Edit3,
  Lock, ChevronRight, ExternalLink, ChevronDown, ChevronUp,
  Settings2, History, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

const MODULES = [
  "A+ Content", "Campaign Manager", "Coupons", "Deals",
  "Reviews", "Posts", "Promotions", "Sponsored Products",
  "Vine", "Loan Registration", "Refund Management",
  "Marketplace Product Guidance", "Internal Tools",
];

type AccessLevel = "none" | "view" | "edit";

interface UserPermissions {
  [module: string]: AccessLevel;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: UserPermissions;
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@vendorshop.com",
    role: "Admin",
    permissions: Object.fromEntries(MODULES.map((m) => [m, "edit" as AccessLevel])),
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@vendorshop.com",
    role: "Manager",
    permissions: Object.fromEntries(
      MODULES.map((m) => [
        m,
        m === "Internal Tools" ? ("none" as AccessLevel) : ("view" as AccessLevel),
      ])
    ),
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol@vendorshop.com",
    role: "Support",
    permissions: Object.fromEntries(
      MODULES.map((m) => [
        m,
        ["Reviews", "Posts"].includes(m) ? "edit" as AccessLevel : "none" as AccessLevel,
      ])
    ),
  },
];

export default function VendorPermissionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLang, setNewLang] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/v1/vendor/staff")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.users ?? [];
        if (list.length > 0) {
          setUsers(list);
        } else {
          setUsers(MOCK_USERS);
        }
      })
      .catch(() => setUsers(MOCK_USERS))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInvite = () => {
    if (!newName || !newEmail) return;
    const newUser: User = {
      id: String(Date.now()),
      name: newName,
      email: newEmail,
      role: "Viewer",
      permissions: Object.fromEntries(MODULES.map((m) => [m, "none" as AccessLevel])),
    };
    setUsers([...users, newUser]);
    setNewName("");
    setNewEmail("");
    setShowAddForm(false);
    showToast("success", `Invitation sent to ${newUser.email}`);
  };

  const handlePermissionChange = (
    userId: string,
    module: string,
    value: AccessLevel
  ) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, permissions: { ...u.permissions, [module]: value } }
          : u
      )
    );
  };

  const handleSavePermissions = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("success", "Permissions saved successfully");
      setEditingUser(null);
    }, 800);
  };

  const handleRemoveUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    if (editingUser === id) setEditingUser(null);
    showToast("success", "User access revoked");
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const editingUserData = users.find((u) => u.id === editingUser);

  return (
    <VendorShell
      title="Permissions"
      subtitle="Manage access rights for your vendor team"
    >
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
        <AlertCircle size={16} className="text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800">
          Use the Permissions Manager to grant access rights to other users.
          Changes take effect immediately after saving.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {editingUser && editingUserData ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={16} />
                </button>
                <div>
                  <h3 className="font-semibold text-sm">
                    Editing: {editingUserData.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {editingUserData.email}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={handleSavePermissions} disabled={saving}>
                <Save size={14} className="mr-1" />
                {saving ? "Saving..." : "Save Permissions"}
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase w-56">
                      Module
                    </th>
                    {["None", "View", "View & Edit"].map((lvl) => (
                      <th
                        key={lvl}
                        className="text-center py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase w-32"
                      >
                        {lvl}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((mod) => {
                    const current = editingUserData.permissions[mod];
                    return (
                      <tr
                        key={mod}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="py-3 px-4 text-xs font-medium text-gray-700">
                          {mod}
                        </td>
                        {(["none", "view", "edit"] as AccessLevel[]).map(
                          (lvl) => (
                            <td key={lvl} className="py-3 px-4 text-center">
                              <input
                                type="radio"
                                name={`perm-${editingUser}-${mod}`}
                                checked={current === lvl}
                                onChange={() =>
                                  handlePermissionChange(
                                    editingUser,
                                    mod,
                                    lvl
                                  )
                                }
                                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer"
                              />
                            </td>
                          )
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/vendor/settings/permissions/history"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <History size={14} />
                  Audit Log
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Global permissions settings panel")}
                >
                  <Globe size={14} className="mr-1" />
                  Manage Global Permissions
                </Button>
                <Button size="sm" onClick={() => setShowAddForm(true)}>
                  <UserPlus size={14} className="mr-1" /> Add User
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                      Email Address
                    </th>
                    <th className="text-left py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                      Role Summary
                    </th>
                    <th className="text-right py-3 px-4 text-[10px] text-gray-400 font-semibold uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <Loader2 size={24} className="mx-auto text-gray-400 animate-spin mb-2" />
                        <p className="text-sm text-gray-400">Loading staff...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <Users size={32} className="mx-auto text-gray-200 mb-2" />
                        <p className="text-sm text-gray-400">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const editCount = Object.values(user.permissions).filter(
                        (p) => p === "edit"
                      ).length;
                      const viewCount = Object.values(user.permissions).filter(
                        (p) => p === "view"
                      ).length;
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <p className="text-xs font-semibold">
                                {user.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
                            {user.email}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                                {user.role}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {editCount} edit, {viewCount} view
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingUser(user.id)}
                                className="px-3 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded-lg font-medium"
                              >
                                <Settings2 size={13} className="inline mr-1" />
                                Manage Permissions
                              </button>
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                title="Remove user"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showAddForm && (
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={() => setShowAddForm(false)}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <UserPlus size={18} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Add New User</h3>
                  <p className="text-xs text-gray-400">
                    Grant permissions to a team member
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Full Name
                  </label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full h-10 pl-9 pr-3 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLang}
                    onChange={(e) => setNewLang(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">
                    Send invite in preferred language
                  </span>
                </label>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleInvite}
                  disabled={!newName || !newEmail}
                >
                  <Mail size={14} className="mr-1" /> Send Invite
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </VendorShell>
  );
}
