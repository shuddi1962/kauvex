"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Send,
  Edit2,
  MapPin,
  Package,
  Clock,
  Search,
  MoreVertical,
  X,
  Check,
  Star,
  ArrowRight,
} from "lucide-react";

interface ShipmentTemplate {
  id: string;
  name: string;
  origin: string;
  destination: string;
  service: string;
  weight: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  isFavorite: boolean;
  lastUsed: string;
  useCount: number;
  createdDate: string;
}

const MOCK_TEMPLATES: ShipmentTemplate[] = [
  {
    id: "TPL-001",
    name: "Lagos → Abuja Weekly",
    origin: "Lagos, Nigeria",
    destination: "Abuja, Nigeria",
    service: "Express Domestic",
    weight: "2.5 kg",
    recipientName: "Chukwuemeka Okoro",
    recipientPhone: "+234 801 234 5678",
    recipientAddress: "12 Wuse Zone 5, Abuja",
    isFavorite: true,
    lastUsed: "2026-01-20",
    useCount: 16,
    createdDate: "2025-10-15",
  },
  {
    id: "TPL-002",
    name: "Lagos → London Express",
    origin: "Lagos, Nigeria",
    destination: "London, UK",
    service: "International Priority",
    weight: "5.0 kg",
    recipientName: "Sarah Williams",
    recipientPhone: "+44 7700 900123",
    recipientAddress: "45 Oxford Street, London W1",
    isFavorite: true,
    lastUsed: "2026-01-02",
    useCount: 5,
    createdDate: "2025-08-20",
  },
  {
    id: "TPL-003",
    name: "PH → Accra Regional",
    origin: "Port Harcourt, Nigeria",
    destination: "Accra, Ghana",
    service: "Regional Express",
    weight: "1.8 kg",
    recipientName: "Kwame Asante",
    recipientPhone: "+233 24 123 4567",
    recipientAddress: "78 Osu Ring Road, Accra",
    isFavorite: false,
    lastUsed: "2026-01-08",
    useCount: 8,
    createdDate: "2025-11-05",
  },
  {
    id: "TPL-004",
    name: "Abuja → Dubai Standard",
    origin: "Abuja, Nigeria",
    destination: "Dubai, UAE",
    service: "International Standard",
    weight: "10.0 kg",
    recipientName: "Ahmed Al-Rashid",
    recipientPhone: "+971 50 123 4567",
    recipientAddress: "23 Sheikh Zayed Road, Dubai",
    isFavorite: false,
    lastUsed: "2025-12-28",
    useCount: 4,
    createdDate: "2025-09-10",
  },
  {
    id: "TPL-005",
    name: "Lagos → Kano Domestic",
    origin: "Lagos, Nigeria",
    destination: "Kano, Nigeria",
    service: "Express Domestic",
    weight: "3.2 kg",
    recipientName: "Ibrahim Musa",
    recipientPhone: "+234 809 876 5432",
    recipientAddress: "15 Kano Road, Kano",
    isFavorite: false,
    lastUsed: "2026-01-03",
    useCount: 4,
    createdDate: "2025-12-01",
  },
];

const SERVICE_COLORS: Record<string, string> = {
  "Express Domestic": "bg-blue-50 text-blue-700",
  "International Priority": "bg-purple-50 text-purple-700",
  "International Standard": "bg-gray-100 text-gray-700",
  "Regional Express": "bg-teal-50 text-teal-700",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(MOCK_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShipmentTemplate | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destination: "",
    service: "express-domestic",
    weight: "",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
  });

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFavorite = (id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t)));
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setActiveMenu(null);
  };

  const duplicateTemplate = (template: ShipmentTemplate) => {
    const newTpl: ShipmentTemplate = {
      ...template,
      id: `TPL-${String(templates.length + 1).padStart(3, "0")}`,
      name: `${template.name} (Copy)`,
      isFavorite: false,
      lastUsed: "",
      useCount: 0,
      createdDate: new Date().toISOString().split("T")[0],
    };
    setTemplates((prev) => [newTpl, ...prev]);
    setActiveMenu(null);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      origin: "",
      destination: "",
      service: "express-domestic",
      weight: "",
      recipientName: "",
      recipientPhone: "",
      recipientAddress: "",
    });
    setShowModal(true);
  };

  const openEditModal = (template: ShipmentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      origin: template.origin,
      destination: template.destination,
      service: template.service.toLowerCase().replace(/\s+/g, "-"),
      weight: template.weight.replace(" kg", ""),
      recipientName: template.recipientName,
      recipientPhone: template.recipientPhone,
      recipientAddress: template.recipientAddress,
    });
    setShowModal(true);
    setActiveMenu(null);
  };

  const saveTemplate = () => {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: formData.name || t.name,
                origin: formData.origin || t.origin,
                destination: formData.destination || t.destination,
                weight: formData.weight ? `${formData.weight} kg` : t.weight,
                recipientName: formData.recipientName || t.recipientName,
                recipientPhone: formData.recipientPhone || t.recipientPhone,
                recipientAddress: formData.recipientAddress || t.recipientAddress,
              }
            : t
        )
      );
    } else {
      const newTpl: ShipmentTemplate = {
        id: `TPL-${String(templates.length + 1).padStart(3, "0")}`,
        name: formData.name || "New Template",
        origin: formData.origin || "Lagos, Nigeria",
        destination: formData.destination || "Abuja, Nigeria",
        service:
          formData.service === "express-domestic"
            ? "Express Domestic"
            : formData.service === "international-priority"
            ? "International Priority"
            : "International Standard",
        weight: formData.weight ? `${formData.weight} kg` : "1.0 kg",
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        recipientAddress: formData.recipientAddress,
        isFavorite: false,
        lastUsed: "",
        useCount: 0,
        createdDate: new Date().toISOString().split("T")[0],
      };
      setTemplates((prev) => [newTpl, ...prev]);
    }
    setShowModal(false);
  };

  const formatDate = (iso: string) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Saved Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Save shipment details for quick reuse</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#0A1628] truncate">{template.name}</h3>
                  <button
                    onClick={() => toggleFavorite(template.id)}
                    className="shrink-0"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        template.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                </div>
                <span
                  className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    SERVICE_COLORS[template.service] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {template.service}
                </span>
              </div>
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === template.id ? null : template.id)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {activeMenu === template.id && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1">
                    <button
                      onClick={() => openEditModal(template)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => duplicateTemplate(template)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                <span className="truncate">{template.origin}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{template.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>{template.weight}</span>
                <span className="text-gray-300">|</span>
                <span>{template.recipientName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                Used {template.useCount} times · Last: {formatDate(template.lastUsed)}
              </div>
              <Link
                href={`/express/book?template=${template.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00] text-white rounded-lg text-xs font-semibold hover:bg-[#e55f00] transition-colors"
              >
                <Send className="w-3 h-3" />
                Use
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-gray-200 p-10 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No templates found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery ? "Try a different search term" : "Create your first template to speed up shipping"}
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#0A1628]">
                {editingTemplate ? "Edit Template" : "New Template"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lagos → Abuja Weekly"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <input
                    type="text"
                    placeholder="e.g. Lagos, Nigeria"
                    value={formData.origin}
                    onChange={(e) => setFormData((p) => ({ ...p, origin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input
                    type="text"
                    placeholder="e.g. Abuja, Nigeria"
                    value={formData.destination}
                    onChange={(e) => setFormData((p) => ({ ...p, destination: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData((p) => ({ ...p, service: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  >
                    <option value="express-domestic">Express Domestic</option>
                    <option value="international-priority">International Priority</option>
                    <option value="international-standard">International Standard</option>
                    <option value="regional-express">Regional Express</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2.5"
                    value={formData.weight}
                    onChange={(e) => setFormData((p) => ({ ...p, weight: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={formData.recipientName}
                    onChange={(e) => setFormData((p) => ({ ...p, recipientName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone</label>
                  <input
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData((p) => ({ ...p, recipientPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
                <input
                  type="text"
                  placeholder="Full address"
                  value={formData.recipientAddress}
                  onChange={(e) => setFormData((p) => ({ ...p, recipientAddress: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 border-t border-gray-100">
              <button
                onClick={saveTemplate}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold hover:bg-[#e55f00] transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingTemplate ? "Save Changes" : "Create Template"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
