import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface DocumentSettings {
  // Company info
  companyName: string;
  companyStreet: string;
  companyZip: string;
  companyCity: string;
  companyCountry: string;
  companyTaxId: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  // Bank account
  bankName: string;
  bankIban: string;
  bankBic: string;
  bankAccountHolder: string;
  // Invoice settings
  invoicePaymentDays: number;
  invoicePaymentNote: string;
  invoiceFooterNote: string;
  // WZ settings
  wzFooterNote: string;
  // Legal
  legalNote: string;
}

const DEFAULT_SETTINGS: DocumentSettings = {
  companyName: "Building Solutions GmbH GmbH",
  companyStreet: "Musterstrasse 1",
  companyZip: "10115",
  companyCity: "Berlin",
  companyCountry: "Deutschland",
  companyTaxId: "DE123456789",
  companyPhone: "",
  companyEmail: "",
  companyWebsite: "www.buildingsolutions.de",
  bankName: "",
  bankIban: "",
  bankBic: "",
  bankAccountHolder: "",
  invoicePaymentDays: 14,
  invoicePaymentNote:
    "Bitte überweisen Sie den Betrag innerhalb von {days} Tagen unter Angabe der Rechnungsnummer auf das unten angegebene Konto.",
  invoiceFooterNote: "",
  wzFooterNote: "Hiermit bestätigen wir die Ausgabe der oben aufgeführten Waren.",
  legalNote:
    "Geschäftsführer: [Name] | Amtsgericht [Ort] HRB [Nummer] | Steuernummer: [Nummer]",
};

const STORE_KEY = "document-settings";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = ((await storeGet(STORE_KEY)) as DocumentSettings | null) || DEFAULT_SETTINGS;
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  await storeSet(STORE_KEY, data);
  return NextResponse.json({ ok: true });
}
