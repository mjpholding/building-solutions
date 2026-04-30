import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

// Klucz w storze: jeden obiekt z konfiguracją (firma + lokalizacje + lista pracowników + ustawienia karty)
const KEY = "business-cards";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await storeGet(KEY);
  return NextResponse.json(data || {});
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();
  await storeSet(KEY, data);
  return NextResponse.json({ success: true });
}
