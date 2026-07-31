"use client";

import { useState } from "react";
import { Building2, Plus, Users } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const ORG_TYPES = ["company", "subsidiary", "division", "branch", "ngo", "government", "educational", "healthcare", "sole_proprietor"];
const UNIT_TYPES = ["department", "division", "branch", "cost_center", "business_unit", "team"];
const ROLES = ["owner", "admin", "manager", "member", "viewer"];

export default function OrganizationPage() {
  const orgs = useBosResource("organizations");
  const deps = useBosResource("departments");
  const members = useBosResource("members");

  const [showOrg, setShowOrg] = useState(false);
  const [showDept, setShowDept] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [orgForm, setOrgForm] = useState<any>({});
  const [deptForm, setDeptForm] = useState<any>({});
  const [memberForm, setMemberForm] = useState<any>({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization"
        subtitle="Company profile, structure, departments, and team access"
        icon={<Building2 className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShowOrg(true)}><Plus className="w-4 h-4" /> New Company</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Companies" value={orgs.rows.length} icon={<Building2 className="w-4 h-4" />} />
        <StatCard label="Departments" value={deps.rows.length} icon={<Building2 className="w-4 h-4" />} />
        <StatCard label="Team Members" value={members.rows.length} icon={<Users className="w-4 h-4" />} />
        <StatCard label="Units" value={deps.rows.filter((d: any) => d.unitType !== "department").length} icon={<Users className="w-4 h-4" />} />
      </div>

      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-bold text-kauvex-navy mb-4">Company Structure</h3>
        <DataTable
          columns={[
            { header: "Name", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
            { header: "Legal Name", render: (r: any) => r.legalName || "—" },
            { header: "Type", render: (r: any) => <span className="capitalize">{r.orgType}</span> },
            { header: "Industry", render: (r: any) => r.industry || "—" },
            { header: "Registration", render: (r: any) => r.registrationNumber || "—" },
            { header: "Plan", render: (r: any) => <StatusBadge status={r.plan} /> },
            { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
            { header: "Created", render: (r: any) => fmtDate(r.createdAt) },
          ]}
          rows={orgs.rows}
          loading={orgs.loading}
          empty="No companies yet — create your first company"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-kauvex-navy">Departments & Units</h3>
            <button className={btnSecondary} onClick={() => setShowDept(true)}><Plus className="w-4 h-4" /> Add</button>
          </div>
          <DataTable
            columns={[
              { header: "Name", render: (r: any) => <span className="font-semibold text-kauvex-navy">{r.name}</span> },
              { header: "Type", render: (r: any) => <span className="capitalize">{r.unitType}</span> },
              { header: "Code", render: (r: any) => r.code || "—" },
              { header: "Budget", render: (r: any) => r.budget ? `₦${Number(r.budget).toLocaleString()}` : "—" },
              { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
            ]}
            rows={deps.rows}
            loading={deps.loading}
            empty="No departments yet"
          />
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-kauvex-navy">Team Members</h3>
            <button className={btnSecondary} onClick={() => setShowMember(true)}><Plus className="w-4 h-4" /> Add</button>
          </div>
          <DataTable
            columns={[
              { header: "Role", render: (r: any) => <span className="font-semibold text-kauvex-navy capitalize">{r.memberRole}</span> },
              { header: "Job Title", render: (r: any) => r.jobTitle || "—" },
              { header: "Department", render: (r: any) => deps.rows.find((d: any) => d.id === r.departmentId)?.name || "—" },
              { header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
            ]}
            rows={members.rows}
            loading={members.loading}
            empty="No members yet"
          />
        </div>
      </div>

      <Modal open={showOrg} onClose={() => setShowOrg(false)} title="New Company">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await orgs.createRow(orgForm);
          setShowOrg(false);
        }}>
          <Field label="Company Name" required><input required className={inputCls} value={orgForm.name ?? ""} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} /></Field>
          <Field label="Legal Name"><input className={inputCls} value={orgForm.legalName ?? ""} onChange={(e) => setOrgForm({ ...orgForm, legalName: e.target.value })} /></Field>
          <Field label="Type" required>
            <select className={selectCls} value={orgForm.orgType ?? "company"} onChange={(e) => setOrgForm({ ...orgForm, orgType: e.target.value })}>
              {ORG_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Industry"><input className={inputCls} value={orgForm.industry ?? ""} onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })} /></Field>
          <Field label="Registration Number"><input className={inputCls} value={orgForm.registrationNumber ?? ""} onChange={(e) => setOrgForm({ ...orgForm, registrationNumber: e.target.value })} /></Field>
          <Field label="Tax ID"><input className={inputCls} value={orgForm.taxId ?? ""} onChange={(e) => setOrgForm({ ...orgForm, taxId: e.target.value })} /></Field>
          <Field label="Contact Email"><input type="email" className={inputCls} value={orgForm.contactEmail ?? ""} onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })} /></Field>
          <Field label="Contact Phone"><input className={inputCls} value={orgForm.contactPhone ?? ""} onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShowOrg(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Create</button>
          </div>
        </form>
      </Modal>

      <Modal open={showDept} onClose={() => setShowDept(false)} title="Add Department">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await deps.createRow(deptForm);
          setShowDept(false);
        }}>
          <Field label="Name" required><input required className={inputCls} value={deptForm.name ?? ""} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} /></Field>
          <Field label="Type">
            <select className={selectCls} value={deptForm.unitType ?? "department"} onChange={(e) => setDeptForm({ ...deptForm, unitType: e.target.value })}>
              {UNIT_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </Field>
          <Field label="Code"><input className={inputCls} value={deptForm.code ?? ""} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} /></Field>
          <Field label="Budget"><input type="number" className={inputCls} value={deptForm.budget ?? ""} onChange={(e) => setDeptForm({ ...deptForm, budget: Number(e.target.value) })} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShowDept(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Add</button>
          </div>
        </form>
      </Modal>

      <Modal open={showMember} onClose={() => setShowMember(false)} title="Add Team Member">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await members.createRow(memberForm);
          setShowMember(false);
        }}>
          <Field label="User ID" required><input required className={inputCls} placeholder="Supabase user id" value={memberForm.userId ?? ""} onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })} /></Field>
          <Field label="Role">
            <select className={selectCls} value={memberForm.memberRole ?? "member"} onChange={(e) => setMemberForm({ ...memberForm, memberRole: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Job Title"><input className={inputCls} value={memberForm.jobTitle ?? ""} onChange={(e) => setMemberForm({ ...memberForm, jobTitle: e.target.value })} /></Field>
          <Field label="Department">
            <select className={selectCls} value={memberForm.departmentId ?? ""} onChange={(e) => setMemberForm({ ...memberForm, departmentId: e.target.value })}>
              <option value="">None</option>
              {deps.rows.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShowMember(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Add</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
