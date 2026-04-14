"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Eye, ShoppingCart, Compass, TrendingUp,
  ArrowUpRight, Loader2, Calendar
} from "lucide-react";

interface AnalyticsData {
  period: { days: number; from: string | null; to: string | null };
  totals: {
    pageViews: number;
    cartAdds: number;
    advisorStarts: number;
    advisorCompletes: number;
    advisorToCart: number;
    advisorConversion: number;
  };
  topPages: [string, number][];
  topCartProducts: [string, number][];
  topAdvisorCategories: [string, number][];
  dailyData: Record<string, {
    pageViews: number;
    cartAdds: number;
    advisorStarts: number;
    advisorCompletes: number;
    advisorToCart: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) return <p className="text-gray-500 p-8">Keine Daten verfügbar.</p>;

  const { totals, topPages, topCartProducts, topAdvisorCategories, dailyData } = data;

  // Build chart data (last N days)
  const chartDays = Object.entries(dailyData).sort((a, b) => a[0].localeCompare(b[0]));
  const maxViews = Math.max(...chartDays.map(([, d]) => d.pageViews), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-bs-accent" size={28} />
            Analytik
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Website-Statistiken & Produktberater-Nutzung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-bs-accent500"
          >
            <option value={7}>Letzte 7 Tage</option>
            <option value={14}>Letzte 14 Tage</option>
            <option value={30}>Letzte 30 Tage</option>
            <option value={90}>Letzte 90 Tage</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Eye}
          label="Seitenaufrufe"
          value={totals.pageViews}
          color="blue"
        />
        <KPICard
          icon={ShoppingCart}
          label="In den Warenkorb"
          value={totals.cartAdds}
          color="green"
        />
        <KPICard
          icon={Compass}
          label="Produktberater gestartet"
          value={totals.advisorStarts}
          color="purple"
        />
        <KPICard
          icon={TrendingUp}
          label="Berater → Warenkorb"
          value={`${totals.advisorConversion}%`}
          subtitle={`${totals.advisorToCart} von ${totals.advisorStarts}`}
          color="red"
        />
      </div>

      {/* Chart — Page Views per Day */}
      {chartDays.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Seitenaufrufe pro Tag</h2>
          <div className="flex items-end gap-1 h-40">
            {chartDays.map(([date, d]) => {
              const height = Math.max((d.pageViews / maxViews) * 100, 2);
              const shortDate = date.slice(5); // MM-DD
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-default min-w-[4px]"
                    style={{ height: `${height}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {date}: {d.pageViews} Aufrufe, {d.cartAdds} Warenkorb
                  </div>
                  {chartDays.length <= 14 && (
                    <span className="text-[10px] text-gray-400 rotate-0">{shortDate}</span>
                  )}
                </div>
              );
            })}
          </div>
          {chartDays.length > 14 && (
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{chartDays[0][0]}</span>
              <span>{chartDays[chartDays.length - 1][0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye size={18} className="text-blue-500" />
            Meistbesuchte Seiten
          </h2>
          {topPages.length === 0 ? (
            <p className="text-gray-400 text-sm">Noch keine Daten</p>
          ) : (
            <div className="space-y-2">
              {topPages.map(([path, count]) => {
                const pct = Math.round((count / (topPages[0]?.[1] || 1)) * 100);
                return (
                  <div key={path} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate">{path}</span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Cart Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart size={18} className="text-green-500" />
            Beliebteste Produkte (Warenkorb)
          </h2>
          {topCartProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">Noch keine Daten</p>
          ) : (
            <div className="space-y-2">
              {topCartProducts.map(([product, count]) => {
                const pct = Math.round((count / (topCartProducts[0]?.[1] || 1)) * 100);
                return (
                  <div key={product} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate">{product}</span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{count}×</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Advisor Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Compass size={18} className="text-purple-500" />
          Produktberater — Häufigste Kombinationen
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Format: Oberfläche / Raum / Verschmutzung / Intensität
        </p>
        {topAdvisorCategories.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Daten</p>
        ) : (
          <div className="space-y-2">
            {topAdvisorCategories.map(([cat, count]) => {
              const pct = Math.round((count / (topAdvisorCategories[0]?.[1] || 1)) * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 font-mono truncate">{cat}</span>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{count}×</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Advisor Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ArrowUpRight size={18} className="text-bs-accent" />
          Produktberater-Trichter
        </h2>
        <div className="flex items-center gap-4 flex-wrap">
          <FunnelStep label="Gestartet" value={totals.advisorStarts} color="bg-purple-100 text-purple-700" />
          <span className="text-gray-300">→</span>
          <FunnelStep label="Ergebnis erhalten" value={totals.advisorCompletes} color="bg-blue-100 text-blue-700" />
          <span className="text-gray-300">→</span>
          <FunnelStep label="In Warenkorb" value={totals.advisorToCart} color="bg-green-100 text-green-700" />
          <span className="text-gray-300">=</span>
          <FunnelStep label="Conversion" value={`${totals.advisorConversion}%`} color="bg-blue-100 text-bs-accent-dark" />
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  subtitle?: string;
  color: "blue" | "green" | "purple" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-blue-50 text-bs-accent",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString("de-DE") : value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function FunnelStep({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className={`px-4 py-3 rounded-lg ${color} text-center`}>
      <p className="text-lg font-bold">{typeof value === "number" ? value.toLocaleString("de-DE") : value}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </div>
  );
}
