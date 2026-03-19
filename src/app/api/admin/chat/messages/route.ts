import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";
import { notifyChatMessage } from "@/lib/email";

const MAX_MESSAGES = 200;

// Simple hash to generate consistent color from user ID
function userColor(id: string): string {
  const colors = ["#dc2626","#2563eb","#16a34a","#9333ea","#ea580c","#0891b2","#be185d","#4f46e5"];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  file?: string;
  fileName?: string;
  fileType?: string;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const after = searchParams.get("after");
  if (!channel) return NextResponse.json({ error: "Channel required" }, { status: 400 });

  const messages = ((await storeGet(`chat-messages-${channel}`)) as ChatMessage[] | null) || [];

  if (after) {
    return NextResponse.json(messages.filter((m) => m.timestamp > parseInt(after)));
  }
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channel, text, file, fileName, fileType } = await request.json();
  if (!channel) return NextResponse.json({ error: "Channel required" }, { status: 400 });
  if (!text && !file) return NextResponse.json({ error: "Message or file required" }, { status: 400 });

  const message: ChatMessage = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    userId: user.id,
    userName: user.name,
    userColor: userColor(user.id),
    text: text || "",
    timestamp: Date.now(),
  };

  if (file) {
    message.file = file;
    message.fileName = fileName;
    message.fileType = fileType;
  }

  const messages = ((await storeGet(`chat-messages-${channel}`)) as ChatMessage[] | null) || [];
  messages.push(message);
  await storeSet(`chat-messages-${channel}`, messages.slice(-MAX_MESSAGES));

  // Send email notification (non-blocking)
  notifyChatMessage(user.name, channel, text || "(Datei)", user.id).catch(() => {});

  return NextResponse.json(message, { status: 201 });
}
