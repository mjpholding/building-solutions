import { NextRequest, NextResponse } from "next/server";
import { storeGet, storeSet } from "@/lib/admin-store";

// Lightweight, cookie-free analytics (DSGVO compliant)
// Events: page_view, add_to_cart, remove_from_cart, advisor_start, advisor_result, advisor_to_cart

export interface AnalyticsEvent {
  type: string;
  path?: string;
  product?: string;
  size?: string;
  quantity?: number;
  advisorSession?: string;
  advisorCategory?: string;
  advisorResult?: string[];
  timestamp: number;
  date: string; // YYYY-MM-DD
}

interface DailyStats {
  pageViews: number;
  uniquePaths: Record<string, number>;
  cartAdds: number;
  cartProducts: Record<string, number>;
  advisorStarts: number;
  advisorCompletes: number;
  advisorToCart: number;
  advisorCategories: Record<string, number>;
}

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function emptyStats(): DailyStats {
  return {
    pageViews: 0,
    uniquePaths: {},
    cartAdds: 0,
    cartProducts: {},
    advisorStarts: 0,
    advisorCompletes: 0,
    advisorToCart: 0,
    advisorCategories: {},
  };
}

export async function POST(request: NextRequest) {
  try {
    const events: AnalyticsEvent[] = await request.json();
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const date = todayKey();
    const key = `analytics-${date}`;
    const stats: DailyStats = ((await storeGet(key)) as DailyStats) || emptyStats();

    for (const event of events) {
      switch (event.type) {
        case "page_view":
          stats.pageViews++;
          if (event.path) {
            stats.uniquePaths[event.path] = (stats.uniquePaths[event.path] || 0) + 1;
          }
          break;

        case "add_to_cart":
          stats.cartAdds++;
          if (event.product) {
            const cartKey = event.product + (event.size ? ` (${event.size})` : "");
            stats.cartProducts[cartKey] = (stats.cartProducts[cartKey] || 0) + (event.quantity || 1);
          }
          break;

        case "advisor_start":
          stats.advisorStarts++;
          break;

        case "advisor_result":
          stats.advisorCompletes++;
          if (event.advisorCategory) {
            stats.advisorCategories[event.advisorCategory] = (stats.advisorCategories[event.advisorCategory] || 0) + 1;
          }
          break;

        case "advisor_to_cart":
          stats.advisorToCart++;
          break;
      }
    }

    await storeSet(key, stats);

    // Also maintain a list of dates with data (for fetching history)
    const dates = ((await storeGet("analytics-dates")) as string[]) || [];
    if (!dates.includes(date)) {
      dates.push(date);
      // Keep last 90 days
      if (dates.length > 90) dates.shift();
      await storeSet("analytics-dates", dates);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Never fail tracking
  }
}
