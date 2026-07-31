"use client";

import { useState } from "react";
import { UserCog, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const TYPES = ["full_time", "part_time", "contract", "intern", "temporary"];
const STATUSES = ["active", "on_leave", "terminated", "probation"];

export default function EmployeesPage() {
  const employees = useBosResource("employees");
  const deps = useBosResource("departments");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const active = employees.rows.filter((e: any) => e.status === "active");
  const payroll = employees.rows.filter((e: any) => e.salaryInput != null).reduce((s: number, e: any) => s + Number(e.salaryInput), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resources"
        subtitle="Employees, departments, skills, and payroll inputs"
        icon={<UserCog className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Employee</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={employees.rows.length} icon={<UserCog className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<UserCog className="w-4 h-4" />} />
        <StatCard label="On Leave" value={employees.rows.filter((e: any) => e.status === "on_leave").length} icon={<UserCog className="w-4 h-4" />} />
        <StatCard label="Monthly Payroll" value={fmtMoney(payroll)} icon={<UserCog className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Employee" />

      <DataTable
        columns={[
          { header: "Employee", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.firstName} {r.lastName}</span> },
          { header: "Code", render: (r: any) => <span className="font-mono text-xs">{r.employeeCode || "—"}</span> },
          { header: "Job Title", render: (r: any) => r.jobTitle || "—" },
          { header: "Department", render: (r: any) => deps.rows.find((d: any) => d.id === r.departmentId)?.name || "—" },
          { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.employmentType.replace("_", " ")}</span> },
          { header: "Hired", render: (r: any) => fmtDate(r.hireDate) },
          { header: "Salary", render: (r: any) => r.salaryInput ? fmtMoney(r.salaryInput) : "—" },
          { header: "Skills", render: (r: any) => r.skills?.length ? (
            <div className="flex flex-wrap gap-1">
              {r.skills.slice(0, 3).map((s: string, i: number) => <span key={i} className="px-1.5 py-0.5 rounded bg-kauvex-navy/5 text-[10px] font-semibold text-kauvex-navy">{s}</span>)}
            </div>
          ) : "—" },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
        rows={employees.rows}
        loading={employees.loading}
        empty="No employees yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Employee" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await employees.createRow({ ...form, skills: (form.skills ?? "").split(",").map((s: string) => s.trim()).filter(Boolean) });
          setShow(false);
        }}>
          <Field label="First Name" required><input required className={inputCls} value={form.firstName ?? ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
          <Field label="Last Name" required><input required className={inputCls} value={form.lastName ?? ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Employee Code"><input className={inputCls} value={form.employeeCode ?? ""} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} /></Field>
          <Field label="Job Title"><input className={inputCls} value={form.jobTitle ?? ""} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} /></Field>
          <Field label="Department">
            <select className={selectCls} value={form.departmentId ?? ""} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              <option value="">None</option>
              {deps.rows.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Employment Type">
            <select className={selectCls} value={form.employmentType ?? "full_time"} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Hire Date"><input type="date" className={inputCls} value={form.hireDate ?? ""} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} /></Field>
          <Field label="Salary (monthly)"><input type="number" className={inputCls} value={form.salaryInput ?? ""} onChange={(e) => setForm({ ...form, salaryInput: Number(e.target.value) })} /></Field>
          <Field label="Skills (comma separated)"><input className={inputCls} value={form.skills ?? ""} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
