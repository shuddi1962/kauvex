"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/admin-shell";
import { Users, UserPlus, Warehouse, Search, CheckCircle2, XCircle, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface StaffMember {
  id: string;
  userId: string;
  warehouseId: string;
  warehouseName: string;
  fullName: string;
  role: "warehouse_manager" | "picker" | "packer" | "receiver";
  phone: string;
  status: "active" | "inactive";
}

interface WarehouseOption {
  id: string;
  name: string;
  city: string;
}

const seedWarehouses: WarehouseOption[] = [
  { id: "W1", name: "Lagos Main Fulfillment Center", city: "Lagos, Ikeja" },
  { id: "W2", name: "Abuja Logistics Hub", city: "Abuja, Wuse" },
  { id: "W3", name: "Port Harcourt Distribution", city: "Port Harcourt" },
  { id: "W4", name: "Ibadan Forward Stocking", city: "Ibadan" },
  { id: "W5", name: "Lagos Returns Center", city: "Lagos, Apapa" },
  { id: "W6", name: "Kano Hub", city: "Kano" },
];

const seedStaff: StaffMember[] = [
  { id: "S1", userId: "usr_001", warehouseId: "W1", warehouseName: "Lagos Main Fulfillment Center", fullName: "Emeka Okafor", role: "warehouse_manager", phone: "+234 801 234 5678", status: "active" },
  { id: "S2", userId: "usr_002", warehouseId: "W1", warehouseName: "Lagos Main Fulfillment Center", fullName: "Chioma Eze", role: "picker", phone: "+234 802 345 6789", status: "active" },
  { id: "S3", userId: "usr_003", warehouseId: "W1", warehouseName: "Lagos Main Fulfillment Center", fullName: "Tunde Bakare", role: "packer", phone: "+234 803 456 7890", status: "active" },
  { id: "S4", userId: "usr_004", warehouseId: "W1", warehouseName: "Lagos Main Fulfillment Center", fullName: "Funke Adeyemi", role: "receiver", phone: "+234 804 567 8901", status: "active" },
  { id: "S5", userId: "usr_005", warehouseId: "W2", warehouseName: "Abuja Logistics Hub", fullName: "Musa Ibrahim", role: "warehouse_manager", phone: "+234 805 678 9012", status: "active" },
  { id: "S6", userId: "usr_006", warehouseId: "W3", warehouseName: "Port Harcourt Distribution", fullName: "Ngozi Okonkwo", role: "packer", phone: "+234 806 789 0123", status: "inactive" },
];

const roleLabels: Record<string, string> = {
  warehouse_manager: "Warehouse Manager",
  picker: "Picker",
  packer: "Packer",
  receiver: "Receiver",
};

const roleColors: Record<string, string> = {
  warehouse_manager: "bg-purple-100 text-purple-700",
  picker: "bg-blue-100 text-blue-700",
  packer: "bg-green-100 text-green-700",
  receiver: "bg-orange-100 text-orange-700",
};

export default function AdminWarehouseStaffPage() {
  const [staff, setStaff] = useState(seedStaff);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ userId: "", fullName: "", phone: "", role: "picker" as StaffMember["role"], warehouseId: "", status: "active" as StaffMember["status"] });

  const filtered = staff.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.warehouseName.toLowerCase().includes(search.toLowerCase()) ||
    s.role.includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ userId: "", fullName: "", phone: "", role: "picker", warehouseId: seedWarehouses[0]?.id || "", status: "active" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setStaff(prev => prev.map(s => s.id === editingId ? {
        ...s, fullName: form.fullName, phone: form.phone, role: form.role,
        warehouseId: form.warehouseId, status: form.status,
        warehouseName: seedWarehouses.find(w => w.id === form.warehouseId)?.name || "",
      } : s));
    } else {
      const warehouse = seedWarehouses.find(w => w.id === form.warehouseId);
      setStaff(prev => [...prev, {
        id: `S${Date.now()}`,
        userId: form.userId,
        warehouseId: form.warehouseId,
        warehouseName: warehouse?.name || "",
        fullName: form.fullName,
        role: form.role,
        phone: form.phone,
        status: form.status,
      }]);
    }
    resetForm();
  };

  const handleEdit = (s: StaffMember) => {
    setForm({ userId: s.userId, fullName: s.fullName, phone: s.phone, role: s.role, warehouseId: s.warehouseId, status: s.status });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === "active").length,
    managers: staff.filter(s => s.role === "warehouse_manager" && s.status === "active").length,
    pickers: staff.filter(s => s.role === "picker" && s.status === "active").length,
  };

  return (
    <AdminShell title="Warehouse Staff" subtitle="Manage warehouse staff assignments across all locations">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-[#0A1628]">{stats.total}</div>
            <p className="text-sm text-gray-500">Total Staff</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.managers}</div>
            <p className="text-sm text-gray-500">Managers</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.pickers}</div>
            <p className="text-sm text-gray-500">Pickers/Packers</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff by name, warehouse, or role..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
            <UserPlus size={16} /> Add Staff
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-[#0A1628]">{editingId ? "Edit Staff" : "Add New Staff"}</h3>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Supabase User ID</label>
                <input value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="user UUID from Supabase Auth" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="+234 801 234 5678" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as StaffMember["role"] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="warehouse_manager">Warehouse Manager</option>
                  <option value="picker">Picker</option>
                  <option value="packer">Packer</option>
                  <option value="receiver">Receiver</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Warehouse</label>
                <select value={form.warehouseId} onChange={e => setForm({ ...form, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {seedWarehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.city})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as StaffMember["status"] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-3 flex items-center gap-3 pt-2">
                <button type="submit"
                  className="px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors">
                  {editingId ? "Update Staff" : "Add Staff"}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Staff</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider">User ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Warehouse</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 text-[10px] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-xs font-bold text-[#FF6B00]">
                        {s.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#0A1628]">{s.fullName}</p>
                        <p className="text-xs text-gray-400">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{s.userId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Warehouse size={12} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{s.warehouseName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleColors[s.role]}`}>
                      {roleLabels[s.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.status === "active" ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 size={12} /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500"><XCircle size={12} /> Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(s)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No staff found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
