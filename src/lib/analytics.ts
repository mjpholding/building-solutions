"use client";

// Lightweight analytics tracker — no cookies, DSGVO compliant
// Batches events and sends them every 5 seconds or on page unload

interface TrackEvent {
  type: string;
  path?: string;
  product?: string;
  size?: string;
  quantity?: number;
  advisorSession?: string;
  advisorCategory?: string;
  advisorResult?: string[];
  timestamp: number;
  date: string;
}

let queue: TrackEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function flush() {
  if (queue.length === 0) return;
  const events = [...queue];
  queue = [];
  try {
    // Use sendBeacon for reliability (works on page unload)
    const blob = new Blob([JSON.stringify(events)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", blob);
    } else {
      fetch("/api/analytics/track", { method: "POST", body: blob, keepalive: true });
    }
  } catch {
    // Silently ignore
  }
}

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, 5000);
}

function push(event: Omit<TrackEvent, "timestamp" | "date">) {
  queue.push({ ...event, timestamp: Date.now(), date: today() });
  scheduleFlush();
}

// Set up page unload flushing (call once)
let initialized = false;
export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  window.addEventListener("beforeunload", flush);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

// Track a page view
export function trackPageView(path: string) {
  push({ type: "page_view", path });
}

// Track add to cart
export function trackAddToCart(product: string, size?: string, quantity?: number) {
  push({ type: "add_to_cart", product, size, quantity });
}

// Track product advisor start
export function trackAdvisorStart() {
  push({ type: "advisor_start" });
}

// Track product advisor result
export function trackAdvisorResult(category: string, results: string[]) {
  push({ type: "advisor_result", advisorCategory: category, advisorResult: results });
}

// Track advisor → cart conversion
export function trackAdvisorToCart() {
  push({ type: "advisor_to_cart" });
}
