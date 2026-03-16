"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import contactData from "@/data/contact.json";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-swish-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-swish-gray-900 to-swish-gray-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl lg:text-5xl font-bold">{t("title")}</h1>
            <p className="mt-4 text-xl text-swish-gray-300">{t("subtitle")}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl border border-swish-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={22} className="text-swish-red" />
                </div>
                <div>
                  <h3 className="font-semibold text-swish-gray-900">{t("address")}</h3>
                  <p className="mt-1 text-sm text-swish-gray-500">{contactData.company}<br />{contactData.address}<br />{contactData.zip} {contactData.city}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-swish-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone size={22} className="text-swish-red" />
                </div>
                <div>
                  <h3 className="font-semibold text-swish-gray-900">{t("phone")}</h3>
                  <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="mt-1 text-sm text-swish-gray-500 hover:text-swish-red transition-colors block">
                    {contactData.phone}
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl border border-swish-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={22} className="text-swish-red" />
                </div>
                <div>
                  <h3 className="font-semibold text-swish-gray-900">{t("email")}</h3>
                  <a href={`mailto:${contactData.email}`} className="mt-1 text-sm text-swish-gray-500 hover:text-swish-red transition-colors block">
                    {contactData.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-swish-gray-100 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={56} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-swish-gray-900">{t("form.success")}</h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-swish-gray-700 mb-1.5">{t("form.firstName")}</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-swish-gray-700 mb-1.5">{t("form.lastName")}</label>
                      <input type="text" required className="w-full px-4 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-swish-gray-700 mb-1.5">{t("form.email")}</label>
                      <input type="email" required className="w-full px-4 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-swish-gray-700 mb-1.5">{t("form.company")}</label>
                      <input type="text" className="w-full px-4 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1.5">{t("form.phone")}</label>
                    <input type="tel" className="w-full px-4 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1.5">{t("form.message")}</label>
                    <textarea rows={5} required className="w-full px-4 py-3 rounded-xl border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm transition-all resize-none" />
                  </div>
                  <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-swish-red hover:bg-swish-red-dark text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md">
                    <Send size={16} />
                    {t("form.submit")}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
