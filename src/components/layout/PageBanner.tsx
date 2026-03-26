"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface HeroSlide {
  id: string;
  type: "image" | "video";
  url: string;
  active: boolean;
}

export default function PageBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [pauseBetween, setPauseBetween] = useState(1);
  const [pauseAfterLoop, setPauseAfterLoop] = useState(10);
  const [imageDuration, setImageDuration] = useState(8);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then((data) => {
        if (data?.slides) {
          const active = data.slides.filter((s: HeroSlide) => s.active);
          setSlides(active);
        }
        if (data?.bannerEnabled === false) setEnabled(false);
        if (data?.pauseBetween) setPauseBetween(data.pauseBetween);
        if (data?.pauseAfterLoop) setPauseAfterLoop(data.pauseAfterLoop);
        if (data?.imageDuration) setImageDuration(data.imageDuration);
      })
      .catch(() => {});
  }, []);

  const goToNext = useCallback(() => {
    if (slides.length <= 1) {
      if (slides[0]?.type === "video") {
        timerRef.current = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          }
        }, pauseAfterLoop * 1000);
      }
      return;
    }
    const nextIdx = currentSlide + 1;
    if (nextIdx >= slides.length) {
      timerRef.current = setTimeout(() => setCurrentSlide(0), pauseAfterLoop * 1000);
    } else {
      timerRef.current = setTimeout(() => setCurrentSlide(nextIdx), pauseBetween * 1000);
    }
  }, [slides, currentSlide, pauseAfterLoop, pauseBetween]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && video.currentTime >= video.duration - 0.5) {
      video.pause();
      goToNext();
    }
  }

  useEffect(() => {
    const slide = slides[currentSlide];
    if (!slide || slide.type !== "image") return;
    timerRef.current = setTimeout(goToNext, imageDuration * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentSlide, slides, imageDuration, goToNext]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const activeSlide = slides[currentSlide];
  const hasMedia = enabled && slides.length > 0;

  return (
    <div className="relative overflow-hidden h-44 lg:h-52 flex items-end pb-8">
      {/* Background media */}
      {hasMedia && activeSlide && (
        <div className="absolute inset-0 z-0">
          {activeSlide.type === "video" ? (
            <video
              ref={videoRef}
              key={activeSlide.url + currentSlide}
              src={activeSlide.url}
              autoPlay
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src={activeSlide.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Fallback or no-media gradient */}
      {!hasMedia && (
        <div className="absolute inset-0 bg-gradient-to-br from-swish-gray-900 via-swish-gray-800 to-swish-gray-900" />
      )}

      {/* STRONG dark overlay — ensures text is always readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/60 z-[1]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-base text-white/70 max-w-2xl">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
