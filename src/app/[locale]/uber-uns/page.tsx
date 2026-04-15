"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import PageBanner from "@/components/layout/PageBanner";
import { Award, Leaf, Shield, Lightbulb, Heart, Globe, Truck, HeadphonesIcon, FileCheck, Droplets } from "lucide-react";

const values = [
  { icon: Shield, titleKey: "trust", descKey: "trustDesc" },
  { icon: Award, titleKey: "expertise", descKey: "expertiseDesc" },
  { icon: Lightbulb, titleKey: "innovation", descKey: "innovationDesc" },
  { icon: Award, titleKey: "quality", descKey: "qualityDesc" },
  { icon: Leaf, titleKey: "environment", descKey: "environmentDesc" },
  { icon: Heart, titleKey: "ethics", descKey: "ethicsDesc" },
];

const whyUs = [
  { icon: Globe, key: "why1" },
  { icon: HeadphonesIcon, key: "why2" },
  { icon: FileCheck, key: "why3" },
  { icon: Droplets, key: "why4" },
  { icon: Truck, key: "why5" },
];

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen">
      <PageBanner title={t("title")} />

      {/* About Building Solutions GmbH */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-bs-gray-900 mb-6">{t("aboutTitle")}</h2>
            <p className="text-lg text-bs-gray-600 leading-relaxed">{t("aboutText1")}</p>
            <p className="mt-4 text-lg text-bs-gray-600 leading-relaxed">{t("aboutText2")}</p>
          </motion.div>
        </div>
      </section>

      {/* About the brand */}
      <section className="py-16 bg-bs-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-bs-gray-900 mb-6">{t("brandTitle")}</h2>
            <p className="text-lg text-bs-gray-600 leading-relaxed">{t("brandText")}</p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-bs-gray-900 mb-6">{t("mission")}</h2>
            <p className="text-xl text-bs-gray-600 leading-relaxed italic">{t("missionText")}</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-bs-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-bs-gray-900 text-center mb-12">{t("values")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group p-8 bg-white rounded-2xl border border-bs-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bs-tuerkisblau to-bs-tuerkis flex items-center justify-center mb-5 shadow-lg shadow-bs-tuerkis/25 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={28} className="text-white" strokeWidth={1.8} />
                  </div>
                  <h3 className="font-bold text-lg text-bs-gray-900">{t(val.titleKey)}</h3>
                  <p className="mt-3 text-sm text-bs-gray-500 leading-relaxed">{t(val.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Building Solutions GmbH */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-bs-gray-900 text-center mb-12">{t("whyTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {whyUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center p-6 bg-bs-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-bs-tuerkisblau to-bs-tuerkis flex items-center justify-center mb-4 shadow-lg shadow-bs-tuerkis/25">
                    <Icon size={24} className="text-white" strokeWidth={1.8} />
                  </div>
                  <p className="text-sm text-bs-gray-700 font-semibold leading-relaxed">{t(item.key)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
