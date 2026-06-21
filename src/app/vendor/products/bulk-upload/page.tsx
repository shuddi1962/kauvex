"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import VendorShell from "@/components/vendor/vendor-shell";
import { insforge } from "@/lib/insforge";
import {
  Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X, ArrowRight,
  Loader2, ChevronDown, ChevronUp, Table, FileWarning, Clock
} from "lucide-react";

interface CsvRow {
  [key: string]: string;
}

interface MappingEntry {
  csvColumn: string;
  productField: string;
}

const PRODUCT_FIELDS = [
  { field: "name", required: true, description: "Product name" },
  { field: "sku", required: true, description: "Unique SKU" },
  { field: "regular_price", required: true, description: "Price (numeric)" },
  { field: "sale_price", required: false, description: "Sale price (optional)" },
  { field: "stock_quantity", required: true, description: "Stock count" },
  { field: "description", required: false, description: "Full description" },
  { field: "short_description", required: false, description: "Brief description" },
  { field: "category_id", required: false, description: "Category ID" },
  { field: "brand_id", required: false, description: "Brand ID" },
  { field: "weight", required: false, description: "Weight in kg" },
  { field: "tags", required: false, description: "Comma-separated tags" },
  { field: "status", required: false, description: "draft/active/inactive" },
  { field: "product_type", required: false, description: "simple/variable/grouped" },
];

const REQUIRED_FIELDS = PRODUCT_FIELDS.filter(f => f.required).map(f => f.field);

const TEMPLATE_HEADERS = PRODUCT_FIELDS.map(f => f.field);

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < text.length && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else if (ch === "\r" && !inQuotes) {
      // skip
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length === 0) return { headers: [], rows: [] };

  const splitLine = (line: string): string[] => {
    const parts: string[] = [];
    let field = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (q && i + 1 < line.length && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          q = !q;
        }
      } else if (c === "," && !q) {
        parts.push(field.trim());
        field = "";
      } else {
        field += c;
      }
    }
    parts.push(field.trim());
    return parts;
  };

  const headers = splitLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, ""));
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitLine(line);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || `product-${Date.now().toString(36)}`;
}

function formatDate(d: Date): string {
  return d.toISOString().replace("T", " ").substring(0, 16);
}

interface ValidationError {
  row: number;
  name: string;
  errors: string[];
}

interface ImportRecord {
  id: number;
  filename: string;
  date: string;
  total: number;
  success: number;
  failed: number;
  errors: { row: number; name: string; errors: string[] }[];
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<"upload" | "map" | "preview" | "complete">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [autoMatched, setAutoMatched] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importLogs, setImportLogs] = useState<ImportRecord[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [lastImport, setLastImport] = useState<ImportRecord | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("kauvex_bulk_import_logs");
    if (saved) {
      try { setImportLogs(JSON.parse(saved)); } catch { /* ignore */ }
    }
    insforge.auth.getCurrentUser().then(({ data: { user } }: any) => {
      if (user) setVendorId(user.id);
    });
  }, []);

  const saveLogs = (logs: ImportRecord[]) => {
    setImportLogs(logs);
    sessionStorage.setItem("kauvex_bulk_import_logs", JSON.stringify(logs));
  };

  const autoDetectMapping = useCallback((headers: string[]): Record<string, string> => {
    const m: Record<string, string> = {};
    const fieldAliases: Record<string, string[]> = {
      name: ["name", "product_name", "productname", "title", "product_title", "item_name", "item"],
      sku: ["sku", "sku_code", "product_code", "code", "item_code", "variant_sku"],
      regular_price: ["regular_price", "price", "regularprice", "unit_price", "selling_price", "retail_price", "amount", "cost"],
      sale_price: ["sale_price", "saleprice", "sale", "discount_price", "special_price", "offer_price"],
      stock_quantity: ["stock_quantity", "quantity", "qty", "stock", "inventory", "stock_qty", "available_qty", "count"],
      description: ["description", "long_description", "desc", "details", "full_description", "product_description"],
      short_description: ["short_description", "shortdesc", "summary", "brief", "excerpt"],
      category_id: ["category_id", "category", "cat_id", "categoryid", "category_name"],
      brand_id: ["brand_id", "brand", "brand_name", "manufacturer", "make"],
      weight: ["weight", "wt", "mass", "item_weight"],
      tags: ["tags", "tag", "keywords", "labels"],
      status: ["status", "product_status", "state"],
      product_type: ["product_type", "type", "producttype", "item_type"],
    };
    for (const csvCol of headers) {
      const lower = csvCol.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_|_$/g, "");
      for (const [field, aliases] of Object.entries(fieldAliases)) {
        if (aliases.includes(lower) || aliases.includes(csvCol.toLowerCase())) {
          m[field] = csvCol;
          break;
        }
      }
    }
    return m;
  }, []);

  const processFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCsv(text);
      if (headers.length === 0) {
        showToast("error", "Could not parse CSV. Check the file format.");
        return;
      }
      setCsvHeaders(headers);
      setCsvRows(rows);
      const detected = autoDetectMapping(headers);
      setMapping(detected);
      setAutoMatched(true);
      setStep("map");
    };
    reader.onerror = () => showToast("error", "Failed to read file");
    reader.readAsText(f);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".csv")) {
      processFile(f);
    } else {
      showToast("error", "Please upload a .csv file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const downloadTemplate = () => {
    const bom = "\uFEFF";
    const headerRow = TEMPLATE_HEADERS.join(",");
    const comment = "# Kauvex Product Import Template — Required: name, sku, regular_price, stock_quantity\n";
    const sampleRow = [
      "Sample Product", "SKU-001", "9999.99", "7999.99", "100", "Full description here",
      "Short desc", "", "", "1.5", "tag1,tag2", "draft", "simple",
    ].join(",");
    const csv = bom + comment + headerRow + "\n" + sampleRow + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kauvex_product_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Template downloaded");
  };

  const updateMapping = (productField: string, csvCol: string) => {
    setMapping(prev => ({ ...prev, [productField]: csvCol }));
  };

  const validateRows = (): ValidationError[] => {
    const results: ValidationError[] = [];
    const mappedFields = Object.entries(mapping)
      .filter(([, csvCol]) => csvCol !== "")
      .reduce((acc, [pf, csvCol]) => ({ ...acc, [pf]: csvCol }), {} as Record<string, string>);

    csvRows.forEach((row, idx) => {
      const errors: string[] = [];
      const rowNum = idx + 1;

      for (const req of REQUIRED_FIELDS) {
        const csvCol = mappedFields[req];
        if (!csvCol || !row[csvCol]?.trim()) {
          errors.push(`Missing required field: ${req}`);
        }
      }

      const priceCol = mappedFields["regular_price"];
      if (priceCol && row[priceCol]?.trim()) {
        const val = parseFloat(row[priceCol]);
        if (isNaN(val) || val <= 0) {
          errors.push(`Invalid regular_price: "${row[priceCol]}"`);
        }
      }

      const saleCol = mappedFields["sale_price"];
      if (saleCol && row[saleCol]?.trim()) {
        const val = parseFloat(row[saleCol]);
        if (isNaN(val) || val < 0) {
          errors.push(`Invalid sale_price: "${row[saleCol]}"`);
        }
      }

      const qtyCol = mappedFields["stock_quantity"];
      if (qtyCol && row[qtyCol]?.trim()) {
        const val = parseInt(row[qtyCol], 10);
        if (isNaN(val) || val < 0) {
          errors.push(`Invalid stock_quantity: "${row[qtyCol]}"`);
        }
      }

      const weightCol = mappedFields["weight"];
      if (weightCol && row[weightCol]?.trim()) {
        const val = parseFloat(row[weightCol]);
        if (isNaN(val) || val < 0) {
          errors.push(`Invalid weight: "${row[weightCol]}"`);
        }
      }

      const nameCol = mappedFields["name"];
      const name = nameCol ? (row[nameCol] || "") : "";

      results.push({ row: rowNum, name, errors });
    });

    return results;
  };

  const handleValidate = () => {
    const results = validateRows();
    setValidationErrors(results);
    setStep("preview");
  };

  const buildProductPayload = (row: CsvRow, mappedFields: Record<string, string>) => {
    const get = (field: string) => mappedFields[field] ? row[mappedFields[field]]?.trim() || "" : "";
    const name = get("name") || `Product ${Date.now().toString(36)}`;
    const slug = generateSlug(name);
    const sku = get("sku") || `SKU-${Date.now().toString(36)}`;
    const regularPrice = parseFloat(get("regular_price")) || 0;
    const salePrice = get("sale_price") ? parseFloat(get("sale_price")) : null;
    const stockQty = parseInt(get("stock_quantity"), 10) || 0;
    const weight = get("weight") ? parseFloat(get("weight")) : null;
    const tagsStr = get("tags");
    const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];
    const status = get("status") || "draft";

    return {
      name,
      slug,
      sku,
      product_type: get("product_type") || "simple",
      regular_price: regularPrice,
      sale_price: salePrice,
      stock_quantity: stockQty,
      manage_stock: true,
      status,
      description: get("description"),
      short_description: get("short_description"),
      images: [],
      category_id: get("category_id") || null,
      brand_id: get("brand_id") || null,
      vendor_id: vendorId,
      tags,
      weight,
      dimensions: null,
      variations: null,
      updated_at: new Date().toISOString(),
    };
  };

  const handleImport = async () => {
    if (!vendorId) {
      showToast("error", "Vendor not authenticated");
      return;
    }
    setImporting(true);
    setImportProgress(0);

    const mappedFields = Object.entries(mapping)
      .filter(([, csvCol]) => csvCol !== "")
      .reduce((acc, [pf, csvCol]) => ({ ...acc, [pf]: csvCol }), {} as Record<string, string>);

    const validRows = validationErrors.filter(r => r.errors.length === 0);
    const errorRows = validationErrors.filter(r => r.errors.length > 0);

    let successCount = 0;
    let failCount = 0;
    const importErrors: ImportRecord["errors"] = [];
    const total = validRows.length;

    for (let i = 0; i < validRows.length; i++) {
      const vRow = validRows[i];
      const originalRow = csvRows[vRow.row - 1];
      if (!originalRow) {
        failCount++;
        continue;
      }

      try {
        const payload = buildProductPayload(originalRow, mappedFields);
        const { data, error } = await insforge.database.from("products").insert([{ ...payload, created_at: new Date().toISOString() }]).select();
        if (error) throw error;

        if (data && data[0]) {
          await insforge.database.from("inventory").upsert([{
            product_id: data[0].id,
            sku: payload.sku,
            stock_quantity: payload.stock_quantity,
            vendor_id: vendorId,
            updated_at: new Date().toISOString(),
          }], { onConflict: "product_id" });
        }
        successCount++;
      } catch (e: any) {
        failCount++;
        importErrors.push({ row: vRow.row, name: vRow.name, errors: [e.message || "Insert failed"] });
      }

      setImportProgress(Math.round(((i + 1) / total) * 100));
    }

    const totalErrors = [...errorRows.map(r => ({ row: r.row, name: r.name, errors: r.errors })), ...importErrors];

    const record: ImportRecord = {
      id: Date.now(),
      filename: file?.name || "unknown.csv",
      date: formatDate(new Date()),
      total: validationErrors.length,
      success: successCount,
      failed: failCount + errorRows.length,
      errors: totalErrors,
    };

    const updatedLogs = [record, ...importLogs].slice(0, 50);
    saveLogs(updatedLogs);
    setLastImport(record);

    setImporting(false);
    setStep("complete");

    if (failCount === 0 && errorRows.length === 0) {
      showToast("success", `All ${successCount} products imported successfully!`);
    } else {
      showToast("success", `Import complete: ${successCount} succeeded, ${failCount + errorRows.length} failed`);
    }
  };

  const downloadErrorReport = () => {
    if (!lastImport || lastImport.errors.length === 0) {
      showToast("error", "No errors to report");
      return;
    }
    const bom = "\uFEFF";
    const header = "Row,Product,Error\n";
    const rows = lastImport.errors.map(e =>
      `"${e.row}","${e.name.replace(/"/g, '""')}","${e.errors.join("; ").replace(/"/g, '""')}"`
    ).join("\n");
    const csv = bom + header + rows + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import_errors_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Error report downloaded");
  };

  const totalRows = csvRows.length;
  const validCount = validationErrors.filter(r => r.errors.length === 0).length;
  const errorCount = validationErrors.filter(r => r.errors.length > 0).length;

  return (
    <VendorShell title="Bulk Upload" subtitle="Upload multiple products at once using CSV">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
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
                {i < 3 && <ArrowRight size={12} className="text-text-4" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <>
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-bold text-lg text-text-1 mb-1">Upload Product CSV</h2>
              <p className="text-sm text-text-4 mb-4">Upload a CSV file with your product data. Column headers will be detected automatically.</p>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                  dragOver ? "border-orange bg-orange-50" : "border-border hover:border-orange/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={36} className="mx-auto mb-3 text-text-4" />
                <p className="font-bold text-text-1 mb-1">Drop your CSV file here</p>
                <p className="text-xs text-text-4">or click to browse · Accepts .csv files</p>
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-4">
              <FileSpreadsheet size={20} className="text-green-600" />
              <div className="flex-1">
                <p className="text-xs font-bold text-text-1">Download Template</p>
                <p className="text-[10px] text-text-4">Use our CSV template with the correct column headers.</p>
              </div>
              <button onClick={downloadTemplate}
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
            <p className="text-sm text-text-4 mb-2">
              Map your CSV columns to Kauvex product fields.{" "}
              <span className="text-orange font-semibold">{csvRows.length} rows</span> detected.
            </p>
            {autoMatched && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 text-[11px] px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
                <CheckCircle size={12} />
                Auto-mapped columns based on header names. Adjust if needed.
              </div>
            )}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {PRODUCT_FIELDS.map(field => {
                const mapped = mapping[field.field] || "";
                return (
                  <div key={field.field} className="flex items-center gap-3">
                    <div className="w-36 shrink-0">
                      <span className="text-xs font-semibold text-text-1">{field.field}</span>
                      {field.required && <span className="text-[8px] text-red-500 ml-1">*</span>}
                      <p className="text-[9px] text-text-4 leading-tight">{field.description}</p>
                    </div>
                    <ArrowRight size={12} className="text-text-4 shrink-0" />
                    <select
                      value={mapped}
                      onChange={e => updateMapping(field.field, e.target.value)}
                      className="flex-1 h-9 px-3 text-xs border border-border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-orange"
                    >
                      <option value="">-- Skip --</option>
                      {csvHeaders.map(h => (
                        <option key={h} value={h}>
                          {h} {mapped === h ? "✓" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex gap-3">
              <button onClick={() => setStep("upload")} className="px-5 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50">Back</button>
              <button onClick={handleValidate} className="px-5 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors">Validate & Preview</button>
            </div>
          </div>
        )}

        {/* Step 3: Validation Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-text-1">Validation Results</h3>
                  <p className="text-xs text-text-4">{file?.name} · {totalRows} rows</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-600" /> {validCount} Valid</span>
                  <span className="flex items-center gap-1"><AlertCircle size={12} className="text-red-500" /> {errorCount} Errors</span>
                </div>
              </div>

              {importing && (
                <div className="mb-4 bg-orange-50 border border-orange/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange">Importing products...</span>
                    <span className="text-xs font-bold text-orange">{importProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50">
                      <th className="text-left p-3 text-xs text-text-4 font-medium">#</th>
                      <th className="text-left p-3 text-xs text-text-4 font-medium">Product</th>
                      <th className="text-left p-3 text-xs text-text-4 font-medium">Status</th>
                      <th className="text-left p-3 text-xs text-text-4 font-medium">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationErrors.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-xs text-text-4">No rows to validate</td>
                      </tr>
                    ) : (
                      validationErrors.map((r, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-gray-50">
                          <td className="p-3 text-xs text-text-4">{r.row}</td>
                          <td className="p-3 text-xs font-semibold text-text-1 max-w-[200px] truncate">{r.name || "—"}</td>
                          <td className="p-3">
                            {r.errors.length === 0 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Valid</span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">{r.errors.length} error{r.errors.length > 1 ? "s" : ""}</span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-red-500 max-w-[300px]">
                            {r.errors.length > 0 ? (
                              <div className="flex flex-col gap-0.5">
                                {r.errors.map((e, i) => (
                                  <span key={i} className="truncate block">{e}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-green-600">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <button onClick={() => setStep("map")} disabled={importing}
                  className="px-5 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50">Back</button>
                <button onClick={handleImport} disabled={importing || validCount === 0}
                  className="px-5 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {importing ? `Importing ${importProgress}%` : `Import ${validCount} Product${validCount !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === "complete" && lastImport && (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              lastImport.failed === 0 ? "bg-green-100" : "bg-amber-100"
            }`}>
              {lastImport.failed === 0 ? (
                <CheckCircle size={28} className="text-green-600" />
              ) : (
                <FileWarning size={28} className="text-amber-600" />
              )}
            </div>
            <h2 className="font-bold text-xl text-text-1 mb-2">Import Complete!</h2>
            <p className="text-sm text-text-4 mb-6">
              {lastImport.success} product{lastImport.success !== 1 ? "s" : ""} imported successfully
              {lastImport.failed > 0 ? ` · ${lastImport.failed} failed` : ""}.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xl font-bold text-green-700">{lastImport.success}</p>
                <p className="text-[10px] text-text-4">Imported</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-xl font-bold text-red-600">{lastImport.failed}</p>
                <p className="text-[10px] text-text-4">Failed</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xl font-bold text-text-1">{lastImport.total}</p>
                <p className="text-[10px] text-text-4">Total</p>
              </div>
            </div>
            {lastImport.errors.length > 0 && (
              <button onClick={downloadErrorReport}
                className="mx-auto mb-4 flex items-center gap-2 px-4 h-9 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors">
                <Download size={13} /> Download Error Report CSV
              </button>
            )}
            <div className="flex items-center justify-center gap-3">
              <Link href="/vendor/products" className="px-5 h-10 bg-orange text-white text-sm font-bold rounded-xl hover:bg-orange/90 flex items-center gap-2">
                View Products
              </Link>
              <button onClick={() => {
                setStep("upload");
                setFile(null);
                setCsvHeaders([]);
                setCsvRows([]);
                setMapping({});
                setValidationErrors([]);
                setLastImport(null);
                setImportProgress(0);
              }} className="px-5 h-10 border border-border text-sm font-semibold rounded-xl hover:bg-gray-50">
                Upload Another
              </button>
            </div>
          </div>
        )}

        {/* Import History */}
        <div className="bg-white rounded-xl border border-border p-5">
          <button onClick={() => setShowLogs(!showLogs)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-text-4" />
              <h3 className="font-bold text-sm text-text-1">Import History</h3>
              <span className="text-[10px] text-text-4 bg-gray-100 px-1.5 py-0.5 rounded-full">{importLogs.length}</span>
            </div>
            {showLogs ? <ChevronUp size={14} className="text-text-4" /> : <ChevronDown size={14} className="text-text-4" />}
          </button>
          {showLogs && (
            <div className="mt-4 space-y-2">
              {importLogs.length === 0 ? (
                <div className="text-center py-6 text-xs text-text-4">No imports yet. Upload a CSV to get started.</div>
              ) : (
                importLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.failed === 0 ? "bg-green-100" : log.success > 0 ? "bg-amber-100" : "bg-red-100"
                      }`}>
                        <FileSpreadsheet size={15} className={
                          log.failed === 0 ? "text-green-700" : log.success > 0 ? "text-amber-700" : "text-red-600"
                        } />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-text-1 truncate">{log.filename}</p>
                        <p className="text-[10px] text-text-4">{log.date} · {log.success}/{log.total} products</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {log.errors.length > 0 && (
                        <button
                          onClick={() => {
                            setLastImport(log);
                            const bom = "\uFEFF";
                            const header = "Row,Product,Error\n";
                            const rows = log.errors.map(e =>
                              `"${e.row}","${e.name.replace(/"/g, '""')}","${e.errors.join("; ").replace(/"/g, '""')}"`
                            ).join("\n");
                            const csv = bom + header + rows + "\n";
                            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `errors_${log.filename}`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="text-[10px] text-red-500 hover:text-red-700 underline"
                        >
                          Errors
                        </button>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                        log.failed === 0 ? "bg-green-100 text-green-700" :
                        log.success > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                      }`}>{log.failed === 0 ? "Completed" : log.success > 0 ? "Partial" : "Failed"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </VendorShell>
  );
}
