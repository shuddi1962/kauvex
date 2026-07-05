"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Trophy, TrendingUp, RotateCw, Share2, Users, Loader2, Sparkles, Target, Activity } from 'lucide-react'

interface DashboardStats {
  spinConfigs: number
  prizes: number
  totalSpins: number
  todaySpins: number
  achievements: number
  unlockedAchievements: number
  socialShares: number
  milestones: number
}

export default function AdminGamificationPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/admin/gamification/dashboard')
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-kauvex-orange" />
      </div>
    )
  }

  const cards = [
    { label: 'Spin Configs', value: stats?.spinConfigs ?? 0, icon: Settings, color: 'bg-blue-500', href: '/admin/gamification/spin-wheel' },
    { label: 'Total Prizes', value: stats?.prizes ?? 0, icon: Target, color: 'bg-purple-500', href: '/admin/gamification/spin-wheel' },
    { label: 'Total Spins', value: stats?.totalSpins ?? 0, icon: RotateCw, color: 'bg-kauvex-orange', href: '/admin/gamification/spin-wheel' },
    { label: 'Spins Today', value: stats?.todaySpins ?? 0, icon: Activity, color: 'bg-green-500', href: '/admin/gamification/spin-wheel' },
    { label: 'Achievements', value: stats?.achievements ?? 0, icon: Trophy, color: 'bg-yellow-500', href: '/admin/gamification/achievements' },
    { label: 'Unlocked', value: stats?.unlockedAchievements ?? 0, icon: Sparkles, color: 'bg-emerald-500', href: '/admin/gamification/achievements' },
    { label: 'Social Shares', value: stats?.socialShares ?? 0, icon: Share2, color: 'bg-pink-500', href: '/admin/gamification' },
    { label: 'Milestones', value: stats?.milestones ?? 0, icon: TrendingUp, color: 'bg-indigo-500', href: '/admin/gamification/milestones' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-bold text-2xl text-kauvex-navy">Gamification & Rewards</h1>
        <p className="text-sm text-gray-500 mt-1">Manage spin wheel, achievements, referral milestones, and rewards</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href} className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-2xl font-bold text-kauvex-navy">{card.value}</span>
              </div>
              <p className="text-xs text-gray-500">{card.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/gamification/spin-wheel" className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-kauvex-orange to-yellow-400 flex items-center justify-center mb-4">
            <RotateCw size={24} className="text-white" />
          </div>
          <h3 className="font-semibold text-kauvex-navy mb-1">Spin Wheel</h3>
          <p className="text-sm text-gray-500">Configure prizes, weights, spin limits, and product prizes</p>
        </Link>

        <Link href="/admin/gamification/achievements" className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-4">
            <Trophy size={24} className="text-white" />
          </div>
          <h3 className="font-semibold text-kauvex-navy mb-1">Achievements</h3>
          <p className="text-sm text-gray-500">Manage achievement badges, thresholds, and point rewards</p>
        </Link>

        <Link href="/admin/gamification/milestones" className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h3 className="font-semibold text-kauvex-navy mb-1">Referral Milestones</h3>
          <p className="text-sm text-gray-500">Configure referral reward tiers and payout amounts</p>
        </Link>
      </div>
    </div>
  )
}
