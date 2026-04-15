import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface PageEntry {
  slug: string;
  label: string;
  path: string;
  group: string;
  enabled: boolean;
  locked?: boolean; // cannot be toggled (e.g., home, impressum)
}

export interface PageVisibilityConfig {
  pages: PageEntry[];
}

const DEFAULT_PAGES: PageEntry[] = [
  // Hauptseiten
  { slug: "home", label: "Startseite", path: "/", group: "main", enabled: true, locked: true },
  { slug: "leistungen", label: "Leistungen", path: "/leistungen", group: "main", enabled: true },
  { slug: "uber-uns", label: "Über uns", path: "/uber-uns", group: "main", enabled: true },
  { slug: "kontakt", label: "Kontakt", path: "/kontakt", group: "main", enabled: true },
  { slug: "referenzen", label: "Referenzen", path: "/referenzen", group: "main", enabled: true },
  { slug: "karriere", label: "Karriere", path: "/karriere", group: "main", enabled: true },
  { slug: "partner", label: "Partner", path: "/partner", group: "main", enabled: false },
  { slug: "zertifikate", label: "Zertifikate", path: "/zertifikate", group: "main", enabled: true },

  // Rechtliches
  { slug: "impressum", label: "Impressum", path: "/impressum", group: "legal", enabled: true, locked: true },
  { slug: "datenschutz", label: "Datenschutz", path: "/datenschutz", group: "legal", enabled: true, locked: true },
  { slug: "agb", label: "AGB", path: "/agb", group: "legal", enabled: false },

  // Shop (disabled by default)
  { slug: "produkte", label: "Shop / Produkte", path: "/produkte", group: "shop", enabled: false },
  { slug: "produktberater", label: "Produktberater", path: "/produktberater", group: "shop", enabled: false },
  { slug: "konto", label: "Kundenkonto", path: "/konto", group: "shop", enabled: false },
  { slug: "hygieneplane", label: "Hygienepläne", path: "/hygieneplane", group: "shop", enabled: false },
  { slug: "downloads", label: "Downloads", path: "/downloads", group: "shop", enabled: false },
  { slug: "ai-berater", label: "AI-Berater", path: "/ai-berater", group: "shop", enabled: false },
];

const DEFAULT_CONFIG: PageVisibilityConfig = { pages: DEFAULT_PAGES };

async function getConfig(): Promise<PageVisibilityConfig> {
  const stored = (await storeGet("page-visibility")) as PageVisibilityConfig | null;
  if (!stored) return DEFAULT_CONFIG;
  // Merge with defaults to handle new pages added in code
  const slugs = new Set(stored.pages.map((p) => p.slug));
  const merged = [...stored.pages];
  for (const def of DEFAULT_PAGES) {
    if (!slugs.has(def.slug)) merged.push(def);
  }
  return { pages: merged };
}

// GET: return page visibility config
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getConfig();
  return NextResponse.json(config);
}

// PUT: update page visibility config
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (body.pages) {
    await storeSet("page-visibility", { pages: body.pages });
  }
  const config = await getConfig();
  return NextResponse.json(config);
}
