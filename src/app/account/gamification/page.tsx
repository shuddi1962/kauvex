"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  Trophy, Flame, RotateCw, Share2, MessageCircle,
  Hash, Globe, Mail, CheckCircle2, Lock, Loader2,
  TrendingUp, Users, Award, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CheckInStatus {
  checkedInToday: boolean
  currentStreak: number
  pointsEarnedToday: number
  totalPoints: number
  weekDays: { date: string; dayName: string; checkedIn: boolean; bonusDay: boolean }[]
  nextReward: number
  nextBonusIn: number
}

interface SpinStatus {
  active: boolean
  spinsRemaining: number
  spinsPerDay: number
  costInPoints: number
  prizes: { id: string; label: string; type: string; value: string | null; points: number; discountPercent: number | null; color: string; weight: number }[]
}

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
  progress: number
  unlocked: boolean
  unlockedAt: string | null
}

interface ShareStats {
  totalShares: number
  todayShares: number
  dailyLimit: number
  totalPointsEarned: number
}

interface Milestone {
  id: string
  referralsRequired: number
  label: string
  rewardType: string
  rewardValue: number
  rewardLabel: string
  unlocked: boolean
  claimed: boolean
}

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('streak')
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState<CheckInStatus | null>(null)
  const [spin, setSpin] = useState<SpinStatus | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [shareStats, setShareStats] = useState<ShareStats | null>(null)
  const [milestones, setMilestones] = useState<{ referralCount: number; milestones: Milestone[] } | null>(null)

  const [spinning, setSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<{ prize: any; spinsRemaining: number } | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)
  const [sharingPlatform, setSharingPlatform] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    try {
      const [checkInRes, spinRes, achievementsRes, shareRes, milestonesRes] = await Promise.all([
        fetch('/api/v1/gamification/daily-checkin'),
        fetch('/api/v1/gamification/spin-wheel'),
        fetch('/api/v1/gamification/achievements'),
        fetch('/api/v1/gamification/social-share'),
        fetch('/api/v1/referral-milestones'),
      ])

      if (checkInRes.ok) setCheckIn(await checkInRes.json())
      if (spinRes.ok) setSpin(await spinRes.json())
      if (achievementsRes.ok) {
        const data = await achievementsRes.json()
        setAchievements(data.achievements)
        setUnlockedCount(data.unlockedCount)
      }
      if (shareRes.ok) setShareStats(await shareRes.json())
      if (milestonesRes.ok) setMilestones(await milestonesRes.json())
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const res = await fetch('/api/v1/gamification/daily-checkin', { method: 'POST' })
      if (res.ok) {
        const result = await res.json()
        setCheckIn(prev => prev ? { ...prev, checkedInToday: true, currentStreak: result.streakDay, pointsEarnedToday: result.pointsEarned } : prev)
      }
    } finally {
      setCheckingIn(false)
    }
  }

  const handleSpin = async () => {
    setSpinning(true)
    setSpinResult(null)
    try {
      const res = await fetch('/api/v1/gamification/spin-wheel', { method: 'POST' })
      if (res.ok) {
        const result = await res.json()
        setSpinResult(result)
        setSpin(prev => prev ? { ...prev, spinsRemaining: result.spinsRemaining } : prev)
      }
    } finally {
      setSpinning(false)
    }
  }

  const handleShare = async (platform: string) => {
    setSharingPlatform(platform)
    try {
      await fetch('/api/v1/gamification/social-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType: 'referral', platform }),
      })
      setShareStats(prev => prev ? { ...prev, todayShares: prev.todayShares + 1, totalShares: prev.totalShares + 1, totalPointsEarned: prev.totalPointsEarned + 10 } : prev)
    } finally {
      setSharingPlatform(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-kauvex-orange" />
      </div>
    )
  }

  const tabs = [
    { id: 'streak', label: 'Daily Streak', icon: Flame },
    { id: 'spin', label: 'Spin & Win', icon: RotateCw },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'share', label: 'Share & Earn', icon: Share2 },
    { id: 'milestones', label: 'Milestones', icon: TrendingUp },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-kauvex-navy">Rewards & Gamification</h1>
          <p className="text-sm text-gray-500 mt-1">Earn points, unlock achievements, and win prizes</p>
        </div>
        <div className="flex items-center gap-2 bg-kauvex-orange/10 rounded-xl px-4 py-2">
          <Sparkles size={18} className="text-kauvex-orange" />
          <span className="font-bold text-kauvex-orange">{checkIn?.totalPoints ?? 0}</span>
          <span className="text-xs text-gray-500">pts</span>
        </div>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto hide-scrollbar bg-white rounded-xl border border-border p-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-kauvex-navy text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'streak' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-kauvex-navy via-kauvex-navy to-orange-900 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Flame size={20} className="text-kauvex-orange" />
                  <span className="text-sm text-white/60 font-medium">Daily Streak</span>
                </div>
                <h2 className="font-bold text-3xl">{checkIn?.currentStreak ?? 0} Day Streak</h2>
                <p className="text-white/70 text-sm mt-1">
                  {checkIn?.checkedInToday ? 'Come back tomorrow to continue!' : 'Check in today to start or continue your streak'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-kauvex-orange">{checkIn?.pointsEarnedToday ?? 0}</div>
                <div className="text-xs text-white/60">pts today</div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {checkIn?.weekDays.map((day) => (
                <div key={day.date} className="text-center">
                  <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-sm font-bold mb-1 ${
                    day.checkedIn
                      ? day.bonusDay
                        ? 'bg-kauvex-orange text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {day.checkedIn ? <CheckCircle2 size={18} /> : <span className="text-xs">{day.dayName[0]}</span>}
                  </div>
                  <div className="text-[10px] text-white/50">{day.dayName}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">
                Next bonus day in <span className="font-bold text-kauvex-orange">{checkIn?.nextBonusIn ?? 7}</span> days
              </div>
              <Button
                onClick={handleCheckIn}
                disabled={checkIn?.checkedInToday || checkingIn}
                className={checkIn?.checkedInToday ? 'bg-green-500 hover:bg-green-600' : 'bg-kauvex-orange hover:bg-kauvex-orange/90'}
              >
                {checkingIn ? <Loader2 size={16} className="animate-spin" /> : null}
                {checkIn?.checkedInToday ? 'Checked In ✓' : 'Check In Now'}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-kauvex-navy mb-4 flex items-center gap-2"><Trophy size={18} /> Streak Rewards</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 14, 30, 60, 90, 180, 365].map((day) => {
                const points = day <= 7 ? [5, 10, 15, 20, 25, 30, 50][day - 1] || 50 : day * 2
                const isUnlocked = (checkIn?.currentStreak ?? 0) >= day
                const isBonusDay = day % 7 === 0
                return (
                  <div key={day} className={`text-center p-3 rounded-xl border ${
                    isUnlocked ? 'bg-green-50 border-green-200' : isBonusDay ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-1 ${
                      isUnlocked ? 'bg-green-500' : isBonusDay ? 'bg-kauvex-orange' : 'bg-gray-300'
                    }`}>
                      {isUnlocked ? <CheckCircle2 size={14} className="text-white" /> : <Lock size={14} className="text-white" />}
                    </div>
                    <div className="text-xs font-bold">{isBonusDay ? `Day ${day}🔥` : `Day ${day}`}</div>
                    <div className="text-[10px] text-gray-500">{isBonusDay ? `${points}x2 pts` : `${points} pts`}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spin' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 md:p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-kauvex-orange to-yellow-400 flex items-center justify-center mx-auto mb-4">
                <RotateCw size={36} className="text-white" />
              </div>
              <h2 className="font-bold text-2xl text-kauvex-navy mb-2">Spin & Win</h2>
              <p className="text-gray-500 text-sm">
                {spin?.active
                  ? `${spin.spinsRemaining} spin${spin.spinsRemaining !== 1 ? 's' : ''} remaining today`
                  : 'No active wheel right now'}
              </p>
            </div>

            {spinResult && (
              <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="font-bold text-lg text-green-700 mb-1">You won!</h3>
                <p className="text-green-600 font-semibold text-xl">{spinResult.prize.label}</p>
                {spinResult.prize.points > 0 && (
                  <p className="text-sm text-green-500 mt-1">+{spinResult.prize.points} points earned</p>
                )}
                {spinResult.prize.discountPercent && (
                  <p className="text-sm text-green-500 mt-1">{spinResult.prize.discountPercent}% discount on next order</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 mb-6 max-w-md mx-auto">
              {spin?.prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="text-center p-2 rounded-xl"
                  style={{ backgroundColor: prize.color + '20', borderColor: prize.color, borderWidth: 1 }}
                >
                  <div className="text-xs font-bold" style={{ color: prize.color }}>{prize.label}</div>
                  {prize.points > 0 && <div className="text-[10px] text-gray-500">+{prize.points}pts</div>}
                </div>
              ))}
            </div>

            <Button
              onClick={handleSpin}
              disabled={spinning || !spin?.active || (spin?.spinsRemaining ?? 0) <= 0}
              className="bg-gradient-to-r from-kauvex-orange to-yellow-500 hover:from-kauvex-orange/90 hover:to-yellow-500/90 text-white px-8 py-3 text-lg"
            >
              {spinning ? <Loader2 size={20} className="animate-spin mr-2" /> : <RotateCw size={20} className="mr-2" />}
              {spinning ? 'Spinning...' : 'SPIN!'}
            </Button>

            {spin?.costInPoints && spin.costInPoints > 0 && (
              <p className="text-xs text-gray-400 mt-2">Costs {spin.costInPoints} points per spin</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-kauvex-navy flex items-center gap-2"><Trophy size={18} /> Achievements</h3>
              <div className="text-sm text-gray-500">{unlockedCount} / {achievements.length} unlocked</div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    ach.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: ach.unlocked ? ach.badgeColor + '20' : '#f3f4f6' }}
                  >
                    {ach.unlocked ? <Trophy size={24} style={{ color: ach.badgeColor }} /> : <Lock size={20} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-kauvex-navy">{ach.name}</p>
                    <p className="text-xs text-gray-500 truncate">{ach.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min((ach.progress / ach.threshold) * 100, 100)}%`,
                            backgroundColor: ach.unlocked ? '#22c55e' : ach.badgeColor,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {ach.unlocked ? 'Done!' : `${ach.progress}/${ach.threshold}`}
                      </span>
                    </div>
                  </div>
                  {ach.unlocked && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-kauvex-navy flex items-center gap-2"><Share2 size={18} /> Share & Earn</h3>
                <p className="text-sm text-gray-500 mt-1">Share Kauvex with friends and earn 10 points per share</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-kauvex-navy">{shareStats?.todayShares ?? 0} / {shareStats?.dailyLimit ?? 5}</div>
                <div className="text-xs text-gray-400">shares today</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { platform: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500' },
                { platform: 'twitter', label: 'Twitter', icon: Hash, color: 'bg-blue-400' },
                { platform: 'facebook', label: 'Facebook', icon: Globe, color: 'bg-blue-600' },
                { platform: 'email', label: 'Email', icon: Mail, color: 'bg-gray-600' },
                { platform: 'instagram', label: 'Instagram', icon: CameraIcon, color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
                { platform: 'tiktok', label: 'TikTok', icon: MusicIcon, color: 'bg-black' },
              ].map(({ platform, label, icon: Icon, color }) => (
                <button
                  key={platform}
                  onClick={() => handleShare(platform)}
                  disabled={sharingPlatform === platform || (shareStats?.todayShares ?? 0) >= (shareStats?.dailyLimit ?? 5)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-kauvex-orange hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-kauvex-navy">{label}</span>
                  <span className="text-xs text-kauvex-orange font-medium">+10 pts</span>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-kauvex-navy">Total Points from Sharing</p>
                  <p className="text-xs text-gray-500">{shareStats?.totalShares ?? 0} shares</p>
                </div>
                <div className="text-2xl font-bold text-kauvex-orange">+{shareStats?.totalPointsEarned ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-kauvex-navy flex items-center gap-2"><TrendingUp size={18} /> Referral Milestones</h3>
                <p className="text-sm text-gray-500 mt-1">{milestones?.referralCount ?? 0} referrals completed</p>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-kauvex-navy">{milestones?.referralCount ?? 0}</span>
              </div>
            </div>

            <div className="space-y-3">
              {milestones?.milestones.map((ms, index) => {
                const isReached = (milestones.referralCount ?? 0) >= ms.referralsRequired
                return (
                  <div
                    key={ms.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      ms.claimed ? 'bg-green-50 border-green-200' : isReached ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      ms.claimed ? 'bg-green-500' : isReached ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      <Award size={22} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-kauvex-navy">{ms.label}</p>
                        {ms.claimed && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Claimed</span>}
                        {isReached && !ms.claimed && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Ready!</span>}
                      </div>
                      <p className="text-xs text-gray-500">{ms.referralsRequired} referrals needed</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-kauvex-orange">{ms.rewardLabel}</div>
                      <Button
                        size="sm"
                        variant={ms.claimed ? 'outline' : 'default'}
                        disabled={!isReached || ms.claimed}
                        className={ms.claimed ? 'border-green-200 text-green-600' : ''}
                      >
                        {ms.claimed ? 'Claimed' : isReached ? 'Claim' : `${ms.referralsRequired - (milestones?.referralCount ?? 0)} more`}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CameraIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="6" width="20" height="14" rx="2" ry="2"/><circle cx="12" cy="13" r="3"/><path d="M17 6V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2"/></svg> }
function MusicIcon(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> }
