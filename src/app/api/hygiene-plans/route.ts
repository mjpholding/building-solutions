import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

// GET: public endpoint — list hygiene plan index
export async function GET() {
  const index = ((await storeGet("hygiene-plans-index")) as { id: string; category: string; createdAt: number }[]) || [];
  return NextResponse.json(index);
}
