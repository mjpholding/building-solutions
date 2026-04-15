"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function StatsSection() {
  const t = useTranslations("stats");

  const items = [
    { value: t("since"), label: t("sinceLabel") },
    { value: t("team"), label: t("teamLabel") },
    { value: t("revenue"), label: t("revenueLabel") },
  ];

  return (
    <section className="bg-bs-mitternacht text-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-5">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-6xl font-light mb-5 text-white"
          >
            {t("title")}
          </motion.h2>
        </div>
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/70 leading-relaxed text-[15px] mb-10"
          >
            {t("description")}
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {items.map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="border-t-2 border-bs-tuerkis pt-5"
              >
                <div className="text-4xl lg:text-5xl font-light text-bs-tuerkis tracking-tight mb-2">
                  {it.value}
                </div>
                <div className="text-sm text-white/75">{it.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
