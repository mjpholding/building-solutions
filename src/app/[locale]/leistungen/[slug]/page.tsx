"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun,
  Phone, Mail
} from "lucide-react";
import type { Service } from "@/types/service";
import contactData from "@/data/contact.json";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun,
};

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations("services");
  const [service, setService] = useState<Service | null>(null);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data: Service[]) => {
        setAllServices(data);
        setService(data.find((s) => s.slug === slug) || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-bs-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t("notFound")}</h1>
        <Link href="/leistungen" className="text-bs-accent hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> {t("backToServices")}
        </Link>
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Shield;
  const otherServices = allServices.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <div className="bg-bs-mitternacht text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <Link href="/leistungen" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> {t("backToServices")}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-6"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-bs-tuerkisblau to-bs-tuerkis rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-bs-tuerkis/30">
              <Icon size={36} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{service.name}</h1>
              <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                {service.shortDescription}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("overview")}</h2>
              <p className="text-bs-gray-600 leading-relaxed text-base mb-10">
                {service.description}
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("ourServices")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-start gap-3 bg-gray-50 rounded-xl p-4"
                  >
                    <CheckCircle2 size={20} className="text-bs-tuerkis flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-bs-gray-900 text-white rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-2">{t("ctaTitle")}</h3>
              <p className="text-gray-400 text-sm mb-6">{t("ctaDescription")}</p>
              <Link
                href="/kontakt"
                className="block bg-bs-accent hover:bg-bs-accent-light text-white text-center py-3 rounded-xl text-sm font-semibold transition-colors mb-3"
              >
                {t("ctaButton")}
              </Link>
              <div className="space-y-2 pt-3 border-t border-gray-700">
                <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                  <Phone size={14} /> {contactData.phone}
                </a>
                <a href={`mailto:${contactData.email}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
                  <Mail size={14} /> {contactData.email}
                </a>
              </div>
            </motion.div>

            {/* Other services */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">{t("otherServices")}</h3>
              <div className="space-y-2">
                {otherServices.map((s) => {
                  const SIcon = iconMap[s.icon] || Shield;
                  return (
                    <Link
                      key={s.id}
                      href={`/leistungen/${s.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <SIcon size={18} className="text-bs-accent flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{s.name}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/leistungen"
                  className="block text-center text-sm text-bs-accent hover:underline pt-2"
                >
                  {t("allServices")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
