import { getTranslations } from "next-intl/server";
import contactData from "@/data/contact.json";

export async function generateMetadata() {
  const t = await getTranslations("footer");
  return { title: `${t("imprint")} | ${contactData.company}` };
}

export default async function ImpressumPage() {
  const t = await getTranslations("footer");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h1 className="text-3xl lg:text-4xl font-bold text-swish-gray-900 mb-12">
          {t("imprint")}
        </h1>

        <div className="prose prose-gray max-w-none space-y-10 text-swish-gray-700 text-[15px] leading-relaxed">
          {/* Angaben gemäß § 5 TMG */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">Angaben gemäß § 5 TMG</h2>
            <p>
              <strong>{contactData.company}</strong><br />
              {contactData.address}<br />
              {contactData.zip} {contactData.city}<br />
              {contactData.country}
            </p>
          </section>

          {/* Vertreten durch */}
          {contactData.managingDirector && (
            <section>
              <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">Vertreten durch</h2>
              <p>Geschäftsführer: {contactData.managingDirector}</p>
            </section>
          )}

          {/* Kontakt */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">Kontakt</h2>
            <p>
              Telefon: {contactData.phone}<br />
              {contactData.fax && <>Fax: {contactData.fax}<br /></>}
              E-Mail: <a href={`mailto:${contactData.email}`} className="text-swish-red hover:underline">{contactData.email}</a><br />
              Web: <a href={`https://${contactData.website}`} className="text-swish-red hover:underline">{contactData.website}</a>
            </p>
          </section>

          {/* USt-IdNr */}
          {contactData.taxId && (
            <section>
              <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">Umsatzsteuer-Identifikationsnummer</h2>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
                <strong>{contactData.taxId}</strong>
              </p>
            </section>
          )}

          {/* Streitschlichtung */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-swish-red hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-3">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          {/* Verbraucherstreitbeilegung */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">
              Verbraucherstreitbeilegung / Universalschlichtungsstelle
            </h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          {/* Haftung für Inhalte */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="mt-3">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
              Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt
              der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
              Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          {/* Haftung für Links */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss
              haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte
              der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
              Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className="mt-3">
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte
              einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
              derartige Links umgehend entfernen.
            </p>
          </section>

          {/* Urheberrecht */}
          <section>
            <h2 className="text-xl font-semibold text-swish-gray-900 mb-3">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
              deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
              des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den
              privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="mt-3">
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
              Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
              gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
