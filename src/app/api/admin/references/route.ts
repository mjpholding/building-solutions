import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";
import { slugify, ensureUniqueSlug } from "@/lib/slug";

export interface Reference {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  client: string;
  category: string;
  buildingType: string;
  address: string;
  area: string;
  scope: string;
  images: string[];
  year: number;
  featured: boolean;
}

async function getRefs(): Promise<Reference[]> {
  return ((await storeGet("references")) as Reference[]) || [];
}

function normalize(r: Partial<Reference>, existingSlugs: string[] = []): Reference {
  const title = r.title || "Neues Projekt";
  const baseSlug = r.slug && r.slug.trim() ? slugify(r.slug) : slugify(title);
  const slug = ensureUniqueSlug(baseSlug || "projekt", existingSlugs);
  return {
    id: r.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    slug,
    title,
    description: r.description || "",
    longDescription: r.longDescription || "",
    client: r.client || "",
    category: r.category || "",
    buildingType: r.buildingType || "",
    address: r.address || "",
    area: r.area || "",
    scope: r.scope || "",
    images: r.images || [],
    year: r.year || new Date().getFullYear(),
    featured: r.featured || false,
  };
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getRefs());
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Partial<Reference>[];

  const used: string[] = [];
  const normalized = body.map((r) => {
    const existingSlugs = used.filter((_, i) => body[i]?.id !== r.id);
    const n = normalize(r, existingSlugs);
    used.push(n.slug);
    return n;
  });

  await storeSet("references", normalized);
  return NextResponse.json(normalized);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Partial<Reference>;
  const refs = await getRefs();
  const ref = normalize(body, refs.map((r) => r.slug));
  refs.push(ref);
  await storeSet("references", refs);
  return NextResponse.json(ref, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const refs = await getRefs();
  await storeSet("references", refs.filter((r) => r.id !== id));
  return NextResponse.json({ success: true });
}
