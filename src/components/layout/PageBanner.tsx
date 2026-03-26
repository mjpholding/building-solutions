"use client";

import { useEffect, useState, useRef } from "react";
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
  const [slide, setSlide] = useState<HeroSlide | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then((data) => {
        if (data?.slides) {
          const active = data.slides.filter((s: HeroSlide) => s.active);
          if (active.length > 0) {
            // Pick random slide for variety across pages
            setSlide(active[Math.floor(Math.random() * active.length)]);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative overflow-hidden h-48 lg:h-56 flex items-center">
      {/* Background media */}
      {slide && (
        <div className="absolute inset-0 z-0">
          {slide.type === "video" ? (
            <video
              ref={videoRef}
              src={slide.url}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src={slide.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Fallback gradient */}
      {!slide && (
        <div className="absolute inset-0 bg-gradient-to-br from-swish-gray-900 via-swish-gray-800 to-swish-gray-900" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent z-[2]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl lg:text-4xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-lg text-white/70">{subtitle}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
