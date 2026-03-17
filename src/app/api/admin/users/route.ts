import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  isAuthenticated,
  getSessionUser,
  getAdminUsers,
  saveAdminUsers,
  type AdminUser,
} from "@/lib/admin-auth";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// GET: list all admin users (without passwords)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = await getAdminUsers();
  const safe = users.map(({ password: _, ...u }) => u);
  return NextResponse.json(safe);
}

// POST: create a new admin user (superadmin only)
export async function POST(request: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== "superadmin") {
    return NextResponse.json({ error: "Nur Superadmin" }, { status: 403 });
  }

  const { name, username, password, role } = await request.json();
  if (!name || !username || !password) {
    return NextResponse.json({ error: "Name, Benutzername und Passwort erforderlich" }, { status: 400 });
  }

  const users = await getAdminUsers();
  if (users.find((u) => u.username === username)) {
    return NextResponse.json({ error: "Benutzername existiert bereits" }, { status: 400 });
  }

  const newUser: AdminUser = {
    id: crypto.randomUUID(),
    name,
    username,
    password: hashPassword(password),
    role: role === "superadmin" ? "superadmin" : role === "editor" ? "editor" : "admin",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveAdminUsers(users);

  const { password: _, ...safe } = newUser;
  return NextResponse.json({ success: true, user: safe });
}

// PUT: update user (superadmin, or self for name/password)
export async function PUT(request: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, username, password, role } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "ID erforderlich" }, { status: 400 });
  }

  // Only superadmin can edit others
  if (id !== currentUser.id && currentUser.role !== "superadmin") {
    return NextResponse.json({ error: "Nur Superadmin" }, { status: 403 });
  }

  const users = await getAdminUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
  }

  // Check username uniqueness
  if (username && username !== users[idx].username && users.find((u) => u.username === username)) {
    return NextResponse.json({ error: "Benutzername existiert bereits" }, { status: 400 });
  }

  if (name) users[idx].name = name;
  if (username) users[idx].username = username;
  if (password) users[idx].password = hashPassword(password);
  if (role && currentUser.role === "superadmin") {
    users[idx].role = role;
  }

  await saveAdminUsers(users);
  return NextResponse.json({ success: true });
}

// DELETE: remove user (superadmin only, can't delete self)
export async function DELETE(request: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser || currentUser.role !== "superadmin") {
    return NextResponse.json({ error: "Nur Superadmin" }, { status: 403 });
  }

  const { id } = await request.json();
  if (id === currentUser.id) {
    return NextResponse.json({ error: "Eigenen Account kann man nicht loschen" }, { status: 400 });
  }

  const users = await getAdminUsers();
  const filtered = users.filter((u) => u.id !== id);
  await saveAdminUsers(filtered);
  return NextResponse.json({ success: true });
}
