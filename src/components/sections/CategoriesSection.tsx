"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Layers, Droplets, Wind, Beaker, RectangleHorizontal, Shield,
  UtensilsCrossed, Factory, Truck, Tag, Leaf, Gauge,
} from "lucide-react";

const categories = [
  { slug: "floors", icon: Layers, color: "bg-blue-50 text-blue-600" },
  { slug: "sanitary", icon: Droplets, color: "bg-cyan-50 text-cyan-600" },
  { slug: "odor", icon: Wind, color: "bg-purple-50 text-purple-600" },
  { slug: "special", icon: Beaker, color: "bg-amber-50 text-amber-600" },
  { slug: "carpets", icon: RectangleHorizontal, color: "bg-pink-50 text-pink-600" },
  { slug: "disinfection", icon: Shield, color: "bg-green-50 text-green-600" },
  { slug: "food", icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600" },
  { slug: "industry", icon: Factory, color: "bg-slate-50 text-slate-600" },
  { slug: "transport", icon: Truck, color: "bg-indigo-50 text-indigo-600" },
  { slug: "economy", icon: Tag, color: "bg-yellow-50 text-yellow-600" },
  { slug: "green", icon: Leaf, color: "bg-emerald-50 text-emerald-600" },
  { slug: "dosing", icon: Gauge, color: "bg-rose-50 text-rose-600" },
];

export default function CategoriesSection() {
  const t = useTranslations("categories");

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-swish-gray-900">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-swish-gray-500 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/produkte?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-swish-gray-100 hover:border-swish-red/20 hover:shadow-lg hover:shadow-swish-red/5 transition-all duration-300 bg-white"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-sm font-medium text-swish-gray-700 group-hover:text-swish-red transition-colors text-center">
                    {t(cat.slug)}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
