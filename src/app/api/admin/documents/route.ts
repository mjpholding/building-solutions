import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

interface DocumentRecord {
  id: string;
  type: "wz" | "invoice";
  orderId: string;
  number: string;
  date: string;
  createdAt: string;
}

async function getDocuments(): Promise<DocumentRecord[]> {
  return ((await storeGet("documents")) || []) as DocumentRecord[];
}

async function getNextNumber(type: "wz" | "invoice"): Promise<string> {
  const docs = await getDocuments();
  const year = new Date().getFullYear();
  const prefix = type === "wz" ? "WZ" : "FV";
  const thisYear = docs.filter((d) => d.type === type && d.number.includes(`/${year}`));
  const num = thisYear.length + 1;
  return `${prefix}/${num.toString().padStart(4, "0")}/${year}`;
}

// GET - list documents
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getDocuments());
}

// POST - generate document (WZ or Invoice)
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, type, date } = await request.json();
  if (!orderId || !type) {
    return NextResponse.json({ error: "orderId and type required" }, { status: 400 });
  }

  // Get order data
  const orders = ((await storeGet("orders")) || []) as Array<Record<string, unknown>>;
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const docNumber = await getNextNumber(type);
  const docDate = date || new Date().toISOString().split("T")[0];

  const doc: DocumentRecord = {
    id: `DOC-${Date.now()}`,
    type,
    orderId,
    number: docNumber,
    date: docDate,
    createdAt: new Date().toISOString(),
  };

  const docs = await getDocuments();
  docs.push(doc);
  await storeSet("documents", docs);

  return NextResponse.json({ success: true, document: doc, order });
}
