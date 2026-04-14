"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import PageBanner from "@/components/layout/PageBanner";
import { FileDown, Droplets, UtensilsCrossed, ChefHat } from "lucide-react";

interface HygienePlan {
  id: string;
  category: "sanitary" | "kitchen" | "dining";
}

const planConfigs = [
  {
    category: "sanitary" as const,
    titleKey: "sanitary",
    descKey: "sanitaryDesc",
    icon: Droplets,
    color: "bg-cyan-50 text-cyan-600",
    fallbackPdf: "/hygieneplaene/Hygieneplan-Sanitaeranlagen.pdf",
  },
  {
    category: "kitchen" as const,
    titleKey: "kitchen",
    descKey: "kitchenDesc",
    icon: ChefHat,
    color: "bg-orange-50 text-orange-600",
    fallbackPdf: "/hygieneplaene/Hygieneplan-Restaurant-Kueche.pdf",
  },
  {
    category: "dining" as const,
    titleKey: "dining",
    descKey: "diningDesc",
    icon: UtensilsCrossed,
    color: "bg-amber-50 text-amber-600",
    fallbackPdf: "/hygieneplaene/Hygieneplan-Restaurant-Gastraum.pdf",
  },
];

export default function HygienePlansPage() {
  const t = useTranslations("hygiene");
  const [plans, setPlans] = useState<HygienePlan[]>([]);

  useEffect(() => {
    fetch("/api/hygiene-plans")
      .then((r) => r.json())
      .then((data: HygienePlan[]) => { if (Array.isArray(data)) setPlans(data); })
      .catch(() => {});
  }, []);

  function getPdfUrl(category: string): string {
    const plan = plans.find((p) => p.category === category);
    if (plan) return `/api/hygiene-plans/view?category=${category}`;
    const config = planConfigs.find((c) => c.category === category);
    return config?.fallbackPdf || "#";
  }

  return (
    <div className="min-h-screen bg-white">
      <PageBanner title={t("title")} subtitle={t("subtitle")} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planConfigs.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-bs-gray-100 p-8 hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${plan.color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-bs-gray-900 mb-3">{t(plan.titleKey)}</h3>
                <p className="text-sm text-bs-gray-500 leading-relaxed mb-6">{t(plan.descKey)}</p>
                <a
                  href={getPdfUrl(plan.category)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
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
