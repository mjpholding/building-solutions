"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import PageBanner from "@/components/layout/PageBanner";
import { motion } from "framer-motion";
import { Building2, Calendar, MapPin, Star } from "lucide-react";

interface Reference {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  client: string;
  category: string;
  buildingType?: string;
  address?: string;
  area?: string;
  scope?: string;
  images: string[];
  year: number;
  featured: boolean;
}

const CAT_LABELS: Record<string, string> = {
  security: "Sicherheit", video: "Video", hazard: "Gefahren", communication: "Kommunikation",
  electrical: "Elektro", repairs: "Reparatur", pv: "Photovoltaik",
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

export default function ReferenzenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations("references");
  const [refs, setRefs] = useState<Reference[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/references").then((r) => r.json()).then((d) => { setRefs(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const buildingTypes = ["all", ...Array.from(new Set(refs.map((r) => r.buildingType).filter(Boolean))) as string[]];
  const filtered = filter === "all" ? refs : refs.filter((r) => r.buildingType === filter);

  return (
    <>
      <PageBanner title={t("title")} subtitle={t("subtitle")} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="bg-bs-hellgrau rounded-2xl h-64 animate-pulse" />)}</div>
        ) : refs.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t("empty")}</p>
          </div>
        ) : (
          <>
            {buildingTypes.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {buildingTypes.map((bt) => (
                  <button key={bt} onClick={() => setFilter(bt)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === bt ? "bg-bs-tuerkisblau text-white" : "bg-bs-hellgrau text-gray-600 hover:bg-bs-grau"}`}>
                    {bt === "all" ? t("allCategories") : BUILDING_LABELS[bt] || bt}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((ref, i) => (
                <motion.div key={ref.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    href={`/${locale}/referenzen/${ref.slug}`}
                    className="group block bg-white rounded-2xl border border-bs-grau overflow-hidden hover:shadow-lg hover:border-bs-tuerkisblau/40 transition-all h-full"
                  >
                    <div className="h-48 bg-gradient-to-br from-bs-hellgrau to-bs-grau flex items-center justify-center overflow-hidden">
                      {ref.images?.[0] ? (
                        <img src={ref.images[0]} alt={ref.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Building2 size={40} className="text-gray-400" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {ref.featured && <Star size={14} className="text-yellow-500" fill="currentColor" />}
                        {ref.buildingType && <span className="text-[10px] bg-bs-tuerkis/25 text-bs-mitternacht px-2 py-0.5 rounded-full font-semibold">{BUILDING_LABELS[ref.buildingType] || ref.buildingType}</span>}
                        {ref.category && <span className="text-[10px] bg-bs-tuerkisblau/10 text-bs-tuerkisblau px-2 py-0.5 rounded-full font-medium">{CAT_LABELS[ref.category] || ref.category}</span>}
                      </div>
                      <h3 className="font-bold text-bs-mitternacht mb-1 group-hover:text-bs-tuerkisblau transition-colors">{ref.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                        {ref.client && <span className="flex items-center gap-1"><Building2 size={12} /> {ref.client}</span>}
                        {ref.address && <span className="flex items-center gap-1"><MapPin size={12} /> {ref.address}</span>}
                        {ref.year && <span className="flex items-center gap-1"><Calendar size={12} /> {ref.year}</span>}
                      </div>
                      {ref.description && <p className="text-sm text-gray-600 line-clamp-3">{ref.description}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
