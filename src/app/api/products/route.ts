import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";
import staticProducts from "@/data/products.json";

interface ProductData {
  slug: string;
  image?: string;
  prices?: Record<string, number>;
  [key: string]: unknown;
}

// Build a lookup of static data by slug
const staticMap = new Map<string, ProductData>();
for (const p of staticProducts as unknown as ProductData[]) {
  staticMap.set(p.slug, p);
}

// Public API — returns products from Redis, restoring missing fields from static data
export async function GET() {
  const data = (await storeGet("products")) as ProductData[] | null;
  if (!data?.length) return NextResponse.json(staticProducts);

  // Merge: restore missing image and prices from static file
  const merged = data.map((p) => {
    const staticP = staticMap.get(p.slug);
    if (!staticP) return p;

    const result = { ...p };
    if (!result.image && staticP.image) {
      result.image = staticP.image;
    }
    if ((!result.prices || Object.keys(result.prices).length === 0) && staticP.prices) {
      result.prices = staticP.prices;
    }
    return result;
  });

  return NextResponse.json(merged);
}
