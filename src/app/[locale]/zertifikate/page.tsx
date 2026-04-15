"use client";

import { useTranslations } from "next-intl";
import PageBanner from "@/components/layout/PageBanner";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface Cert {
  key: string;
  badge: string;
}

const CERTS: Cert[] = [
  { key: "iso9001", badge: "ISO\n9001" },
  { key: "pqvob", badge: "PQ\nV O B" },
  { key: "trgs519", badge: "TÜV\nSÜD" },
  { key: "din14675", badge: "DIN" },
];

export default function ZertifikatePage() {
  const t = useTranslations("certifications");

  return (
    <>
      <PageBanner title={t("title")} subtitle={t("subtitle")} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: heading + intro */}
          <div className="lg:col-span-5">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-light text-bs-mitternacht mb-6"
            >
              {t("title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-bs-mitternacht/75 leading-relaxed text-[15px]"
            >
              {t("intro")}
            </motion.p>
          </div>

          {/* Right: 2x2 grid of certificate tiles */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CERTS.map((c, i) => (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="relative bg-bs-tuerkisblau/8 hover:bg-bs-tuerkisblau/12 border border-bs-tuerkisblau/20 hover:border-bs-tuerkis/50 rounded-2xl p-6 sm:p-8 transition-all group"
                >
                  <ShieldCheck
                    size={22}
                    className="absolute top-4 right-4 text-bs-tuerkis opacity-80 group-hover:opacity-100 transition-opacity"
                    strokeWidth={1.5}
                  />
                  <div className="flex flex-col items-center text-center min-h-[180px] justify-center">
                    {/* Badge box */}
                    <div className="mb-5 px-5 py-3 border-2 border-bs-tuerkis/70 text-bs-tuerkis font-bold text-2xl tracking-widest leading-tight whitespace-pre-line">
                      {c.badge}
                    </div>
                    <div className="text-sm text-bs-mitternacht font-semibold uppercase tracking-wider mb-2">
                      {t(`${c.key}Label`)}
                    </div>
                    <div className="text-xs text-bs-mitternacht/65 leading-relaxed max-w-[28ch]">
                      {t(`${c.key}Desc`)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
