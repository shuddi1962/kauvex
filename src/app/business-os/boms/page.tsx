"use client";

import { useState } from "react";
import { Hammer, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, useBosResource, StatusBadge } from "@/components/business-os/shared";

export default function BomsPage() {
  const boms = useBosResource("boms");
  const items = useBosResource("items");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [components, setComponents] = useState<any[]>([]);

  const active = boms.rows.filter((b: any) => b.isActive);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Materials"
        subtitle="Multi-level BOMs with components, scrap, and labor standards"
        icon={<Hammer className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New BOM</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total BOMs" value={boms.rows.length} icon={<Hammer className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<Hammer className="w-4 h-4" />} />
        <StatCard label="Avg. Components" value={boms.rows.length ? (boms.rows.reduce((s: number, b: any) => s + (Array.isArray(b.components) ? b.components.length : 0), 0) / boms.rows.length).toFixed(1) : "—"} icon={<Hammer className="w-4 h-4" />} />
        <StatCard label="Latest Version" value={boms.rows.reduce((m: number, b: any) => Math.max(m, b.version || 1), 1)} icon={<Hammer className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New BOM" />

      <DataTable
        columns={[
          { header: "BOM Name", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.bomName}</span> },
          { header: "Product", render: (r: any) => items.rows.find((i: any) => i.id === r.productId)?.name || "—" },
          { header: "Components", render: (r: any) => Array.isArray(r.components) ? (
            <div className="space-y-0.5">
              {r.components.slice(0, 2).map((c: any, i: number) => (
                <p key={i} className="text-xs">{items.rows.find((it: any) => it.id === c.itemId)?.name || "Item"} × {c.qty}</p>
              ))}
              {r.components.length > 2 && <p className="text-[11px] text-text-3">+{r.components.length - 2} more</p>}
            </div>
          ) : "—" },
          { header: "Scrap %", render: (r: any) => `${r.scrapPercent}%` },
          { header: "Labor (hrs)", render: (r: any) => Number(r.laborHours) },
          { header: "Version", render: (r: any) => `v${r.version}` },
          { header: "Status", render: (r: any) => r.isActive ? <StatusBadge status="active" /> : <StatusBadge status="inactive" /> },
        ]}
        rows={boms.rows}
        loading={boms.loading}
        empty="No BOMs yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New BOM" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await boms.createRow({ ...form, components, version: 1, isActive: true });
          setShow(false);
          setComponents([]);
        }}>
          <div className="col-span-2">
            <Field label="BOM Name" required><input required className={inputCls} value={form.bomName ?? ""} onChange={(e) => setForm({ ...form, bomName: e.target.value })} /></Field>
          </div>
          <Field label="Product" required>
            <select required className={selectCls} value={form.productId ?? ""} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Select product...</option>
              {items.rows.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Scrap %"><input type="number" className={inputCls} value={form.scrapPercent ?? 0} onChange={(e) => setForm({ ...form, scrapPercent: Number(e.target.value) })} /></Field>
          <Field label="Labor Hours"><input type="number" className={inputCls} value={form.laborHours ?? 0} onChange={(e) => setForm({ ...form, laborHours: Number(e.target.value) })} /></Field>
          <Field label="Machine Hours"><input type="number" className={inputCls} value={form.machineHours ?? 0} onChange={(e) => setForm({ ...form, machineHours: Number(e.target.value) })} /></Field>

          <div className="col-span-2">
            <p className="text-xs font-semibold text-text-2 mb-1.5">Components</p>
            <div className="space-y-2">
              {components.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <select className={`${selectCls} flex-1`} value={line.itemId ?? ""}
                    onChange={(e) => setComponents(components.map((l, j) => j === i ? { ...l, itemId: e.target.value } : l))}>
                    <option value="">Select component...</option>
                    {items.rows.filter((it: any) => it.id !== form.productId).map((it: any) => <option key={it.id} value={it.id}>{it.name}</option>)}
                  </select>
                  <input className={`${inputCls} w-24`} type="number" placeholder="Qty" value={line.qty ?? ""}
                    onChange={(e) => setComponents(components.map((l, j) => j === i ? { ...l, qty: Number(e.target.value) } : l))} />
                  <button type="button" onClick={() => setComponents(components.filter((_, j) => j !== i))} className="px-2 text-red-500 text-sm">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setComponents([...components, {}])} className="text-xs font-semibold text-kauvex-orange">+ Add component</button>
            </div>
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create BOM</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
