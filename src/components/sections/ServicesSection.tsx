"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun } from "lucide-react";
import type { Service } from "@/types/service";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun,
};

const categoryColors: Record<string, string> = {
  security: "bg-blue-50 text-blue-600 border-blue-200",
  video: "bg-cyan-50 text-cyan-600 border-cyan-200",
  hazard: "bg-orange-50 text-orange-600 border-orange-200",
  communication: "bg-violet-50 text-violet-600 border-violet-200",
  electrical: "bg-yellow-50 text-yellow-600 border-yellow-200",
  repairs: "bg-slate-50 text-slate-600 border-slate-200",
  pv: "bg-green-50 text-green-600 border-green-200",
};

export default function ServicesSection() {
  const t = useTranslations("services");
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => {});
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-bs-gray-500 text-lg max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.slice(0, 7).map((service, index) => {
            const Icon = iconMap[service.icon] || Shield;
            const colors = categoryColors[service.category] || "bg-gray-50 text-gray-600 border-gray-200";

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={`/leistungen/${service.slug}`}
                  className="group block p-6 rounded-2xl border border-gray-200 hover:border-bs-accent/30 hover:shadow-lg transition-all duration-300 h-full bg-white"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${colors}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2 group-hover:text-bs-accent transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-bs-gray-500 leading-relaxed line-clamp-2">
                    {service.shortDescription}
                  </p>
                </Link>
              </motion.div>
            );
          })}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/leistungen"
              className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-bs-accent/30 hover:border-bs-accent hover:bg-bs-accent/5 transition-all duration-300 h-full min-h-[160px]"
            >
              <ArrowRight size={24} className="text-bs-accent mb-2 group-hover:translate-x-1 transition-transform" />
              <span className="font-semibold text-bs-accent text-sm">{t("allServices")}</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
