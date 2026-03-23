"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, trackPageView } from "@/lib/analytics";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
