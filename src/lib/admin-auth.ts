import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function verifyPassword(password: string): boolean {
  return password === getSecret();
}

export async function createSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [timestamp, hmac] = token.split(".");
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(timestamp)
      .digest("hex");
    if (hmac !== expected) return false;
    const age = Date.now() - parseInt(timestamp);
    return age < SESSION_DURATION;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export async function setSessionCookie(): Promise<string> {
  const token = await createSessionToken();
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

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
