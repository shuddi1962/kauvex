"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Star,
  X,
  Save,
  User,
  Phone,
  Mail,
  Building2,
  MapPin,
  Home,
  Package,
  Check,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Kauvex HQ",
    email: "hq@kauvex.com",
    phone: "+234 801 234 5678",
    company: "Kauvex Commerce Cloud",
    addressLine1: "14A Admiralty Way",
    addressLine2: "Floor 3, Suite 301",
    city: "Lekki Phase 1",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "101101",
    isDefault: true,
  },
  {
    id: "2",
    name: "James Wilson",
    email: "james.wilson@techcorp.co.uk",
    phone: "+44 7911 123456",
    company: "TechCorp UK",
    addressLine1: "45 Oxford Street",
    addressLine2: "2nd Floor",
    city: "London",
    state: "Greater London",
    country: "United Kingdom",
    postalCode: "W1D 2AR",
    isDefault: false,
  },
  {
    id: "3",
    name: "Fatima Al-Hassan",
    email: "fatima@gulftrading.ae",
    phone: "+971 4 567 8901",
    company: "Gulf Trading LLC",
    addressLine1: "Sheikh Zayed Road, Tower B",
    addressLine2: "Floor 12, Office 1204",
    city: "Dubai",
    state: "Dubai",
    country: "UAE",
    postalCode: "00000",
    isDefault: false,
  },
  {
    id: "4",
    name: "Aisha Bello",
    email: "aisha@lagoswarehouse.ng",
    phone: "+234 812 456 7890",
    company: "Lagos Fulfillment Center",
    addressLine1: "23 Oshodi Expressway",
    addressLine2: "Warehouse Block C",
    city: "Oshodi",
    state: "Lagos",
    country: "Nigeria",
    postalCode: "100261",
    isDefault: false,
  },
  {
    id: "5",
    name: "Sarah Mitchell",
    email: "sarah.m@nycimports.com",
    phone: "+1 212 555 0147",
    company: "NYC Imports Inc.",
    addressLine1: "350 Fifth Avenue",
    addressLine2: "Suite 7400",
    city: "New York",
    state: "New York",
    country: "United States",
    postalCode: "10118",
    isDefault: false,
  },
  {
    id: "6",
    name: "Daniel Okafor",
    email: "daniel@abujalogistics.ng",
    phone: "+234 803 678 9012",
    company: "Abuja Logistics Partners",
    addressLine1: "15 Aguiyi-Ironsi Street",
    addressLine2: "",
    city: "Maitama",
    state: "FCT",
    country: "Nigeria",
    postalCode: "900271",
    isDefault: false,
  },
];

const EMPTY_FORM: Omit<Contact, "id"> = {
  name: "",
  email: "",
  phone: "",
  company: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  isDefault: false,
};

export default function SavedContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      addressLine1: contact.addressLine1,
      addressLine2: contact.addressLine2,
      city: contact.city,
      state: contact.state,
      country: contact.country,
      postalCode: contact.postalCode,
      isDefault: contact.isDefault,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.addressLine1 || !formData.city) return;
    if (editingId) {
      setContacts((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
      );
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        ...formData,
      };
      setContacts((prev) => [newContact, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleDelete = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const toggleDefault = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id ? !c.isDefault : c.isDefault,
      }))
    );
  };

  const getTypeIcon = (company: string) => {
    if (company.toLowerCase().includes("warehouse") || company.toLowerCase().includes("fulfillment"))
      return <Package className="w-4 h-4 text-purple-500" />;
    if (company.toLowerCase().includes("trading") || company.toLowerCase().includes("imports"))
      return <Building2 className="w-4 h-4 text-blue-500" />;
    return <Home className="w-4 h-4 text-green-500" />;
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Saved Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your saved shipping contacts and addresses</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone, company, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0A1628]">No Contacts Found</h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? "Try a different search term." : "Add your first contact to get started."}
          </p>
          {!searchQuery && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F5F7FA] flex items-center justify-center">
                  {getTypeIcon(contact.company)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#0A1628] text-sm truncate">{contact.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{contact.company}</p>
                </div>
              </div>
              {contact.isDefault && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF6B00] text-[10px] font-bold shrink-0">
                  <Star className="w-3 h-3" /> DEFAULT
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {contact.addressLine1}
                  {contact.addressLine2 && <>, {contact.addressLine2}</>}
                  <br />
                  {contact.city}, {contact.state} {contact.postalCode}
                  <br />
                  {contact.country}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => toggleDefault(contact.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  contact.isDefault
                    ? "bg-[#FF6B00]/10 text-[#FF6B00]"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {contact.isDefault ? <Star className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                {contact.isDefault ? "Default" : "Set Default"}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => openEdit(contact)}
                className="p-2 text-gray-400 hover:text-[#FF6B00] hover:bg-[#FF6B00]/5 rounded-lg transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(contact.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {deleteConfirm === contact.id && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-xs font-medium mb-2">Delete this contact?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#0A1628]">
                {editingId ? "Edit Contact" : "Add New Contact"}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Full Name *</label>
                <input
                  type="text"
                  placeholder="Contact name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Phone</label>
                  <input
                    type="tel"
                    placeholder="+234..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Company</label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Address Line 1 *</label>
                <input
                  type="text"
                  placeholder="Street address"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Address Line 2</label>
                <input
                  type="text"
                  placeholder="Apt, suite, floor (optional)"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">State / Region</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#0A1628] mb-1.5 block">Postal Code</label>
                  <input
                    type="text"
                    placeholder="Postal code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <span className="text-sm text-[#0A1628] font-medium">Set as default contact</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.addressLine1 || !formData.city}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Save className="w-4 h-4" />
                {editingId ? "Update Contact" : "Save Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
