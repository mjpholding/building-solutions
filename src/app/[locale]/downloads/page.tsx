"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, FileText, ShieldCheck, Calculator, ChevronRight,
  ArrowLeft, Download, Loader2
} from "lucide-react";

interface ProductSheet {
  id: string;
  productName: string;
  type: "product" | "sds";
}

type Category = "catalogs" | "productSheets" | "safetySheets" | "dosageTables" | null;

const categories = [
  {
    key: "catalogs" as const,
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    titleDE: "Kataloge",
    descDE: "Produktkataloge Professional und Economy Line",
  },
  {
    key: "productSheets" as const,
    icon: FileText,
    color: "bg-purple-50 text-purple-600",
    titleDE: "Produktdatenblätter",
    descDE: "Technische Datenblätter für alle Produkte",
  },
  {
    key: "safetySheets" as const,
    icon: ShieldCheck,
    color: "bg-red-50 text-red-600",
    titleDE: "Sicherheitsdatenblätter",
    descDE: "SDB / SDS gemäß REACH-Verordnung",
  },
  {
    key: "dosageTables" as const,
    icon: Calculator,
    color: "bg-cyan-50 text-cyan-600",
    titleDE: "Dosiertabellen",
    descDE: "Dosierungsanleitungen für alle Produkte",
  },
];

// Static catalog files
const catalogs = [
  {
    name: "Swish Professional Line — Katalog",
    file: "/katalog-pdf/Swish-Deutschland-Katalog-Professional.pdf",
    desc: "Vollständiger Produktkatalog der Professional Line (44 Seiten)",
  },
  {
    name: "Swish Economy Line — Katalog",
    file: "/katalog-pdf/Swish-Deutschland-Katalog-Economy.pdf",
    desc: "Produktkatalog der Economy Line (4 Seiten)",
  },
];

export default function DownloadsPage() {
  const t = useTranslations("downloads");
  const [activeCategory, setActiveCategory] = useState<Category>(null);
  const [sheets, setSheets] = useState<ProductSheet[]>([]);
  const [loading, setLoading] = useState(false);

  // Load product sheets when needed
  useEffect(() => {
    if (activeCategory === "productSheets" || activeCategory === "safetySheets") {
      setLoading(true);
      fetch("/api/admin/product-sheets")
        .then((r) => r.json())
        .then((data: ProductSheet[]) => {
          if (Array.isArray(data)) setSheets(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeCategory]);

  const productSheets = sheets.filter((s) => s.type === "product");
  const safetySheets = sheets.filter((s) => s.type === "sds");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-swish-gray-900 to-swish-gray-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold">{t("title")}</h1>
            <p className="mt-4 text-xl text-swish-gray-300">{t("subtitle")}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <AnimatePresence mode="wait">
          {/* Category overview */}
          {!activeCategory && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <motion.button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="group text-left bg-white rounded-2xl border border-swish-gray-100 p-8 hover:shadow-xl hover:border-swish-red/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${cat.color} group-hover:scale-110 transition-transform`}>
                          <Icon size={28} />
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-swish-red transition-colors mt-2" />
                      </div>
                      <h3 className="text-lg font-bold text-swish-gray-900 group-hover:text-swish-red transition-colors">
                        {cat.titleDE}
                      </h3>
                      <p className="text-sm text-swish-gray-500 mt-2">{cat.descDE}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Category detail view */}
          {activeCategory && (
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Back button */}
              <button
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-2 text-swish-gray-500 hover:text-swish-red font-medium text-sm mb-8 transition-colors"
              >
                <ArrowLeft size={16} />
                Zurück zur Übersicht
              </button>

              {/* Category title */}
              <h2 className="text-2xl font-bold text-swish-gray-900 mb-6">
                {categories.find((c) => c.key === activeCategory)?.titleDE}
              </h2>

              {/* CATALOGS */}
              {activeCategory === "catalogs" && (
                <div className="space-y-4">
                  {catalogs.map((cat) => (
                    <a
                      key={cat.file}
                      href={cat.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-swish-red/30 hover:shadow-lg transition-all group"
                    >
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen size={24} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-swish-red transition-colors">{cat.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{cat.desc}</p>
                      </div>
                      <Download size={18} className="text-gray-400 group-hover:text-swish-red transition-colors" />
                    </a>
                  ))}
                </div>
              )}

              {/* PRODUCT SHEETS */}
              {activeCategory === "productSheets" && (
                <div>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : productSheets.length === 0 ? (
                    <p className="text-gray-500 py-8">Noch keine Produktdatenblätter vorhanden. Erstellen Sie welche im Admin-Bereich unter PDF-Generator.</p>
                  ) : (
                    <div className="space-y-3">
                      {productSheets.map((sheet) => (
                        <a
                          key={sheet.id}
                          href={`/api/product-sheets/view?id=${sheet.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-swish-red/30 hover:shadow-lg transition-all group"
                        >
                          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText size={20} className="text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-swish-red transition-colors">{sheet.productName}</h3>
                            <p className="text-xs text-gray-400">Produktdatenblatt</p>
                          </div>
                          <Download size={16} className="text-gray-400 group-hover:text-swish-red transition-colors" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SAFETY SHEETS */}
              {activeCategory === "safetySheets" && (
                <div>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : safetySheets.length === 0 ? (
                    <p className="text-gray-500 py-8">Noch keine Sicherheitsdatenblätter vorhanden. Erstellen Sie welche im Admin-Bereich unter PDF-Generator.</p>
                  ) : (
                    <div className="space-y-3">
                      {safetySheets.map((sheet) => (
                        <a
                          key={sheet.id}
                          href={`/api/product-sheets/view?id=${sheet.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-swish-red/30 hover:shadow-lg transition-all group"
                        >
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={20} className="text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-swish-red transition-colors">{sheet.productName}</h3>
                            <p className="text-xs text-gray-400">Sicherheitsdatenblatt (SDB)</p>
                          </div>
                          <Download size={16} className="text-gray-400 group-hover:text-swish-red transition-colors" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DOSAGE TABLES */}
              {activeCategory === "dosageTables" && (
                <div>
                  <a
                    href="/katalog-pdf/Swish-Deutschland-Katalog-Professional.pdf#page=41"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-swish-red/30 hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calculator size={24} className="text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-swish-red transition-colors">Dosiertabelle — Professional Line</h3>
                      <p className="text-sm text-gray-500 mt-0.5">Dosierungsempfehlungen für alle Professional-Produkte</p>
                    </div>
                    <Download size={18} className="text-gray-400 group-hover:text-swish-red transition-colors" />
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
