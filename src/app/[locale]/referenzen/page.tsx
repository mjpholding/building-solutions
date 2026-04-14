"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PageBanner from "@/components/layout/PageBanner";
import { motion } from "framer-motion";
import { Building2, Calendar, Star } from "lucide-react";

interface Reference {
  id: string; title: string; description: string; client: string;
  category: string; images: string[]; year: number; featured: boolean;
}

const CAT_LABELS: Record<string, string> = {
  security: "Sicherheit", video: "Video", hazard: "Gefahren", communication: "Kommunikation",
  electrical: "Elektro", repairs: "Reparatur", pv: "Photovoltaik",
};

export default function ReferenzenPage() {
  const t = useTranslations("references");
  const [refs, setRefs] = useState<Reference[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/references").then((r) => r.json()).then((d) => { setRefs(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...Array.from(new Set(refs.map((r) => r.category).filter(Boolean)))];
  const filtered = filter === "all" ? refs : refs.filter((r) => r.category === filter);

  return (
    <>
      <PageBanner title={t("title")} subtitle={t("subtitle")} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />)}</div>
        ) : refs.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t("empty")}</p>
          </div>
        ) : (
          <>
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === cat ? "bg-bs-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {cat === "all" ? t("allCategories") : CAT_LABELS[cat] || cat}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((ref, i) => (
                <motion.div key={ref.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-bs-gray-100 to-bs-gray-200 flex items-center justify-center">
                    {ref.images?.[0] ? <img src={ref.images[0]} alt={ref.title} className="w-full h-full object-cover" /> : <Building2 size={40} className="text-bs-gray-400" />}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {ref.featured && <Star size={14} className="text-yellow-500" fill="currentColor" />}
                      {ref.category && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{CAT_LABELS[ref.category] || ref.category}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{ref.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-bs-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Building2 size={12} /> {ref.client}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {ref.year}</span>
                    </div>
                    {ref.description && <p className="text-sm text-bs-gray-600 line-clamp-3">{ref.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
