import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";

// POST: Extract text from uploaded PDF
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // Dynamic import for pdf-parse
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string; numpages: number; info: unknown }> }).default || pdfParseModule;
    const data = await (pdfParse as (buf: Buffer) => Promise<{ text: string; numpages: number; info: unknown }>)(buffer);

    return NextResponse.json({
      text: data.text,
      pages: data.numpages,
      info: data.info,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `PDF parsing failed: ${message}` }, { status: 500 });
  }
}
