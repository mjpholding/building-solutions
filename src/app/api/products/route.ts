import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";
import staticProducts from "@/data/products.json";

interface ProductData {
  slug: string;
  image?: string;
  [key: string]: unknown;
}

// Build a lookup of static images by slug
const staticImageMap = new Map<string, string>();
for (const p of staticProducts as ProductData[]) {
  if (p.image) staticImageMap.set(p.slug, p.image);
}

// Public API — returns products from Redis, restoring missing image paths from static data
export async function GET() {
  const data = (await storeGet("products")) as ProductData[] | null;
  if (!data?.length) return NextResponse.json(staticProducts);

  // Merge: if Redis product is missing image, restore from static file
  const merged = data.map((p) => {
    if (!p.image && staticImageMap.has(p.slug)) {
      return { ...p, image: staticImageMap.get(p.slug) };
    }
    return p;
  });

  return NextResponse.json(merged);
}
