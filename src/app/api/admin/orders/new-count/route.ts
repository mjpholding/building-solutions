import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet } from "@/lib/admin-store";

interface Order {
  status: string;
}

// GET: count of new orders (for badge in sidebar)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ count: 0 });
  }

  const orders = ((await storeGet("orders")) as Order[]) || [];
  const newCount = orders.filter((o) => o.status === "new").length;

  return NextResponse.json({ count: newCount });
}
