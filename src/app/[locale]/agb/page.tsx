import contactData from "@/data/contact.json";
import { storeGet } from "@/lib/admin-store";

export async function generateMetadata() {
  return { title: `AGB | ${contactData.company}` };
}

export default async function AGBPage() {
  const legal = (await storeGet("legal-pages")) as { agb?: string } | null;
  const content = legal?.agb;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h1 className="text-3xl lg:text-4xl font-bold text-bs-gray-900 mb-12">
          Allgemeine Geschäftsbedingungen
        </h1>

        {content ? (
          <div
            className="prose prose-gray max-w-none text-bs-gray-700 text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-bs-gray-500">Die AGB werden in Kürze veröffentlicht.</p>
        )}
      </div>
    </div>
  );
}
