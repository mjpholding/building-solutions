"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Phone, Mail, MapPin } from "lucide-react";
import contactData from "@/data/contact.json";
import { usePageVisibility } from "@/lib/use-page-visibility";
import SiteLogo from "@/components/layout/SiteLogo";

export default function Footer() {
  const t = useTranslations("footer");
  const tL = useTranslations("legal");
  const tNav = useTranslations("nav");
  const { isPageEnabled } = usePageVisibility();

  const footerNavItems = [
    { href: "/leistungen", label: tNav("services"), slug: "leistungen" },
    { href: "/referenzen", label: tNav("references"), slug: "referenzen" },
    { href: "/uber-uns", label: tNav("about"), slug: "uber-uns" },
    { href: "/karriere", label: tNav("career"), slug: "karriere" },
    { href: "/partner", label: tNav("partners"), slug: "partner" },
    { href: "/kontakt", label: tNav("contact"), slug: "kontakt" },
  ].filter((item) => isPageEnabled(item.slug));

  return (
    <footer className="bg-bs-gray-900 text-white">
      {/* Red accent bar */}
      <div className="h-1 bg-bs-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <SiteLogo variant="dark" className="h-10 w-auto" />
            </div>
            <p className="text-bs-gray-400 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-bs-gray-400 mb-4">
              {tL("navigation")}
            </h3>
            <ul className="space-y-2.5">
              {footerNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-bs-gray-300 hover:text-bs-accent transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-bs-gray-400 mb-4">
              {tNav("contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-bs-accent mt-0.5 flex-shrink-0" />
                <span className="text-bs-gray-300 text-sm">
                  {contactData.company}<br />
                  {contactData.address}<br />
                  {contactData.zip} {contactData.city}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-bs-accent flex-shrink-0" />
                <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="text-bs-gray-300 hover:text-white text-sm transition-colors">
                  {contactData.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-bs-accent flex-shrink-0" />
                <a href={`mailto:${contactData.email}`} className="text-bs-gray-300 hover:text-white text-sm transition-colors">
                  {contactData.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-bs-gray-400 mb-4">
              {tL("legalSection")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/impressum" className="text-bs-gray-300 hover:text-bs-accent transition-colors text-sm">
                  {t("imprint")}
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-bs-gray-300 hover:text-bs-accent transition-colors text-sm">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-bs-gray-300 hover:text-bs-accent transition-colors text-sm">
                  AGB
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-bs-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-bs-gray-500 text-xs">
            &copy; {new Date().getFullYear()} {t("company")}. {t("rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
