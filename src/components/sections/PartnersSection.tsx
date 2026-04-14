"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Handshake } from "lucide-react";

interface Partner { id: string; name: string; logo: string; website: string; }

export default function PartnersSection() {
  const t = useTranslations("partners");
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch("/api/partners").then((r) => r.json()).then((d) => setPartners(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  if (partners.length === 0) return null;

  return (
    <section className="py-16 bg-bs-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("title")}</h2>
          <p className="text-bs-gray-500 text-sm">{t("subtitle")}</p>
        </motion.div>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {partners.map((partner, i) => (
            <motion.a
              key={partner.id}
              href={partner.website || "#"}
              target={partner.website ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              {partner.logo ? (
                <img src={partner.logo} alt={partner.name} className="h-12 lg:h-14 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
              ) : (
                <div className="flex items-center gap-2 text-bs-gray-400 group-hover:text-bs-accent transition-colors">
                  <Handshake size={24} />
                  <span className="text-sm font-medium">{partner.name}</span>
                </div>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
