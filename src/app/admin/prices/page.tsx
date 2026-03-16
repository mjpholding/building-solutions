"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, Download, Loader2, Check, AlertCircle, Save } from "lucide-react";

interface ProductPrice {
  slug: string;
  name: string;
  sizes: string[];
  prices: Record<string, number>;
}

export default function PricesAdmin() {
  const [products, setProducts] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d: ProductPrice[]) => {
        setProducts(
          d.map((p) => ({
            slug: p.slug,
            name: p.name,
            sizes: p.sizes || [],
            prices: p.prices || {},
          }))
        );
        setLoading(false);
      });
  }, []);

  const updatePrice = (slug: string, size: string, value: string) => {
    const num = parseFloat(value) || 0;
    setProducts((prev) =>
      prev.map((p) =>
        p.slug === slug ? { ...p, prices: { ...p.prices, [size]: num } } : p
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    // Fetch full products, merge prices, save
    const res = await fetch("/api/admin/products");
    const fullProducts = await res.json();

    const priceMap = new Map(products.map((p) => [p.slug, p.prices]));
    const updated = fullProducts.map((fp: ProductPrice) => ({
      ...fp,
      prices: priceMap.get(fp.slug) || fp.prices || {},
    }));

    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

      if (lines.length < 2) {
        setImportResult({ success: 0, errors: ["CSV ist leer oder hat keine Datenzeilen"] });
        return;
      }

      const header = lines[0].split(/[;,]/).map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      const slugIdx = header.findIndex((h) => h === "slug" || h === "produkt" || h === "product");
      const sizeIdx = header.findIndex((h) => h === "size" || h === "grosse" || h === "größe");
      const priceIdx = header.findIndex((h) => h === "price" || h === "preis" || h === "netto");

      if (slugIdx === -1 || priceIdx === -1) {
        setImportResult({
          success: 0,
          errors: ["CSV muss mindestens Spalten 'slug' und 'price'/'preis' enthalten"],
        });
        return;
      }

      let success = 0;
      const errors: string[] = [];

      const updatedProducts = [...products];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[;,]/).map((c) => c.trim().replace(/"/g, ""));
        const slug = cols[slugIdx];
        const size = sizeIdx >= 0 ? cols[sizeIdx] : "";
        const priceStr = cols[priceIdx]?.replace(",", ".");
        const price = parseFloat(priceStr);

        if (!slug) { errors.push(`Zeile ${i + 1}: Kein Slug`); continue; }
        if (isNaN(price)) { errors.push(`Zeile ${i + 1}: Ungueltiger Preis "${cols[priceIdx]}"`); continue; }

        const prodIdx = updatedProducts.findIndex((p) => p.slug === slug);
        if (prodIdx === -1) { errors.push(`Zeile ${i + 1}: Produkt "${slug}" nicht gefunden`); continue; }

        const sizeKey = size || updatedProducts[prodIdx].sizes[0] || "1 L";
        updatedProducts[prodIdx] = {
          ...updatedProducts[prodIdx],
          prices: { ...updatedProducts[prodIdx].prices, [sizeKey]: price },
        };
        success++;
      }

      setProducts(updatedProducts);
      setImportResult({ success, errors });
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleCSVExport = () => {
    const rows = ["slug;name;size;price"];
    products.forEach((p) => {
      if (p.sizes.length === 0) {
        rows.push(`${p.slug};${p.name};;${(p.prices["1 L"] || 0).toFixed(2)}`);
      } else {
        p.sizes.forEach((size) => {
          rows.push(`${p.slug};${p.name};${size};${(p.prices[size] || 0).toFixed(2)}`);
        });
      }
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "swish-preise.csv";
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-900">Preise</h1>
          <p className="mt-1 text-sm text-gray-500">Produktpreise verwalten und CSV importieren</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> CSV Export
          </button>
          <label className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <Upload size={16} /> CSV Import
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </div>
      </div>

      {/* Import result */}
      {importResult && (
        <div className={`mb-6 p-4 rounded-xl border text-sm ${
          importResult.errors.length === 0
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-yellow-50 border-yellow-200 text-yellow-700"
        }`}>
          <div className="flex items-center gap-2 font-medium mb-1">
            {importResult.errors.length === 0 ? <Check size={16} /> : <AlertCircle size={16} />}
            {importResult.success} Preise importiert
            {importResult.errors.length > 0 && `, ${importResult.errors.length} Fehler`}
          </div>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs">
              {importResult.errors.slice(0, 10).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {importResult.errors.length > 10 && (
                <li>...und {importResult.errors.length - 10} weitere Fehler</li>
              )}
            </ul>
          )}
          <button onClick={() => setImportResult(null)} className="mt-2 text-xs underline">Schliessen</button>
        </div>
      )}

      {/* CSV format help */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
        <p className="font-medium mb-1">CSV-Format</p>
        <p className="text-xs">
          Spalten: <code className="bg-blue-100 px-1 rounded">slug;name;size;price</code> (Trennzeichen: Semikolon oder Komma).
          Preis als Dezimalzahl (z.B. 12.50). Beispiel:
        </p>
        <pre className="mt-1 text-xs bg-blue-100 p-2 rounded">
{`slug;name;size;price
poly-lock-ultra;Poly Lock Ultra;1 L;12.90
poly-lock-ultra;Poly Lock Ultra;5 L;49.90`}
        </pre>
      </div>

      {/* Price table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-500 w-1/3">Produkt</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Preise (netto in EUR)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.slug} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{p.slug}</div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-3">
                    {(p.sizes.length > 0 ? p.sizes : ["1 L"]).map((size) => (
                      <div key={size} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-12">{size}</span>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            value={p.prices[size] || ""}
                            onChange={(e) => updatePrice(p.slug, size, e.target.value)}
                            placeholder="0.00"
                            className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm text-right"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">&euro;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
