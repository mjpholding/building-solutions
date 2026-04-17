import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface LegalPages {
  impressum: string;
  datenschutz: string;
  agb: string;
}

const DEFAULT_IMPRESSUM = `<h2>Impressum</h2>
<p><strong>Building Solutions GmbH</strong><br/>
Musterstraße 1<br/>
12345 Musterstadt<br/>
Deutschland</p>

<p><strong>Vertreten durch:</strong><br/>
Max Mustermann</p>

<p><strong>Kontakt:</strong><br/>
Telefon: +49 (0) 123 456789<br/>
E-Mail: info@buildingsolutions.de</p>

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
Building Solutions GmbH<br/>
Musterstraße 1<br/>
12345 Musterstadt<br/>
E-Mail: info@buildingsolutions.de</p>

<h3>3. Datenerfassung auf dieser Website</h3>
<p><strong>Cookies:</strong> Diese Website verwendet keine Tracking-Cookies. Es werden keine personenbezogenen Daten zu Analysezwecken erhoben.</p>

<h3>4. Hosting</h3>
<p>Diese Website wird bei Vercel Inc. gehostet. Details entnehmen Sie der Datenschutzerklärung von Vercel: https://vercel.com/legal/privacy-policy</p>

<h3>5. Ihre Rechte</h3>
<p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung Ihrer personenbezogenen Daten. Bitte wenden Sie sich dazu an die oben genannte verantwortliche Stelle.</p>`;

const DEFAULT_AGB = `<p><strong>Building Solutions GmbH</strong><br/>Ottostraße 14, 50170 Kerpen<br/>Stand: April 2026</p>

<h3>1. Geltungsbereich</h3>
<p>1.1 Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche Verträge, Lieferungen und Leistungen der Building Solutions GmbH, Ottostraße 14, 50170 Kerpen (nachfolgend \u201eAuftragnehmer\u201c), im Bereich Sicherheitstechnik, Kommunikationstechnik, Elektrotechnik und verwandter Dienstleistungen.</p>
<p>1.2 Das Angebot richtet sich an Unternehmer im Sinne des § 14 BGB, juristische Personen des öffentlichen Rechts sowie Verbraucher, soweit nicht einzelne Klauseln ausdrücklich nur für Unternehmer gelten.</p>
<p>1.3 Abweichende, entgegenstehende oder ergänzende AGB des Auftraggebers werden nur dann Vertragsbestandteil, wenn der Auftragnehmer ihrer Geltung ausdrücklich schriftlich zugestimmt hat.</p>

<h3>2. Leistungsumfang</h3>
<p>2.1 Der Auftragnehmer erbringt insbesondere folgende Leistungen:</p>
<ul>
<li>Planung, Installation und Wartung von Sicherheitssystemen (Einbruchmeldeanlagen, Zutrittskontrolle)</li>
<li>Videoüberwachungssysteme (CCTV-Planung, Montage, Inbetriebnahme)</li>
<li>Gefahrenmanagement (Brandmeldeanlagen, Rauch- und Gaswarnmelder)</li>
<li>Kommunikationstechnik (Netzwerkinfrastruktur, Sprechanlagen, Telefonanlagen)</li>
<li>Elektrotechnische Installationen und Prüfungen</li>
<li>Reparatur und Instandhaltung technischer Geräte und Anlagen</li>
<li>Photovoltaikanlagen (Planung, Installation, Inbetriebnahme)</li>
</ul>
<p>2.2 Der genaue Leistungsumfang ergibt sich aus dem jeweiligen Angebot bzw. der Auftragsbestätigung.</p>
<p>2.3 Darstellungen auf der Website stellen kein verbindliches Angebot dar, sondern eine unverbindliche Leistungsbeschreibung.</p>

<h3>3. Vertragsschluss</h3>
<p>3.1 Ein Vertrag kommt erst durch schriftliche Auftragsbestätigung oder Beginn der Leistungserbringung durch den Auftragnehmer zustande.</p>
<p>3.2 Angebote des Auftragnehmers sind freibleibend und 30 Tage gültig, sofern nicht anders angegeben.</p>
<p>3.3 Änderungen und Ergänzungen des Vertrages bedürfen der Schriftform.</p>

<h3>4. Preise und Zahlungsbedingungen</h3>
<p>4.1 Alle Preise verstehen sich in Euro netto zuzüglich der jeweils geltenden gesetzlichen Umsatzsteuer sowie etwaiger Material- und Fahrtkosten, sofern im Angebot nicht anders ausgewiesen.</p>
<p>4.2 Rechnungen sind, sofern nicht anders vereinbart, innerhalb von 14 Tagen ab Rechnungsdatum ohne Abzug zahlbar.</p>
<p>4.3 Bei Zahlungsverzug gelten Verzugszinsen in gesetzlicher Höhe: 5 Prozentpunkte über dem Basiszinssatz bei Verbrauchern (§ 288 Abs. 1 BGB), 9 Prozentpunkte über dem Basiszinssatz bei Unternehmern (§ 288 Abs. 2 BGB).</p>
<p>4.4 Der Auftragnehmer ist berechtigt, bei Zahlungsverzug weitere Leistungen zurückzuhalten oder Vorauszahlung zu verlangen.</p>
<p>4.5 Bei Aufträgen mit einem Gesamtwert über 5.000\u00a0\u20ac netto kann der Auftragnehmer Abschlagszahlungen entsprechend dem Leistungsfortschritt verlangen.</p>

<h3>5. Ausführung und Termine</h3>
<p>5.1 Leistungstermine sind nur verbindlich, wenn sie ausdrücklich schriftlich als verbindlich vereinbart wurden.</p>
<p>5.2 Der Auftraggeber hat die notwendigen Voraussetzungen für die Leistungserbringung rechtzeitig zu schaffen (z.\u00a0B. Zugang zum Objekt, Stromversorgung, Baufreiheit).</p>
<p>5.3 Verzögerungen durch höhere Gewalt, Lieferengpässe oder vom Auftraggeber zu vertretende Umstände berechtigen den Auftragnehmer zur angemessenen Terminverschiebung.</p>
<p>5.4 Der Auftraggeber wird über absehbare Verzögerungen unverzüglich informiert.</p>

<h3>6. Abnahme</h3>
<p>6.1 Nach Fertigstellung der Leistung ist der Auftraggeber zur Abnahme verpflichtet.</p>
<p>6.2 Die Abnahme gilt als erfolgt, wenn der Auftraggeber die Leistung nicht innerhalb von 12 Werktagen nach Fertigstellungsmitteilung unter Angabe konkreter Mängel schriftlich beanstandet.</p>
<p>6.3 Unwesentliche Mängel berechtigen nicht zur Verweigerung der Abnahme.</p>

<h3>7. Gewährleistung</h3>
<p>7.1 Der Auftragnehmer gewährleistet, dass die erbrachten Leistungen den anerkannten Regeln der Technik und den vertraglich vereinbarten Anforderungen entsprechen.</p>
<p>7.2 Mängel sind unverzüglich nach Feststellung schriftlich anzuzeigen.</p>
<p>7.3 Bei berechtigten Mängelrügen hat der Auftragnehmer das Recht zur Nachbesserung innerhalb einer angemessenen Frist.</p>
<p>7.4 Die Gewährleistungsfrist beträgt 2 Jahre ab Abnahme, sofern nicht gesetzlich eine längere Frist vorgeschrieben ist.</p>
<p>7.5 Verschleißteile (z.\u00a0B. Batterien, Leuchtmittel, Sicherungen) sind von der Gewährleistung ausgenommen, sofern diese einer normalen Abnutzung unterliegen.</p>

<h3>8. Haftung</h3>
<p>8.1 Der Auftragnehmer haftet unbeschränkt bei Vorsatz, grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.</p>
<p>8.2 Bei leichter Fahrlässigkeit haftet der Auftragnehmer nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten) und beschränkt auf den vertragstypischen, vorhersehbaren Schaden.</p>
<p>8.3 Die Haftung für mittelbare Schäden, insbesondere Produktionsausfälle, entgangenen Gewinn oder Datenverlust, ist ausgeschlossen, soweit gesetzlich zulässig.</p>
<p>8.4 Die Haftungsbeschränkungen gelten nicht, soweit der Auftragnehmer einen Mangel arglistig verschwiegen oder eine Garantie für die Beschaffenheit übernommen hat.</p>

<h3>9. Eigentumsvorbehalt</h3>
<p>9.1 Gelieferte Materialien und Geräte bleiben bis zur vollständigen Bezahlung sämtlicher Forderungen Eigentum des Auftragnehmers.</p>
<p>9.2 Der Auftraggeber ist verpflichtet, die Vorbehaltsware pfleglich zu behandeln.</p>

<h3>10. Stornierung und Kündigung</h3>
<p>10.1 Der Auftraggeber kann den Vertrag vor Leistungsbeginn kündigen. In diesem Fall steht dem Auftragnehmer ein Anspruch auf Vergütung der bereits erbrachten Leistungen sowie auf Ersatz entstandener Aufwendungen zu.</p>
<p>10.2 Eine Kündigung nach Beginn der Leistungserbringung ist nur aus wichtigem Grund möglich.</p>
<p>10.3 Die Kündigung bedarf der Schriftform.</p>

<h3>11. Wartungsverträge</h3>
<p>11.1 Wartungsverträge haben eine Mindestlaufzeit von 12 Monaten und verlängern sich automatisch um jeweils weitere 12 Monate, sofern sie nicht 3 Monate vor Ablauf schriftlich gekündigt werden.</p>
<p>11.2 Der Umfang der Wartungsleistungen ergibt sich aus dem jeweiligen Wartungsvertrag.</p>
<p>11.3 Der Auftragnehmer ist berechtigt, die Wartungsvergütung bei gestiegenen Kosten mit einer Ankündigungsfrist von 4 Wochen anzupassen. Bei einer Erhöhung von mehr als 5\u00a0% hat der Auftraggeber ein Sonderkündigungsrecht.</p>

<h3>12. Datenschutz</h3>
<p>12.1 Die Verarbeitung personenbezogener Daten erfolgt gemäß der Datenschutzerklärung auf unserer Website und den geltenden datenschutzrechtlichen Bestimmungen (DSGVO, BDSG).</p>
<p>12.2 Soweit im Rahmen der Leistungserbringung personenbezogene Daten des Auftraggebers verarbeitet werden (z.\u00a0B. bei Videoüberwachungs- oder Zutrittskontrollsystemen), wird bei Bedarf eine Vereinbarung zur Auftragsverarbeitung gemäß Art.\u00a028 DSGVO geschlossen.</p>

<h3>13. Geheimhaltung</h3>
<p>13.1 Beide Vertragsparteien verpflichten sich, alle im Rahmen der Zusammenarbeit erhaltenen vertraulichen Informationen, insbesondere technische Details zu Sicherheitssystemen und Gebäudeinfrastruktur, geheim zu halten.</p>
<p>13.2 Diese Verpflichtung besteht auch nach Beendigung des Vertragsverhältnisses fort.</p>

<h3>14. Gerichtsstand und anwendbares Recht</h3>
<p>14.1 Für sämtliche Streitigkeiten aus dem Vertragsverhältnis zwischen Unternehmern ist der Gerichtsstand Köln.</p>
<p>14.2 Für Verbraucher gilt der gesetzliche Gerichtsstand.</p>
<p>14.3 Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).</p>

<h3>15. Streitbeilegung</h3>
<p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. Wir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

<h3>16. Salvatorische Klausel</h3>
<p>Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, so wird dadurch die Wirksamkeit der übrigen Bestimmungen nicht berührt. An die Stelle der unwirksamen Bestimmung tritt eine Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.</p>`;

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
