import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface PricingItem {
  name: string;
  size: number | string;
  line: "economy" | "professional";
  catalogPricePLN: number; // cena katalogowa netto PLN per sztukę
  pricePerLiterPLN: number | null;
  purchaseDiscountPercent: number | null; // null = użyj globalnego, liczba = indywidualny
  purchasePricePLN: number; // = catalogPrice * (1 - discount/100)
  purchasePriceEUR: number; // = purchasePricePLN / referenceRate
  marginPercent: number | null; // null = użyj globalnego, liczba = indywidualna
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

// Manual name mapping: pricing name (lowercase) → product slug
// For products where names differ between Excel price list and catalog
const NAME_TO_SLUG: Record<string, string> = {
  "e50 strong cleaner": "e50-strong",
  "swish strip": "swish-strip",
  "poly lock": "poly-lock-ultra",
  "tried & true": "tried-n-true",
  "es89 - blockade concrete sealer": "es89-blockade-concrete-sealer",
  "es99 - impregnator sealer": "es99-impregnator-sealer",
  "sp-120": "sp-120-floor-active",
  "sp-150": "sp-150-gres-cleaner",
  "sp-350": "sp-350-acid-cleaner",
  "sp-300": "sp-300-washroom-cleaner",
  "sp-360": "sp-360-action-bowl-cleaner",
  "fresh air": "fresh-air-nectarine",
  "essence herbal therapy": "essence-herbal-therapy",
  "essence magic fruit": "essence-magic-fruit",
  "essence magic garden": "essence-magic-garden",
  "swish de-grease": "de-grease",
  "quato 78 plus": "quato-78-professional",
  "quato 78 plus - gotowy do użytku": "quato-78-professional-rtu",
  "food service disinfectant": "food-service-concentrate",
  "food service disinfectant - gotowy do użytku": "food-service-rtu",
  "food service 5000": "food-service-concentrate",
  "facto hd41": "facto-hd41-cleanmax",
  "clean & green dish detergent": "liquid-soap",
  "swish dish detergent": "liquid-soap",
};

// Migrate old data: convert numeric discount/margin to null (= use global)
// Old imports stored concrete numbers; new logic uses null for "use global"
function migrateItems(config: PricingConfig) {
  for (const item of config.items) {
    // If value is a number (old format), treat it as "use global" → set to null
    // Only keep as individual override if it was explicitly set differently
    if (typeof item.purchaseDiscountPercent === "number") {
      item.purchaseDiscountPercent = null;
    }
    if (typeof item.marginPercent === "number") {
      item.marginPercent = null;
    }
  }
}

function recalculateItems(config: PricingConfig, rate: number) {
  for (const item of config.items) {
    // null = use global, number = individual override
    const discount = item.purchaseDiscountPercent != null ? item.purchaseDiscountPercent : config.globalPurchaseDiscount;
    const margin = item.marginPercent != null ? item.marginPercent : config.globalMargin;

    item.purchasePricePLN = Math.round(item.catalogPricePLN * (1 - discount / 100) * 100) / 100;
    item.purchasePriceEUR = Math.round((item.purchasePricePLN / rate) * 100) / 100;

    if (item.sellPriceOverride != null) {
      item.sellPriceEUR = item.sellPriceOverride;
    } else {
      item.sellPriceEUR = Math.round(item.purchasePriceEUR * (1 + margin / 100) * 100) / 100;
    }
  }
}

async function publishToProducts(config: PricingConfig) {
  const staticProducts = (await import("@/data/products.json")).default as Record<string, unknown>[];
  const redisProducts = ((await storeGet("products")) as Record<string, unknown>[] | null) || [];

  // Start from static products, merge Redis customizations on top
  const staticMap = new Map<string, Record<string, unknown>>();
  for (const sp of staticProducts) {
    staticMap.set(sp.slug as string, { ...sp });
  }
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

  // Build name→slug lookup from products
  const nameToSlug = new Map<string, string>();
  for (const p of products) {
    nameToSlug.set((p.name as string).toLowerCase(), p.slug as string);
  }

  // Build slug → prices map from pricing items
  const slugPriceMap = new Map<string, Record<string, number>>();
  for (const item of config.items) {
    const nameLower = item.name.toLowerCase();
    // Try direct name match first, then manual mapping
    let slug = nameToSlug.get(nameLower) || NAME_TO_SLUG[nameLower];
    if (!slug) continue;

    const existing = slugPriceMap.get(slug) || {};
    // Format size with comma for German locale (3.78 → "3,78 L") to match products.json
    const sizeStr = String(item.size).replace(".", ",");
    const sizeKey = `${sizeStr} L`;
    existing[sizeKey] = item.sellPriceEUR;
    slugPriceMap.set(slug, existing);
  }

  let updated = 0;
  for (const product of products) {
    const slug = product.slug as string;
    const prices = slugPriceMap.get(slug);
    if (prices) {
      product.prices = prices;
      updated++;
    }
  }

  await storeSet("products", products);
  return updated;
}

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
    migrateItems(config); // fix old data with concrete numbers → null
    const rateData = await storeGet("exchange-rate") as { referenceRate: number } | null;
    const rate = rateData?.referenceRate || 4.3;
    recalculateItems(config, rate);
  }

  await storeSet(STORE_KEY, config);

  // Auto-publish: always sync to public catalog after recalculation
  if (body.recalculate || body.publishPrices) {
    const updated = await publishToProducts(config);
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
    // null = use global, number = individual override
    const customDiscount = existing?.purchaseDiscountPercent ?? null;
    const customMargin = existing?.marginPercent ?? null;
    const discount = customDiscount ?? config.globalPurchaseDiscount;
    const margin = customMargin ?? config.globalMargin;
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
      purchaseDiscountPercent: customDiscount,
      purchasePricePLN,
      purchasePriceEUR,
      marginPercent: customMargin,
      sellPriceEUR,
      sellPriceOverride,
    };
  });

  config.items = newItems;
  config.lastImport = new Date().toISOString();
  await storeSet(STORE_KEY, config);

  // Auto-publish after import
  const updated = await publishToProducts(config);

  return NextResponse.json({ ok: true, count: newItems.length, published: updated });
}
