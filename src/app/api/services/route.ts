import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";
import type { Service } from "@/types/service";
import defaultServices from "@/data/services.json";

// Public endpoint — no auth needed
export async function GET() {
  const stored = (await storeGet("services")) as Service[] | null;
  const services = stored || (defaultServices as Service[]);
  return NextResponse.json(services);
}
