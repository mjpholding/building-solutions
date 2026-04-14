"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import { Package, User, LogOut, Loader2, ShoppingBag, Award, Building2 } from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: string;
  subtotal: number;
  items: { name: string; quantity: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  new: "Neu", processing: "In Bearbeitung", shipped: "Versendet",
  completed: "Abgeschlossen", cancelled: "Storniert",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700", completed: "bg-green-100 text-green-700",
  cancelled: "bg-blue-100 text-bs-accent-dark",
};

export default function AccountPage() {
  const router = useRouter();
  const t = useTranslations("account");
  const locale = useLocale();
  const { customer, loading, logout } = useCustomer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/konto/login");
    }
  }, [loading, customer, router]);

  useEffect(() => {
    if (customer) {
      fetch("/api/customer/orders")
        .then((r) => r.json())
        .then((d) => { setOrders(Array.isArray(d) ? d : []); setOrdersLoading(false); })
        .catch(() => setOrdersLoading(false));
    }
  }, [customer]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bs-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bs-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-bs-gray-900">{t("myAccount")}</h1>
            <p className="mt-1 text-bs-gray-500">
              {t("welcomeBack", { name: customer.name })}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-bs-gray-500 hover:text-bs-accent text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> {t("logout")}
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-bs-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                {customer.type === "b2b" ? <Building2 size={18} className="text-blue-600" /> : <User size={18} className="text-blue-600" />}
              </div>
              <div>
                <p className="text-xs text-bs-gray-400">{t("accountType")}</p>
                <p className="font-semibold text-bs-gray-900">
                  {customer.type === "b2b" ? t("businessCustomer") : t("privateCustomer")}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-bs-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <ShoppingBag size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-bs-gray-400">{t("orders")}</p>
                <p className="font-semibold text-bs-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-bs-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Award size={18} className="text-bs-accent" />
              </div>
              <div>
                <p className="text-xs text-bs-gray-400">{t("yourDiscount")}</p>
                <p className="font-semibold text-bs-gray-900">{customer.discountPercent}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-bs-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Package size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-bs-gray-400">{t("loyaltyPoints")}</p>
                <p className="font-semibold text-bs-gray-900">{customer.loyaltyPoints}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="bg-white rounded-xl border border-bs-gray-100 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-bs-gray-900 mb-4">{t("profile")}</h2>
            <dl className="space-y-3 text-sm">
              {customer.company && (
                <div>
                  <dt className="text-bs-gray-400">{t("company")}</dt>
                  <dd className="font-medium text-bs-gray-900">{customer.company}</dd>
                </div>
              )}
              <div>
                <dt className="text-bs-gray-400">{t("name")}</dt>
                <dd className="font-medium text-bs-gray-900">{customer.name}</dd>
              </div>
              <div>
                <dt className="text-bs-gray-400">{t("email")}</dt>
                <dd className="font-medium text-bs-gray-900">{customer.email}</dd>
              </div>
              {customer.phone && (
                <div>
                  <dt className="text-bs-gray-400">{t("phone")}</dt>
                  <dd className="font-medium text-bs-gray-900">{customer.phone}</dd>
                </div>
              )}
              {customer.taxId && (
                <div>
                  <dt className="text-bs-gray-400">{t("taxId")}</dt>
                  <dd className="font-medium text-bs-gray-900 font-mono">{customer.taxId}</dd>
                </div>
              )}
            </dl>
            <Link
              href="/konto/profil"
              className="inline-block mt-4 text-sm text-bs-accent font-medium hover:underline"
            >
              {t("editProfile")}
            </Link>
          </div>

          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-bs-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-bs-gray-900">{t("lastOrders")}</h2>
              <Link href="/konto/bestellungen" className="text-sm text-bs-accent font-medium hover:underline">
                {t("showAll")}
              </Link>
            </div>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-bs-gray-300" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag size={40} className="mx-auto text-bs-gray-200 mb-3" />
                <p className="text-bs-gray-400 text-sm">{t("noOrders")}</p>
                <Link href="/produkte" className="inline-block mt-3 text-sm text-bs-accent font-medium hover:underline">
                  {t("shopNow")}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-bs-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-bs-gray-900 font-mono">{order.id}</p>
                      <p className="text-xs text-bs-gray-400">
                        {new Date(order.date).toLocaleDateString(locale)} - {order.items.length} {t("articles")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">{order.subtotal.toFixed(2)} &euro;</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
