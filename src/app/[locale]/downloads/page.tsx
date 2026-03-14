"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { BookOpen, Award, FileText, ShieldCheck, Image, Calculator } from "lucide-react";

const downloadCategories = [
  { key: "catalogs", icon: BookOpen, color: "bg-blue-50 text-blue-600", link: "https://www.swishclean.pl/de/centrum-pobierania/katalogi-i-ulotki/" },
  { key: "certificates", icon: Award, color: "bg-green-50 text-green-600", link: "https://www.swishclean.pl/de/centrum-pobierania/atesty/" },
  { key: "descriptions", icon: FileText, color: "bg-purple-50 text-purple-600", link: "https://www.swishclean.pl/de/centrum-pobierania/opisy-produktow/" },
  { key: "safetySheets", icon: ShieldCheck, color: "bg-red-50 text-red-600", link: "https://www.swishclean.pl/de/centrum-pobierania/karty-charakterystyki/" },
  { key: "images", icon: Image, color: "bg-amber-50 text-amber-600", link: "https://www.swishclean.pl/de/centrum-pobierania/zdjecia-produktow/" },
  { key: "dosageTables", icon: Calculator, color: "bg-cyan-50 text-cyan-600", link: "https://www.swishclean.pl/de/centrum-pobierania/tabele-dozowania/" },
];

export default function DownloadsPage() {
  const t = useTranslations("downloads");

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-swish-gray-900 to-swish-gray-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold">{t("title")}</h1>
            <p className="mt-4 text-xl text-swish-gray-300">{t("subtitle")}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloadCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.a
                key={cat.key}
                href={cat.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group block bg-white rounded-2xl border border-swish-gray-100 p-8 hover:shadow-xl hover:border-swish-red/10 transition-all"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-lg font-bold text-swish-gray-900 group-hover:text-swish-red transition-colors">
                  {t(cat.key)}
                </h3>
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
