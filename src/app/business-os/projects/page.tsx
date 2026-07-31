"use client";

import { useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const TYPES = ["construction", "marine", "dredging", "manufacturing", "printing", "fashion", "energy", "it", "furniture", "other"];
const STATUSES = ["planning", "in_progress", "on_hold", "completed", "cancelled", "disputed"];

export default function ProjectsPage() {
  const projects = useBosResource("projects");
  const customers = useBosResource("customers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const active = projects.rows.filter((p: any) => p.status === "in_progress");
  const budget = projects.rows.reduce((s: number, p: any) => s + Number(p.budget || 0), 0);
  const spent = projects.rows.reduce((s: number, p: any) => s + Number(p.spent || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Phases, milestones, budgets, risks, and team tracking"
        icon={<FolderOpen className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Project</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.rows.length} icon={<FolderOpen className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<FolderOpen className="w-4 h-4" />} />
        <StatCard label="Budget" value={fmtMoney(budget)} icon={<FolderOpen className="w-4 h-4" />} />
        <StatCard label="Spent" value={fmtMoney(spent)} icon={<FolderOpen className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Project" />

      <DataTable
        columns={[
          { header: "Project", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.projectName}</span> },
          { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.projectType || "other"}</span> },
          { header: "Customer", render: (r: any) => customers.rows.find((c: any) => c.id === r.customerId)?.name || "—" },
          { header: "Progress", render: (r: any) => (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-kauvex-orange rounded-full" style={{ width: `${Math.min(100, Number(r.progressPercent))}%` }} />
              </div>
              <span className="text-xs font-semibold">{r.progressPercent}%</span>
            </div>
          )},
          { header: "Budget / Spent", render: (r: any) => <span className="text-xs">{fmtMoney(r.spent)} / {fmtMoney(r.budget)}</span> },
          { header: "Timeline", render: (r: any) => <span className="text-xs">{fmtDate(r.startDate)} → {fmtDate(r.endDate)}</span> },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
        rows={projects.rows}
        loading={projects.loading}
        empty="No projects yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Project" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await projects.createRow({ ...form, status: "planning", milestones: [], risks: [] });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Project Name" required><input required className={inputCls} value={form.projectName ?? ""} onChange={(e) => setForm({ ...form, projectName: e.target.value })} /></Field>
          </div>
          <Field label="Type">
            <select className={selectCls} value={form.projectType ?? "other"} onChange={(e) => setForm({ ...form, projectType: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Customer">
            <select className={selectCls} value={form.customerId ?? ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">None</option>
              {customers.rows.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Start Date"><input type="date" className={inputCls} value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End Date"><input type="date" className={inputCls} value={form.endDate ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <Field label="Budget"><input type="number" className={inputCls} value={form.budget ?? ""} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })} /></Field>
          <Field label="Manager"><input className={inputCls} value={form.managerId ?? ""} onChange={(e) => setForm({ ...form, managerId: e.target.value })} /></Field>
          <Field label="Description"><input className={inputCls} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
