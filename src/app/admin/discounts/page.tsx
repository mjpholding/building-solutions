"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Check, X } from "lucide-react";

interface Discount {
  id: string;
  name: string;
  type: "percentage" | "fixed" | "free_shipping";
  code: string;
  value: number;
  minOrderValue: number;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  percentage: "Prozent", fixed: "Festbetrag", free_shipping: "Gratis Versand",
};

export default function DiscountsAdmin() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", type: "percentage" as "percentage" | "fixed" | "free_shipping", code: "", value: 0, minOrderValue: 0, validUntil: "", usageLimit: 0 });

  useEffect(() => {
    fetch("/api/admin/discounts")
      .then((r) => r.json())
      .then((d) => { setDiscounts(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const handleCreate = async () => {
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      setDiscounts((prev) => [...prev, data.discount]);
      setShowNew(false);
      setForm({ name: "", type: "percentage", code: "", value: 0, minOrderValue: 0, validUntil: "", usageLimit: 0 });
    }
  };

  const toggleActive = async (d: Discount) => {
    await fetch("/api/admin/discounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: d.id, active: !d.active }),
    });
    setDiscounts((prev) => prev.map((x) => x.id === d.id ? { ...x, active: !x.active } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Rabatt wirklich loschen?")) return;
    await fetch("/api/admin/discounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rabatte & Gutscheine</h1>
          <p className="mt-1 text-sm text-gray-500">Rabattcodes und Aktionen verwalten</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Neuer Rabatt
        </button>
      </div>

      {/* New discount form */}
      {showNew && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Neuen Rabatt erstellen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="z.B. Fruehbucher 10%" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-bs-accent500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Discount["type"] })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-bs-accent500">
                <option value="percentage">Prozent (%)</option>
                <option value="fixed">Festbetrag (EUR)</option>
                <option value="free_shipping">Gratis Versand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SWISH10" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-bs-accent500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wert</label>
              <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-bs-accent500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mindestbestellwert</label>
              <input type="number" step="0.01" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-bs-accent500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gueltig bis</label>
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-bs-accent500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium">
              <Check size={16} /> Erstellen
            </button>
            <button onClick={() => setShowNew(false)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium">
              <X size={16} /> Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Discounts list */}
      {discounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Keine Rabatte vorhanden
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Code</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Typ</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Wert</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Nutzung</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Aktiv</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-600">{d.code || "-"}</td>
                  <td className="px-5 py-3 text-gray-500">{TYPE_LABELS[d.type]}</td>
                  <td className="px-5 py-3 text-center font-semibold">
                    {d.type === "percentage" ? `${d.value}%` : d.type === "fixed" ? `${d.value.toFixed(2)} EUR` : "-"}
                  </td>
                  <td className="px-5 py-3 text-center text-gray-500">
                    {d.usageCount}{d.usageLimit > 0 ? ` / ${d.usageLimit}` : ""}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => toggleActive(d)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${d.active ? "bg-green-500" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${d.active ? "left-5" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(d.id)} className="p-2 text-gray-400 hover:text-bs-accent hover:bg-blue-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
