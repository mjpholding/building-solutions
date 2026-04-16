import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";
import type { Service } from "@/types/service";
import defaultServices from "@/data/services.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const stored = (await storeGet("services")) as Service[] | null;
  const services = stored || (defaultServices as Service[]);
  return NextResponse.json(services, {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
