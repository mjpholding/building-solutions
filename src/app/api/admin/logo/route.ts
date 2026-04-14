import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

interface LogoConfig {
  logo: string;       // base64 data URL
  logoWhite: string;  // white/inverted version for dark backgrounds
}

const DEFAULT: LogoConfig = { logo: "", logoWhite: "" };

async function getConfig(): Promise<LogoConfig> {
  return ((await storeGet("site-logo")) as LogoConfig) || DEFAULT;
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getConfig());
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const config = await getConfig();
  if (body.logo !== undefined) config.logo = body.logo;
  if (body.logoWhite !== undefined) config.logoWhite = body.logoWhite;
  await storeSet("site-logo", config);
  return NextResponse.json(config);
}
