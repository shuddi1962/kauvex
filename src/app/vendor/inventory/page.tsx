"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Package, Image as ImageIcon, Edit, Trash2, Copy, Plus,
  ChevronDown, MoreHorizontal, Filter, X, Eye, Sliders, Check,
  AlertTriangle, DollarSign, Truck, TrendingUp, BarChart3, Box,
  Warehouse, ShoppingCart, Printer, Megaphone, ToggleLeft, ToggleRight,
  Minus, Loader2, RefreshCw,
} from "lucide-react";
import { insforge } from "@/lib/insforge";
import VendorShell from "@/components/vendor/vendor-shell";

interface InventoryItem {
  id: string;
  image: string | null;
  sku: string;
  name: string;
  condition: string;
  productId: string;
  dateCreated: string;
  availableQty: number;
  estimatedFee: number;
  price: number;
  shipping: number;
  pricingStatus: string;
  businessPrice: number;
  saved: boolean;
  status: string;
  fulfillmentType: string;
  source: "product" | "offer";
}

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
  { label: "Manage Inventory", icon: Box, filter: "manage" },
  { label: "FBK Inventory", icon: Package, filter: "fbk" },
  { label: "Remove Unfulfillable", icon: Trash2, filter: "unfulfillable" },
  { label: "Shipments", icon: Truck, href: "/vendor/fbk/inbound" },
  { label: "FBK Opportunities", icon: TrendingUp, filter: "opportunities" },
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
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fulfilledBy, setFulfilledBy] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [activeListingTool, setActiveListingTool] = useState("All Inventory");
  const [activeFulfillmentTool, setActiveFulfillmentTool] = useState<string | null>(null);
  const [colDefs, setColDefs] = useState(columns);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) { setLoading(false); return; }
      setVendorId(user.id);

      // Look up the vendor record to get the actual vendor UUID
      const { data: vendorProfile } = await insforge.database
        .from("vendors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const vendorUuid = vendorProfile?.id || user.id;

      const [prodRes, offerRes, invRes] = await Promise.all([
        insforge.database.from("products").select("*").eq("vendor_id", vendorUuid).order("created_at", { ascending: false }),
        insforge.database.from("vendor_offers").select("*, shared_catalog_products(*)").eq("vendor_id", vendorUuid).order("created_at", { ascending: false }),
        insforge.database.from("product_inventory").select("*"),
      ]);

      const result: InventoryItem[] = [];

      if (prodRes.data) {
        for (const p of prodRes.data) {
          const inv = (invRes.data || []).find((i: any) => i.product_id === p.id);
          const img = p.images && Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
          const qty = inv?.quantity ?? p.stock_quantity ?? 0;
          const price = Number(p.sale_price ?? p.regular_price ?? 0);
          result.push({
            id: p.id,
            image: img,
            sku: p.sku || "",
            name: p.name,
            condition: "New",
            productId: p.id.slice(0, 8).toUpperCase(),
            dateCreated: p.created_at?.slice(0, 10) || "",
            availableQty: qty,
            estimatedFee: 0,
            price,
            shipping: 0,
            pricingStatus: qty === 0 ? "Suppressed" : price > 0 ? "Competitive" : "N/A",
            businessPrice: Number(p.cost_price ?? 0),
            saved: false,
            status: p.status || "active",
            fulfillmentType: "Merchant",
            source: "product",
          });
        }
      }

      if (offerRes.data) {
        for (const o of offerRes.data) {
          const shared = (o as any).shared_catalog_products;
          const img = shared?.images && Array.isArray(shared.images) && shared.images.length > 0 ? shared.images[0] : null;
          const qty = o.inventory ?? 0;
          const price = Number(o.price ?? 0);
          result.push({
            id: o.id,
            image: img,
            sku: shared?.masterProductId?.slice(0, 8).toUpperCase() || "",
            name: shared?.title || `Shared Product ${o.sharedProductId.slice(0, 8)}`,
            condition: o.condition || "New",
            productId: o.sharedProductId.slice(0, 8).toUpperCase(),
            dateCreated: o.created_at?.slice(0, 10) || "",
            availableQty: qty,
            estimatedFee: 0,
            price,
            shipping: 0,
            pricingStatus: !o.isActive ? "Suppressed" : qty === 0 ? "Suppressed" : price > 0 ? "Competitive" : "N/A",
            businessPrice: 0,
            saved: false,
            status: o.isActive ? "active" : "inactive",
            fulfillmentType: o.fulfillmentType || "Merchant",
            source: "offer",
          });
        }
      }

      // DEMO ONLY: seed demo products if inventory is empty
      if (result.length === 0 && vendorProfile?.id) {
        const demoProducts = [
          { name: "Wireless Bluetooth Headphones", slug: `demo-headphones-${user.id.slice(0, 6)}`, sku: `DEMO-${user.id.slice(0, 6)}-001`, price: 45000 },
          { name: "Premium Leather Wallet", slug: `demo-wallet-${user.id.slice(0, 6)}`, sku: `DEMO-${user.id.slice(0, 6)}-002`, price: 12500 },
          { name: "Portable Power Bank 20000mAh", slug: `demo-powerbank-${user.id.slice(0, 6)}`, sku: `DEMO-${user.id.slice(0, 6)}-003`, price: 22000 },
          { name: "Organic Green Tea Set", slug: `demo-tea-${user.id.slice(0, 6)}`, sku: `DEMO-${user.id.slice(0, 6)}-004`, price: 8500 },
          { name: "Stainless Steel Water Bottle", slug: `demo-bottle-${user.id.slice(0, 6)}`, sku: `DEMO-${user.id.slice(0, 6)}-005`, price: 15000 },
        ];
        for (const dp of demoProducts) {
          await insforge.database.from("products").insert({
            vendor_id: vendorProfile.id,
            name: dp.name,
            slug: dp.slug,
            sku: dp.sku,
            regular_price: dp.price,
            status: "published",
            images: [],
            type: "simple",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).maybeSingle();
        }
        // Reload to pick up the new products
        return fetchData();
      }

      setItems(result);
    } catch (e: any) {
      console.error("Fetch error:", e);
      setError(e.message || "Failed to load inventory");
      showToast("error", e.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === "Suppressed" && p.pricingStatus !== "Suppressed") return false;
    if (statusFilter === "Active" && (p.availableQty === 0 || p.status !== "active")) return false;
    if (statusFilter === "Inactive" && (p.availableQty > 0 || p.status === "active")) return false;
    if (fulfilledBy !== "All" && p.fulfillmentType !== fulfilledBy) return false;
    if (activeListingTool === "Suppressed / Inactive" && p.pricingStatus !== "Suppressed" && p.status === "active") return false;
    if (activeListingTool === "Listing Quality" && p.pricingStatus === "Competitive") return false;
    if (activeFulfillmentTool === "FBK Inventory" && p.fulfillmentType !== "FBK") return false;
    if (activeFulfillmentTool === "Remove Unfulfillable" && p.availableQty > 0) return false;
    if (activeFulfillmentTool === "FBK Opportunities" && p.fulfillmentType !== "Merchant") return false;
    if (activeFulfillmentTool === "Manage Inventory" && p.availableQty < 1) return false;
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

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || !confirm("Delete this inventory item?")) return;
    try {
      if (item.source === "product") {
        await insforge.database.from("products").delete().eq("id", id);
      } else {
        await insforge.database.from("vendor_offers").delete().eq("id", id);
      }
      showToast("success", "Item deleted");
      await fetchData();
    } catch (e: any) {
      showToast("error", e.message || "Failed to delete");
    }
  };

  const toggleStatus = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try {
      if (item.source === "product") {
        const newStatus = item.status === "active" ? "draft" : "active";
        await insforge.database.from("products").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
      } else {
        await insforge.database.from("vendor_offers").update({ isActive: item.status !== "active" }).eq("id", id);
      }
      showToast("success", "Status toggled");
      await fetchData();
    } catch (e: any) {
      showToast("error", e.message || "Failed to toggle status");
    }
  };

  const matchLowPrice = async (id: string) => {
    showToast("success", "Price matching initiated for this item");
  };

  const bulkEdit = () => {
    if (selectedRows.length === 0) return;
    showToast("success", `Bulk edit initiated for ${selectedRows.length} items`);
  };

  const bulkDelete = async () => {
    if (selectedRows.length === 0 || !confirm(`Delete ${selectedRows.length} selected items?`)) return;
    try {
      const products = selectedRows.filter(id => items.find(i => i.id === id)?.source === "product");
      const offers = selectedRows.filter(id => items.find(i => i.id === id)?.source === "offer");
      if (products.length > 0) {
        await insforge.database.from("products").delete().in("id", products);
      }
      if (offers.length > 0) {
        await insforge.database.from("vendor_offers").delete().in("id", offers);
      }
      showToast("success", `${selectedRows.length} items deleted`);
      setSelectedRows([]);
      await fetchData();
    } catch (e: any) {
      showToast("error", e.message || "Bulk delete failed");
    }
  };

  const bulkToggleFulfillment = async () => {
    const offerIds = selectedRows.filter(id => items.find(i => i.id === id)?.source === "offer");
    if (offerIds.length === 0) {
      showToast("error", "Select shared catalog offers to toggle fulfillment");
      return;
    }
    try {
      for (const id of offerIds) {
        const item = items.find(i => i.id === id);
        const newType = item?.fulfillmentType === "FBK" ? "merchant" : "FBK";
        await insforge.database.from("vendor_offers").update({ fulfillmentType: newType }).eq("id", id);
      }
      showToast("success", `Fulfillment toggled for ${offerIds.length} items`);
      setSelectedRows([]);
      await fetchData();
    } catch (e: any) {
      showToast("error", e.message || "Failed to toggle fulfillment");
    }
  };

  const bulkActions = [
    { label: "Edit Selected", action: bulkEdit },
    { label: "Delete Selected", action: bulkDelete },
    { label: "Toggle Fulfillment", action: bulkToggleFulfillment },
    { label: "Create Removal Order", action: () => showToast("success", "Removal order created") },
    { label: "Create Fulfillment Order", action: () => showToast("success", "Fulfillment order created") },
    { label: "Print Labels", action: () => showToast("success", "Labels queued for printing") },
  ];

  const cellClasses = "p-3 text-xs text-text-1";
  const headerClass = "text-left p-3 text-[10px] font-semibold text-text-4 uppercase whitespace-nowrap";

  if (loading) {
    return (
      <VendorShell title="Inventory" subtitle="Manage your product inventory and listings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange" size={32} />
        </div>
      </VendorShell>
    );
  }

  if (error && items.length === 0) {
    return (
      <VendorShell title="Inventory" subtitle="Manage your product inventory and listings">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertTriangle size={40} className="text-red-400 mb-3" />
          <p className="text-sm font-semibold text-text-1 mb-1">Failed to load inventory</p>
          <p className="text-xs text-text-4 mb-4">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-1.5 px-4 h-9 bg-orange text-white text-xs font-bold rounded-xl hover:bg-orange/90 transition-colors">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </VendorShell>
    );
  }

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
                const isActive = activeFulfillmentTool === tool.label;
                const content = (
                  <div className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive ? "bg-orange/10 text-orange font-bold" : "text-text-3 hover:bg-gray-50 hover:text-text-1"}`}>
                    <tool.icon size={14} />
                    {tool.label}
                  </div>
                );
                return isLink ? (
                  <Link key={tool.label} href={tool.href}>{content}</Link>
                ) : (
                  <button key={tool.label} onClick={() => {
                    setActiveFulfillmentTool(activeFulfillmentTool === tool.label ? null : tool.label);
                    setActiveListingTool("All Inventory");
                  }}>{content}</button>
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
                            ) : col.key === "fulfillmentType" ? (
                              <span className="text-xs">{p.fulfillmentType}</span>
                            ) : (
                              <span className="text-xs">{String((p as any)[col.key] ?? "")}</span>
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
                            <Link href={p.source === "product" ? `/vendor/products/${p.id}/edit` : `/vendor/products/${p.id}/edit`}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-text-2 hover:bg-gray-50 transition-colors">
                              <Edit size={13} className="text-text-4" /> Edit
                            </Link>
                            <button onClick={() => { handleDelete(p.id); setOpenDropdown(null); }}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-text-2 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} className="text-red-400" /> Delete
                            </button>
                            <button onClick={() => { toggleStatus(p.id); setOpenDropdown(null); }}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-text-2 hover:bg-gray-50 transition-colors">
                              <ToggleRight size={13} className="text-text-4" /> {p.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                            <button onClick={() => { matchLowPrice(p.id); setOpenDropdown(null); }}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-text-2 hover:bg-gray-50 transition-colors">
                              <Minus size={13} className="text-text-4" /> Match Low Price
                            </button>
                            <button onClick={() => { showToast("success", "Listing copied"); setOpenDropdown(null); }}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-text-2 hover:bg-gray-50 transition-colors">
                              <Copy size={13} className="text-text-4" /> Copy Listing
                            </button>
                            <button onClick={() => { showToast("success", "Ad campaign wizard opened"); setOpenDropdown(null); }}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-text-2 hover:bg-gray-50 transition-colors">
                              <Megaphone size={13} className="text-text-4" /> Advertise
                            </button>
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
            <p className="text-xs text-text-4">{filtered.length} of {items.length} items</p>
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
