"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import { useCustomer } from "@/lib/customer-context";
import { Link } from "@/i18n/routing";
import { ArrowLeft, ShoppingBag, Loader2, CheckCircle2, Tag } from "lucide-react";
import Image from "next/image";

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { items, totalPrice, clearCart } = useCart();
  const { customer } = useCustomer();
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");

  // Customer discount
  const isB2B = customer?.type === "b2b";
  const customerDiscount = customer?.discountPercent || 0;
  const totalDiscount = Math.min(customerDiscount + couponDiscount, 100);
  const discountAmount = totalPrice * (totalDiscount / 100);
  const discountedPrice = totalPrice - discountAmount;

  const [form, setForm] = useState({
    company: "", name: "", email: "", phone: "",
    address: "", zip: "", city: "", country: "Deutschland", taxId: "", notes: "",
  });

  // Pre-fill form from customer data
  useEffect(() => {
    if (customer) {
      setForm((prev) => ({
        ...prev,
        company: customer.company || prev.company,
        name: customer.name || prev.name,
        email: customer.email || prev.email,
        phone: customer.phone || prev.phone,
        address: customer.address || prev.address,
        zip: customer.zip || prev.zip,
        city: customer.city || prev.city,
        country: customer.country || prev.country,
        taxId: customer.taxId || prev.taxId,
      }));
    }
  }, [customer]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer?.id || null,
          customer: {
            company: form.company,
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            zip: form.zip,
            city: form.city,
            country: form.country,
            taxId: form.taxId,
          },
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
          discount: totalDiscount > 0 ? { percent: totalDiscount, amount: discountAmount } : null,
          couponCode: couponApplied || null,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderId(data.orderId);
        clearCart();
      } else {
        setError(t("orderFailed"));
      }
    } catch {
      setError(t("connectionError"));
    } finally {
      setSubmitting(false);
    }
  };

  // Order confirmation
  if (orderId) {
    return (
      <div className="min-h-screen bg-swish-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-swish-gray-100 p-10 text-center shadow-sm">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-swish-gray-900">{t("orderReceived")}</h1>
          <p className="mt-3 text-swish-gray-500">
            {t("orderThankYou")}
          </p>
          <div className="mt-6 bg-swish-gray-50 rounded-xl p-4">
            <p className="text-sm text-swish-gray-400">{t("orderNumber")}</p>
            <p className="text-lg font-mono font-bold text-swish-gray-900">{orderId}</p>
          </div>
          <p className="mt-4 text-sm text-swish-gray-400">
            {t("confirmationSent", { email: form.email })}
          </p>
          <Link
            href="/produkte"
            className="inline-block mt-8 bg-swish-red hover:bg-swish-red-dark text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-swish-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={64} className="text-swish-gray-200 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-swish-gray-900">{t("emptyCart")}</h1>
          <Link href="/produkte" className="inline-flex items-center gap-2 mt-4 text-swish-red text-sm font-medium">
            <ArrowLeft size={14} /> {t("toProducts")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-swish-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/produkte" className="inline-flex items-center gap-2 text-swish-gray-500 hover:text-swish-red text-sm font-medium mb-8 transition-colors">
          <ArrowLeft size={16} /> {t("continueShopping")}
        </Link>

        <h1 className="text-3xl font-bold text-swish-gray-900 mb-8">{t("title")}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company info */}
              <div className="bg-white rounded-2xl border border-swish-gray-100 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-900 mb-4">{t("companyData")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("company")} *</label>
                    <input type="text" required value={form.company} onChange={(e) => updateForm("company", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("contactPerson")} *</label>
                    <input type="text" required value={form.name} onChange={(e) => updateForm("name", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("taxId")}</label>
                    <input type="text" value={form.taxId} onChange={(e) => updateForm("taxId", e.target.value)} className={inputClass} placeholder="DE123456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("email")} *</label>
                    <input type="email" required value={form.email} onChange={(e) => updateForm("email", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("phone")}</label>
                    <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div className="bg-white rounded-2xl border border-swish-gray-100 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-900 mb-4">{t("deliveryAddress")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("street")} *</label>
                    <input type="text" required value={form.address} onChange={(e) => updateForm("address", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("zip")} *</label>
                    <input type="text" required value={form.zip} onChange={(e) => updateForm("zip", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("city")} *</label>
                    <input type="text" required value={form.city} onChange={(e) => updateForm("city", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-swish-gray-700 mb-1">{t("country")}</label>
                    <input type="text" value={form.country} onChange={(e) => updateForm("country", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Coupon code */}
              <div className="bg-white rounded-2xl border border-swish-gray-100 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-900 mb-4">{t("couponCode")}</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder={t("enterCode")}
                    className={inputClass + " font-mono flex-1"}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!couponCode) return;
                      const res = await fetch(`/api/validate-coupon?code=${couponCode}&total=${totalPrice}`);
                      const data = await res.json();
                      if (data.valid) {
                        setCouponDiscount(data.discount);
                        setCouponApplied(couponCode);
                      } else {
                        setCouponDiscount(0);
                        setCouponApplied("");
                        setError(data.error || t("invalidCode"));
                      }
                    }}
                    className="px-4 py-2.5 bg-swish-gray-100 hover:bg-swish-gray-200 text-swish-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Tag size={16} />
                  </button>
                </div>
                {couponApplied && (
                  <p className="mt-2 text-sm text-green-600">{t("codeApplied", { code: couponApplied, discount: couponDiscount })}</p>
                )}
                {customerDiscount > 0 && (
                  <p className="mt-2 text-sm text-blue-600">{t("customerDiscount", { discount: customerDiscount })}</p>
                )}
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-swish-gray-100 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-900 mb-4">{t("notes")}</h2>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  rows={3}
                  placeholder={t("notesPlaceholder")}
                  className={inputClass + " resize-y"}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-swish-gray-100 p-6 sticky top-24">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-swish-gray-900 mb-4">
                  {t("orderSummary")}
                </h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={`${item.slug}-${item.size}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-swish-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={40} height={40} className="object-contain" />
                        ) : (
                          <ShoppingBag size={14} className="text-swish-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-swish-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-swish-gray-400">{item.size} x {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-swish-gray-900 whitespace-nowrap">
                        {(isB2B ? item.price * item.quantity : item.price * item.quantity * 1.19).toFixed(2)} &euro;
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-swish-gray-100 pt-4 space-y-2">
                  {isB2B ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-swish-gray-500">{t("subtotalNet")}</span>
                        <span className="font-medium">{discountedPrice.toFixed(2)} &euro;</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{t("discount", { percent: totalDiscount })}</span>
                          <span className="font-medium">-{discountAmount.toFixed(2)} &euro;</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-swish-gray-500">{t("vat")}</span>
                        <span className="font-medium">{(discountedPrice * 0.19).toFixed(2)} &euro;</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-swish-gray-500">{t("shipping")}</span>
                        <span className="font-medium text-swish-gray-400">{t("shippingOnRequest")}</span>
                      </div>
                      <div className="border-t border-swish-gray-100 pt-2 flex justify-between">
                        <span className="font-semibold text-swish-gray-900">{t("totalGross")}</span>
                        <span className="text-lg font-bold text-swish-gray-900">{(discountedPrice * 1.19).toFixed(2)} &euro;</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-swish-gray-500">{t("subtotalGross")}</span>
                        <span className="font-medium">{(discountedPrice * 1.19).toFixed(2)} &euro;</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>{t("discount", { percent: totalDiscount })}</span>
                          <span className="font-medium">-{(discountAmount * 1.19).toFixed(2)} &euro;</span>
                        </div>
                      )}
                      <div className="text-xs text-swish-gray-400">
                        {t("vatIncluded")}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-swish-gray-500">{t("shipping")}</span>
                        <span className="font-medium text-swish-gray-400">{t("shippingOnRequest")}</span>
                      </div>
                      <div className="border-t border-swish-gray-100 pt-2 flex justify-between">
                        <span className="font-semibold text-swish-gray-900">{t("totalGross")}</span>
                        <span className="text-lg font-bold text-swish-gray-900">{(discountedPrice * 1.19).toFixed(2)} &euro;</span>
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-swish-red hover:bg-swish-red-dark disabled:bg-swish-red/50 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  {submitting ? t("submitting") : t("submitOrder")}
                </button>
                <p className="mt-3 text-xs text-swish-gray-400 text-center">
                  {t("termsNotice")}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
