export interface VercelDomainResult {
  success: boolean;
  domain: string;
  verified: boolean;
  error?: string;
}

export interface DomainStatus {
  verified: boolean;
  sslStatus: string;
  configuredCorrectly: boolean;
  error?: string;
}

const VERCEL_API = "https://api.vercel.com";

export async function addDomainToVercel(domain: string): Promise<VercelDomainResult> {
  try {
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;
    const token = process.env.VERCEL_API_TOKEN;
    if (!token || !projectId) {
      return { success: false, domain, verified: false, error: "Missing VERCEL_API_TOKEN or VERCEL_PROJECT_ID" };
    }
    const url = `${VERCEL_API}/v10/projects/${projectId}/domains${teamId ? `?teamId=${teamId}` : ""}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: domain }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, domain, verified: false, error: data.error?.message || "Failed to add domain" };
    }
    return { success: true, domain: data.name || domain, verified: data.verified || false };
  } catch (err) {
    return { success: false, domain, verified: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function removeDomainFromVercel(domain: string): Promise<boolean> {
  try {
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;
    const token = process.env.VERCEL_API_TOKEN;
    if (!token || !projectId) return false;
    const url = `${VERCEL_API}/v9/projects/${projectId}/domains/${domain}${teamId ? `?teamId=${teamId}` : ""}`;
    const response = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getDomainStatus(domain: string): Promise<DomainStatus> {
  try {
    const projectId = process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;
    const token = process.env.VERCEL_API_TOKEN;
    if (!token || !projectId) {
      return { verified: false, sslStatus: "unknown", configuredCorrectly: false, error: "Missing env vars" };
    }
    const url = `${VERCEL_API}/v9/projects/${projectId}/domains/${domain}${teamId ? `?teamId=${teamId}` : ""}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    return {
      verified: data.verified || false,
      sslStatus: data.ssl?.state || data.sslCert?.state || "pending",
      configuredCorrectly: data.configuredBy === "vercel",
      error: data.error?.message,
    };
  } catch (err) {
    return { verified: false, sslStatus: "error", configuredCorrectly: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Cloudflare DNS (only for custom domains — vendor subdomains use wildcard)
const CF_API = "https://api.cloudflare.com/client/v4";

export async function addCloudflareCNAME(subdomain: string): Promise<boolean> {
  try {
    const token = process.env.CF_API_TOKEN;
    const zoneId = process.env.CF_ZONE_ID;
    if (!token || !zoneId) return false;
    const response = await fetch(`${CF_API}/zones/${zoneId}/dns_records`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "CNAME", name: subdomain, content: "cname.vercel-dns.com", ttl: 1, proxied: false }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function removeCloudflareCNAME(subdomain: string): Promise<boolean> {
  try {
    const token = process.env.CF_API_TOKEN;
    const zoneId = process.env.CF_ZONE_ID;
    if (!token || !zoneId) return false;
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "kauvex.com";
    const listRes = await fetch(`${CF_API}/zones/${zoneId}/dns_records?name=${subdomain}.${rootDomain}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    const recordId = listData.result?.[0]?.id;
    if (!recordId) return false;
    const deleteRes = await fetch(`${CF_API}/zones/${zoneId}/dns_records/${recordId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return deleteRes.ok;
  } catch {
    return false;
  }
}
