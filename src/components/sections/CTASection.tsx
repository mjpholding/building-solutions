"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import contactData from "@/data/contact.json";

export default function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-bs-accent to-bs-accent-dark text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 bg-white text-bs-accent hover:bg-bs-gray-100 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg"
            >
              {t("button")}
              <ArrowRight size={18} />
            </Link>
            <a
              href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
            >
              <Phone size={18} />
              {contactData.phone}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
