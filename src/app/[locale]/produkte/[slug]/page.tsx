"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { ArrowLeft, Droplets, FileText, ShieldCheck, Package, ShoppingBag, Check } from "lucide-react";
import { useProducts } from "@/lib/use-products";
import { getTranslatedProduct, getTranslatedProducts } from "@/data/product-i18n";
import { motion } from "framer-motion";

import { useCart } from "@/lib/cart-context";

function getPHColor(ph: string): string {
  const val = parseFloat(ph.split("-")[0].trim());
  if (val < 3) return "text-red-600 bg-red-50 border-red-200";
  if (val < 6) return "text-orange-600 bg-orange-50 border-orange-200";
  if (val < 8) return "text-green-600 bg-green-50 border-green-200";
  if (val < 10) return "text-blue-600 bg-blue-50 border-blue-200";
  return "text-purple-600 bg-purple-50 border-purple-200";
}

function getPHLabel(ph: string): string {
  const val = parseFloat(ph.split("-")[0].trim());
  if (val < 3) return "strongAcid";
  if (val < 6) return "acid";
  if (val < 8) return "neutral";
  if (val < 10) return "slightlyAlkaline";
  return "strongAlkaline";
}

export default function ProductDetailPage() {
  const t = useTranslations("products");
  const tD = useTranslations("productDetail");
  const tCat = useTranslations("categories");
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const { products } = useProducts();
  const rawProduct = products.find((p) => p.slug === slug);
  const product = rawProduct ? getTranslatedProduct(rawProduct, locale) : undefined;
  const { addItem } = useCart();

  const sizes = product?.sizes || [];
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-swish-gray-900 mb-4">
            {tD("notFound")}
          </h1>
          <Link
            href="/produkte"
            className="inline-flex items-center gap-2 text-swish-red hover:underline"
          >
            <ArrowLeft size={16} />
            {t("title")}
          </Link>
        </div>
      </div>
    );
  }

  const prices = product.prices || {};
  const currentPrice = prices[selectedSize] || 0;

  const related = getTranslatedProducts(
    products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4),
    locale
  );

  const handleAddToCart = () => {
    addItem({
      slug: product.slug,
      name: product.name,
      size: selectedSize,
      price: currentPrice,
      image: product.image,
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/produkte"
          className="inline-flex items-center gap-2 text-swish-gray-500 hover:text-swish-red text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          {t("title")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-swish-gray-50 to-swish-gray-100 rounded-2xl flex items-center justify-center h-96 lg:h-[500px] relative overflow-hidden"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="object-contain h-full w-auto p-8"
              />
            ) : (
              <div className="w-40 h-56 bg-gradient-to-b from-swish-gray-200 to-swish-gray-300 rounded-xl shadow-lg flex items-center justify-center">
                <Droplets size={48} className="text-swish-gray-400" />
              </div>
            )}
            {product.isBestseller && (
              <span className="absolute top-4 right-4 bg-swish-red text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {tD("bestseller")}
              </span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href={`/produkte?category=${product.category}`}
              className="text-xs font-semibold text-swish-red uppercase tracking-wider hover:underline"
            >
              {tCat(product.category)}
            </Link>
            <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-swish-gray-900">
              {product.name}
            </h1>
            <p className="mt-4 text-swish-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Price & Size selector */}
            {Object.keys(prices).length > 0 && (
              <div className="mt-8 p-6 bg-swish-gray-50 rounded-2xl">
                {/* Size selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-swish-gray-700 mb-2">
                    {t("sizes")}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          selectedSize === size
                            ? "border-swish-red bg-red-50 text-swish-red"
                            : "border-swish-gray-200 bg-white text-swish-gray-600 hover:border-swish-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-bold text-swish-gray-900">
                    {currentPrice.toFixed(2)} &euro;
                  </span>
                  <span className="text-sm text-swish-gray-400 mb-1">{tD("net")}</span>
                </div>
                <p className="text-xs text-swish-gray-400 mb-4">
                  {tD("vatNote")}
                </p>

                {/* Quantity + Add to cart */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-swish-gray-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 text-swish-gray-600 hover:bg-swish-gray-50 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center text-sm font-medium border-x border-swish-gray-200 py-2.5 outline-none"
                      min={1}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2.5 text-swish-gray-600 hover:bg-swish-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!currentPrice}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      added
                        ? "bg-green-600 text-white"
                        : "bg-swish-red hover:bg-swish-red-dark text-white"
                    }`}
                  >
                    {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                    {added ? tD("added") : tD("addToCart")}
                  </button>
                </div>
              </div>
            )}

            {/* Specs */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 p-4 bg-swish-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPHColor(product.ph)}`}>
                  <span className="font-mono font-bold text-sm">pH</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-swish-gray-900">{t("ph")}</span>
                  <span className="ml-2 text-sm text-swish-gray-500">{product.ph}</span>
                  <span className="ml-2 text-xs text-swish-gray-400">({tD(getPHLabel(product.ph))})</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-swish-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={18} className="text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-swish-gray-900">{t("application")}</span>
                  <span className="ml-2 text-sm text-swish-gray-500">{product.applications.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Secondary CTA */}
            <div className="mt-6 flex gap-3">
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center border border-swish-gray-200 hover:border-swish-red/30 text-swish-gray-700 px-6 py-3 rounded-xl font-medium text-sm transition-all"
              >
                {t("requestQuote")}
              </Link>
              <button className="inline-flex items-center justify-center gap-2 border border-swish-gray-200 hover:border-swish-red/30 text-swish-gray-700 px-6 py-3 rounded-xl font-medium text-sm transition-all">
                <FileText size={16} />
                {t("dataSheet")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-swish-gray-900 mb-8">
              {t("relatedProducts")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/produkte/${rp.slug}`}
                  className="group block bg-white rounded-xl border border-swish-gray-100 overflow-hidden hover:shadow-lg hover:border-swish-red/10 transition-all duration-300"
                >
                  <div className="h-32 bg-gradient-to-br from-swish-gray-50 to-swish-gray-100 flex items-center justify-center overflow-hidden">
                    {rp.image ? (
                      <img src={rp.image} alt={rp.name} className="object-contain h-full w-auto p-2" />
                    ) : (
                      <Droplets size={24} className="text-swish-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${getPHColor(rp.ph)}`}>
                      pH {rp.ph}
                    </span>
                    <h3 className="mt-2 font-bold text-sm text-swish-gray-900 group-hover:text-swish-red transition-colors">
                      {rp.name}
                    </h3>
                    {rp.prices && Object.values(rp.prices)[0] && (
                      <p className="mt-1 text-sm font-semibold text-swish-gray-900">
                        {tD("from")} {(Object.values(rp.prices)[0] as number).toFixed(2)} &euro;
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
