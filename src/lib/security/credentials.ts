import prisma from "@/lib/db";

export type CredentialAction = "created" | "rotated" | "viewed" | "revoked";

export interface CredentialInfo {
  name: string;
  environment: string;
  lastRotated?: Date;
  lastViewedBy?: string;
  rotationStatus: "ok" | "warning" | "overdue";
}

const KNOWN_CREDENTIALS = [
  { name: "SUPABASE_SERVICE_ROLE_KEY", environment: "Supabase" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", environment: "Supabase" },
  { name: "PAYSTACK_SECRET_KEY", environment: "Paystack" },
  { name: "PAYSTACK_PUBLIC_KEY", environment: "Paystack" },
  { name: "CF_API_TOKEN", environment: "Cloudflare" },
  { name: "CLOUDFLARE_R2_ACCESS_KEY", environment: "Cloudflare R2" },
  { name: "CLOUDFLARE_R2_SECRET_KEY", environment: "Cloudflare R2" },
  { name: "SMILE_IDENTITY_API_KEY", environment: "Smile Identity" },
  { name: "ONFIDO_API_TOKEN", environment: "Onfido" },
  { name: "SENTRY_AUTH_TOKEN", environment: "Sentry" },
  { name: "TWILIO_AUTH_TOKEN", environment: "Twilio" },
  { name: "TERMII_API_KEY", environment: "Termii" },
  { name: "RESEND_API_KEY", environment: "Resend" },
  { name: "VIRUSTOTAL_API_KEY", environment: "VirusTotal" },
  { name: "SIGHTENGINE_API_SECRET", environment: "Sightengine" },
  { name: "OPENROUTER_API_KEY", environment: "OpenRouter" },
  { name: "STRIPE_SECRET_KEY", environment: "Stripe" },
];

export async function logCredentialAction(
  credentialName: string,
  action: CredentialAction,
  performedBy: string,
  notes?: string
) {
  return prisma.kv_sec_credential_audit.create({
    data: {
      credentialName,
      action,
      performedBy,
      notes: notes ?? null,
    },
  });
}

export async function getCredentialStatuses(): Promise<CredentialInfo[]> {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const auditRecords = await prisma.kv_sec_credential_audit.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return KNOWN_CREDENTIALS.map((cred) => {
    const rotations = auditRecords.filter(
      (r) => r.credentialName === cred.name && r.action === "rotated"
    );
    const views = auditRecords.filter(
      (r) => r.credentialName === cred.name && r.action === "viewed"
    );

    const lastRotated = rotations[0]?.createdAt;
    const lastViewedBy = views[0]?.performedBy;

    let rotationStatus: "ok" | "warning" | "overdue" = "ok";
    if (!lastRotated || lastRotated < ninetyDaysAgo) {
      rotationStatus = "overdue";
    } else if (lastRotated < new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)) {
      rotationStatus = "warning";
    }

    return {
      name: cred.name,
      environment: cred.environment,
      lastRotated,
      lastViewedBy,
      rotationStatus,
    };
  });
}

export async function getCredentialAuditLog(credentialName?: string, limit = 50) {
  const where: any = {};
  if (credentialName) where.credentialName = credentialName;
  return prisma.kv_sec_credential_audit.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
