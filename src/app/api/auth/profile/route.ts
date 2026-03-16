import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedCustomer, getCustomers, saveCustomers } from "@/lib/customer-auth";

export async function PUT(request: NextRequest) {
  const authed = await getAuthenticatedCustomer();
  if (!authed) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();
  const customers = await getCustomers();
  const idx = customers.findIndex((c) => c.id === authed.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = ["company", "name", "phone", "address", "zip", "city", "country", "taxId"];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      (customers[idx] as unknown as Record<string, unknown>)[key] = body[key];
    }
  }

  await saveCustomers(customers);
  return NextResponse.json({ success: true });
}
