"use client";

import { useState } from "react";
import { FileText, Plus, CheckCircle2, Send } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const STATUSES = ["draft", "sent", "accepted", "rejected", "expired", "revised", "converted"];

export default function QuotationsPage() {
  const quotes = useBosResource("quotations");
  const customers = useBosResource("customers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});
  const [lines, setLines] = useState<any[]>([]);

  const openTotal = quotes.rows.filter((q: any) => ["draft", "sent"].includes(q.status))
    .reduce((s: number, q: any) => s + Number(q.total), 0);
  const won = quotes.rows.filter((q: any) => ["accepted", "converted"].includes(q.status));

  const computeTotals = () => {
    const subtotal = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
    const discount = Number(form.discount) || 0;
    const tax = Number(form.tax) || 0;
    return { subtotal, total: subtotal - discount + tax };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        subtitle="Estimates, proposals, and price quotations"
        icon={<FileText className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Quotation</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Quotes" value={quotes.rows.length} icon={<FileText className="w-4 h-4" />} />
        <StatCard label="Open Value" value={fmtMoney(openTotal)} icon={<FileText className="w-4 h-4" />} hint="Draft + sent" />
        <StatCard label="Accepted" value={won.length} icon={<CheckCircle2 className="w-4 h-4" />} />
        <StatCard label="Conversion" value={quotes.rows.length ? `${Math.round((won.length / quotes.rows.length) * 100)}%` : "—"} icon={<CheckCircle2 className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Quotation" />

      <DataTable
        columns={[
          { header: "Number", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.quoteNumber}</span> },
          { header: "Title", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.title}</span> },
          { header: "Customer", render: (r: any) => customers.rows.find((c: any) => c.id === r.customerId)?.name || "—" },
          { header: "Total", render: (r: any) => <span className="font-bold">{fmtMoney(r.total, r.currencyCode)}</span> },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Valid Until", render: (r: any) => fmtDate(r.validUntil) },
          { header: "Revision", render: (r: any) => `v${r.revision}` },
        ]}
        rows={quotes.rows}
        loading={quotes.loading}
        empty="No quotations yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Quotation" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          const { subtotal, total } = computeTotals();
          await quotes.createRow({
            ...form, items: lines, subtotal,
            total,
            status: "draft",
          });
          setShow(false);
          setLines([]);
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Customer">
            <select className={selectCls} value={form.customerId ?? ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">None</option>
              {customers.rows.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Valid Until"><input type="date" className={inputCls} value={form.validUntil ?? ""} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} /></Field>

          <div className="col-span-2">
            <p className="text-xs font-semibold text-text-2 mb-1.5">Line Items</p>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${inputCls} flex-1`} placeholder="Description" value={line.description ?? ""}
                    onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, description: e.target.value } : l))} />
                  <input className={`${inputCls} w-24`} type="number" placeholder="Qty" value={line.qty ?? ""}
                    onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, qty: Number(e.target.value) } : l))} />
                  <input className={`${inputCls} w-32`} type="number" placeholder="Unit price" value={line.price ?? ""}
                    onChange={(e) => setLines(lines.map((l, j) => j === i ? { ...l, price: Number(e.target.value) } : l))} />
                  <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} className="px-2 text-red-500 text-sm">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setLines([...lines, {}])} className="text-xs font-semibold text-kauvex-orange">+ Add line item</button>
            </div>
          </div>

          <Field label="Discount (₦)"><input type="number" className={inputCls} value={form.discount ?? 0} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} /></Field>
          <Field label="Tax (₦)"><input type="number" className={inputCls} value={form.tax ?? 0} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} /></Field>
          <div className="col-span-2 flex items-center justify-between">
            <span className="text-sm font-bold text-kauvex-navy">Total: {fmtMoney(computeTotals().total)}</span>
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}><Send className="w-4 h-4" /> Create Quote</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
