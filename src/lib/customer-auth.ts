import { cookies } from "next/headers";
import crypto from "crypto";
import { storeGet, storeSet } from "./admin-store";

export interface Customer {
  id: string;
  type: "b2b" | "b2c";
  company: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  taxId: string;
  discountPercent: number;
  loyaltyPoints: number;
  notes: string;
  createdAt: string;
}

export type CustomerPublic = Omit<Customer, "passwordHash">;

const SALT = "swish-customer-2026";

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SALT).update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function getCustomers(): Promise<Customer[]> {
  return ((await storeGet("customers")) || []) as Customer[];
}

export async function saveCustomers(customers: Customer[]) {
  await storeSet("customers", customers);
}

export async function getCustomerByEmail(email: string): Promise<Customer | undefined> {
  const customers = await getCustomers();
  return customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  const customers = await getCustomers();
  return customers.find((c) => c.id === id);
}

export function createCustomerSession(customerId: string): string {
  const payload = `${customerId}:${Date.now()}`;
  const sig = crypto.createHmac("sha256", SALT + "-session").update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

export function verifyCustomerSession(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [customerId, timestamp, sig] = parts;
    const expected = crypto.createHmac("sha256", SALT + "-session").update(`${customerId}:${timestamp}`).digest("hex");
    if (sig !== expected) return null;
    // 30 day session
    if (Date.now() - parseInt(timestamp) > 30 * 24 * 60 * 60 * 1000) return null;
    return customerId;
  } catch {
    return null;
  }
}

export async function getAuthenticatedCustomer(): Promise<CustomerPublic | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_session")?.value;
  if (!token) return null;
  const customerId = verifyCustomerSession(token);
  if (!customerId) return null;
  const customer = await getCustomerById(customerId);
  if (!customer) return null;
  const { passwordHash: _, ...pub } = customer;
  return pub;
}

export function stripPassword(c: Customer): CustomerPublic {
  const { passwordHash: _, ...pub } = c;
  return pub;
}
