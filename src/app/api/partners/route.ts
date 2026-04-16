import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface Partner { order: number; [key: string]: unknown; }

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const partners = ((await storeGet("partners")) as Partner[]) || [];
  return NextResponse.json(partners.sort((a, b) => a.order - b.order), {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
