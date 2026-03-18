"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, FileText, Building2, Landmark, ScrollText } from "lucide-react";

interface DocumentSettings {
  companyName: string;
  companyStreet: string;
  companyZip: string;
  companyCity: string;
  companyCountry: string;
  companyTaxId: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  bankName: string;
  bankIban: string;
  bankBic: string;
  bankAccountHolder: string;
  invoicePaymentDays: number;
  invoicePaymentNote: string;
  invoiceFooterNote: string;
  wzFooterNote: string;
  legalNote: string;
}

export default function DocumentSettingsPage() {
  const [settings, setSettings] = useState<DocumentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/document-settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/admin/document-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key: keyof DocumentSettings, value: string | number) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumenteneinstellungen</h1>
          <p className="text-sm text-gray-500 mt-1">
            Firmendaten, Bankverbindung und Texte für Rechnungen und Lieferscheine (WZ)
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
            saved ? "bg-green-600" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "Gespeichert!" : "Speichern"}
        </button>
      </div>

      {/* Company Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Firmendaten</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Firmenname</label>
            <input
              value={settings.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Straße und Hausnummer</label>
            <input
              value={settings.companyStreet}
              onChange={(e) => update("companyStreet", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">PLZ</label>
            <input
              value={settings.companyZip}
              onChange={(e) => update("companyZip", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Stadt</label>
            <input
              value={settings.companyCity}
              onChange={(e) => update("companyCity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Land</label>
            <input
              value={settings.companyCountry}
              onChange={(e) => update("companyCountry", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">USt-IdNr.</label>
            <input
              value={settings.companyTaxId}
              onChange={(e) => update("companyTaxId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Telefon</label>
            <input
              value={settings.companyPhone}
              onChange={(e) => update("companyPhone", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">E-Mail</label>
            <input
              value={settings.companyEmail}
              onChange={(e) => update("companyEmail", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Website</label>
            <input
              value={settings.companyWebsite}
              onChange={(e) => update("companyWebsite", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </section>

      {/* Bank Account */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Landmark className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Bankverbindung</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kontoinhaber</label>
            <input
              value={settings.bankAccountHolder}
              onChange={(e) => update("bankAccountHolder", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bank</label>
            <input
              value={settings.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">IBAN</label>
            <input
              value={settings.bankIban}
              onChange={(e) => update("bankIban", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="DE00 0000 0000 0000 0000 00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">BIC / SWIFT</label>
            <input
              value={settings.bankBic}
              onChange={(e) => update("bankBic", e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </section>

      {/* Invoice Texts */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Rechnungstexte</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Zahlungsziel (Tage)
            </label>
            <input
              type="number"
              value={settings.invoicePaymentDays}
              onChange={(e) => update("invoicePaymentDays", parseInt(e.target.value) || 0)}
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Zahlungshinweis <span className="text-gray-400">({"'{days}'"}  wird durch Zahlungsziel ersetzt)</span>
            </label>
            <textarea
              value={settings.invoicePaymentNote}
              onChange={(e) => update("invoicePaymentNote", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Zusätzlicher Rechnungstext (optional)
            </label>
            <textarea
              value={settings.invoiceFooterNote}
              onChange={(e) => update("invoiceFooterNote", e.target.value)}
              rows={2}
              placeholder="z.B. Vielen Dank für Ihren Einkauf!"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* WZ Texts */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">WZ-Texte (Warenausgangschein)</h2>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Fußzeile WZ
          </label>
          <textarea
            value={settings.wzFooterNote}
            onChange={(e) => update("wzFooterNote", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
          />
        </div>
      </section>

      {/* Legal Note */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <ScrollText className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Rechtliche Angaben</h2>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Impressumszeile (wird am Fuß jedes Dokuments angezeigt)
          </label>
          <textarea
            value={settings.legalNote}
            onChange={(e) => update("legalNote", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
          />
        </div>
      </section>
    </div>
  );
}
