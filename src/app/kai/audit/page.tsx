"use client";

import { ShieldCheck } from "lucide-react";
import { PageHeader, StatCard, DataTable, Toolbar, fmtDate, useKaiResource } from "@/components/kai-ecosystem/shared";

export default function KaiAuditPage() {
  const audit = useKaiResource("audit");

  const actionCounts = audit.rows.reduce((acc: Record<string, number>, r: any) => {
    acc[r.action] = (acc[r.action] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety & Audit"
        subtitle="Every KAI action is logged — role-based permissions keep humans in control"
        icon={<ShieldCheck className="w-5 h-5" />}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Logged Actions" value={audit.rows.length} icon={<ShieldCheck className="w-4 h-4" />} />
        <StatCard label="Distinct Actions" value={Object.keys(actionCounts).length} icon={<ShieldCheck className="w-4 h-4" />} />
        <StatCard label="Agent Installs" value={actionCounts["install_agent"] ?? 0} icon={<ShieldCheck className="w-4 h-4" />} />
        <StatCard label="Decisions Logged" value={(actionCounts["create_decision"] ?? 0) + (actionCounts["decide"] ?? 0)} icon={<ShieldCheck className="w-4 h-4" />} />
      </div>

      <Toolbar onSearch={() => {}} />

      <DataTable
        columns={[
          { header: "Action", render: (r: any) => <span className="font-semibold text-kauvex-navy text-xs">{r.action.replace(/_/g, " ")}</span> },
          { header: "Resource", render: (r: any) => <span className="font-mono text-[11px]">{r.resource ?? "—"}</span> },
          { header: "User", render: (r: any) => r.userId ? <span className="font-mono text-[11px]">{r.userId.slice(0, 8)}</span> : "—" },
          { header: "Details", render: (r: any) => (
            <span className="text-[11px] text-text-3 block max-w-[220px] truncate">{JSON.stringify(r.detail ?? {})}</span>
          )},
          { header: "When", render: (r: any) => fmtDate(r.createdAt) },
        ]}
        rows={audit.rows}
        loading={audit.loading}
        empty="No KAI actions logged yet"
      />
    </div>
  );
}
