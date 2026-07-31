"use client";

import { useState } from "react";
import { Truck, Plus, ShieldAlert } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const RISKS = ["low", "medium", "high", "critical"];
const STATUSES = ["active", "inactive", "blacklisted", "pending"];

export default function SuppliersPage() {
  const suppliers = useBosResource("suppliers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const highRisk = suppliers.rows.filter((s: any) => ["high", "critical"].includes(s.riskLevel));
  const active = suppliers.rows.filter((s: any) => s.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Supplier database, certifications, performance, and risk"
        icon={<Truck className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Supplier</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Suppliers" value={suppliers.rows.length} icon={<Truck className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<Truck className="w-4 h-4" />} />
        <StatCard label="High Risk" value={highRisk.length} icon={<ShieldAlert className="w-4 h-4" />} />
        <StatCard label="Avg. Rating" value={suppliers.rows.length ? (suppliers.rows.reduce((s: number, x: any) => s + (x.rating || 0), 0) / suppliers.rows.length).toFixed(1) : "—"} icon={<Truck className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Supplier" />

      <DataTable
        columns={[
          { header: "Supplier", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
          { header: "Category", render: (r: any) => r.category || "—" },
          { header: "Contact", render: (r: any) => <span>{r.email || "—"}<span className="block text-xs text-text-3">{r.phone}</span></span> },
          { header: "Lead Time", render: (r: any) => r.leadTimeDays ? `${r.leadTimeDays} days` : "—" },
          { header: "Delivery Perf.", render: (r: any) => r.deliveryPerformance != null ? `${r.deliveryPerformance}%` : "—" },
          { header: "Quality Score", render: (r: any) => r.qualityScore != null ? `${r.qualityScore}%` : "—" },
          { header: "Risk", render: (r: any) => <StatusBadge status={r.riskLevel} /> },
          { header: "Contract End", render: (r: any) => fmtDate(r.contractEnd) },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
        rows={suppliers.rows}
        loading={suppliers.loading}
        empty="No suppliers yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Supplier" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await suppliers.createRow(form);
          setShow(false);
        }}>
          <Field label="Name" required><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Category"><input className={inputCls} value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Payment Terms"><input className={inputCls} placeholder="Net 30" value={form.paymentTerms ?? ""} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} /></Field>
          <Field label="Lead Time (days)"><input type="number" className={inputCls} value={form.leadTimeDays ?? ""} onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })} /></Field>
          <Field label="Risk Level">
            <select className={selectCls} value={form.riskLevel ?? "low"} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })}>
              {RISKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Contract Start"><input type="date" className={inputCls} value={form.contractStart ?? ""} onChange={(e) => setForm({ ...form, contractStart: e.target.value })} /></Field>
          <Field label="Contract End"><input type="date" className={inputCls} value={form.contractEnd ?? ""} onChange={(e) => setForm({ ...form, contractEnd: e.target.value })} /></Field>
          <Field label="Status">
            <select className={selectCls} value={form.status ?? "active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
