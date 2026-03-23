"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { trackAdvisorStart, trackAdvisorResult } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowLeft, RotateCcw, Droplets, CheckCircle2,
  Layers, Droplets as DropIcon, Flame, Bug, Sparkles, Snowflake,
  Building2, UtensilsCrossed, Stethoscope, DoorOpen, Factory, Warehouse,
} from "lucide-react";

const surfaceItems = [
  { id: "pvc", icon: Layers },
  { id: "stone", icon: Layers },
  { id: "wood", icon: Layers },
  { id: "glass", icon: Layers },
  { id: "metal", icon: Layers },
  { id: "ceramic", icon: DropIcon },
  { id: "carpet", icon: Layers },
  { id: "concrete", icon: Layers },
];

const roomItems = [
  { id: "bathroom", icon: DropIcon },
  { id: "kitchen", icon: UtensilsCrossed },
  { id: "office", icon: Building2 },
  { id: "hallway", icon: DoorOpen },
  { id: "production", icon: Factory },
  { id: "warehouse", icon: Warehouse },
  { id: "restaurant", icon: UtensilsCrossed },
  { id: "hospital", icon: Stethoscope },
];

const dirtItems = [
  { id: "general", icon: Sparkles },
  { id: "grease", icon: Flame },
  { id: "limescale", icon: Droplets },
  { id: "organic", icon: Bug },
  { id: "salt", icon: Snowflake },
  { id: "stains", icon: Sparkles },
  { id: "polymer", icon: Layers },
  { id: "bacteria", icon: Bug },
];

const intensityLevels = [
  { id: "light", color: "bg-green-100 border-green-300 text-green-700" },
  { id: "medium", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
  { id: "heavy", color: "bg-red-100 border-red-300 text-red-700" },
];

// Recommendation logic — uses reasonKey instead of hardcoded German strings
function getRecommendations(surface: string, room: string, dirt: string, intensity: string) {
  const results: { slug: string; name: string; reasonKey: string; ph: string }[] = [];

  if (dirt === "limescale") {
    results.push({ slug: "scale-remover", name: "SCALE REMOVER", ph: "0.5 - 1.0", reasonKey: "reasonScaleRemover" });
    results.push({ slug: "sani-clean", name: "SANI CLEAN", ph: "2.5 - 3.5", reasonKey: "reasonSaniClean" });
  }
  if (dirt === "grease") {
    results.push({ slug: "de-grease", name: "DE-GREASE", ph: "10.4 - 11.4", reasonKey: "reasonDeGrease" });
    results.push({ slug: "super-clean", name: "SUPER CLEAN", ph: "11.0 - 12.0", reasonKey: "reasonSuperCleanGrease" });
  }
  if (dirt === "bacteria") {
    results.push({ slug: "quato-78-professional", name: "QUATO 78 PROFESSIONAL", ph: "7.0", reasonKey: "reasonQuato" });
  }
  if (surface === "glass") {
    results.push({ slug: "glass-clean", name: "GLASS CLEAN", ph: "9.0 - 10.0", reasonKey: "reasonGlassClean" });
  }
  if (surface === "carpet") {
    results.push({ slug: "stain-remover", name: "STAIN REMOVER", ph: "10.0 - 11.0", reasonKey: "reasonStainRemover" });
  }
  if (surface === "metal") {
    results.push({ slug: "stainless-steel-cleaner", name: "STAINLESS STEEL CLEANER", ph: "4.0 - 5.0", reasonKey: "reasonStainlessSteel" });
  }
  if (surface === "ceramic" || room === "bathroom") {
    if (!results.some(r => r.slug === "kling")) {
      results.push({ slug: "kling", name: "KLING", ph: "8.0 - 10.0", reasonKey: "reasonKling" });
    }
  }
  if (dirt === "salt") {
    results.push({ slug: "winterinse", name: "WINTERINSE", ph: "12.0 - 13.0", reasonKey: "reasonWinterinse" });
  }
  if (dirt === "polymer") {
    results.push({ slug: "swish-strip", name: "SWISH-STRIP", ph: "11.5 - 13.5", reasonKey: "reasonSwishStrip" });
    results.push({ slug: "poly-lock-ultra", name: "POLY LOCK ULTRA", ph: "8.0 - 9.0", reasonKey: "reasonPolyLock" });
  }
  if (room === "restaurant" || room === "kitchen") {
    if (!results.some(r => r.slug === "food-service-concentrate")) {
      results.push({ slug: "food-service-concentrate", name: "FOOD SERVICE", ph: "12.5 - 13.5", reasonKey: "reasonFoodService" });
    }
  }
  if ((surface === "pvc" || surface === "stone") && dirt === "general") {
    results.push({ slug: "sp-100-citro", name: "SP-100 CITRO", ph: "6.0 - 8.0", reasonKey: "reasonSp100" });
    if (intensity === "heavy") {
      results.push({ slug: "jet", name: "JET", ph: "12.0 - 13.0", reasonKey: "reasonJet" });
    }
  }
  if (room === "office" && dirt === "general") {
    results.push({ slug: "office-clean", name: "OFFICE CLEAN", ph: "9.0 - 10.0", reasonKey: "reasonOfficeClean" });
  }

  if (results.length === 0) {
    results.push({ slug: "super-clean", name: "SUPER CLEAN", ph: "11.0 - 12.0", reasonKey: "reasonSuperCleanDefault" });
    results.push({ slug: "e10-neutral", name: "E10 NEUTRAL", ph: "6.0 - 8.0", reasonKey: "reasonE10Neutral" });
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

  // Track advisor start on mount
  useEffect(() => {
    trackAdvisorStart();
  }, []);

  function handleSelect(value: string) {
    if (step === 0) setSurface(value);
    else if (step === 1) setRoom(value);
    else if (step === 2) setDirt(value);
    else if (step === 3) setIntensity(value);
    if (step < 4) setStep(step + 1);
  }

  // Track advisor results when reaching step 4
  useEffect(() => {
    if (step === 4 && recommendations.length > 0) {
      trackAdvisorResult(
        `${surface}/${room}/${dirt}/${intensity}`,
        recommendations.map((r) => r.name)
      );
    }
  }, [step]);

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
                  {surfaceItems.map((s) => {
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
                        <span className="text-sm font-medium text-swish-gray-700">{t(`surfaces.${s.id}`)}</span>
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
                  {roomItems.map((r) => {
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
                        <span className="text-sm font-medium text-swish-gray-700">{t(`rooms.${r.id}`)}</span>
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
                  {dirtItems.map((d) => {
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
                        <span className="text-sm font-medium text-swish-gray-700">{t(`dirtTypes.${d.id}`)}</span>
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
                          <p className="mt-1 text-sm text-swish-gray-500">{t(rec.reasonKey)}</p>
                          <div className="mt-2 flex items-center gap-1 text-swish-red text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {t("viewProduct")} <ArrowRight size={12} />
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
