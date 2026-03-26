import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

// GET: public config (no secrets, just enabled status and plans)
export async function GET() {
  const config = (await storeGet("ai-advisor-config")) as {
    enabled: boolean;
    plans: { id: string; name: string; price: number; scansPerMonth: number; features: string[] }[];
    stripePublishableKey: string;
  } | null;

  if (!config) {
    return NextResponse.json({ enabled: false, plans: [], stripeKey: "" });
  }

  return NextResponse.json({
    enabled: config.enabled,
    plans: config.plans,
    stripeKey: config.stripePublishableKey || "",
  });
}
