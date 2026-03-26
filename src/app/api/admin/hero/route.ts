import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface HeroSlide {
  id: string;
  type: "image" | "video";
  url: string; // path to file in /public/hero/
  order: number;
  active: boolean;
}

export interface HeroConfig {
  slides: HeroSlide[];
  interval: number; // seconds between slides
}

const DEFAULT_CONFIG: HeroConfig = {
  slides: [],
  interval: 8,
};

async function getConfig(): Promise<HeroConfig> {
  return ((await storeGet("hero-config")) as HeroConfig) || DEFAULT_CONFIG;
}

// GET: get hero config (public for frontend)
export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}

// PUT: update hero config (admin)
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const config = await getConfig();

  if (body.slides !== undefined) config.slides = body.slides;
  if (body.interval !== undefined) config.interval = body.interval;

  await storeSet("hero-config", config);
  return NextResponse.json(config);
}

// POST: add a new slide
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url, type } = await request.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const config = await getConfig();
  const slide: HeroSlide = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type: type || (url.match(/\.(mp4|webm|mov)$/i) ? "video" : "image"),
    url,
    order: config.slides.length,
    active: true,
  };
  config.slides.push(slide);
  await storeSet("hero-config", config);
  return NextResponse.json(slide, { status: 201 });
}

// DELETE: remove a slide
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const config = await getConfig();
  config.slides = config.slides.filter((s) => s.id !== id);
  await storeSet("hero-config", config);
  return NextResponse.json({ success: true });
}
