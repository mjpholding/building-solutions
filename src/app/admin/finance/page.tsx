"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Plus,
  Trash2,
  X,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "purchase" | "sale";
  date: string;
  description: string;
  amount: number;
  currency: "EUR" | "PLN";
  exchangeRate?: number;
  amountEUR?: number;
  note?: string;
  createdAt: string;
}

interface ExchangeRateData {
  currentRate: number;
  referenceRate: number;
  threshold: number;
  increasePercent: number;
  thresholdExceeded: boolean;
  lastFetched: string;
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm";

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rate, setRate] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "purchase" | "sale">("all");

  const [form, setForm] = useState({
    type: "purchase" as "purchase" | "sale",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    amount: "",
    currency: "EUR" as "EUR" | "PLN",
    exchangeRate: "",
    note: "",
  });

  const fetchData = useCallback(async () => {
    const [txRes, rateRes] = await Promise.all([
      fetch("/api/admin/transactions"),
      fetch("/api/admin/exchange-rate"),
    ]);
    const txData = await txRes.json();
    setTransactions(txData.transactions || []);
    setRate(await rateRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          exchangeRate: form.currency === "PLN" && form.exchangeRate
            ? parseFloat(form.exchangeRate)
            : undefined,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          type: "purchase",
          date: new Date().toISOString().slice(0, 10),
          description: "",
          amount: "",
          currency: "EUR",
          exchangeRate: "",
          note: "",
        });
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Transaktion wirklich löschen?")) return;
    await fetch("/api/admin/transactions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Calculations from real transactions
  const purchases = transactions.filter((t) => t.type === "purchase");
  const sales = transactions.filter((t) => t.type === "sale");

  const totalPurchaseEUR = purchases.reduce((s, t) => s + (t.amountEUR ?? t.amount), 0);
  const totalSaleEUR = sales.reduce((s, t) => s + (t.amountEUR ?? t.amount), 0);
  const totalProfitEUR = totalSaleEUR - totalPurchaseEUR;
  const marginPercent = totalPurchaseEUR > 0
    ? ((totalSaleEUR - totalPurchaseEUR) / totalPurchaseEUR) * 100
    : 0;

  const filteredTx = filter === "all"
    ? transactions
    : transactions.filter((t) => t.type === filter);

  const sortedTx = [...filteredTx].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzen</h1>
          <p className="mt-1 text-sm text-gray-500">
            Einkäufe, Verkäufe und Gewinnübersicht
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Transaktion
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Einkäufe gesamt</span>
            <ShoppingCart size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalPurchaseEUR.toFixed(2)} &euro;</div>
          <div className="text-xs text-gray-400 mt-1">{purchases.length} Transaktionen</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Verkäufe gesamt</span>
            <DollarSign size={16} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalSaleEUR.toFixed(2)} &euro;</div>
          <div className="text-xs text-gray-400 mt-1">{sales.length} Transaktionen</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Gewinn</span>
            {totalProfitEUR >= 0 ? (
              <TrendingUp size={16} className="text-emerald-400" />
            ) : (
              <TrendingDown size={16} className="text-red-400" />
            )}
          </div>
          <div className={`text-2xl font-bold ${totalProfitEUR >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalProfitEUR >= 0 ? "+" : ""}{totalProfitEUR.toFixed(2)} &euro;
          </div>
          <div className="text-xs text-gray-400 mt-1">Marge: {marginPercent.toFixed(1)}%</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Wechselkurs</span>
            <BarChart3 size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {rate ? rate.currentRate.toFixed(4) : "—"}
          </div>
          <div className="text-xs text-gray-400 mt-1">EUR/PLN (NBP)</div>
        </div>
      </div>

      {/* Exchange rate detail */}
      {rate && rate.thresholdExceeded && (
        <div className="rounded-xl border bg-amber-50 border-amber-300 p-4 mb-6">
          <p className="text-sm text-amber-700 font-medium">
            Kurs ist über {rate.threshold}% gestiegen (Referenz: {rate.referenceRate.toFixed(4)}, aktuell: {rate.currentRate.toFixed(4)}, +{rate.increasePercent.toFixed(2)}%) — Preisanpassung empfohlen!
          </p>
        </div>
      )}

      {/* Transaction form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} className="text-gray-400" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Neue Transaktion</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "purchase" | "sale" })}
                    className={inputClass}
                  >
                    <option value="purchase">Einkauf</option>
                    <option value="sale">Verkauf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  placeholder="z.B. Einkauf Swish Polska - Rechnung 2024/03"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Betrag</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={inputClass}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Währung</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value as "EUR" | "PLN" })}
                    className={inputClass}
                  >
                    <option value="EUR">EUR</option>
                    <option value="PLN">PLN</option>
                  </select>
                </div>
              </div>

              {form.currency === "PLN" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kurs EUR/PLN
                    {rate && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, exchangeRate: rate.currentRate.toFixed(4) })}
                        className="ml-2 text-xs text-red-600 hover:underline"
                      >
                        NBP aktuell ({rate.currentRate.toFixed(4)})
                      </button>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.exchangeRate}
                    onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })}
                    className={inputClass}
                    placeholder="4.2500"
                    required
                  />
                  {form.amount && form.exchangeRate && (
                    <p className="text-xs text-gray-400 mt-1">
                      = {(parseFloat(form.amount) / parseFloat(form.exchangeRate)).toFixed(2)} EUR
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notiz (optional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className={inputClass}
                  placeholder="Zusätzliche Informationen..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Transaktion speichern
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Transaktionen</h3>
          <div className="flex gap-1">
            {(["all", "purchase", "sale"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {f === "all" ? "Alle" : f === "purchase" ? "Einkäufe" : "Verkäufe"}
              </button>
            ))}
          </div>
        </div>

        {sortedTx.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="mx-auto mb-3 text-gray-300" size={36} />
            <p className="text-sm text-gray-500">Noch keine Transaktionen vorhanden</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-red-600 hover:underline font-medium"
            >
              Erste Transaktion erfassen
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedTx.map((tx) => (
              <div key={tx.id} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.type === "purchase" ? "bg-blue-50" : "bg-green-50"
                }`}>
                  {tx.type === "purchase" ? (
                    <ShoppingCart size={14} className="text-blue-500" />
                  ) : (
                    <DollarSign size={14} className="text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {tx.description}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      tx.type === "purchase"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-green-50 text-green-600"
                    }`}>
                      {tx.type === "purchase" ? "Einkauf" : "Verkauf"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(tx.date).toLocaleDateString("de-DE")}
                    {tx.note && <span className="ml-2">— {tx.note}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold ${
                    tx.type === "purchase" ? "text-blue-600" : "text-green-600"
                  }`}>
                    {tx.type === "purchase" ? "-" : "+"}{(tx.amountEUR ?? tx.amount).toFixed(2)} &euro;
                  </div>
                  {tx.currency === "PLN" && (
                    <div className="text-[10px] text-gray-400">
                      {tx.amount.toFixed(2)} PLN @ {tx.exchangeRate?.toFixed(4)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
