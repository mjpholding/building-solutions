import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface ProductSheet {
  id: string;
  productName: string;
  type: "product" | "sds";
  htmlContent: string;
  logoBase64: string | null;
  productImageBase64: string | null;
  assignedSlug: string | null;
  createdAt: number;
}

async function getSheets(): Promise<ProductSheet[]> {
  return ((await storeGet("product-sheets")) as ProductSheet[]) || [];
}

// GET: list all sheets, optionally filter by slug
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const sheets = await getSheets();

  if (slug) {
    return NextResponse.json(sheets.filter((s) => s.assignedSlug === slug));
  }

  return NextResponse.json(sheets);
}

// POST: save a new sheet
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productName, type, htmlContent, assignedSlug, logoBase64, productImageBase64 } = await request.json();

  if (!productName || !htmlContent) {
    return NextResponse.json({ error: "productName and htmlContent required" }, { status: 400 });
  }

  const sheet: ProductSheet = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    productName,
    type: type || "product",
    htmlContent,
    logoBase64: logoBase64 || null,
    productImageBase64: productImageBase64 || null,
    assignedSlug: assignedSlug || null,
    createdAt: Date.now(),
  };

  const sheets = await getSheets();
  sheets.push(sheet);
  await storeSet("product-sheets", sheets);

  return NextResponse.json(sheet, { status: 201 });
}

// PUT: update assignment (assign sheet to product)
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, assignedSlug } = await request.json();

  const sheets = await getSheets();
  const sheet = sheets.find((s) => s.id === id);
  if (!sheet) {
    return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
  }

  sheet.assignedSlug = assignedSlug || null;
  await storeSet("product-sheets", sheets);

  return NextResponse.json(sheet);
}

// DELETE: remove a sheet
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const sheets = await getSheets();
  const filtered = sheets.filter((s) => s.id !== id);
  await storeSet("product-sheets", filtered);

  return NextResponse.json({ success: true });
}
