"use client";

import { useEffect, useState } from "react";
import { UserCog, Plus, Pause, Play } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useKaiResource, StatusBadge } from "@/components/kai-ecosystem/shared";

export default function KaiEmployeesPage() {
  const employees = useKaiResource("employees");
  const [agents, setAgents] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch("/api/v1/kai-ecosystem/employees")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setAgents(j.data.agents ?? []);
      })
      .catch(() => {});
  }, []);

  const toggle = async (id: string, status: string) => {
    await fetch(`/api/v1/kai-ecosystem/employees/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await employees.fetchRows();
  };

  const active = employees.rows.filter((e: any) => e.status === "active");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Employees"
        subtitle="Deploy AI employees that assist your human staff — not replace them"
        icon={<UserCog className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> Deploy Employee</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Deployed" value={employees.rows.length} icon={<UserCog className="w-4 h-4" />} />
        <StatCard label="Active" value={active.length} icon={<Play className="w-4 h-4" />} />
        <StatCard label="On Leave" value={employees.rows.filter((e: any) => e.status === "paused").length} icon={<Pause className="w-4 h-4" />} />
        <StatCard label="Roles" value={new Set(employees.rows.map((e: any) => e.role)).size} icon={<UserCog className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="Deploy" />

      <DataTable
        columns={[
          { header: "Name", render: (r: any) => (
            <span className="font-semibold text-kauvex-navy flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-black">
                {r.name.slice(0, 2).toUpperCase()}
              </span>
              {r.name}
            </span>
          )},
          { header: "Role", render: (r: any) => <span className="text-xs">{r.role}</span> },
          { header: "Powered By", render: (r: any) => {
            const agent = agents.find((a: any) => a.code === r.agentCode);
            return <span className="text-xs text-text-2">{agent?.name ?? r.agentCode}</span>;
          }},
          { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
          { header: "Deployed", render: (r: any) => fmtDate(r.createdAt) },
          { header: "", render: (r: any) => (
            <button onClick={() => toggle(r.id, r.status === "active" ? "paused" : "active")} className="text-xs font-semibold text-kauvex-orange hover:underline inline-flex items-center gap-1">
              {r.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />} {r.status === "active" ? "Pause" : "Activate"}
            </button>
          )},
        ]}
        rows={employees.rows}
        loading={employees.loading}
        empty="No digital employees yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="Deploy Digital Employee">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await employees.createRow(form);
          setShow(false);
          setForm({});
        }}>
          <Field label="Name" required><input required className={inputCls} placeholder="e.g. Sales Manager AI" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Role" required><input required className={inputCls} placeholder="e.g. Sales Manager" value={form.role ?? ""} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
          <div className="col-span-2">
            <Field label="Powered By Agent">
              <select className={selectCls} value={form.agentCode ?? ""} onChange={(e) => setForm({ ...form, agentCode: e.target.value })}>
                <option value="">Select an agent…</option>
                {agents.map((a: any) => <option key={a.code} value={a.code}>{a.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Assistant Context (optional)"><textarea rows={3} className={inputCls} placeholder="e.g. Focus on the Lagos territory, escalate deals above $10k" value={form.assistantContext ?? ""} onChange={(e) => setForm({ ...form, assistantContext: e.target.value })} /></Field>
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Deploy</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
