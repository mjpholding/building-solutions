"use client";

import { useState, useEffect } from "react";

interface PageInfo {
  slug: string;
  path: string;
  enabled: boolean;
}

let cachedPages: PageInfo[] | null = null;
let fetchPromise: Promise<PageInfo[]> | null = null;

function fetchPages(): Promise<PageInfo[]> {
  if (cachedPages) return Promise.resolve(cachedPages);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/pages")
    .then((r) => r.json())
    .then((data) => {
      cachedPages = data.pages || [];
      fetchPromise = null;
      return cachedPages!;
    })
    .catch(() => {
      fetchPromise = null;
      return [];
    });

  return fetchPromise;
}

export function usePageVisibility() {
  const [pages, setPages] = useState<PageInfo[]>(cachedPages || []);
  const [loading, setLoading] = useState(!cachedPages);

  useEffect(() => {
    fetchPages().then((p) => {
      setPages(p);
      setLoading(false);
    });
  }, []);

  const isPageEnabled = (slug: string): boolean => {
    if (pages.length === 0) return true; // default: show all while loading
    const page = pages.find((p) => p.slug === slug);
    return page ? page.enabled : false;
  };

  const isPathEnabled = (path: string): boolean => {
    if (pages.length === 0) return true;
    const page = pages.find((p) => p.path === path);
    return page ? page.enabled : true; // unknown paths are allowed
  };

  return { pages, loading, isPageEnabled, isPathEnabled };
}
