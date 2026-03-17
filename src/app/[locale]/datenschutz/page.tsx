import { getTranslations } from "next-intl/server";
import contactData from "@/data/contact.json";

export async function generateMetadata() {
  const t = await getTranslations("footer");
  return { title: `${t("privacy")} | ${contactData.company}` };
}

export default async function DatenschutzPage() {
  const t = await getTranslations("footer");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h1 className="text-3xl lg:text-4xl font-bold text-swish-gray-900 mb-2">
          {t("privacy")}
        </h1>
        <p className="text-sm text-swish-gray-400 mb-12">
          Stand: März 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-10 text-swish-gray-700 text-[15px] leading-relaxed">
          {/* 1. Verantwortlicher */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">1. Verantwortlicher</h2>
            <p>
              {contactData.company}<br />
              {contactData.address}<br />
              {contactData.zip} {contactData.city}<br />
              {contactData.country}<br />
              E-Mail: {contactData.email}<br />
              Telefon: {contactData.phone}
            </p>
          </section>

          {/* 2. Allgemeines */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
            <p>
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
              vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p className="mt-3">
              Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. Soweit
              auf unseren Seiten personenbezogene Daten (z.B. Name, Anschrift oder E-Mail-Adresse) erhoben werden,
              erfolgt dies, soweit möglich, stets auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche
              Zustimmung nicht an Dritte weitergegeben.
            </p>
          </section>

          {/* 3. Hosting */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">3. Hosting</h2>
            <p>
              Unsere Website wird bei Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA gehostet.
              Beim Besuch unserer Webseite erfasst der Server automatisch Informationen in sogenannten Server-Log-Dateien,
              die Ihr Browser automatisch übermittelt. Dies sind:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Browsertyp und -version</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p className="mt-3">
              Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit anderen
              Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1
              lit. f DSGVO.
            </p>
          </section>

          {/* 4. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">4. Cookies</h2>
            <p>
              Unsere Webseite verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät
              speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher und sicherer zu machen.
            </p>
            <p className="mt-3">
              Wir verwenden folgende Arten von Cookies:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Technisch notwendige Cookies:</strong> Diese sind für den Betrieb der Seite erforderlich (z.B. Session-Cookies für den Warenkorb und die Anmeldung).</li>
              <li><strong>Spracheinstellungen:</strong> Zur Speicherung Ihrer bevorzugten Sprache.</li>
            </ul>
            <p className="mt-3">
              Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und
              Cookies nur im Einzelfall erlauben oder die Annahme von Cookies generell ausschließen. Bei der
              Deaktivierung von Cookies kann die Funktionalität unserer Webseite eingeschränkt sein.
            </p>
          </section>

          {/* 5. Kontaktformular */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">5. Kontaktformular</h2>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular
              inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall
              von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
            <p className="mt-3">
              Die Verarbeitung der in das Kontaktformular eingegebenen Daten erfolgt somit ausschließlich auf Grundlage
              Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Rechtsgrundlage ist zudem Art. 6 Abs. 1 lit. b DSGVO,
              sofern die Anfrage auf den Abschluss eines Vertrages abzielt.
            </p>
          </section>

          {/* 6. Kundenkonto */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">6. Kundenkonto und Bestellungen</h2>
            <p>
              Bei der Registrierung eines Kundenkontos erheben wir personenbezogene Daten (Name, E-Mail-Adresse,
              Firmenname, Telefon, Adresse). Diese Daten dienen der Vertragsdurchführung und zur Verwaltung Ihres
              Kontos gemäß Art. 6 Abs. 1 lit. b DSGVO.
            </p>
            <p className="mt-3">
              Bestelldaten werden für die Dauer der gesetzlichen Aufbewahrungsfristen (in der Regel 10 Jahre gemäß
              § 147 AO) gespeichert.
            </p>
          </section>

          {/* 7. Ihre Rechte */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">7. Ihre Rechte</h2>
            <p>Sie haben jederzeit das Recht:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten zu verlangen (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung zu verlangen (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung einzulegen (Art. 21 DSGVO)</li>
              <li>Sich bei einer Aufsichtsbehörde zu beschweren (Art. 77 DSGVO)</li>
            </ul>
          </section>

          {/* 8. SSL/TLS */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">8. SSL- bzw. TLS-Verschlüsselung</h2>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine
              SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile
              des Browsers von &quot;http://&quot; auf &quot;https://&quot; wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
            </p>
          </section>

          {/* 9. Änderungen */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">9. Änderung der Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
              rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
              Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue
              Datenschutzerklärung.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
