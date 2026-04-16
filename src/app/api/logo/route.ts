import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const config = (await storeGet("site-logo")) as { logo?: string; logoWhite?: string } | null;
  return NextResponse.json(
    {
      logo: config?.logo || "",
      logoWhite: config?.logoWhite || "",
    },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
