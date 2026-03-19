import { NextRequest, NextResponse } from "next/server";
import { storeGet, storeSet } from "@/lib/admin-store";
import { isAuthenticated } from "@/lib/admin-auth";
import { notifyNewOrder } from "@/lib/email";

export interface Order {
  id: string;
  date: string;
  status: "new" | "processing" | "shipped" | "completed" | "cancelled";
  customer: {
    company: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    city: string;
    country: string;
    taxId: string;
  };
  items: {
    slug: string;
    name: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  notes: string;
}

async function getOrders(): Promise<Order[]> {
  return ((await storeGet("orders")) || []) as Order[];
}

async function saveOrders(orders: Order[]) {
  await storeSet("orders", orders);
}

// POST - create new order (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orders = await getOrders();

    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      date: new Date().toISOString(),
      status: "new",
      customer: body.customer,
      items: body.items,
      subtotal: body.items.reduce(
        (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
        0
      ),
      notes: body.notes || "",
    };

    orders.unshift(order);
    await saveOrders(orders);

    // Send email notification (non-blocking)
    notifyNewOrder(order).catch(() => {});

    return NextResponse.json({ success: true, orderId: order.id });
  } catch {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
}

// GET - list orders (admin only)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getOrders());
}

// PUT - update order status (admin only)
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await request.json();
  const orders = await getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  order.status = status;
  await saveOrders(orders);
  return NextResponse.json({ success: true });
}

// DELETE - remove order and its documents (admin only)
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  const orders = await getOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await saveOrders(filtered);

  // Also remove related documents
  const docs = ((await storeGet("documents")) || []) as Array<{ id: string; orderId: string }>;
  const filteredDocs = docs.filter((d) => d.orderId !== id);
  await storeSet("documents", filteredDocs);

  return NextResponse.json({ success: true });
}
