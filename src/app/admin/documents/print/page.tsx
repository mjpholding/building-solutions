"use client";

import { useEffect, useState } from "react";
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

export default function PrintDocument() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "wz" | "invoice";
  const orderId = searchParams.get("orderId");
  const docNumber = searchParams.get("number") || "";
  const docDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((orders: Order[]) => {
          setOrder(orders.find((o) => o.id === orderId) || null);
        });
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      setTimeout(() => window.print(), 500);
    }
  }, [order]);

  if (!order) {
    return <div className="p-10 text-center text-gray-500">Laden...</div>;
  }

  const tax = order.subtotal * 0.19;
  const total = order.subtotal + tax;
  const isInvoice = type === "invoice";

  return (
    <div className="max-w-[210mm] mx-auto p-10 bg-white text-black text-sm print:p-0">
      <style>{`@media print { body { margin: 0; } @page { margin: 15mm; } }`}</style>

      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-bold text-red-600">Swish Deutschland</h1>
          <p className="text-xs text-gray-500 mt-1">
            Swish Deutschland GmbH<br />
            Musterstrasse 1, 10115 Berlin<br />
            USt-IdNr.: DE123456789
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">
            {isInvoice ? "RECHNUNG" : "WARENAUSGANGSCHEIN (WZ)"}
          </h2>
          <p className="mt-2 text-sm">
            <span className="text-gray-500">Nr.:</span>{" "}
            <span className="font-mono font-bold">{docNumber}</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Datum:</span> {docDate}
          </p>
          <p className="text-sm">
            <span className="text-gray-500">Bestellung:</span>{" "}
            <span className="font-mono">{order.id}</span>
          </p>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-8 p-4 border border-gray-200 rounded">
        <p className="text-xs text-gray-400 mb-1">{isInvoice ? "Rechnungsempfaenger" : "Empfaenger"}</p>
        <p className="font-bold">{order.customer.company || order.customer.name}</p>
        {order.customer.company && <p>{order.customer.name}</p>}
        <p>{order.customer.address}</p>
        <p>{order.customer.zip} {order.customer.city}</p>
        <p>{order.customer.country}</p>
        {order.customer.taxId && <p className="mt-1 text-xs">USt-IdNr.: {order.customer.taxId}</p>}
      </div>

      {/* Items table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="text-left py-2 font-semibold">Pos.</th>
            <th className="text-left py-2 font-semibold">Bezeichnung</th>
            <th className="text-left py-2 font-semibold">Groesse</th>
            <th className="text-center py-2 font-semibold">Menge</th>
            {isInvoice && (
              <>
                <th className="text-right py-2 font-semibold">Einzelpreis</th>
                <th className="text-right py-2 font-semibold">Gesamt</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-2">{i + 1}</td>
              <td className="py-2">{item.name}</td>
              <td className="py-2">{item.size}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              {isInvoice && (
                <>
                  <td className="py-2 text-right">{item.price.toFixed(2)} EUR</td>
                  <td className="py-2 text-right font-medium">{(item.price * item.quantity).toFixed(2)} EUR</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals (invoice only) */}
      {isInvoice && (
        <div className="ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Nettobetrag:</span>
            <span>{order.subtotal.toFixed(2)} EUR</span>
          </div>
          <div className="flex justify-between">
            <span>MwSt. 19%:</span>
            <span>{tax.toFixed(2)} EUR</span>
          </div>
          <div className="flex justify-between border-t-2 border-gray-900 pt-1 font-bold text-base">
            <span>Gesamtbetrag:</span>
            <span>{total.toFixed(2)} EUR</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-200 text-xs text-gray-400">
        {isInvoice ? (
          <p>Zahlungsziel: 14 Tage netto. Bitte ueberweisen Sie den Betrag unter Angabe der Rechnungsnummer.</p>
        ) : (
          <p>Hiermit bestaetigen wir die Ausgabe der oben aufgefuehrten Waren.</p>
        )}
        <div className="mt-8 flex justify-between">
          <div>
            <div className="border-t border-gray-400 w-48 mt-10"></div>
            <p className="mt-1">Datum, Unterschrift Lager</p>
          </div>
          <div>
            <div className="border-t border-gray-400 w-48 mt-10"></div>
            <p className="mt-1">Datum, Unterschrift Empfaenger</p>
          </div>
        </div>
      </div>
    </div>
  );
}
