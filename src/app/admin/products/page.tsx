"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";

interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  ph: string;
  isBestseller: boolean;
}

const CATEGORIES: Record<string, string> = {
  floors: "Boden", sanitary: "Sanitar", odor: "Geruch", special: "Spezial",
  carpets: "Teppiche", disinfection: "Desinfektion", food: "Gastronomie",
  industry: "Industrie", transport: "Transport", economy: "Economy",
  green: "Oko", dosing: "Dosierung",
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => { setProducts(d); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !catFilter || p.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, catFilter]);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Produkt "${slug}" wirklich loschen?`)) return;
    setDeleting(slug);
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    setProducts((prev) => prev.filter((p) => p.slug !== slug));
    setDeleting(null);
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
          <p className="mt-1 text-sm text-gray-500">Alle Produkte verwalten</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
            className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
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
          className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-red-500"
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
              <th className="text-right px-5 py-3 font-medium text-gray-500">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
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
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                  )}
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
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleting === p.slug ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Keine Produkte gefunden</div>
        )}
      </div>
    </div>
  );
}
