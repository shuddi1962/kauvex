import prisma from "@/lib/db";

export type VerificationProvider = "smile_identity" | "onfido" | "persona";
export type VerificationStatus = "pending" | "passed" | "failed" | "manual_review";
export type RoleType = "vendor" | "logistics_partner" | "manufacturer" | "supplier" | "customer" | "affiliate";

const SMILE_IDENTITY_API_KEY = process.env.SMILE_IDENTITY_API_KEY || "";
const SMILE_IDENTITY_PARTNER_ID = process.env.SMILE_IDENTITY_PARTNER_ID || "";
const ONFIDO_API_TOKEN = process.env.ONFIDO_API_TOKEN || "";

// Country → provider mapping
const COUNTRY_PROVIDERS: Record<string, VerificationProvider> = {
  NG: "smile_identity",
  GH: "smile_identity",
  KE: "smile_identity",
  ZA: "smile_identity",
  US: "onfido",
  GB: "onfido",
  DE: "onfido",
  FR: "onfido",
  AE: "onfido",
  SA: "onfido",
  IN: "onfido",
  JP: "onfido",
  BR: "onfido",
  AU: "onfido",
  CA: "onfido",
};

export function getProviderForCountry(countryCode: string): VerificationProvider {
  return COUNTRY_PROVIDERS[countryCode] || "onfido";
}

// Required verification per role
const REQUIRED_FOR_ROLES: RoleType[] = [
  "vendor",
  "logistics_partner",
  "manufacturer",
  "supplier",
];

export function isVerificationRequired(role: RoleType): boolean {
  return REQUIRED_FOR_ROLES.includes(role);
}

export async function createVerificationRequest(
  userId: string,
  roleType: RoleType,
  provider: VerificationProvider,
  documentType: string,
  documentUrl: string,
  selfieUrl: string
) {
  return prisma.kv_sec_identity_verification.create({
    data: {
      userId,
      roleType,
      provider,
      documentType,
      documentUrl,
      selfieUrl,
      status: "pending",
    },
  });
}

export async function submitToSmileIdentity(verificationId: string) {
  const verification = await prisma.kv_sec_identity_verification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) throw new Error("Verification not found");
  if (!SMILE_IDENTITY_API_KEY || !SMILE_IDENTITY_PARTNER_ID) {
    // Mock response for development
    await prisma.kv_sec_identity_verification.update({
      where: { id: verificationId },
      data: {
        status: "passed",
        confidenceScore: 95.5,
        providerReference: `SMI-DEV-${Date.now()}`,
      },
    });
    return { status: "passed", confidence: 95.5 };
  }

  // Real Smile Identity API call (simplified)
  const res = await fetch("https://api.smileidentity.com/v1/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partner_id: SMILE_IDENTITY_PARTNER_ID,
      api_key: SMILE_IDENTITY_API_KEY,
      image_url: verification.selfieUrl,
      id_image_url: verification.documentUrl,
    }),
  });

  const data = await res.json();
  const confidence = data.confidence || 0;
  const status = confidence >= 70 ? "passed" : confidence >= 40 ? "manual_review" : "failed";

  await prisma.kv_sec_identity_verification.update({
    where: { id: verificationId },
    data: {
      status,
      confidenceScore: confidence,
      providerReference: data.job_id || null,
    },
  });

  return { status, confidence };
}

export async function submitToOnfido(verificationId: string) {
  const verification = await prisma.kv_sec_identity_verification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) throw new Error("Verification not found");
  if (!ONFIDO_API_TOKEN) {
    // Mock response for development
    await prisma.kv_sec_identity_verification.update({
      where: { id: verificationId },
      data: {
        status: "passed",
        confidenceScore: 92.0,
        providerReference: `OFD-DEV-${Date.now()}`,
      },
    });
    return { status: "passed", confidence: 92.0 };
  }

  // Real Onfido API call (simplified)
  const res = await fetch("https://api.onfido.com/v3/watchlist_screenings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token token=${ONFIDO_API_TOKEN}`,
    },
    body: JSON.stringify({
      applicant_id: verification.userId,
      webhook_id: verification.id,
    }),
  });

  const data = await res.json();
  const status = data.status === "clear" ? "passed" : data.status === "consider" ? "manual_review" : "failed";

  await prisma.kv_sec_identity_verification.update({
    where: { id: verificationId },
    data: {
      status,
      providerReference: data.id || null,
    },
  });

  return { status, confidence: 0 };
}

export async function reviewVerification(
  verificationId: string,
  reviewerId: string,
  decision: "passed" | "failed",
  notes?: string
) {
  return prisma.kv_sec_identity_verification.update({
    where: { id: verificationId },
    data: {
      status: decision,
      reviewedBy: reviewerId,
      reviewNotes: notes ?? null,
      reviewedAt: new Date(),
    },
  });
}

export async function getPendingVerifications() {
  return prisma.kv_sec_identity_verification.findMany({
    where: { status: { in: ["pending", "manual_review"] } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getVerificationStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalPending, totalPassedToday, totalFailedToday, totalManualReview] = await Promise.all([
    prisma.kv_sec_identity_verification.count({ where: { status: "pending" } }),
    prisma.kv_sec_identity_verification.count({ where: { createdAt: { gte: todayStart }, status: "passed" } }),
    prisma.kv_sec_identity_verification.count({ where: { createdAt: { gte: todayStart }, status: "failed" } }),
    prisma.kv_sec_identity_verification.count({ where: { status: "manual_review" } }),
  ]);

  return { totalPending, totalPassedToday, totalFailedToday, totalManualReview };
}
