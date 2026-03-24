import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface LegalPages {
  impressum: string;
  datenschutz: string;
}

const DEFAULT_IMPRESSUM = `<h2>Impressum</h2>
<p><strong>Swish Deutschland</strong><br/>
Musterstraße 1<br/>
12345 Musterstadt<br/>
Deutschland</p>

<p><strong>Vertreten durch:</strong><br/>
Max Mustermann</p>

<p><strong>Kontakt:</strong><br/>
Telefon: +49 (0) 123 456789<br/>
E-Mail: info@swish-deutschland.de</p>

<p><strong>Handelsregister:</strong><br/>
Registergericht: Amtsgericht Musterstadt<br/>
Registernummer: HRB 12345</p>

<p><strong>Umsatzsteuer-ID:</strong><br/>
Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz:<br/>
DE123456789</p>

<p><strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br/>
Max Mustermann<br/>
Musterstraße 1<br/>
12345 Musterstadt</p>`;

const DEFAULT_DATENSCHUTZ = `<h2>Datenschutzerklärung</h2>

<h3>1. Datenschutz auf einen Blick</h3>
<p><strong>Allgemeine Hinweise:</strong> Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>

<h3>2. Verantwortliche Stelle</h3>
<p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br/>
Swish Deutschland<br/>
Musterstraße 1<br/>
12345 Musterstadt<br/>
E-Mail: info@swish-deutschland.de</p>

<h3>3. Datenerfassung auf dieser Website</h3>
<p><strong>Cookies:</strong> Diese Website verwendet keine Tracking-Cookies. Es werden keine personenbezogenen Daten zu Analysezwecken erhoben.</p>

<h3>4. Hosting</h3>
<p>Diese Website wird bei Vercel Inc. gehostet. Details entnehmen Sie der Datenschutzerklärung von Vercel: https://vercel.com/legal/privacy-policy</p>

<h3>5. Ihre Rechte</h3>
<p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bitte wenden Sie sich dazu an die oben genannte verantwortliche Stelle.</p>`;

// Public GET — no auth needed
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  const data = (await storeGet("legal-pages")) as LegalPages | null;

  if (page === "impressum") {
    return NextResponse.json({ content: data?.impressum || DEFAULT_IMPRESSUM });
  }
  if (page === "datenschutz") {
    return NextResponse.json({ content: data?.datenschutz || DEFAULT_DATENSCHUTZ });
  }

  return NextResponse.json({
    impressum: data?.impressum || DEFAULT_IMPRESSUM,
    datenschutz: data?.datenschutz || DEFAULT_DATENSCHUTZ,
  });
}

// Admin PUT — save changes
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { impressum, datenschutz } = await request.json();
  const current = (await storeGet("legal-pages")) as LegalPages | null;

  const updated: LegalPages = {
    impressum: impressum ?? current?.impressum ?? DEFAULT_IMPRESSUM,
    datenschutz: datenschutz ?? current?.datenschutz ?? DEFAULT_DATENSCHUTZ,
  };

  await storeSet("legal-pages", updated);
  return NextResponse.json({ success: true });
}
