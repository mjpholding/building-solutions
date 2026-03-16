import { NextRequest, NextResponse } from "next/server";
import { getCustomerByEmail, verifyPassword, createCustomerSession, stripPassword } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 });
    }

    const customer = await getCustomerByEmail(email);
    if (!customer || !verifyPassword(password, customer.passwordHash)) {
      return NextResponse.json({ error: "Ungueltige Anmeldedaten" }, { status: 401 });
    }

    const token = createCustomerSession(customer.id);
    const res = NextResponse.json({ success: true, customer: stripPassword(customer) });
    res.cookies.set("customer_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Anmeldung fehlgeschlagen" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("customer_session", "", { maxAge: 0, path: "/" });
  return res;
}
