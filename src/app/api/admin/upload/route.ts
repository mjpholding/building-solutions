import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { put, del } from "@vercel/blob";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

function useVercelBlob(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const filename = `${slug}.${ext}`;

  if (useVercelBlob()) {
    // Production: Vercel Blob Storage
    const blob = await put(`products/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  } else {
    // Development: write to public/products/
    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "products");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, filename);
    await writeFile(filePath, buffer);
    return NextResponse.json({ url: `/products/${filename}` });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  if (useVercelBlob() && url.includes("vercel-storage.com")) {
    // Production: delete from Vercel Blob
    await del(url);
  } else {
    // Development: delete local file
    const filename = url.split("/").pop();
    if (filename) {
      const filePath = path.join(process.cwd(), "public", "products", filename);
      try { await unlink(filePath); } catch { /* file may not exist */ }
    }
  }

  return NextResponse.json({ success: true });
}
