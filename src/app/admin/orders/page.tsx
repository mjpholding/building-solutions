"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Eye, ChevronDown } from "lucide-react";

interface OrderItem {
  slug: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: "new" | "processing" | "shipped" | "completed" | "cancelled";
  customer: {
    company: string;
    name: string;
    email: string;
    phone: string;
    city: string;
  };
  items: OrderItem[];
  subtotal: number;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  processing: "In Bearbeitung",
  shipped: "Versendet",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { setOrders(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: status as Order["status"] } : o))
    );
    setUpdating(null);
  };

  const filtered = statusFilter
    ? orders.filter((o) => o.status === statusFilter)
    : orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bestellungen{" "}
          <span className="text-base font-normal text-gray-400">({orders.length})</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">Alle Kundenbestellungen verwalten</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !statusFilter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Alle ({orders.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label} ({counts[key] || 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Keine Bestellungen gefunden
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Bestellnr.</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Datum</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Kunde</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Artikel</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Summe (netto)</th>
                <th className="text-center px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-medium text-gray-900">{order.id}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(order.date).toLocaleDateString("de-DE", {
                      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{order.customer.company}</div>
                    <div className="text-xs text-gray-400">{order.customer.name}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {order.items.length} {order.items.length === 1 ? "Artikel" : "Artikel"}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-900">
                    {order.subtotal.toFixed(2)} &euro;
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating === order.id}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold cursor-pointer outline-none ${STATUS_COLORS[order.status]}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                    </Link>
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
