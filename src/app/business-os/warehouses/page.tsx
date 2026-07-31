"use client";

import { useState } from "react";
import { Warehouse as WarehouseIcon, Plus, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const WH_TYPES = ["standard", "cold", "hazardous", "fragile", "open"];
const MOVEMENTS = ["receipt", "issue", "transfer_in", "transfer_out", "adjustment", "cycle_count", "sale", "purchase", "production_in", "production_out", "return_in", "return_out"];

export default function WarehousesPage() {
  const warehouses = useBosResource("warehouses");
  const movements = useBosResource("stock-movements");
  const items = useBosResource("items");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showMove, setShowMove] = useState(false);
  const [moveForm, setMoveForm] = useState<any>({});
  const [tab, setTab] = useState<"warehouses" | "movements">("warehouses");

  const netIn = movements.rows
    .filter((m: any) => ["receipt", "transfer_in", "return_in", "production_in", "purchase"].includes(m.movementType))
    .reduce((s: number, m: any) => s + Number(m.quantity), 0);
  const netOut = movements.rows
    .filter((m: any) => ["issue", "transfer_out", "sale", "production_out", "return_out"].includes(m.movementType))
    .reduce((s: number, m: any) => s + Number(m.quantity), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Management"
        subtitle="Warehouses, bin locations, receiving, picking, and stock movements"
        icon={<WarehouseIcon className="w-5 h-5" />}
        actions={
          <div className="flex gap-2">
            <button className={btnSecondary} onClick={() => setShowMove(true)}><Plus className="w-4 h-4" /> Record Movement</button>
            <button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Warehouse</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Warehouses" value={warehouses.rows.length} icon={<WarehouseIcon className="w-4 h-4" />} />
        <StatCard label="Inbound Units" value={netIn} icon={<ArrowDownToLine className="w-4 h-4" />} />
        <StatCard label="Outbound Units" value={netOut} icon={<ArrowUpFromLine className="w-4 h-4" />} />
        <StatCard label="Movements" value={movements.rows.length} icon={<WarehouseIcon className="w-4 h-4" />} />
      </div>

      <div className="flex gap-1 bg-white border border-border rounded-lg p-1 w-fit">
        {(["warehouses", "movements"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors ${tab === t ? "bg-kauvex-navy text-white" : "text-text-3 hover:text-kauvex-navy"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "warehouses" ? (
        <DataTable
          columns={[
            { header: "Warehouse", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
            { header: "Type", render: (r: any) => <span className="capitalize">{r.warehouseType}</span> },
            { header: "Capacity", render: (r: any) => r.capacityUnits ? `${r.capacityUnits.toLocaleString()} units` : "—" },
            { header: "Utilization", render: (r: any) => r.utilizationPercent != null ? (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-kauvex-orange rounded-full" style={{ width: `${Math.min(100, Number(r.utilizationPercent))}%` }} />
                </div>
                <span className="text-xs">{r.utilizationPercent}%</span>
              </div>
            ) : "—" },
            { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
          rows={warehouses.rows}
          loading={warehouses.loading}
          empty="No warehouses yet"
        />
      ) : (
        <DataTable
          columns={[
            { header: "Item", render: (r: any) => items.rows.find((i: any) => i.id === r.itemId)?.name || "—" },
            { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.movementType.replace("_", " ")}</span> },
            { header: "Qty", render: (r: any) => <span className={`font-bold ${["receipt", "transfer_in", "return_in", "production_in", "purchase"].includes(r.movementType) ? "text-emerald-600" : "text-red-500"}`}>{Number(r.quantity)}</span> },
            { header: "Unit Cost", render: (r: any) => r.unitCost ? fmtMoney(r.unitCost) : "—" },
            { header: "Reference", render: (r: any) => r.referenceType ? <span className="text-xs">{r.referenceType} <span className="font-mono">#{r.referenceId?.slice(0, 8)}</span></span> : "—" },
            { header: "Batch", render: (r: any) => r.batchNumber || "—" },
            { header: "Notes", render: (r: any) => r.notes || "—" },
            { header: "When", render: (r: any) => fmtDate(r.createdAt) },
          ]}
          rows={movements.rows}
          loading={movements.loading}
          empty="No stock movements yet"
        />
      )}

      <Modal open={show} onClose={() => setShow(false)} title="New Warehouse">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await warehouses.createRow(form);
          setShow(false);
        }}>
          <Field label="Name" required><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Type">
            <select className={selectCls} value={form.warehouseType ?? "standard"} onChange={(e) => setForm({ ...form, warehouseType: e.target.value })}>
              {WH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Capacity (units)"><input type="number" className={inputCls} value={form.capacityUnits ?? ""} onChange={(e) => setForm({ ...form, capacityUnits: Number(e.target.value) })} /></Field>
          <Field label="Manager"><input className={inputCls} value={form.managerId ?? ""} onChange={(e) => setForm({ ...form, managerId: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>

      <Modal open={showMove} onClose={() => setShowMove(false)} title="Record Stock Movement">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await movements.createRow(moveForm);
            setShowMove(false);
            await items.fetchRows();
          } catch { /* handled by hook */ }
        }}>
          <Field label="Item" required>
            <select required className={selectCls} value={moveForm.itemId ?? ""} onChange={(e) => setMoveForm({ ...moveForm, itemId: e.target.value })}>
              <option value="">Select item...</option>
              {items.rows.map((i: any) => <option key={i.id} value={i.id}>{i.name} ({Number(i.stockOnHand)} {i.unit})</option>)}
            </select>
          </Field>
          <Field label="Movement Type">
            <select className={selectCls} value={moveForm.movementType ?? "receipt"} onChange={(e) => setMoveForm({ ...moveForm, movementType: e.target.value })}>
              {MOVEMENTS.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Quantity" required><input required type="number" className={inputCls} value={moveForm.quantity ?? ""} onChange={(e) => setMoveForm({ ...moveForm, quantity: Number(e.target.value) })} /></Field>
          <Field label="Unit Cost"><input type="number" className={inputCls} value={moveForm.unitCost ?? ""} onChange={(e) => setMoveForm({ ...moveForm, unitCost: Number(e.target.value) })} /></Field>
          <Field label="Warehouse">
            <select className={selectCls} value={moveForm.warehouseId ?? ""} onChange={(e) => setMoveForm({ ...moveForm, warehouseId: e.target.value })}>
              <option value="">None</option>
              {warehouses.rows.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </Field>
          <Field label="Batch Number"><input className={inputCls} value={moveForm.batchNumber ?? ""} onChange={(e) => setMoveForm({ ...moveForm, batchNumber: e.target.value })} /></Field>
          <Field label="Reference Type"><input className={inputCls} placeholder="e.g. sales_order" value={moveForm.referenceType ?? ""} onChange={(e) => setMoveForm({ ...moveForm, referenceType: e.target.value })} /></Field>
          <Field label="Notes"><input className={inputCls} value={moveForm.notes ?? ""} onChange={(e) => setMoveForm({ ...moveForm, notes: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShowMove(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
