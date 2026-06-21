"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Package, Image as ImageIcon, Edit, Trash2, Copy, Plus,
  ChevronDown, MoreHorizontal, Filter, X, Eye, Sliders, Check,
  AlertTriangle, DollarSign, Truck, TrendingUp, BarChart3, Box,
  Warehouse, ShoppingCart, Printer, Megaphone, ToggleLeft, ToggleRight,
  Minus,
} from "lucide-react";
import VendorShell from "@/components/vendor/vendor-shell";

const demoProducts = [
  { id: "PRD-001", image: null, sku: "GPS-MAR-7", name: "Marine GPS Navigator 7-inch", condition: "New", productId: "PROD-12345", dateCreated: "2026-01-15", availableQty: 50, estimatedFee: 3.50, price: 49.99, shipping: 5.99, pricingStatus: "Competitive", businessPrice: 42.00, saved: false },
  { id: "PRD-002", image: null, sku: "ANCH-12MM", name: "Yacht Anchor Chain 12mm", condition: "New", productId: "PROD-12346", dateCreated: "2026-02-10", availableQty: 120, estimatedFee: 5.20, price: 34.99, shipping: 8.99, pricingStatus: "Below Buy Box", businessPrice: 28.00, saved: false },
  { id: "PRD-003", image: null, sku: "LED-NAV-SET", name: "LED Navigation Light Set", condition: "Refurbished", productId: "PROD-12347", dateCreated: "2026-03-05", availableQty: 0, estimatedFee: 2.80, price: 24.99, shipping: 4.99, pricingStatus: "Suppressed", businessPrice: 18.00, saved: false },
  { id: "PRD-004", image: null, sku: "VHF-RADIO-DSC", name: "Marine VHF Radio DSC", condition: "Used - Like New", productId: "PROD-12348", dateCreated: "2026-03-20", availableQty: 15, estimatedFee: 4.10, price: 89.99, shipping: 6.99, pricingStatus: "Competitive", businessPrice: 72.00, saved: true },
  { id: "PRD-005", image: null, sku: "COVER-HVY-DTY", name: "Boat Cover Heavy Duty", condition: "New", productId: "PROD-12349", dateCreated: "2026-04-01", availableQty: 5, estimatedFee: 6.75, price: 129.99, shipping: 12.99, pricingStatus: "Below Buy Box", businessPrice: 98.00, saved: false },
  { id: "PRD-006", image: null, sku: "FISH-FD-50LB", name: "Premium Fish Food 50lb", condition: "New", productId: "PROD-12350", dateCreated: "2026-04-15", availableQty: 200, estimatedFee: 2.15, price: 39.99, shipping: 7.99, pricingStatus: "Competitive", businessPrice: 31.00, saved: false },
  { id: "PRD-007", image: null, sku: "ROD-FIBER-12", name: "Fiberglass Fishing Rod 12ft", condition: "Collectible", productId: "PROD-12351", dateCreated: "2026-05-01", availableQty: 8, estimatedFee: 8.50, price: 149.99, shipping: 10.99, pricingStatus: "Premium", businessPrice: 115.00, saved: true },
  { id: "PRD-008", image: null, sku: "ECHO-SOUNDER", name: "Fishfinder Echo Sounder", condition: "New", productId: "PROD-12352", dateCreated: "2026-05-20", availableQty: 0, estimatedFee: 3.90, price: 79.99, shipping: 6.99, pricingStatus: "Suppressed", businessPrice: 58.00, saved: false },
];

const statusFilterOptions = ["All", "Active", "Inactive", "Suppressed"];
const fulfilledByOptions = ["All", "Merchant", "FBK"];

const listingTools = [
  { label: "All Inventory", icon: Package, active: true },
  { label: "Suppressed / Inactive", icon: AlertTriangle },
  { label: "Listing Quality", icon: BarChart3 },
  { label: "Potential Duplicates", icon: Copy },
  { label: "Add a Variation", icon: Plus },
];

const fulfillmentTools = [
  { label: "FBK Dashboard", icon: Warehouse, href: "/vendor/fbk" },
  { label: "Manage Inventory", icon: Box },
  { label: "FBK Inventory", icon: Package },
  { label: "Remove Unfulfillable", icon: Trash2 },
  { label: "Shipments", icon: Truck, href: "/vendor/fbk" },
  { label: "FBK Opportunities", icon: TrendingUp },
  { label: "FBK Analytics", icon: BarChart3, href: "/vendor/fbk" },
];

const columns = [
  { key: "image", label: "Image", visible: true },
  { key: "sku", label: "SKU", visible: true },
  { key: "name", label: "Product Name", visible: true },
  { key: "condition", label: "Condition", visible: true },
  { key: "productId", label: "Product ID", visible: true },
  { key: "dateCreated", label: "Date Created", visible: true },
  { key: "availableQty", label: "Available Qty", visible: true },
  { key: "estimatedFee", label: "Est. Fee", visible: true },
  { key: "priceShipping", label: "Price + Shipping", visible: true },
  { key: "pricingStatus", label: "Pricing Status", visible: true },
  { key: "businessPrice", label: "Business Price", visible: true },
  { key: "saved", label: "Save", visible: true },
];

export default function VendorInventoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fulfilledBy, setFulfilledBy] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [activeListingTool, setActiveListingTool] = useState("All Inventory");
  const [colDefs, setColDefs] = useState(columns);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = demoProducts.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "Suppressed" && p.pricingStatus !== "Suppressed") return false;
    if (statusFilter === "Active" && p.availableQty === 0) return false;
    if (statusFilter === "Inactive" && p.availableQty > 0) return false;
    if (fulfilledBy !== "All") return false;
    return true;
  });

  const toggleColumn = (key: string) => {
    setColDefs(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c));
  };

  const toggleRowSelect = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAllRows = () => {
    if (selectedRows.length === filtered.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filtered.map(p => p.id));
    }
  };

  const bulkActions = [
    { label: "Edit Selected", action: () => showToast("success", "Bulk edit initiated") },
    { label: "Delete Selected", action: () => showToast("error", "Bulk delete not available in demo") },
    { label: "Toggle Fulfillment", action: () => showToast("success", "Fulfillment toggled for selected") },
    { label: "Create Removal Order", action: () => showToast("success", "Removal order created") },
    { label: "Create Fulfillment Order", action: () => showToast("success", "Fulfillment order created") },
    { label: "Print Labels", action: () => showToast("success", "Labels queued for printing") },
  ];

  const rowActions = [
    { label: "Edit", icon: Edit, action: () => showToast("success", "Edit mode opened") },
    { label: "Manage Images", icon: ImageIcon, action: () => showToast("success", "Image manager opened") },
    { label: "Copy Listing", icon: Copy, action: () => showToast("success", "Listing copied") },
    { label: "Add Another Condition", icon: Plus, action: () => showToast("success", "Condition added") },
    { label: "Toggle Fulfillment", icon: Truck, action: () => showToast("success", "Fulfillment toggled") },
    { label: "Match Low Price", icon: Minus, action: () => showToast("success", "Price matched") },
    { label: "Create Removal Order", icon: Trash2, action: () => showToast("success", "Removal order created") },
    { label: "Create Fulfillment Order", icon: ShoppingCart, action: () => showToast("success", "Fulfillment order created") },
    { label: "Print Labels", icon: Printer, action: () => showToast("success", "Labels queued") },
    { label: "Close Listing", icon: X, action: () => showToast("error", "Listing closed") },
    { label: "Delete", icon: Trash2, action: () => showToast("error", "Listing deleted") },
    { label: "Advertise", icon: Megaphone, action: () => showToast("success", "Ad campaign created") },
  ];

  const cellClasses = "p-3 text-xs text-text-1";
  const headerClass = "text-left p-3 text-[10px] font-semibold text-text-4 uppercase whitespace-nowrap";

  return (
    <VendorShell title="Inventory" subtitle="Manage your product inventory and listings">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="flex gap-5">
        {/* LEFT SIDEBAR */}
        <div className="w-52 shrink-0 space-y-4">
          {/* Listing Tools */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-gray-50/50">
              <p className="text-[10px] font-bold text-text-4 uppercase tracking-wider">Listing Tools</p>
            </div>
            <div className="p-2 space-y-0.5">
              {listingTools.map(tool => (
                <button key={tool.label} onClick={() => setActiveListingTool(tool.label)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeListingTool === tool.label
                      ? "bg-orange/10 text-orange font-bold"
                      : "text-text-3 hover:bg-gray-50 hover:text-text-1"
                  }`}>
                  <tool.icon size={14} />
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fulfillment Tools */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-gray-50/50">
              <p className="text-[10px] font-bold text-text-4 uppercase tracking-wider">Fulfillment Tools</p>
            </div>
            <div className="p-2 space-y-0.5">
              {fulfillmentTools.map(tool => {
                const isLink = tool.href;
                const content = (
                  <div className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-text-3 hover:bg-gray-50 hover:text-text-1 transition-colors">
                    <tool.icon size={14} />
                    {tool.label}
                  </div>
                );
                return isLink ? (
                  <Link key={tool.label} href={tool.href}>{content}</Link>
                ) : (
                  <button key={tool.label} onClick={() => showToast("success", `${tool.label} opened`)}>{content}</button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search + Filters bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by SKU, product name..."
                className="w-full h-10 pl-10 pr-4 text-sm border border-border rounded-xl" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 text-xs border border-border rounded-xl bg-white">
              {statusFilterOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={fulfilledBy} onChange={e => setFulfilledBy(e.target.value)}
              className="h-10 px-3 text-xs border border-border rounded-xl bg-white">
              {fulfilledByOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 h-10 px-3 border border-border rounded-xl text-xs font-semibold transition-colors ${showFilters ? "bg-orange/10 text-orange border-orange/30" : "text-text-4 hover:bg-gray-50"}`}>
              <Filter size={14} /> Filters
            </button>
            <div className="relative">
              <button onClick={() => setShowColumnCustomizer(!showColumnCustomizer)}
                className="flex items-center gap-1.5 h-10 px-3 border border-border rounded-xl text-xs font-semibold text-text-4 hover:bg-gray-50 transition-colors">
                <Sliders size={14} /> Columns
              </button>
              {showColumnCustomizer && (
                <div className="absolute right-0 top-full mt-1 z-20 w-52 bg-white border border-border rounded-xl shadow-xl p-3 space-y-1.5" onMouseLeave={() => setShowColumnCustomizer(false)}>
                  <p className="text-[10px] font-bold text-text-4 uppercase mb-2">Toggle Columns</p>
                  {colDefs.map(col => (
                    <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={col.visible} onChange={() => toggleColumn(col.key)} className="rounded" />
                      <span className="text-xs text-text-2">{col.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-border p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-text-4 block mb-1">Condition</label>
                <select className="w-full h-9 px-2 text-xs border border-border rounded-lg bg-white">
                  <option>All Conditions</option>
                  <option>New</option>
                  <option>Used - Like New</option>
                  <option>Used - Good</option>
                  <option>Refurbished</option>
                  <option>Collectible</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-4 block mb-1">Price Range</label>
                <div className="flex gap-1">
                  <input placeholder="Min" type="number" className="w-full h-9 px-2 text-xs border border-border rounded-lg" />
                  <input placeholder="Max" type="number" className="w-full h-9 px-2 text-xs border border-border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-4 block mb-1">Qty Range</label>
                <div className="flex gap-1">
                  <input placeholder="Min" type="number" className="w-full h-9 px-2 text-xs border border-border rounded-lg" />
                  <input placeholder="Max" type="number" className="w-full h-9 px-2 text-xs border border-border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-4 block mb-1">Date Created</label>
                <input type="date" className="w-full h-9 px-2 text-xs border border-border rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-4 block mb-1">Pricing Status</label>
                <select className="w-full h-9 px-2 text-xs border border-border rounded-lg bg-white">
                  <option>All</option>
                  <option>Competitive</option>
                  <option>Below Buy Box</option>
                  <option>Premium</option>
                  <option>Suppressed</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={() => showToast("success", "Filters applied")}
                  className="w-full h-9 bg-orange text-white text-xs font-bold rounded-lg hover:bg-orange/90 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedRows.length > 0 && (
            <div className="bg-orange/5 border border-orange/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <span className="text-xs font-semibold text-orange">{selectedRows.length} selected</span>
              <div className="h-4 w-px bg-orange/20" />
              {bulkActions.map(act => (
                <button key={act.label} onClick={act.action}
                  className="text-[11px] font-medium text-text-3 hover:text-orange transition-colors">{act.label}</button>
              ))}
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className={headerClass + " w-8"}>
                    <input type="checkbox" checked={selectedRows.length === filtered.length && filtered.length > 0} onChange={toggleAllRows} className="rounded" />
                  </th>
                  {colDefs.filter(c => c.visible).map(col => (
                    <th key={col.key} className={headerClass}>
                      {col.label === "Price + Shipping" ? "Price + Shipping" : col.label}
                    </th>
                  ))}
                  <th className={headerClass + " w-12"}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const pricingColor = p.pricingStatus === "Competitive" ? "text-green-700 bg-green-50" : p.pricingStatus === "Below Buy Box" ? "text-red-700 bg-red-50" : p.pricingStatus === "Suppressed" ? "text-gray-500 bg-gray-100" : "text-blue-700 bg-blue-50";
                  return (
                    <tr key={p.id} className={`border-b border-border hover:bg-gray-50/50 ${p.availableQty === 0 ? "opacity-60" : ""}`}>
                      <td className="p-3">
                        <input type="checkbox" checked={selectedRows.includes(p.id)} onChange={() => toggleRowSelect(p.id)} className="rounded" />
                      </td>
                      {colDefs.filter(c => c.visible).map(col => {
                        const v = col.key as keyof typeof p;
                        return (
                          <td key={col.key} className={cellClasses}>
                            {col.key === "image" ? (
                              p.image ? <img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover" /> : (
                                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Package size={14} className="text-text-4" />
                                </div>
                              )
                            ) : col.key === "name" ? (
                              <div>
                                <p className="font-medium text-text-1 text-xs">{p.name}</p>
                                <p className="text-[10px] text-text-4">{p.condition}</p>
                              </div>
                            ) : col.key === "availableQty" ? (
                              <span className={`font-semibold font-mono text-xs ${p.availableQty === 0 ? "text-red-600" : p.availableQty < 10 ? "text-amber-600" : "text-green-700"}`}>
                                {p.availableQty}
                              </span>
                            ) : col.key === "estimatedFee" ? (
                              <span className="font-mono text-xs">${p.estimatedFee.toFixed(2)}</span>
                            ) : col.key === "priceShipping" ? (
                              <div>
                                <span className="font-semibold font-mono text-xs">${p.price.toFixed(2)}</span>
                                <span className="text-[10px] text-text-4 ml-1">+ ${p.shipping.toFixed(2)}</span>
                              </div>
                            ) : col.key === "pricingStatus" ? (
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${pricingColor}`}>{p.pricingStatus}</span>
                            ) : col.key === "businessPrice" ? (
                              <span className="font-mono text-xs">${p.businessPrice.toFixed(2)}</span>
                            ) : col.key === "saved" ? (
                              <button onClick={() => showToast("success", "Saved item toggled")}>
                                {p.saved ? <Check size={14} className="text-orange" /> : <div className="w-3.5 h-3.5 border border-border rounded" />}
                              </button>
                            ) : (
                              <span className="text-xs">{String(p[v as keyof typeof p] ?? "")}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-3 relative">
                        <button onClick={() => setOpenDropdown(openDropdown === p.id ? null : p.id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal size={14} className="text-text-4" />
                        </button>
                        {openDropdown === p.id && (
                          <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white border border-border rounded-xl shadow-xl py-1" onMouseLeave={() => setOpenDropdown(null)}>
                            {rowActions.map(act => (
                              <button key={act.label} onClick={() => { act.action(); setOpenDropdown(null); }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-text-2 hover:bg-gray-50 transition-colors">
                                <act.icon size={13} className="text-text-4" />
                                {act.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={colDefs.filter(c => c.visible).length + 2} className="p-8 text-center text-text-4 text-sm">No inventory items found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-text-4">{filtered.length} of {demoProducts.length} items</p>
            <div className="flex items-center gap-2">
              <Link href="/vendor/inventory/replenishment-alerts" className="flex items-center gap-1.5 px-4 h-9 border border-border text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                <AlertTriangle size={13} /> Replenishment Alerts
              </Link>
              <Link href="/vendor/fbk/inbound" className="flex items-center gap-1.5 px-4 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
                <Plus size={13} /> Send to FBK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </VendorShell>
  );
}
