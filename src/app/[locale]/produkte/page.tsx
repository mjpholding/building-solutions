"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Search, ArrowRight, Droplets, X, Layers, Wind, Beaker, Shield,
  UtensilsCrossed, Factory, Truck, Tag, Leaf, Gauge, Sparkles
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/products";
import { useProducts } from "@/lib/use-products";
import { getTranslatedProducts } from "@/data/product-i18n";
import { useCustomer } from "@/lib/customer-context";


function getPHColor(ph: string): string {
  const val = parseFloat(ph.split("-")[0].trim());
  if (val < 3) return "text-red-600 bg-red-50";
  if (val < 6) return "text-orange-600 bg-orange-50";
  if (val < 8) return "text-green-600 bg-green-50";
  if (val < 10) return "text-blue-600 bg-blue-50";
  return "text-purple-600 bg-purple-50";
}

// Category colors — inspired by cleaning industry color coding
const categoryStyles: Record<string, { icon: React.ComponentType<{ size?: number }>; color: string; activeColor: string }> = {
  floors:        { icon: Layers,           color: "bg-emerald-50 text-emerald-600 border-emerald-200",    activeColor: "bg-emerald-600 text-white ring-emerald-600/20" },
  sanitary:      { icon: Droplets,         color: "bg-rose-50 text-rose-600 border-rose-200",             activeColor: "bg-rose-600 text-white ring-rose-600/20" },
  odor:          { icon: Wind,             color: "bg-violet-50 text-violet-600 border-violet-200",       activeColor: "bg-violet-600 text-white ring-violet-600/20" },
  special:       { icon: Beaker,           color: "bg-sky-50 text-sky-600 border-sky-200",                activeColor: "bg-sky-600 text-white ring-sky-600/20" },
  carpets:       { icon: Layers,           color: "bg-amber-50 text-amber-600 border-amber-200",          activeColor: "bg-amber-600 text-white ring-amber-600/20" },
  disinfection:  { icon: Shield,           color: "bg-blue-50 text-blue-600 border-blue-200",             activeColor: "bg-blue-600 text-white ring-blue-600/20" },
  food:          { icon: UtensilsCrossed,  color: "bg-orange-50 text-orange-600 border-orange-200",       activeColor: "bg-orange-600 text-white ring-orange-600/20" },
  industry:      { icon: Factory,          color: "bg-slate-50 text-slate-600 border-slate-200",          activeColor: "bg-slate-600 text-white ring-slate-600/20" },
  transport:     { icon: Truck,            color: "bg-zinc-50 text-zinc-600 border-zinc-200",             activeColor: "bg-zinc-600 text-white ring-zinc-600/20" },
  economy:       { icon: Tag,              color: "bg-teal-50 text-teal-600 border-teal-200",             activeColor: "bg-teal-600 text-white ring-teal-600/20" },
  green:         { icon: Leaf,             color: "bg-green-50 text-green-600 border-green-200",          activeColor: "bg-green-600 text-white ring-green-600/20" },
  dosing:        { icon: Gauge,            color: "bg-indigo-50 text-indigo-600 border-indigo-200",       activeColor: "bg-indigo-600 text-white ring-indigo-600/20" },
};

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
  const { customer } = useCustomer();
  const isB2B = customer?.type === "b2b";

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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
              <button
                onClick={() => setCategory("")}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                  !category
                    ? "bg-gray-900 text-white shadow-md ring-2 ring-gray-900/20"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <Sparkles size={18} />
                {t("allCategories") || "Alle"}
              </button>
              {categories.map((cat) => {
                const config = categoryStyles[cat.slug] || { icon: Beaker, color: "bg-gray-50 text-gray-600 border-gray-200", activeColor: "bg-gray-600 text-white ring-gray-600/20" };
                const Icon = config.icon;
                const isActive = category === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setCategory(isActive ? "" : cat.slug)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? `${config.activeColor} shadow-md ring-2`
                        : `${config.color} border hover:shadow-sm`
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-center leading-tight">{tCat(cat.slug)}</span>
                  </button>
                );
              })}
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
                          {tD("from")} {(isB2B
                            ? (Object.values(product.prices)[0] as number)
                            : (Object.values(product.prices)[0] as number) * 1.19
                          ).toFixed(2)} &euro;
                          {!isB2B && <span className="text-[10px] font-normal text-swish-gray-400 ml-1">{tD("gross")}</span>}
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
