import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

// Store hero media as separate Redis keys (each up to ~4MB base64)
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // Max 4MB
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Datei zu groß (max. 4 MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Save media data separately
  await storeSet(`hero-media-${id}`, { base64, name, type: file.type });

  return NextResponse.json({ id, name, type: file.type.startsWith("video/") ? "video" : "image" });
}

// GET: serve a hero media file
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing id", { status: 400 });

  const data = (await storeGet(`hero-media-${id}`)) as { base64: string; name: string; type: string } | null;
  if (!data) return new NextResponse("Not found", { status: 404 });

  // Return the base64 data URL for the client
  return NextResponse.json({ url: data.base64, name: data.name, type: data.type });
}
