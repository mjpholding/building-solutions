"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  AlertTriangle,
  Check,
  TrendingUp,
  Upload,
  Euro,
  Calculator,
  ArrowRight,
  Globe,
} from "lucide-react";

interface PricingItem {
  name: string;
  size: number | string;
  line: "economy" | "professional";
  catalogPricePLN: number;
  pricePerLiterPLN: number | null;
  purchaseDiscountPercent: number;
  purchasePricePLN: number;
  purchasePriceEUR: number;
  marginPercent: number;
  sellPriceEUR: number;
  sellPriceOverride: number | null;
}

interface PricingConfig {
  items: PricingItem[];
  globalPurchaseDiscount: number;
  globalMargin: number;
  lastImport: string;
}

interface ExchangeRateData {
  currentRate: number;
  referenceRate: number;
  threshold: number;
  lastFetched: string;
  lastPriceUpdate: string;
  autoUpdate: boolean;
  increasePercent: number;
  thresholdExceeded: boolean;
}

export default function PricingPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [rate, setRate] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [filter, setFilter] = useState<"all" | "economy" | "professional">("all");
  const [search, setSearch] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ published: number } | null>(null);

  const fetchData = useCallback(async () => {
    const [configRes, rateRes] = await Promise.all([
      fetch("/api/admin/pricing"),
      fetch("/api/admin/exchange-rate"),
    ]);
    const configData = await configRes.json();
    const rateData = await rateRes.json();
    setConfig(configData);
    setRate(rateData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const mod = await import("@/data/purchase-prices.json");
      const products = mod.default;
      await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      await fetchData();
    } finally {
      setImporting(false);
    }
  };

  const handleGlobalUpdate = async (field: string, value: number) => {
    if (!config) return;
    setSaving(true);
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value, recalculate: true }),
    });
    await fetchData();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleItemUpdate = async (index: number, field: string, value: number | null) => {
    setSaving(true);
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateItem: { index, field, value }, recalculate: true }),
    });
    await fetchData();
    setSaving(false);
    setEditingCell(null);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishResult(null);
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishPrices: true }),
    });
    const data = await res.json();
    setPublishing(false);
    setPublishResult({ published: data.published || 0 });
    setTimeout(() => setPublishResult(null), 4000);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recalculate: true }),
    });
    await fetchData();
    setRecalculating(false);
  };

  const handleAcceptRate = async () => {
    await fetch("/api/admin/exchange-rate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acceptNewRate: true }),
    });
    // Recalculate prices with new reference rate
    await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recalculate: true }),
    });
    await fetchData();
  };

  const handleThresholdUpdate = async (threshold: number) => {
    await fetch("/api/admin/exchange-rate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threshold }),
    });
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const items = config?.items || [];
  const filteredItems = items.filter((item) => {
    const matchLine = filter === "all" || item.line === filter;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchLine && matchSearch;
  });

  // Stats
  const totalPurchaseEUR = items.reduce((s, i) => s + i.purchasePriceEUR, 0);
  const totalSellEUR = items.reduce((s, i) => s + i.sellPriceEUR, 0);
  const avgMargin = items.length > 0
    ? items.reduce((s, i) => s + i.marginPercent, 0) / items.length
    : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preiskalkulation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Einkaufspreise, Margen und Verkaufspreise verwalten
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Cennik importieren
          </button>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {recalculating ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
            Neu berechnen
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {publishing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            {publishResult ? `${publishResult.published} veröffentlicht ✓` : "Preise veröffentlichen"}
          </button>
        </div>
      </div>

      {/* Exchange Rate & Global Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Exchange Rate Card */}
        <div className={`bg-white rounded-xl border p-5 ${rate?.thresholdExceeded ? "border-amber-300 bg-amber-50" : "border-gray-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">EUR/PLN Kurs</h3>
            <Euro size={16} className="text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{rate?.currentRate?.toFixed(4) || "—"}</div>
          <div className="mt-1 text-xs text-gray-500">
            Referenz: {rate?.referenceRate?.toFixed(4) || "—"}
          </div>
          {rate && rate.increasePercent !== 0 && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${rate.increasePercent > 0 ? "text-amber-600" : "text-green-600"}`}>
              <TrendingUp size={12} />
              {rate.increasePercent > 0 ? "+" : ""}{rate.increasePercent.toFixed(2)}% vs Referenz
            </div>
          )}
          {rate?.thresholdExceeded && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-medium">
                <AlertTriangle size={14} />
                Schwellenwert überschritten!
              </div>
              <button
                onClick={handleAcceptRate}
                className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Neuen Kurs akzeptieren & Preise anpassen
              </button>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Schwelle:</label>
            <input
              type="number"
              step="1"
              min="1"
              defaultValue={rate?.threshold || 10}
              onBlur={(e) => handleThresholdUpdate(parseFloat(e.target.value) || 10)}
              className="w-16 px-2 py-1 rounded border border-gray-200 text-xs text-right focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
          {rate?.lastFetched && (
            <div className="mt-2 text-xs text-gray-400">
              Aktualisiert: {new Date(rate.lastFetched).toLocaleString("de-DE")}
            </div>
          )}
        </div>

        {/* Global Discount */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Globaler Einkaufsrabatt</h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.5"
              min="0"
              max="100"
              defaultValue={config?.globalPurchaseDiscount || 0}
              onBlur={(e) => handleGlobalUpdate("globalPurchaseDiscount", parseFloat(e.target.value) || 0)}
              className="w-24 text-2xl font-bold text-gray-900 px-3 py-1 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-right"
            />
            <span className="text-xl text-gray-400">%</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Wird auf alle Produkte ohne Einzelrabatt angewendet
          </p>
          {saving && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Speichern...</div>}
          {saved && <div className="mt-2 text-xs text-green-600 flex items-center gap-1"><Check size={12} /> Gespeichert</div>}
        </div>

        {/* Global Margin */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Globale Marge</h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              defaultValue={config?.globalMargin || 30}
              onBlur={(e) => handleGlobalUpdate("globalMargin", parseFloat(e.target.value) || 30)}
              className="w-24 text-2xl font-bold text-gray-900 px-3 py-1 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-right"
            />
            <span className="text-xl text-gray-400">%</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Wird auf alle Produkte ohne Einzelmarge angewendet
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500">Produkte</div>
          <div className="text-lg font-bold text-gray-900">{items.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500">Ø Einkauf EUR</div>
          <div className="text-lg font-bold text-gray-900">
            {items.length > 0 ? (totalPurchaseEUR / items.length).toFixed(2) : "—"} €
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500">Ø Verkauf EUR</div>
          <div className="text-lg font-bold text-gray-900">
            {items.length > 0 ? (totalSellEUR / items.length).toFixed(2) : "—"} €
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <div className="text-xs text-gray-500">Ø Marge</div>
          <div className="text-lg font-bold text-gray-900">{avgMargin.toFixed(1)}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["all", "economy", "professional"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "all" ? "Alle" : f === "economy" ? "Economy" : "Professional"}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Produkt suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500/20 outline-none"
        />
        <div className="text-xs text-gray-400 ml-auto">
          {filteredItems.length} von {items.length} Produkten
        </div>
      </div>

      {/* Items empty state */}
      {items.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Upload className="mx-auto mb-3 text-gray-300" size={40} />
          <h3 className="text-lg font-medium text-gray-700">Keine Produkte importiert</h3>
          <p className="mt-1 text-sm text-gray-500">
            Klicken Sie auf &ldquo;Cennik importieren&rdquo; um die Preisliste zu laden
          </p>
        </div>
      )}

      {/* Price table */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 font-medium">
                <th className="text-left px-3 py-2.5">Produkt</th>
                <th className="text-center px-2 py-2.5">Linie</th>
                <th className="text-right px-2 py-2.5">Größe</th>
                <th className="text-right px-2 py-2.5">Katalog PLN</th>
                <th className="text-right px-2 py-2.5">Rabatt %</th>
                <th className="text-right px-2 py-2.5">
                  <span className="flex items-center justify-end gap-1">Einkauf PLN <ArrowRight size={10} /> EUR</span>
                </th>
                <th className="text-right px-2 py-2.5">Marge %</th>
                <th className="text-right px-3 py-2.5">VK EUR</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, displayIdx) => {
                const realIdx = items.indexOf(item);
                const hasCustomDiscount = item.purchaseDiscountPercent !== (config?.globalPurchaseDiscount || 0);
                const hasCustomMargin = item.marginPercent !== (config?.globalMargin || 30);
                const hasOverride = item.sellPriceOverride != null;

                return (
                  <tr key={`${item.name}-${item.size}-${displayIdx}`} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 text-xs">{item.name}</div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        item.line === "economy" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      }`}>
                        {item.line === "economy" ? "ECO" : "PRO"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right text-gray-600">{item.size} L</td>
                    <td className="px-2 py-2 text-right text-gray-600">{item.catalogPricePLN.toFixed(2)}</td>

                    {/* Editable discount */}
                    <td className="px-2 py-2 text-right">
                      {editingCell === `disc-${realIdx}` ? (
                        <input
                          type="number"
                          step="0.5"
                          autoFocus
                          defaultValue={item.purchaseDiscountPercent}
                          onBlur={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) handleItemUpdate(realIdx, "purchaseDiscountPercent", v);
                            else setEditingCell(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                          className="w-14 px-1 py-0.5 rounded border border-red-300 text-xs text-right focus:outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingCell(`disc-${realIdx}`)}
                          className={`text-xs cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded ${
                            hasCustomDiscount ? "text-blue-600 font-medium" : "text-gray-600"
                          }`}
                        >
                          {item.purchaseDiscountPercent.toFixed(1)}
                        </button>
                      )}
                    </td>

                    {/* Purchase prices */}
                    <td className="px-2 py-2 text-right">
                      <span className="text-gray-400 text-xs">{item.purchasePricePLN.toFixed(2)}</span>
                      <span className="text-gray-300 mx-1">→</span>
                      <span className="text-gray-900 font-medium text-xs">{item.purchasePriceEUR.toFixed(2)}</span>
                    </td>

                    {/* Editable margin */}
                    <td className="px-2 py-2 text-right">
                      {editingCell === `margin-${realIdx}` ? (
                        <input
                          type="number"
                          step="0.5"
                          autoFocus
                          defaultValue={item.marginPercent}
                          onBlur={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v)) handleItemUpdate(realIdx, "marginPercent", v);
                            else setEditingCell(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            if (e.key === "Escape") setEditingCell(null);
                          }}
                          className="w-14 px-1 py-0.5 rounded border border-red-300 text-xs text-right focus:outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingCell(`margin-${realIdx}`)}
                          className={`text-xs cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded ${
                            hasCustomMargin ? "text-blue-600 font-medium" : "text-gray-600"
                          }`}
                        >
                          {item.marginPercent.toFixed(1)}
                        </button>
                      )}
                    </td>

                    {/* Sell price (editable override) */}
                    <td className="px-3 py-2 text-right">
                      {editingCell === `sell-${realIdx}` ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="0.01"
                            autoFocus
                            defaultValue={item.sellPriceOverride ?? item.sellPriceEUR}
                            onBlur={(e) => {
                              const v = parseFloat(e.target.value);
                              if (!isNaN(v)) handleItemUpdate(realIdx, "sellPriceOverride", v);
                              else setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            className="w-16 px-1 py-0.5 rounded border border-red-300 text-xs text-right focus:outline-none"
                          />
                          {hasOverride && (
                            <button
                              onClick={() => handleItemUpdate(realIdx, "sellPriceOverride", null)}
                              className="text-[10px] text-red-500 hover:text-red-700"
                              title="Override entfernen"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingCell(`sell-${realIdx}`)}
                          className={`text-xs cursor-pointer hover:bg-gray-100 px-1.5 py-0.5 rounded font-bold ${
                            hasOverride ? "text-orange-600" : "text-gray-900"
                          }`}
                        >
                          {item.sellPriceEUR.toFixed(2)} €
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-gray-400">
          <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" /> Indywiduell angepasst</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1" /> Preis manuell überschrieben</span>
          <span>Klicken Sie auf Werte um sie zu bearbeiten</span>
        </div>
      )}

      {config?.lastImport && (
        <div className="mt-3 text-xs text-gray-400">
          Letzter Import: {new Date(config.lastImport).toLocaleString("de-DE")}
        </div>
      )}
    </div>
  );
}
