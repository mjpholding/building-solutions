import { NextRequest, NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface ProductSheet {
  id: string;
  productName: string;
  type: "product" | "sds";
  htmlContent: string;
  logoBase64: string | null;
  productImageBase64: string | null;
  assignedSlug: string | null;
}

// GET: PUBLIC endpoint — render a saved sheet as full HTML page
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const sheets = ((await storeGet("product-sheets")) as ProductSheet[]) || [];
  const sheet = sheets.find((s) => s.id === id);

  if (!sheet) {
    return new NextResponse("Nicht gefunden", { status: 404 });
  }

  const company = {
    name: "Building Solutions GmbH",
    sub: "eine Marke der Building Solutions GmbH",
    address: "Ottostr. 14 | 50170 Kerpen | Deutschland",
    phone: "+49 (0) 2273 951 55 0",
    email: "info@buildingsolutions.de",
    website: "www.buildingsolutions.de",
  };

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>${sheet.productName} - ${sheet.type === "product" ? "Produktdatenblatt" : "Sicherheitsdatenblatt"}</title>
  <style>
    @page { margin: 12mm 15mm; size: A4; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111827; font-size: 10.5px; line-height: 1.6; }
    .header { background: #dc2626; color: white; padding: 18px 28px; display: flex; justify-content: space-between; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .header-left img { height: 36px; }
    .header-left .brand { font-size: 18px; font-weight: bold; }
    .header-left .sub { font-size: 9px; opacity: 0.8; }
    .header-right { text-align: right; font-size: 8.5px; line-height: 1.6; }
    .header-right .label { font-weight: bold; font-size: 9px; margin-top: 6px; letter-spacing: 1px; opacity: 0.85; }
    .content { padding: 24px 28px 70px; }
    .product-name { font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 4px; }
    .product-badge { display: inline-block; background: #dc2626; color: white; font-size: 7.5px; font-weight: bold; padding: 2px 10px; border-radius: 10px; margin-bottom: 16px; letter-spacing: 0.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content h2 { color: #dc2626; font-size: 13px; font-weight: bold; margin: 18px 0 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
    .content h3 { color: #111827; font-size: 11.5px; font-weight: bold; margin: 14px 0 4px; }
    .content p { margin: 4px 0; text-align: justify; }
    .content ul, .content ol { margin: 4px 0 4px 20px; padding: 0; }
    .content li { margin: 2px 0; }
    .content table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
    .content td, .content th { padding: 4px 8px; border: 1px solid #e5e7eb; text-align: left; }
    .content th { background: #f9fafb; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content hr { border: none; border-top: 2px solid #dc2626; margin: 24px 0; page-break-before: always; }
    .content strong { color: #111827; }
    .footer { background: #1f2937; color: #9ca3af; padding: 10px 28px; font-size: 7.5px; display: flex; justify-content: space-between; position: fixed; bottom: 0; left: 0; right: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .footer strong { color: white; }
    .toolbar { background: #f3f4f6; padding: 10px 28px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #e5e7eb; }
    .toolbar button { background: #dc2626; color: white; border: none; padding: 8px 20px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .toolbar button:hover { background: #b91c1c; }
    .toolbar span { font-size: 13px; color: #374151; font-weight: 500; }
    @media print { .toolbar { display: none; } .footer { position: fixed; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>${sheet.productName} — ${sheet.type === "product" ? "Produktdatenblatt" : "Sicherheitsdatenblatt"}</span>
    <button onclick="window.print()">🖨️ Drucken / Als PDF speichern</button>
  </div>

  <div class="header">
    <div class="header-left">
      <img src="${sheet.logoBase64 || '/logo-buildingsolutions.png'}" alt="Logo" style="height:36px;filter:brightness(0) invert(1);" />
      <div>
        <div class="brand">Building Solutions GmbH</div>
        <div class="sub">${company.sub}</div>
      </div>
    </div>
    <div class="header-right">
      ${company.website}<br/>
      Tel: ${company.phone}<br/>
      ${company.email}
      <div class="label">${sheet.type === "product" ? "PRODUKTDATENBLATT" : "SICHERHEITSDATENBLATT"}</div>
    </div>
  </div>

  <div class="content">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div class="product-name">${sheet.productName}</div>
        <div class="product-badge">${sheet.type === "product" ? "PROFESSIONAL LINE" : "SDB / SDS"}</div>
      </div>
      ${sheet.productImageBase64
        ? `<img src="${sheet.productImageBase64}" style="width:100px;height:130px;object-fit:contain;" />`
        : sheet.assignedSlug
        ? `<img src="/products/${sheet.assignedSlug}.png" style="width:100px;height:130px;object-fit:contain;" onerror="this.src='/products/${sheet.assignedSlug}.jpg';this.onerror=function(){this.style.display='none'}" />`
        : ""}
    </div>

    ${sheet.htmlContent}
  </div>

  <div class="footer">
    <span>${company.name} — ${company.sub} | ${company.address}</span>
    <span><strong>Tel:</strong> ${company.phone} | <strong>E-Mail:</strong> ${company.email} | <strong>Web:</strong> ${company.website}</span>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
