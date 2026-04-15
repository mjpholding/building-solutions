"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PageBanner from "@/components/layout/PageBanner";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  ArrowRight, Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun
} from "lucide-react";
import type { Service } from "@/types/service";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun,
};

export default function LeistungenPage() {
  const t = useTranslations("services");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageBanner title={t("title")} subtitle={t("subtitle")} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Shield;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={`/leistungen/${service.slug}`}
                    className="group block bg-white rounded-2xl border border-gray-200 hover:border-bs-tuerkis/40 hover:shadow-xl transition-all duration-300 overflow-hidden h-full"
                  >
                    {/* Icon header */}
                    <div className="bg-bs-mitternacht p-6 flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-bs-tuerkisblau to-bs-tuerkis rounded-xl flex items-center justify-center shadow-lg shadow-bs-tuerkis/25">
                        <Icon size={28} className="text-white" />
                      </div>
                      <div>
                        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-white font-bold text-lg leading-tight">
                          {service.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-bs-gray-600 text-sm leading-relaxed mb-4">
                        {service.shortDescription}
                      </p>
                      <ul className="space-y-1.5 mb-6">
                        {service.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-xs text-bs-gray-500 flex items-center gap-2">
                            <span className="w-1 h-1 bg-bs-accent rounded-full flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                        {service.features.length > 3 && (
                          <li className="text-xs text-bs-gray-400">
                            +{service.features.length - 3} weitere
                          </li>
                        )}
                      </ul>
                      <div className="flex items-center gap-2 text-bs-accent font-semibold text-sm group-hover:gap-3 transition-all">
                        {t("learnMore")} <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
