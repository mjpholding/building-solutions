"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/lib/customer-context";
import { Link } from "@/i18n/routing";
import { Loader2, ArrowLeft, ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: string;
  subtotal: number;
  items: { name: string; size: string; quantity: number; price: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Neu", processing: "In Bearbeitung", shipped: "Versendet",
  completed: "Abgeschlossen", cancelled: "Storniert",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700", completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const { customer, loading } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !customer) router.push("/konto/login");
  }, [loading, customer, router]);

  useEffect(() => {
    if (customer) {
      fetch("/api/customer/orders")
        .then((r) => r.json())
        .then((d) => { setOrders(Array.isArray(d) ? d : []); setOrdersLoading(false); })
        .catch(() => setOrdersLoading(false));
    }
  }, [customer]);

  if (loading || !customer) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-swish-gray-300" /></div>;
  }

  return (
    <div className="min-h-screen bg-swish-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/konto" className="inline-flex items-center gap-2 text-swish-gray-500 hover:text-swish-red text-sm font-medium mb-6">
          <ArrowLeft size={16} /> Zurueck zum Konto
        </Link>
        <h1 className="text-2xl font-bold text-swish-gray-900 mb-6">Meine Bestellungen</h1>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-swish-gray-300" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-swish-gray-100 p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-swish-gray-200 mb-4" />
            <p className="text-swish-gray-500">Noch keine Bestellungen vorhanden</p>
            <Link href="/produkte" className="inline-block mt-4 text-swish-red font-medium text-sm hover:underline">
              Jetzt einkaufen
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-swish-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-mono font-bold text-swish-gray-900">{order.id}</p>
                    <p className="text-xs text-swish-gray-400">
                      {new Date(order.date).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-gray-100"}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-swish-gray-600">{item.name} ({item.size}) x{item.quantity}</span>
                      <span className="font-medium">{(item.price * item.quantity).toFixed(2)} &euro;</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-swish-gray-100 pt-3 flex justify-between">
                  <span className="text-sm text-swish-gray-500">Summe (netto)</span>
                  <span className="font-bold text-swish-gray-900">{order.subtotal.toFixed(2)} &euro;</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
