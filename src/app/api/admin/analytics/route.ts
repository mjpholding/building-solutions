import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet } from "@/lib/admin-store";

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

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const allDates = ((await storeGet("analytics-dates")) as string[]) || [];
  const relevantDates = allDates.slice(-days);

  const dailyData: Record<string, DailyStats> = {};
  let totalPageViews = 0;
  let totalCartAdds = 0;
  let totalAdvisorStarts = 0;
  let totalAdvisorCompletes = 0;
  let totalAdvisorToCart = 0;
  const allPaths: Record<string, number> = {};
  const allCartProducts: Record<string, number> = {};
  const allAdvisorCategories: Record<string, number> = {};

  for (const date of relevantDates) {
    const stats = (await storeGet(`analytics-${date}`)) as DailyStats | null;
    if (!stats) continue;

    dailyData[date] = stats;
    totalPageViews += stats.pageViews;
    totalCartAdds += stats.cartAdds;
    totalAdvisorStarts += stats.advisorStarts;
    totalAdvisorCompletes += stats.advisorCompletes;
    totalAdvisorToCart += stats.advisorToCart;

    for (const [path, count] of Object.entries(stats.uniquePaths)) {
      allPaths[path] = (allPaths[path] || 0) + count;
    }
    for (const [product, count] of Object.entries(stats.cartProducts)) {
      allCartProducts[product] = (allCartProducts[product] || 0) + count;
    }
    for (const [cat, count] of Object.entries(stats.advisorCategories)) {
      allAdvisorCategories[cat] = (allAdvisorCategories[cat] || 0) + count;
    }
  }

  // Sort top pages and products
  const topPages = Object.entries(allPaths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const topCartProducts = Object.entries(allCartProducts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const topAdvisorCategories = Object.entries(allAdvisorCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const advisorConversion = totalAdvisorStarts > 0
    ? Math.round((totalAdvisorToCart / totalAdvisorStarts) * 100)
    : 0;

  return NextResponse.json({
    period: { days, from: relevantDates[0] || null, to: relevantDates[relevantDates.length - 1] || null },
    totals: {
      pageViews: totalPageViews,
      cartAdds: totalCartAdds,
      advisorStarts: totalAdvisorStarts,
      advisorCompletes: totalAdvisorCompletes,
      advisorToCart: totalAdvisorToCart,
      advisorConversion,
    },
    topPages,
    topCartProducts,
    topAdvisorCategories,
    dailyData,
  });
}
