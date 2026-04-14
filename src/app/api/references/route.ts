import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

export async function GET() {
  const refs = (await storeGet("references")) as unknown[] || [];
  return NextResponse.json(refs);
}
