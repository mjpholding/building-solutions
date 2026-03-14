"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, RotateCcw, Droplets, CheckCircle2,
  Layers, Droplets as DropIcon, Flame, Bug, Sparkles, Snowflake,
  Building2, UtensilsCrossed, Stethoscope, DoorOpen, Factory, Warehouse,
} from "lucide-react";

const surfaces = [
  { id: "pvc", label: "PVC / Linoleum", icon: Layers },
  { id: "stone", label: "Stein / Fliesen", icon: Layers },
  { id: "wood", label: "Holzboden", icon: Layers },
  { id: "glass", label: "Glas / Spiegel", icon: Layers },
  { id: "metal", label: "Edelstahl / Metall", icon: Layers },
  { id: "ceramic", label: "Keramik / Sanitär", icon: DropIcon },
  { id: "carpet", label: "Teppich", icon: Layers },
  { id: "concrete", label: "Beton", icon: Layers },
];

const rooms = [
  { id: "bathroom", label: "Bad / WC", icon: DropIcon },
  { id: "kitchen", label: "Küche", icon: UtensilsCrossed },
  { id: "office", label: "Büro", icon: Building2 },
  { id: "hallway", label: "Flur / Eingang", icon: DoorOpen },
  { id: "production", label: "Produktion", icon: Factory },
  { id: "warehouse", label: "Lager", icon: Warehouse },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "hospital", label: "Krankenhaus", icon: Stethoscope },
];

const dirtTypes = [
  { id: "general", label: "Allgemeine Verschmutzung", icon: Sparkles },
  { id: "grease", label: "Fett / Öl", icon: Flame },
  { id: "limescale", label: "Kalk / Mineral", icon: Droplets },
  { id: "organic", label: "Organisch", icon: Bug },
  { id: "salt", label: "Salz (Winter)", icon: Snowflake },
  { id: "stains", label: "Flecken", icon: Sparkles },
  { id: "polymer", label: "Alte Beschichtung", icon: Layers },
  { id: "bacteria", label: "Keime / Desinfektion", icon: Bug },
];

const intensityLevels = [
  { id: "light", color: "bg-green-100 border-green-300 text-green-700" },
  { id: "medium", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
  { id: "heavy", color: "bg-red-100 border-red-300 text-red-700" },
];

// Recommendation logic
function getRecommendations(surface: string, room: string, dirt: string, intensity: string) {
  const results: { slug: string; name: string; reason: string; ph: string }[] = [];

  if (dirt === "limescale") {
    results.push({ slug: "scale-remover", name: "SCALE REMOVER", ph: "0.5 - 1.0", reason: "Speziell entwickelt zur Entfernung hartnäckiger Kalkablagerungen" });
    results.push({ slug: "sani-clean", name: "SANI CLEAN", ph: "2.5 - 3.5", reason: "Saurer Sanitärreiniger für tägliche Kalkentfernung" });
  }
  if (dirt === "grease") {
    results.push({ slug: "de-grease", name: "DE-GREASE", ph: "10.4 - 11.4", reason: "Kraftvoller Fettlöser für hartnäckige Fettablagerungen" });
    results.push({ slug: "super-clean", name: "SUPER CLEAN", ph: "11.0 - 12.0", reason: "Universeller Kraftreiniger für alle fettigen Verschmutzungen" });
  }
  if (dirt === "bacteria") {
    results.push({ slug: "quato-78-professional", name: "QUATO 78 PROFESSIONAL", ph: "7.0", reason: "Professionelles Desinfektionsmittel für hygienische Sicherheit" });
  }
  if (surface === "glass") {
    results.push({ slug: "glass-clean", name: "GLASS CLEAN", ph: "9.0 - 10.0", reason: "Streifenfreie Reinigung für alle Glasoberflächen" });
  }
  if (surface === "carpet") {
    results.push({ slug: "stain-remover", name: "STAIN REMOVER", ph: "10.0 - 11.0", reason: "Speziell für Fleckenentfernung auf Teppichen" });
  }
  if (surface === "metal") {
    results.push({ slug: "stainless-steel-cleaner", name: "STAINLESS STEEL CLEANER", ph: "4.0 - 5.0", reason: "Spezialpflege für Edelstahloberflächen" });
  }
  if (surface === "ceramic" || room === "bathroom") {
    if (!results.some(r => r.slug === "kling")) {
      results.push({ slug: "kling", name: "KLING", ph: "8.0 - 10.0", reason: "Haftformel für vertikale Sanitärflächen" });
    }
  }
  if (dirt === "salt") {
    results.push({ slug: "winterinse", name: "WINTERINSE", ph: "12.0 - 13.0", reason: "Entfernt Salzrückstände und Winterverschmutzungen" });
  }
  if (dirt === "polymer") {
    results.push({ slug: "swish-strip", name: "SWISH-STRIP", ph: "11.5 - 13.5", reason: "Entfernt alte Polymerbeschichtungen gründlich" });
    results.push({ slug: "poly-lock-ultra", name: "POLY LOCK ULTRA", ph: "8.0 - 9.0", reason: "Für die anschließende Neuversiegelung des Bodens" });
  }
  if (room === "restaurant" || room === "kitchen") {
    if (!results.some(r => r.slug === "food-service-concentrate")) {
      results.push({ slug: "food-service-concentrate", name: "FOOD SERVICE", ph: "12.5 - 13.5", reason: "Speziell für Gastronomie und Lebensmittelbereiche zugelassen" });
    }
  }
  if ((surface === "pvc" || surface === "stone") && dirt === "general") {
    results.push({ slug: "sp-100-citro", name: "SP-100 CITRO", ph: "6.0 - 8.0", reason: "Neutraler Bodenreiniger für tägliche Pflege" });
    if (intensity === "heavy") {
      results.push({ slug: "jet", name: "JET", ph: "12.0 - 13.0", reason: "Stark alkalischer Reiniger für hartnäckige Bodenverschmutzungen" });
    }
  }
  if (room === "office" && dirt === "general") {
    results.push({ slug: "office-clean", name: "OFFICE CLEAN", ph: "9.0 - 10.0", reason: "Schonende Reinigung speziell für Büroumgebungen" });
  }

  if (results.length === 0) {
    results.push({ slug: "super-clean", name: "SUPER CLEAN", ph: "11.0 - 12.0", reason: "Universeller Kraftreiniger für vielfältige Anwendungen" });
    results.push({ slug: "e10-neutral", name: "E10 NEUTRAL", ph: "6.0 - 8.0", reason: "Kostengünstiger Universalreiniger für leichte Verschmutzungen" });
  }

  return results.slice(0, 4);
}

export default function ProductAdvisorPage() {
  const t = useTranslations("advisor");
  const [step, setStep] = useState(0);
  const [surface, setSurface] = useState("");
  const [room, setRoom] = useState("");
  const [dirt, setDirt] = useState("");
  const [intensity, setIntensity] = useState("");

  const steps = [t("step1"), t("step2"), t("step3"), t("step4"), t("step5")];
  const recommendations = step === 4 ? getRecommendations(surface, room, dirt, intensity) : [];

  function handleSelect(value: string) {
    if (step === 0) setSurface(value);
    else if (step === 1) setRoom(value);
    else if (step === 2) setDirt(value);
    else if (step === 3) setIntensity(value);
    if (step < 4) setStep(step + 1);
  }

  function restart() {
    setStep(0);
    setSurface("");
    setRoom("");
    setDirt("");
    setIntensity("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-swish-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-swish-gray-900">{t("title")}</h1>
          <p className="mt-3 text-swish-gray-500">{t("subtitle")}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-swish-red text-white" :
                i === step ? "bg-swish-red text-white ring-4 ring-swish-red/20" :
                "bg-swish-gray-200 text-swish-gray-500"
              }`}>
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-12 h-0.5 ${i < step ? "bg-swish-red" : "bg-swish-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div>
                <h2 className="text-xl font-semibold text-swish-gray-900 mb-6 text-center">{t("surface")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {surfaces.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelect(s.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center hover:border-swish-red hover:shadow-md ${
                          surface === s.id ? "border-swish-red bg-red-50" : "border-swish-gray-200 bg-white"
                        }`}
                      >
                        <Icon size={24} className="mx-auto mb-2 text-swish-gray-600" />
                        <span className="text-sm font-medium text-swish-gray-700">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-swish-gray-900 mb-6 text-center">{t("room")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {rooms.map((r) => {
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleSelect(r.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center hover:border-swish-red hover:shadow-md ${
                          room === r.id ? "border-swish-red bg-red-50" : "border-swish-gray-200 bg-white"
                        }`}
                      >
                        <Icon size={24} className="mx-auto mb-2 text-swish-gray-600" />
                        <span className="text-sm font-medium text-swish-gray-700">{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-swish-gray-900 mb-6 text-center">{t("dirt")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {dirtTypes.map((d) => {
                    const Icon = d.icon;
                    return (
                      <button
                        key={d.id}
                        onClick={() => handleSelect(d.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center hover:border-swish-red hover:shadow-md ${
                          dirt === d.id ? "border-swish-red bg-red-50" : "border-swish-gray-200 bg-white"
                        }`}
                      >
                        <Icon size={24} className="mx-auto mb-2 text-swish-gray-600" />
                        <span className="text-sm font-medium text-swish-gray-700">{d.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-swish-gray-900 mb-6 text-center">{t("intensity")}</h2>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {intensityLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleSelect(level.id)}
                      className={`p-6 rounded-xl border-2 transition-all text-center hover:shadow-md ${level.color} ${
                        intensity === level.id ? "ring-2 ring-swish-red" : ""
                      }`}
                    >
                      <span className="text-lg font-bold">{t(level.id)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold text-swish-gray-900 mb-2 text-center">{t("results")}</h2>
                <p className="text-swish-gray-500 text-center mb-8">{t("resultsDesc")}</p>

                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <Link
                      key={rec.slug}
                      href={`/produkte/${rec.slug}`}
                      className="group block bg-white p-5 rounded-xl border border-swish-gray-200 hover:border-swish-red/30 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-swish-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Droplets size={24} className="text-swish-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-swish-gray-900 group-hover:text-swish-red transition-colors">
                              {rec.name}
                            </h3>
                            <span className="text-xs font-mono text-swish-gray-400">pH {rec.ph}</span>
                          </div>
                          <p className="mt-1 text-sm text-swish-gray-500">{rec.reason}</p>
                          <div className="mt-2 flex items-center gap-1 text-swish-red text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Produkt ansehen <ArrowRight size={12} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          {step > 0 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 text-swish-gray-500 hover:text-swish-gray-700 font-medium text-sm transition-colors"
            >
              <ArrowLeft size={16} /> {t("back")}
            </button>
          )}
          {step === 4 && (
            <button
              onClick={restart}
              className="flex items-center gap-2 text-swish-red hover:text-swish-red-dark font-medium text-sm transition-colors mx-auto"
            >
              <RotateCcw size={16} /> {t("restart")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
