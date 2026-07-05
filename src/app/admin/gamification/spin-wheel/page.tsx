"use client"

import { useState, useEffect } from 'react'
import { Loader2, Plus, RotateCw, Trash2, GripVertical, Package, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Prize {
  id: string
  configId: string
  label: string
  type: string
  value: string | null
  points: number
  discountPercent: number | null
  weight: number
  color: string
  productId: string | null
  productName: string | null
  isActive: boolean
}

interface Config {
  id: string
  name: string
  spinsPerDay: number
  costInPoints: number
  isActive: boolean
  prizes: Prize[]
}

const PRIZE_TYPES = [
  { value: 'points', label: 'Points', color: '#F59E0B' },
  { value: 'discount', label: 'Discount %', color: '#8B5CF6' },
  { value: 'free_shipping', label: 'Free Shipping', color: '#10B981' },
  { value: 'product', label: 'Product', color: '#3B82F6' },
  { value: 'bad_luck', label: 'Try Again', color: '#EF4444' },
]

export default function AdminSpinWheelPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [configForm, setConfigForm] = useState({ name: '', spinsPerDay: 3, costInPoints: 0, isActive: true })
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null)
  const [showPrizeForm, setShowPrizeForm] = useState(false)
  const [prizeForm, setPrizeForm] = useState({ label: '', type: 'points', points: 0, discountPercent: '', weight: 10, color: '#F59E0B', productId: '', productName: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const [spins, setSpins] = useState<any[]>([])
  const [showSpins, setShowSpins] = useState(false)

  useEffect(() => {
    loadConfigs()
    loadSpins()
  }, [])

  const loadConfigs = async () => {
    try {
      const res = await fetch('/api/v1/admin/gamification/spin-wheel')
      if (res.ok) {
        const data = await res.json()
        setConfigs(data.configs || [])
      }
    } finally {
      setLoading(false)
    }
  }

  const loadSpins = async () => {
    try {
      const res = await fetch('/api/v1/admin/gamification/spin-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spins-history' }),
      })
      if (res.ok) {
        const data = await res.json()
        setSpins(data.spins || [])
      }
    } catch {}
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/gamification/spin-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-config',
          id: editingConfig?.id,
          ...configForm,
        }),
      })
      if (res.ok) {
        await loadConfigs()
        setShowConfigForm(false)
        setEditingConfig(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const savePrize = async (configId: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/v1/admin/gamification/spin-wheel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-prize',
          id: editingPrize?.id,
          configId,
          label: prizeForm.label,
          type: prizeForm.type,
          points: prizeForm.points,
          discountPercent: prizeForm.discountPercent ? parseFloat(prizeForm.discountPercent) : null,
          weight: prizeForm.weight,
          color: prizeForm.color,
          productId: prizeForm.productId || null,
          productName: prizeForm.productName || null,
          isActive: prizeForm.isActive,
        }),
      })
      if (res.ok) {
        await loadConfigs()
        setShowPrizeForm(false)
        setEditingPrize(null)
      }
    } finally {
      setSaving(false)
    }
  }

  const deletePrize = async (prizeId: string) => {
    await fetch('/api/v1/admin/gamification/spin-wheel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-prize', prizeId }),
    })
    await loadConfigs()
  }

  const openPrizeForm = (prize?: Prize) => {
    if (prize) {
      setEditingPrize(prize)
      setPrizeForm({
        label: prize.label,
        type: prize.type,
        points: prize.points,
        discountPercent: prize.discountPercent?.toString() ?? '',
        weight: prize.weight,
        color: prize.color,
        productId: prize.productId ?? '',
        productName: prize.productName ?? '',
        isActive: prize.isActive,
      })
    } else {
      setEditingPrize(null)
      setPrizeForm({ label: '', type: 'points', points: 0, discountPercent: '', weight: 10, color: '#F59E0B', productId: '', productName: '', isActive: true })
    }
    setShowPrizeForm(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-kauvex-orange" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-kauvex-navy">Spin Wheel Manager</h1>
          <p className="text-sm text-gray-500">Configure spin wheels, prizes, weights, and product rewards</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSpins(!showSpins)} variant="outline">
            <RotateCw size={14} className="mr-1" /> {showSpins ? 'Hide Spins' : 'Spin History'}
          </Button>
          <Button onClick={() => { setEditingConfig(null); setConfigForm({ name: '', spinsPerDay: 3, costInPoints: 0, isActive: true }); setShowConfigForm(true) }} className="bg-kauvex-orange hover:bg-kauvex-orange/90">
            <Plus size={16} className="mr-1" /> New Wheel
          </Button>
        </div>
      </div>

      {showSpins && (
        <div className="bg-white rounded-xl border border-border p-4 mb-6">
          <h3 className="font-semibold text-kauvex-navy mb-3">Recent Spins</h3>
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-gray-500">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Prize</th>
                  <th className="text-right py-2">Points</th>
                  <th className="text-right py-2">Free?</th>
                </tr>
              </thead>
              <tbody>
                {spins.map(s => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="py-1.5 text-gray-600">{new Date(s.spunAt).toLocaleDateString()}</td>
                    <td className="py-1.5 font-medium">{s.prize?.label ?? 'N/A'}</td>
                    <td className="py-1.5 text-right">{s.pointsWon}</td>
                    <td className="py-1.5 text-right">{s.isFree ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfigForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-lg text-kauvex-navy mb-4">{editingConfig ? 'Edit' : 'New'} Spin Wheel</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={configForm.name} onChange={e => setConfigForm(p => ({ ...p, name: e.target.value }))} placeholder="Daily Prize Wheel" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Spins Per Day</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={configForm.spinsPerDay} onChange={e => setConfigForm(p => ({ ...p, spinsPerDay: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Cost in Points</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={configForm.costInPoints} onChange={e => setConfigForm(p => ({ ...p, costInPoints: parseInt(e.target.value) || 0 }))} placeholder="0 = free" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Active</label>
              <button onClick={() => setConfigForm(p => ({ ...p, isActive: !p.isActive }))} className={`px-3 py-2 rounded-lg text-sm font-medium ${configForm.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {configForm.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={saveConfig} disabled={!configForm.name || saving} className="bg-kauvex-navy hover:bg-kauvex-navy/90">
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {editingConfig ? 'Update' : 'Create'} Wheel
            </Button>
            <Button onClick={() => setShowConfigForm(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}

      {showPrizeForm && editingConfig && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h3 className="font-semibold text-lg text-kauvex-navy mb-4">{editingPrize ? 'Edit' : 'New'} Prize</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Label</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={prizeForm.label} onChange={e => setPrizeForm(p => ({ ...p, label: e.target.value }))} placeholder="100 pts" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Type</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={prizeForm.type} onChange={e => setPrizeForm(p => ({ ...p, type: e.target.value, color: PRIZE_TYPES.find(t => t.value === e.target.value)?.color ?? '#666' }))}>
                {PRIZE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Weight (probability)</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={prizeForm.weight} onChange={e => setPrizeForm(p => ({ ...p, weight: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Points (for points type)</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={prizeForm.points} onChange={e => setPrizeForm(p => ({ ...p, points: parseInt(e.target.value) || 0 }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Discount % (for discount type)</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={prizeForm.discountPercent} onChange={e => setPrizeForm(p => ({ ...p, discountPercent: e.target.value }))} placeholder="10" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Color</label>
              <input type="color" className="w-full h-10 border border-border rounded-lg px-1" value={prizeForm.color} onChange={e => setPrizeForm(p => ({ ...p, color: e.target.value }))} />
            </div>
            {prizeForm.type === 'product' && (
              <>
                <div>
                  <label className="text-sm font-medium block mb-1">Product ID</label>
                  <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={prizeForm.productId} onChange={e => setPrizeForm(p => ({ ...p, productId: e.target.value }))} placeholder="prod_xxx" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Product Name</label>
                  <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={prizeForm.productName} onChange={e => setPrizeForm(p => ({ ...p, productName: e.target.value }))} placeholder="iPhone 15 Pro" />
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => savePrize(editingConfig.id)} disabled={!prizeForm.label || saving} className="bg-kauvex-orange hover:bg-kauvex-orange/90">
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {editingPrize ? 'Update' : 'Add'} Prize
            </Button>
            <Button onClick={() => setShowPrizeForm(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}

      {configs.map(config => (
        <div key={config.id} className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              <h3 className="font-semibold text-kauvex-navy">{config.name}</h3>
              <span className="text-xs text-gray-500">{config.spinsPerDay} spins/day</span>
              {config.costInPoints > 0 && <span className="text-xs text-kauvex-orange">{config.costInPoints} pts/spin</span>}
              <span className="text-xs text-gray-400">{config.prizes.length} prizes</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openPrizeForm(undefined)}>
                <Plus size={12} className="mr-1" /> Add Prize
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setEditingConfig(config); setConfigForm({ name: config.name, spinsPerDay: config.spinsPerDay, costInPoints: config.costInPoints, isActive: config.isActive }); setShowConfigForm(true) }}>
                Edit
              </Button>
            </div>
          </div>

          <div className="p-4">
            <h4 className="text-sm font-semibold text-kauvex-navy mb-3 flex items-center gap-2"><Package size={14} /> Prizes</h4>
            <div className="space-y-2">
              {config.prizes.map(prize => {
                const typeInfo = PRIZE_TYPES.find(t => t.value === prize.type)
                return (
                  <div key={prize.id} className={`flex items-center gap-3 p-3 rounded-lg border ${prize.isActive ? 'border-border' : 'border-dashed border-gray-200 bg-gray-50'}`}>
                    <GripVertical size={14} className="text-gray-300" />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: prize.color }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-kauvex-navy">{prize.label}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{prize.type}</span>
                        {!prize.isActive && <span className="text-xs text-gray-400">(disabled)</span>}
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500">
                        {prize.points > 0 && <span>{prize.points} pts</span>}
                        {prize.discountPercent && <span>{prize.discountPercent}% off</span>}
                        {prize.productName && <span>Product: {prize.productName}</span>}
                        <span>Weight: {prize.weight}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => openPrizeForm(prize)} className="text-blue-500">
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deletePrize(prize.id)} className="text-red-500">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )
              })}
              {config.prizes.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No prizes configured yet. Click "Add Prize" to start.</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {configs.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-400">
          <RotateCw size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No spin wheels configured</p>
          <p className="text-sm mt-1">Create your first spin wheel to start</p>
        </div>
      )}
    </div>
  )
}
