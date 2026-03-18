import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

const MAX_SIZE = 4 * 1024 * 1024; // 4 MB (Vercel serverless limit ~4.5 MB)
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const slug = formData.get("slug") as string | null;

    if (!file || !slug) {
      return NextResponse.json({ error: "File and slug required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPEG, WebP and SVG allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Max 5 MB" }, { status: 400 });
    }

    // Convert to base64 data URL
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Store in Redis/file with key "image:{slug}"
    await storeSet(`image:${slug}`, dataUrl);

    // Return API URL with cache-busting timestamp
    const url = `/api/admin/upload?slug=${encodeURIComponent(slug)}&t=${Date.now()}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  const dataUrl = (await storeGet(`image:${slug}`)) as string | null;
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Parse data URL: data:image/png;base64,AAAA...
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) {
    return new NextResponse("Invalid image data", { status: 500 });
  }

  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=60",
    },
  });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Extract slug from URL: /api/admin/upload?slug=xxx
    let slug: string | null = null;
    try {
      const parsed = new URL(url, "http://localhost");
      slug = parsed.searchParams.get("slug");
    } catch {
      // Try to extract from simple path
      const match = url.match(/slug=([^&]+)/);
      slug = match ? decodeURIComponent(match[1]) : null;
    }

    if (slug) {
      await storeSet(`image:${slug}`, null);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
