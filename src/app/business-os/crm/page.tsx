"use client";

import { useState } from "react";
import { Users, Building2, Phone, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const SEGMENTS = ["general", "wholesale", "retail", "premium", "vip", "government", "ngo", "b2b"];
const CUST_TYPES = ["company", "individual"];

export default function CrmPage() {
  const customers = useBosResource("customers");
  const contacts = useBosResource("contacts");
  const [showCustomer, setShowCustomer] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState<any>({});
  const [contactForm, setContactForm] = useState<any>({});
  const [query, setQuery] = useState("");

  const filtered = query
    ? customers.rows.filter((c: any) => (c.name + " " + (c.email || "")).toLowerCase().includes(query.toLowerCase()))
    : customers.rows;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Relationship Management"
        subtitle="Customers, contacts, and account relationships"
        icon={<Users className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShowCustomer(true)}><Plus className="w-4 h-4" /> New Customer</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={customers.rows.length} icon={<Building2 className="w-4 h-4" />} />
        <StatCard label="Companies" value={customers.rows.filter((c: any) => c.customerType === "company").length} icon={<Building2 className="w-4 h-4" />} />
        <StatCard label="Contacts" value={contacts.rows.length} icon={<Phone className="w-4 h-4" />} />
        <StatCard label="Wholesale / B2B" value={customers.rows.filter((c: any) => ["wholesale", "b2b"].includes(c.segment)).length} icon={<Users className="w-4 h-4" />} />
      </div>

      <Toolbar onSearch={setQuery} onNew={() => setShowCustomer(true)} newLabel="New Customer" />

      <DataTable
        columns={[
          { header: "Customer", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
          { header: "Type", render: (r: any) => <span className="capitalize">{r.customerType}</span> },
          { header: "Segment", render: (r: any) => <span className="uppercase text-[11px] font-semibold text-kauvex-orange">{r.segment}</span> },
          { header: "Contact", render: (r: any) => <span>{r.email || "—"}</span> },
          { header: "Phone", render: (r: any) => r.phone || "—" },
          { header: "Credit Limit", render: (r: any) => r.creditLimit ? `₦${Number(r.creditLimit).toLocaleString()}` : "—" },
          { header: "Lifetime Value", render: (r: any) => r.lifetimeValue ? `₦${Number(r.lifetimeValue).toLocaleString()}` : "—" },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Since", render: (r: any) => fmtDate(r.createdAt) },
        ]}
        rows={filtered}
        loading={customers.loading}
        empty="No customers yet"
      />

      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-kauvex-navy">Contacts</h3>
          <button className={btnSecondary} onClick={() => setShowContact(true)}><Plus className="w-4 h-4" /> Add Contact</button>
        </div>
        <DataTable
          columns={[
            { header: "Name", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.firstName} {r.lastName}</span> },
            { header: "Company", render: (r: any) => customers.rows.find((c: any) => c.id === r.customerId)?.name || "—" },
            { header: "Email", render: (r: any) => r.email || "—" },
            { header: "Phone", render: (r: any) => r.phone || "—" },
            { header: "WhatsApp", render: (r: any) => r.whatsapp ? <span className="text-emerald-600 font-medium">{r.whatsapp}</span> : "—" },
            { header: "Job Title", render: (r: any) => r.jobTitle || "—" },
            { header: "Primary", render: (r: any) => r.isPrimary ? <span className="text-xs font-bold text-emerald-600">PRIMARY</span> : "—" },
          ]}
          rows={contacts.rows}
          loading={contacts.loading}
          empty="No contacts yet"
        />
      </div>

      <Modal open={showCustomer} onClose={() => setShowCustomer(false)} title="New Customer" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await customers.createRow(form);
          setShowCustomer(false);
        }}>
          <Field label="Name" required><input required className={inputCls} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Type">
            <select className={selectCls} value={form.customerType ?? "company"} onChange={(e) => setForm({ ...form, customerType: e.target.value })}>
              {CUST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Segment">
            <select className={selectCls} value={form.segment ?? "general"} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
              {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Industry"><input className={inputCls} value={form.industry ?? ""} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Payment Terms"><input className={inputCls} placeholder="Net 30" value={form.paymentTerms ?? ""} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} /></Field>
          <Field label="Credit Limit"><input type="number" className={inputCls} value={form.creditLimit ?? ""} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) })} /></Field>
          <Field label="Tax ID"><input className={inputCls} value={form.taxId ?? ""} onChange={(e) => setForm({ ...form, taxId: e.target.value })} /></Field>
          <Field label="Website"><input className={inputCls} value={form.website ?? ""} onChange={(e) => setForm({ ...form, website: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShowCustomer(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>

      <Modal open={showContact} onClose={() => setShowContact(false)} title="Add Contact">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await contacts.createRow(contactForm);
          setShowContact(false);
        }}>
          <Field label="First Name" required><input required className={inputCls} value={contactForm.firstName ?? ""} onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })} /></Field>
          <Field label="Last Name" required><input required className={inputCls} value={contactForm.lastName ?? ""} onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })} /></Field>
          <Field label="Company">
            <select className={selectCls} value={contactForm.customerId ?? ""} onChange={(e) => setContactForm({ ...contactForm, customerId: e.target.value })}>
              <option value="">None</option>
              {customers.rows.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Job Title"><input className={inputCls} value={contactForm.jobTitle ?? ""} onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={contactForm.email ?? ""} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={contactForm.phone ?? ""} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} /></Field>
          <Field label="WhatsApp"><input className={inputCls} value={contactForm.whatsapp ?? ""} onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })} /></Field>
          <Field label="Primary">
            <select className={selectCls} value={contactForm.isPrimary ? "true" : "false"} onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.value === "true" })}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShowContact(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Add</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
