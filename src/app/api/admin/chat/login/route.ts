import { NextRequest, NextResponse } from "next/server";
import {
  verifyChatPassword,
  createChatSession,
  clearChatSession,
} from "@/lib/chat-auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Benutzername und Passwort erforderlich" },
        { status: 400 }
      );
    }

    const user = await verifyChatPassword(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    await createChatSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        color: user.color,
        isAdmin: user.isAdmin,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearChatSession();
  return NextResponse.json({ success: true });
}
