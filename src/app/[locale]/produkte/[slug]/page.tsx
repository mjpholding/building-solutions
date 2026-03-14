"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Droplets, FileText, ShieldCheck, Package } from "lucide-react";

export default function ProductDetailPage() {
  const t = useTranslations("products");

  // Placeholder - will be replaced with real product data lookup
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
          <div className="bg-gradient-to-br from-swish-gray-50 to-swish-gray-100 rounded-2xl flex items-center justify-center h-96 lg:h-[500px]">
            <div className="w-40 h-56 bg-gradient-to-b from-swish-gray-200 to-swish-gray-300 rounded-xl shadow-lg flex items-center justify-center">
              <Droplets size={48} className="text-swish-gray-400" />
            </div>
          </div>

          {/* Info */}
          <div>
            <span className="text-xs font-semibold text-swish-red uppercase tracking-wider">
              Bestseller
            </span>
            <h1 className="mt-2 text-3xl lg:text-4xl font-bold text-swish-gray-900">
              POLY LOCK ULTRA
            </h1>
            <p className="mt-4 text-swish-gray-600 leading-relaxed">
              Spezialmittel zur Imprägnierung und Glanzverleihung für Fußböden. Erzeugt eine sehr haltbare
              Schutzschicht mit hohem Glanz und macht geschützte Böden leicht sauber zu halten.
              Speziell patentierte Rezeptur, resistent gegen Desinfektionsmittel mit rutschhemmenden Eigenschaften.
            </p>

            {/* Specs */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-swish-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-mono font-bold text-sm">pH</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-swish-gray-900">{t("ph")}</span>
                  <span className="ml-2 text-sm text-swish-gray-500">8.0 - 9.0</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-swish-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Package size={18} className="text-green-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-swish-gray-900">{t("sizes")}</span>
                  <span className="ml-2 text-sm text-swish-gray-500">3,78 L / 18,9 L</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-swish-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={18} className="text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-swish-gray-900">{t("application")}</span>
                  <span className="ml-2 text-sm text-swish-gray-500">PVC, Linoleum, Naturstein, Kunststein</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/kontakt"
                className="inline-flex items-center justify-center bg-swish-red hover:bg-swish-red-dark text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              >
                Angebot anfordern
              </Link>
              <button className="inline-flex items-center justify-center gap-2 border border-swish-gray-200 hover:border-swish-red/30 text-swish-gray-700 px-6 py-3 rounded-xl font-medium text-sm transition-all">
                <FileText size={16} />
                {t("dataSheet")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
