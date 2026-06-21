"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X, ArrowRight, Table, List, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface ValidationRow {
  row: number;
  name: string;
  errors: string[];
  valid: boolean;
}

interface ImportLog {
  id: number;
  filename: string;
  date: string;
  total: number;
  success: number;
  failed: number;
  status: "completed" | "partial" | "failed";
}

const demoLogs: ImportLog[] = [
  { id: 1, filename: "products_2024_06.csv", date: "2024-06-15 14:30", total: 25, success: 22, failed: 3, status: "partial" },
  { id: 2, filename: "inventory_update.csv", date: "2024-06-10 09:15", total: 50, success: 50, failed: 0, status: "completed" },
  { id: 3, filename: "new_products_may.csv", date: "2024-05-28 16:45", total: 10, success: 0, failed: 10, status: "failed" },
];

const templateColumns = [
  { field: "name", required: true, description: "Product name" },
  { field: "sku", required: true, description: "Unique SKU" },
  { field: "regular_price", required: true, description: "Price in NGN" },
  { field: "sale_price", required: false, description: "Sale price (optional)" },
  { field: "stock_quantity", required: true, description: "Stock count" },
  { field: "description", required: false, description: "Full product description" },
  { field: "category_id", required: false, description: "Category ID from catalog" },
  { field: "brand_id", required: false, description: "Brand ID from catalog" },
  { field: "weight", required: false, description: "Weight in kg" },
];

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<"upload" | "map" | "preview" | "complete">("upload");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validationResults, setValidationResults] = useState<ValidationRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) {
      setFile(f);
      setStep("map");
      setMapping({
        name: "name", sku: "sku", regular_price: "regular_price",
        sale_price: "sale_price", stock_quantity: "stock_quantity",
        description: "description", category_id: "category_id",
        brand_id: "brand_id", weight: "weight",
      });
    } else {
      showToast("error", "Please upload a CSV or XLSX file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setStep("map");
      setMapping({
        name: "name", sku: "sku", regular_price: "regular_price",
        sale_price: "sale_price", stock_quantity: "stock_quantity",
        description: "description", category_id: "category_id",
        brand_id: "brand_id", weight: "weight",
      });
    }
  };

  const handleValidate = () => {
    const mockResults: ValidationRow[] = [
      { row: 1, name: "Marine GPS Navigator", errors: [], valid: true },
      { row: 2, name: "Yacht Anchor Chain", errors: ["SKU already exists"], valid: false },
      { row: 3, name: "", errors: ["Product name is required"], valid: false },
      { row: 4, name: "LED Navigation Light", errors: [], valid: true },
      { row: 5, name: "Boat Cover", errors: ["Regular price must be > 0", "Stock quantity is required"], valid: false },
    ];
    setValidationResults(mockResults);
    setStep("preview");
  };

  const handleImport = async () => {
    setImporting(true);
    await new Promise(r => setTimeout(r, 2000));
    setImporting(false);
    setStep("complete");
    showToast("success", "Import completed! 3 of 5 products imported.");
  };

  const totalRows = validationResults.length;
  const validRows = validationResults.filter(r => r.valid).length;
  const errorRows = totalRows - validRows;

  return (
    <VendorShell title="Bulk Upload" subtitle="Upload multiple products at once using CSV">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs">
          {["Upload CSV", "Column Mapping", "Validation", "Complete"].map((s, i) => {
            const stepMap = ["upload", "map", "preview", "complete"];
            const currentIdx = stepMap.indexOf(step);
            const isActive = i <= currentIdx;
            return (
              <div key={s} className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-full font-bold ${isActive ? "bg-orange text-white" : "bg-gray-100 text-text-4"}`}>{i + 1}</span>
                <span className={isActive ? "font-semibold text-text-1" : "text-text-4"}>{s}</span>
                {i < 3 && <ChevronDown size={12} className="text-text-4 -rotate-90" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <>
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-bold text-lg text-text-1 mb-1">Upload Product CSV</h2>
              <p className="text-sm text-text-4 mb-4">Upload a CSV file with your product data. Column headers must match the template.</p>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                  dragOver ? "border-orange bg-orange-50" : "border-border hover:border-orange/50"
                }`}
                onClick={() => fileInputRef.current?.click()}>
                <Upload size={36} className="mx-auto mb-3 text-text-4" />
                <p className="font-bold text-text-1 mb-1">Drop your CSV file here</p>
                <p className="text-xs text-text-4">or click to browse · Supports .csv and .xlsx</p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileSelect} />
              </div>
            </div>

            {/* Download template */}
            <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
              <FileSpreadsheet size={20} className="text-green-600" />
              <div className="flex-1">
                <p className="text-xs font-bold text-text-1">Download Template</p>
                <p className="text-[10px] text-text-4">Use our CSV template with the correct column headers.</p>
              </div>
              <button onClick={() => showToast("success", "Template downloaded")}
                className="flex items-center gap-2 px-4 h-9 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors">
                <Download size={13} /> CSV Template
              </button>
            </div>
          </>
        )}

        {/* Step 2: Column Mapping */}
        {step === "map" && (
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-bold text-base text-text-1 mb-1">Column Mapping</h3>
            <p className="text-sm text-text-4 mb-4">Map your CSV columns to product fields. Required fields are marked.</p>
            <div className="space-y-3">
              {templateColumns.map(col => (
                <div key={col.field} className="flex items-center gap-3">
                  <div className="w-36 shrink-0">
                    <span className="text-xs font-semibold text-text-1">{col.field}</span>
                    {col.required && <span className="text-[8px] text-red-500 ml-1">*</span>}
                  </div>
                  <ArrowRight size={12} className="text-text-4 shrink-0" />
                  <select value={mapping[col.field] || ""} onChange={e => setMapping(prev => ({ ...prev, [col.field]: e.target.value }))}
                    className="flex-1 h-9 px-3 text-xs border border-border rounded-lg bg-white">
                    <option value="">-- Skip --</option>
                    {templateColumns.map(tc => <option key={tc.field} value={tc.field}>{tc.field} - {tc.description}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex gap-3">
              <button onClick={() => setStep("upload")} className="px-5 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50">Back</button>
              <button onClick={handleValidate} className="px-5 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90">Validate & Preview</button>
            </div>
          </div>
        )}

        {/* Step 3: Validation Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-text-1">Validation Results</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600" /> {validRows} Valid</span>
                  <span className="flex items-center gap-1"><AlertCircle size={12} className="text-red-500" /> {errorRows} Errors</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-xs text-text-4 font-medium">Row</th>
                      <th className="text-left p-3 text-xs text-text-4 font-medium">Product</th>
                      <th className="text-left p-3 text-xs text-text-4 font-medium">Status</th>
                      <th className="text-left p-3 text-xs text-text-4 font-medium">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.map(r => (
                      <tr key={r.row} className="border-b border-border/50 hover:bg-gray-50">
                        <td className="p-3 text-xs text-text-4">{r.row}</td>
                        <td className="p-3 text-xs font-semibold text-text-1">{r.name || "—"}</td>
                        <td className="p-3">
                          {r.valid ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Valid</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Error</span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-red-500">{r.errors.join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <button onClick={() => setStep("map")} className="px-5 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50">Back</button>
                <button onClick={handleImport} disabled={importing} className="px-5 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {importing ? "Importing..." : `Import ${validRows} Products`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === "complete" && (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="font-bold text-xl text-text-1 mb-2">Import Complete!</h2>
            <p className="text-sm text-text-4 mb-6">3 products imported successfully. 2 had errors.</p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xl font-bold text-green-700">{validRows}</p>
                <p className="text-[10px] text-text-4">Imported</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xl font-bold text-red-600">{errorRows}</p>
                <p className="text-[10px] text-text-4">Failed</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-text-1">{totalRows}</p>
                <p className="text-[10px] text-text-4">Total</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link href="/vendor/products" className="px-5 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 flex items-center gap-2">
                View Products
              </Link>
              <button onClick={() => { setStep("upload"); setFile(null); setValidationResults([]); }} className="px-5 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50">
                Upload Another
              </button>
            </div>
          </div>
        )}

        {/* Import History */}
        <div className="bg-white rounded-xl border border-border p-5">
          <button onClick={() => setShowLogs(!showLogs)} className="flex items-center justify-between w-full">
            <h3 className="font-bold text-sm text-text-1">Import History</h3>
            {showLogs ? <ChevronUp size={14} className="text-text-4" /> : <ChevronDown size={14} className="text-text-4" />}
          </button>
          {showLogs && (
            <div className="mt-4 space-y-2">
              {demoLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      log.status === "completed" ? "bg-green-100" : log.status === "partial" ? "bg-amber-100" : "bg-red-100"
                    }`}>
                      <FileSpreadsheet size={15} className={
                        log.status === "completed" ? "text-green-700" : log.status === "partial" ? "text-amber-700" : "text-red-600"
                      } />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-1">{log.filename}</p>
                      <p className="text-[10px] text-text-4">{log.date} · {log.success}/{log.total} products</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    log.status === "completed" ? "bg-green-100 text-green-700" :
                    log.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                  }`}>{log.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VendorShell>
  );
}
