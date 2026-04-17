"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import PageBanner from "@/components/layout/PageBanner";
import { MapPin, Phone, Mail, Send, X } from "lucide-react";
import contactData from "@/data/contact.json";

function GmailIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 6L12 13L2 6V4l10 7 10-7v2z" fill="#EA4335"/>
      <path d="M2 6v12a2 2 0 002 2h16a2 2 0 002-2V6l-10 7L2 6z" fill="#FBBC05" fillOpacity="0.3"/>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#EA4335" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function OutlookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/>
      <path d="M22 6L12 13L2 6" stroke="white" strokeWidth="1.5" fill="none"/>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0078D4" strokeWidth="0.5" fill="none"/>
    </svg>
  );
}

export default function ContactPage() {
  const t = useTranslations("contact");
  const [showProviders, setShowProviders] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function getFormData() {
    if (!formRef.current) return null;
    const data = new FormData(formRef.current);
    const firstName = String(data.get("firstName") || "");
    const lastName = String(data.get("lastName") || "");
    const email = String(data.get("email") || "");
    const company = String(data.get("company") || "");
    const phone = String(data.get("phone") || "");
    const message = String(data.get("message") || "");

    if (!firstName || !email || !message) return null;

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

    return { subject, body, to: contactData.email };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }
    setShowProviders(true);
  }

  function sendVia(provider: "default" | "gmail" | "outlook" | "yahoo") {
    const d = getFormData();
    if (!d) return;

    const { subject, body, to } = d;
    const subjectEnc = encodeURIComponent(subject);
    const bodyEnc = encodeURIComponent(body);
    const toEnc = encodeURIComponent(to);

    let url = "";
    switch (provider) {
      case "gmail":
        url = `https://mail.google.com/mail/?view=cm&to=${toEnc}&su=${subjectEnc}&body=${bodyEnc}`;
        break;
      case "outlook":
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${toEnc}&subject=${subjectEnc}&body=${bodyEnc}`;
        break;
      case "yahoo":
        url = `https://compose.mail.yahoo.com/?to=${toEnc}&subject=${subjectEnc}&body=${bodyEnc}`;
        break;
      default:
        window.location.href = `mailto:${to}?subject=${subjectEnc}&body=${bodyEnc}`;
        setShowProviders(false);
        return;
    }
    window.open(url, "_blank");
    setShowProviders(false);
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
          <div className="lg:col-span-2 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-bs-gray-100 shadow-sm">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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

            {/* Provider selection modal */}
            <AnimatePresence>
              {showProviders && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowProviders(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-gray-900 text-lg">E-Mail senden über:</h3>
                      <button onClick={() => setShowProviders(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <button onClick={() => sendVia("gmail")} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all text-left group">
                        <GmailIcon size={28} />
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Gmail</p>
                          <p className="text-xs text-gray-500">Im Browser öffnen</p>
                        </div>
                      </button>

                      <button onClick={() => sendVia("outlook")} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group">
                        <OutlookIcon size={28} />
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Outlook</p>
                          <p className="text-xs text-gray-500">Microsoft Outlook Web</p>
                        </div>
                      </button>

                      <button onClick={() => sendVia("yahoo")} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-left group">
                        <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white text-xs font-bold">Y!</div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Yahoo Mail</p>
                          <p className="text-xs text-gray-500">Im Browser öffnen</p>
                        </div>
                      </button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">oder</span></div>
                      </div>

                      <button onClick={() => sendVia("default")} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-bs-accent hover:bg-bs-accent/5 transition-all text-left group">
                        <div className="w-7 h-7 bg-bs-accent rounded-md flex items-center justify-center">
                          <Mail size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-bs-accent transition-colors">Standard E-Mail App</p>
                          <p className="text-xs text-gray-500">Outlook Desktop, Apple Mail, Thunderbird…</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
