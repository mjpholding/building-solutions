"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import contactData from "@/data/contact.json";

/**
 * Dashboard hero: full-bleed architectural image + brand overlay.
 * Image path: /hero/dashboard-hero.jpg — wrzuć plik do public/hero/.
 * If the image is missing, the mitternacht → türkisblau gradient
 * stays as a clean brand fallback.
 */
export default function DashboardHero() {
  const t = useTranslations("hero");
  const phone = contactData.phone.replace(/[\s()]/g, "");

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-screen overflow-hidden bg-bs-mitternacht">
      {/* background image */}
      <div className="absolute inset-0">
        <img
          src="/hero/dashboard-hero.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {/* fallback gradient always visible behind the image; image sits on top */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 70% 30%, #06373c 0%, #13232d 55%, #0a171d 100%)",
          }}
        />
      </div>

      {/* brand overlays — match the site palette */}
      {/* left-to-right darkening so the copy stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-bs-mitternacht/92 via-bs-mitternacht/55 to-bs-mitternacht/15" />
      {/* bottom blend into next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bs-mitternacht to-transparent" />
      {/* subtle türkis glow */}
      <div className="absolute -right-20 top-1/3 w-[600px] h-[600px] rounded-full bg-bs-tuerkis/10 blur-[120px] pointer-events-none" />

      {/* content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] lg:min-h-screen flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl py-28 lg:py-40"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-bs-tuerkis/15 border border-bs-tuerkis/30 text-bs-tuerkis text-xs font-medium tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-bs-tuerkis" />
            Building Solutions GmbH
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-6">
            {t("title")}
          </h1>

          <p className="text-white/75 text-base lg:text-lg leading-relaxed max-w-xl mb-10">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/leistungen"
              className="inline-flex items-center justify-center gap-2 bg-bs-tuerkis hover:bg-bs-tuerkis/90 text-bs-mitternacht px-7 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-bs-tuerkis/25"
            >
              {t("cta")} <ArrowRight size={16} />
            </Link>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-white/90 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm"
            >
              <Phone size={15} /> {t("ctaSecondary")}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
