import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, getSessionUser } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface OfferItem {
  productName: string;
  productSlug: string;
  size: string;
  quantity: number;
  unitPrice: number; // netto
  discount: number; // percent
  totalNet: number;
}

export interface Offer {
  id: string;
  number: string; // e.g. "ANG-2026-001"
  date: string; // ISO date
  validUntil: string; // ISO date
  status: "draft" | "sent" | "accepted" | "rejected";
  // Customer
  customerName: string;
  customerCompany: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  // Items
  items: OfferItem[];
  // Totals
  subtotalNet: number;
  vatRate: number; // 19
  vatAmount: number;
  totalGross: number;
  // Notes
  notes: string;
  // Meta
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

async function getOffers(): Promise<Offer[]> {
  return ((await storeGet("offers")) as Offer[]) || [];
}

async function getNextNumber(): Promise<string> {
  const offers = await getOffers();
  const year = new Date().getFullYear();
  const thisYear = offers.filter((o) => o.number.includes(String(year)));
  const num = thisYear.length + 1;
  return `ANG-${year}-${String(num).padStart(3, "0")}`;
}

// GET: list all offers
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const offers = await getOffers();
  // Return without items for list view (lighter)
  return NextResponse.json(
    offers.map((o) => ({
      id: o.id,
      number: o.number,
      date: o.date,
      validUntil: o.validUntil,
      status: o.status,
      customerName: o.customerName,
      customerCompany: o.customerCompany,
      subtotalNet: o.subtotalNet,
      totalGross: o.totalGross,
      itemCount: o.items.length,
      createdAt: o.createdAt,
    }))
  );
}

// POST: create new offer
export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const number = await getNextNumber();

  const offer: Offer = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    number,
    date: body.date || new Date().toISOString().split("T")[0],
    validUntil: body.validUntil || "",
    status: body.status || "draft",
    customerName: body.customerName || "",
    customerCompany: body.customerCompany || "",
    customerEmail: body.customerEmail || "",
    customerPhone: body.customerPhone || "",
    customerAddress: body.customerAddress || "",
    items: body.items || [],
    subtotalNet: 0,
    vatRate: 19,
    vatAmount: 0,
    totalGross: 0,
    notes: body.notes || "",
    createdBy: user.name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Calculate totals
  offer.subtotalNet = offer.items.reduce((sum: number, item: OfferItem) => sum + item.totalNet, 0);
  offer.vatAmount = Math.round(offer.subtotalNet * (offer.vatRate / 100) * 100) / 100;
  offer.totalGross = Math.round((offer.subtotalNet + offer.vatAmount) * 100) / 100;

  const offers = await getOffers();
  offers.push(offer);
  await storeSet("offers", offers);

  return NextResponse.json(offer, { status: 201 });
}

// PUT: update offer
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const offers = await getOffers();
  const idx = offers.findIndex((o) => o.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const offer = offers[idx];
  if (body.status) offer.status = body.status;
  if (body.customerName !== undefined) offer.customerName = body.customerName;
  if (body.customerCompany !== undefined) offer.customerCompany = body.customerCompany;
  if (body.customerEmail !== undefined) offer.customerEmail = body.customerEmail;
  if (body.customerPhone !== undefined) offer.customerPhone = body.customerPhone;
  if (body.customerAddress !== undefined) offer.customerAddress = body.customerAddress;
  if (body.validUntil !== undefined) offer.validUntil = body.validUntil;
  if (body.notes !== undefined) offer.notes = body.notes;
  if (body.items) {
    offer.items = body.items;
    offer.subtotalNet = offer.items.reduce((sum: number, item: OfferItem) => sum + item.totalNet, 0);
    offer.vatAmount = Math.round(offer.subtotalNet * (offer.vatRate / 100) * 100) / 100;
    offer.totalGross = Math.round((offer.subtotalNet + offer.vatAmount) * 100) / 100;
  }
  offer.updatedAt = Date.now();

  await storeSet("offers", offers);
  return NextResponse.json(offer);
}

// DELETE: remove offer
export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const offers = await getOffers();
  await storeSet("offers", offers.filter((o) => o.id !== id));
  return NextResponse.json({ success: true });
}
