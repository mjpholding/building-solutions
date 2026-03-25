import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface HygienePlan {
  id: string;
  category: "sanitary" | "kitchen" | "dining";
  htmlContent: string;
  createdAt: number;
}

async function getPlans(): Promise<HygienePlan[]> {
  return ((await storeGet("hygiene-plans")) as HygienePlan[]) || [];
}

// GET: list all plans (public)
export async function GET() {
  const plans = await getPlans();
  return NextResponse.json(plans);
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

  const plans = await getPlans();
  // Replace existing plan for same category
  const filtered = plans.filter((p) => p.category !== category);
  filtered.push(plan);
  await storeSet("hygiene-plans", filtered);

  return NextResponse.json(plan, { status: 201 });
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

  const plans = await getPlans();
  await storeSet("hygiene-plans", plans.filter((p) => p.id !== id));

  return NextResponse.json({ success: true });
}
