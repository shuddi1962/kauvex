import prisma from '@/lib/db'

export interface FraudRule {
  field: string
  operator: 'gt' | 'lt' | 'eq' | 'neq' | 'contains' | 'in'
  threshold: unknown
  score: number
  label: string
}

export interface FraudAssessment {
  riskScore: number
  maxScore: number
  flags: string[]
  recommendation: 'approve' | 'review' | 'block'
  ruleMatches: { rule: string; score: number }[]
}

export interface OrderData {
  id?: string
  total: number
  customerId?: string
  shippingAddress?: Record<string, unknown> | null
  billingAddress?: Record<string, unknown> | null
  createdAt?: Date | string
  paymentMethod?: string
}

export interface CustomerData {
  id?: string
  email?: string
  phone?: string
  createdAt?: Date | string
  ipAddress?: string
}

const TEMP_EMAIL_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.com',
  '10minutemail.com', 'yopmail.com', 'sharklasers.com', 'trashmail.com',
  'temp-mail.org', 'fakeinbox.com', 'mailnator.com',
]

const HIGH_RISK_COUNTRIES = [
  'NG', 'RU', 'UA', 'PK', 'BD', 'VN', 'IR', 'KP', 'SY', 'MM', 'CU', 'VE',
]

export const DEFAULT_FRAUD_RULES: FraudRule[] = [
  {
    field: 'order.total',
    operator: 'gt',
    threshold: 1000,
    score: 20,
    label: 'Order > $1000 from new account',
  },
  {
    field: 'order.shippingVsBilling',
    operator: 'neq',
    threshold: true,
    score: 15,
    label: 'Shipping != billing address',
  },
  {
    field: 'customer.multipleCardsSameAddress',
    operator: 'gt',
    threshold: 0,
    score: 25,
    label: 'Multiple orders same address different cards',
  },
  {
    field: 'order.rapidFire',
    operator: 'lt',
    threshold: 5,
    score: 30,
    label: 'Rapid-fire orders in < 5 minutes',
  },
  {
    field: 'customer.emailDomain',
    operator: 'in',
    threshold: TEMP_EMAIL_DOMAINS,
    score: 20,
    label: 'Email domain is temp/disposable',
  },
  {
    field: 'customer.ipCountry',
    operator: 'in',
    threshold: HIGH_RISK_COUNTRIES,
    score: 15,
    label: 'IP from high-risk country',
  },
  {
    field: 'customer.phone',
    operator: 'eq',
    threshold: null,
    score: 10,
    label: 'Phone number invalid format',
  },
]

function evaluateRule(rule: FraudRule, order: OrderData, customer: CustomerData): boolean {
  switch (rule.field) {
    case 'order.total': {
      const total = Number(order.total)
      const threshold = Number(rule.threshold)
      return rule.operator === 'gt' ? total > threshold : total < threshold
    }
    case 'order.shippingVsBilling': {
      if (!order.shippingAddress || !order.billingAddress) return false
      const shipStr = JSON.stringify(order.shippingAddress)
      const billStr = JSON.stringify(order.billingAddress)
      return shipStr !== billStr
    }
    case 'customer.multipleCardsSameAddress': {
      return false
    }
    case 'order.rapidFire': {
      if (!customer.createdAt || !order.createdAt) return false
      const accountAge = new Date(order.createdAt).getTime() - new Date(customer.createdAt).getTime()
      const thresholdMs = Number(rule.threshold) * 60 * 1000
      return rule.operator === 'lt' ? accountAge < thresholdMs : accountAge > thresholdMs
    }
    case 'customer.emailDomain': {
      if (!customer.email) return false
      const domain = customer.email.split('@')[1]?.toLowerCase()
      const domains = rule.threshold as string[]
      return domains.includes(domain || '')
    }
    case 'customer.ipCountry': {
      return false
    }
    case 'customer.phone': {
      if (!customer.phone) return false
      const phoneRegex = /^\+?[1-9]\d{6,14}$/
      return !phoneRegex.test(customer.phone)
    }
    default:
      return false
  }
}

export async function evaluateOrderRisk(
  order: OrderData,
  customer: CustomerData
): Promise<FraudAssessment> {
  const ruleMatches: { rule: string; score: number }[] = []
  let riskScore = 0
  const maxScore = DEFAULT_FRAUD_RULES.reduce((sum, r) => sum + r.score, 0)

  for (const rule of DEFAULT_FRAUD_RULES) {
    try {
      if (evaluateRule(rule, order, customer)) {
        riskScore += rule.score
        ruleMatches.push({ rule: rule.label, score: rule.score })
      }
    } catch {
      continue
    }
  }

  const flags = ruleMatches.map((r) => r.rule)

  let recommendation: 'approve' | 'review' | 'block'
  const ratio = riskScore / maxScore
  if (ratio < 0.2) {
    recommendation = 'approve'
  } else if (ratio < 0.5) {
    recommendation = 'review'
  } else {
    recommendation = 'block'
  }

  return { riskScore, maxScore, flags, recommendation, ruleMatches }
}

export async function checkCustomerHistory(customerId: string) {
  const flags = await prisma.fraudFlag.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const openFlags = flags.filter((f) => f.status === 'open')

  return {
    hasHistory: flags.length > 0,
    totalFlags: flags.length,
    openFlags: openFlags.length,
    flags,
    riskLevel: openFlags.length > 2 ? 'high' : openFlags.length > 0 ? 'medium' : 'low',
  }
}

export async function flagOrder(
  orderId: string,
  riskScore: number,
  reason: string,
  metadata?: Record<string, unknown>
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error(`Order ${orderId} not found`)

  return prisma.fraudFlag.create({
    data: {
      orderId,
      customerId: order.customerId ?? undefined,
      vendorId: order.vendorId ?? undefined,
      flagType: 'automated',
      riskScore,
      reason,
      metadata: (metadata ?? {}) as any,
      status: 'open',
    },
  })
}

export async function reviewFlag(
  flagId: string,
  reviewerId: string,
  action: 'approve' | 'dismiss' | 'escalate'
) {
  const flag = await prisma.fraudFlag.findUnique({ where: { id: flagId } })
  if (!flag) throw new Error(`FraudFlag ${flagId} not found`)

  return prisma.fraudFlag.update({
    where: { id: flagId },
    data: {
      status: action === 'approve' ? 'confirmed' : action === 'dismiss' ? 'dismissed' : 'escalated',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      actionTaken: action,
    },
  })
}
