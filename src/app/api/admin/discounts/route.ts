import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface Discount {
  id: string;
  name: string;
  type: "percentage" | "fixed" | "free_shipping";
  code: string;
  value: number;
  minOrderValue: number;
  validUntil: string;
  customerIds: string[];
  usageLimit: number;
  usageCount: number;
  active: boolean;
}

async function getDiscounts(): Promise<Discount[]> {
  return ((await storeGet("discounts")) || []) as Discount[];
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getDiscounts());
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const discounts = await getDiscounts();

  const discount: Discount = {
    id: `DSC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    name: body.name || "",
    type: body.type || "percentage",
    code: body.code?.toUpperCase() || "",
    value: body.value || 0,
    minOrderValue: body.minOrderValue || 0,
    validUntil: body.validUntil || "",
    customerIds: body.customerIds || [],
    usageLimit: body.usageLimit || 0,
    usageCount: 0,
    active: true,
  };

  discounts.push(discount);
  await storeSet("discounts", discounts);
  return NextResponse.json({ success: true, discount });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const discounts = await getDiscounts();
  const idx = discounts.findIndex((d) => d.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  discounts[idx] = { ...discounts[idx], ...body };
  await storeSet("discounts", discounts);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  const discounts = await getDiscounts();
  await storeSet("discounts", discounts.filter((d) => d.id !== id));
  return NextResponse.json({ success: true });
}
