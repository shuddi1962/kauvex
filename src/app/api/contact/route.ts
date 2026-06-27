import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    // In production, this would send an email via Resend/SendGrid or store in DB
    // For now, log and return success
    console.log("[Contact Form]", { name, email, subject, message, timestamp: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      message: "Your message has been received. We'll get back to you within 24 hours.",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
