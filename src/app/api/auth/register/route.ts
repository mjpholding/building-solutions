import { NextRequest, NextResponse } from "next/server";
import { getCustomers, saveCustomers, hashPassword, createCustomerSession, stripPassword, Customer } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, company, name, email, password, phone, taxId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, E-Mail und Passwort sind erforderlich" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen haben" }, { status: 400 });
    }

    const customers = await getCustomers();
    if (customers.find((c) => c.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ error: "Diese E-Mail ist bereits registriert" }, { status: 400 });
    }

    const customer: Customer = {
      id: `CUS-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: type || "b2c",
      company: company || "",
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      phone: phone || "",
      address: "",
      zip: "",
      city: "",
      country: "Deutschland",
      taxId: taxId || "",
      discountPercent: 0,
      loyaltyPoints: 0,
      notes: "",
      createdAt: new Date().toISOString(),
    };

    customers.push(customer);
    await saveCustomers(customers);

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
    return NextResponse.json({ error: "Registrierung fehlgeschlagen" }, { status: 500 });
  }
}
