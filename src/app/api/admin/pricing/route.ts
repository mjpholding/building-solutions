import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface PricingItem {
  name: string;
  size: number | string;
  line: "economy" | "professional";
  catalogPricePLN: number; // cena katalogowa netto PLN per sztukę
  pricePerLiterPLN: number | null;
  purchaseDiscountPercent: number; // rabat zakupowy (globalny lub indywidualny)
  purchasePricePLN: number; // = catalogPrice * (1 - discount/100)
  purchasePriceEUR: number; // = purchasePricePLN / referenceRate
  marginPercent: number; // marża sprzedażowa %
  sellPriceEUR: number; // = purchasePriceEUR * (1 + margin/100)
  sellPriceOverride: number | null; // ręczna nadpisana cena
}

export interface PricingConfig {
  items: PricingItem[];
  globalPurchaseDiscount: number; // domyślny rabat zakupowy %
  globalMargin: number; // domyślna marża %
  lastImport: string; // data ostatniego importu
}

const STORE_KEY = "pricing-config";

const DEFAULT_CONFIG: PricingConfig = {
  items: [],
  globalPurchaseDiscount: 0,
  globalMargin: 30,
  lastImport: "",
};

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = ((await storeGet(STORE_KEY)) as PricingConfig | null) || DEFAULT_CONFIG;
  return NextResponse.json(config);
}

// PUT - update config (global discount, margin, individual item overrides)
export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const config = ((await storeGet(STORE_KEY)) as PricingConfig | null) || DEFAULT_CONFIG;

  if (body.globalPurchaseDiscount !== undefined) config.globalPurchaseDiscount = body.globalPurchaseDiscount;
  if (body.globalMargin !== undefined) config.globalMargin = body.globalMargin;

  // Update individual item
  if (body.updateItem) {
    const { index, field, value } = body.updateItem;
    if (config.items[index]) {
      (config.items[index] as unknown as Record<string, unknown>)[field] = value;
    }
  }

  // Recalculate all prices
  if (body.recalculate) {
    const rateData = await storeGet("exchange-rate") as { referenceRate: number } | null;
    const rate = rateData?.referenceRate || 4.3;

    for (const item of config.items) {
      const discount = item.purchaseDiscountPercent ?? config.globalPurchaseDiscount;
      const margin = item.marginPercent ?? config.globalMargin;

      item.purchasePricePLN = Math.round(item.catalogPricePLN * (1 - discount / 100) * 100) / 100;
      item.purchasePriceEUR = Math.round((item.purchasePricePLN / rate) * 100) / 100;

      if (item.sellPriceOverride != null) {
        item.sellPriceEUR = item.sellPriceOverride;
      } else {
        item.sellPriceEUR = Math.round(item.purchasePriceEUR * (1 + margin / 100) * 100) / 100;
      }
    }
  }

  await storeSet(STORE_KEY, config);

  // Publish sell prices to public product catalog
  if (body.publishPrices) {
    const staticProducts = (await import("@/data/products.json")).default as Record<string, unknown>[];
    const redisProducts = ((await storeGet("products")) as Record<string, unknown>[] | null) || [];

    // Start from static products, merge Redis customizations on top
    const staticMap = new Map<string, Record<string, unknown>>();
    for (const sp of staticProducts) {
      staticMap.set(sp.slug as string, { ...sp });
    }
    // Apply Redis overrides (admin edits) but keep static prices as fallback
    for (const rp of redisProducts) {
      const slug = rp.slug as string;
      const base = staticMap.get(slug);
      if (base) {
        staticMap.set(slug, { ...base, ...rp, prices: rp.prices || base.prices });
      } else {
        staticMap.set(slug, rp);
      }
    }
    const products = Array.from(staticMap.values());

    // Build price map: lowercase name → { "1 L": price, "5 L": price, ... }
    const priceMap = new Map<string, Record<string, number>>();
    for (const item of config.items) {
      const key = item.name.toLowerCase();
      const existing = priceMap.get(key) || {};
      const sizeKey = `${item.size} L`;
      existing[sizeKey] = item.sellPriceEUR;
      priceMap.set(key, existing);
    }

    let updated = 0;
    for (const product of products) {
      const name = (product.name as string || "").toLowerCase();
      const prices = priceMap.get(name);
      if (prices) {
        product.prices = prices;
        updated++;
      }
    }

    await storeSet("products", products);
    return NextResponse.json({ ok: true, published: updated });
  }

  return NextResponse.json({ ok: true });
}

// POST - import products from parsed Excel data
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { products } = await request.json();
  if (!Array.isArray(products)) {
    return NextResponse.json({ error: "products array required" }, { status: 400 });
  }

  const config = ((await storeGet(STORE_KEY)) as PricingConfig | null) || DEFAULT_CONFIG;
  const rateData = await storeGet("exchange-rate") as { referenceRate: number } | null;
  const rate = rateData?.referenceRate || 4.3;

  // Merge: keep existing overrides if product already exists
  const existingMap = new Map<string, PricingItem>();
  for (const item of config.items) {
    existingMap.set(`${item.name}|${item.size}`, item);
  }

  const newItems: PricingItem[] = products.map((p: Record<string, unknown>) => {
    const key = `${p.name}|${p.size}`;
    const existing = existingMap.get(key);
    const discount = existing?.purchaseDiscountPercent ?? config.globalPurchaseDiscount;
    const margin = existing?.marginPercent ?? config.globalMargin;
    const catalogPrice = p.pricePerUnitPLN as number;
    const purchasePricePLN = Math.round(catalogPrice * (1 - discount / 100) * 100) / 100;
    const purchasePriceEUR = Math.round((purchasePricePLN / rate) * 100) / 100;
    const sellPriceOverride = existing?.sellPriceOverride ?? null;
    const sellPriceEUR = sellPriceOverride != null
      ? sellPriceOverride
      : Math.round(purchasePriceEUR * (1 + margin / 100) * 100) / 100;

    return {
      name: p.name as string,
      size: p.size as number | string,
      line: p.line as "economy" | "professional",
      catalogPricePLN: catalogPrice,
      pricePerLiterPLN: (p.pricePerLiterPLN as number) || null,
      purchaseDiscountPercent: discount,
      purchasePricePLN,
      purchasePriceEUR,
      marginPercent: margin,
      sellPriceEUR,
      sellPriceOverride,
    };
  });

  config.items = newItems;
  config.lastImport = new Date().toISOString();
  await storeSet(STORE_KEY, config);

  return NextResponse.json({ ok: true, count: newItems.length });
}
