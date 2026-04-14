"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2, Loader2, X, Package } from "lucide-react";

interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  ph: string;
  isBestseller: boolean;
  sizes?: string[];
}

type StockData = Record<string, Record<string, number>>;

const CATEGORIES: Record<string, string> = {
  floors: "Boden", sanitary: "Sanitär", odor: "Geruch", special: "Spezial",
  carpets: "Teppiche", disinfection: "Desinfektion", food: "Gastronomie",
  industry: "Industrie", transport: "Transport", economy: "Economy",
  green: "Öko", dosing: "Dosierung",
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<StockData>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [savingStock, setSavingStock] = useState(false);

  const fetchData = useCallback(async () => {
    const [prodRes, stockRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/stock"),
    ]);
    setProducts(await prodRes.json());
    setStock(await stockRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || p.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Produkt "${slug}" wirklich löschen?`)) return;
    setDeleting(slug);
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
    setDeleting(null);
  };

  const openStockEditor = (slug: string, sizes: string[]) => {
    setEditingStock(slug);
    const existing = stock[slug] || {};
    const inputs: Record<string, string> = {};
    sizes.forEach((s) => { inputs[s] = String(existing[s] ?? 0); });
    setStockInputs(inputs);
  };

  const saveStock = async () => {
    if (!editingStock) return;
    setSavingStock(true);
    for (const [size, qty] of Object.entries(stockInputs)) {
      await fetch("/api/admin/stock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: editingStock, size, quantity: parseInt(qty) || 0 }),
      });
    }
    const res = await fetch("/api/admin/stock");
    setStock(await res.json());
    setSavingStock(false);
    setEditingStock(null);
  };

  const getTotalStock = (slug: string): number => {
    const s = stock[slug];
    if (!s) return 0;
    return Object.values(s).reduce((sum, v) => sum + v, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Produkte{" "}
            <span className="text-base font-normal text-gray-400">({products.length})</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">Produkte und Lagerbestand verwalten</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Neues Produkt
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-bs-accent500"
        >
          <option value="">Alle Kategorien</option>
          {Object.entries(CATEGORIES).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Kategorie</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">pH</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Bestseller</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Bestand</th>
              <th className="text-right px-5 py-3 font-medium text-gray-500">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const total = getTotalStock(p.slug);
              return (
                <tr key={p.slug} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3 text-gray-500">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {CATEGORIES[p.category] || p.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{p.ph}</td>
                  <td className="px-5 py-3 text-center">
                    {p.isBestseller && (
                      <span className="inline-block w-2 h-2 bg-bs-accent rounded-full" />
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => openStockEditor(p.slug, p.sizes || [])}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        total > 0
                          ? total < 5
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <Package size={12} />
                      {total > 0 ? total : "—"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.slug}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.slug)}
                        disabled={deleting === p.slug}
                        className="p-2 text-gray-400 hover:text-bs-accent hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleting === p.slug ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Keine Produkte gefunden</div>
        )}
      </div>

      {/* Stock editor modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setEditingStock(null)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} className="text-gray-400" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Lagerbestand</h2>
            <p className="text-sm text-gray-500 mb-4">{editingStock}</p>

            {Object.keys(stockInputs).length === 0 ? (
              <p className="text-sm text-gray-400 py-4">
                Keine Gebindegrößen definiert. Bearbeiten Sie zuerst das Produkt.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stockInputs).map(([size, qty]) => (
                  <div key={size} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-20">{size}</span>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => setStockInputs((prev) => ({ ...prev, [size]: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm text-center"
                    />
                    <span className="text-xs text-gray-400">Stk.</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={saveStock}
              disabled={savingStock || Object.keys(stockInputs).length === 0}
              className="mt-4 w-full py-2.5 bg-bs-accent hover:bg-bs-accent-dark disabled:bg-gray-300 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {savingStock && <Loader2 size={16} className="animate-spin" />}
              Speichern
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
