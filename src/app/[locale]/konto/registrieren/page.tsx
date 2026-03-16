"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { Loader2, Building2, User } from "lucide-react";
import { useCustomer } from "@/lib/customer-context";

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useCustomer();
  const [type, setType] = useState<"b2b" | "b2c">("b2b");
  const [form, setForm] = useState({ company: "", name: "", email: "", password: "", password2: "", phone: "", taxId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError("Passworter stimmen nicht ueberein");
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
      setError(result.error || "Registrierung fehlgeschlagen");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-swish-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl border border-swish-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-swish-gray-900 mb-2">Konto erstellen</h1>
          <p className="text-sm text-swish-gray-500 mb-6">
            Registrieren Sie sich fuer Ihr Kundenkonto
          </p>

          {/* Account type selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setType("b2b")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                type === "b2b"
                  ? "border-swish-red bg-red-50 text-swish-red"
                  : "border-swish-gray-200 text-swish-gray-500 hover:border-swish-gray-300"
              }`}
            >
              <Building2 size={18} />
              Geschaeftskunde
            </button>
            <button
              type="button"
              onClick={() => setType("b2c")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                type === "b2c"
                  ? "border-swish-red bg-red-50 text-swish-red"
                  : "border-swish-gray-200 text-swish-gray-500 hover:border-swish-gray-300"
              }`}
            >
              <User size={18} />
              Privatkunde
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "b2b" && (
              <div>
                <label className="block text-sm font-medium text-swish-gray-700 mb-1">Firma *</label>
                <input type="text" required value={form.company} onChange={(e) => update("company", e.target.value)} className={inputClass} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">
                {type === "b2b" ? "Ansprechpartner" : "Name"} *
              </label>
              <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">E-Mail *</label>
              <input type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-swish-gray-700 mb-1">Passwort *</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-swish-gray-700 mb-1">Wiederholen *</label>
                <input type="password" required value={form.password2} onChange={(e) => update("password2", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            {type === "b2b" && (
              <div>
                <label className="block text-sm font-medium text-swish-gray-700 mb-1">USt-IdNr.</label>
                <input type="text" value={form.taxId} onChange={(e) => update("taxId", e.target.value)} className={inputClass} placeholder="DE123456789" />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-swish-red hover:bg-swish-red-dark disabled:bg-swish-red/50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Registrieren
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-swish-gray-500">
            Bereits registriert?{" "}
            <Link href="/konto/login" className="text-swish-red font-medium hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
