"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Droplets } from "lucide-react";
import { useProducts } from "@/lib/use-products";
import { getTranslatedProducts } from "@/data/product-i18n";


function getPHColor(ph: string): string {
  const val = parseFloat(ph.split("-")[0].trim());
  if (val < 3) return "text-red-600 bg-red-50";
  if (val < 6) return "text-orange-600 bg-orange-50";
  if (val < 8) return "text-green-600 bg-green-50";
  if (val < 10) return "text-blue-600 bg-blue-50";
  return "text-purple-600 bg-purple-50";
}

export default function BestsellersSection() {
  const t = useTranslations("products");
  const td = useTranslations("productDetail");
  const locale = useLocale();
  const { products } = useProducts();
  const bestsellers = useMemo(() => getTranslatedProducts(products.filter((p) => p.isBestseller), locale), [products, locale]);

  return (
    <section className="py-20 lg:py-28 bg-swish-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-14"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-swish-gray-900">
              {t("bestsellers")}
            </h2>
            <p className="mt-3 text-swish-gray-500">
              {t("bestsellersSubtitle")}
            </p>
          </div>
          <Link
            href="/produkte"
            className="hidden sm:inline-flex items-center gap-2 text-swish-red hover:text-swish-red-dark font-medium text-sm transition-colors"
          >
            {t("viewAll")}
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.map((product, i) => (
            <motion.div
              key={product.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/produkte/${product.slug}`}
                className="group block bg-white rounded-2xl border border-swish-gray-100 overflow-hidden hover:shadow-xl hover:shadow-swish-gray-200/50 hover:border-swish-red/10 transition-all duration-300"
              >
                <div className="relative h-48 bg-gradient-to-br from-swish-gray-50 to-swish-gray-100 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-contain h-full w-auto p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Droplets size={32} className="text-swish-gray-400" />
                  )}
                  <span className="absolute top-3 right-3 bg-swish-red text-white text-[10px] font-bold uppercase px-2 py-1 rounded-md">
                    {td("bestseller")}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-swish-gray-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${getPHColor(product.ph)}`}>
                      pH {product.ph}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-swish-gray-900 group-hover:text-swish-red transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-swish-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-swish-red text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("viewProduct")} <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/produkte"
            className="inline-flex items-center gap-2 text-swish-red font-medium text-sm"
          >
            {t("viewAll")} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
