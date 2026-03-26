import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet } from "@/lib/admin-store";
import type { Offer } from "../route";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const offers = ((await storeGet("offers")) as Offer[]) || [];
  const offer = offers.find((o) => o.id === id);
  if (!offer) return new NextResponse("Angebot nicht gefunden", { status: 404 });

  const company = {
    name: "Swish Deutschland",
    sub: "eine Marke der Building Solutions GmbH",
    address: "Ottostr. 14, 50170 Kerpen, Deutschland",
    phone: "+49 (0) 2273 951 55 0",
    email: "info@swish-deutschland.de",
    website: "www.swish-deutschland.de",
  };

  const itemsHtml = offer.items.map((item, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td><strong>${item.productName}</strong><br/><span style="color:#6b7280;font-size:9px;">${item.size}</span></td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:right;">${item.unitPrice.toFixed(2)} €</td>
      <td style="text-align:center;">${item.discount > 0 ? item.discount + "%" : "—"}</td>
      <td style="text-align:right;font-weight:bold;">${item.totalNet.toFixed(2)} €</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <title>Angebot ${offer.number}</title>
  <style>
    @page { margin: 15mm; size: A4; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111827; font-size: 11px; line-height: 1.5; }
    .toolbar { background: #f3f4f6; padding: 10px 30px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #e5e7eb; }
    .toolbar button { background: #dc2626; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .toolbar button:hover { background: #b91c1c; }
    .toolbar span { font-size: 13px; color: #374151; font-weight: 500; }
    @media print { .toolbar { display: none; } }
    .page { padding: 30px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .company { font-size: 10px; color: #6b7280; line-height: 1.6; }
    .company .name { font-size: 16px; font-weight: bold; color: #dc2626; }
    .company .sub { font-size: 9px; color: #9ca3af; }
    .logo img { height: 40px; }
    .title { font-size: 22px; font-weight: bold; color: #111827; margin-bottom: 5px; }
    .meta { display: flex; gap: 40px; margin-bottom: 25px; font-size: 10.5px; }
    .meta .label { color: #6b7280; }
    .meta .value { font-weight: bold; }
    .customer { background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 25px; }
    .customer .label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .customer .name { font-size: 14px; font-weight: bold; }
    .customer .detail { font-size: 10.5px; color: #374151; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #dc2626; color: white; padding: 8px 10px; font-size: 10px; text-align: left; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10.5px; }
    tr:nth-child(even) { background: #f9fafb; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .totals { width: 280px; margin-left: auto; }
    .totals tr td { border: none; padding: 4px 10px; }
    .totals .grand { font-size: 14px; font-weight: bold; border-top: 2px solid #dc2626; padding-top: 8px; }
    .notes { margin-top: 20px; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; font-size: 10px; }
    .notes .label { font-weight: bold; margin-bottom: 4px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 8.5px; color: #9ca3af; display: flex; justify-content: space-between; }
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
    .status-draft { background: #f3f4f6; color: #6b7280; }
    .status-sent { background: #dbeafe; color: #2563eb; }
    .status-accepted { background: #dcfce7; color: #16a34a; }
    .status-rejected { background: #fee2e2; color: #dc2626; }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Angebot ${offer.number}</span>
    <button onclick="window.print()">🖨️ Drucken / Als PDF speichern</button>
  </div>

  <div class="page">
    <div class="header">
      <div class="company">
        <div class="name">Swish Deutschland</div>
        <div class="sub">${company.sub}</div>
        <div style="margin-top:8px;">${company.address}</div>
        <div>Tel: ${company.phone}</div>
        <div>${company.email}</div>
        <div>${company.website}</div>
      </div>
      <div class="logo">
        <img src="/logo-swish-deutschland.png" alt="Logo" />
      </div>
    </div>

    <div class="title">Angebot ${offer.number}</div>
    <span class="status-badge status-${offer.status}">${
      offer.status === "draft" ? "Entwurf" : offer.status === "sent" ? "Gesendet" : offer.status === "accepted" ? "Angenommen" : "Abgelehnt"
    }</span>

    <div class="meta" style="margin-top:15px;">
      <div><span class="label">Datum:</span> <span class="value">${new Date(offer.date).toLocaleDateString("de-DE")}</span></div>
      ${offer.validUntil ? `<div><span class="label">Gültig bis:</span> <span class="value">${new Date(offer.validUntil).toLocaleDateString("de-DE")}</span></div>` : ""}
      <div><span class="label">Erstellt von:</span> <span class="value">${offer.createdBy}</span></div>
    </div>

    <div class="customer">
      <div class="label">Kunde</div>
      <div class="name">${offer.customerCompany || offer.customerName}</div>
      ${offer.customerCompany && offer.customerName ? `<div class="detail">${offer.customerName}</div>` : ""}
      ${offer.customerAddress ? `<div class="detail">${offer.customerAddress}</div>` : ""}
      ${offer.customerEmail ? `<div class="detail">${offer.customerEmail}</div>` : ""}
      ${offer.customerPhone ? `<div class="detail">Tel: ${offer.customerPhone}</div>` : ""}
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:30px;">Nr.</th>
          <th>Produkt</th>
          <th style="width:50px;text-align:center;">Menge</th>
          <th style="width:80px;text-align:right;">Einzelpreis</th>
          <th style="width:60px;text-align:center;">Rabatt</th>
          <th style="width:90px;text-align:right;">Gesamt netto</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <table class="totals">
      <tr>
        <td style="text-align:right;color:#6b7280;">Zwischensumme netto:</td>
        <td style="text-align:right;">${offer.subtotalNet.toFixed(2)} €</td>
      </tr>
      <tr>
        <td style="text-align:right;color:#6b7280;">MwSt. ${offer.vatRate}%:</td>
        <td style="text-align:right;">${offer.vatAmount.toFixed(2)} €</td>
      </tr>
      <tr class="grand">
        <td style="text-align:right;color:#dc2626;">Gesamtbetrag brutto:</td>
        <td style="text-align:right;color:#dc2626;">${offer.totalGross.toFixed(2)} €</td>
      </tr>
    </table>

    ${offer.notes ? `<div class="notes"><div class="label">Anmerkungen:</div>${offer.notes}</div>` : ""}

    <div class="footer">
      <span>${company.name} — ${company.sub} | ${company.address}</span>
      <span>Tel: ${company.phone} | ${company.email}</span>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
