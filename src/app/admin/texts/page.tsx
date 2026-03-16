"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Check, ChevronDown, ChevronRight } from "lucide-react";

const LOCALES = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "tr", label: "Turkce" },
  { code: "ru", label: "Russkij" },
  { code: "uk", label: "Ukrainska" },
  { code: "sk", label: "Slovencina" },
  { code: "sq", label: "Shqip" },
  { code: "hr", label: "Hrvatski" },
];

type TranslationData = Record<string, Record<string, string> | string>;

export default function TextsAdmin() {
  const [locale, setLocale] = useState("de");
  const [data, setData] = useState<TranslationData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/texts?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
        // Expand first section by default
        const keys = Object.keys(d);
        if (keys.length > 0 && Object.keys(expanded).length === 0) {
          setExpanded({ [keys[0]]: true });
        }
      });
  }, [locale]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/texts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, data }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateValue = (section: string, key: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, string>),
        [key]: value,
      },
    }));
  };

  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Texte & Ubersetzungen</h1>
          <p className="mt-1 text-sm text-gray-500">Alle Sprachversionen bearbeiten</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Gespeichert!" : "Speichern"}
        </button>
      </div>

      {/* Locale Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap bg-white rounded-xl border border-gray-200 p-1.5">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              locale === l.code
                ? "bg-red-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(data).map(([section, values]) => {
            if (typeof values !== "object" || values === null) return null;
            const isExpanded = expanded[section];
            const entries = Object.entries(values as Record<string, string>);
            return (
              <div key={section} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    <span className="font-semibold text-gray-900 text-sm uppercase tracking-wider">
                      {section}
                    </span>
                    <span className="text-xs text-gray-400">
                      {entries.length} Eintrage
                    </span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-3 border-t border-gray-100 pt-4">
                    {entries.map(([key, value]) => (
                      <div key={key} className="grid grid-cols-[200px_1fr] gap-3 items-start">
                        <label className="text-sm text-gray-500 font-mono pt-2.5 truncate" title={key}>
                          {key}
                        </label>
                        {typeof value === "string" && value.length > 80 ? (
                          <textarea
                            value={value}
                            onChange={(e) => updateValue(section, key, e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm resize-y"
                          />
                        ) : (
                          <input
                            type="text"
                            value={typeof value === "string" ? value : ""}
                            onChange={(e) => updateValue(section, key, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
