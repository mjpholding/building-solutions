"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Order {
  id: string;
  date: string;
  customer: {
    company: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    city: string;
    country: string;
    taxId: string;
  };
  items: { name: string; size: string; quantity: number; price: number }[];
  subtotal: number;
}

interface DocSettings {
  companyName: string;
  companyStreet: string;
  companyZip: string;
  companyCity: string;
  companyCountry: string;
  companyTaxId: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  bankName: string;
  bankIban: string;
  bankBic: string;
  bankAccountHolder: string;
  invoicePaymentDays: number;
  invoicePaymentNote: string;
  invoiceFooterNote: string;
  wzFooterNote: string;
  legalNote: string;
}

export default function PrintDocumentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Laden...</div>}>
      <PrintDocument />
    </Suspense>
  );
}

function PrintDocument() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "wz" | "invoice";
  const orderId = searchParams.get("orderId");
  const docNumber = searchParams.get("number") || "";
  const docDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<DocSettings | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((orders: Order[]) => {
          setOrder(orders.find((o) => o.id === orderId) || null);
        });
    }
    fetch("/api/admin/document-settings")
      .then((r) => r.json())
      .then(setSettings);
  }, [orderId]);

  useEffect(() => {
    if (order && settings) {
      setTimeout(() => window.print(), 600);
    }
  }, [order, settings]);

  if (!order || !settings) {
    return (
      <div className="p-10 text-center text-gray-500">Laden...</div>
    );
  }

  const tax = order.subtotal * 0.19;
  const total = order.subtotal + tax;
  const isInvoice = type === "invoice";

  const paymentNote = settings.invoicePaymentNote.replace(
    "{days}",
    String(settings.invoicePaymentDays)
  );

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 12mm 15mm; size: A4; }
          .no-print { display: none !important; }
        }
        @media screen {
          body { background: #e5e7eb; }
        }
      `}</style>

      {/* Print button (screen only) */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-bs-accent text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-bs-accent-dark"
        >
          Drucken
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white text-black text-[11px] leading-snug print:max-w-none"
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif", padding: "10mm 12mm" }}
      >
        {/* === HEADER === */}
        <div className="flex justify-between items-start mb-1">
          {/* Company sender line (small, above recipient) */}
          <div className="flex-1">
            <p className="text-[8px] text-gray-400 mb-6 border-b border-gray-300 pb-1 mr-20">
              {settings.companyName} · {settings.companyStreet} · {settings.companyZip} {settings.companyCity}
            </p>

            {/* Recipient */}
            <div className="min-h-[28mm]">
              <p className="text-[9px] text-gray-400 mb-1">
                {isInvoice ? "Rechnungsempfänger" : "Empfänger"}
              </p>
              <p className="font-bold text-[12px]">
                {order.customer.company || order.customer.name}
              </p>
              {order.customer.company && (
                <p>{order.customer.name}</p>
              )}
              <p>{order.customer.address}</p>
              <p>
                {order.customer.zip} {order.customer.city}
              </p>
              <p>{order.customer.country}</p>
              {order.customer.taxId && (
                <p className="mt-1 text-[10px] text-gray-500">
                  USt-IdNr.: {order.customer.taxId}
                </p>
              )}
            </div>
          </div>

          {/* Document info (right side) */}
          <div className="text-right w-[65mm] flex-shrink-0">
            <h1 className="text-[20px] font-bold text-bs-accent leading-tight">
              {settings.companyName.split(" ")[0]}{" "}
              <span className="text-gray-900">
                {settings.companyName.split(" ").slice(1).join(" ")}
              </span>
            </h1>
            <div className="text-[9px] text-gray-500 mt-1 mb-4">
              <p>{settings.companyStreet}</p>
              <p>{settings.companyZip} {settings.companyCity}</p>
              {settings.companyPhone && <p>Tel.: {settings.companyPhone}</p>}
              {settings.companyEmail && <p>{settings.companyEmail}</p>}
              {settings.companyWebsite && <p>{settings.companyWebsite}</p>}
              <p>USt-IdNr.: {settings.companyTaxId}</p>
            </div>

            <div className="border-t border-gray-200 pt-2 space-y-0.5 text-[10px]">
              <h2 className="text-[16px] font-bold text-gray-900 mb-2">
                {isInvoice ? "RECHNUNG" : "LIEFERSCHEIN (WZ)"}
              </h2>
              <div className="flex justify-between">
                <span className="text-gray-500">Nr.:</span>
                <span className="font-mono font-bold">{docNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Datum:</span>
                <span>{docDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bestellung:</span>
                <span className="font-mono text-[9px]">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kundennr.:</span>
                <span>{order.customer.taxId || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* === ITEMS TABLE === */}
        <table className="w-full border-collapse mt-6 mb-4">
          <thead>
            <tr className="border-b-2 border-gray-900 text-[10px]">
              <th className="text-left py-2 w-[30px] font-semibold">Pos.</th>
              <th className="text-left py-2 font-semibold">Bezeichnung</th>
              <th className="text-left py-2 w-[70px] font-semibold">Größe</th>
              <th className="text-center py-2 w-[50px] font-semibold">Menge</th>
              {isInvoice && (
                <>
                  <th className="text-right py-2 w-[90px] font-semibold">Einzelpreis</th>
                  <th className="text-right py-2 w-[90px] font-semibold">Gesamt</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr
                key={i}
                className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : ""}`}
                style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
              >
                <td className="py-2 px-1">{i + 1}</td>
                <td className="py-2 font-medium">{item.name}</td>
                <td className="py-2">{item.size}</td>
                <td className="py-2 text-center">{item.quantity}</td>
                {isInvoice && (
                  <>
                    <td className="py-2 text-right tabular-nums">
                      {item.price.toFixed(2)} EUR
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {(item.price * item.quantity).toFixed(2)} EUR
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* === TOTALS (invoice only) === */}
        {isInvoice && (
          <div className="flex justify-end mb-6">
            <div className="w-[220px] text-[11px]">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Nettobetrag:</span>
                <span className="tabular-nums">{order.subtotal.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">MwSt. 19%:</span>
                <span className="tabular-nums">{tax.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between py-1.5 border-t-2 border-gray-900 font-bold text-[13px]">
                <span>Gesamtbetrag:</span>
                <span className="tabular-nums">{total.toFixed(2)} EUR</span>
              </div>
            </div>
          </div>
        )}

        {/* === PAYMENT / NOTE === */}
        <div className="mt-4 text-[10px] text-gray-600 space-y-3">
          {isInvoice ? (
            <>
              <p>
                <span className="font-semibold text-gray-800">Zahlungsziel:</span>{" "}
                {settings.invoicePaymentDays} Tage netto
              </p>
              <p>{paymentNote}</p>
              {settings.invoiceFooterNote && <p>{settings.invoiceFooterNote}</p>}
            </>
          ) : (
            <>
              <p>{settings.wzFooterNote}</p>
              {/* Signature lines for WZ */}
              <div className="flex justify-between mt-10 pt-2">
                <div>
                  <div className="border-t border-gray-400 w-[180px] mt-8"></div>
                  <p className="mt-1 text-[9px] text-gray-400">
                    Datum, Unterschrift Lager
                  </p>
                </div>
                <div>
                  <div className="border-t border-gray-400 w-[180px] mt-8"></div>
                  <p className="mt-1 text-[9px] text-gray-400">
                    Datum, Unterschrift Empfänger
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* === BANK DETAILS (invoice only) === */}
        {isInvoice && settings.bankIban && (
          <div className="mt-6 p-3 bg-gray-50 rounded border border-gray-200 text-[10px]"
            style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
          >
            <p className="font-semibold text-gray-800 mb-1">Bankverbindung</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-gray-600">
              {settings.bankAccountHolder && (
                <p>
                  <span className="text-gray-400">Kontoinhaber:</span>{" "}
                  {settings.bankAccountHolder}
                </p>
              )}
              {settings.bankName && (
                <p>
                  <span className="text-gray-400">Bank:</span> {settings.bankName}
                </p>
              )}
              <p>
                <span className="text-gray-400">IBAN:</span>{" "}
                <span className="font-mono">{settings.bankIban}</span>
              </p>
              {settings.bankBic && (
                <p>
                  <span className="text-gray-400">BIC:</span>{" "}
                  <span className="font-mono">{settings.bankBic}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* === LEGAL FOOTER === */}
        {settings.legalNote && (
          <div className="mt-6 pt-3 border-t border-gray-200 text-[8px] text-gray-400 text-center">
            {settings.legalNote}
          </div>
        )}
      </div>
    </>
  );
}
