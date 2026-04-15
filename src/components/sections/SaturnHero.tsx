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

// --- ROTATING EARTH COMPONENT (controlled, no auto-rotate) ---
function RotatingEarth({ size, angle, tilt }: { size: number; angle: number; tilt: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const textureLoaded = useRef(false);
  const renderSizeRef = useRef(0);
  const rRef = useRef(0);
  const angleRef = useRef(angle);
  const tiltRef = useRef(tilt);
  const drawRef = useRef<() => void>(() => {});

  // Setup canvas + texture load (once per size)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderSize = Math.round(size * 0.75);
    canvas.width = renderSize;
    canvas.height = renderSize;
    renderSizeRef.current = renderSize;
    rRef.current = renderSize / 2;

    const draw = () => {
      const r = rRef.current;
      const S = renderSizeRef.current;
      if (!S) return;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.clip();

      if (!textureLoaded.current || !textureRef.current) {
        ctx.fillStyle = "#0d3b6e";
        ctx.fillRect(0, 0, S, S);
      } else {
        const tex = textureRef.current;
        const tw = tex.width;
        const th = tex.height;

        const imgData = ctx.createImageData(S, S);
        const data = imgData.data;

        if (!(window as unknown as Record<string, unknown>).__earthTexData) {
          const oc = document.createElement("canvas");
          oc.width = tw;
          oc.height = th;
          const oCtx = oc.getContext("2d")!;
          oCtx.drawImage(tex, 0, 0);
          (window as unknown as Record<string, unknown>).__earthTexData = oCtx.getImageData(0, 0, tw, th).data;
        }
        const texData = (window as unknown as Record<string, unknown>).__earthTexData as Uint8ClampedArray;

        // Inverse rotation: world point V from screen point (nx, -ny, nz)
        // V = R_X(-pitch) · R_Y(-yaw) · (nx, -ny, nz)
        const yaw = (angleRef.current * Math.PI) / 180;
        const pitch = (tiltRef.current * Math.PI) / 180;
        const cy = Math.cos(yaw);
        const sy = Math.sin(yaw);
        const cp = Math.cos(pitch);
        const sp = Math.sin(pitch);

        for (let py = 0; py < S; py++) {
          for (let px = 0; px < S; px++) {
            const nx = (px - r) / r;
            const ny = (py - r) / r;
            const d2 = nx * nx + ny * ny;
            if (d2 > 1) continue;

            const nz = Math.sqrt(1 - d2);
            // R_Y(-yaw) on (nx, -ny, nz)
            const ux = nx * cy + nz * sy;
            const uy = -ny;
            const uz = -nx * sy + nz * cy;
            // R_X(-pitch) on (ux, uy, uz)
            const vx = ux;
            const vy = uy * cp + uz * sp;
            const vz = -uy * sp + uz * cp;

            const lat = Math.asin(Math.max(-1, Math.min(1, vy)));
            const lon = Math.atan2(vx, vz);

            let u = ((lon / Math.PI + 1) / 2) % 1;
            if (u < 0) u += 1;
            const v = -lat / Math.PI + 0.5;

            const tx = Math.floor(u * (tw - 1));
            const ty = Math.floor(v * (th - 1));
            const ti = (ty * tw + tx) * 4;

            const dot = nx * -0.4 + -ny * -0.5 + nz * 0.76;
            const light = Math.max(0.1, Math.min(1, dot * 0.65 + 0.5));

            const idx = (py * S + px) * 4;
            data[idx] = Math.min(255, (texData[ti] || 0) * light);
            data[idx + 1] = Math.min(255, (texData[ti + 1] || 0) * light);
            data[idx + 2] = Math.min(255, (texData[ti + 2] || 0) * light);
            data[idx + 3] = 255;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

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
    drawRef.current = draw;

    // Placeholder draw while texture loads
    draw();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/earth-texture-hq.jpg";
    img.onload = () => {
      textureRef.current = img;
      textureLoaded.current = true;
      draw();
    };
  }, [size]);

  // Redraw whenever angle or tilt changes
  useEffect(() => {
    angleRef.current = angle;
    tiltRef.current = tilt;
    drawRef.current();
  }, [angle, tilt]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="absolute -inset-6 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(70,150,255,0.18) 46%, rgba(40,100,220,0.08) 54%, transparent 68%)",
        }}
      />
      <canvas ref={canvasRef} className="rounded-full" style={{ width: size, height: size }} />
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
  // Earth is user-controlled: starts showing Europe (~Greenwich centered), drag to rotate
  const [earthAngle, setEarthAngle] = useState(0);
  const [earthTilt, setEarthTilt] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ringAngle, setRingAngle] = useState(0);
  const dragStateRef = useRef<{ active: boolean; lastX: number; lastY: number; moved: boolean }>({
    active: false,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

  // React-19 ref callback that attaches drag listeners when the earth
  // wrapper mounts and cleans them up when it unmounts.
  const attachEarthDrag = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-kerpen-pin]")) return;
      dragStateRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: false };
      el.style.cursor = "grabbing";
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      const s = dragStateRef.current;
      if (!s.active) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) s.moved = true;
      setEarthAngle((a) => a - dx * 0.4);
      // Pitch clamped to ±85° so the globe never flips upside-down
      setEarthTilt((p) => Math.max(-85, Math.min(85, p + dy * 0.4)));
    };
    const onUp = () => {
      if (!dragStateRef.current.active) return;
      dragStateRef.current.active = false;
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);
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
    <section className="relative w-full min-h-screen bg-bs-mitternacht overflow-hidden flex items-center">
      {/* Architectural background photo */}
      <div className="absolute inset-0">
        <img
          src="/hero/dashboard-hero.jpg"
          alt=""
          className="w-full h-full object-cover object-center"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        {/* fallback gradient behind the image */}
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "radial-gradient(ellipse at 70% 30%, #06373c 0%, #13232d 55%, #0a171d 100%)" }}
        />
      </div>

      {/* Brand overlays — match the site palette */}
      <div className="absolute inset-0 bg-gradient-to-r from-bs-mitternacht/92 via-bs-mitternacht/55 to-bs-mitternacht/20" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bs-mitternacht to-transparent" />
      <div className="absolute -right-20 top-1/3 w-[600px] h-[600px] rounded-full bg-bs-tuerkis/10 blur-[120px] pointer-events-none" />

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
        <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none">
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
              /* Earth — controlled, drag to rotate, with Kerpen pin */
              (() => {
                const KERPEN_LAT = 50.87;
                const KERPEN_LON = 6.68;
                const latRad = (KERPEN_LAT * Math.PI) / 180;
                const lonRad = (KERPEN_LON * Math.PI) / 180;
                // World-space unit vector for Kerpen
                const Vx = Math.cos(latRad) * Math.sin(lonRad);
                const Vy = Math.sin(latRad);
                const Vz = Math.cos(latRad) * Math.cos(lonRad);
                // Apply globe rotation: R_Y(yaw) · R_X(pitch) · V
                const yaw = (earthAngle * Math.PI) / 180;
                const pitch = (earthTilt * Math.PI) / 180;
                const cyP = Math.cos(yaw);
                const syP = Math.sin(yaw);
                const cpP = Math.cos(pitch);
                const spP = Math.sin(pitch);
                // R_X(pitch)
                const px1 = Vx;
                const py1 = Vy * cpP - Vz * spP;
                const pz1 = Vy * spP + Vz * cpP;
                // R_Y(yaw)
                const qx = px1 * cyP - pz1 * syP;
                const qy = py1;
                const qz = px1 * syP + pz1 * cyP;
                const pinVisible = qz > 0.12;
                const pinLeft = PLANET_SIZE / 2 + qx * (PLANET_SIZE / 2);
                const pinTop = PLANET_SIZE / 2 - qy * (PLANET_SIZE / 2);
                const pinScale = 0.85 + 0.25 * Math.max(0, qz);
                const pinDepth = qz;
                const mapsUrl =
                  "https://www.google.com/maps/dir/?api=1&destination=" +
                  encodeURIComponent("Ottostraße 14, 50170 Kerpen, Germany");

                return (
                  <div
                    ref={attachEarthDrag}
                    className="relative rounded-full select-none"
                    style={{
                      width: PLANET_SIZE,
                      height: PLANET_SIZE,
                      cursor: "grab",
                      touchAction: "none",
                    }}
                  >
                    {/* Translucent Earth so the hero photo shows through */}
                    <div
                      className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
                      style={{ opacity: 0.45, mixBlendMode: "screen" }}
                    >
                      <RotatingEarth size={PLANET_SIZE} angle={earthAngle} tilt={earthTilt} />
                    </div>
                    {/* Atmospheric türkis rim */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow:
                          "inset 0 0 40px rgba(49, 207, 179, 0.18), 0 0 60px 2px rgba(49, 207, 179, 0.15)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />

                    {/* Kerpen pin → Google Maps direction */}
                    {pinVisible && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-kerpen-pin
                        onClick={(e) => {
                          if (dragStateRef.current.moved) {
                            e.preventDefault();
                            dragStateRef.current.moved = false;
                          }
                        }}
                        className="absolute z-30 group"
                        style={{
                          left: pinLeft,
                          top: pinTop,
                          transform: `translate(-50%, -100%) scale(${pinScale})`,
                          opacity: 0.7 + 0.3 * pinDepth,
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.45))",
                        }}
                        title="Building Solutions · Ottostraße 14, 50170 Kerpen"
                        aria-label="Building Solutions — auf Google Maps öffnen"
                      >
                        <svg
                          width="48"
                          height="60"
                          viewBox="0 0 48 60"
                          className="transition-transform group-hover:scale-110"
                        >
                          {/* Tip / arrow pointing to the location */}
                          <path
                            d="M24 60 L16 44 L32 44 Z"
                            fill="#31cfb3"
                            stroke="#13232d"
                            strokeWidth="0.8"
                          />
                          {/* White disc with türkis border */}
                          <circle
                            cx="24"
                            cy="22"
                            r="20"
                            fill="#ffffff"
                            stroke="#31cfb3"
                            strokeWidth="2.2"
                          />
                          {/* BS logo image */}
                          <image
                            href="/logo-bs.png"
                            x="7"
                            y="5"
                            width="34"
                            height="34"
                            preserveAspectRatio="xMidYMid meet"
                          />
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 top-[-42px] opacity-0 group-hover:opacity-100 transition-opacity bg-bs-mitternacht text-white text-[11px] font-medium px-2.5 py-1.5 rounded whitespace-nowrap pointer-events-none">
                          Building Solutions · Kerpen
                        </div>
                      </a>
                    )}
                  </div>
                );
              })()
            )}
          </motion.div>
        </div>

        {/* Ring line — FRONT half (in front of planet) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[25]" viewBox={`${-(RING_R + 80)} ${-(RING_R + 80)} ${(RING_R + 80) * 2} ${(RING_R + 80) * 2}`}>
          <ellipse cx={0} cy={0} rx={RING_R} ry={ringVisualRY} fill="none" stroke="rgba(180,210,255,0.2)" strokeWidth={1.5} clipPath="url(#clipFront)" />
          <defs><clipPath id="clipFront"><rect x={-(RING_R + 80)} y={0} width={(RING_R + 80) * 2} height={RING_R + 80} /></clipPath></defs>
        </svg>

        {/* Items IN FRONT */}
        <div className="absolute inset-0 flex items-center justify-center z-[30] pointer-events-none">
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
