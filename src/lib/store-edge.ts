/**
 * Edge-runtime safe Redis read.
 * No fs / process.cwd — works inside next-intl middleware and edge routes.
 * Returns null when env vars are missing or the call fails (callers fall
 * back to bundled defaults).
 */
function getRedisUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
}

function getRedisToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
}

export async function storeGetEdge(key: string): Promise<unknown | null> {
  const url = getRedisUrl();
  const token = getRedisToken();
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown };
    if (data.result === null || data.result === undefined) return null;
    if (typeof data.result === "string") {
      try {
        return JSON.parse(data.result);
      } catch {
        return data.result;
      }
    }
    return data.result;
  } catch {
    return null;
  }
}
