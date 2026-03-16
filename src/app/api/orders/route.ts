import { NextRequest, NextResponse } from "next/server";
import { storeGet, storeSet } from "@/lib/admin-store";
import { isAuthenticated } from "@/lib/admin-auth";

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
