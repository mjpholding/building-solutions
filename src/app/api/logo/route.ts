import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

export async function GET() {
  const config = (await storeGet("site-logo")) as { logo?: string; logoWhite?: string } | null;
  return NextResponse.json({
    logo: config?.logo || "",
    logoWhite: config?.logoWhite || "",
  });
}
