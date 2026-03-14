"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", labelKey: "home" },
  { href: "/produkte", labelKey: "products" },
  { href: "/produktberater", labelKey: "productAdvisor" },
  { href: "/uber-uns", labelKey: "about" },
  { href: "/hygieneplane", labelKey: "hygienePlans" },
  { href: "/downloads", labelKey: "downloads" },
  { href: "/kontakt", labelKey: "contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-swish-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-3xl lg:text-4xl font-bold text-swish-red italic tracking-tight" style={{ fontFamily: "cursive" }}>
                Swish
              </span>
              <span className="text-sm lg:text-base font-medium text-swish-gray-800 leading-tight">
                Deutschland
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-swish-red bg-red-50"
                      : "text-swish-gray-700 hover:text-swish-red hover:bg-swish-gray-50"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Language + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/kontakt"
              className="bg-swish-red hover:bg-swish-red-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {t("requestQuote")}
            </Link>
          </div>

          {/* Mobile: Language + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-swish-gray-700 hover:bg-swish-gray-100 transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-swish-gray-200 bg-white overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-swish-red bg-red-50"
                        : "text-swish-gray-700 hover:bg-swish-gray-50"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <Link
                href="/kontakt"
                onClick={() => setMobileOpen(false)}
                className="block mt-3 bg-swish-red text-white text-center px-4 py-3 rounded-lg text-sm font-semibold"
              >
                {t("requestQuote")}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
