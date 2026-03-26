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
}

export function useHero(): HeroSettings {
  const [settings, setSettings] = useState<HeroSettings>({
    slides: [],
    pauseBetween: 1,
    pauseAfterLoop: 10,
    imageDuration: 8,
    bannerEnabled: true,
  });

  useEffect(() => {
    fetch("/api/admin/hero")
      .then((r) => r.json())
      .then(async (config) => {
        if (!config?.slides) return;

        const active = config.slides.filter((s: { active: boolean }) => s.active);

        // Load media URLs for each slide
        const slidesWithUrls: HeroSlideWithUrl[] = await Promise.all(
          active.map(async (s: { id: string; type: string; mediaId?: string; url?: string }) => {
            let url = s.url || "";

            // If has mediaId, load from Redis
            if (s.mediaId) {
              try {
                const res = await fetch(`/api/admin/hero/upload?id=${s.mediaId}`);
                const data = await res.json();
                if (data.url) url = data.url;
              } catch {}
            }

            return {
              id: s.id,
              type: s.type as "image" | "video",
              url,
              active: true,
            };
          })
        );

        setSettings({
          slides: slidesWithUrls.filter((s) => s.url),
          pauseBetween: config.pauseBetween || 1,
          pauseAfterLoop: config.pauseAfterLoop || 10,
          imageDuration: config.imageDuration || 8,
          bannerEnabled: config.bannerEnabled !== false,
        });
      })
      .catch(() => {});
  }, []);

  return settings;
}
