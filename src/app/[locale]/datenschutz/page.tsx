import { getTranslations } from "next-intl/server";
import contactData from "@/data/contact.json";
import { storeGet } from "@/lib/admin-store";

export async function generateMetadata() {
  const t = await getTranslations("footer");
  return { title: `${t("privacy")} | ${contactData.company}` };
}

export default async function DatenschutzPage() {
  const t = await getTranslations("footer");

  // Check if custom content exists in Redis
  const legal = (await storeGet("legal-pages")) as { impressum?: string; datenschutz?: string } | null;
  const customContent = legal?.datenschutz;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h1 className="text-3xl lg:text-4xl font-bold text-bs-gray-900 mb-2">
          {t("privacy")}
        </h1>
        <p className="text-sm text-bs-gray-400 mb-12">
          Stand: März 2026
        </p>

        {customContent ? (
          <div
            className="prose prose-gray max-w-none text-bs-gray-700 text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: customContent }}
          />
        ) : (
          <div className="prose prose-gray max-w-none space-y-10 text-bs-gray-700 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">1. Verantwortlicher</h2>
              <p>
                {contactData.company}<br />
                {contactData.address}<br />
                {contactData.zip} {contactData.city}<br />
                {contactData.country}<br />
                E-Mail: {contactData.email}<br />
                Telefon: {contactData.phone}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
              <p>
                Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
                vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">3. Hosting</h2>
              <p>
                Unsere Website wird bei Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA gehostet.
                Beim Besuch unserer Webseite erfasst der Server automatisch Informationen in sogenannten Server-Log-Dateien.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Browsertyp und -version</li>
                <li>Verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">4. Cookies</h2>
              <p>
                Wir verwenden ausschließlich technisch notwendige Cookies (Session-Cookies für den Warenkorb
                und die Anmeldung) sowie Cookies zur Speicherung Ihrer bevorzugten Sprache.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">5. Kontaktformular</h2>
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben zwecks Bearbeitung
                der Anfrage bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">6. Kundenkonto und Bestellungen</h2>
              <p>
                Bei der Registrierung eines Kundenkontos erheben wir personenbezogene Daten. Diese Daten dienen
                der Vertragsdurchführung gemäß Art. 6 Abs. 1 lit. b DSGVO. Bestelldaten werden für die Dauer
                der gesetzlichen Aufbewahrungsfristen (10 Jahre gemäß § 147 AO) gespeichert.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">7. Ihre Rechte</h2>
              <p>Sie haben jederzeit das Recht auf:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
                <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
                <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">8. SSL/TLS-Verschlüsselung</h2>
              <p>
                Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">9. Änderung der Datenschutzerklärung</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
                rechtlichen Anforderungen entspricht.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
