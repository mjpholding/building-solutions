import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface ExchangeRateData {
  currentRate: number; // live EUR/PLN from NBP
  referenceRate: number; // rate when prices were last set
  threshold: number; // % increase that triggers price update (default 10)
  lastFetched: string; // ISO date
  lastPriceUpdate: string; // ISO date when sell prices were last recalculated
  autoUpdate: boolean;
}

const STORE_KEY = "exchange-rate";

const DEFAULT: ExchangeRateData = {
  currentRate: 4.3,
  referenceRate: 4.3,
  threshold: 10,
  lastFetched: "",
  lastPriceUpdate: "",
  autoUpdate: true,
};

async function fetchNBPRate(): Promise<number | null> {
  try {
    // NBP API - Table A - EUR rate
    const res = await fetch("https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json", {
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates?.[0]?.mid || null;
  } catch {
    return null;
  }
}

// GET - returns current exchange rate data + fetches live rate from NBP
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stored = ((await storeGet(STORE_KEY)) as ExchangeRateData | null) || { ...DEFAULT };

  // Fetch live rate from NBP
  const liveRate = await fetchNBPRate();
  if (liveRate) {
    stored.currentRate = Math.round(liveRate * 10000) / 10000;
    stored.lastFetched = new Date().toISOString();

    // If no reference rate set yet, use current as reference
    if (!stored.referenceRate) {
      stored.referenceRate = stored.currentRate;
      stored.lastPriceUpdate = new Date().toISOString();
    }

    await storeSet(STORE_KEY, stored);
  }

  // Calculate if threshold exceeded (only upward)
  const increasePercent = stored.referenceRate
    ? ((stored.currentRate - stored.referenceRate) / stored.referenceRate) * 100
    : 0;
  const thresholdExceeded = increasePercent >= (stored.threshold || 10);

  return NextResponse.json({
    ...stored,
    increasePercent: Math.round(increasePercent * 100) / 100,
    thresholdExceeded,
  });
}

// PUT - update settings (threshold, reference rate, manual override)
export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const stored = ((await storeGet(STORE_KEY)) as ExchangeRateData | null) || { ...DEFAULT };

  if (body.threshold !== undefined) stored.threshold = body.threshold;
  if (body.autoUpdate !== undefined) stored.autoUpdate = body.autoUpdate;

  // "Accept new rate" — sets current rate as new reference and triggers price recalc
  if (body.acceptNewRate) {
    stored.referenceRate = stored.currentRate;
    stored.lastPriceUpdate = new Date().toISOString();
  }

  // Manual reference rate override
  if (body.referenceRate !== undefined) {
    stored.referenceRate = body.referenceRate;
    stored.lastPriceUpdate = new Date().toISOString();
  }

  await storeSet(STORE_KEY, stored);
  return NextResponse.json({ ok: true });
}
