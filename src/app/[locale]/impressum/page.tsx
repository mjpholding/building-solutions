import { getTranslations } from "next-intl/server";
import contactData from "@/data/contact.json";
import { storeGet } from "@/lib/admin-store";

export async function generateMetadata() {
  const t = await getTranslations("footer");
  return { title: `${t("imprint")} | ${contactData.company}` };
}

export default async function ImpressumPage() {
  const t = await getTranslations("footer");

  // Check if custom content exists in Redis
  const legal = (await storeGet("legal-pages")) as { impressum?: string; datenschutz?: string } | null;
  const customContent = legal?.impressum;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h1 className="text-3xl lg:text-4xl font-bold text-bs-gray-900 mb-12">
          {t("imprint")}
        </h1>

        {customContent ? (
          <div
            className="prose prose-gray max-w-none text-bs-gray-700 text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: customContent }}
          />
        ) : (
          <div className="prose prose-gray max-w-none space-y-10 text-bs-gray-700 text-[15px] leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">Angaben gemäß § 5 TMG</h2>
              <p>
                <strong>{contactData.company}</strong><br />
                {contactData.address}<br />
                {contactData.zip} {contactData.city}<br />
                {contactData.country}
              </p>
            </section>

            {contactData.managingDirector && (
              <section>
                <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">Vertreten durch</h2>
                <p>Geschäftsführer: {contactData.managingDirector}</p>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">Kontakt</h2>
              <p>
                Telefon: {contactData.phone}<br />
                {contactData.fax && <>Fax: {contactData.fax}<br /></>}
                E-Mail: <a href={`mailto:${contactData.email}`} className="text-bs-accent hover:underline">{contactData.email}</a><br />
                Web: <a href={`https://${contactData.website}`} className="text-bs-accent hover:underline">{contactData.website}</a>
              </p>
            </section>

            {contactData.taxId && (
              <section>
                <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">Umsatzsteuer-Identifikationsnummer</h2>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
                  <strong>{contactData.taxId}</strong>
                </p>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">EU-Streitschlichtung</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-bs-accent hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">Haftung für Inhalte</h2>
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
                allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
                verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-bs-gray-900 mb-3">Urheberrecht</h2>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
                deutschen Urheberrecht.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
