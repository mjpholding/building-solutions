import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { getNotificationSettings } from "@/lib/email";
import { Resend } from "resend";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Building Solutions GmbH <onboarding@resend.dev>";

  // Check 1: API key exists
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "RESEND_API_KEY is not set in environment variables",
      checks: { apiKey: false, settings: false, send: false },
    });
  }

  // Check 2: Notification settings
  const settings = await getNotificationSettings();
  const userSettings = settings[user.id];

  if (!userSettings || !userSettings.email) {
    return NextResponse.json({
      success: false,
      error: `No email configured for user ${user.id} (${user.name}). Go to /admin/users and set your email.`,
      checks: { apiKey: true, settings: false, send: false },
      allSettings: settings,
    });
  }

  // Check 3: Try sending a test email
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: userSettings.email,
      subject: "✅ Swish Test — E-Mail funktioniert!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #dc2626;">Building Solutions GmbH</h2>
          <p>E-Mail-Benachrichtigungen funktionieren korrekt!</p>
          <p style="color: #6b7280; font-size: 13px;">Gesendet an: ${userSettings.email}<br/>Von: ${fromEmail}<br/>User: ${user.name} (${user.id})</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      checks: { apiKey: true, settings: true, send: true },
      email: userSettings.email,
      from: fromEmail,
      resendResponse: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      success: false,
      error: `Resend API error: ${message}`,
      checks: { apiKey: true, settings: true, send: false },
      email: userSettings.email,
      from: fromEmail,
    });
  }
}
