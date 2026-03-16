import { NextRequest, NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface Discount {
  id: string;
  type: "percentage" | "fixed" | "free_shipping";
  code: string;
  value: number;
  minOrderValue: number;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.toUpperCase();
  const total = parseFloat(request.nextUrl.searchParams.get("total") || "0");

  if (!code) {
    return NextResponse.json({ valid: false, error: "Kein Code angegeben" });
  }

  const discounts = ((await storeGet("discounts")) || []) as Discount[];
  const discount = discounts.find((d) => d.code === code && d.active);

  if (!discount) {
    return NextResponse.json({ valid: false, error: "Ungueltiger Gutscheincode" });
  }

  if (discount.validUntil && new Date(discount.validUntil) < new Date()) {
    return NextResponse.json({ valid: false, error: "Gutschein ist abgelaufen" });
  }

  if (discount.usageLimit > 0 && discount.usageCount >= discount.usageLimit) {
    return NextResponse.json({ valid: false, error: "Gutschein wurde bereits aufgebraucht" });
  }

  if (discount.minOrderValue > 0 && total < discount.minOrderValue) {
    return NextResponse.json({
      valid: false,
      error: `Mindestbestellwert: ${discount.minOrderValue.toFixed(2)} EUR`,
    });
  }

  return NextResponse.json({
    valid: true,
    discount: discount.type === "percentage" ? discount.value : 0,
    fixedDiscount: discount.type === "fixed" ? discount.value : 0,
    type: discount.type,
  });
}
