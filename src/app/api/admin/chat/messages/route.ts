import { NextRequest, NextResponse } from "next/server";
import { getChatUser } from "@/lib/chat-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

const MAX_MESSAGES = 200;

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
  const user = await getChatUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel");
  const after = searchParams.get("after");

  if (!channel) {
    return NextResponse.json(
      { error: "Channel-Parameter erforderlich" },
      { status: 400 }
    );
  }

  const messages = ((await storeGet(`chat-messages-${channel}`)) as ChatMessage[] | null) || [];

  if (after) {
    const afterTs = parseInt(after);
    const newMessages = messages.filter((m) => m.timestamp > afterTs);
    return NextResponse.json(newMessages);
  }

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const user = await getChatUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { channel, text, file, fileName, fileType } = await request.json();

    if (!channel) {
      return NextResponse.json(
        { error: "Channel erforderlich" },
        { status: 400 }
      );
    }

    if (!text && !file) {
      return NextResponse.json(
        { error: "Nachricht oder Datei erforderlich" },
        { status: 400 }
      );
    }

    const message: ChatMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      userId: user.id,
      userName: user.name,
      userColor: user.color,
      text: text || "",
      timestamp: Date.now(),
    };

    if (file) {
      message.file = file;
      message.fileName = fileName;
      message.fileType = fileType;
    }

    const messages =
      ((await storeGet(`chat-messages-${channel}`)) as ChatMessage[] | null) || [];
    messages.push(message);

    // Keep only last MAX_MESSAGES
    const trimmed = messages.slice(-MAX_MESSAGES);
    await storeSet(`chat-messages-${channel}`, trimmed);

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler" },
      { status: 500 }
    );
  }
}
