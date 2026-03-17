import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

// Public API — returns products from Redis (admin-editable) with fallback to static file
export async function GET() {
  const data = await storeGet("products");
  return NextResponse.json(data || []);
}
