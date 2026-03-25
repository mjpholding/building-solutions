import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface HygienePlan {
  id: string;
  category: "sanitary" | "kitchen" | "dining";
  htmlContent: string;
  createdAt: number;
}

// Store each plan separately to avoid Redis size limits
async function getPlanIndex(): Promise<{ id: string; category: string; createdAt: number }[]> {
  return ((await storeGet("hygiene-plans-index")) as { id: string; category: string; createdAt: number }[]) || [];
}

async function getPlan(id: string): Promise<HygienePlan | null> {
  return (await storeGet(`hygiene-plan-${id}`)) as HygienePlan | null;
}

// GET: list all plans (public) or get single plan by id/category
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  if (id) {
    const plan = await getPlan(id);
    return plan ? NextResponse.json(plan) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (category) {
    const index = await getPlanIndex();
    const entry = index.find((p) => p.category === category);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const plan = await getPlan(entry.id);
    return plan ? NextResponse.json(plan) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Return index (without htmlContent)
  const index = await getPlanIndex();
  return NextResponse.json(index);
}

// POST: save a new plan (admin only)
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { category, htmlContent } = await request.json();

  if (!category || !htmlContent) {
    return NextResponse.json({ error: "category and htmlContent required" }, { status: 400 });
  }

  const plan: HygienePlan = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    category,
    htmlContent,
    createdAt: Date.now(),
  };

  // Save plan content separately
  await storeSet(`hygiene-plan-${plan.id}`, plan);

  // Update index — replace existing for same category
  const index = await getPlanIndex();
  const oldEntry = index.find((p) => p.category === category);
  if (oldEntry) {
    // Delete old plan content
    await storeSet(`hygiene-plan-${oldEntry.id}`, null);
  }
  const filtered = index.filter((p) => p.category !== category);
  filtered.push({ id: plan.id, category: plan.category, createdAt: plan.createdAt });
  await storeSet("hygiene-plans-index", filtered);

  return NextResponse.json({ id: plan.id, category: plan.category, createdAt: plan.createdAt }, { status: 201 });
}

// DELETE: remove a plan
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await storeSet(`hygiene-plan-${id}`, null);
  const index = await getPlanIndex();
  await storeSet("hygiene-plans-index", index.filter((p) => p.id !== id));

  return NextResponse.json({ success: true });
}
