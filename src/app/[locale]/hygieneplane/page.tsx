"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { FileDown, Droplets, UtensilsCrossed, ChefHat } from "lucide-react";

const plans = [
  {
    titleKey: "sanitary",
    descKey: "sanitaryDesc",
    icon: Droplets,
    pdf: "/hygieneplaene/Hygieneplan-Sanitaeranlagen.pdf",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    titleKey: "kitchen",
    descKey: "kitchenDesc",
    icon: ChefHat,
    pdf: "/hygieneplaene/Hygieneplan-Restaurant-Kueche.pdf",
    color: "bg-orange-50 text-orange-600",
  },
  {
    titleKey: "dining",
    descKey: "diningDesc",
    icon: UtensilsCrossed,
    pdf: "/hygieneplaene/Hygieneplan-Restaurant-Gastraum.pdf",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function HygienePlansPage() {
  const t = useTranslations("hygiene");

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.titleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-swish-gray-100 p-8 hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${plan.color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-swish-gray-900 mb-3">{t(plan.titleKey)}</h3>
                <p className="text-sm text-swish-gray-500 leading-relaxed mb-6">{t(plan.descKey)}</p>
                <a
                  href={plan.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-swish-red hover:bg-swish-red-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                >
                  <FileDown size={16} />
                  {t("download")} (PDF)
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
