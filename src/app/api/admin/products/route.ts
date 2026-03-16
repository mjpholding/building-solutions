import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await storeGet("products");
  return NextResponse.json(data || []);
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();
  await storeSet("products", data);
  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const product = await request.json();
  const products = ((await storeGet("products")) || []) as { id: number }[];
  const maxId = products.reduce((max, p) => Math.max(max, p.id), 0);
  product.id = maxId + 1;
  products.push(product);
  await storeSet("products", products);
  return NextResponse.json({ success: true, product });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await request.json();
  const products = ((await storeGet("products")) || []) as { slug: string }[];
  const filtered = products.filter((p) => p.slug !== slug);
  await storeSet("products", filtered);
  return NextResponse.json({ success: true });
}
