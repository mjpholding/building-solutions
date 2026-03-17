"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import contactData from "@/data/contact.json";

export default function Footer() {
  const t = useTranslations("footer");
  const tL = useTranslations("legal");
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
              <Image
                src="/logo-swish-deutschland.png"
                alt="Swish Deutschland"
                width={160}
                height={70}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-swish-gray-400 text-sm leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-400 mb-4">
              {tL("navigation")}
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
                <span className="text-swish-gray-300 text-sm">
                  {contactData.company}<br />
                  {contactData.address}<br />
                  {contactData.zip} {contactData.city}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-swish-red flex-shrink-0" />
                <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="text-swish-gray-300 hover:text-white text-sm transition-colors">
                  {contactData.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-swish-red flex-shrink-0" />
                <a href={`mailto:${contactData.email}`} className="text-swish-gray-300 hover:text-white text-sm transition-colors">
                  {contactData.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-400 mb-4">
              {tL("legalSection")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/impressum" className="text-swish-gray-300 hover:text-swish-red transition-colors text-sm">
                  {t("imprint")}
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-swish-gray-300 hover:text-swish-red transition-colors text-sm">
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
            {tL("expertTagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
