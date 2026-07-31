"use client";

import { useState } from "react";
import { Boxes, Plus, AlertTriangle } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const TYPES = ["product", "raw_material", "component", "finished_good", "spare_part", "rental_asset", "consumable"];

export default function InventoryPage() {
  const items = useBosResource("items");
  const suppliers = useBosResource("suppliers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [query, setQuery] = useState("");

  const totalValue = items.rows.reduce((s: number, i: any) => s + Number(i.stockOnHand) * Number(i.costPrice || 0), 0);
  const low = items.rows.filter((i: any) => i.status === "active" && Number(i.stockOnHand) <= Number(i.reorderPoint || 0));

  const filtered = query
    ? items.rows.filter((i: any) => (i.name + " " + (i.sku || "")).toLowerCase().includes(query.toLowerCase()))
    : items.rows;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Products, raw materials, components, spare parts, and rental assets"
        icon={<Boxes className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Item</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Items" value={items.rows.length} icon={<Boxes className="w-4 h-4" />} />
        <StatCard label="Stock Value" value={fmtMoney(totalValue)} icon={<Boxes className="w-4 h-4" />} />
        <StatCard label="Units On Hand" value={items.rows.reduce((s: number, i: any) => s + Number(i.stockOnHand), 0)} icon={<Boxes className="w-4 h-4" />} />
        <StatCard label="Low / Reorder" value={low.length} icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      <Toolbar onSearch={setQuery} onNew={() => setShow(true)} newLabel="New Item" />

      <DataTable
        columns={[
          { header: "Item", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
          { header: "SKU", render: (r: any) => <span className="font-mono text-xs">{r.sku || "—"}</span> },
          { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.itemType.replace("_", " ")}</span> },
          { header: "Category", render: (r: any) => r.category || "—" },
          { header: "On Hand", render: (r: any) => (
            <span className={`font-bold ${Number(r.stockOnHand) <= Number(r.reorderPoint || 0) ? "text-red-500" : "text-emerald-600"}`}>
              {Number(r.stockOnHand)} {r.unit}
            </span>
          )},
          { header: "Cost", render: (r: any) => fmtMoney(r.costPrice) },
          { header: "Selling Price", render: (r: any) => fmtMoney(r.sellingPrice) },
          { header: "Reorder Pt.", render: (r: any) => Number(r.reorderPoint) },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
        rows={filtered}
        loading={items.loading}
        empty="No inventory items yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Item" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await items.createRow(form);
          setShow(false);
        }}>
          <Field label="Name" required><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="SKU"><input className={inputCls} value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></Field>
          <Field label="Type">
            <select className={selectCls} value={form.itemType ?? "product"} onChange={(e) => setForm({ ...form, itemType: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Category"><input className={inputCls} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Unit"><input className={inputCls} placeholder="pcs" value={form.unit ?? "pcs"} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>
          <Field label="Barcode"><input className={inputCls} value={form.barcode ?? ""} onChange={(e) => setForm({ ...form, barcode: e.target.value })} /></Field>
          <Field label="Cost Price"><input type="number" className={inputCls} value={form.costPrice ?? 0} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} /></Field>
          <Field label="Selling Price"><input type="number" className={inputCls} value={form.sellingPrice ?? 0} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} /></Field>
          <Field label="Stock On Hand"><input type="number" className={inputCls} value={form.stockOnHand ?? 0} onChange={(e) => setForm({ ...form, stockOnHand: Number(e.target.value) })} /></Field>
          <Field label="Reorder Point"><input type="number" className={inputCls} value={form.reorderPoint ?? 0} onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })} /></Field>
          <Field label="Reorder Qty"><input type="number" className={inputCls} value={form.reorderQuantity ?? 0} onChange={(e) => setForm({ ...form, reorderQuantity: Number(e.target.value) })} /></Field>
          <Field label="Supplier">
            <select className={selectCls} value={form.supplierId ?? ""} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">None</option>
              {suppliers.rows.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Batch Tracked">
            <select className={selectCls} value={form.batchTracked ? "true" : "false"} onChange={(e) => setForm({ ...form, batchTracked: e.target.value === "true" })}>
              <option value="false">No</option><option value="true">Yes</option>
            </select>
          </Field>
          <Field label="Serial Tracked">
            <select className={selectCls} value={form.serialTracked ? "true" : "false"} onChange={(e) => setForm({ ...form, serialTracked: e.target.value === "true" })}>
              <option value="false">No</option><option value="true">Yes</option>
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
