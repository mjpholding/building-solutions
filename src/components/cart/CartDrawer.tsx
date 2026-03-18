"use client";

import { useCart } from "@/lib/cart-context";
import { useCustomer } from "@/lib/customer-context";
import { Link } from "@/i18n/routing";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const t = useTranslations("cart");
  const { customer } = useCustomer();
  const isB2B = customer?.type === "b2b";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={20} />
                {t("title")}
                <span className="text-sm font-normal text-gray-400">({totalItems})</span>
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400">{t("empty")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.slug}-${item.size}`} className="flex gap-4 py-3 border-b border-gray-50">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={60} height={60} className="object-contain" />
                        ) : (
                          <ShoppingBag size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                        <p className="text-xs text-gray-400">{item.size}</p>
                        <p className="text-sm font-bold text-red-600 mt-0.5">
                          {(isB2B ? item.price * item.quantity : item.price * item.quantity * 1.19).toFixed(2)} &euro;
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.slug, item.size, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:border-red-300 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.slug, item.size, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:border-red-300 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.slug, item.size)}
                            className="ml-auto p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                {isB2B ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t("subtotalNet")}</span>
                      <span className="text-lg font-bold text-gray-900">{totalPrice.toFixed(2)} &euro;</span>
                    </div>
                    <p className="text-xs text-gray-400">{t("vatNote")}</p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{t("subtotalGross")}</span>
                      <span className="text-lg font-bold text-gray-900">{(totalPrice * 1.19).toFixed(2)} &euro;</span>
                    </div>
                    <p className="text-xs text-gray-400">{t("vatIncluded")}</p>
                  </>
                )}
                <Link
                  href="/kasse"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-xl text-sm font-semibold transition-colors"
                >
                  {t("toCheckout")}
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
                >
                  {t("continueShopping")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
