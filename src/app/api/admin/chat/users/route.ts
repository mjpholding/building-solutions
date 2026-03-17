import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import {
  getChatUser,
  getChatUsers,
  saveChatUsers,
  ChatUser,
} from "@/lib/chat-auth";

export async function GET() {
  const adminOk = await isAuthenticated();
  const chatUser = await getChatUser();

  if (!adminOk && !chatUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getChatUsers();
  // Return users without passwords
  const safe = users.map(({ password: _p, ...rest }) => rest);
  return NextResponse.json(safe);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, username, password, color, isAdmin } = await request.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Name, Benutzername und Passwort erforderlich" },
        { status: 400 }
      );
    }

    const users = await getChatUsers();

    if (users.some((u) => u.username === username)) {
      return NextResponse.json(
        { error: "Benutzername bereits vergeben" },
        { status: 409 }
      );
    }

    const newUser: ChatUser = {
      id: crypto.randomUUID(),
      name,
      username,
      password,
      color: color || "#ef4444",
      isAdmin: isAdmin || false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveChatUsers(users);

    const { password: _p, ...safe } = newUser;
    return NextResponse.json(safe, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "ID erforderlich" },
        { status: 400 }
      );
    }

    const users = await getChatUsers();
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    await saveChatUsers(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler" },
      { status: 500 }
    );
  }
}
