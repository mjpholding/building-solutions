import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getCustomers, saveCustomers, stripPassword } from "@/lib/customer-auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const customers = await getCustomers();
  return NextResponse.json(customers.map(stripPassword));
}

// Update customer (discount, notes, type, etc.)
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { id, ...updates } = body;
  const customers = await getCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only allow updating specific fields
  const allowed = ["type", "company", "name", "phone", "address", "zip", "city", "country", "taxId", "discountPercent", "loyaltyPoints", "notes"];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      (customers[idx] as unknown as Record<string, unknown>)[key] = updates[key];
    }
  }

  await saveCustomers(customers);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json();
  const customers = await getCustomers();
  const filtered = customers.filter((c) => c.id !== id);
  await saveCustomers(filtered);
  return NextResponse.json({ success: true });
}
