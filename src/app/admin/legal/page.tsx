"use client";

import { useEffect, useState } from "react";
import { Scale, Save, Loader2, FileText, Shield } from "lucide-react";

export default function LegalAdminPage() {
  const [activeTab, setActiveTab] = useState<"impressum" | "datenschutz">("impressum");
  const [impressum, setImpressum] = useState("");
  const [datenschutz, setDatenschutz] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/legal")
      .then((r) => r.json())
      .then((data) => {
        setImpressum(data.impressum || "");
        setDatenschutz(data.datenschutz || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/legal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ impressum, datenschutz }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="text-red-600" size={28} />
            Rechtliche Seiten
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Impressum und Datenschutzerklärung bearbeiten
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Speichern..." : saved ? "✓ Gespeichert" : "Speichern"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("impressum")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "impressum"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={16} />
          Impressum
        </button>
        <button
          onClick={() => setActiveTab("datenschutz")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "datenschutz"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield size={16} />
          Datenschutz
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {activeTab === "impressum" ? "Impressum" : "Datenschutzerklärung"}
          </h2>
          <span className="text-xs text-gray-400">HTML-Format erlaubt</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Verwende HTML-Tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;br/&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a href=&quot;...&quot;&gt;
        </p>
        <textarea
          value={activeTab === "impressum" ? impressum : datenschutz}
          onChange={(e) =>
            activeTab === "impressum"
              ? setImpressum(e.target.value)
              : setDatenschutz(e.target.value)
          }
          rows={25}
          className="w-full border border-gray-300 rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-y"
          placeholder={`${activeTab === "impressum" ? "Impressum" : "Datenschutzerklärung"} hier eingeben...`}
        />
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Vorschau</h2>
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{
            __html: activeTab === "impressum" ? impressum : datenschutz,
          }}
        />
      </div>
    </div>
  );
}
