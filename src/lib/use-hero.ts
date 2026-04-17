"use client";

import { useEffect, useState } from "react";

export interface HeroSlideWithUrl {
  id: string;
  type: "image" | "video";
  url: string;
  active: boolean;
}

export interface HeroSettings {
  slides: HeroSlideWithUrl[];
  pauseBetween: number;
  pauseAfterLoop: number;
  imageDuration: number;
  bannerEnabled: boolean;
  bannerPositionY: number;
}

export function useHero(): HeroSettings {
  const [settings, setSettings] = useState<HeroSettings>({
    slides: [],
    pauseBetween: 1,
    pauseAfterLoop: 10,
    imageDuration: 8,
    bannerEnabled: true,
    bannerPositionY: 50,
  });

  useEffect(() => {
    // Check cache first
    const cached = sessionStorage.getItem("hero-settings");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.slides?.length > 0) {
          setSettings(parsed);
          return; // use cache, don't fetch again
        }
      } catch {}
    }

    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then(async (config) => {
        if (!config?.slides) return;

        const active = config.slides.filter((s: { active: boolean }) => s.active);

        // Load ALL media in parallel
        const slidesWithUrls: HeroSlideWithUrl[] = (await Promise.all(
          active.map(async (s: { id: string; type: string; mediaId?: string; url?: string }) => {
            let url = s.url || "";
            if (s.mediaId) {
              try {
                const res = await fetch(`/api/admin/hero/upload?id=${s.mediaId}`);
                const data = await res.json();
                if (data.url) url = data.url;
              } catch {}
            }
            return url ? { id: s.id, type: s.type as "image" | "video", url, active: true } : null;
          })
        )).filter(Boolean) as HeroSlideWithUrl[];

        const result: HeroSettings = {
          slides: slidesWithUrls,
          pauseBetween: config.pauseBetween || 1,
          pauseAfterLoop: config.pauseAfterLoop || 10,
          imageDuration: config.imageDuration || 8,
          bannerEnabled: config.bannerEnabled !== false,
          bannerPositionY: config.bannerPositionY ?? 50,
        };

        setSettings(result);
        // Cache for this session
        sessionStorage.setItem("hero-settings", JSON.stringify(result));
      })
      .catch(() => {});
  }, []);

  return settings;
}
