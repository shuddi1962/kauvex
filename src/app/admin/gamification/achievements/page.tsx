"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus, Trophy, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Achievement {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: string
  threshold: number
  pointsReward: number
  badgeColor: string
  isHidden: boolean
  isActive: boolean
  unlockedCount: number
}

const CATEGORIES = [
  { value: 'orders', label: 'Orders' },
  { value: 'streak', label: 'Check-in Streak' },
  { value: 'referrals', label: 'Referrals' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'social', label: 'Social Shares' },
  { value: 'spending', label: 'Spending' },
]

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [form, setForm] = useState({ code: '', name: '', description: '', category: 'orders', threshold: 1, pointsReward: 50, badgeColor: '#FF6B00', isActive: true, isHidden: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await fetch('/api/v1/admin/gamification/achievements')
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements || [])
      }
    } finally { setLoading(false) }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/gamification/achievements', {
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
    await fetch('/api/v1/admin/gamification/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id, isActive }),
    })
    await load()
  }

  const deleteAchievement = async (id: string) => {
    await fetch('/api/v1/admin/gamification/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    await load()
  }

  const openForm = (ach?: Achievement) => {
    if (ach) {
      setEditing(ach)
      setForm({ code: ach.code, name: ach.name, description: ach.description, category: ach.category, threshold: ach.threshold, pointsReward: ach.pointsReward, badgeColor: ach.badgeColor, isActive: ach.isActive, isHidden: ach.isHidden })
    } else {
      setEditing(null)
      setForm({ code: '', name: '', description: '', category: 'orders', threshold: 1, pointsReward: 50, badgeColor: '#FF6B00', isActive: true, isHidden: false })
    }
    setShowForm(true)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-kauvex-orange" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-kauvex-navy">Achievements</h1>
          <p className="text-sm text-gray-500">Manage achievement badges, thresholds, and point rewards</p>
        </div>
        <Button onClick={() => openForm(undefined)} className="bg-kauvex-orange hover:bg-kauvex-orange/90">
          <Plus size={16} className="mr-1" /> New Achievement
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-lg text-kauvex-navy mb-4">{editing ? 'Edit' : 'New'} Achievement</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Code</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="ten_orders" disabled={!!editing} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="VIP Shopper" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Category</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Threshold</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.threshold} onChange={e => setForm(p => ({ ...p, threshold: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Points Reward</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.pointsReward} onChange={e => setForm(p => ({ ...p, pointsReward: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Badge Color</label>
              <input type="color" className="w-full h-10 border border-border rounded-lg px-1" value={form.badgeColor} onChange={e => setForm(p => ({ ...p, badgeColor: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium block mb-1">Description</label>
            <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Place 10 orders on Kauvex" />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isHidden} onChange={e => setForm(p => ({ ...p, isHidden: e.target.checked }))} />
              Hidden
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={save} disabled={!form.name || !form.code || saving} className="bg-kauvex-navy hover:bg-kauvex-navy/90">
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {editing ? 'Update' : 'Create'} Achievement
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Achievement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Threshold</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Points</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Unlocked</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map(ach => (
                <tr key={ach.id} className="border-b border-border hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ach.badgeColor }} />
                      <span className="text-sm font-medium text-kauvex-navy">{ach.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-5">{ach.description}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{ach.category}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">{ach.threshold}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-kauvex-orange">+{ach.pointsReward}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">{ach.unlockedCount}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(ach.id, !ach.isActive)}>
                      {ach.isActive ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openForm(ach)} className="text-blue-500">Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteAchievement(ach.id)} className="text-red-500"><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
