import { Resend } from "resend";
import { storeGet } from "./admin-store";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "Building Solutions GmbH <info@buildingsolutions.de>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.buildingsolutions.de";

export interface NotificationSettings {
  [userId: string]: {
    email: string;
    chatNotify: boolean;
    orderNotify: boolean;
  };
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  return ((await storeGet("notification-settings")) as NotificationSettings) || {};
}

// Send chat message notification
export async function notifyChatMessage(
  senderName: string,
  channel: string,
  messageText: string,
  senderId: string
) {
  if (!resend) return;

  const settings = await getNotificationSettings();
  const recipients = Object.entries(settings)
    .filter(([userId, s]) => s.chatNotify && s.email && userId !== senderId)
    .map(([, s]) => s.email);

  if (recipients.length === 0) return;

  const preview = messageText.length > 100 ? messageText.slice(0, 100) + "..." : messageText;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: `💬 Neue Nachricht von ${senderName} in #${channel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 18px;">Swish Team-Chat</h2>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px;">Kanal: <strong>#${channel}</strong></p>
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 0 0 4px; font-weight: bold; color: #111827;">${senderName}</p>
              <p style="margin: 0; color: #374151;">${preview}</p>
            </div>
            <a href="${SITE_URL}/admin/chat" style="display: inline-block; margin-top: 16px; background: #dc2626; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Chat öffnen
            </a>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email notification error (chat):", err);
  }
}

// Send new order notification
export async function notifyNewOrder(order: {
  id: string;
  customer: { company: string; name: string; email: string };
  items: { name: string; size: string; quantity: number; price: number }[];
  subtotal: number;
}) {
  if (!resend) return;

  const settings = await getNotificationSettings();
  const recipients = Object.entries(settings)
    .filter(([, s]) => s.orderNotify && s.email)
    .map(([, s]) => s.email);

  if (recipients.length === 0) return;

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name} (${item.size})</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price * item.quantity).toFixed(2)} €</td>
        </tr>`
    )
    .join("");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: `🛒 Neue Bestellung ${order.id} von ${order.customer.company || order.customer.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 18px;">Neue Bestellung eingegangen</h2>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 16px;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Bestellnummer</p>
              <p style="margin: 0 0 12px; font-weight: bold; color: #111827;">${order.id}</p>
              <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">Kunde</p>
              <p style="margin: 0 0 4px; font-weight: bold; color: #111827;">${order.customer.company || "—"}</p>
              <p style="margin: 0; color: #374151;">${order.customer.name} · ${order.customer.email}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280;">Produkt</th>
                  <th style="padding: 8px; text-align: center; font-size: 12px; color: #6b7280;">Menge</th>
                  <th style="padding: 8px; text-align: right; font-size: 12px; color: #6b7280;">Summe</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr style="background: #f3f4f6;">
                  <td colspan="2" style="padding: 8px; font-weight: bold;">Gesamt (netto)</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">${order.subtotal.toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
            <a href="${SITE_URL}/admin/orders/${order.id}" style="display: inline-block; margin-top: 16px; background: #dc2626; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Bestellung ansehen
            </a>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email notification error (order):", err);
  }
}
