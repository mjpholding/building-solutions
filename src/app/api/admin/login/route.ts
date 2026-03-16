import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setSessionCookie, clearSessionCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!verifyPassword(password)) {
      return NextResponse.json({ success: false, error: "Falsches Passwort" }, { status: 401 });
    }
    await setSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
