import { NextRequest, NextResponse } from "next/server";
import { getChatUser } from "@/lib/chat-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface ChatChannel {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
}

const DEFAULT_CHANNELS: ChatChannel[] = [
  {
    id: "allgemein",
    name: "Allgemein",
    createdAt: new Date().toISOString(),
    createdBy: "system",
  },
  {
    id: "bestellungen",
    name: "Bestellungen",
    createdAt: new Date().toISOString(),
    createdBy: "system",
  },
  {
    id: "dringend",
    name: "Dringend",
    createdAt: new Date().toISOString(),
    createdBy: "system",
  },
];

async function getChannels(): Promise<ChatChannel[]> {
  const channels = (await storeGet("chat-channels")) as ChatChannel[] | null;
  if (!channels) {
    await storeSet("chat-channels", DEFAULT_CHANNELS);
    return DEFAULT_CHANNELS;
  }
  return channels;
}

export async function GET() {
  const user = await getChatUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channels = await getChannels();
  return NextResponse.json(channels);
}

export async function POST(request: NextRequest) {
  const user = await getChatUser();
  if (!user || !user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Kanalname erforderlich" },
        { status: 400 }
      );
    }

    const channels = await getChannels();

    if (channels.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      return NextResponse.json(
        { error: "Kanal existiert bereits" },
        { status: 409 }
      );
    }

    const newChannel: ChatChannel = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    };

    channels.push(newChannel);
    await storeSet("chat-channels", channels);

    return NextResponse.json(newChannel, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getChatUser();
  if (!user || !user.isAdmin) {
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

    const channels = await getChannels();
    const filtered = channels.filter((c) => c.id !== id);

    if (filtered.length === channels.length) {
      return NextResponse.json(
        { error: "Kanal nicht gefunden" },
        { status: 404 }
      );
    }

    await storeSet("chat-channels", filtered);
    // Also clear messages for this channel
    await storeSet(`chat-messages-${id}`, []);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Interner Fehler" },
      { status: 500 }
    );
  }
}
