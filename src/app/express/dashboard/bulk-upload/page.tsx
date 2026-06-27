"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Eye,
  Trash2,
  Loader2,
  ArrowUpRight,
  Filter,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";

interface UploadRow {
  id: string;
  filename: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: "completed" | "processing" | "failed" | "partial";
  uploadedAt: string;
  errors: Array<{ row: number; field: string; message: string }>;
}

const MOCK_UPLOADS: UploadRow[] = [
  {
    id: "UP-001",
    filename: "batch_jan_2026.csv",
    totalRows: 250,
    successfulRows: 248,
    failedRows: 2,
    status: "completed",
    uploadedAt: "2026-01-20T14:30:00Z",
    errors: [
      { row: 42, field: "recipient_phone", message: "Invalid phone format" },
      { row: 187, field: "weight_kg", message: "Weight exceeds 50kg limit" },
    ],
  },
  {
    id: "UP-002",
    filename: "express_lagos_batch.csv",
    totalRows: 120,
    successfulRows: 120,
    failedRows: 0,
    status: "completed",
    uploadedAt: "2026-01-19T09:15:00Z",
    errors: [],
  },
  {
    id: "UP-003",
    filename: "returns_q4_2025.csv",
    totalRows: 75,
    successfulRows: 52,
    failedRows: 23,
    status: "failed",
    uploadedAt: "2026-01-18T16:45:00Z",
    errors: Array.from({ length: 23 }, (_, i) => ({
      row: i + 1,
      field: i % 2 === 0 ? "recipient_address" : "sender_phone",
      message: i % 2 === 0 ? "Missing required field" : "Invalid phone format",
    })),
  },
  {
    id: "UP-004",
    filename: "international_dec.csv",
    totalRows: 89,
    successfulRows: 85,
    failedRows: 4,
    status: "completed",
    uploadedAt: "2026-01-17T11:00:00Z",
    errors: [
      { row: 12, field: "customs_value", message: "Missing customs declaration" },
      { row: 34, field: "hs_code", message: "Invalid HS code format" },
      { row: 56, field: "recipient_country", message: "Unsupported destination" },
      { row: 78, field: "package_description", message: "Description too long" },
    ],
  },
  {
    id: "UP-005",
    filename: "abuja_deliveries.csv",
    totalRows: 15,
    successfulRows: 0,
    failedRows: 15,
    status: "failed",
    uploadedAt: "2026-01-16T08:20:00Z",
    errors: Array.from({ length: 15 }, (_, i) => ({
      row: i + 1,
      field: "csv_format",
      message: "Invalid CSV format: missing required columns",
    })),
  },
];

const TEMPLATE_HEADERS = [
  "recipient_name",
  "recipient_phone",
  "recipient_email",
  "recipient_address",
  "recipient_city",
  "recipient_country",
  "sender_name",
  "sender_phone",
  "sender_address",
  "sender_city",
  "package_description",
  "weight_kg",
  "length_cm",
  "width_cm",
  "height_cm",
  "service_type",
  "insurance_required",
  "declared_value",
  "customs_value",
  "hs_code",
  "notes",
];

export default function BulkUploadPage() {
  const [uploads] = useState<UploadRow[]>(MOCK_UPLOADS);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showErrors, setShowErrors] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredUploads = uploads.filter((u) => {
    const matchesSearch = u.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRows = uploads.reduce((sum, u) => sum + u.totalRows, 0);
  const totalSuccessful = uploads.reduce((sum, u) => sum + u.successfulRows, 0);
  const totalFailed = uploads.reduce((sum, u) => sum + u.failedRows, 0);

  const simulateUpload = useCallback(() => {
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => setUploadProgress(null), 1500);
      }
      setUploadProgress(Math.min(progress, 100));
    }, 200);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        simulateUpload();
      }
    },
    [simulateUpload]
  );

  const handleFileSelect = useCallback(() => {
    if (fileInputRef.current?.files?.length) {
      simulateUpload();
    }
  }, [simulateUpload]);

  const downloadTemplate = () => {
    const csvContent = [TEMPLATE_HEADERS.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kauvex_bulk_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "partial":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-50 text-green-700 border-green-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      partial: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    return `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || ""}`;
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const selectedErrors = uploads.find((u) => u.id === showErrors)?.errors || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Bulk Upload</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload CSV files to create multiple shipments at once
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-semibold hover:bg-[#0f1f38] transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Total Rows Uploaded</div>
          <div className="text-2xl font-bold text-[#0A1628] mt-1">{totalRows.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Successful</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{totalSuccessful.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Failed</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{totalFailed.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-[#0A1628] mb-4">Upload CSV File</h2>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#FF6B00] bg-orange-50"
              : "border-gray-300 hover:border-[#FF6B00] hover:bg-orange-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-[#FF6B00]" : "text-gray-400"}`} />
          <p className="text-base font-medium text-gray-700">
            {isDragging ? "Drop your CSV file here" : "Drag & drop your CSV file or click to browse"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports .csv files up to 10MB (max 500 rows per upload)
          </p>
        </div>

        {uploadProgress !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">
                {uploadProgress < 100 ? "Uploading..." : "Processing..."}
              </span>
              <span className="text-gray-500">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#FF6B00] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            {uploadProgress >= 100 && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Upload complete — 15 shipments created successfully
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[#0A1628]">Recent Uploads</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search uploads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00]"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="partial">Partial</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Filename</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Rows</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Successful</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Failed</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUploads.map((upload) => (
                <tr key={upload.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#FF6B00]" />
                      <span className="font-medium text-[#0A1628]">{upload.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{upload.totalRows}</td>
                  <td className="py-3 px-4 text-green-600 font-medium">{upload.successfulRows}</td>
                  <td className="py-3 px-4">
                    <span className={upload.failedRows > 0 ? "text-red-600 font-medium" : "text-gray-400"}>
                      {upload.failedRows}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={statusBadge(upload.status)}>
                      {statusIcon(upload.status)}
                      {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{formatTime(upload.uploadedAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {upload.errors.length > 0 && (
                        <button
                          onClick={() => setShowErrors(showErrors === upload.id ? null : upload.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="View errors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUploads.length === 0 && (
            <div className="text-center py-8 text-gray-500">No uploads found matching your search.</div>
          )}
        </div>
      </div>

      {showErrors && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Validation Errors — {uploads.find((u) => u.id === showErrors)?.filename}
            </h3>
            <button
              onClick={() => setShowErrors(null)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Close
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-200">
                  <th className="text-left py-2 px-3 font-semibold text-red-700">Row</th>
                  <th className="text-left py-2 px-3 font-semibold text-red-700">Field</th>
                  <th className="text-left py-2 px-3 font-semibold text-red-700">Error Message</th>
                </tr>
              </thead>
              <tbody>
                {selectedErrors.slice(0, 10).map((error, idx) => (
                  <tr key={idx} className="border-b border-red-100">
                    <td className="py-2 px-3 font-mono text-red-800">{error.row}</td>
                    <td className="py-2 px-3 text-red-700">{error.field}</td>
                    <td className="py-2 px-3 text-red-600">{error.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedErrors.length > 10 && (
              <p className="text-sm text-red-600 mt-3">
                Showing 10 of {selectedErrors.length} errors. Download the error report for full details.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
