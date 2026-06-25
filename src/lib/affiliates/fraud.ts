export const FRAUD_THRESHOLDS = {
  maxClicksPerHour: 100,
  maxClicksPerIpPerDay: 10,
  minClickToOrderSeconds: 60,
  suspiciousReturnRate: 0.3,
  maxDailyClickPerAffiliate: 500,
}

export interface FraudCheckResult {
  isFraudulent: boolean
  confidence: number
  reasons: string[]
}

export function checkSelfClick(clickIpHash: string, partnerIpHash: string): boolean {
  return clickIpHash === partnerIpHash
}

export function checkClickVelocity(clicksInLastHour: number): FraudCheckResult {
  const reasons: string[] = []
  let confidence = 0

  if (clicksInLastHour > FRAUD_THRESHOLDS.maxClicksPerHour) {
    confidence = Math.min(1, (clicksInLastHour - FRAUD_THRESHOLDS.maxClicksPerHour) / FRAUD_THRESHOLDS.maxClicksPerHour)
    reasons.push(`Click rate ${clicksInLastHour}/hr exceeds threshold of ${FRAUD_THRESHOLDS.maxClicksPerHour}`)
  }

  if (clicksInLastHour > FRAUD_THRESHOLDS.maxDailyClickPerAffiliate / 24) {
    const dailyProjected = clicksInLastHour * 24
    if (dailyProjected > FRAUD_THRESHOLDS.maxDailyClickPerAffiliate) {
      confidence = Math.max(confidence, 0.5)
      reasons.push(`Projected daily clicks ${dailyProjected} exceeds limit of ${FRAUD_THRESHOLDS.maxDailyClickPerAffiliate}`)
    }
  }

  return {
    isFraudulent: confidence >= 0.5,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
  }
}

export function checkIpClustering(clickIps: string[]): FraudCheckResult {
  const reasons: string[] = []
  const ipCount = clickIps.length
  const uniqueIps = new Set(clickIps).size
  let confidence = 0

  if (ipCount > 0 && uniqueIps === 1) {
    confidence = 0.6
    reasons.push('All clicks originate from a single IP address')
  } else if (ipCount > 0) {
    const ratio = uniqueIps / ipCount
    if (ratio < 0.3) {
      confidence = 0.5
      reasons.push(`Low IP diversity: ${uniqueIps} unique IPs across ${ipCount} clicks`)
    }
  }

  return {
    isFraudulent: confidence >= 0.5,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
  }
}

export function checkClickToOrderRatio(clicks: number, orders: number): FraudCheckResult {
  const reasons: string[] = []
  let confidence = 0

  if (orders === 0 && clicks > 0) {
    confidence = 0.3
    reasons.push('No conversions from any clicks')
  } else if (orders > 0 && clicks > 0) {
    const ratio = clicks / orders
    if (ratio > 50) {
      confidence = Math.min(1, (ratio - 50) / 100)
      reasons.push(`Click-to-order ratio of ${ratio.toFixed(1)}:1 exceeds threshold of 50:1`)
    }
  }

  return {
    isFraudulent: confidence >= 0.5,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
  }
}

export function checkReturnRate(returnedItems: number, totalItems: number): FraudCheckResult {
  const reasons: string[] = []
  let confidence = 0

  if (totalItems === 0) {
    return { isFraudulent: false, confidence: 0, reasons: [] }
  }

  const rate = returnedItems / totalItems

  if (rate >= FRAUD_THRESHOLDS.suspiciousReturnRate) {
    confidence = Math.min(1, (rate - FRAUD_THRESHOLDS.suspiciousReturnRate) / 0.5)
    reasons.push(`Return rate of ${(rate * 100).toFixed(1)}% exceeds threshold of ${FRAUD_THRESHOLDS.suspiciousReturnRate * 100}%`)
  }

  return {
    isFraudulent: confidence >= 0.5,
    confidence: Math.round(confidence * 100) / 100,
    reasons,
  }
}
