"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PageBanner from "@/components/layout/PageBanner";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { MapPin, Briefcase, CheckCircle2, Phone, Mail, ArrowRight } from "lucide-react";
import contactData from "@/data/contact.json";

interface JobPosting {
  id: string; title: string; location: string; type: string;
  description: string; requirements: string[]; benefits: string[];
}

export default function KarrierePage() {
  const t = useTranslations("career");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/careers").then((r) => r.json()).then((d) => { setJobs(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageBanner title={t("title")} subtitle={t("subtitle")} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {loading ? (
          <div className="space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("noJobs")}</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">{t("noJobsDescription")}</p>
            <Link href="/kontakt" className="inline-flex items-center gap-2 bg-bs-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-bs-accent-dark transition-colors">
              {t("applyGeneral")} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, i) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-bs-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span className="bg-bs-accent/10 text-bs-accent px-3 py-0.5 rounded-full text-xs font-medium">{job.type}</span>
                    </div>
                  </div>
                  <Link href="/kontakt" className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-bs-accent-dark transition-colors">
                    {t("apply")} <ArrowRight size={14} />
                  </Link>
                </div>
                {job.description && <p className="text-bs-gray-600 text-sm leading-relaxed mb-6">{job.description}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {job.requirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-3">{t("requirements")}</h3>
                      <ul className="space-y-2">{job.requirements.map((r, ri) => (
                        <li key={ri} className="flex items-start gap-2 text-sm text-bs-gray-600"><CheckCircle2 size={16} className="text-bs-accent flex-shrink-0 mt-0.5" /> {r}</li>
                      ))}</ul>
                    </div>
                  )}
                  {job.benefits.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-3">{t("benefits")}</h3>
                      <ul className="space-y-2">{job.benefits.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2 text-sm text-bs-gray-600"><CheckCircle2 size={16} className="text-green-500 flex-shrink-0 mt-0.5" /> {b}</li>
                      ))}</ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Contact section */}
        <div className="mt-16 bg-bs-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("contactTitle")}</h2>
          <p className="text-bs-gray-500 text-sm mb-6">{t("contactDescription")}</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="flex items-center gap-2 text-bs-accent hover:underline"><Phone size={16} /> {contactData.phone}</a>
            <a href={`mailto:${contactData.email}`} className="flex items-center gap-2 text-bs-accent hover:underline"><Mail size={16} /> {contactData.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}
