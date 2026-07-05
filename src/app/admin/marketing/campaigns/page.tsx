"use client"

import { useState, useEffect } from 'react'
import { Plus, Send, Loader2, BarChart3, Bell, Mail, Smartphone, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Campaign {
  id: string
  name: string
  channel: string
  trigger: string
  status: string
  sentCount: number
  openedCount: number
  clickedCount: number
  createdAt: string
}

export default function AdminMarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', channel: 'push', title: '', body: '',
    targetSegment: 'all', scheduledAt: '', deepLink: '',
  })
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/v1/marketing/campaigns')
        if (res.ok) {
          const data = await res.json()
          setCampaigns(data.campaigns)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const createCampaign = async () => {
    try {
      const res = await fetch('/api/v1/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data: form }),
      })
      if (res.ok) {
        const data = await res.json()
        setCampaigns(prev => [data.campaign, ...prev])
        setShowCreate(false)
        setForm({ name: '', description: '', channel: 'push', title: '', body: '', targetSegment: 'all', scheduledAt: '', deepLink: '' })
      }
    } catch {}
  }

  const sendCampaign = async (campaignId: string, targetSegment: string) => {
    setSending(campaignId)
    try {
      await fetch('/api/v1/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', campaignId, targetSegment }),
      })
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status: 'sent' } : c))
    } finally {
      setSending(null)
    }
  }

  const channelIcon: Record<string, any> = {
    push: Bell, email: Mail, sms: Smartphone, in_app: Globe,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-kauvex-navy">Marketing Campaigns</h1>
          <p className="text-sm text-gray-500">Create and send push, email, SMS, and in-app notifications</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-kauvex-orange hover:bg-kauvex-orange/90">
          <Plus size={16} className="mr-1" /> New Campaign
        </Button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold text-lg text-kauvex-navy mb-4">Create Campaign</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-kauvex-navy block mb-1">Campaign Name</label>
              <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Flash Sale Alert" />
            </div>
            <div>
              <label className="text-sm font-medium text-kauvex-navy block mb-1">Channel</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>
                <option value="push">Push Notification</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in_app">In-App</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-kauvex-navy block mb-1">Target Segment</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.targetSegment} onChange={e => setForm(p => ({ ...p, targetSegment: e.target.value }))}>
                <option value="all">All Customers</option>
                <option value="active">Active (last 30 days)</option>
                <option value="lapsed">Lapsed (60+ days)</option>
                <option value="high_value">High Value (Gold+)</option>
                <option value="new">New (last 30 days)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-kauvex-navy block mb-1">Schedule (optional)</label>
              <input type="datetime-local" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-kauvex-navy block mb-1">Title</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Big Sale: Up to 50% Off!" />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-kauvex-navy block mb-1">Body</label>
            <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm" rows={3} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Shop the biggest sale of the year..." />
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-kauvex-navy block mb-1">Deep Link (optional)</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={form.deepLink} onChange={e => setForm(p => ({ ...p, deepLink: e.target.value }))} placeholder="/deals" />
          </div>
          <div className="flex gap-2 mt-6">
            <Button onClick={createCampaign} disabled={!form.name || !form.title || !form.body} className="bg-kauvex-navy hover:bg-kauvex-navy/90">
              Create Campaign
            </Button>
            <Button onClick={() => setShowCreate(false)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-kauvex-orange" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Campaign</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Channel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Sent</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Opened</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Clicked</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const ChannelIcon = channelIcon[c.channel] || Bell
                  return (
                    <tr key={c.id} className="border-b border-border hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-kauvex-navy">{c.name}</p>
                        <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ChannelIcon size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 capitalize">{c.channel}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          c.status === 'sent' ? 'bg-green-50 text-green-700' :
                          c.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                          c.status === 'draft' ? 'bg-gray-50 text-gray-600' :
                          'bg-red-50 text-red-700'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{c.sentCount}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{c.openedCount}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{c.clickedCount}</td>
                      <td className="px-4 py-3 text-right">
                        {c.status === 'draft' && (
                          <Button size="sm" onClick={() => sendCampaign(c.id, 'all')} disabled={sending === c.id} className="bg-kauvex-orange hover:bg-kauvex-orange/90">
                            {sending === c.id ? <Loader2 size={12} className="animate-spin mr-1" /> : <Send size={12} className="mr-1" />}
                            Send
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                      No campaigns yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
