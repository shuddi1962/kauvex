"use client";

import { useState } from "react";
import { CalendarClock, Plus, Play, CheckCircle2 } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, fmtMoney, useBosResource, StatusBadge } from "@/components/business-os/shared";

const TYPES = ["installation", "maintenance", "repair", "inspection", "site_survey", "commissioning", "emergency"];
const STATUSES = ["scheduled", "assigned", "en_route", "on_site", "in_progress", "completed", "cancelled", "disputed"];
const WINDOWS = ["morning", "afternoon", "evening"];

export default function WorkOrdersPage() {
  const orders = useBosResource("work-orders");
  const customers = useBosResource("customers");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const open = orders.rows.filter((o: any) => !["completed", "cancelled", "disputed"].includes(o.status));
  const emergency = orders.rows.filter((o: any) => o.jobType === "emergency" && o.status !== "completed");
  const revenue = orders.rows.filter((o: any) => o.status === "completed").reduce((s: number, o: any) => s + Number(o.jobCost || 0), 0);

  const advance = async (wo: any) => {
    const flow = ["scheduled", "assigned", "en_route", "on_site", "in_progress", "completed"];
    const idx = flow.indexOf(wo.status);
    if (idx < 0 || idx >= flow.length - 1) return;
    const next = flow[idx + 1];
    await orders.updateRow(wo.id, {
      status: next,
      startedAt: next === "in_progress" ? new Date().toISOString() : wo.startedAt,
      completedAt: next === "completed" ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Service"
        subtitle="Installations, maintenance, repairs, inspections, and site surveys"
        icon={<CalendarClock className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Work Order</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Work Orders" value={orders.rows.length} icon={<CalendarClock className="w-4 h-4" />} />
        <StatCard label="Open" value={open.length} icon={<Play className="w-4 h-4" />} />
        <StatCard label="Emergency" value={emergency.length} icon={<CalendarClock className="w-4 h-4" />} />
        <StatCard label="Job Revenue" value={fmtMoney(revenue)} icon={<CheckCircle2 className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Work Order" />

      <DataTable
        columns={[
          { header: "WO #", render: (r: any) => <span className="font-mono text-xs font-semibold text-kauvex-navy">{r.workOrderNumber}</span> },
          { header: "Job", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.title}</span> },
          { header: "Type", render: (r: any) => <span className="capitalize text-xs">{r.jobType.replace("_", " ")}</span> },
          { header: "Customer", render: (r: any) => customers.rows.find((c: any) => c.id === r.customerId)?.name || "—" },
          { header: "Scheduled", render: (r: any) => <span className="text-xs">{fmtDate(r.scheduledDate)} <span className="capitalize text-text-3">{r.scheduledTimeWindow || ""}</span></span> },
          { header: "Technician", render: (r: any) => r.technicianId ? <span className="font-mono text-xs">{r.technicianId.slice(0, 8)}</span> : "—" },
          { header: "Job Cost", render: (r: any) => r.jobCost ? fmtMoney(r.jobCost) : "—" },
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "", render: (r: any) => (
            !["completed", "cancelled", "disputed"].includes(r.status) ? (
              <button onClick={() => advance(r)} className="text-xs font-semibold text-kauvex-orange hover:underline">Advance →</button>
            ) : null
          )},
        ]}
        rows={orders.rows}
        loading={orders.loading}
        empty="No work orders yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Work Order" wide>
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await orders.createRow({ ...form, status: "scheduled", checklist: [], sparePartsUsed: [] });
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Job Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <Field label="Job Type">
            <select className={selectCls} value={form.jobType ?? "maintenance"} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Customer">
            <select className={selectCls} value={form.customerId ?? ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
              <option value="">None</option>
              {customers.rows.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Scheduled Date"><input type="date" className={inputCls} value={form.scheduledDate ?? ""} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} /></Field>
          <Field label="Time Window">
            <select className={selectCls} value={form.scheduledTimeWindow ?? ""} onChange={(e) => setForm({ ...form, scheduledTimeWindow: e.target.value })}>
              <option value="">Any</option>
              {WINDOWS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Technician"><input className={inputCls} value={form.technicianId ?? ""} onChange={(e) => setForm({ ...form, technicianId: e.target.value })} /></Field>
          <Field label="Estimated Job Cost"><input type="number" className={inputCls} value={form.jobCost ?? ""} onChange={(e) => setForm({ ...form, jobCost: Number(e.target.value) })} /></Field>
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
