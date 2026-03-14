"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="bg-swish-gray-900 text-white">
      {/* Red accent bar */}
      <div className="h-1 bg-swish-red" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <span className="text-3xl font-bold text-swish-red italic" style={{ fontFamily: "cursive" }}>
                Swish
              </span>
              <span className="text-lg font-medium text-white ml-1">Deutschland</span>
            </div>
            <p className="text-swish-gray-400 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-400 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/produkte", label: tNav("products") },
                { href: "/produktberater", label: tNav("productAdvisor") },
                { href: "/uber-uns", label: tNav("about") },
                { href: "/hygieneplane", label: tNav("hygienePlans") },
                { href: "/downloads", label: tNav("downloads") },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-swish-gray-300 hover:text-swish-red transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-400 mb-4">
              {tNav("contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-swish-red mt-0.5 flex-shrink-0" />
                <span className="text-swish-gray-300 text-sm">{t("address")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-swish-red flex-shrink-0" />
                <a href="tel:+4922739515577" className="text-swish-gray-300 hover:text-white text-sm transition-colors">
                  {t("phone")}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-swish-red flex-shrink-0" />
                <a href="mailto:info@swish-deutschland.de" className="text-swish-gray-300 hover:text-white text-sm transition-colors">
                  info@swish-deutschland.de
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-400 mb-4">
              Legal
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/kontakt" className="text-swish-gray-300 hover:text-swish-red transition-colors text-sm">
                  {t("imprint")}
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-swish-gray-300 hover:text-swish-red transition-colors text-sm">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-swish-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-swish-gray-500 text-xs">
            &copy; {new Date().getFullYear()} {t("company")}. {t("rights")}.
          </p>
          <p className="text-swish-gray-600 text-xs">
            Experts in complete cleaning solutions
          </p>
        </div>
      </div>
    </footer>
  );
}
