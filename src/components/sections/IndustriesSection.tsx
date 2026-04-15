"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function IndustriesSection() {
  const t = useTranslations("industries");
  const list = t.raw("list") as string[];

  return (
    <section className="bg-bs-mitternacht text-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-5">
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
            className="text-white/70 leading-relaxed text-[15px]"
          >
            {t("description")}
          </motion.p>
        </div>

        <div className="lg:col-span-7">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {list.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.025 }}
                className="flex items-center gap-3 text-white/85 text-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-bs-tuerkis flex-shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
