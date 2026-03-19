import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, getSessionUser } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";
import type { NotificationSettings } from "@/lib/email";

async function getSettings(): Promise<NotificationSettings> {
  return ((await storeGet("notification-settings")) as NotificationSettings) || {};
}

// GET: get current user's notification settings
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getSettings();
  return NextResponse.json(settings[user.id] || { email: "", chatNotify: false, orderNotify: false });
}

// PUT: update notification settings
export async function PUT(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, chatNotify, orderNotify } = await request.json();
  const settings = await getSettings();

  settings[user.id] = {
    email: email || "",
    chatNotify: !!chatNotify,
    orderNotify: !!orderNotify,
  };

  await storeSet("notification-settings", settings);
  return NextResponse.json({ success: true });
}

// GET all settings (admin only, for overview)
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSettings());
}
