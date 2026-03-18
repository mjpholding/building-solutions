"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Package,
} from "lucide-react";

interface PricingItem {
  name: string;
  size: number | string;
  line: "economy" | "professional";
  catalogPricePLN: number;
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
  increasePercent: number;
  thresholdExceeded: boolean;
  lastFetched: string;
}

export default function FinancePage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [rate, setRate] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [configRes, rateRes] = await Promise.all([
      fetch("/api/admin/pricing"),
      fetch("/api/admin/exchange-rate"),
    ]);
    setConfig(await configRes.json());
    setRate(await rateRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const items = config?.items || [];
  const ecoItems = items.filter((i) => i.line === "economy");
  const proItems = items.filter((i) => i.line === "professional");

  // Calculations
  const totalCatalogPLN = items.reduce((s, i) => s + i.catalogPricePLN, 0);
  const totalPurchasePLN = items.reduce((s, i) => s + i.purchasePricePLN, 0);
  const totalPurchaseEUR = items.reduce((s, i) => s + i.purchasePriceEUR, 0);
  const totalSellEUR = items.reduce((s, i) => s + i.sellPriceEUR, 0);
  const totalProfitEUR = totalSellEUR - totalPurchaseEUR;
  const avgMarginPercent = items.length > 0
    ? ((totalSellEUR - totalPurchaseEUR) / totalPurchaseEUR) * 100
    : 0;
  const totalDiscountSavedPLN = totalCatalogPLN - totalPurchasePLN;

  const ecoPurchase = ecoItems.reduce((s, i) => s + i.purchasePriceEUR, 0);
  const ecoSell = ecoItems.reduce((s, i) => s + i.sellPriceEUR, 0);
  const proPurchase = proItems.reduce((s, i) => s + i.purchasePriceEUR, 0);
  const proSell = proItems.reduce((s, i) => s + i.sellPriceEUR, 0);

  // Top margin products
  const byMarginValue = [...items]
    .map((i) => ({ ...i, profitEUR: i.sellPriceEUR - i.purchasePriceEUR }))
    .sort((a, b) => b.profitEUR - a.profitEUR)
    .slice(0, 10);

  // Lowest margin products
  const lowestMargin = [...items]
    .sort((a, b) => a.marginPercent - b.marginPercent)
    .slice(0, 5);

  const StatCard = ({ label, value, sub, icon: Icon, color = "gray" }: {
    label: string; value: string; sub?: string; icon: React.ElementType; color?: string;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <Icon size={16} className={`text-${color}-400`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finanzen</h1>
        <p className="mt-1 text-sm text-gray-500">
          Übersicht über Kosten, Margen und Gewinn
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <BarChart3 className="mx-auto mb-3 text-gray-300" size={40} />
          <h3 className="text-lg font-medium text-gray-700">Keine Daten verfügbar</h3>
          <p className="mt-1 text-sm text-gray-500">
            Importieren Sie zuerst die Preisliste unter &ldquo;Preise&rdquo;
          </p>
        </div>
      ) : (
        <>
          {/* Main KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Gesamteinkauf (EUR)"
              value={`${totalPurchaseEUR.toFixed(2)} €`}
              sub={`${totalPurchasePLN.toFixed(2)} PLN`}
              icon={ShoppingCart}
              color="blue"
            />
            <StatCard
              label="Gesamtverkauf (EUR)"
              value={`${totalSellEUR.toFixed(2)} €`}
              sub={`${items.length} Produkte`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              label="Rohgewinn (EUR)"
              value={`${totalProfitEUR.toFixed(2)} €`}
              sub={`Ø ${avgMarginPercent.toFixed(1)}% Marge`}
              icon={TrendingUp}
              color="emerald"
            />
            <StatCard
              label="Rabatt-Ersparnis (PLN)"
              value={`${totalDiscountSavedPLN.toFixed(2)} zł`}
              sub={`vs. Katalogpreise`}
              icon={TrendingDown}
              color="purple"
            />
          </div>

          {/* Line comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Economy Line
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Produkte</span>
                  <span className="font-medium">{ecoItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Einkauf (EUR)</span>
                  <span className="font-medium">{ecoPurchase.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Verkauf (EUR)</span>
                  <span className="font-medium">{ecoSell.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-500 font-medium">Gewinn</span>
                  <span className="font-bold text-green-600">{(ecoSell - ecoPurchase).toFixed(2)} €</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ecoPurchase > 0 ? ((ecoSell - ecoPurchase) / ecoPurchase) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Professional Line
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Produkte</span>
                  <span className="font-medium">{proItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Einkauf (EUR)</span>
                  <span className="font-medium">{proPurchase.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Verkauf (EUR)</span>
                  <span className="font-medium">{proSell.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-500 font-medium">Gewinn</span>
                  <span className="font-bold text-green-600">{(proSell - proPurchase).toFixed(2)} €</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, proPurchase > 0 ? ((proSell - proPurchase) / proPurchase) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exchange rate info */}
          {rate && (
            <div className={`rounded-xl border p-5 mb-6 ${rate.thresholdExceeded ? "bg-amber-50 border-amber-300" : "bg-white border-gray-200"}`}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Wechselkurs EUR/PLN</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-400">Aktuell (NBP)</div>
                  <div className="text-lg font-bold">{rate.currentRate.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Referenz</div>
                  <div className="text-lg font-bold">{rate.referenceRate.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Änderung</div>
                  <div className={`text-lg font-bold ${rate.increasePercent > 0 ? "text-amber-600" : rate.increasePercent < 0 ? "text-green-600" : ""}`}>
                    {rate.increasePercent > 0 ? "+" : ""}{rate.increasePercent.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Schwelle</div>
                  <div className="text-lg font-bold">{rate.threshold}%</div>
                </div>
              </div>
              {rate.thresholdExceeded && (
                <div className="mt-3 p-2 bg-amber-100 rounded-lg text-xs text-amber-700 font-medium">
                  ⚠ Kurs ist über {rate.threshold}% gestiegen — Preisanpassung empfohlen!
                </div>
              )}
            </div>
          )}

          {/* Top profit products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-green-500" /> Top 10 Gewinn (EUR pro Stück)
              </h3>
              <div className="space-y-2">
                {byMarginValue.map((item, i) => (
                  <div key={`${item.name}-${item.size}-${i}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs text-gray-400 w-4 text-right">{i + 1}.</span>
                      <span className="truncate text-gray-700">{item.name}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{item.size}L</span>
                    </div>
                    <span className="font-medium text-green-600 flex-shrink-0 ml-2">
                      +{item.profitEUR.toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <TrendingDown size={14} className="text-red-500" /> Niedrigste Marge (%)
              </h3>
              <div className="space-y-2">
                {lowestMargin.map((item, i) => (
                  <div key={`${item.name}-${item.size}-${i}`} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs text-gray-400 w-4 text-right">{i + 1}.</span>
                      <span className="truncate text-gray-700">{item.name}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{item.size}L</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`font-medium ${item.marginPercent < 15 ? "text-red-600" : "text-amber-600"}`}>
                        {item.marginPercent.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-400">
                        ({(item.sellPriceEUR - item.purchasePriceEUR).toFixed(2)} €)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
