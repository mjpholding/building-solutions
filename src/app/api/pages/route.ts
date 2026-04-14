import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface PageEntry {
  slug: string;
  path: string;
  enabled: boolean;
}

interface PageVisibilityConfig {
  pages: PageEntry[];
}

// Public endpoint — returns only slug, path, enabled status (no admin labels)
export async function GET() {
  const config = (await storeGet("page-visibility")) as PageVisibilityConfig | null;

  if (!config) {
    // Default: main pages enabled, shop disabled
    return NextResponse.json({
      pages: [
        { slug: "home", path: "/", enabled: true },
        { slug: "leistungen", path: "/leistungen", enabled: true },
        { slug: "uber-uns", path: "/uber-uns", enabled: true },
        { slug: "kontakt", path: "/kontakt", enabled: true },
        { slug: "referenzen", path: "/referenzen", enabled: true },
        { slug: "karriere", path: "/karriere", enabled: true },
        { slug: "partner", path: "/partner", enabled: true },
        { slug: "impressum", path: "/impressum", enabled: true },
        { slug: "datenschutz", path: "/datenschutz", enabled: true },
      ],
    });
  }

  const pages = config.pages
    .filter((p) => p.enabled)
    .map(({ slug, path, enabled }) => ({ slug, path, enabled }));

  return NextResponse.json({ pages });
}
