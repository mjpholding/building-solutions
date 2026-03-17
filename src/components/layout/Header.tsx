"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Menu, X, ShoppingBag, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { useCustomer } from "@/lib/customer-context";

const navItems = [
  { href: "/produkte", labelKey: "products" },
  { href: "/produktberater", labelKey: "productAdvisor" },
  { href: "/uber-uns", labelKey: "about" },
  { href: "/hygieneplane", labelKey: "hygienePlans" },
  { href: "/downloads", labelKey: "downloads" },
  { href: "/kontakt", labelKey: "contact" },
] as const;

export default function Header() {
  const t = useTranslations("nav");
  const tA = useTranslations("account");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { customer } = useCustomer();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-swish-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-swish-deutschland.png"
              alt="Swish Deutschland"
              width={180}
              height={80}
              className="h-12 lg:h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
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

          {/* Right side: Account + Cart + CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href={customer ? "/konto" : "/konto/login"}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-swish-gray-600 hover:bg-swish-gray-50 transition-colors text-sm"
              aria-label="Konto"
            >
              <UserCircle size={18} />
              <span className="text-[13px] font-medium">
                {customer ? customer.name.split(" ")[0] : tA("login")}
              </span>
              {customer && (
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </Link>
            <div className="w-px h-6 bg-swish-gray-200" />
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-swish-gray-600 hover:bg-swish-gray-50 transition-colors text-sm"
              aria-label="Warenkorb"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="bg-swish-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {totalItems}
                </span>
              )}
            </button>
            <Link
              href="/kontakt"
              className="ml-2 bg-swish-red hover:bg-swish-red-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              {t("requestQuote")}
            </Link>
          </div>

          {/* Mobile right */}
          <div className="flex lg:hidden items-center gap-1">
            <Link
              href={customer ? "/konto" : "/konto/login"}
              className="relative p-2.5 rounded-lg text-swish-gray-600 hover:bg-swish-gray-50 transition-colors"
              aria-label="Konto"
            >
              <UserCircle size={22} />
              {customer && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-lg text-swish-gray-600 hover:bg-swish-gray-50 transition-colors"
              aria-label="Warenkorb"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-swish-red text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-lg text-swish-gray-600 hover:bg-swish-gray-50 transition-colors"
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
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "text-swish-red bg-red-50"
                    : "text-swish-gray-700 hover:bg-swish-gray-50"
                }`}
              >
                {t("home")}
              </Link>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href);
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
              <div className="pt-2 space-y-2">
                <Link
                  href={customer ? "/konto" : "/konto/login"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-swish-gray-700 hover:bg-swish-gray-50"
                >
                  <UserCircle size={18} />
                  {customer ? `${tA("myAccount")} (${customer.name.split(" ")[0]})` : tA("loginRegister")}
                </Link>
                <Link
                  href="/kontakt"
                  onClick={() => setMobileOpen(false)}
                  className="block bg-swish-red text-white text-center px-4 py-3 rounded-lg text-sm font-semibold"
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
