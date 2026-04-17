"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useHero } from "@/lib/use-hero";

export default function PageBanner({ title, subtitle }: { title: string; subtitle?: string }) {
  const hero = useHero();
  const { slides, bannerEnabled } = hero;
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToNext = useCallback(() => {
    if (slides.length <= 1) {
      if (slides[0]?.type === "video") {
        timerRef.current = setTimeout(() => {
          if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); }
        }, hero.pauseAfterLoop * 1000);
      }
      return;
    }
    const nextIdx = currentSlide + 1;
    if (nextIdx >= slides.length) {
      timerRef.current = setTimeout(() => setCurrentSlide(0), hero.pauseAfterLoop * 1000);
    } else {
      timerRef.current = setTimeout(() => setCurrentSlide(nextIdx), hero.pauseBetween * 1000);
    }
  }, [slides, currentSlide, hero.pauseAfterLoop, hero.pauseBetween]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && video.currentTime >= video.duration - 0.5) { video.pause(); goToNext(); }
  }

  useEffect(() => {
    const slide = slides[currentSlide];
    if (!slide || slide.type !== "image") return;
    timerRef.current = setTimeout(goToNext, hero.imageDuration * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentSlide, slides, hero.imageDuration, goToNext]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const activeSlide = slides[currentSlide];
  const hasMedia = bannerEnabled && slides.length > 0;

  const posY = hero.bannerPositionY ?? 50;

  return (
    <div className="relative overflow-hidden h-56 sm:h-60 lg:h-72 flex items-end pb-8">
      {hasMedia && activeSlide && (
        <div className="absolute inset-0 z-0">
          {activeSlide.type === "video" ? (
            <video ref={videoRef} key={activeSlide.url + currentSlide} src={activeSlide.url} autoPlay muted playsInline onTimeUpdate={handleTimeUpdate} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `center ${posY}%` }} />
          ) : (
            <img src={activeSlide.url} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `center ${posY}%` }} />
          )}
        </div>
      )}
      {!hasMedia && (
        <>
          <img
            src="/hero/dashboard-hero.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: `center ${posY}%` }}
          />
          {/* fallback mitternacht if image is missing */}
          <div className="absolute inset-0 bg-bs-mitternacht -z-10" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-bs-mitternacht/90 via-bs-mitternacht/70 to-bs-mitternacht/40 z-[1]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-base text-white/70 max-w-2xl">{subtitle}</p>}
        </motion.div>
      </div>
    </div>
  );
}
