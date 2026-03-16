import fs from "fs/promises";
import path from "path";

/**
 * Storage abstraction:
 * - Production (Vercel): uses Upstash Redis via REST API
 * - Development: uses local JSON files
 *
 * Supports both Upstash env var naming conventions:
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (Upstash direct)
 * - KV_REST_API_URL / KV_REST_API_TOKEN (legacy Vercel KV)
 */

function getRedisUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
}

function getRedisToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
}

function useRedis(): boolean {
  return !!(getRedisUrl() && getRedisToken());
}

// ── Upstash Redis operations ──

async function redisGet(key: string): Promise<unknown | null> {
  const res = await fetch(`${getRedisUrl()}/get/${key}`, {
    headers: { Authorization: `Bearer ${getRedisToken()}` },
    cache: "no-store",
  });
  const data = await res.json();
  if (data.result === null || data.result === undefined) return null;
  try {
    return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
  } catch {
    return data.result;
  }
}

async function redisSet(key: string, value: unknown): Promise<void> {
  await fetch(`${getRedisUrl()}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getRedisToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", key, JSON.stringify(value)]),
    cache: "no-store",
  });
}

// ── Local file operations ──

function filePath(key: string): string {
  if (key === "contact") return path.join(process.cwd(), "src", "data", "contact.json");
  if (key === "products") return path.join(process.cwd(), "src", "data", "products.json");
  if (key.startsWith("texts:")) {
    const locale = key.split(":")[1];
    return path.join(process.cwd(), "src", "messages", locale, "common.json");
  }
  return path.join(process.cwd(), ".admin-data", `${key}.json`);
}

async function fileGet(key: string): Promise<unknown | null> {
  try {
    const data = await fs.readFile(filePath(key), "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function fileSet(key: string, value: unknown): Promise<void> {
  const fp = filePath(key);
  await fs.mkdir(path.dirname(fp), { recursive: true });
  await fs.writeFile(fp, JSON.stringify(value, null, 2));
}

// ── Public API ──

export async function storeGet(key: string): Promise<unknown | null> {
  if (useRedis()) {
    const data = await redisGet(key);
    if (data !== null) return data;
    // First access: seed Redis from local files
    const fileData = await fileGet(key);
    if (fileData !== null) {
      await redisSet(key, fileData);
    }
    return fileData;
  }
  return fileGet(key);
}

export async function storeSet(key: string, value: unknown): Promise<void> {
  if (useRedis()) {
    await redisSet(key, value);
    return;
  }
  await fileSet(key, value);
}
