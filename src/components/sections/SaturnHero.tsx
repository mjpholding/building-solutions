"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun,
  ArrowRight, Phone
} from "lucide-react";
import { useHero } from "@/lib/use-hero";
import type { Service } from "@/types/service";
import contactData from "@/data/contact.json";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun,
};

// --- ROTATING EARTH COMPONENT ---
function RotatingEarth({ size, speed }: { size: number; speed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const textureLoaded = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render at 3/4 resolution for balance of quality and performance
    const renderSize = Math.round(size * 0.75);
    canvas.width = renderSize;
    canvas.height = renderSize;
    const r = renderSize / 2;

    // Load texture
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/earth-texture-hq.jpg";
    img.onload = () => {
      textureRef.current = img;
      textureLoaded.current = true;
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.clip();

      const S = renderSize;
      if (!textureLoaded.current || !textureRef.current) {
        ctx.fillStyle = "#0d3b6e";
        ctx.fillRect(0, 0, S, S);
      } else {
        const tex = textureRef.current;
        const tw = tex.width;
        const th = tex.height;

        const imgData = ctx.createImageData(S, S);
        const data = imgData.data;

        // Read texture once
        if (!(window as unknown as Record<string,unknown>).__earthTexData) {
          const oc = document.createElement("canvas");
          oc.width = tw; oc.height = th;
          const oCtx = oc.getContext("2d")!;
          oCtx.drawImage(tex, 0, 0);
          (window as unknown as Record<string,unknown>).__earthTexData = oCtx.getImageData(0, 0, tw, th).data;
        }
        const texData = (window as unknown as Record<string,unknown>).__earthTexData as Uint8ClampedArray;

        const rotRad = (angleRef.current * Math.PI) / 180;

        for (let py = 0; py < S; py++) {
          for (let px = 0; px < S; px++) {
            const nx = (px - r) / r;
            const ny = (py - r) / r;
            const d2 = nx * nx + ny * ny;
            if (d2 > 1) continue;

            const nz = Math.sqrt(1 - d2);
            const lat = Math.asin(-ny);
            const lon = Math.atan2(nx, nz) + rotRad;

            let u = ((lon / Math.PI + 1) / 2) % 1;
            if (u < 0) u += 1;
            const v = (-lat / Math.PI + 0.5);

            const tx = Math.floor(u * (tw - 1));
            const ty = Math.floor(v * (th - 1));
            const ti = (ty * tw + tx) * 4;

            // Diffuse lighting from top-left
            const dot = nx * -0.4 + (-ny) * -0.5 + nz * 0.76;
            const light = Math.max(0.1, Math.min(1, dot * 0.65 + 0.5));

            const idx = (py * S + px) * 4;
            data[idx]     = Math.min(255, (texData[ti] || 0) * light);
            data[idx + 1] = Math.min(255, (texData[ti + 1] || 0) * light);
            data[idx + 2] = Math.min(255, (texData[ti + 2] || 0) * light);
            data[idx + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Atmosphere rim
      const rimGrad = ctx.createRadialGradient(r, r, r * 0.88, r, r, r);
      rimGrad.addColorStop(0, "rgba(80,160,255,0)");
      rimGrad.addColorStop(0.6, "rgba(80,160,255,0.06)");
      rimGrad.addColorStop(1, "rgba(100,180,255,0.22)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const animate = (time: number) => {
      if (lastRef.current) {
        const delta = (time - lastRef.current) / 1000;
        angleRef.current = (angleRef.current + speed * 0.15 * delta) % 360;
      }
      lastRef.current = time;
      draw();
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, speed]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer atmosphere glow */}
      <div className="absolute -inset-6 rounded-full" style={{
        background: "radial-gradient(circle, rgba(70,150,255,0.18) 46%, rgba(40,100,220,0.08) 54%, transparent 68%)",
      }} />
      <canvas
        ref={canvasRef}
        className="rounded-full"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function SaturnHero() {
  const t = useTranslations("hero");
  const hero = useHero();
  const { slides } = hero;

  const [services, setServices] = useState<Service[]>([]);
  const [ringSpeed, setRingSpeed] = useState(8);
  const [earthSpeed, setEarthSpeed] = useState(20);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ringAngle, setRingAngle] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setServices).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then((d) => {
        if (d.ringSpeed !== undefined) setRingSpeed(d.ringSpeed);
        if (d.earthSpeed !== undefined) setEarthSpeed(d.earthSpeed);
      })
      .catch(() => {});
  }, []);

  // Ring rotation
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current) {
        const delta = (time - lastTimeRef.current) / 1000;
        setRingAngle((prev) => (prev + ringSpeed * delta) % 360);
      }
      lastTimeRef.current = time;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ringSpeed]);

  // Slide transitions
  const goToNext = useCallback(() => {
    if (slides.length <= 1) return;
    const nextIdx = (currentSlide + 1) % slides.length;
    const delay = nextIdx === 0 ? hero.pauseAfterLoop : hero.pauseBetween;
    timerRef.current = setTimeout(() => setCurrentSlide(nextIdx), delay * 1000);
  }, [slides, currentSlide, hero.pauseAfterLoop, hero.pauseBetween]);

  useEffect(() => {
    const slide = slides[currentSlide];
    if (!slide || slide.type !== "image") return;
    timerRef.current = setTimeout(goToNext, hero.imageDuration * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentSlide, slides, hero.imageDuration, goToNext]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    if (video.duration && video.currentTime >= video.duration - 0.5) { video.pause(); goToNext(); }
  }

  const activeSlide = slides[currentSlide];
  const itemCount = services.length || 7;

  // Ring config - circular ring, slightly tilted for depth
  const PLANET_SIZE = 420;
  const PLANET_R = PLANET_SIZE / 2;
  const RING_R = PLANET_R + 120; // ring wider than planet
  const TILT = 18;
  const TILT_RAD = (TILT * Math.PI) / 180;

  // Calculate ring items
  const ringItems = services.map((service, index) => {
    const baseAngle = (360 / itemCount) * index;
    const theta = ((baseAngle + ringAngle) * Math.PI) / 180;

    // 3D position on tilted ring
    const x = Math.cos(theta) * RING_R;
    const yFlat = Math.sin(theta) * RING_R;
    const y = yFlat * Math.sin(TILT_RAD); // projected Y
    const z = yFlat * Math.cos(TILT_RAD); // depth

    // z > 0 = in front, z < 0 = behind
    const isBehind = z < 0;
    const depthNorm = (z / RING_R + 1) / 2; // 0 (far back) to 1 (front)
    const scale = 0.5 + 0.5 * depthNorm;
    const opacity = 0.15 + 0.85 * depthNorm;

    // Hide if behind planet and inside planet radius
    const dist = Math.sqrt(x * x + y * y);
    const hidden = isBehind && dist < PLANET_R * 0.8;

    return { service, x, y, z, scale, opacity, isBehind, hidden, depthNorm };
  });

  const behind = ringItems.filter((i) => i.isBehind);
  const front = ringItems.filter((i) => !i.isBehind);

  const renderItem = (item: typeof ringItems[0]) => {
    if (item.hidden) return null;
    const Icon = iconMap[item.service.icon] || Shield;
    return (
      <div
        key={item.service.id}
        className="absolute pointer-events-auto"
        style={{
          left: `calc(50% + ${item.x}px)`,
          top: `calc(50% + ${item.y}px)`,
          transform: `translate(-50%, -50%) scale(${item.scale})`,
          opacity: item.opacity,
          zIndex: Math.round(item.depthNorm * 20),
        }}
      >
        <Link
          href={`/leistungen/${item.service.slug}`}
          className="group flex flex-col items-center gap-2 transition-transform duration-200 hover:scale-110"
        >
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/[0.07] backdrop-blur-md border border-white/[0.12] flex items-center justify-center group-hover:bg-bs-accent/25 group-hover:border-bs-accent/40 transition-all shadow-xl shadow-black/30">
            <Icon size={24} className="text-white/80 group-hover:text-white" />
          </div>
          <span className="text-[10px] lg:text-xs text-white/60 font-medium whitespace-nowrap max-w-[110px] text-center leading-tight group-hover:text-white transition-colors drop-shadow-lg">
            {item.service.name}
          </span>
        </Link>
      </div>
    );
  };

  // Ring visual track (SVG ellipse for the tilted ring)
  const ringVisualRY = RING_R * Math.sin(TILT_RAD); // how tall the ellipse looks

  return (
    <section className="relative w-full min-h-screen bg-[#0a0e1a] overflow-hidden flex items-center">
      {/* Space background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-900/[0.06] rounded-full blur-[200px]" />
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 25% 65%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 80%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 75% 35%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 55%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 95% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 90%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 5% 75%, rgba(255,255,255,0.5) 0%, transparent 100%)
          `,
        }} />
      </div>

      {/* Left content */}
      <div className="absolute left-6 lg:left-16 xl:left-24 top-1/2 -translate-y-1/2 z-40 max-w-md">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-5">{t("title")}</h1>
          <p className="text-white/40 text-sm lg:text-base leading-relaxed mb-8 max-w-sm">{t("subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/leistungen" className="inline-flex items-center justify-center gap-2 bg-bs-tuerkis hover:bg-bs-tuerkis/90 text-bs-mitternacht px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-bs-tuerkis/25">
              {t("cta")} <ArrowRight size={16} />
            </Link>
            <a href={`tel:${contactData.phone.replace(/[\s()]/g, "")}`} className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white/80 px-6 py-3 rounded-xl text-sm font-semibold transition-all">
              <Phone size={14} /> {t("ctaSecondary")}
            </a>
          </div>
        </motion.div>
      </div>

      {/* === SATURN SYSTEM === */}
      <div className="absolute z-10" style={{
        right: "8%", top: "50%", transform: "translateY(-50%)",
        width: `${RING_R * 2 + 160}px`, height: `${RING_R * 2 + 160}px`,
      }}>
        {/* Ring line — BACK half (behind planet) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox={`${-(RING_R + 80)} ${-(RING_R + 80)} ${(RING_R + 80) * 2} ${(RING_R + 80) * 2}`}>
          <ellipse cx={0} cy={0} rx={RING_R} ry={ringVisualRY} fill="none" stroke="rgba(180,210,255,0.08)" strokeWidth={1.5} strokeDasharray="0" clipPath="url(#clipBack)" />
          <defs><clipPath id="clipBack"><rect x={-(RING_R + 80)} y={-(RING_R + 80)} width={(RING_R + 80) * 2} height={RING_R + 80} /></clipPath></defs>
        </svg>

        {/* Items BEHIND */}
        <div className="absolute inset-0 flex items-center justify-center z-[5]">
          <div className="relative" style={{ width: 0, height: 0 }}>
            {behind.map(renderItem)}
          </div>
        </div>

        {/* PLANET (Earth or Hero media) */}
        <div className="absolute inset-0 flex items-center justify-center z-[15]">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2 }}>
            {slides.length > 0 ? (
              /* Hero media planet */
              <div className="relative rounded-full overflow-hidden" style={{ width: PLANET_SIZE, height: PLANET_SIZE }}>
                <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-blue-400/10 via-transparent to-blue-600/5 blur-md" />
                <div className="absolute inset-0 rounded-full overflow-hidden border border-white/[0.06]">
                  <AnimatePresence mode="wait">
                    {activeSlide && (
                      <motion.div key={activeSlide.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0">
                        {activeSlide.type === "video" ? (
                          <video ref={videoRef} src={activeSlide.url} autoPlay muted playsInline onTimeUpdate={handleTimeUpdate} className="w-full h-full object-cover" />
                        ) : (
                          <img src={activeSlide.url} alt="" className="w-full h-full object-cover" />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 rounded-full" style={{
                    background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.08) 0%, transparent 45%), radial-gradient(circle at 72% 72%, rgba(0,0,0,0.35) 0%, transparent 50%)",
                  }} />
                </div>
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" />
              </div>
            ) : (
              /* Earth fallback */
              <RotatingEarth size={PLANET_SIZE} speed={earthSpeed} />
            )}
          </motion.div>
        </div>

        {/* Ring line — FRONT half (in front of planet) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[25]" viewBox={`${-(RING_R + 80)} ${-(RING_R + 80)} ${(RING_R + 80) * 2} ${(RING_R + 80) * 2}`}>
          <ellipse cx={0} cy={0} rx={RING_R} ry={ringVisualRY} fill="none" stroke="rgba(180,210,255,0.2)" strokeWidth={1.5} clipPath="url(#clipFront)" />
          <defs><clipPath id="clipFront"><rect x={-(RING_R + 80)} y={0} width={(RING_R + 80) * 2} height={RING_R + 80} /></clipPath></defs>
        </svg>

        {/* Items IN FRONT */}
        <div className="absolute inset-0 flex items-center justify-center z-[30]">
          <div className="relative" style={{ width: 0, height: 0 }}>
            {front.map(renderItem)}
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-[15%] flex gap-2 z-40">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-white w-6" : "bg-white/25"}`} />
          ))}
        </div>
      )}
    </section>
  );
}
