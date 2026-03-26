"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

interface HeroSlide {
  id: string;
  type: "image" | "video";
  url: string;
  active: boolean;
}

interface HeroConfig {
  slides: HeroSlide[];
  pauseBetween: number;
  pauseAfterLoop: number;
  imageDuration: number;
}

export default function HeroSection() {
  const t = useTranslations("hero");
  const tS = useTranslations("heroStats");
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [config, setConfig] = useState<HeroConfig>({
    slides: [],
    pauseBetween: 1,
    pauseAfterLoop: 10,
    imageDuration: 8,
  });
  const [paused, setPaused] = useState(false);
  const [showLastFrame, setShowLastFrame] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load hero config
  useEffect(() => {
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then((data: HeroConfig) => {
        if (data?.slides) {
          const active = data.slides.filter((s) => s.active);
          setSlides(active);
          setConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  // Advance to next slide with pause logic
  const goToNext = useCallback(() => {
    if (slides.length <= 1) {
      // Single slide: if video, pause at end then restart after pauseAfterLoop
      if (slides[0]?.type === "video") {
        setShowLastFrame(true);
        timerRef.current = setTimeout(() => {
          setShowLastFrame(false);
          // Restart video
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          }
        }, config.pauseAfterLoop * 1000);
      }
      return;
    }

    const nextIdx = currentSlide + 1;
    const isLastSlide = nextIdx >= slides.length;

    if (isLastSlide) {
      // After last slide: long pause, then restart from 0
      setPaused(true);
      timerRef.current = setTimeout(() => {
        setPaused(false);
        setCurrentSlide(0);
      }, config.pauseAfterLoop * 1000);
    } else {
      // Between slides: short pause
      setPaused(true);
      timerRef.current = setTimeout(() => {
        setPaused(false);
        setCurrentSlide(nextIdx);
      }, config.pauseBetween * 1000);
    }
  }, [slides, currentSlide, config.pauseAfterLoop, config.pauseBetween]);

  // Handle video ended
  function handleVideoEnded() {
    goToNext();
  }

  // Handle image display — advance after imageDuration
  useEffect(() => {
    const slide = slides[currentSlide];
    if (!slide || slide.type !== "image" || paused) return;

    timerRef.current = setTimeout(() => {
      goToNext();
    }, config.imageDuration * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSlide, slides, paused, config.imageDuration, goToNext]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const activeSlide = slides[currentSlide];
  const hasMedia = slides.length > 0;

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      {/* Background media */}
      <AnimatePresence mode="wait">
        {hasMedia && activeSlide && !paused && (
          <motion.div
            key={activeSlide.id + "-" + currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0"
          >
            {activeSlide.type === "video" ? (
              <video
                ref={videoRef}
                key={activeSlide.url}
                src={activeSlide.url}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={activeSlide.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show last frame during pause (for single video) */}
      {showLastFrame && slides[0]?.type === "video" && (
        <div className="absolute inset-0 z-0">
          <video
            src={slides[0].url}
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 1 }}
          />
        </div>
      )}

      {/* Fallback gradient background (when no media) */}
      {!hasMedia && (
        <div className="absolute inset-0 bg-gradient-to-br from-swish-gray-900 via-swish-gray-800 to-swish-gray-900">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-swish-red/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-swish-red/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent z-[2]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
              <Sparkles size={12} />
              {tS("since")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white"
          >
            {t("title").split(" ").map((word, i) => (
              <span key={i}>
                {word.toLowerCase() === "mission" || word.toLowerCase() === "misja" || word.toLowerCase() === "misyonumuz" || word.toLowerCase() === "миссия" || word.toLowerCase() === "місія" ? (
                  <span className="text-swish-red">{word}</span>
                ) : (
                  word
                )}{" "}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/produkte"
              className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/30 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
            >
              {t("cta")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white border border-white/20 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
            >
              {t("ctaSecondary")}
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { value: "1956", label: tS("founded") },
            { value: "70+", label: tS("products") },
            { value: "15+", label: tS("locations") },
            { value: "300+", label: tS("employees") },
          ].map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <div className="text-2xl sm:text-3xl font-bold text-swish-red">{stat.value}</div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentSlide(i); setPaused(false); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
