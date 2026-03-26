"use client";

import { useEffect, useState } from "react";
import {
  FileText, Plus, Loader2, Eye, Trash2, Send, Check, X,
  Search, ChevronDown
} from "lucide-react";

interface Product {
  slug: string;
  name: string;
  prices?: Record<string, number>;
  sizes?: string[];
}

interface OfferItem {
  productName: string;
  productSlug: string;
  size: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalNet: number;
}

interface OfferSummary {
  id: string;
  number: string;
  date: string;
  status: string;
  customerName: string;
  customerCompany: string;
  totalGross: number;
  itemCount: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-100 text-blue-600",
  accepted: "bg-green-100 text-green-600",
  rejected: "bg-red-100 text-red-600",
};
const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Gesendet",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
};

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OfferItem[]>([]);

  // Product search
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductList, setShowProductList] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/offers").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([offersData, productsData]) => {
      if (Array.isArray(offersData)) setOffers(offersData);
      if (Array.isArray(productsData)) setProducts(productsData);
      setLoading(false);
    });
  }, []);

  function addProduct(product: Product) {
    const size = product.sizes?.[0] || "";
    const price = product.prices?.[size] || 0;
    setItems((prev) => [
      ...prev,
      {
        productName: product.name,
        productSlug: product.slug,
        size,
        quantity: 1,
        unitPrice: price,
        discount: 0,
        totalNet: price,
      },
    ]);
    setShowProductList(false);
    setSearchQuery("");
  }

  function updateItem(index: number, field: string, value: number | string) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // Recalculate total
        const net = updated.unitPrice * updated.quantity;
        updated.totalNet = Math.round(net * (1 - updated.discount / 100) * 100) / 100;
        return updated;
      })
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotalNet = items.reduce((sum, item) => sum + item.totalNet, 0);
  const vatAmount = Math.round(subtotalNet * 0.19 * 100) / 100;
  const totalGross = Math.round((subtotalNet + vatAmount) * 100) / 100;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName, customerCompany, customerEmail, customerPhone, customerAddress,
          validUntil, notes, items,
        }),
      });
      const offer = await res.json();
      setOffers((prev) => [{ ...offer, itemCount: items.length }, ...prev]);
      // Reset form
      setShowForm(false);
      setCustomerName(""); setCustomerCompany(""); setCustomerEmail("");
      setCustomerPhone(""); setCustomerAddress(""); setValidUntil("");
      setNotes(""); setItems([]);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch("/api/admin/offers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-red-600" size={28} />
            Angebote
          </h1>
          <p className="text-gray-500 text-sm mt-1">Angebote erstellen und verwalten</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium text-sm"
        >
          <Plus size={16} />
          Neues Angebot
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900 text-lg">Neues Angebot erstellen</h2>

          {/* Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <input value={customerCompany} onChange={(e) => setCustomerCompany(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Firma GmbH" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ansprechpartner</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Max Mustermann" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Straße, PLZ Ort" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gültig bis</label>
              <input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Produkte</label>
              <div className="relative">
                <button
                  onClick={() => setShowProductList(!showProductList)}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Plus size={14} /> Produkt hinzufügen <ChevronDown size={14} />
                </button>

                {showProductList && (
                  <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-80 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg"
                          placeholder="Produkt suchen..."
                          autoFocus
                        />
                      </div>
                    </div>
                    {filteredProducts.slice(0, 20).map((p) => (
                      <button
                        key={p.slug}
                        onClick={() => addProduct(p)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between items-center"
                      >
                        <span>{p.name}</span>
                        {p.sizes && <span className="text-xs text-gray-400">{p.sizes.length} Größen</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2">Produkt</th>
                    <th className="pb-2 w-24">Größe</th>
                    <th className="pb-2 w-16">Menge</th>
                    <th className="pb-2 w-24">Einzelpreis</th>
                    <th className="pb-2 w-16">Rabatt %</th>
                    <th className="pb-2 w-24 text-right">Gesamt</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const product = products.find((p) => p.slug === item.productSlug);
                    return (
                      <tr key={i} className="border-b">
                        <td className="py-2 font-medium">{item.productName}</td>
                        <td className="py-2">
                          <select
                            value={item.size}
                            onChange={(e) => {
                              const newSize = e.target.value;
                              const newPrice = product?.prices?.[newSize] || item.unitPrice;
                              updateItem(i, "size", newSize);
                              updateItem(i, "unitPrice", newPrice);
                            }}
                            className="w-full border rounded px-1 py-1 text-xs"
                          >
                            {(product?.sizes || [item.size]).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2">
                          <input type="number" min="1" value={item.quantity}
                            onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                            className="w-full border rounded px-2 py-1 text-xs text-center" />
                        </td>
                        <td className="py-2">
                          <input type="number" step="0.01" value={item.unitPrice}
                            onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                            className="w-full border rounded px-2 py-1 text-xs text-right" />
                        </td>
                        <td className="py-2">
                          <input type="number" min="0" max="100" value={item.discount}
                            onChange={(e) => updateItem(i, "discount", parseFloat(e.target.value) || 0)}
                            className="w-full border rounded px-2 py-1 text-xs text-center" />
                        </td>
                        <td className="py-2 text-right font-medium">{item.totalNet.toFixed(2)} €</td>
                        <td className="py-2">
                          <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-600">
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {items.length === 0 && (
              <p className="text-gray-400 text-sm py-4 text-center">Noch keine Produkte hinzugefügt</p>
            )}

            {/* Totals */}
            {items.length > 0 && (
              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Zwischensumme netto:</span>
                    <span>{subtotalNet.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>MwSt. 19%:</span>
                    <span>{vatAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-red-600 pt-2 border-t">
                    <span>Gesamt brutto:</span>
                    <span>{totalGross.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anmerkungen</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Zahlungsbedingungen, Lieferzeit, etc." />
          </div>

          {/* Save */}
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Abbrechen
            </button>
            <button onClick={handleSave} disabled={saving || items.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? "Wird gespeichert..." : "Angebot speichern"}
            </button>
          </div>
        </div>
      )}

      {/* Offers list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Alle Angebote ({offers.length})</h2>
        </div>
        {offers.length === 0 ? (
          <p className="text-gray-400 text-sm p-8 text-center">Noch keine Angebote erstellt</p>
        ) : (
          <div className="divide-y">
            {offers.map((offer) => (
              <div key={offer.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{offer.number}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[offer.status] || ""}`}>
                      {statusLabels[offer.status] || offer.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {offer.customerCompany || offer.customerName} · {offer.itemCount} Produkte · {offer.totalGross?.toFixed(2)} € brutto
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <select
                    value={offer.status}
                    onChange={(e) => handleStatusChange(offer.id, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="draft">Entwurf</option>
                    <option value="sent">Gesendet</option>
                    <option value="accepted">Angenommen</option>
                    <option value="rejected">Abgelehnt</option>
                  </select>
                  <button onClick={() => window.open(`/api/admin/offers/view?id=${offer.id}`, "_blank")}
                    className="p-1.5 text-gray-400 hover:text-blue-600" title="Vorschau">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => handleDelete(offer.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600" title="Löschen">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
