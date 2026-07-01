import prisma from "@/lib/db";

export interface WafRule {
  id: string;
  path: string;
  condition: string;
  action: "allow" | "block" | "challenge";
  description?: string;
}

// In-memory rules (would be loaded from DB in production)
const CUSTOM_RULES: WafRule[] = [];

const KNOWN_ATTACK_PATTERNS = [
  { pattern: /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, type: "sql_injection", name: "SQL Injection" },
  { pattern: /<script[\s>]|javascript:|onerror=|onload=|eval\(|document\.cookie/i, type: "xss", name: "XSS" },
  { pattern: /\.\.\//g, type: "path_traversal", name: "Path Traversal" },
  { pattern: /\/etc\/passwd|\/etc\/shadow|\/proc\/self/i, type: "path_traversal", name: "System File Access" },
  { pattern: /union\s+select|insert\s+into|drop\s+table|delete\s+from/i, type: "sql_injection", name: "SQL Injection" },
  { pattern: /exec\(|system\(|passthru\(|shell_exec\(/i, type: "command_injection", name: "Command Injection" },
];

const MALICIOUS_BOTS = [
  "sqlmap", "nikto", "nessus", "openvas", "masscan", "zgrab",
  "gobuster", "dirbuster", "wfuzz", "ffuf", "nuclei",
];

export function detectAttackPatterns(
  path: string,
  query: string,
  body: string,
  userAgent: string
): { isAttack: boolean; attackType: string; attackName: string } | null {
  const combined = `${path} ${query} ${body}`;

  for (const rule of KNOWN_ATTACK_PATTERNS) {
    if (rule.pattern.test(combined)) {
      return { isAttack: true, attackType: rule.type, attackName: rule.name };
    }
  }

  // Check user agent for known malicious tools
  const uaLower = userAgent.toLowerCase();
  for (const bot of MALICIOUS_BOTS) {
    if (uaLower.includes(bot)) {
      return { isAttack: true, attackType: "scanner", attackName: `Malicious scanner: ${bot}` };
    }
  }

  return null;
}

export async function logBlockedRequest(
  ip: string,
  path: string,
  reason: string,
  attackType: string,
  countryCode?: string,
  userAgent?: string
) {
  return prisma.kv_sec_blocked_request.create({
    data: {
      ipAddress: ip,
      requestPath: path,
      blockReason: reason,
      attackType,
      countryCode: countryCode ?? null,
      userAgent: userAgent ?? null,
    },
  });
}

export async function getBlockedRequests(limit = 100) {
  return prisma.kv_sec_blocked_request.findMany({
    orderBy: { blockedAt: "desc" },
    take: limit,
  });
}

export async function getFirewallStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalToday, sqlInjectionToday, xssToday, scannerToday] = await Promise.all([
    prisma.kv_sec_blocked_request.count({ where: { blockedAt: { gte: todayStart } } }),
    prisma.kv_sec_blocked_request.count({ where: { blockedAt: { gte: todayStart }, attackType: "sql_injection" } }),
    prisma.kv_sec_blocked_request.count({ where: { blockedAt: { gte: todayStart }, attackType: "xss" } }),
    prisma.kv_sec_blocked_request.count({ where: { blockedAt: { gte: todayStart }, attackType: "scanner" } }),
  ]);

  // Top attack types (last 7 days)
  const recentBlocks = await prisma.kv_sec_blocked_request.findMany({
    where: { blockedAt: { gte: weekAgo } },
    select: { attackType: true, countryCode: true },
  });

  const attackTypeCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};
  for (const block of recentBlocks) {
    attackTypeCounts[block.attackType] = (attackTypeCounts[block.attackType] || 0) + 1;
    if (block.countryCode) {
      countryCounts[block.countryCode] = (countryCounts[block.countryCode] || 0) + 1;
    }
  }

  const topAttackTypes = Object.entries(attackTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return {
    totalToday,
    sqlInjectionToday,
    xssToday,
    scannerToday,
    topAttackTypes,
    topCountries,
  };
}
