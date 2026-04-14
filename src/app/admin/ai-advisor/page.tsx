"use client";

import { useEffect, useState } from "react";
import {
  Brain, Save, Loader2, Plus, Trash2, Eye, EyeOff, CreditCard, Database, Settings
} from "lucide-react";
import Link from "next/link";

interface AIPlan {
  id: string;
  name: string;
  price: number;
  scansPerMonth: number;
  features: string[];
}

interface KnowledgeEntry {
  id: string;
  surface: string;
  visualDescription: string;
  products: string[];
}

interface Config {
  enabled: boolean;
  stripeSecretKey: string;
  stripePublishableKey: string;
  plans: AIPlan[];
  knowledgeBase: KnowledgeEntry[];
  systemPrompt: string;
}

export default function AIAdvisorAdminPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"general" | "plans" | "knowledge" | "prompt">("general");

  useEffect(() => {
    fetch("/api/admin/ai-advisor").then(r => r.json()).then(setConfig).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    await fetch("/api/admin/ai-advisor", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
  }

  if (loading || !config) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="text-bs-accent" size={28} />
            AI-Produktberater
          </h1>
          <p className="text-gray-500 text-sm mt-1">KI-gestützte Oberflächenanalyse mit Kamera</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/de/ai-berater" target="_blank" className="text-sm text-gray-500 hover:text-bs-accent">Vorschau →</Link>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Speichern
          </button>
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">AI-Berater aktivieren</h2>
            <p className="text-sm text-gray-500 mt-1">Zeigt den AI-Produktberater auf der Website an</p>
          </div>
          <button onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative w-14 h-7 rounded-full transition-colors ${config.enabled ? "bg-green-500" : "bg-gray-300"}`}>
            <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${config.enabled ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: "general", label: "Allgemein", icon: Settings },
          { key: "plans", label: "Tarife", icon: CreditCard },
          { key: "knowledge", label: "Wissensdatenbank", icon: Database },
          { key: "prompt", label: "AI-Prompt", icon: Brain },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* General */}
      {tab === "general" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Stripe-Integration (optional)</h2>
          <p className="text-xs text-gray-400">Für kostenpflichtige Tarife. Leer lassen = alle Tarife kostenlos.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Publishable Key</label>
              <input value={config.stripePublishableKey} onChange={(e) => setConfig({ ...config, stripePublishableKey: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="pk_live_..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
              <input value={config.stripeSecretKey} onChange={(e) => setConfig({ ...config, stripeSecretKey: e.target.value })}
                type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="sk_live_..." />
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      {tab === "plans" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tarife</h2>
            <button onClick={() => setConfig({
              ...config,
              plans: [...config.plans, { id: Date.now().toString(36), name: "Neuer Tarif", price: 0, scansPerMonth: 0, features: [] }]
            })} className="flex items-center gap-1 text-sm text-bs-accent hover:text-bs-accent-dark font-medium">
              <Plus size={14} /> Tarif hinzufügen
            </button>
          </div>

          <div className="space-y-4">
            {config.plans.map((plan, idx) => (
              <div key={plan.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">ID: {plan.id}</span>
                  <button onClick={() => setConfig({ ...config, plans: config.plans.filter((_, i) => i !== idx) })}
                    className="text-gray-400 hover:text-bs-accent"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Name</label>
                    <input value={plan.name} onChange={(e) => {
                      const plans = [...config.plans]; plans[idx] = { ...plans[idx], name: e.target.value }; setConfig({ ...config, plans });
                    }} className="w-full border rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Preis (€/Monat)</label>
                    <input type="number" value={plan.price} onChange={(e) => {
                      const plans = [...config.plans]; plans[idx] = { ...plans[idx], price: parseFloat(e.target.value) || 0 }; setConfig({ ...config, plans });
                    }} className="w-full border rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Scans/Monat</label>
                    <input type="number" value={plan.scansPerMonth} onChange={(e) => {
                      const plans = [...config.plans]; plans[idx] = { ...plans[idx], scansPerMonth: parseInt(e.target.value) || 0 }; setConfig({ ...config, plans });
                    }} className="w-full border rounded px-2 py-1.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Features (per Zeile)</label>
                    <textarea value={plan.features.join("\n")} onChange={(e) => {
                      const plans = [...config.plans]; plans[idx] = { ...plans[idx], features: e.target.value.split("\n").filter(Boolean) }; setConfig({ ...config, plans });
                    }} rows={2} className="w-full border rounded px-2 py-1.5 text-xs" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge Base */}
      {tab === "knowledge" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Wissensdatenbank</h2>
              <p className="text-xs text-gray-400 mt-1">Oberflächen und passende Produkte für die KI-Analyse</p>
            </div>
            <button onClick={() => setConfig({
              ...config,
              knowledgeBase: [...config.knowledgeBase, { id: Date.now().toString(36), surface: "", visualDescription: "", products: [] }]
            })} className="flex items-center gap-1 text-sm text-bs-accent hover:text-bs-accent-dark font-medium">
              <Plus size={14} /> Eintrag hinzufügen
            </button>
          </div>

          <div className="space-y-3">
            {config.knowledgeBase.map((entry, idx) => (
              <div key={entry.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Oberfläche</label>
                      <input value={entry.surface} onChange={(e) => {
                        const kb = [...config.knowledgeBase]; kb[idx] = { ...kb[idx], surface: e.target.value }; setConfig({ ...config, knowledgeBase: kb });
                      }} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="z.B. Marmor (matt)" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Visuelle Beschreibung</label>
                      <input value={entry.visualDescription} onChange={(e) => {
                        const kb = [...config.knowledgeBase]; kb[idx] = { ...kb[idx], visualDescription: e.target.value }; setConfig({ ...config, knowledgeBase: kb });
                      }} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Heller Stein, poröse Oberfläche..." />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Produkte (Komma-getrennt)</label>
                      <input value={entry.products.join(", ")} onChange={(e) => {
                        const kb = [...config.knowledgeBase]; kb[idx] = { ...kb[idx], products: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }; setConfig({ ...config, knowledgeBase: kb });
                      }} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="SP-100 Citro, Stone & Tile" />
                    </div>
                  </div>
                  <button onClick={() => setConfig({ ...config, knowledgeBase: config.knowledgeBase.filter((_, i) => i !== idx) })}
                    className="text-gray-400 hover:text-bs-accent mt-5"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Prompt */}
      {tab === "prompt" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">AI System-Prompt</h2>
          <p className="text-xs text-gray-400">Anweisung für die KI. Verwende [KNOWLEDGE_BASE] als Platzhalter für die Wissensdatenbank.</p>
          <textarea value={config.systemPrompt} onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
            rows={15} className="w-full border border-gray-300 rounded-lg p-4 text-sm font-mono" />
        </div>
      )}
    </div>
  );
}
