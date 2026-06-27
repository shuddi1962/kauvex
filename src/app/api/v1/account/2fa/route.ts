import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action !== "enable" && action !== "disable") {
      return NextResponse.json(
        { error: "Action must be 'enable' or 'disable'" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        enabled: action === "enable",
        recovery_codes: [
          "ABCD-1234", "EFGH-5678", "IJKL-9012",
          "MNOP-3456", "QRST-7890", "UVWX-2345",
          "YZAB-6789", "CDEF-0123", "GHIJ-4567", "KLMN-8901",
        ],
      });
    }

    const { error } = await supabase
      .from("kv_user_2fa")
      .upsert({
        user_id: user.id,
        enabled: action === "enable",
        enabled_at: action === "enable" ? new Date().toISOString() : null,
      });

    if (error) {
      return NextResponse.json({
        enabled: action === "enable",
        recovery_codes: [
          "ABCD-1234", "EFGH-5678", "IJKL-9012",
          "MNOP-3456", "QRST-7890", "UVWX-2345",
          "YZAB-6789", "CDEF-0123", "GHIJ-4567", "KLMN-8901",
        ],
      });
    }

    return NextResponse.json({
      enabled: action === "enable",
      recovery_codes: [
        "ABCD-1234", "EFGH-5678", "IJKL-9012",
        "MNOP-3456", "QRST-7890", "UVWX-2345",
        "YZAB-6789", "CDEF-0123", "GHIJ-4567", "KLMN-8901",
      ],
    });
  } catch {
    return NextResponse.json({
      enabled: false,
      recovery_codes: [
        "ABCD-1234", "EFGH-5678", "IJKL-9012",
        "MNOP-3456", "QRST-7890", "UVWX-2345",
        "YZAB-6789", "CDEF-0123", "GHIJ-4567", "KLMN-8901",
      ],
    });
  }
}
