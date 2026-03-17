import { cookies } from "next/headers";
import crypto from "crypto";
import { storeGet, storeSet } from "./admin-store";

const COOKIE_NAME = "chat_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ChatUser {
  id: string;
  name: string;
  username: string;
  password: string;
  color: string;
  isAdmin: boolean;
  createdAt: string;
}

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function getChatUsers(): Promise<ChatUser[]> {
  const users = (await storeGet("chat-users")) as ChatUser[] | null;
  return users || [];
}

export async function saveChatUsers(users: ChatUser[]): Promise<void> {
  await storeSet("chat-users", users);
}

export async function verifyChatPassword(
  username: string,
  password: string
): Promise<ChatUser | null> {
  const users = await getChatUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
}

export async function createChatSession(userId: string): Promise<string> {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(`${userId}.${timestamp}`)
    .digest("hex");
  const token = `${userId}.${timestamp}.${hmac}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return token;
}

export async function getChatUser(): Promise<ChatUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, timestamp, hmac] = parts;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(`${userId}.${timestamp}`)
    .digest("hex");

  if (hmac !== expected) return null;

  const age = Date.now() - parseInt(timestamp);
  if (age > SESSION_DURATION) return null;

  const users = await getChatUsers();
  return users.find((u) => u.id === userId) || null;
}

export async function clearChatSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
