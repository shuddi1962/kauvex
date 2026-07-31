"use client";

import { useState } from "react";
import { Wrench, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const CATEGORIES = ["building", "vehicle", "boat", "machinery", "computer", "tool", "test_equipment", "furniture", "license", "other"];
const STATUSES = ["in_service", "maintenance", "idle", "retired", "transferred"];

export default function AssetsPage() {
  const assets = useBosResource("assets");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const totalValue = assets.rows.reduce((s: number, a: any) => s + Number(a.purchaseCost || 0), 0);
  const inMaintenance = assets.rows.filter((a: any) => a.status === "maintenance");
  const calibrationDue = assets.rows.filter((a: any) => a.calibrationDue && new Date(a.calibrationDue) < new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Management"
        subtitle="Vehicles, boats, machinery, tools, and equipment with depreciation tracking"
        icon={<Wrench className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Asset</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Assets" value={assets.rows.length} icon={<Wrench className="w-4 h-4" />} />
        <StatCard label="Asset Value" value={fmtMoney(totalValue)} icon={<Wrench className="w-4 h-4" />} />
        <StatCard label="In Maintenance" value={inMaintenance.length} icon={<Wrench className="w-4 h-4" />} />
        <StatCard label="Calibration Due" value={calibrationDue.length} icon={<Wrench className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Asset" />

      <DataTable
        columns={[
          { header: "Asset", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
          { header: "Code", render: (r: any) => <span className="font-mono text-xs">{r.assetCode || "—"}</span> },
          { header: "Category", render: (r: any) => <span className="capitalize text-xs">{r.category || "other"}</span> },
          { header: "Serial", render: (r: any) => <span className="font-mono text-xs">{r.serialNumber || "—"}</span> },
          { header: "Purchase Cost", render: (r: any) => fmtMoney(r.purchaseCost) },
          { header: "Book Value", render: (r: any) => r.bookValue != null ? fmtMoney(r.bookValue) : "—" },
          { header: "Location", render: (r: any) => r.location || "—" },
          { header: "Assigned To", render: (r: any) => r.assignedTo || "—" },
          { header: "Calibration", render: (r: any) => fmtDate(r.calibrationDue) },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
        rows={assets.rows}
        loading={assets.loading}
        empty="No assets yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Asset" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await assets.createRow(form);
          setShow(false);
        }}>
          <Field label="Name" required><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Asset Code"><input className={inputCls} value={form.assetCode ?? ""} onChange={(e) => setForm({ ...form, assetCode: e.target.value })} /></Field>
          <Field label="Category">
            <select className={selectCls} value={form.category ?? "other"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Serial Number"><input className={inputCls} value={form.serialNumber ?? ""} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></Field>
          <Field label="Purchase Date"><input type="date" className={inputCls} value={form.purchaseDate ?? ""} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /></Field>
          <Field label="Purchase Cost"><input type="number" className={inputCls} value={form.purchaseCost ?? ""} onChange={(e) => setForm({ ...form, purchaseCost: Number(e.target.value) })} /></Field>
          <Field label="Useful Life (years)"><input type="number" className={inputCls} value={form.usefulLifeYears ?? 5} onChange={(e) => setForm({ ...form, usefulLifeYears: Number(e.target.value) })} /></Field>
          <Field label="Salvage Value"><input type="number" className={inputCls} value={form.salvageValue ?? 0} onChange={(e) => setForm({ ...form, salvageValue: Number(e.target.value) })} /></Field>
          <Field label="Warranty End"><input type="date" className={inputCls} value={form.warrantyEnd ?? ""} onChange={(e) => setForm({ ...form, warrantyEnd: e.target.value })} /></Field>
          <Field label="Calibration Due"><input type="date" className={inputCls} value={form.calibrationDue ?? ""} onChange={(e) => setForm({ ...form, calibrationDue: e.target.value })} /></Field>
          <Field label="Location"><input className={inputCls} value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
          <Field label="Assigned To"><input className={inputCls} value={form.assignedTo ?? ""} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
