"use client";

import { useState } from "react";
import { Factory, Plus, Play, CheckCircle2 } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const STATUSES = ["planned", "released", "in_progress", "on_hold", "completed", "cancelled"];

export default function ManufacturingPage() {
  const orders = useBosResource("production-orders");
  const items = useBosResource("items");
  const boms = useBosResource("boms");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const inProgress = orders.rows.filter((o: any) => ["released", "in_progress"].includes(o.status));
  const completed = orders.rows.filter((o: any) => o.status === "completed");
  const totalCost = orders.rows.reduce((s: number, o: any) => s + Number(o.productionCost), 0);

  const advance = async (order: any) => {
    const flow = ["planned", "released", "in_progress", "completed"];
    const idx = flow.indexOf(order.status);
    if (idx < 0 || idx >= flow.length - 1) return;
    const nextStatus = flow[idx + 1];
    await orders.updateRow(order.id, {
      status: nextStatus,
      actualStart: nextStatus === "in_progress" ? new Date().toISOString() : order.actualStart,
      actualEnd: nextStatus === "completed" ? new Date().toISOString() : undefined,
      quantityProduced: nextStatus === "completed" ? order.quantity : order.quantityProduced,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manufacturing"
        subtitle="Production orders, work centers, routing, and shop floor tracking"
        icon={<Factory className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Production Order</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.rows.length} icon={<Factory className="w-4 h-4" />} />
        <StatCard label="In Progress" value={inProgress.length} icon={<Play className="w-4 h-4" />} />
        <StatCard label="Completed" value={completed.length} icon={<CheckCircle2 className="w-4 h-4" />} />
        <StatCard label="Production Cost" value={fmtMoney(totalCost)} icon={<Factory className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Production Order" />

      <DataTable
        columns={[
          { header: "MO #", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.productionNumber}</span> },
          { header: "Product", render: (r: any) => items.rows.find((i: any) => i.id === r.itemId)?.name || "—" },
          { header: "Qty", render: (r: any) => <span className="font-bold">{Number(r.quantityProduced)}/{Number(r.quantity)}</span> },
          { header: "Work Center", render: (r: any) => r.workCenter || "—" },
          { header: "Scrap", render: (r: any) => Number(r.scrapQuantity) ? <span className="text-red-500 font-semibold">{Number(r.scrapQuantity)}</span> : "0" },
          { header: "Labor Hrs", render: (r: any) => Number(r.laborHours) },
          { header: "Cost", render: (r: any) => fmtMoney(r.productionCost) },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "", render: (r: any) => (
            !["completed", "cancelled"].includes(r.status) ? (
              <button onClick={() => advance(r)} className="text-xs font-semibold text-kauvex-orange hover:underline">Advance →</button>
            ) : null
          )},
        ]}
        rows={orders.rows}
        loading={orders.loading}
        empty="No production orders yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Production Order">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await orders.createRow({ ...form, status: "planned" });
          setShow(false);
        }}>
          <Field label="Product" required>
            <select required className={selectCls} value={form.itemId ?? ""} onChange={(e) => setForm({ ...form, itemId: e.target.value })}>
              <option value="">Select product...</option>
              {items.rows.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Quantity" required><input required type="number" className={inputCls} value={form.quantity ?? ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></Field>
          <Field label="Bill of Materials">
            <select className={selectCls} value={form.bomId ?? ""} onChange={(e) => setForm({ ...form, bomId: e.target.value })}>
              <option value="">None</option>
              {boms.rows.map((b: any) => <option key={b.id} value={b.id}>{b.bomName} (v{b.version})</option>)}
            </select>
          </Field>
          <Field label="Work Center"><input className={inputCls} value={form.workCenter ?? ""} onChange={(e) => setForm({ ...form, workCenter: e.target.value })} /></Field>
          <Field label="Planned Start"><input type="date" className={inputCls} value={form.plannedStart ?? ""} onChange={(e) => setForm({ ...form, plannedStart: e.target.value })} /></Field>
          <Field label="Planned End"><input type="date" className={inputCls} value={form.plannedEnd ?? ""} onChange={(e) => setForm({ ...form, plannedEnd: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
