"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Shield, Leaf, Award, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Award,
    titleKey: "quality",
    desc: "Modernste Technologien und hochwertige Rohstoffe für professionelle Ergebnisse.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Leaf,
    titleKey: "environment",
    desc: "Biologisch abbaubare Rohstoffe, die europäische und nordamerikanische Standards erfüllen.",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Shield,
    titleKey: "trust",
    desc: "Seit 1956 vertrauen Unternehmen weltweit auf unsere bewährten Reinigungslösungen.",
    color: "text-amber-600 bg-amber-50",
  },
  {
    icon: HeadphonesIcon,
    titleKey: "expertise",
    desc: "Individuelle Beratung, Hygienepläne, Schulungen und Audits für Ihren Betrieb.",
    color: "text-purple-600 bg-purple-50",
  },
];

export default function WhySwishSection() {
  const t = useTranslations("about");

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-swish-gray-900">
            Warum Swish?
          </h2>
          <p className="mt-4 text-lg text-swish-gray-500 max-w-2xl mx-auto">
            {t("missionText")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${feat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-lg font-semibold text-swish-gray-900 mb-2">
                  {t(feat.titleKey)}
                </h3>
                <p className="text-sm text-swish-gray-500 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
