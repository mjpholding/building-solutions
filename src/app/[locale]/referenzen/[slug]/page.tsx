"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Calendar, MapPin, Maximize2, Wrench, Star, ChevronLeft, ChevronRight } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import ReferencePlaceholder from "@/components/ReferencePlaceholder";

interface Reference {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  client: string;
  category: string;
  buildingType: string;
  address: string;
  area: string;
  scope: string;
  images: string[];
  year: number;
  featured: boolean;
}

const CAT_LABELS: Record<string, string> = {
  security: "Sicherheit",
  video: "Video",
  hazard: "Gefahren",
  communication: "Kommunikation",
  electrical: "Elektro",
  repairs: "Reparatur",
  pv: "Photovoltaik",
};

const BUILDING_LABELS: Record<string, string> = {
  bildung: "Bildung",
  gesundheit: "Gesundheit",
  oeffentlich: "Öffentliche Gebäude",
  verkehr: "Verkehr",
  industrie: "Industrie",
  kultur: "Kultur & Freizeit",
  wohnen: "Wohnen",
  buero: "Büro & Verwaltung",
};

export default function ReferenzDetailPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = use(params);
  const t = useTranslations("references");
  const [ref, setRef] = useState<Reference | null>(null);
  const [allRefs, setAllRefs] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch("/api/references")
      .then((r) => r.json())
      .then((data: Reference[]) => {
        const list = Array.isArray(data) ? data : [];
        setAllRefs(list);
        const found = list.find((r) => r.slug === slug);
        setRef(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const related = ref
    ? allRefs
        .filter((r) => r.slug !== ref.slug && (r.buildingType === ref.buildingType || r.category === ref.category))
        .slice(0, 3)
    : [];

  const images = ref?.images?.filter(Boolean) ?? [];
  const hasImages = images.length > 0;

  const prevImage = () => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  if (loading) {
    return (
      <>
        <PageBanner title={t("title")} />
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-96 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </section>
      </>
    );
  }

  if (!ref) {
    return (
      <>
        <PageBanner title={t("title")} />
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Building2 size={56} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-bs-mitternacht mb-2">{t("notFound")}</h2>
          <p className="text-gray-500 mb-6">{t("notFoundDescription")}</p>
          <Link
            href={`/${locale}/referenzen`}
            className="inline-flex items-center gap-2 bg-bs-tuerkisblau text-white px-5 py-2.5 rounded-lg hover:bg-bs-mitternacht transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} /> {t("backToList")}
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <PageBanner title={ref.title} subtitle={ref.address || ref.client} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <Link
          href={`/${locale}/referenzen`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-bs-tuerkisblau mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> {t("backToList")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden bg-bs-hellgrau aspect-[16/10]"
            >
              {hasImages ? (
                <>
                  <img
                    src={images[activeImage]}
                    alt={`${ref.title} ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                        aria-label="Previous"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md"
                        aria-label="Next"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              i === activeImage ? "bg-white w-6" : "bg-white/60"
                            }`}
                            aria-label={`Image ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <ReferencePlaceholder size="lg" />
              )}
            </motion.div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-bs-tuerkisblau" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="prose prose-sm max-w-none">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {ref.featured && (
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                    <Star size={12} fill="currentColor" /> {t("featured")}
                  </span>
                )}
                {ref.buildingType && (
                  <span className="text-xs bg-bs-tuerkis/25 text-bs-mitternacht px-2.5 py-1 rounded-full font-semibold">
                    {BUILDING_LABELS[ref.buildingType] || ref.buildingType}
                  </span>
                )}
                {ref.category && (
                  <span className="text-xs bg-bs-tuerkisblau/10 text-bs-tuerkisblau px-2.5 py-1 rounded-full font-medium">
                    {CAT_LABELS[ref.category] || ref.category}
                  </span>
                )}
              </div>

              {ref.description && (
                <p className="text-lg text-gray-700 leading-relaxed font-medium !mt-0">{ref.description}</p>
              )}

              {ref.longDescription && (
                <div className="text-gray-600 leading-relaxed whitespace-pre-line mt-4">{ref.longDescription}</div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-bs-hellgrau rounded-2xl p-6 sticky top-24 space-y-5">
              <h3 className="font-bold text-bs-mitternacht text-lg">{t("projectData")}</h3>

              {ref.client && (
                <InfoRow icon={<Building2 size={16} />} label={t("client")} value={ref.client} />
              )}
              {ref.address && (
                <InfoRow
                  icon={<MapPin size={16} />}
                  label={t("address")}
                  value={ref.address}
                  href={googleStreetViewUrl(ref.address)}
                />
              )}
              {ref.year && (
                <InfoRow icon={<Calendar size={16} />} label={t("year")} value={String(ref.year)} />
              )}
              {ref.area && (
                <InfoRow icon={<Maximize2 size={16} />} label={t("area")} value={ref.area} />
              )}
              {ref.scope && (
                <InfoRow icon={<Wrench size={16} />} label={t("scope")} value={ref.scope} />
              )}

              <div className="pt-4 border-t border-bs-grau">
                <Link
                  href={`/${locale}/kontakt`}
                  className="block w-full text-center bg-bs-tuerkis hover:bg-bs-tuerkis/90 text-bs-mitternacht px-5 py-3 rounded-lg font-semibold text-sm transition-colors shadow-md shadow-bs-tuerkis/20"
                >
                  {t("requestSimilar")}
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16 lg:mt-24 pt-10 border-t border-bs-grau">
            <h2 className="text-2xl font-bold text-bs-mitternacht mb-6">{t("relatedProjects")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/${locale}/referenzen/${r.slug}`}
                  className="bg-white rounded-2xl border border-bs-grau overflow-hidden hover:shadow-lg hover:border-bs-tuerkisblau/30 transition-all"
                >
                  <div className="h-40 flex items-center justify-center overflow-hidden">
                    {r.images?.[0] ? (
                      <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" />
                    ) : (
                      <ReferencePlaceholder size="sm" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-bs-mitternacht text-sm mb-1">{r.title}</h3>
                    {r.address && <p className="text-xs text-gray-500">{r.address}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center text-bs-tuerkisblau">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
        <div
          className={`text-sm font-medium break-words ${
            href ? "text-bs-tuerkisblau hover:text-bs-tuerkis underline decoration-bs-tuerkis/30 underline-offset-2" : "text-bs-mitternacht"
          }`}
        >
          {value}
        </div>
      </div>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 transition-colors"
        title="In Google Maps öffnen"
      >
        {body}
      </a>
    );
  }
  return <div className="flex gap-3">{body}</div>;
}

function googleStreetViewUrl(address: string): string {
  const q = encodeURIComponent(address);
  // layer=c turns on Street View; Maps falls back to a normal view if no panorama is available
  return `https://www.google.com/maps?q=${q}&layer=c`;
}
