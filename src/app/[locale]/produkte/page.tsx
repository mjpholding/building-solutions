"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Search, Filter, ArrowRight, Droplets, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/products";
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

export default function ProductsPage() {
  const t = useTranslations("products");
  const tD = useTranslations("productDetail");
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { products } = useProducts();
  const translatedProducts = useMemo(() => getTranslatedProducts(products, locale), [products, locale]);

  // Read category from URL query param (from CategoriesSection links)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return translatedProducts.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !category || p.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category, translatedProducts]);

  return (
    <div className="min-h-screen bg-swish-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-swish-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-swish-gray-900">
            {t("title")}
          </h1>
          <p className="mt-2 text-swish-gray-500">
            {filtered.length} {t("productsCount") || "Produkte"}
          </p>

          {/* Filters */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-swish-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search")}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-swish-gray-400 hover:text-swish-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategory("")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !category
                    ? "bg-swish-red text-white shadow-sm"
                    : "bg-white text-swish-gray-600 border border-swish-gray-200 hover:border-swish-red/30 hover:text-swish-red"
                }`}
              >
                {t("allCategories") || "Alle"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    category === cat.slug
                      ? "bg-swish-red text-white shadow-sm"
                      : "bg-white text-swish-gray-600 border border-swish-gray-200 hover:border-swish-red/30 hover:text-swish-red"
                  }`}
                >
                  {tCat(cat.slug)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Filter size={48} className="mx-auto text-swish-gray-300 mb-4" />
            <p className="text-swish-gray-500 text-lg">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product, i) => (
              <motion.div
                key={product.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/produkte/${product.slug}`}
                  className="group block bg-white rounded-xl border border-swish-gray-100 overflow-hidden hover:shadow-lg hover:border-swish-red/10 transition-all duration-300"
                >
                  <div className="h-40 bg-gradient-to-br from-swish-gray-50 to-swish-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-contain h-full w-auto p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Droplets size={28} className="text-swish-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-swish-gray-400 uppercase tracking-wider">
                        {tCat(product.category)}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${getPHColor(product.ph)}`}
                      >
                        pH {product.ph}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-swish-gray-900 group-hover:text-swish-red transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-swish-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      {product.prices && Object.values(product.prices)[0] ? (
                        <span className="text-sm font-bold text-swish-gray-900">
                          {tD("from")} {(Object.values(product.prices)[0] as number).toFixed(2)} &euro;
                        </span>
                      ) : (
                        <span className="text-xs text-swish-gray-400">{tD("priceOnRequest")}</span>
                      )}
                      {product.isBestseller && (
                        <span className="text-[10px] font-semibold text-swish-red bg-red-50 px-2 py-0.5 rounded-full">
                          {tD("bestseller")}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-swish-red text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("viewProduct")} <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
