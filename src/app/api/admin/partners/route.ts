import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface Partner {
  id: string; name: string; logo: string; website: string; description: string; order: number;
}

async function getPartners(): Promise<Partner[]> {
  return ((await storeGet("partners")) as Partner[]) || [];
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getPartners());
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await storeSet("partners", body);
  return NextResponse.json(body);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const partners = await getPartners();
  const partner: Partner = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: body.name || "", logo: body.logo || "", website: body.website || "",
    description: body.description || "", order: partners.length,
  };
  partners.push(partner);
  await storeSet("partners", partners);
  return NextResponse.json(partner, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const partners = await getPartners();
  await storeSet("partners", partners.filter((p) => p.id !== id));
  return NextResponse.json({ success: true });
}
