"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin/admin-shell";
import {
  FileText, Search, Plus, Eye, Trash2, Send, CheckCircle2,
  DollarSign, TrendingUp, Download, X, Save, Package,
} from "lucide-react";
import { insforge } from "@/lib/insforge";

interface QuoteItem {
  name: string;
  qty: number;
  unit_price: number;
  type: "product" | "service";
}

interface Quote {
  id: string;
  quote_id: string;
  customer: string;
  contact: string;
  email: string;
  items: string;
  total: number;
  status: string;
  date: string;
  valid_until: string;
  notes: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku: string;
  regular_price: number;
  type: "product" | "service";
}

const seedQuotes: Omit<Quote, "id">[] = [
  { quote_id: "QT-001", customer: "Lagos State Government", contact: "Mr. Adeyemi", email: "procurement@lasg.gov.ng", items: "50x Hikvision 8CH DVR Kit, 200x Outdoor Cameras", total: 15000000, status: "sent", date: "2024-03-10", valid_until: "2024-04-10", notes: "Bulk security installation for government offices" },
  { quote_id: "QT-002", customer: "Shell Nigeria", contact: "Engr. Nwosu", email: "procurement@shell.ng", items: "Marine GPS Systems, 10x Life Rafts, Safety Equipment", total: 8500000, status: "accepted", date: "2024-03-08", valid_until: "2024-04-08", notes: "Marine safety compliance upgrade" },
  { quote_id: "QT-003", customer: "Transcorp Hotels", contact: "Mrs. Okafor", email: "facilities@transcorp.com", items: "Kitchen Hood Systems, Fire Suppression, Alarm Systems", total: 6200000, status: "draft", date: "2024-03-12", valid_until: "2024-04-12", notes: "Hotel kitchen renovation project" },
  { quote_id: "QT-004", customer: "Port Harcourt Boat Club", contact: "Chief Amadi", email: "admin@phboatclub.com", items: "2x Yamaha 200HP, Boat Building Consultation", total: 25000000, status: "negotiating", date: "2024-03-05", valid_until: "2024-04-05", notes: "New patrol boat construction" },
  { quote_id: "QT-005", customer: "Dangote Group", contact: "Alhaji Ibrahim", email: "security@dangote.com", items: "Access Control 500-door, CCTV 200-camera system", total: 45000000, status: "sent", date: "2024-03-11", valid_until: "2024-04-11", notes: "Factory security overhaul" },
];

const serviceOptions: ProductOption[] = [
  { id: "svc-1", name: "CCTV Installation (per camera)", sku: "SVC-CCTV", regular_price: 25000, type: "service" },
  { id: "svc-2", name: "Fire Alarm Installation", sku: "SVC-FIRE", regular_price: 150000, type: "service" },
  { id: "svc-3", name: "Kitchen Installation", sku: "SVC-KITCHEN", regular_price: 500000, type: "service" },
  { id: "svc-4", name: "Boat Building Consultation", sku: "SVC-BOAT", regular_price: 200000, type: "service" },
  { id: "svc-5", name: "Dredging Service (per day)", sku: "SVC-DREDGE", regular_price: 2500000, type: "service" },
  { id: "svc-6", name: "Maintenance Contract (monthly)", sku: "SVC-MAINT", regular_price: 100000, type: "service" },
  { id: "svc-7", name: "Access Control Setup (per door)", sku: "SVC-ACCESS", regular_price: 35000, type: "service" },
  { id: "svc-8", name: "Network Installation", sku: "SVC-NET", regular_price: 300000, type: "service" },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", sent: "bg-blue/10 text-blue", negotiating: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", expired: "bg-gray-100 text-gray-400",
};

export default function AdminQuotesPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewQuote, setViewQuote] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quote form
  const [formCustomer, setFormCustomer] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formValidUntil, setFormValidUntil] = useState("");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  // Product search
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => { loadQuotes(); loadProducts(); }, []);

  const loadProducts = async () => {
    try {
      const { data } = await insforge.database.from("products").select("id,name,sku,regular_price").order("name", { ascending: true });
      if (data) {
        setProductOptions([
          ...data.map((p: { id: string; name: string; sku: string; regular_price: number }) => ({ ...p, type: "product" as const })),
          ...serviceOptions,
        ]);
      } else {
        setProductOptions(serviceOptions);
      }
    } catch {
      setProductOptions(serviceOptions);
    }
  };

  const loadQuotes = async () => {
    try {
      const { data, error } = await insforge.database.from("quotes").select("*").order("date", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) setQuotes(data);
      else {
        for (const q of seedQuotes) await insforge.database.from("quotes").insert(q);
        const { data: seeded } = await insforge.database.from("quotes").select("*");
        if (seeded) setQuotes(seeded);
      }
    } catch {
      setQuotes(seedQuotes.map((q, i) => ({ ...q, id: String(i + 1) })));
    } finally { setLoading(false); }
  };

  const filteredOptions = itemSearch.length >= 1
    ? productOptions.filter(p => p.name.toLowerCase().includes(itemSearch.toLowerCase()) || p.sku.toLowerCase().includes(itemSearch.toLowerCase()))
    : [];

  const addItemToQuote = (option: ProductOption) => {
    const existing = quoteItems.find(i => i.name === option.name);
    if (existing) {
      setQuoteItems(quoteItems.map(i => i.name === option.name ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setQuoteItems([...quoteItems, { name: option.name, qty: 1, unit_price: option.regular_price, type: option.type }]);
    }
    setItemSearch("");
    setShowDropdown(false);
  };

  const quoteTotal = quoteItems.reduce((sum, i) => sum + i.qty * i.unit_price, 0);

  const createQuote = async () => {
    if (!formCustomer || quoteItems.length === 0) { alert("Customer and at least 1 item required."); return; }
    setSaving(true);
    try {
      const quote_id = `QT-${String(quotes.length + 1).padStart(3, "0")}`;
      const date = new Date().toISOString().split("T")[0];
      const items = quoteItems.map(i => `${i.qty}x ${i.name}`).join(", ");
      const { data } = await insforge.database.from("quotes").insert({
        quote_id, date, status: "draft", customer: formCustomer, contact: formContact,
        email: formEmail, notes: formNotes, valid_until: formValidUntil, items, total: quoteTotal,
      }).select();
      if (data) setQuotes(prev => [data[0], ...prev]);
      setShowCreateModal(false);
      setFormCustomer(""); setFormContact(""); setFormEmail(""); setFormNotes(""); setFormValidUntil(""); setQuoteItems([]);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await insforge.database.from("quotes").update({ status }).eq("id", id);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    } catch (err) { console.error(err); }
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Delete this quote?")) return;
    try {
      await insforge.database.from("quotes").delete().eq("id", id);
      setQuotes(prev => prev.filter(q => q.id !== id));
    } catch (err) { console.error(err); }
  };

  const printQuote = (quote: Quote) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Quote ${quote.quote_id}</title><style>body{font-family:Arial;padding:40px;color:#333}h1{font-size:24px;margin-bottom:5px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}th{font-weight:600;color:#666}.total{font-size:20px;font-weight:bold;text-align:right}</style></head><body>`);
    w.document.write(`<h1>KAUVEX</h1><p>Quote: ${quote.quote_id}</p><hr/>`);
    w.document.write(`<p><strong>Customer:</strong> ${quote.customer}<br/><strong>Contact:</strong> ${quote.contact}<br/><strong>Email:</strong> ${quote.email}</p>`);
    w.document.write(`<p><strong>Date:</strong> ${quote.date} | <strong>Valid Until:</strong> ${quote.valid_until}</p>`);
    w.document.write(`<p><strong>Items:</strong> ${quote.items}</p>`);
    w.document.write(`<p><strong>Notes:</strong> ${quote.notes}</p>`);
    w.document.write(`<p class="total">Total: &#8358;${quote.total.toLocaleString()}</p>`);
    w.document.write(`</body></html>`);
    w.document.close();
    w.print();
  };

  const filteredQuotes = quotes.filter(q => {
    if (filter !== "all" && q.status !== filter) return false;
    if (search && !q.customer.toLowerCase().includes(search.toLowerCase()) && !q.quote_id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPipeline = quotes.filter(q => ["sent", "negotiating"].includes(q.status)).reduce((a, q) => a + q.total, 0);
  const totalWon = quotes.filter(q => q.status === "accepted").reduce((a, q) => a + q.total, 0);

  return (
    <AdminShell title="Quotes & Proposals" subtitle="Manage B2B quotes and proposals">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Quotes", value: quotes.length, icon: FileText, color: "text-blue" },
            { label: "Pipeline Value", value: `₦${(totalPipeline / 1e6).toFixed(0)}M`, icon: TrendingUp, color: "text-yellow-600" },
            { label: "Won Value", value: `₦${(totalWon / 1e6).toFixed(0)}M`, icon: DollarSign, color: "text-green-600" },
            { label: "Win Rate", value: quotes.length ? `${Math.round((quotes.filter(q => q.status === "accepted").length / quotes.length) * 100)}%` : "0%", icon: CheckCircle2, color: "text-green-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-text-4">{s.label}</span></div>
              <p className="text-xl font-bold text-text-1">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input type="text" placeholder="Search quotes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
          </div>
          {["all", "draft", "sent", "negotiating", "accepted", "expired"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-xs rounded-lg border capitalize ${filter === f ? "bg-blue text-white border-blue" : "bg-white border-gray-200 text-text-3"}`}>{f}</button>
          ))}
          <button onClick={() => setShowCreateModal(true)} className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg text-sm hover:bg-blue-600"><Plus size={16} /> New Quote</button>
        </div>

        {loading ? (
          <div className="text-center p-12 text-text-4 text-sm">Loading quotes...</div>
        ) : (
          <div className="space-y-3">
            {filteredQuotes.map(quote => (
              <div key={quote.id} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-text-4">{quote.quote_id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[quote.status] || "bg-gray-100 text-gray-600"}`}>{quote.status}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-text-1">{quote.customer}</h4>
                    <p className="text-xs text-text-4">{quote.contact} · {quote.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-text-1">₦{quote.total.toLocaleString()}</p>
                    <p className="text-[10px] text-text-4">Valid until {quote.valid_until}</p>
                  </div>
                </div>
                <p className="text-sm text-text-3 mb-2">{quote.items}</p>
                {quote.notes && <p className="text-xs text-text-4 italic mb-3">{quote.notes}</p>}

                {viewQuote === quote.id && (
                  <div className="mb-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <h5 className="text-xs font-semibold text-text-1 uppercase">Quote Details</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-text-4">Customer:</span> <span className="font-medium">{quote.customer}</span></div>
                      <div><span className="text-text-4">Contact:</span> <span className="font-medium">{quote.contact}</span></div>
                      <div><span className="text-text-4">Email:</span> <span className="font-medium">{quote.email}</span></div>
                      <div><span className="text-text-4">Created:</span> <span className="font-medium">{quote.date}</span></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-4">Created {quote.date}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewQuote(viewQuote === quote.id ? null : quote.id)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Eye size={14} className="text-text-4" /></button>
                    {quote.status === "draft" && <button onClick={() => updateStatus(quote.id, "sent")} className="p-1.5 hover:bg-blue-50 rounded-lg"><Send size={14} className="text-blue" /></button>}
                    {quote.status === "sent" && <button onClick={() => updateStatus(quote.id, "accepted")} className="p-1.5 hover:bg-green-50 rounded-lg"><CheckCircle2 size={14} className="text-green-600" /></button>}
                    <button onClick={() => printQuote(quote)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Download size={14} className="text-text-4" /></button>
                    <button onClick={() => deleteQuote(quote.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Quote Modal with Product Search */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-[650px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-lg">New Quote</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-gray-50 text-text-4"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Customer *</label><input value={formCustomer} onChange={e => setFormCustomer(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" placeholder="Company name" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Contact Person</label><input value={formContact} onChange={e => setFormContact(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Email</label><input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" /></div>
                <div><label className="text-xs font-semibold text-text-2 mb-1 block">Valid Until</label><input type="date" value={formValidUntil} onChange={e => setFormValidUntil(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue" /></div>
              </div>

              {/* Product/Service Search */}
              <div>
                <label className="text-xs font-semibold text-text-2 mb-1 block">Add Products / Services *</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
                  <input
                    value={itemSearch}
                    onChange={e => { setItemSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search products or services..."
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
                  />
                  {showDropdown && filteredOptions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredOptions.slice(0, 10).map(opt => (
                        <button key={opt.id} onClick={() => addItemToQuote(opt)} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <Package size={14} className={opt.type === "service" ? "text-purple-500" : "text-blue"} />
                            <div>
                              <p className="text-sm font-medium text-text-1">{opt.name}</p>
                              <p className="text-[10px] text-text-4">{opt.sku} · {opt.type === "service" ? "Service" : "Product"}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-text-1">₦{opt.regular_price.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quote Items Table */}
              {quoteItems.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2.5 text-xs text-text-4 font-medium">Item</th>
                        <th className="text-center p-2.5 text-xs text-text-4 font-medium w-20">Qty</th>
                        <th className="text-right p-2.5 text-xs text-text-4 font-medium">Unit Price</th>
                        <th className="text-right p-2.5 text-xs text-text-4 font-medium">Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((item, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="p-2.5">
                            <span className="text-sm">{item.name}</span>
                            <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${item.type === "service" ? "bg-purple-50 text-purple-600" : "bg-blue/10 text-blue"}`}>{item.type}</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <input type="number" min={1} value={item.qty} onChange={e => { const items = [...quoteItems]; items[i].qty = Math.max(1, +e.target.value); setQuoteItems(items); }} className="w-16 h-7 px-2 text-center text-sm border border-gray-200 rounded mx-auto" />
                          </td>
                          <td className="p-2.5 text-right">
                            <input type="number" value={item.unit_price} onChange={e => { const items = [...quoteItems]; items[i].unit_price = +e.target.value; setQuoteItems(items); }} className="w-28 h-7 px-2 text-right text-sm border border-gray-200 rounded" />
                          </td>
                          <td className="p-2.5 text-right font-semibold">₦{(item.qty * item.unit_price).toLocaleString()}</td>
                          <td className="p-2.5"><button onClick={() => setQuoteItems(quoteItems.filter((_, idx) => idx !== i))} className="text-red hover:text-red/70"><Trash2 size={13} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td colSpan={3} className="p-2.5 text-right font-bold text-sm">Total</td>
                        <td className="p-2.5 text-right font-bold text-lg text-blue">₦{quoteTotal.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div><label className="text-xs font-semibold text-text-2 mb-1 block">Notes</label><textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={2} className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none" /></div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 h-10 rounded-lg border border-gray-200 text-sm text-text-3 hover:bg-gray-50">Cancel</button>
              <button onClick={createQuote} disabled={saving || !formCustomer || quoteItems.length === 0} className="flex-1 h-10 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-40 flex items-center justify-center gap-1.5">
                <Save size={14} /> {saving ? "Creating..." : "Create Quote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
