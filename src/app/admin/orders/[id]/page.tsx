"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, FileText, Printer, Trash2 } from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: "new" | "processing" | "shipped" | "completed" | "cancelled";
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
  items: { slug: string; name: string; size: string; quantity: number; price: number }[];
  subtotal: number;
  notes: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-blue-100 text-bs-accent-dark",
};

interface DocRecord {
  id: string;
  type: "wz" | "invoice";
  orderId: string;
  number: string;
  date: string;
}

export default function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((orders: Order[]) => {
        setOrder(orders.find((o) => o.id === orderId) || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((docs: DocRecord[]) => {
        setDocuments(docs.filter((d) => d.orderId === orderId));
      })
      .catch(() => {});
  }, [orderId]);

  const generateDocument = async (type: "wz" | "invoice") => {
    setGeneratingDoc(type);
    const res = await fetch("/api/admin/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, type }),
    });
    const data = await res.json();
    if (data.success) {
      setDocuments((prev) => [...prev, data.document]);
      const printUrl = `/admin/documents/print?type=${type}&orderId=${orderId}&number=${encodeURIComponent(data.document.number)}&date=${data.document.date}`;
      window.open(printUrl, "_blank");
    }
    setGeneratingDoc(null);
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm("Dokument wirklich löschen?")) return;
    await fetch("/api/admin/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: docId }),
    });
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const deleteOrder = async () => {
    if (!confirm("Bestellung und alle zugehörigen Dokumente wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    setDeleting(true);
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId }),
    });
    router.push("/admin/orders");
  };

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });
    setOrder((prev) => prev ? { ...prev, status: status as Order["status"] } : null);
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Bestellung nicht gefunden</p>
        <Link href="/admin/orders" className="text-bs-accent text-sm mt-2 inline-block">Zurück</Link>
      </div>
    );
  }

  const tax = order.subtotal * 0.19;
  const total = order.subtotal + tax;

  return (
    <div>
      <Link href="/admin/orders" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={14} /> Zurück zu Bestellungen
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(order.date).toLocaleDateString("de-DE", {
              day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className={`appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-semibold cursor-pointer outline-none ${STATUS_COLORS[order.status]}`}
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
          </div>
          <button
            onClick={deleteOrder}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-bs-accent bg-blue-50 hover:bg-blue-100 border border-bs-accent200 transition-colors"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Löschen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Kundendaten</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-400">Firma</dt>
              <dd className="font-medium text-gray-900">{order.customer.company}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Ansprechpartner</dt>
              <dd className="font-medium text-gray-900">{order.customer.name}</dd>
            </div>
            <div>
              <dt className="text-gray-400">E-Mail</dt>
              <dd className="font-medium text-gray-900">
                <a href={`mailto:${order.customer.email}`} className="text-blue-600 hover:underline">
                  {order.customer.email}
                </a>
              </dd>
            </div>
            {order.customer.phone && (
              <div>
                <dt className="text-gray-400">Telefon</dt>
                <dd className="font-medium text-gray-900">{order.customer.phone}</dd>
              </div>
            )}
            {order.customer.taxId && (
              <div>
                <dt className="text-gray-400">USt-IdNr.</dt>
                <dd className="font-medium text-gray-900 font-mono">{order.customer.taxId}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Delivery address */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Lieferadresse</h2>
          <div className="text-sm text-gray-900 space-y-1">
            <p className="font-medium">{order.customer.company}</p>
            <p>{order.customer.address}</p>
            <p>{order.customer.zip} {order.customer.city}</p>
            <p>{order.customer.country}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Anmerkungen</h2>
          <p className="text-sm text-gray-600">
            {order.notes || "Keine Anmerkungen"}
          </p>
        </div>
      </div>

      {/* Order items */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider px-6 pt-6 mb-4">Bestellte Artikel</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 font-medium text-gray-500">Produkt</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Größe</th>
              <th className="text-center px-6 py-3 font-medium text-gray-500">Menge</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Einzelpreis</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-3 text-gray-500">{item.size}</td>
                <td className="px-6 py-3 text-center text-gray-500">{item.quantity}</td>
                <td className="px-6 py-3 text-right text-gray-500">{item.price.toFixed(2)} &euro;</td>
                <td className="px-6 py-3 text-right font-semibold text-gray-900">
                  {(item.price * item.quantity).toFixed(2)} &euro;
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-gray-200 px-6 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Zwischensumme (netto)</span>
            <span className="font-medium">{order.subtotal.toFixed(2)} &euro;</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">MwSt. (19%)</span>
            <span className="font-medium">{tax.toFixed(2)} &euro;</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Versand</span>
            <span className="font-medium text-gray-400">auf Anfrage</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Gesamt (brutto)</span>
            <span className="text-lg font-bold text-gray-900">{total.toFixed(2)} &euro;</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Dokumente</h2>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => generateDocument("wz")}
            disabled={generatingDoc === "wz"}
            className="flex items-center gap-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {generatingDoc === "wz" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            WZ erstellen
          </button>
          <button
            onClick={() => generateDocument("invoice")}
            disabled={generatingDoc === "invoice"}
            className="flex items-center gap-2 border border-gray-200 hover:border-green-300 hover:bg-green-50 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {generatingDoc === "invoice" ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            Rechnung erstellen
          </button>
        </div>
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center gap-3">
                  {doc.type === "wz" ? <FileText size={16} className="text-blue-500" /> : <Printer size={16} className="text-green-500" />}
                  <div>
                    <span className="font-medium text-gray-900">{doc.number}</span>
                    <span className="ml-2 text-gray-400">{doc.type === "wz" ? "Warenausgabe" : "Rechnung"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{doc.date}</span>
                  <button
                    onClick={() => {
                      const printUrl = `/admin/documents/print?type=${doc.type}&orderId=${orderId}&number=${encodeURIComponent(doc.number)}&date=${doc.date}`;
                      window.open(printUrl, "_blank");
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Drucken"
                  >
                    <Printer size={14} />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-bs-accent hover:bg-blue-50 rounded transition-colors"
                    title="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Noch keine Dokumente erstellt</p>
        )}
      </div>
    </div>
  );
}
