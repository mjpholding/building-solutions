import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface LegalPages {
  impressum: string;
  datenschutz: string;
  agb: string;
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

const DEFAULT_AGB = `<p><strong>Swish Deutschland</strong><br/>(eine Marke der Building Solutions GmbH)</p>
<p>Vertrieb von Reinigungs-, Hygiene- und Pflegeprodukten (B2B)<br/>Stand: März 2026</p>

<h3>1. Geltungsbereich</h3>
<p>1.1 Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Lieferungen und Leistungen der Building Solutions GmbH, Ottostraße 14, 50170 Kerpen, unter der Marke „Swish Deutschland".</p>
<p>1.2 Das Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB sowie an juristische Personen des öffentlichen Rechts.</p>
<p>1.3 Entgegenstehende oder abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.</p>

<h3>2. Vertragsgegenstand</h3>
<p>2.1 Gegenstand des Vertrages ist der Vertrieb von Reinigungs-, Hygiene- und Pflegeprodukten sowie ergänzender Dienstleistungen.</p>
<p>2.2 Produktdarstellungen (z. B. im Online-Shop oder Katalog) stellen kein verbindliches Angebot dar, sondern eine Aufforderung zur Abgabe einer Bestellung.</p>

<h3>3. Vertragsschluss</h3>
<p>3.1 Ein Vertrag kommt erst durch Auftragsbestätigung oder Lieferung durch die Building Solutions GmbH zustande.</p>
<p>3.2 Angebote sind freibleibend und unverbindlich, sofern sie nicht ausdrücklich als verbindlich gekennzeichnet sind.</p>

<h3>4. Preise und Zahlungsbedingungen</h3>
<p>4.1 Alle Preise verstehen sich netto zuzüglich der jeweils geltenden gesetzlichen Umsatzsteuer.</p>
<p>4.2 Rechnungen sind, sofern nicht anders vereinbart, innerhalb von 14 Tagen ohne Abzug zahlbar.</p>
<p>4.3 Bei Zahlungsverzug gelten Verzugszinsen in Höhe von 9 Prozentpunkten über dem Basiszinssatz (§ 288 Abs. 2 BGB).</p>
<p>4.4 Die Building Solutions GmbH ist berechtigt, bei Zahlungsverzug weitere Lieferungen zurückzuhalten.</p>

<h3>5. Lieferung und Gefahrübergang</h3>
<p>5.1 Liefertermine sind unverbindlich, sofern nicht ausdrücklich schriftlich als verbindlich vereinbart.</p>
<p>5.2 Die Lieferung erfolgt auf Rechnung und Gefahr des Kunden.</p>
<p>5.3 Mit Übergabe an den Transportdienstleister geht die Gefahr auf den Kunden über.</p>

<h3>6. Eigentumsvorbehalt</h3>
<p>6.1 Die gelieferten Waren bleiben bis zur vollständigen Bezahlung sämtlicher Forderungen Eigentum der Building Solutions GmbH.</p>
<p>6.2 Der Kunde ist berechtigt, die Ware im ordentlichen Geschäftsgang weiterzuveräußern.</p>

<h3>7. Mängel und Gewährleistung</h3>
<p>7.1 Der Kunde ist verpflichtet, die Ware unverzüglich nach Erhalt zu prüfen.</p>
<p>7.2 Offensichtliche Mängel sind innerhalb von 5 Werktagen schriftlich anzuzeigen.</p>
<p>7.3 Bei berechtigten Mängeln erfolgt nach Wahl der Building Solutions GmbH Nachbesserung oder Ersatzlieferung.</p>

<h3>8. Produkthaftung und Anwendungshinweise</h3>
<p>8.1 Die gelieferten Produkte sind ausschließlich gemäß den jeweiligen Produktdatenblättern, Sicherheitsdatenblättern und Anwendungshinweisen zu verwenden.</p>
<p>8.2 Der Kunde ist verpflichtet, seine Mitarbeiter entsprechend einzuweisen und die geltenden Sicherheits- und Arbeitsschutzvorschriften einzuhalten.</p>
<p>8.3 Eine Haftung für Schäden, die aus unsachgemäßer Anwendung, falscher Dosierung oder nicht bestimmungsgemäßem Gebrauch entstehen, ist ausgeschlossen.</p>
<p>8.4 Zu allen Produkten werden auf Anfrage Sicherheitsdatenblätter gemäß geltenden gesetzlichen Anforderungen bereitgestellt.</p>
<p>8.5 Für bestimmte Produkte stehen zusätzlich Notfallinformationen (z. B. Giftnotruf) zur Verfügung, die in den jeweiligen Sicherheitsdatenblättern ausgewiesen sind.</p>
<p>8.6 Der Kunde ist verpflichtet, diese Informationen im Betrieb zugänglich zu machen und entsprechend zu berücksichtigen.</p>

<h3>9. Haftung</h3>
<p>9.1 Die Building Solutions GmbH haftet unbeschränkt bei: Vorsatz, grober Fahrlässigkeit, Verletzung von Leben, Körper oder Gesundheit.</p>
<p>9.2 Bei leichter Fahrlässigkeit haftet das Unternehmen nur bei Verletzung wesentlicher Vertragspflichten und beschränkt auf den vorhersehbaren, typischen Schaden.</p>
<p>9.3 Eine Haftung für mittelbare Schäden, insbesondere entgangenen Gewinn oder Betriebsunterbrechungen, ist ausgeschlossen, soweit gesetzlich zulässig.</p>

<h3>10. Rückgabe und Widerruf</h3>
<p>10.1 Ein Widerrufsrecht besteht nicht, da sich das Angebot ausschließlich an Unternehmer richtet.</p>
<p>10.2 Rückgaben sind nur nach vorheriger Vereinbarung möglich.</p>

<h3>11. Datenschutz</h3>
<p>Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung auf unserer Website.</p>

<h3>12. Gerichtsstand und Recht</h3>
<p>12.1 Gerichtsstand ist Köln, sofern gesetzlich zulässig.</p>
<p>12.2 Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.</p>

<h3>13. Salvatorische Klausel</h3>
<p>Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>`;

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
  if (page === "agb") {
    return NextResponse.json({ content: data?.agb || "" });
  }

  return NextResponse.json({
    impressum: data?.impressum || DEFAULT_IMPRESSUM,
    datenschutz: data?.datenschutz || DEFAULT_DATENSCHUTZ,
    agb: data?.agb || DEFAULT_AGB,
  });
}

// Admin PUT — save changes
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { impressum, datenschutz, agb } = await request.json();
  const current = (await storeGet("legal-pages")) as LegalPages | null;

  const updated: LegalPages = {
    impressum: impressum ?? current?.impressum ?? DEFAULT_IMPRESSUM,
    datenschutz: datenschutz ?? current?.datenschutz ?? DEFAULT_DATENSCHUTZ,
    agb: agb ?? current?.agb ?? "",
  };

  await storeSet("legal-pages", updated);
  return NextResponse.json({ success: true });
}
