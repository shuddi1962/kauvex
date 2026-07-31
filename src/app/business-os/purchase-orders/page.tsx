"use client";

import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const STATUSES = ["draft", "submitted", "approved", "sent", "partially_received", "received", "cancelled"];

export default function PurchaseOrdersPage() {
  const pos = useBosResource("purchase-orders");
  const suppliers = useBosResource("suppliers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const openValue = pos.rows.filter((o: any) => !["received", "cancelled"].includes(o.status))
    .reduce((s: number, o: any) => s + Number(o.total), 0);
  const awaiting = pos.rows.filter((o: any) => ["sent", "submitted", "approved"].includes(o.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Orders sent to suppliers"
        icon={<Package className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New PO</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total POs" value={pos.rows.length} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Awaiting Delivery" value={awaiting} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Open Value" value={fmtMoney(openValue)} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Received" value={pos.rows.filter((o: any) => o.status === "received").length} icon={<Package className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New PO" />

      <DataTable
        columns={[
          { header: "PO #", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.poNumber}</span> },
          { header: "Supplier", render: (r: any) => suppliers.rows.find((s: any) => s.id === r.supplierId)?.name || "—" },
          { header: "Total", render: (r: any) => <span className="font-bold">{fmtMoney(r.total, r.currencyCode)}</span> },
          { header: "Expected", render: (r: any) => fmtDate(r.expectedDelivery) },
          { header: "Terms", render: (r: any) => r.paymentTerms || "—" },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
        rows={pos.rows}
        loading={pos.loading}
        empty="No purchase orders yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Purchase Order" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await pos.createRow({
            ...form,
            status: "submitted",
            subtotal: Number(form.total) || 0,
            total: Number(form.total) || 0,
            items: [],
          });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="PO Total (₦)" required><input required type="number" className={inputCls} value={form.total ?? ""} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Supplier">
            <select className={selectCls} value={form.supplierId ?? ""} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">None</option>
              {suppliers.rows.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Payment Terms"><input className={inputCls} placeholder="Net 30" value={form.paymentTerms ?? ""} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} /></Field>
          <Field label="Expected Delivery"><input type="date" className={inputCls} value={form.expectedDelivery ?? ""} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} /></Field>
          <Field label="Shipping Fee (₦)"><input type="number" className={inputCls} value={form.shippingFee ?? 0} onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })} /></Field>
          <Field label="Notes"><input className={inputCls} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create PO</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
