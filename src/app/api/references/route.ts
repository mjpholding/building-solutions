import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

// Always read live: admin edits go to the store and must show up immediately.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // storeGet prefers Redis; if Redis is empty it auto-seeds from the bundled
  // src/data/references.json file and caches the result. Either way, every
  // admin save through PUT /api/admin/references is reflected here.
  const refs = (await storeGet("references")) as unknown[] | null;
  return NextResponse.json(refs ?? [], {
    headers: { "Cache-Control": "no-store, must-revalidate" },
  });
}
