"use client";

import { useState } from "react";
import { Brain, Plus, Pin, PinOff } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useKaiResource, StatusBadge } from "@/components/kai-ecosystem/shared";

const SCOPES = ["general", "products", "customers", "projects", "designs", "approvals", "suppliers", "workflows", "brand", "preferences", "terminology"];

export default function KaiMemoryPage() {
  const memory = useKaiResource("memory");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const togglePin = async (row: any) => {
    await memory.updateRow(row.id, { pinned: !row.pinned });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="KAI Memory"
        subtitle="KAI remembers your business — context stays isolated per organization"
        icon={<Brain className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> Add Memory</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Memory Entries" value={memory.rows.length} icon={<Brain className="w-4 h-4" />} />
        <StatCard label="Pinned" value={memory.rows.filter((m: any) => m.pinned).length} icon={<Pin className="w-4 h-4" />} />
        <StatCard label="Scopes" value={new Set(memory.rows.map((m: any) => m.scope)).size} icon={<Brain className="w-4 h-4" />} />
        <StatCard label="Sources" value={new Set(memory.rows.map((m: any) => m.source ?? "manual")).size} icon={<Brain className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="Add Memory" />

      <DataTable
        columns={[
          { header: "Key", render: (r: any) => (
            <span className="font-semibold text-kauvex-navy flex items-center gap-1.5">
              {r.key} {r.pinned && <Pin className="w-3 h-3 text-kauvex-orange" />}
            </span>
          )},
          { header: "Value", render: (r: any) => <span className="text-xs text-text-2 max-w-[300px] block truncate">{r.value}</span> },
          { header: "Scope", render: (r: any) => <span className="capitalize text-xs">{r.scope}</span> },
          { header: "Source", render: (r: any) => <span className="capitalize text-xs">{r.source ?? "manual"}</span> },
          { header: "Updated", render: (r: any) => fmtDate(r.updatedAt) },
          { header: "", render: (r: any) => (
            <button onClick={() => togglePin(r)} className="text-xs font-semibold text-kauvex-orange hover:underline inline-flex items-center gap-1">
              {r.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />} {r.pinned ? "Unpin" : "Pin"}
            </button>
          )},
        ]}
        rows={memory.rows}
        loading={memory.loading}
        empty="No memory entries yet — teach KAI about your business"
      />

      <Modal open={show} onClose={() => setShow(false)} title="Add Memory">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await memory.createRow(form);
          setShow(false);
          setForm({});
        }}>
          <Field label="Key" required><input required className={inputCls} placeholder="e.g. brand.colors" value={form.key ?? ""} onChange={(e) => setForm({ ...form, key: e.target.value })} /></Field>
          <Field label="Scope">
            <select className={selectCls} value={form.scope ?? "general"} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
              {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Value" required><textarea required rows={3} className={inputCls} value={form.value ?? ""} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
          </div>
          <Field label="Pinned">
            <select className={selectCls} value={form.pinned ? "true" : "false"} onChange={(e) => setForm({ ...form, pinned: e.target.value === "true" })}>
              <option value="false">No</option><option value="true">Yes</option>
            </select>
          </Field>
          <Field label="Source">
            <select className={selectCls} value={form.source ?? "manual"} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              <option value="manual">Manual</option>
              <option value="orchestrator">Orchestrator</option>
              <option value="integration">Integration</option>
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Save Memory</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
