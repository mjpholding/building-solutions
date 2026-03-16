"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Loader2 } from "lucide-react";
import { useCustomer } from "@/lib/customer-context";

export default function CustomerLoginPage() {
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
      setError(result.error || "Anmeldung fehlgeschlagen");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-swish-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-swish-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-swish-gray-900 mb-2">Anmelden</h1>
          <p className="text-sm text-swish-gray-500 mb-6">
            Melden Sie sich in Ihrem Kundenkonto an
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">Passwort</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-swish-red hover:bg-swish-red-dark disabled:bg-swish-red/50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Anmelden
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-swish-gray-500">
            Noch kein Konto?{" "}
            <Link href="/konto/registrieren" className="text-swish-red font-medium hover:underline">
              Jetzt registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
