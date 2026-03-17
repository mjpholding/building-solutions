import { NextRequest, NextResponse } from "next/server";
import {
  verifyUserLogin,
  setSessionCookie,
  clearSessionCookie,
  getSessionUser,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const user = await verifyUserLogin(username || "admin", password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Falsche Anmeldedaten" },
        { status: 401 }
      );
    }
    await setSessionCookie(user.id);
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: user.id, name: user.name, username: user.username, role: user.role },
  });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
