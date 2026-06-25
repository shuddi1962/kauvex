import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || "Invalid email or password" },
        { status: 401 },
      );
    }

    const session = data.session;
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.match(/https:\/\/([^.]+)\./)?.[1] || "";
    const cookieBase = `sb-${projectRef}`;

    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        role: data.user.user_metadata?.role,
      },
    });

    response.cookies.set(`${cookieBase}-auth-token`, session.access_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60,
    });

    response.cookies.set(`${cookieBase}-refresh-token`, session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Partner login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
