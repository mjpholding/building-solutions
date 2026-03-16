"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/lib/customer-context";
import { Loader2, Save, Check, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-swish-gray-200 focus:border-swish-red focus:ring-2 focus:ring-swish-red/10 outline-none text-sm";

export default function ProfilePage() {
  const router = useRouter();
  const { customer, loading, refresh } = useCustomer();
  const [form, setForm] = useState({ company: "", name: "", phone: "", address: "", zip: "", city: "", country: "Deutschland", taxId: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !customer) router.push("/konto/login");
    if (customer) {
      setForm({
        company: customer.company || "",
        name: customer.name,
        phone: customer.phone || "",
        address: customer.address || "",
        zip: customer.zip || "",
        city: customer.city || "",
        country: customer.country || "Deutschland",
        taxId: customer.taxId || "",
      });
    }
  }, [loading, customer, router]);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await refresh();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || !customer) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-swish-gray-300" /></div>;
  }

  return (
    <div className="min-h-screen bg-swish-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/konto" className="inline-flex items-center gap-2 text-swish-gray-500 hover:text-swish-red text-sm font-medium mb-6">
          <ArrowLeft size={16} /> Zurueck zum Konto
        </Link>
        <h1 className="text-2xl font-bold text-swish-gray-900 mb-6">Profil bearbeiten</h1>

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-swish-gray-100 p-6 space-y-4">
          {customer.type === "b2b" && (
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">Firma</label>
              <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)} className={inputClass} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">Name</label>
              <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-swish-gray-700 mb-1">Strasse</label>
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">PLZ</label>
              <input type="text" value={form.zip} onChange={(e) => update("zip", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">Stadt</label>
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">Land</label>
              <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />
            </div>
          </div>
          {customer.type === "b2b" && (
            <div>
              <label className="block text-sm font-medium text-swish-gray-700 mb-1">USt-IdNr.</label>
              <input type="text" value={form.taxId} onChange={(e) => update("taxId", e.target.value)} className={inputClass} placeholder="DE123456789" />
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-swish-red hover:bg-swish-red-dark disabled:bg-swish-red/50 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
