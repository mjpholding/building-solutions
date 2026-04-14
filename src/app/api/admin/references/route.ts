import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface Reference {
  id: string;
  title: string;
  description: string;
  client: string;
  category: string;
  images: string[];
  year: number;
  featured: boolean;
}

async function getRefs(): Promise<Reference[]> {
  return ((await storeGet("references")) as Reference[]) || [];
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getRefs());
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await storeSet("references", body);
  return NextResponse.json(body);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const refs = await getRefs();
  const ref: Reference = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: body.title || "",
    description: body.description || "",
    client: body.client || "",
    category: body.category || "",
    images: body.images || [],
    year: body.year || new Date().getFullYear(),
    featured: body.featured || false,
  };
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
