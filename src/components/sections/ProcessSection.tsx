"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ProcessSection() {
  const t = useTranslations("process");
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <section className="bg-bs-tuerkisblau text-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-5xl font-light mb-5 text-white"
        >
          {t("title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-white/70 max-w-2xl mx-auto text-[15px] leading-relaxed mb-14"
        >
          {t("description")}
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((label, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="relative flex flex-col items-center"
            >
              <div className="relative inline-flex items-baseline">
                <span className="text-7xl lg:text-8xl font-bold text-bs-tuerkis leading-none tracking-tight">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ml-3 text-white text-base lg:text-lg font-medium tracking-wide">
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight
                  size={22}
                  className="hidden lg:block absolute right-[-14px] top-1/2 -translate-y-1/2 text-bs-tuerkis"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
