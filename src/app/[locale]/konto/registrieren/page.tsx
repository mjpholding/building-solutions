"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Loader2, Building2, User } from "lucide-react";
import { useCustomer } from "@/lib/customer-context";

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useCustomer();
  const t = useTranslations("account");
  const [type, setType] = useState<"b2b" | "b2c">("b2b");
  const [form, setForm] = useState({ company: "", name: "", email: "", password: "", password2: "", phone: "", taxId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    const result = await register({
      type,
      company: form.company,
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      taxId: form.taxId,
    });
    if (result.success) {
      router.push("/konto");
    } else {
      setError(result.error || t("registerFailed"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bs-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-bs-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-bs-gray-900 mb-2">{t("registerTitle")}</h1>
          <p className="text-sm text-bs-gray-500 mb-6">
            {t("registerSubtitle")}
          </p>

          {/* Account type selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setType("b2b")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                type === "b2b"
                  ? "border-bs-accent bg-blue-50 text-bs-accent"
                  : "border-bs-gray-200 text-bs-gray-500 hover:border-bs-gray-300"
              }`}
            >
              <Building2 size={18} />
              {t("businessCustomer")}
            </button>
            <button
              type="button"
              onClick={() => setType("b2c")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                type === "b2c"
                  ? "border-bs-accent bg-blue-50 text-bs-accent"
                  : "border-bs-gray-200 text-bs-gray-500 hover:border-bs-gray-300"
              }`}
            >
              <User size={18} />
              {t("privateCustomer")}
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-bs-accent bg-blue-50 p-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "b2b" && (
              <div>
                <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("company")} *</label>
                <input type="text" required value={form.company} onChange={(e) => update("company", e.target.value)} className={inputClass} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-bs-gray-700 mb-1">
                {type === "b2b" ? t("contactPerson") : t("name")} *
              </label>
              <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("email")} *</label>
              <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("password")} *</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("passwordRepeat")} *</label>
                <input type="password" required value={form.password2} onChange={(e) => update("password2", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("phone")}</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            {type === "b2b" && (
              <div>
                <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("taxId")}</label>
                <input type="text" value={form.taxId} onChange={(e) => update("taxId", e.target.value)} className={inputClass} placeholder="DE123456789" />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-bs-accent hover:bg-bs-accent-dark disabled:bg-bs-accent/50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {t("register")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-bs-gray-500">
            {t("alreadyRegistered")}{" "}
            <Link href="/konto/login" className="text-bs-accent font-medium hover:underline">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
