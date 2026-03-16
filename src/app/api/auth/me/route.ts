import { NextResponse } from "next/server";
import { getAuthenticatedCustomer } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getAuthenticatedCustomer();
  return NextResponse.json({ customer });
}
