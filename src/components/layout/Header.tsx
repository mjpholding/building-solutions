"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, X, ShoppingBag, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { useCustomer } from "@/lib/customer-context";
import { usePageVisibility } from "@/lib/use-page-visibility";
import SiteLogo from "@/components/layout/SiteLogo";

const allNavItems = [
  { href: "/leistungen", labelKey: "services", slug: "leistungen" },
  { href: "/referenzen", labelKey: "references", slug: "referenzen" },
  { href: "/uber-uns", labelKey: "about", slug: "uber-uns" },
  { href: "/karriere", labelKey: "career", slug: "karriere" },
  { href: "/partner", labelKey: "partners", slug: "partner" },
  { href: "/kontakt", labelKey: "contact", slug: "kontakt" },
  { href: "/produkte", labelKey: "products", slug: "produkte" },
  { href: "/produktberater", labelKey: "productAdvisor", slug: "produktberater" },
  { href: "/hygieneplane", labelKey: "hygienePlans", slug: "hygieneplane" },
  { href: "/downloads", labelKey: "downloads", slug: "downloads" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const tA = useTranslations("account");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { customer } = useCustomer();
  const { isPageEnabled } = usePageVisibility();

  const navItems = allNavItems.filter((item) => isPageEnabled(item.slug));
  const isHome = pathname === "/" || pathname === "";

  return (
    <header className={`top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isHome
        ? "fixed bg-transparent"
        : "sticky bg-white/95 backdrop-blur-md border-b border-bs-gray-200 shadow-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <SiteLogo variant={isHome ? "dark" : "light"} className="h-7 lg:h-9 w-auto" />
          </Link>

          {/* Spacer to push nav right */}
          <div className="flex-1" />

          {/* Desktop Nav — right aligned */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isHome
                      ? isActive
                        ? "text-white bg-white/15"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                      : isActive
                        ? "text-bs-accent bg-bs-gray-50"
                        : "text-bs-gray-700 hover:text-bs-accent hover:bg-bs-gray-50"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <Link
              href={customer ? "/konto" : "/konto/login"}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isHome ? "text-white/70 hover:bg-white/10" : "text-bs-gray-600 hover:bg-bs-gray-50"
              }`}
              aria-label="Konto"
            >
              <UserCircle size={18} />
              <span className="text-[13px] font-medium">
                {customer ? customer.name.split(" ")[0] : tA("login")}
              </span>
              {customer && <span className="w-2 h-2 bg-green-500 rounded-full" />}
            </Link>
            <div className={`w-px h-6 ${isHome ? "bg-white/20" : "bg-bs-gray-200"}`} />
            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isHome ? "text-white/70 hover:bg-white/10" : "text-bs-gray-600 hover:bg-bs-gray-50"
              }`}
              aria-label="Warenkorb"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="bg-bs-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {totalItems}
                </span>
              )}
            </button>
            <Link
              href="/kontakt"
              className={`ml-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap ${
                isHome
                  ? "bg-white/15 hover:bg-white/25 text-white border border-white/25"
                  : "bg-bs-accent hover:bg-bs-accent-dark text-white"
              }`}
            >
              {t("requestQuote")}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2.5 rounded-lg transition-colors ${
                isHome ? "text-white hover:bg-white/10" : "text-bs-gray-600 hover:bg-bs-gray-50"
              }`}
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
            className={`lg:hidden overflow-hidden ${
              isHome ? "bg-bs-gray-900/95 backdrop-blur-md" : "bg-white border-t border-bs-gray-200"
            }`}
          >
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isHome
                        ? isActive ? "text-white bg-white/15" : "text-white/70 hover:bg-white/10"
                        : isActive ? "text-bs-accent bg-bs-gray-50" : "text-bs-gray-700 hover:bg-bs-gray-50"
                    }`}
                  >
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <div className="pt-2">
                <Link
                  href="/kontakt"
                  onClick={() => setMobileOpen(false)}
                  className={`block text-center px-4 py-3 rounded-lg text-sm font-semibold ${
                    isHome ? "bg-white/15 text-white" : "bg-bs-accent text-white"
                  }`}
                >
                  {t("requestQuote")}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
