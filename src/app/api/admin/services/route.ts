import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";
import type { Service } from "@/types/service";
import defaultServices from "@/data/services.json";

async function getServices(): Promise<Service[]> {
  const stored = (await storeGet("services")) as Service[] | null;
  return stored || (defaultServices as Service[]);
}

// GET: list all services
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const services = await getServices();
  return NextResponse.json(services);
}

// PUT: update all services
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const services = await request.json();
  await storeSet("services", services);
  return NextResponse.json(services);
}

// POST: add a new service
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const services = await getServices();
  const newService: Service = {
    id: Date.now(),
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""),
    name: body.name || "",
    icon: body.icon || "Shield",
    category: body.category || "",
    shortDescription: body.shortDescription || "",
    description: body.description || "",
    features: body.features || [],
    image: body.image || "",
  };
  services.push(newService);
  await storeSet("services", services);
  return NextResponse.json(newService, { status: 201 });
}

// DELETE: remove a service
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const services = await getServices();
  const filtered = services.filter((s) => s.id !== id);
  await storeSet("services", filtered);
  return NextResponse.json({ success: true });
}
