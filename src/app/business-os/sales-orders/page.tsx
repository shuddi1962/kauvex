"use client";

import { useState } from "react";
import { ShoppingCart, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const STATUSES = ["draft", "confirmed", "fulfilled", "invoiced", "cancelled", "completed"];
const PAYMENT = ["unpaid", "partial", "paid"];

export default function SalesOrdersPage() {
  const orders = useBosResource("sales-orders");
  const customers = useBosResource("customers");
  const quotes = useBosResource("quotations");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const openValue = orders.rows.filter((o: any) => !["cancelled", "completed"].includes(o.status))
    .reduce((s: number, o: any) => s + Number(o.total), 0);
  const unpaid = orders.rows.filter((o: any) => o.paymentStatus !== "paid").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle="Orders from customers — convert quotations or create directly"
        icon={<ShoppingCart className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Order</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={orders.rows.length} icon={<ShoppingCart className="w-4 h-4" />} />
        <StatCard label="Open Value" value={fmtMoney(openValue)} icon={<ShoppingCart className="w-4 h-4" />} />
        <StatCard label="Unpaid" value={unpaid} icon={<ShoppingCart className="w-4 h-4" />} />
        <StatCard label="Completed" value={orders.rows.filter((o: any) => o.status === "completed").length} icon={<ShoppingCart className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Order" />

      <DataTable
        columns={[
          { header: "Order #", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.orderNumber}</span> },
          { header: "Customer", render: (r: any) => customers.rows.find((c: any) => c.id === r.customerId)?.name || "—" },
          { header: "Date", render: (r: any) => fmtDate(r.orderDate) },
          { header: "Total", render: (r: any) => <span className="font-bold">{fmtMoney(r.total, r.currencyCode)}</span> },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Payment", render: (r: any) => <StatusBadge status={r.paymentStatus} /> },
          { header: "Delivery", render: (r: any) => fmtDate(r.deliveryDate) },
        ]}
        rows={orders.rows}
        loading={orders.loading}
        empty="No sales orders yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Sales Order" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await orders.createRow({ ...form, status: "confirmed", items: [], subtotal: Number(form.total) || 0, total: Number(form.total) || 0 });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Order Total (₦)" required><input required type="number" className={inputCls} value={form.total ?? ""} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Customer">
            <select className={selectCls} value={form.customerId ?? ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">None</option>
              {customers.rows.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="From Quotation">
            <select className={selectCls} value={form.quotationId ?? ""} onChange={(e) => setForm({ ...form, quotationId: e.target.value })}>
              <option value="">None</option>
              {quotes.rows.filter((q: any) => q.status === "accepted").map((q: any) => <option key={q.id} value={q.id}>{q.quoteNumber} — {fmtMoney(q.total)}</option>)}
            </select>
          </Field>
          <Field label="Payment Status">
            <select className={selectCls} value={form.paymentStatus ?? "unpaid"} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}>
              {PAYMENT.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Delivery Date"><input type="date" className={inputCls} value={form.deliveryDate ?? ""} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} /></Field>
          <Field label="Notes"><input className={inputCls} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create Order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
