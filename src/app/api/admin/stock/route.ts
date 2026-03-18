import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

// Stock data: { [slug]: { [size]: quantity } }
export type StockData = Record<string, Record<string, number>>;

const STORE_KEY = "inventory:stock";

async function getStock(): Promise<StockData> {
  const data = await storeGet(STORE_KEY);
  return (data as StockData) || {};
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stock = await getStock();
  return NextResponse.json(stock);
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, size, quantity } = await request.json();
    if (!slug || !size || quantity === undefined) {
      return NextResponse.json({ error: "slug, size, quantity required" }, { status: 400 });
    }

    const stock = await getStock();
    if (!stock[slug]) stock[slug] = {};
    stock[slug][size] = Math.max(0, Number(quantity));
    await storeSet(STORE_KEY, stock);

    return NextResponse.json({ success: true, stock: stock[slug] });
  } catch (err) {
    console.error("Stock update error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
