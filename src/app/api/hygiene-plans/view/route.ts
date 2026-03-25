import { NextRequest, NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface HygienePlan {
  id: string;
  category: "sanitary" | "kitchen" | "dining";
  htmlContent: string;
}

const TITLES: Record<string, string> = {
  sanitary: "Hygieneplan – Sanitäranlagen",
  kitchen: "Hygieneplan – Restaurant Küche",
  dining: "Hygieneplan – Restaurant Gastraum",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  const plans = ((await storeGet("hygiene-plans")) as HygienePlan[]) || [];
  const plan = id ? plans.find((p) => p.id === id) : category ? plans.find((p) => p.category === category) : null;

  if (!plan) {
    return new NextResponse("Hygieneplan nicht gefunden", { status: 404 });
  }

  const title = TITLES[plan.category] || "Hygieneplan";

  const company = {
    name: "Swish Deutschland",
    sub: "eine Marke der Building Solutions GmbH",
    address: "Ottostr. 14 | 50170 Kerpen | Deutschland",
    phone: "+49 (0) 2273 951 55 0",
    email: "info@swish-deutschland.de",
    website: "www.swish-deutschland.de",
  };

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    @page { margin: 10mm; size: A4 landscape; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111827; font-size: 10px; line-height: 1.4; }
    .header { background: #dc2626; color: white; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-left img { height: 30px; }
    .header-left .brand { font-size: 16px; font-weight: bold; }
    .header-left .sub { font-size: 8px; opacity: 0.8; }
    .header-right { text-align: right; }
    .header-right .title { font-size: 16px; font-weight: bold; letter-spacing: 0.5px; }
    .header-right .subtitle { font-size: 11px; margin-top: 2px; opacity: 0.9; }
    .content { padding: 16px 24px; }
    .content h2 { color: #dc2626; font-size: 12px; font-weight: bold; margin: 14px 0 6px; }
    .content h3 { font-size: 11px; font-weight: bold; margin: 10px 0 4px; }
    .content p { margin: 3px 0; }
    .content table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    .content td, .content th { padding: 6px 8px; border: 1px solid #d1d5db; text-align: left; vertical-align: middle; font-size: 9.5px; }
    .content td.product-img { width: 55px; padding: 3px; text-align: center; }
    .content td.product-img img { width: 48px; height: 48px; object-fit: contain; border-radius: 4px; }
    .content th { background: #dc2626; color: white; font-weight: bold; font-size: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content tr:nth-child(even) { background: #f9fafb; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section-header { background: #059669; color: white; font-weight: bold; font-size: 10px; padding: 5px 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content ul, .content ol { margin: 2px 0 2px 16px; padding: 0; }
    .content li { margin: 1px 0; font-size: 9px; }
    .content strong { color: #111827; }
    .footer { background: #1f2937; color: #9ca3af; padding: 8px 24px; font-size: 7px; display: flex; justify-content: space-between; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .footer strong { color: white; }
    .toolbar { background: #f3f4f6; padding: 8px 24px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #e5e7eb; }
    .toolbar button { background: #dc2626; color: white; border: none; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .toolbar button:hover { background: #b91c1c; }
    .toolbar span { font-size: 12px; color: #374151; font-weight: 500; }
    @media print { .toolbar { display: none; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>${title}</span>
    <button onclick="window.print()">🖨️ Drucken / Als PDF speichern</button>
  </div>

  <div class="header">
    <div class="header-left">
      <img src="/logo-swish-deutschland.png" alt="Logo" style="height:30px;filter:brightness(0) invert(1);" />
      <div>
        <div class="brand">Swish Deutschland</div>
        <div class="sub">${company.sub}</div>
      </div>
    </div>
    <div class="header-right">
      <div class="title">HYGIENEPLAN</div>
      <div class="subtitle">${title.replace("Hygieneplan – ", "")}</div>
    </div>
  </div>

  <div class="content">
    ${plan.htmlContent}
  </div>

  <div class="footer">
    <span>${company.name} — ${company.sub} | ${company.address}</span>
    <span><strong>Tel:</strong> ${company.phone} | <strong>E-Mail:</strong> ${company.email} | <strong>Web:</strong> ${company.website}</span>
  </div>

  <script>
    // Auto-insert product images into table
    const productToSlug = {
      "SP-300 WASHROOM CLEANER": "sp-300-washroom-cleaner",
      "E35 GEL": "e35-gel",
      "SCALE REMOVER": "scale-remover",
      "SPARKLE": "sparkle",
      "QUATO 78 PLUS": "quato-44",
      "QUATO 78": "quato-44",
      "JET": "jet",
      "SP-120 FLOOR ACTIVE": "sp-120-floor-active",
      "FOOD SERVICE 5000": "food-service-konzentrat",
      "FOOD SERVICE": "food-service-rtu",
      "SUPER CLEAN": "super-clean",
      "HARDWATER DETERGENT": "hardwater-detergent",
      "HARDWATER RINSE AGENT": "hardwater-rinse",
      "HARDWATER RINSE": "hardwater-rinse",
      "DESCALER": "descaler",
      "STAINLESS STEEL CLEAN & PROTECT": "stainless-steel-cleaner",
      "STAINLESS STEEL CLEANER": "stainless-steel-cleaner",
      "OFFICE CLEAN": "office-clean",
      "GLASS CLEAN": "glass-clean",
      "FRESH AIR": "fresh-air-nectarine",
      "DE-GREASE": "de-grease",
      "NANO GLASS": "nano-glass",
      "KLING": "kling",
      "SP-350 ACID CLEANER": "sp-350-acid-cleaner",
      "SANI CLEAN": "sani-clean",
      "SANI FOAM": "sani-foam",
      "E10 NEUTRAL": "e10-neutral",
      "E11 ORANGE": "e11-orange",
      "E20 ALKALI": "e20-alkali",
      "E30 ACID": "e30-acid",
      "E40 GLASS": "e40-glass",
      "E50 STRONG": "e50-strong",
    };

    // Add image column to header
    const headers = document.querySelectorAll("thead tr");
    headers.forEach(tr => {
      const firstTh = tr.querySelector("th");
      if (firstTh) {
        const imgTh = document.createElement("th");
        imgTh.textContent = "";
        imgTh.style.width = "55px";
        firstTh.parentNode.insertBefore(imgTh, firstTh.nextSibling);
      }
    });

    // Add images to each product row
    const rows = document.querySelectorAll("tbody tr");
    rows.forEach(tr => {
      // Check if it's a section header row
      if (tr.querySelector(".section-header") || tr.querySelector("[colspan]")) {
        const td = tr.querySelector("td[colspan]");
        if (td) td.setAttribute("colspan", String(Number(td.getAttribute("colspan") || 5) + 1));
        return;
      }

      const cells = tr.querySelectorAll("td");
      if (cells.length < 2) return;

      // Search all cells for a product name match
      const rowText = tr.textContent.toUpperCase();
      let slug = null;
      for (const [name, s] of Object.entries(productToSlug)) {
        if (rowText.includes(name)) {
          slug = s;
          break;
        }
      }

      // Insert image cell after first cell
      const imgTd = document.createElement("td");
      imgTd.className = "product-img";
      if (slug) {
        const img = document.createElement("img");
        img.src = "/products/" + slug + ".png";
        img.alt = slug;
        img.onerror = function() {
          this.src = "/products/" + slug + ".jpg";
          this.onerror = function() { this.style.display = "none"; };
        };
        imgTd.appendChild(img);
      }
      cells[0].parentNode.insertBefore(imgTd, cells[1]);
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
