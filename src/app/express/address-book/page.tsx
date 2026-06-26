"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  MapPin,
  Phone,
  User,
  Plus,
  Edit3,
  Trash2,
  Star,
  Home,
  Building2,
  Package,
  ChevronRight,
  RefreshCw,
  X,
  Save,
  Search,
  TrendingUp,
} from "lucide-react";

interface SavedContact {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  type: "home" | "office" | "other";
}

interface FrequentDestination {
  id: string;
  city: string;
  country: string;
  shipmentCount: number;
  avgTransitDays: number;
  lastShipped: string;
  avgCost: number;
}

export default function AddressBookPage() {
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [destinations, setDestinations] = useState<FrequentDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"contacts" | "destinations">("contacts");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<SavedContact | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    type: "home" as "home" | "office" | "other",
    isDefault: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/express/address-book", { method: "POST" });
      const data = await res.json();
      setContacts(data.contacts || []);
      setDestinations(data.destinations || []);
    } catch {
      setContacts(getMockContacts());
      setDestinations(getMockDestinations());
    } finally {
      setLoading(false);
    }
  };

  const getMockContacts = (): SavedContact[] => [
    {
      id: "1",
      label: "Main Office",
      fullName: "Kauvex HQ",
      phone: "+234 801 234 5678",
      address: "14A Admiralty Way",
      city: "Lekki Phase 1",
      state: "Lagos",
      country: "Nigeria",
      zipCode: "101101",
      isDefault: true,
      type: "office",
    },
    {
      id: "2",
      label: "Warehouse A",
      fullName: "FBK Warehouse Lagos",
      phone: "+234 802 345 6789",
      address: "23 Oshodi Expressway",
      city: "Oshodi",
      state: "Lagos",
      country: "Nigeria",
      zipCode: "100261",
      isDefault: false,
      type: "other",
    },
    {
      id: "3",
      label: "Home",
      fullName: "John Doe",
      phone: "+44 7911 123456",
      address: "45 Oxford Street",
      city: "London",
      state: "Greater London",
      country: "United Kingdom",
      zipCode: "W1D 2AR",
      isDefault: false,
      type: "home",
    },
    {
      id: "4",
      label: "Dubai Office",
      fullName: "Kauvex Middle East",
      phone: "+971 4 123 4567",
      address: "Sheikh Zayed Road, Tower B, Floor 12",
      city: "Dubai",
      state: "Dubai",
      country: "UAE",
      zipCode: "00000",
      isDefault: false,
      type: "office",
    },
  ];

  const getMockDestinations = (): FrequentDestination[] => [
    { id: "1", city: "London", country: "UK", shipmentCount: 187, avgTransitDays: 3.2, lastShipped: "2026-06-25", avgCost: 18.5 },
    { id: "2", city: "Lagos", country: "Nigeria", shipmentCount: 342, avgTransitDays: 1.5, lastShipped: "2026-06-26", avgCost: 5.2 },
    { id: "3", city: "Dubai", country: "UAE", shipmentCount: 98, avgTransitDays: 4.1, lastShipped: "2026-06-24", avgCost: 22.8 },
    { id: "4", city: "New York", country: "US", shipmentCount: 76, avgTransitDays: 5.3, lastShipped: "2026-06-22", avgCost: 15.4 },
    { id: "5", city: "Accra", country: "Ghana", shipmentCount: 54, avgTransitDays: 2.8, lastShipped: "2026-06-20", avgCost: 8.9 },
    { id: "6", city: "Nairobi", country: "Kenya", shipmentCount: 31, avgTransitDays: 4.5, lastShipped: "2026-06-18", avgCost: 12.3 },
  ];

  const resetForm = () => {
    setFormData({
      label: "",
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      type: "home",
      isDefault: false,
    });
  };

  const openEditForm = (contact: SavedContact) => {
    setEditingContact(contact);
    setFormData({
      label: contact.label,
      fullName: contact.fullName,
      phone: contact.phone,
      address: contact.address,
      city: contact.city,
      state: contact.state,
      country: contact.country,
      zipCode: contact.zipCode,
      type: contact.type,
      isDefault: contact.isDefault,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const method = editingContact ? "PUT" : "POST";
    try {
      await fetch("/api/v1/express/address-book", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingContact?.id }),
      });
      setShowForm(false);
      setEditingContact(null);
      resetForm();
      fetchData();
    } catch {
      // optimistic update
      if (editingContact) {
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? { ...c, ...formData } : c))
        );
      } else {
        setContacts((prev) => [
          ...prev,
          { id: Date.now().toString(), ...formData },
        ]);
      }
      setShowForm(false);
      setEditingContact(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/v1/express/address-book?id=${id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
    setDeleteConfirm(null);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    if (type === "home") return <Home size={14} className="text-blue-400" />;
    if (type === "office") return <Building2 size={14} className="text-purple-400" />;
    return <Package size={14} className="text-amber-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A1628" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading address book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A1628" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center">
                <BookOpen className="text-[#FF6B00]" size={22} />
              </div>
              <h1 className="text-2xl font-bold text-white">Address Book</h1>
            </div>
            <p className="text-white/50 text-sm">Manage your saved addresses and frequent destinations</p>
          </div>
          {tab === "contacts" && (
            <button
              onClick={() => {
                resetForm();
                setEditingContact(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add Address
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("contacts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "contacts"
                ? "bg-[#FF6B00] text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
            }`}
          >
            <User size={16} /> Saved Contacts
          </button>
          <button
            onClick={() => setTab("destinations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "destinations"
                ? "bg-[#FF6B00] text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
            }`}
          >
            <MapPin size={16} /> Frequent Destinations
          </button>
        </div>

        {/* Contacts Tab */}
        {tab === "contacts" && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              />
            </div>

            {/* Contact List */}
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      {getTypeIcon(contact.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-sm">{contact.label}</h3>
                        {contact.isDefault && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                            <Star size={8} /> DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{contact.fullName}</p>
                      <p className="text-white/50 text-xs mt-1">
                        {contact.address}, {contact.city}, {contact.state} {contact.zipCode}
                      </p>
                      <p className="text-white/50 text-xs">{contact.country}</p>
                      <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                        <Phone size={10} /> {contact.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditForm(contact)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(contact.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === contact.id && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm mb-2">Delete this address?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-white/70 text-xs hover:bg-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-16">
                <MapPin size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No Addresses Found</h3>
                <p className="text-white/50 text-sm">
                  {searchQuery ? "Try a different search term." : "Add your first saved address."}
                </p>
              </div>
            )}
          </>
        )}

        {/* Destinations Tab */}
        {tab === "destinations" && (
          <div className="space-y-3">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-[#FF6B00]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {dest.city}, {dest.country}
                      </h3>
                      <p className="text-white/40 text-xs">
                        Last shipped: {new Date(dest.lastShipped).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-white/40 text-xs mb-1">Shipments</p>
                      <p className="text-[#FF6B00] font-bold">{dest.shipmentCount}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Avg Transit</p>
                      <p className="text-white font-bold">{dest.avgTransitDays}d</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Avg Cost</p>
                      <p className="text-emerald-400 font-bold">${dest.avgCost.toFixed(2)}</p>
                    </div>
                  </div>

                  <button className="flex items-center gap-1 px-3 py-1.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                    <Package size={14} /> Ship Here
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Volume Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Route volume</span>
                    <span>{dest.shipmentCount} shipments</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B00] rounded-full"
                      style={{
                        width: `${Math.min((dest.shipmentCount / Math.max(...destinations.map((d) => d.shipmentCount))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {destinations.length === 0 && (
              <div className="text-center py-16">
                <TrendingUp size={48} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-white text-lg font-semibold mb-2">No Destinations Yet</h3>
                <p className="text-white/50 text-sm">Your frequent destinations will appear here after you ship.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Address Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setEditingContact(null);
            }}
          />
          <div className="relative bg-[#0f1d32] border border-white/10 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-lg font-bold">
                {editingContact ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingContact(null);
                }}
                className="text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Office, Warehouse"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "home" | "office" | "other" })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  >
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-1.5">Full Name / Business</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-1.5">Phone</label>
                <input
                  type="tel"
                  placeholder="+234..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm block mb-1.5">Address</label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">State / Region</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm block mb-1.5">ZIP Code</label>
                  <input
                    type="text"
                    placeholder="ZIP"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <span className="text-white/70 text-sm">Set as default address</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingContact(null);
                }}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.fullName || !formData.address}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] hover:bg-[#FF6B00]/80 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save size={14} />
                {editingContact ? "Update" : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
