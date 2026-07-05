"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus, TrendingUp, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Milestone {
  id: string
  referralsRequired: number
  label: string
  rewardType: string
  rewardValue: number
  rewardLabel: string
  isActive: boolean
}

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Milestone | null>(null)
  const [form, setForm] = useState({ referralsRequired: 1, label: '', rewardType: 'points', rewardValue: 0, rewardLabel: '', isActive: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/v1/admin/gamification/milestones')
      if (res.ok) {
        const data = await res.json()
        setMilestones(data.milestones || [])
      }
    } finally { setLoading(false) }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/gamification/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', id: editing?.id, ...form }),
      })
      if (res.ok) {
        await load()
        setShowForm(false)
        setEditing(null)
      }
    } finally { setSaving(false) }
  }

  const toggle = async (id: string, isActive: boolean) => {
    await fetch('/api/v1/admin/gamification/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id, isActive }),
    })
    await load()
  }

  const deleteMilestone = async (id: string) => {
    await fetch('/api/v1/admin/gamification/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    await load()
  }

  const openForm = (ms?: Milestone) => {
    if (ms) {
      setEditing(ms)
      setForm({ referralsRequired: ms.referralsRequired, label: ms.label, rewardType: ms.rewardType, rewardValue: ms.rewardValue, rewardLabel: ms.rewardLabel, isActive: ms.isActive })
    } else {
      setEditing(null)
      setForm({ referralsRequired: 1, label: '', rewardType: 'points', rewardValue: 0, rewardLabel: '', isActive: true })
    }
    setShowForm(true)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-kauvex-orange" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-kauvex-navy">Referral Milestones</h1>
          <p className="text-sm text-gray-500">Configure referral reward tiers and payout amounts</p>
        </div>
        <Button onClick={() => openForm(undefined)} className="bg-kauvex-orange hover:bg-kauvex-orange/90">
          <Plus size={16} className="mr-1" /> New Milestone
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-lg text-kauvex-navy mb-4">{editing ? 'Edit' : 'New'} Milestone</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Referrals Required</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.referralsRequired} onChange={e => setForm(p => ({ ...p, referralsRequired: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Label</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="10 Referrals" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Reward Type</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.rewardType} onChange={e => setForm(p => ({ ...p, rewardType: e.target.value }))}>
                <option value="points">Points</option>
                <option value="wallet">Wallet Credit</option>
                <option value="discount">Discount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Reward Value</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.rewardValue} onChange={e => setForm(p => ({ ...p, rewardValue: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Display Label</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.rewardLabel} onChange={e => setForm(p => ({ ...p, rewardLabel: e.target.value }))} placeholder="₦1,500 wallet" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={save} disabled={!form.label || !form.rewardLabel || saving} className="bg-kauvex-navy hover:bg-kauvex-navy/90">
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {editing ? 'Update' : 'Create'} Milestone
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {milestones.map(ms => (
          <div key={ms.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${ms.isActive ? 'border-border' : 'border-dashed border-gray-200 bg-gray-50'}`}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-kauvex-navy">{ms.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{ms.referralsRequired} referrals</span>
                {!ms.isActive && <span className="text-xs text-gray-400">(disabled)</span>}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {ms.rewardType === 'wallet' ? 'Wallet Credit' : ms.rewardType === 'points' ? 'Points' : ms.rewardType === 'discount' ? 'Discount' : 'Free Shipping'} — {ms.rewardLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(ms.id, !ms.isActive)}>
                {ms.isActive ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-gray-300" />}
              </button>
              <Button size="sm" variant="ghost" onClick={() => openForm(ms)} className="text-blue-500">Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => deleteMilestone(ms.id)} className="text-red-500"><Trash2 size={14} /></Button>
            </div>
          </div>
        ))}
        {milestones.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No referral milestones configured</p>
          </div>
        )}
      </div>
    </div>
  )
}
