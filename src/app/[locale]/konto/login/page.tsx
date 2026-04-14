"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import { useCustomer } from "@/lib/customer-context";
import { useTranslations } from "next-intl";

export default function CustomerLoginPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const { login } = useCustomer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.success) {
      router.push("/konto");
    } else {
      setError(result.error || t("loginFailed"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bs-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-bs-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-bs-gray-900 mb-2">{t("login")}</h1>
          <p className="text-sm text-bs-gray-500 mb-6">
            {t("loginSubtitle")}
          </p>

          {error && (
            <div className="mb-4 text-sm text-bs-accent bg-blue-50 p-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bs-gray-700 mb-1">{t("password")}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-bs-gray-200 focus:border-bs-accent focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-bs-accent hover:bg-bs-accent-dark disabled:bg-bs-accent/50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {t("login")}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-bs-gray-500">
            {t("noAccount")}{" "}
            <Link href="/konto/registrieren" className="text-bs-accent font-medium hover:underline">
              {t("registerNow")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
