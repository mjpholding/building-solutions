import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

const LOCALES = ["de", "en", "pl", "tr", "ru", "uk", "sk", "sq", "hr"];

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const locale = request.nextUrl.searchParams.get("locale") || "de";
  if (!LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const data = await storeGet(`texts:${locale}`);
  return NextResponse.json(data || {});
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { locale, data } = await request.json();
  if (!LOCALES.includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  await storeSet(`texts:${locale}`, data);
  return NextResponse.json({ success: true });
}
