"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Check } from "lucide-react";

const fields = [
  { key: "company", label: "Firma" },
  { key: "address", label: "Adresse" },
  { key: "zip", label: "PLZ" },
  { key: "city", label: "Stadt" },
  { key: "country", label: "Land" },
  { key: "phone", label: "Telefon" },
  { key: "fax", label: "Fax" },
  { key: "email", label: "E-Mail" },
  { key: "website", label: "Website" },
  { key: "taxId", label: "Steuer-Nr." },
  { key: "managingDirector", label: "Geschaftsfuhrer" },
];

export default function ContactAdmin() {
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/contact")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontaktdaten</h1>
          <p className="mt-1 text-sm text-gray-500">Firmenadresse und Kontaktinformationen</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark disabled:bg-red-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Gespeichert!" : "Speichern"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {f.label}
              </label>
              <input
                type="text"
                value={data[f.key] || ""}
                onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
