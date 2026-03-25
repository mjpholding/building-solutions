import { NextRequest, NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface ProductSheet {
  id: string;
  productName: string;
  type: "product" | "sds";
  assignedSlug: string | null;
}

// GET: public endpoint — list sheets for a product slug (no HTML content, just metadata)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const sheets = ((await storeGet("product-sheets")) as ProductSheet[]) || [];

  if (slug) {
    const assigned = sheets
      .filter((s) => s.assignedSlug === slug)
      .map((s) => ({ id: s.id, productName: s.productName, type: s.type }));
    return NextResponse.json(assigned);
  }

  // No slug = return all sheets (for downloads page)
  return NextResponse.json(
    sheets.map((s) => ({ id: s.id, productName: s.productName, type: s.type }))
  );
}
