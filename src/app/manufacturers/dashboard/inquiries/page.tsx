"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare, Search, Filter, ChevronDown, ChevronRight,
  Eye, FileText, CheckCircle2, XCircle, Clock, Loader2,
  ArrowLeft, Package, Globe, Hash, Calendar, ExternalLink
} from "lucide-react";

interface Inquiry {
  id: string;
  buyerName: string;
  buyerCountry: string;
  productDescription: string;
  desiredQuantity: number;
  targetPrice: string;
  destinationCountry: string;
  status: string;
  createdAt: string;
  referenceImages: string[];
  customizationDetails: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-green-700", bg: "bg-green-100" },
  quoted: { label: "Quoted", color: "text-blue-700", bg: "bg-blue-100" },
  closed: { label: "Closed", color: "text-gray-600", bg: "bg-gray-100" },
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const res = await fetch("/api/v1/manufacturers/inquiries");
        const json = await res.json();
        if (json.data) {
          setInquiries(json.data);
        }
      } catch {
        setInquiries([
          {
            id: "inq-001",
            buyerName: "GlobalTextile Co.",
            buyerCountry: "US",
            productDescription: "Cotton t-shirts, 200gsm, custom print",
            desiredQuantity: 5000,
            targetPrice: "$3.20",
            destinationCountry: "US",
            status: "open",
            createdAt: "2026-06-28",
            referenceImages: [],
            customizationDetails: "Private label, custom neck label, poly bag packing",
          },
          {
            id: "inq-002",
            buyerName: "EuroParts GmbH",
            buyerCountry: "DE",
            productDescription: "CNC machined aluminum brackets, 6061-T6",
            desiredQuantity: 2000,
            targetPrice: "$8.50",
            destinationCountry: "DE",
            status: "quoted",
            createdAt: "2026-06-27",
            referenceImages: [],
            customizationDetails: "Anodized black, M5 tapped holes",
          },
          {
            id: "inq-003",
            buyerName: "Lagos Retail Ltd",
            buyerCountry: "NG",
            productDescription: "Plastic storage containers, 20L with lid",
            desiredQuantity: 10000,
            targetPrice: "$1.80",
            destinationCountry: "NG",
            status: "open",
            createdAt: "2026-06-26",
            referenceImages: [],
            customizationDetails: "Custom color (blue), embossed logo",
          },
          {
            id: "inq-004",
            buyerName: "Shenzhen Imports",
            buyerCountry: "CN",
            productDescription: "USB-C charging cables, 1.5m, braided",
            desiredQuantity: 50000,
            targetPrice: "$0.65",
            destinationCountry: "US",
            status: "closed",
            createdAt: "2026-06-20",
            referenceImages: [],
            customizationDetails: "MFi certified, custom packaging",
          },
          {
            id: "inq-005",
            buyerName: "Dubai Trading FZE",
            buyerCountry: "AE",
            productDescription: "Stainless steel water bottles, 500ml",
            desiredQuantity: 8000,
            targetPrice: "$2.40",
            destinationCountry: "AE",
            status: "open",
            createdAt: "2026-06-25",
            referenceImages: [],
            customizationDetails: "Double wall vacuum, custom print, gift box",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const filtered = inquiries.filter((inq) => {
    const matchesSearch =
      searchQuery === "" ||
      inq.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.productDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: inquiries.length,
    open: inquiries.filter((i) => i.status === "open").length,
    quoted: inquiries.filter((i) => i.status === "quoted").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-kauvex-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manufacturers/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={16} className="text-gray-500" />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-[#0A1628]">Inquiries</h2>
              <p className="text-xs text-gray-500">{counts.all} total inquiries from buyers worldwide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          {(["all", "open", "quoted", "closed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === tab
                  ? "bg-[#0A1628] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-70">{counts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by buyer or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <button className="h-9 px-3 flex items-center gap-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
              <Filter size={12} /> Filter
            </button>
          </div>
        </div>

        {/* Inquiry Detail Panel */}
        {selectedInquiry && (
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0A1628]">Inquiry Detail</h3>
              <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={16} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide">Buyer</label>
                  <p className="text-sm font-semibold text-[#0A1628]">{selectedInquiry.buyerName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Globe size={10} /> {selectedInquiry.buyerCountry}</p>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide">Product</label>
                  <p className="text-sm font-semibold text-[#0A1628]">{selectedInquiry.productDescription}</p>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide">Customization</label>
                  <p className="text-xs text-gray-600">{selectedInquiry.customizationDetails || "None specified"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide">Quantity</label>
                    <p className="text-sm font-semibold text-[#0A1628]">{selectedInquiry.desiredQuantity?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide">Target Price</label>
                    <p className="text-sm font-semibold text-[#0A1628]">{selectedInquiry.targetPrice}/unit</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide">Destination</label>
                    <p className="text-sm font-semibold text-[#0A1628]">{selectedInquiry.destinationCountry}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide">Status</label>
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${statusConfig[selectedInquiry.status]?.bg} ${statusConfig[selectedInquiry.status]?.color}`}>
                      {statusConfig[selectedInquiry.status]?.label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide">Received</label>
                  <p className="text-xs text-gray-600 flex items-center gap-1"><Calendar size={10} /> {new Date(selectedInquiry.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link
                href={`/manufacturers/dashboard/quotes?inquiry=${selectedInquiry.id}`}
                className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-semibold rounded-lg hover:bg-[#e55f00] transition-colors flex items-center gap-1.5"
              >
                <FileText size={12} /> Create Quote
              </Link>
              <button className="px-4 py-2 border border-gray-200 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                Message Buyer
              </button>
            </div>
          </div>
        )}

        {/* Inquiries Table */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessageSquare size={40} className="text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">No inquiries found</p>
              <p className="text-xs text-gray-400 mt-1">Inquiries from buyers will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Quantity</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Target Price</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inq) => {
                    const status = statusConfig[inq.status] || statusConfig.open;
                    return (
                      <tr key={inq.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-[#0A1628]">{inq.buyerName}</p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1"><Globe size={9} /> {inq.buyerCountry}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#0A1628] max-w-[200px] truncate">{inq.productDescription}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{inq.desiredQuantity?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-medium text-[#0A1628]">{inq.targetPrice}/unit</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(inq.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedInquiry(inq)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View detail"
                            >
                              <Eye size={13} className="text-gray-500" />
                            </button>
                            {inq.status === "open" && (
                              <Link
                                href={`/manufacturers/dashboard/quotes?inquiry=${inq.id}`}
                                className="p-1.5 hover:bg-[#FF6B00]/10 rounded-lg transition-colors"
                                title="Create quote"
                              >
                                <FileText size={13} className="text-[#FF6B00]" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
