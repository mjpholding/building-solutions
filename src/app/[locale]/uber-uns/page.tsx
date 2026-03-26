"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import PageBanner from "@/components/layout/PageBanner";
import { Award, Leaf, Shield, Lightbulb, Heart } from "lucide-react";

const values = [
  { icon: Shield, titleKey: "trust", descKey: "trustDesc" },
  { icon: Award, titleKey: "expertise", descKey: "expertiseDesc" },
  { icon: Lightbulb, titleKey: "innovation", descKey: "innovationDesc" },
  { icon: Award, titleKey: "quality", descKey: "qualityDesc" },
  { icon: Leaf, titleKey: "environment", descKey: "environmentDesc" },
  { icon: Heart, titleKey: "trust", descKey: "ethicsDesc" },
];

const timeline = [
  { year: "1956", titleKey: "timeline1956", descKey: "timeline1956Desc" },
  { year: "2001", titleKey: "timeline1997", descKey: "timeline1997Desc" },
  { year: "2010", titleKey: "timeline2003", descKey: "timeline2003Desc" },
  { year: "2024", titleKey: "timeline2020", descKey: "timeline2020Desc" },
];

export default function AboutPage() {
  const t = useTranslations("about");
  const tP = useTranslations("aboutPage");

  return (
    <div className="min-h-screen">
      <PageBanner title={t("title")} subtitle={t("historyText")} />

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-swish-gray-900">{t("mission")}</h2>
            <p className="mt-6 text-xl text-swish-gray-600 leading-relaxed">{t("missionText")}</p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-swish-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-swish-gray-900 text-center mb-14">{t("history")}</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-swish-red text-white rounded-xl flex items-center justify-center font-bold text-sm">
                    {item.year}
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-swish-gray-200 mt-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-bold text-lg text-swish-gray-900">{tP(item.titleKey)}</h3>
                  <p className="mt-1 text-swish-gray-500">{tP(item.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-swish-gray-900 text-center mb-14">{t("values")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl border border-swish-gray-100 hover:shadow-lg transition-all"
                >
                  <Icon size={28} className="text-swish-red mb-4" />
                  <h3 className="font-semibold text-lg text-swish-gray-900">{t(val.titleKey)}</h3>
                  <p className="mt-2 text-sm text-swish-gray-500 leading-relaxed">{tP(val.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
