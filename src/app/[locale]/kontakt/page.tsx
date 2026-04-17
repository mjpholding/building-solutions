"use client";

import {} from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import PageBanner from "@/components/layout/PageBanner";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import contactData from "@/data/contact.json";

export default function ContactPage() {
  const t = useTranslations("contact");
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const firstName = data.get("firstName") || "";
    const lastName = data.get("lastName") || "";
    const email = data.get("email") || "";
    const company = data.get("company") || "";
    const phone = data.get("phone") || "";
    const message = data.get("message") || "";

    const subject = `Kontaktanfrage von ${firstName} ${lastName}${company ? ` (${company})` : ""}`;
    const body = [
      `Name: ${firstName} ${lastName}`,
      company ? `Firma: ${company}` : "",
      `E-Mail: ${email}`,
      phone ? `Telefon: ${phone}` : "",
      "",
      "Nachricht:",
      message,
    ].filter(Boolean).join("\n");

    window.location.href = `mailto:${contactData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(String(body))}`;
  }

  return (
    <div className="min-h-screen bg-bs-gray-50">
      <PageBanner title={t("title")} subtitle={t("subtitle")} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl border border-bs-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bs-tuerkisblau to-bs-tuerkis rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-bs-tuerkis/20">
                  <MapPin size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-bs-gray-900">{t("address")}</h3>
                  <p className="mt-1 text-sm text-bs-gray-500">{contactData.company}<br />{contactData.address}<br />{contactData.zip} {contactData.city}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-bs-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bs-tuerkisblau to-bs-tuerkis rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-bs-tuerkis/20">
                  <Phone size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-bs-gray-900">{t("phone")}</h3>
                  <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="mt-1 text-sm text-bs-gray-500 hover:text-bs-accent transition-colors block">
                    {contactData.phone}
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl border border-bs-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-bs-tuerkisblau to-bs-tuerkis rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-bs-tuerkis/20">
                  <Mail size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-bs-gray-900">{t("email")}</h3>
                  <a href={`mailto:${contactData.email}`} className="mt-1 text-sm text-bs-gray-500 hover:text-bs-accent transition-colors block">
                    {contactData.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-bs-gray-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-bs-gray-700 mb-1.5">{t("form.firstName")}</label>
                      <input name="firstName" type="text" required className="w-full px-4 py-3 rounded-xl border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bs-gray-700 mb-1.5">{t("form.lastName")}</label>
                      <input name="lastName" type="text" required className="w-full px-4 py-3 rounded-xl border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-bs-gray-700 mb-1.5">{t("form.email")}</label>
                      <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bs-gray-700 mb-1.5">{t("form.company")}</label>
                      <input name="company" type="text" className="w-full px-4 py-3 rounded-xl border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bs-gray-700 mb-1.5">{t("form.phone")}</label>
                    <input name="phone" type="tel" className="w-full px-4 py-3 rounded-xl border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bs-gray-700 mb-1.5">{t("form.message")}</label>
                    <textarea name="message" rows={5} required className="w-full px-4 py-3 rounded-xl border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm transition-all resize-none" />
                  </div>
                  <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-bs-accent hover:bg-bs-accent-dark text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md">
                    <Send size={16} />
                    {t("form.submit")}
                  </button>
                </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
