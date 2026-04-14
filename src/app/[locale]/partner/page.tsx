"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PageBanner from "@/components/layout/PageBanner";
import { motion } from "framer-motion";
import { ExternalLink, Handshake } from "lucide-react";

interface Partner { id: string; name: string; logo: string; website: string; description: string; }

export default function PartnerPage() {
  const t = useTranslations("partners");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partners").then((r) => r.json()).then((d) => { setPartners(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageBanner title={t("title")} subtitle={t("subtitle")} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-40 animate-pulse" />)}</div>
        ) : partners.length === 0 ? (
          <div className="text-center py-20">
            <Handshake size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t("empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, i) => (
              <motion.div key={partner.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <a href={partner.website || "#"} target={partner.website ? "_blank" : undefined} rel="noopener noreferrer"
                  className="group block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-bs-accent/30 transition-all h-full">
                  <div className="h-20 flex items-center justify-center mb-4">
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <Handshake size={36} className="text-bs-gray-300" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-center mb-1">{partner.name}</h3>
                  {partner.description && <p className="text-xs text-bs-gray-500 text-center line-clamp-2">{partner.description}</p>}
                  {partner.website && (
                    <div className="flex items-center justify-center gap-1 mt-3 text-xs text-bs-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink size={12} /> Website
                    </div>
                  )}
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
