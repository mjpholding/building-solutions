"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Search, Filter, ArrowRight, Droplets, X } from "lucide-react";

// Temporary inline data until products.ts is ready
const productsList = [
  { slug: "poly-lock-ultra", name: "POLY LOCK ULTRA", ph: "8.0 - 9.0", category: "floors", desc: "2-in-1 Versiegelung und Glanzgebung für Böden. Erzeugt eine sehr haltbare Schutzschicht mit hohem Glanz." },
  { slug: "super-clean", name: "SUPER CLEAN", ph: "11.0 - 12.0", category: "special", desc: "Universeller alkalischer Kraftreiniger für alle wasserbeständigen Oberflächen." },
  { slug: "office-clean", name: "OFFICE CLEAN", ph: "9.0 - 10.0", category: "special", desc: "Schonender Reiniger für Bürooberflächen, Schreibtische und Geräte." },
  { slug: "glass-clean", name: "GLASS CLEAN", ph: "9.0 - 10.0", category: "special", desc: "Streifenfreier Glasreiniger für Fenster, Spiegel und Glasflächen." },
  { slug: "kling", name: "KLING", ph: "8.0 - 10.0", category: "sanitary", desc: "Kraftvoller Badreiniger mit Haftformel für vertikale Flächen." },
  { slug: "scale-remover", name: "SCALE REMOVER", ph: "0.5 - 1.0", category: "sanitary", desc: "Entfernt hartnäckige Kalk- und Mineralablagerungen." },
  { slug: "sani-clean", name: "SANI CLEAN", ph: "2.5 - 3.5", category: "sanitary", desc: "Saurer Sanitärreiniger für tägliche Pflege von WC und Waschbecken." },
  { slug: "sp-105-nano-clean-shine", name: "SP-105 NANO CLEAN & SHINE", ph: "7.0 - 8.0", category: "floors", desc: "Nano-Technologie Reiniger mit Glanzeffekt für alle Hartböden." },
  { slug: "sun-up", name: "SUN UP", ph: "8.0 - 9.0", category: "floors", desc: "Täglicher Bodenreiniger mit frischem Duft." },
  { slug: "sunbeam", name: "SUNBEAM", ph: "6.5 - 7.5", category: "floors", desc: "Neutraler Bodenreiniger für empfindliche Oberflächen." },
  { slug: "jet", name: "JET", ph: "12.0 - 13.0", category: "floors", desc: "Stark alkalischer Bodenreiniger für hartnäckige Verschmutzungen." },
  { slug: "winterinse", name: "WINTERINSE", ph: "12.0 - 13.0", category: "floors", desc: "Entfernt Salzrückstände und Winterverschmutzungen von Böden." },
  { slug: "de-grease", name: "DE-GREASE", ph: "10.4 - 11.4", category: "special", desc: "Kraftvoller Fettlöser-Spray für Küche und Industrie." },
  { slug: "fresh-air-nectarine", name: "FRESH AIR NECTARINE", ph: "7.5", category: "odor", desc: "Lufterfrischer mit Nektarinenduft zur Geruchsneutralisierung." },
  { slug: "quato-78-professional", name: "QUATO 78 PROFESSIONAL", ph: "7.0", category: "disinfection", desc: "Professionelles Flächendesinfektionsmittel für alle Bereiche." },
  { slug: "food-service-concentrate", name: "FOOD SERVICE", ph: "12.5 - 13.5", category: "food", desc: "Konzentrat zur Reinigung in der Gastronomie und Lebensmittelindustrie." },
  { slug: "facto-hd40", name: "FACTO HD40", ph: "12.0 - 13.0", category: "industry", desc: "Industrieller Kraftreiniger für stark verschmutzte Maschinen und Böden." },
  { slug: "facto-at30", name: "FACTO AT30", ph: "12.0 - 12.5", category: "transport", desc: "Spezialreiniger für Fahrzeuge und Transportmittel." },
  { slug: "e10-neutral", name: "E10 NEUTRAL", ph: "6.0 - 8.0", category: "economy", desc: "Neutraler Universalreiniger der Economy-Linie." },
  { slug: "e50-strong", name: "E50 STRONG", ph: "12.5 - 13.5", category: "economy", desc: "Stark alkalischer Reiniger der Economy-Linie für hartnäckige Verschmutzungen." },
  { slug: "stain-remover", name: "STAIN REMOVER", ph: "10.0 - 11.0", category: "carpets", desc: "Fleckenentferner für Teppiche und textile Bodenbeläge." },
  { slug: "essence-magic-garden", name: "SWISH ESSENCE MAGIC GARDEN", ph: "6.5 - 7.5", category: "odor", desc: "Duftessenz mit frischem Gartenduft zur Raumbeduftung." },
];

const categoryOptions = [
  { value: "", label: "Alle" },
  { value: "floors", label: "Böden" },
  { value: "sanitary", label: "Sanitär" },
  { value: "special", label: "Spezial" },
  { value: "odor", label: "Geruch" },
  { value: "carpets", label: "Teppiche" },
  { value: "disinfection", label: "Desinfektion" },
  { value: "food", label: "Gastronomie" },
  { value: "industry", label: "Industrie" },
  { value: "transport", label: "Transport" },
  { value: "economy", label: "Economy" },
];

function getPHColor(ph: string): string {
  const val = parseFloat(ph.split("-")[0].trim());
  if (val < 3) return "text-red-600 bg-red-50";
  if (val < 6) return "text-orange-600 bg-orange-50";
  if (val < 8) return "text-green-600 bg-green-50";
  if (val < 10) return "text-blue-600 bg-blue-50";
  return "text-purple-600 bg-purple-50";
}

export default function ProductsPage() {
  const t = useTranslations("products");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    return productsList.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.desc.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || p.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-swish-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-swish-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-swish-gray-900">{t("title")}</h1>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-swish-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search")}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all bg-white"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-swish-gray-400 hover:text-swish-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === opt.value
                      ? "bg-swish-red text-white shadow-sm"
                      : "bg-white text-swish-gray-600 border border-swish-gray-200 hover:border-swish-red/30 hover:text-swish-red"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Filter size={48} className="mx-auto text-swish-gray-300 mb-4" />
            <p className="text-swish-gray-500 text-lg">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/produkte/${product.slug}`}
                  className="group block bg-white rounded-xl border border-swish-gray-100 overflow-hidden hover:shadow-lg hover:border-swish-red/10 transition-all duration-300"
                >
                  <div className="h-40 bg-gradient-to-br from-swish-gray-50 to-swish-gray-100 flex items-center justify-center">
                    <Droplets size={28} className="text-swish-gray-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-swish-gray-400 uppercase tracking-wider">
                        {categoryOptions.find((c) => c.value === product.category)?.label}
                      </span>
                      <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${getPHColor(product.ph)}`}>
                        pH {product.ph}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-swish-gray-900 group-hover:text-swish-red transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-swish-gray-500 line-clamp-2">
                      {product.desc}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-swish-red text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("viewProduct")} <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
