import { cookies } from "next/headers";
import crypto from "crypto";
import { storeGet, storeSet } from "./admin-store";

const COOKIE_NAME = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

// HMAC secret — resolved lazily so `next build` (which sets NODE_ENV to
// production but may not have runtime envs) doesn't crash. Any runtime
// call that actually needs the secret will throw if it's not set in
// production.
function getHmacSecret(): string {
  const s = process.env.ADMIN_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SECRET is required in production. Set it in Vercel → Environment Variables."
    );
  }
  return "dev-only-admin-secret-change-me";
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: "superadmin" | "admin" | "editor";
  createdAt: string;
}

// ── User storage ──

export async function getAdminUsers(): Promise<AdminUser[]> {
  const data = await storeGet("admin-users");
  return (data as AdminUser[]) || [];
}

export async function saveAdminUsers(users: AdminUser[]): Promise<void> {
  await storeSet("admin-users", users);
}

// ── Password verification ──

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string): boolean {
  // Legacy single-password mode (fallback when no users exist).
  // In production the env var is mandatory — otherwise 'admin123' would
  // let anyone bootstrap the system.
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    return false;
  }
  const legacyPw = process.env.ADMIN_PASSWORD || "admin123";
  return password === legacyPw;
}

export async function verifyUserLogin(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const users = await getAdminUsers();

  // If no users exist, allow legacy single-password login
  if (users.length === 0) {
    if (verifyPassword(password)) {
      // Auto-create default superadmin
      const defaultUser: AdminUser = {
        id: crypto.randomUUID(),
        name: "Administrator",
        username: "admin",
        password: hashPassword(password),
        role: "superadmin",
        createdAt: new Date().toISOString(),
      };
      await saveAdminUsers([defaultUser]);
      return defaultUser;
    }
    return null;
  }

  // Normal multi-user login
  const hashed = hashPassword(password);
  const user = users.find(
    (u) => u.username === username && u.password === hashed
  );
  return user || null;
}

// ── Session management ──

export async function createSessionToken(userId: string): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `${userId}.${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", getHmacSecret())
    .update(payload)
    .digest("hex");
  return `${userId}.${timestamp}.${hmac}`;
}

export async function verifySessionToken(
  token: string
): Promise<{ valid: boolean; userId?: string }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };
    const [userId, timestamp, hmac] = parts;
    const expected = crypto
      .createHmac("sha256", getHmacSecret())
      .update(`${userId}.${timestamp}`)
      .digest("hex");
    if (hmac !== expected) return { valid: false };
    const age = Date.now() - parseInt(timestamp);
    if (age > SESSION_DURATION) return { valid: false };
    return { valid: true, userId };
  } catch {
    return { valid: false };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const { valid } = await verifySessionToken(token);
  return valid;
}

export async function getSessionUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const { valid, userId } = await verifySessionToken(token);
  if (!valid || !userId) return null;
  const users = await getAdminUsers();
  return users.find((u) => u.id === userId) || null;
}

export async function setSessionCookie(userId: string): Promise<string> {
  const token = await createSessionToken(userId);
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
