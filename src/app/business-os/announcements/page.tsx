"use client";

import { useState } from "react";
import { Megaphone, Plus, Pin } from "lucide-react";
import { PageHeader, StatCard, DataTable, Modal, Field, Toolbar, inputCls, selectCls, btnPrimary, btnSecondary, fmtDate, useBosResource, StatusBadge } from "@/components/business-os/shared";

const AUDIENCES = ["all", "department", "role", "team"];

export default function AnnouncementsPage() {
  const announcements = useBosResource("announcements");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({});

  const pinned = announcements.rows.filter((a: any) => a.pinned);
  const byAudience = new Map<string, number>();
  announcements.rows.forEach((a: any) => byAudience.set(a.audience, (byAudience.get(a.audience) || 0) + 1));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Company-wide and targeted team communications"
        icon={<Megaphone className="w-5 h-5" />}
        actions={<button className={btnPrimary} onClick={() => setShow(true)}><Plus className="w-4 h-4" /> New Announcement</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Announcements" value={announcements.rows.length} icon={<Megaphone className="w-4 h-4" />} />
        <StatCard label="Pinned" value={pinned.length} icon={<Pin className="w-4 h-4" />} />
        <StatCard label="Audiences" value={byAudience.size} icon={<Megaphone className="w-4 h-4" />} />
        <StatCard label="This Week" value={announcements.rows.filter((a: any) => new Date(a.publishedAt) > new Date(Date.now() - 7 * 86400000)).length} icon={<Megaphone className="w-4 h-4" />} />
      </div>

      <Toolbar onNew={() => setShow(true)} newLabel="New Announcement" />

      <DataTable
        columns={[
          { header: "Title", render: (r: any) => (
            <span className="font-semibold text-kauvex-navy flex items-center gap-1.5">
              {r.title} {r.pinned && <Pin className="w-3 h-3 text-kauvex-orange" />}
            </span>
          )},
          { header: "Content", render: (r: any) => <span className="text-xs text-text-3 truncate max-w-[280px] block">{r.content}</span> },
          { header: "Audience", render: (r: any) => <span className="capitalize text-xs">{r.audience}</span> },
          { header: "Published", render: (r: any) => fmtDate(r.publishedAt) },
          { header: "Author", render: (r: any) => r.authorId ? <span className="font-mono text-xs">{r.authorId.slice(0, 8)}</span> : "—" },
        ]}
        rows={announcements.rows}
        loading={announcements.loading}
        empty="No announcements yet"
      />

      <Modal open={show} onClose={() => setShow(false)} title="New Announcement">
        <form className="grid grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          await announcements.createRow(form);
          setShow(false);
        }}>
          <div className="col-span-2">
            <Field label="Title" required><input required className={inputCls} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          </div>
          <div className="col-span-2">
            <Field label="Content" required><textarea required rows={4} className={inputCls} value={form.content ?? ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Field>
          </div>
          <Field label="Audience">
            <select className={selectCls} value={form.audience ?? "all"} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Pinned">
            <select className={selectCls} value={form.pinned ? "true" : "false"} onChange={(e) => setForm({ ...form, pinned: e.target.value === "true" })}>
              <option value="false">No</option><option value="true">Yes</option>
            </select>
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setShow(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Post</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
