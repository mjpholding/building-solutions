import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "Swish Deutschland <onboarding@resend.dev>";
const TO = "info@swish-deutschland.de";

export async function POST(request: NextRequest) {
  const { firstName, lastName, email, company, phone, message } = await request.json();

  if (!firstName || !email || !message) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  // Always try to send email
  if (resend) {
    try {
      await resend.emails.send({
        from: FROM,
        to: TO,
        replyTo: email,
        subject: `Kontaktanfrage von ${firstName} ${lastName || ""} ${company ? `(${company})` : ""}`.trim(),
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#dc2626;color:white;padding:16px 24px;border-radius:8px 8px 0 0;">
              <h2 style="margin:0;font-size:18px;">Neue Kontaktanfrage</h2>
            </div>
            <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
              <table style="width:100%;font-size:14px;">
                <tr><td style="padding:6px 0;color:#6b7280;width:120px;">Name:</td><td style="padding:6px 0;font-weight:bold;">${firstName} ${lastName || ""}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;">E-Mail:</td><td style="padding:6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                ${company ? `<tr><td style="padding:6px 0;color:#6b7280;">Firma:</td><td style="padding:6px 0;">${company}</td></tr>` : ""}
                ${phone ? `<tr><td style="padding:6px 0;color:#6b7280;">Telefon:</td><td style="padding:6px 0;">${phone}</td></tr>` : ""}
              </table>
              <div style="margin-top:16px;padding:16px;background:white;border-radius:8px;border:1px solid #e5e7eb;">
                <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">Nachricht:</p>
                <p style="margin:0;white-space:pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Contact email error:", err);
    }
  }

  return NextResponse.json({ success: true });
}
