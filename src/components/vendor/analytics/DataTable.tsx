"use client";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Search } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  exportable?: boolean;
  onExport?: () => void;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  pageSize = 20,
  searchable = true,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
  onRowClick,
  exportable = false,
  onExport,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let items = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((item) =>
        columns.some((col) => {
          const val = item[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      items = [...items].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        let cmp = 0;
        if (typeof aVal === "number" && typeof bVal === "number") {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return items;
  }, [data, search, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      {(searchable || exportable) && (
        <div className="flex items-center gap-3 p-3 border-b border-border">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-7 pr-3 text-xs border border-border rounded-lg focus:outline-none focus:border-orange/40"
              />
            </div>
          )}
          {exportable && onExport && (
            <button
              onClick={onExport}
              className="ml-auto text-[10px] font-semibold text-orange hover:text-orange/80 px-3 py-1.5 border border-orange/30 rounded-lg hover:bg-orange-50"
            >
              Export CSV
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-gray-50/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-${col.align || "left"} px-3 py-2.5 font-semibold text-text-4 ${
                    col.sortable !== false ? "cursor-pointer hover:text-text-2 select-none" : ""
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-[10px]">{col.label}</span>
                    {sortKey === col.key && (
                      sortDir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-text-4 text-xs">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`text-${col.align || "left"} px-3 py-2.5 text-text-2`}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-gray-50/30">
          <span className="text-[10px] text-text-4">
            {filtered.length} results
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="px-2 py-1 text-[10px] font-medium rounded border border-border disabled:opacity-30 hover:bg-gray-100"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = Math.max(0, Math.min(safePage - 2, totalPages - 5)) + i;
              if (pageNum >= totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-6 h-6 text-[10px] font-medium rounded ${
                    pageNum === safePage ? "bg-orange text-white" : "hover:bg-gray-100 text-text-3"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="px-2 py-1 text-[10px] font-medium rounded border border-border disabled:opacity-30 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
