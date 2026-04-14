"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Loader2, Trash2, ChevronDown, Star } from "lucide-react";

interface Reference {
  id: string;
  title: string;
  description: string;
  client: string;
  category: string;
  images: string[];
  year: number;
  featured: boolean;
}

const CATEGORIES = [
  { value: "security", label: "Sicherheitssysteme" },
  { value: "video", label: "Videoüberwachung" },
  { value: "hazard", label: "Gefahrenmanagement" },
  { value: "communication", label: "Kommunikationstechnik" },
  { value: "electrical", label: "Elektrotechnik" },
  { value: "repairs", label: "Gerätereparaturen" },
  { value: "pv", label: "Photovoltaik" },
];

export default function AdminReferencesPage() {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/references").then((r) => r.json()).then((d) => { setRefs(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/references", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(refs) });
    setSaved(true); setTimeout(() => setSaved(false), 2000); setSaving(false);
  };

  const addRef = () => {
    const r: Reference = { id: Date.now().toString(36), title: "Neues Projekt", description: "", client: "", category: "", images: [], year: new Date().getFullYear(), featured: false };
    setRefs([...refs, r]); setExpandedId(r.id);
  };

  const update = (id: string, u: Partial<Reference>) => { setRefs((p) => p.map((r) => r.id === id ? { ...r, ...u } : r)); setSaved(false); };
  const remove = (id: string) => { if (confirm("Referenz löschen?")) { setRefs((p) => p.filter((r) => r.id !== id)); setSaved(false); } };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-bs-accent mb-2"><ArrowLeft size={14} /> Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Referenzen verwalten</h1>
          <p className="text-sm text-gray-500 mt-1">{refs.length} Referenzen</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addRef} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"><Plus size={16} /> Hinzufügen</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {refs.map((ref) => {
          const isExp = expandedId === ref.id;
          return (
            <div key={ref.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(isExp ? null : ref.id)}>
                <button onClick={(e) => { e.stopPropagation(); update(ref.id, { featured: !ref.featured }); }} className={ref.featured ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}><Star size={18} fill={ref.featured ? "currentColor" : "none"} /></button>
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm">{ref.title}</span>
                  <span className="text-xs text-gray-400 ml-2">{ref.client} · {ref.year}</span>
                </div>
                {ref.category && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{CATEGORIES.find((c) => c.value === ref.category)?.label}</span>}
                <button onClick={(e) => { e.stopPropagation(); remove(ref.id); }} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExp ? "rotate-180" : ""}`} />
              </div>
              {isExp && (
                <div className="border-t border-gray-200 p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Titel</label><input value={ref.title} onChange={(e) => update(ref.id, { title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Kunde</label><input value={ref.client} onChange={(e) => update(ref.id, { client: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Kategorie</label>
                      <select value={ref.category} onChange={(e) => update(ref.id, { category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent">
                        <option value="">-- Wählen --</option>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Jahr</label><input type="number" value={ref.year} onChange={(e) => update(ref.id, { year: parseInt(e.target.value) || 2024 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                  </div>
                  <div><label className="text-xs font-medium text-gray-500 mb-1 block">Beschreibung</label><textarea value={ref.description} onChange={(e) => update(ref.id, { description: e.target.value })} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={ref.featured} onChange={() => update(ref.id, { featured: !ref.featured })} className="rounded" /> <Star size={14} className="text-yellow-500" /> Als hervorgehoben markieren (Homepage)</label>
                </div>
              )}
            </div>
          );
        })}
        {refs.length === 0 && <p className="text-center text-gray-400 py-12">Noch keine Referenzen. Klicken Sie auf &quot;Hinzufügen&quot;.</p>}
      </div>
    </div>
  );
}
