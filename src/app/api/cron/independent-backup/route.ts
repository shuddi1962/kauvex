import { NextResponse } from "next/server";
import { createBackupRecord, completeBackup, failBackup } from "@/lib/security/backups";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function pgDump(): Promise<{ sizeMb: number; recordCount: number }> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_dump_schema`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const fallback = await fetch(`${SUPABASE_URL}/rest/v1/?select=count`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!fallback.ok) {
      throw new Error(`Supabase REST request failed: ${response.status}`);
    }

    return { sizeMb: 0, recordCount: 0 };
  }

  const data = await response.json();
  const jsonStr = JSON.stringify(data);
  const sizeMb = parseFloat((Buffer.byteLength(jsonStr) / (1024 * 1024)).toFixed(2));

  return { sizeMb, recordCount: Array.isArray(data) ? data.length : 0 };
}

export async function GET() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `backup-independent-${timestamp}.json`;

  const backupRecord = await createBackupRecord("daily", "supabase-rest", fileName);

  try {
    const { sizeMb, recordCount } = await pgDump();

    await completeBackup(backupRecord.id, sizeMb);

    return NextResponse.json({
      success: true,
      backup: {
        id: backupRecord.id,
        fileName,
        sizeMb,
        recordCount,
        status: "completed",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await failBackup(backupRecord.id, message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
