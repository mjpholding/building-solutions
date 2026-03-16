import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/customer-auth";
import { storeGet } from "@/lib/admin-store";

export async function GET() {
  const customer = await getAuthenticatedCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const orders = ((await storeGet("orders")) || []) as Array<{
    id: string;
    customerId?: string;
    customer: { email: string };
    [key: string]: unknown;
  }>;

  // Match by customerId or email
  const customerOrders = orders.filter(
    (o) => o.customerId === customer.id || o.customer?.email === customer.email
  );

  return NextResponse.json(customerOrders);
}
