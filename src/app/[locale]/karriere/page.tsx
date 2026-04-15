"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import PageBanner from "@/components/layout/PageBanner";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  MapPin, CheckCircle2, Phone, Mail, ArrowRight, Briefcase,
  Zap, Users, TrendingUp, Wrench, ShieldCheck,
  Sparkles, Heart, Calendar, Award
} from "lucide-react";
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

      {/* Hero: Lust auf Elektrotechnik? */}
      <section className="py-20 bg-gradient-to-br from-bs-accent to-bs-accent-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} /> Praktikum & Einstieg
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">Lust auf Gebäudetechnik?</h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Wir suchen engagierte, junge Menschen, die unser Team unterstützen und mit uns Gebäude sicherer, effizienter und komfortabler machen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ausbildungsposition */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-bs-accent/10 text-bs-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Briefcase size={16} /> Praktikum bei uns
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Sammle echte Praxiserfahrung bei Building Solutions
            </h2>
            <p className="text-lg text-bs-gray-600">
              Arbeite mit uns Seite an Seite auf <span className="font-semibold text-bs-accent">echten Projekten</span> — von der Planung bis zur Inbetriebnahme.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: "Einsatzort", value: "Kerpen / NRW" },
              { icon: Calendar, label: "Dauer", value: "Nach Absprache" },
              { icon: Wrench, label: "Schwerpunkt", value: "Praxis vor Ort" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-bs-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <div className="w-12 h-12 mx-auto bg-bs-accent/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon size={22} className="text-bs-accent" />
                  </div>
                  <p className="text-xs text-bs-gray-500 uppercase tracking-wider font-medium mb-1">{item.label}</p>
                  <p className="font-bold text-gray-900">{item.value}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Arbeitsbereiche */}
      <section className="py-16 bg-bs-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dein Arbeitsplatz ist spannend</h2>
            <p className="text-bs-gray-600 leading-relaxed mb-8 text-lg">
              Ob Bürogebäude, Schulen, Krankenhäuser, Einkaufszentren oder Industrieanlagen — bei Building Solutions erwarten dich abwechslungsreiche Baustellen und spannende Projekte. Deine Ausbildung umfasst Planung, Installation und Aufbau elektrischer Anlagen und Schaltschränke, die Programmierung ganzer Systeme sowie die Installation von Beleuchtungs-, Schalt-, Steuer- und Regeleinrichtungen.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Sicherheitssysteme", "Videoüberwachung", "Elektrotechnik", "Photovoltaik", "Kommunikation", "Gefahrenmanagement", "Smart Building", "Netzwerktechnik"].map((area, i) => (
                <motion.div key={area} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl px-4 py-3 text-sm font-medium text-gray-700 text-center border border-gray-100 hover:border-bs-accent/30 hover:shadow-md transition-all">
                  {area}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Was du lernst */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-gray-900 mb-3">
            Was du bei uns lernst
          </motion.h2>
          <p className="text-bs-gray-600 mb-10 text-lg">Deine Lernziele während der Ausbildung:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Zap, text: "Installation von Energieversorgungseinrichtungen, Elektro- und Beleuchtungsanlagen" },
              { icon: ShieldCheck, text: "Prüfung von Funktionen, Betriebssicherheit und Energieeffizienz" },
              { icon: Wrench, text: "Testen gebäudetechnischer Systeme und Integration moderner Technologien" },
              { icon: TrendingUp, text: "Messungen an elektrischen Anlagen und Fehlerdiagnose" },
              { icon: Users, text: "Wartung, Service und Kundenbetreuung vor Ort" },
              { icon: Award, text: "Erstellung technischer Dokumentation und Projektnachweise" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4 p-5 bg-bs-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-bs-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-bs-accent" />
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Was erwartet dich bei uns */}
      <section className="py-16 bg-bs-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Das erwartet dich bei uns
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Briefcase, title: "Flexible Dauer", desc: "Praktikumszeit nach Absprache — wir finden die passende Lösung" },
              { icon: Heart, title: "Familiäres Team", desc: "Inhabergeführtes Unternehmen mit ausgezeichnetem Betriebsklima" },
              { icon: TrendingUp, title: "Echte Projekte", desc: "Arbeit auf realen Baustellen mit konkreten Aufgaben" },
              { icon: Wrench, title: "Ausstattung inklusive", desc: "Hochwertiges Werkzeug und komplette Arbeitskleidung" },
              { icon: Users, title: "Paten-System", desc: "Persönliche Betreuung durch einen erfahrenen Kollegen" },
              { icon: Sparkles, title: "Team-Events", desc: "Gemeinsame Aktivitäten auch außerhalb der Arbeitszeit" },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-bs-tuerkis rounded-xl flex items-center justify-center mb-4 shadow-md shadow-bs-tuerkis/25">
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-bs-gray-600 leading-relaxed">{b.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Perspektiven */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-bs-gray-900 text-white rounded-3xl p-10 lg:p-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <TrendingUp size={14} /> Perspektiven
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Deine Zukunft bei uns</h2>
              <p className="text-white/70 leading-relaxed text-lg mb-8">
                Mit uns wächst du durch echte Praxis. Nach erfolgreicher Einarbeitung übernimmst du als <span className="text-white font-semibold">Facharbeiter</span> eigenverantwortlich Aufgaben. Bei entsprechendem Engagement entwickeln wir dich weiter zum <span className="text-white font-semibold">Führungsmonteur</span>, <span className="text-white font-semibold">Bauleiter</span> oder <span className="text-white font-semibold">Projektleiter</span> — Karriere bei uns entsteht durch Können, nicht durch Titel.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Facharbeiter", "Führungsmonteur", "Bauleiter", "Projektleiter"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 bg-bs-accent-light/30 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dein Profil */}
      <section className="py-16 bg-bs-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-gray-900 mb-4">
            Dein Profil
          </motion.h2>
          <p className="text-bs-gray-600 mb-8 text-lg">Das bringst du mit:</p>
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Erfolgreicher Schulabschluss",
                "Spaß an Mathematik und Physik",
                "Gutes logisches Denken",
                "Handwerklich-technisches Geschick",
                "Zuverlässigkeit und Leistungsbereitschaft",
                "Eigeninitiative und Teamfähigkeit",
              ].map((req, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-bs-accent flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{req}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offene Stellen (dynamic jobs) */}
      {!loading && jobs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Weitere offene Stellen</h2>
            <div className="space-y-4">
              {jobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="bg-bs-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-bs-gray-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                        <span className="bg-bs-accent/10 text-bs-accent px-3 py-0.5 rounded-full text-xs font-medium">{job.type}</span>
                      </div>
                    </div>
                    <Link href="/kontakt" className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-bs-accent-dark transition-colors">
                      {t("apply")} <ArrowRight size={14} />
                    </Link>
                  </div>
                  {job.description && <p className="text-bs-gray-600 text-sm">{job.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bewerbung CTA */}
      <section className="py-20 bg-gradient-to-br from-bs-accent to-bs-accent-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Bist du bereit?</h2>
            <p className="text-lg text-white/90 mb-3">Dann bewirb dich bei uns!</p>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Das klingt gut? Dann werde Teil unseres erfolgreichen Teams bei Building Solutions GmbH in Kerpen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/kontakt" className="inline-flex items-center justify-center gap-2 bg-white text-bs-accent hover:bg-bs-gray-100 px-7 py-3.5 rounded-xl font-semibold transition-colors shadow-lg">
                Jetzt bewerben <ArrowRight size={16} />
              </Link>
              <a href={`mailto:${contactData.email}?subject=Bewerbung%20Ausbildung`} className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/25 px-7 py-3.5 rounded-xl font-semibold transition-colors">
                <Mail size={16} /> Bewerbung per E-Mail
              </a>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-white/80">
              <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={14} /> {contactData.phone}
              </a>
              <a href={`mailto:${contactData.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={14} /> {contactData.email}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
