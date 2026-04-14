import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { storeGet } from "@/lib/admin-store";

export async function GET() {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "src", "data", "references.json"),
      "utf-8"
    );
    return NextResponse.json(JSON.parse(raw));
  } catch {
    const refs = (await storeGet("references")) as unknown[] || [];
    return NextResponse.json(refs);
  }
}
