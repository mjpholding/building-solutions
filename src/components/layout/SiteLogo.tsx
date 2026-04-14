"use client";

import { useState, useEffect } from "react";

let logoCache: { logo: string; logoWhite: string } | null = null;
let logoPromise: Promise<typeof logoCache> | null = null;

function fetchLogo() {
  if (logoCache) return Promise.resolve(logoCache);
  if (logoPromise) return logoPromise;
  logoPromise = fetch("/api/logo")
    .then((r) => r.json())
    .then((d) => { logoCache = d; logoPromise = null; return d; })
    .catch(() => { logoPromise = null; return { logo: "", logoWhite: "" }; });
  return logoPromise;
}

interface SiteLogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function SiteLogo({ variant = "light", className = "h-10 w-auto" }: SiteLogoProps) {
  const [data, setData] = useState(logoCache);

  useEffect(() => {
    fetchLogo().then(setData);
  }, []);

  const src = variant === "dark" ? data?.logoWhite : data?.logo;

  if (src) {
    return <img src={src} alt="Building Solutions" className={`object-contain ${className}`} />;
  }

  // Fallback: static logo files
  if (variant === "dark") {
    return <img src="/logo-bs-wide.png" alt="Building Solutions" className={`object-contain ${className} brightness-0 invert`} />;
  }

  return <img src="/logo-bs-wide.png" alt="Building Solutions" className={`object-contain ${className}`} />;
}
