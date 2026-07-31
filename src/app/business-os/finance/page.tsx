"use client";

import { useState } from "react";
import { Banknote, Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const DIRECTIONS = ["receivable", "payable"];
const INV_STATUSES = ["draft", "sent", "partial", "paid", "overdue", "void"];
const GL_TYPES = ["asset", "liability", "equity", "revenue", "expense"];
const JRNL_TYPES = ["debit", "credit"];

export default function FinancePage() {
  const invoices = useBosResource("invoices");
  const journal = useBosResource("journal-entries");
  const accounts = useBosResource("gl-accounts");
  const [tab, setTab] = useState<"invoices" | "journal" | "accounts">("invoices");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const receivable = invoices.rows.filter((i: any) => i.direction === "receivable" && i.status !== "paid");
  const payable = invoices.rows.filter((i: any) => i.direction === "payable" && i.status !== "paid");
  const receivablesTotal = receivable.reduce((s: number, i: any) => s + (Number(i.total) - Number(i.amountPaid)), 0);
  const payablesTotal = payable.reduce((s: number, i: any) => s + (Number(i.total) - Number(i.amountPaid)), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance & Accounting"
        subtitle="Invoices, journal entries, and the chart of accounts"
        icon={<Banknote className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Invoice</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Receivables Due" value={fmtMoney(receivablesTotal)} icon={<ArrowDownLeft className="w-4 h-4" />} hint={`${receivable.length} open`} />
        <StatCard label="Payables Due" value={fmtMoney(payablesTotal)} icon={<ArrowUpRight className="w-4 h-4" />} hint={`${payable.length} open`} />
        <StatCard label="Journal Entries" value={journal.rows.length} icon={<Banknote className="w-4 h-4" />} />
        <StatCard label="GL Accounts" value={accounts.rows.length} icon={<Banknote className="w-4 h-4" />} />
      </div>

      <div className="flex gap-1 bg-white border border-border rounded-lg p-1 w-fit">
        {(["invoices", "journal", "accounts"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors ${tab === t ? "bg-kauvex-navy text-white" : "text-text-3 hover:text-kauvex-navy"}`}>
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {tab === "invoices" && (
        <DataTable
          columns={[
            { header: "Invoice #", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.invoiceNumber}</span> },
            { header: "Direction", render: (r: any) => (
              <span className={`text-xs font-bold ${r.direction === "receivable" ? "text-emerald-600" : "text-red-500"}`}>{r.direction}</span>
            )},
            { header: "Party", render: (r: any) => <span className="font-semibold">{r.partyName}</span> },
            { header: "Total", render: (r: any) => <span className="font-bold">{fmtMoney(r.total, r.currencyCode)}</span> },
            { header: "Paid", render: (r: any) => <span className="text-xs">{fmtMoney(r.amountPaid)}</span> },
            { header: "Due", render: (r: any) => fmtDate(r.dueDate) },
            { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
          rows={invoices.rows}
          loading={invoices.loading}
          empty="No invoices yet"
        />
      )}

      {tab === "journal" && (
        <DataTable
          columns={[
            { header: "Date", render: (r: any) => fmtDate(r.entryDate) },
            { header: "Account", render: (r: any) => accounts.rows.find((a: any) => a.id === r.accountId) ? `${accounts.rows.find((a: any) => a.id === r.accountId).code} — ${accounts.rows.find((a: any) => a.id === r.accountId).name}` : "—" },
            { header: "Type", render: (r: any) => <span className={`text-xs font-bold ${r.entryType === "debit" ? "text-emerald-600" : "text-red-500"}`}>{r.entryType.toUpperCase()}</span> },
            { header: "Amount", render: (r: any) => <span className="font-bold">{fmtMoney(r.amount)}</span> },
            { header: "Reference", render: (r: any) => r.referenceType ? <span className="text-xs">{r.referenceType}</span> : "—" },
            { header: "Description", render: (r: any) => r.description || "—" },
          ]}
          rows={journal.rows}
          loading={journal.loading}
          empty="No journal entries yet"
        />
      )}

      {tab === "accounts" && (
        <DataTable
          columns={[
            { header: "Code", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.code}</span> },
            { header: "Account", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
            { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.accountType}</span> },
            { header: "Opening Balance", render: (r: any) => fmtMoney(r.openingBalance) },
            { header: "Status", render: (r: any) => r.isActive ? <StatusBadge status="active" /> : <StatusBadge status="inactive" /> },
          ]}
          rows={accounts.rows}
          loading={accounts.loading}
          empty="No GL accounts — standard chart of accounts is pre-seeded"
        />
      )}

      <Modal open={show} onClose={() => setShow(false)} title="New Invoice" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await invoices.createRow({ ...form, status: "sent", items: [], subtotal: Number(form.total) || 0 });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Total Amount (₦)" required><input required type="number" className={inputCls} value={form.total ?? ""} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} /></Field>
          </div>
          <Field label="Direction">
            <select className={selectCls} value={form.direction ?? "receivable"} onChange={(e) => setForm({ ...form, direction: e.target.value })}>
              {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Party Name" required><input required className={inputCls} value={form.partyName ?? ""} onChange={(e) => setForm({ ...form, partyName: e.target.value })} /></Field>
          <Field label="Issue Date"><input type="date" className={inputCls} value={form.issueDate ?? ""} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} /></Field>
          <Field label="Due Date"><input type="date" className={inputCls} value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
          <Field label="Tax (₦)"><input type="number" className={inputCls} value={form.tax ?? 0} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} /></Field>
          <Field label="Notes"><input className={inputCls} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create Invoice</button>
          </div>
        </form>
      </Modal>

      <Modal open={show && false} onClose={() => setShow(false)} title="">
        <div />
      </Modal>
    </div>
  );
}
