import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface Partner { order: number; [key: string]: unknown; }

export async function GET() {
  const partners = ((await storeGet("partners")) as Partner[]) || [];
  return NextResponse.json(partners.sort((a, b) => a.order - b.order));
}
