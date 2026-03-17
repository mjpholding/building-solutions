import { NextResponse } from "next/server";
import { getSessionUser, getAdminUsers } from "@/lib/admin-auth";

// Returns current admin user info + all admin users as chat members
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allUsers = await getAdminUsers();
  const members = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
  }));

  return NextResponse.json({
    user: { id: user.id, name: user.name, username: user.username, role: user.role },
    members,
  });
}
