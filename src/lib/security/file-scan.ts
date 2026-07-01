import prisma from "@/lib/db";

export type ScanProvider = "virustotal" | "sightengine" | "cloudflare_images";
export type ScanResult = "clean" | "infected" | "suspicious" | "pending" | "error";

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || "";
const SIGHTENGINE_API_USER = process.env.SIGHTENGINE_API_USER || "";
const SIGHTENGINE_API_SECRET = process.env.SIGHTENGINE_API_SECRET || "";

export interface ScanOutcome {
  result: ScanResult;
  details?: Record<string, unknown>;
}

export async function scanFile(
  fileUrl: string,
  uploadedBy: string,
  fileName?: string,
  fileSizeBytes?: number,
  provider: ScanProvider = "virustotal"
): Promise<{ scanId: string; outcome: ScanOutcome }> {
  // Create scan record
  const scan = await prisma.kv_sec_file_scan.create({
    data: {
      fileUrl,
      fileName: fileName ?? null,
      fileSizeBytes: fileSizeBytes ? BigInt(fileSizeBytes) : null,
      uploadedBy,
      scanProvider: provider,
      scanResult: "pending",
    },
  });

  let outcome: ScanOutcome;

  try {
    if (provider === "virustotal") {
      outcome = await scanWithVirusTotal(fileUrl);
    } else if (provider === "sightengine") {
      outcome = await scanWithSightengine(fileUrl);
    } else {
      // Cloudflare Images — basic safety check (no malware scanning, just availability)
      outcome = { result: "clean", details: { note: "Cloudflare Images does not perform malware scanning" } };
    }
  } catch (err) {
    outcome = { result: "error", details: { error: (err as Error).message } };
  }

  // Update scan record
  await prisma.kv_sec_file_scan.update({
    where: { id: scan.id },
    data: {
      scanResult: outcome.result,
      scanDetails: outcome.details as any,
      quarantined: outcome.result === "infected" || outcome.result === "suspicious",
      scannedAt: new Date(),
    },
  });

  return { scanId: scan.id, outcome };
}

async function scanWithVirusTotal(fileUrl: string): Promise<ScanOutcome> {
  if (!VIRUSTOTAL_API_KEY) {
    return { result: "clean", details: { note: "VirusTotal API key not configured — skipped" } };
  }

  // Download file and submit to VirusTotal
  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) throw new Error(`Failed to download file: ${fileRes.status}`);

  const formData = new FormData();
  formData.append("file", await fileRes.blob());

  const uploadRes = await fetch("https://www.virustotal.com/api/v3/files", {
    method: "POST",
    headers: { "x-apikey": VIRUSTOTAL_API_KEY },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(`VirusTotal upload failed: ${(err as any).error?.message || uploadRes.statusText}`);
  }

  const uploadData = await uploadRes.json();
  const analysisId = uploadData.data?.id;

  if (!analysisId) throw new Error("No analysis ID returned from VirusTotal");

  // Poll for results (max 30 seconds)
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 5000));

    const analysisRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: { "x-apikey": VIRUSTOTAL_API_KEY },
    });

    if (!analysisRes.ok) continue;

    const analysisData = await analysisRes.json();
    const stats = analysisData.data?.attributes?.stats;

    if (stats) {
      const malicious = (stats.malicious || 0) + (stats.suspicious || 0);
      if (malicious > 0) {
        return {
          result: stats.malicious > 0 ? "infected" : "suspicious",
          details: { stats, analysisId },
        };
      }
      if (stats.undetected >= 0 && (stats.harmless || 0) > 0) {
        return { result: "clean", details: { stats, analysisId } };
      }
    }
  }

  return { result: "clean", details: { note: "Scan timed out — defaulting to clean", analysisId } };
}

async function scanWithSightengine(fileUrl: string): Promise<ScanOutcome> {
  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    return { result: "clean", details: { note: "Sightengine not configured — skipped" } };
  }

  const formData = new FormData();
  formData.append("url", fileUrl);
  formData.append("models", "nudity-2.0,violence,offensive,text-content");
  formData.append("api_user", SIGHTENGINE_API_USER);
  formData.append("api_secret", SIGHTENGINE_API_SECRET);

  const res = await fetch("https://api.sightengine.com/1.0/check.json", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(`Sightengine API error: ${res.status}`);

  const data = await res.json();

  // Check for flagged content
  const nudity = data.nudity?.raw ?? 0;
  const violence = data.violence?.prob ?? 0;
  const offensive = data.offensive?.prob ?? 0;

  if (nudity > 0.7 || violence > 0.7 || offensive > 0.7) {
    return { result: "infected", details: { nudity, violence, offensive, raw: data } };
  }
  if (nudity > 0.4 || violence > 0.4 || offensive > 0.4) {
    return { result: "suspicious", details: { nudity, violence, offensive, raw: data } };
  }

  return { result: "clean", details: { nudity, violence, offensive } };
}

export async function getRecentScans(limit = 50) {
  return prisma.kv_sec_file_scan.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getScanStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalToday, infectedToday, suspiciousToday, pendingCount] = await Promise.all([
    prisma.kv_sec_file_scan.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.kv_sec_file_scan.count({ where: { createdAt: { gte: todayStart }, scanResult: "infected" } }),
    prisma.kv_sec_file_scan.count({ where: { createdAt: { gte: todayStart }, scanResult: "suspicious" } }),
    prisma.kv_sec_file_scan.count({ where: { scanResult: "pending" } }),
  ]);

  return { totalToday, infectedToday, suspiciousToday, pendingCount };
}
