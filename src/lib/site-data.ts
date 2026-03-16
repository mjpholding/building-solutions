import { storeGet } from "./admin-store";
import contactFallback from "@/data/contact.json";
import productsFallback from "@/data/products.json";

export interface ContactData {
  company: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  taxId: string;
  managingDirector: string;
}

/**
 * Get contact data - from KV in production, from JSON file in dev
 */
export async function getContact(): Promise<ContactData> {
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
    const data = await storeGet("contact");
    if (data) return data as ContactData;
  }
  return contactFallback as ContactData;
}

/**
 * Get products - from Redis in production, from JSON file in dev
 */
export async function getProducts() {
  if (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) {
    const data = await storeGet("products");
    if (data) return data as typeof productsFallback;
  }
  return productsFallback;
}
