"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Building2, User, Pencil, Trash2, X, Save, Check } from "lucide-react";

interface Customer {
  id: string;
  type: "b2b" | "b2c";
  company: string;
  name: string;
  email: string;
  phone: string;
  discountPercent: number;
  loyaltyPoints: number;
  createdAt: string;
}

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editPoints, setEditPoints] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => { setCustomers(d); setLoading(false); });
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (c: Customer) => {
    setEditing(c.id);
    setEditDiscount(c.discountPercent);
    setEditPoints(c.loyaltyPoints);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    await fetch("/api/admin/customers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, discountPercent: editDiscount, loyaltyPoints: editPoints }),
    });
    setCustomers((prev) =>
      prev.map((c) => c.id === id ? { ...c, discountPercent: editDiscount, loyaltyPoints: editPoints } : c)
    );
    setEditing(null);
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Kunde "${name}" wirklich loschen?`)) return;
    await fetch("/api/admin/customers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Kunden <span className="text-base font-normal text-gray-400">({customers.length})</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">Registrierte Kunden verwalten, Rabatte und Treuepunkte zuweisen</p>
      </div>

      <div className="relative max-w-xs mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suchen..."
          className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-500">Kunde</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Typ</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">E-Mail</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Rabatt</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Punkte</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Registriert</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{c.company || c.name}</div>
                  {c.company && <div className="text-xs text-gray-400">{c.name}</div>}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    c.type === "b2b" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                  }`}>
                    {c.type === "b2b" ? <Building2 size={10} /> : <User size={10} />}
                    {c.type === "b2b" ? "B2B" : "B2C"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{c.email}</td>
                <td className="px-5 py-3 text-center">
                  {editing === c.id ? (
                    <input
                      type="number"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border rounded text-center text-sm"
                      min={0}
                      max={100}
                    />
                  ) : (
                    <span className={`font-semibold ${c.discountPercent > 0 ? "text-green-600" : "text-gray-400"}`}>
                      {c.discountPercent}%
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  {editing === c.id ? (
                    <input
                      type="number"
                      value={editPoints}
                      onChange={(e) => setEditPoints(parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border rounded text-center text-sm"
                      min={0}
                    />
                  ) : (
                    <span className="font-medium text-gray-600">{c.loyaltyPoints}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("de-DE")}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editing === c.id ? (
                      <>
                        <button onClick={() => saveEdit(c.id)} disabled={saving}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        </button>
                        <button onClick={() => setEditing(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Keine Kunden gefunden</div>
        )}
      </div>
    </div>
  );
}
