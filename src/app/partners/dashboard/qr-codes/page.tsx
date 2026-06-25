"use client";

import { useState } from "react";
import {
  QrCode, Download, Image, FileCode, Clock, MousePointerClick,
  Search, Copy, Check, Trash2, Plus,
} from "lucide-react";

const sizeOptions = [
  { value: "small", label: "Small", px: 150 },
  { value: "medium", label: "Medium", px: 250 },
  { value: "large", label: "Large", px: 400 },
] as const;

const recentQRCodes = [
  {
    id: 1,
    name: "Summer Campaign 2026",
    url: "https://kauvex.com/go/KAV-A3F8D2",
    scans: 847,
    created: "2026-06-20",
    size: "medium",
  },
  {
    id: 2,
    name: "Marine Equipment Promo",
    url: "https://kauvex.com/go/KAV-B7E1C9",
    scans: 312,
    created: "2026-06-18",
    size: "large",
  },
  {
    id: 3,
    name: "Fitness Flash Sale",
    url: "https://kauvex.com/go/KAV-C4F9A1",
    scans: 1256,
    created: "2026-06-15",
    size: "medium",
  },
  {
    id: 4,
    name: "Storefront QR - Instagram",
    url: "https://kauvex.com/partners/KAV-D2E5B3",
    scans: 2891,
    created: "2026-06-10",
    size: "small",
  },
  {
    id: 5,
    name: "Business Card Link",
    url: "https://kauvex.com/ref/KAV-E8A4F7",
    scans: 534,
    created: "2026-06-05",
    size: "medium",
  },
];

function MockQRCode({ size, foreground }: { size: number; foreground: string }) {
  const matrix = [
    [1,1,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,1,0,1,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1],
    [1,0,1,1,1,0,1,0,1,1,1],
    [1,1,1,1,1,0,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,0,0,0,1,1,1],
    [1,0,0,0,1,1,1,0,0,0,1],
    [1,0,1,1,1,1,0,0,1,1,1],
    [1,0,0,0,1,1,1,0,0,0,1],
    [1,1,1,1,1,0,1,0,0,0,1],
  ];
  const cellSize = size / matrix.length;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" rx={8} />
      {matrix.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + 2}
              y={y * cellSize + 2}
              width={cellSize - 2}
              height={cellSize - 2}
              fill={foreground}
              rx={1}
            />
          ) : null
        )
      )}
      <circle cx={size / 2} cy={size / 2} r={cellSize * 1.2} fill="white" />
      <circle cx={size / 2} cy={size / 2} r={cellSize * 0.6} fill={foreground} />
    </svg>
  );
}

export default function QRCodesPage() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [foreground, setForeground] = useState("#0A1628");
  const [generated, setGenerated] = useState(false);
  const [codes, setCodes] = useState(recentQRCodes);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currentSize = sizeOptions.find((s) => s.value === size)!;
  const totalScans = codes.reduce((sum, c) => sum + c.scans, 0);

  const generateQR = () => {
    if (!url.trim()) return;
    setGenerated(true);
  };

  const downloadPNG = () => {
    // Mock download
  };

  const downloadSVG = () => {
    // Mock download
  };

  const deleteCode = (id: number) => {
    setCodes(codes.filter((c) => c.id !== id));
  };

  const copyToClipboard = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCodes = codes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#0A1628]">QR Code Generator</h1>
        <p className="text-xs text-gray-500">Create and manage QR codes for your affiliate links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
              <QrCode size={13} />
            </div>
            <span className="text-[10px] text-gray-500">QR Codes</span>
          </div>
          <p className="font-bold text-sm text-[#0A1628] ml-9">{codes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MousePointerClick size={13} />
            </div>
            <span className="text-[10px] text-gray-500">Total Scans</span>
          </div>
          <p className="font-bold text-sm text-[#0A1628] ml-9">{totalScans.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock size={13} />
            </div>
            <span className="text-[10px] text-gray-500">This Month</span>
          </div>
          <p className="font-bold text-sm text-[#0A1628] ml-9">+{codes.filter((c) => c.created.startsWith("2026-06")).length} new</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Generator */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-sm text-[#0A1628] mb-4 flex items-center gap-2">
            <Plus size={14} className="text-[#FF6B00]" /> Generate QR Code
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">URL or Tracking Link</label>
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setGenerated(false); }}
                placeholder="https://kauvex.com/go/KAV-..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">QR Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Instagram Story"
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Size</label>
              <div className="flex gap-1">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSize(opt.value)}
                    className={`flex-1 h-9 rounded-lg text-[10px] font-semibold transition-all ${
                      size === opt.value
                        ? "bg-[#FF6B00] text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Foreground Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
                <span className="text-[10px] font-mono text-gray-500">{foreground}</span>
                {["#0A1628", "#FF6B00", "#000000", "#2563EB", "#059669"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setForeground(c)}
                    className="w-5 h-5 rounded-full border-2 border-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={generateQR}
            disabled={!url.trim()}
            className="mt-4 h-9 px-6 bg-[#FF6B00] text-white font-bold text-[10px] rounded-lg hover:bg-[#FF6B00]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <QrCode size={12} /> Generate QR Code
          </button>
        </div>

        {/* QR Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          {generated ? (
            <>
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-3">
                <MockQRCode size={currentSize.px} foreground={foreground} />
              </div>
              <p className="text-[10px] font-medium text-gray-700 mb-1">{name || "Untitled QR Code"}</p>
              <p className="text-[9px] text-gray-400 mb-3 truncate max-w-[200px]">{url}</p>
              <div className="flex gap-2">
                <button
                  onClick={downloadPNG}
                  className="h-8 px-4 flex items-center gap-1.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-[10px] hover:bg-gray-50 transition-colors"
                >
                  <Image size={11} /> PNG
                </button>
                <button
                  onClick={downloadSVG}
                  className="h-8 px-4 flex items-center gap-1.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-[10px] hover:bg-gray-50 transition-colors"
                >
                  <FileCode size={11} /> SVG
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                <QrCode size={28} className="text-gray-300" />
              </div>
              <p className="text-[10px] text-gray-400">Enter a URL and click Generate</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent QR Codes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-[#0A1628] flex items-center gap-2">
            <Clock size={14} className="text-[#FF6B00]" /> Recent QR Codes
          </h2>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search QR codes..."
              className="h-8 w-48 pl-7 pr-3 rounded-lg border border-gray-200 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Scans</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="text-right py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map((code) => (
                <tr key={code.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center bg-white">
                        <QrCode size={10} className="text-gray-400" />
                      </div>
                      <span className="text-[10px] font-medium text-gray-700">{code.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 truncate max-w-[180px] block">{code.url}</span>
                      <button
                        onClick={() => copyToClipboard(code.id, code.url)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        {copiedId === code.id ? (
                          <Check size={9} className="text-green-600" />
                        ) : (
                          <Copy size={9} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MousePointerClick size={9} className="text-gray-400" />
                      <span className="text-[10px] font-semibold">{code.scans.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="text-[10px] capitalize text-gray-500">{code.size}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className="text-[10px] text-gray-500">{code.created}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => copyToClipboard(code.id, code.url)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                        title="Copy URL"
                      >
                        <Copy size={10} />
                      </button>
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[10px] text-gray-400">No QR codes found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
