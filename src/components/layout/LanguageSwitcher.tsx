"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { motion, AnimatePresence } from "framer-motion";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(newLocale: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-white shadow-lg border border-swish-gray-200 flex items-center justify-center text-2xl hover:shadow-xl hover:scale-105 transition-all"
        aria-label="Select language"
      >
        {localeFlags[locale]}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-swish-gray-200 py-2 min-w-[200px] max-h-[70vh] overflow-y-auto"
          >
            <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-swish-gray-400">Sprache / Language</p>
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  loc === locale
                    ? "text-swish-red bg-red-50 font-medium"
                    : "text-swish-gray-700 hover:bg-swish-gray-50"
                }`}
              >
                <span className="text-lg">{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
