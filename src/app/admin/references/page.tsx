"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Loader2, Trash2, ChevronDown, Star, X } from "lucide-react";
import { slugify } from "@/lib/slug";

interface Reference {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  client: string;
  category: string;
  buildingType: string;
  address: string;
  area: string;
  scope: string;
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

const BUILDING_TYPES = [
  { value: "bildung", label: "Bildung (Schulen, Kitas, Hochschulen)" },
  { value: "gesundheit", label: "Gesundheit (Kliniken, Pflege)" },
  { value: "oeffentlich", label: "Öffentliche Gebäude" },
  { value: "verkehr", label: "Verkehr (Bahn, Flughäfen)" },
  { value: "industrie", label: "Industrie & Gewerbe" },
  { value: "kultur", label: "Kultur & Freizeit" },
  { value: "wohnen", label: "Wohnen" },
  { value: "buero", label: "Büro & Verwaltung" },
];

export default function AdminReferencesPage() {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/references")
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : [];
        const normalized = arr.map((r: Partial<Reference>) => ({
          id: r.id || Date.now().toString(36),
          slug: r.slug || slugify(r.title || "projekt"),
          title: r.title || "",
          description: r.description || "",
          longDescription: r.longDescription || "",
          client: r.client || "",
          category: r.category || "",
          buildingType: r.buildingType || "",
          address: r.address || "",
          area: r.area || "",
          scope: r.scope || "",
          images: r.images || [],
          year: r.year || new Date().getFullYear(),
          featured: r.featured || false,
        })) as Reference[];
        setRefs(normalized);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/references", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refs),
    });
    if (res.ok) {
      const updated = await res.json();
      setRefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const addRef = () => {
    const r: Reference = {
      id: Date.now().toString(36),
      slug: "",
      title: "Neues Projekt",
      description: "",
      longDescription: "",
      client: "",
      category: "",
      buildingType: "",
      address: "",
      area: "",
      scope: "",
      images: [],
      year: new Date().getFullYear(),
      featured: false,
    };
    setRefs([...refs, r]);
    setExpandedId(r.id);
  };

  const update = (id: string, u: Partial<Reference>) => {
    setRefs((p) =>
      p.map((r) => {
        if (r.id !== id) return r;
        const next = { ...r, ...u };
        if (u.title !== undefined && (!r.slug || r.slug === slugify(r.title))) {
          next.slug = slugify(u.title);
        }
        return next;
      })
    );
    setSaved(false);
  };

  const remove = (id: string) => {
    if (confirm("Referenz löschen?")) {
      setRefs((p) => p.filter((r) => r.id !== id));
      setSaved(false);
    }
  };

  const addImage = (id: string, url: string) => {
    if (!url.trim()) return;
    const ref = refs.find((r) => r.id === id);
    if (!ref) return;
    update(id, { images: [...ref.images, url.trim()] });
  };

  const removeImage = (id: string, idx: number) => {
    const ref = refs.find((r) => r.id === id);
    if (!ref) return;
    update(id, { images: ref.images.filter((_, i) => i !== idx) });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-bs-accent mb-2">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Referenzen verwalten</h1>
          <p className="text-sm text-gray-500 mt-1">{refs.length} Referenzen</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addRef}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <Plus size={16} /> Hinzufügen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{" "}
            {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {refs.map((ref) => {
          const isExp = expandedId === ref.id;
          return (
            <div key={ref.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExp ? null : ref.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    update(ref.id, { featured: !ref.featured });
                  }}
                  className={ref.featured ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}
                >
                  <Star size={18} fill={ref.featured ? "currentColor" : "none"} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{ref.title || "(ohne Titel)"}</div>
                  <div className="text-xs text-gray-400 truncate">
                    {[ref.client, ref.address, ref.year].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {ref.buildingType && (
                  <span className="text-xs bg-bs-accent/10 text-bs-accent px-2 py-0.5 rounded hidden md:inline">
                    {BUILDING_TYPES.find((b) => b.value === ref.buildingType)?.label || ref.buildingType}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(ref.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExp ? "rotate-180" : ""}`} />
              </div>

              {isExp && (
                <div className="border-t border-gray-200 p-5 space-y-4 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Titel">
                      <input
                        value={ref.title}
                        onChange={(e) => update(ref.id, { title: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="URL-Slug" hint="automatisch aus Titel; manuell anpassbar">
                      <input
                        value={ref.slug}
                        onChange={(e) => update(ref.id, { slug: slugify(e.target.value) })}
                        className={inputCls}
                        placeholder="projekt-name"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Auftraggeber / Kunde">
                      <input
                        value={ref.client}
                        onChange={(e) => update(ref.id, { client: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Standort / Adresse">
                      <input
                        value={ref.address}
                        onChange={(e) => update(ref.id, { address: e.target.value })}
                        className={inputCls}
                        placeholder="Straße Nr., PLZ Stadt"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Gebäudetyp">
                      <select
                        value={ref.buildingType}
                        onChange={(e) => update(ref.id, { buildingType: e.target.value })}
                        className={inputCls}
                      >
                        <option value="">-- Wählen --</option>
                        {BUILDING_TYPES.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Leistungskategorie">
                      <select
                        value={ref.category}
                        onChange={(e) => update(ref.id, { category: e.target.value })}
                        className={inputCls}
                      >
                        <option value="">-- Wählen --</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Jahr">
                      <input
                        type="number"
                        value={ref.year}
                        onChange={(e) => update(ref.id, { year: parseInt(e.target.value) || 2024 })}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Fläche / Eckdaten" hint="z. B. „22 055 m² NGF, 17 Geschosse, 1 200 Arbeitsplätze“">
                    <input
                      value={ref.area}
                      onChange={(e) => update(ref.id, { area: e.target.value })}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Leistungsumfang" hint="was wurde gebaut/installiert">
                    <input
                      value={ref.scope}
                      onChange={(e) => update(ref.id, { scope: e.target.value })}
                      className={inputCls}
                      placeholder="z. B. Brandmeldeanlage, Zutrittskontrolle, ELT-Ausbau"
                    />
                  </Field>

                  <Field label="Kurzbeschreibung" hint="1-2 Sätze, Karte & Einleitung">
                    <textarea
                      value={ref.description}
                      onChange={(e) => update(ref.id, { description: e.target.value })}
                      rows={3}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Ausführliche Beschreibung" hint="Detailseite — Absätze mit Leerzeile trennen">
                    <textarea
                      value={ref.longDescription}
                      onChange={(e) => update(ref.id, { longDescription: e.target.value })}
                      rows={6}
                      className={inputCls}
                    />
                  </Field>

                  <Field label={`Bilder (${ref.images.length})`}>
                    <div className="space-y-2">
                      {ref.images.map((img, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
                          <img src={img} alt="" className="w-12 h-12 rounded object-cover" />
                          <input
                            value={img}
                            onChange={(e) => {
                              const newImgs = [...ref.images];
                              newImgs[i] = e.target.value;
                              update(ref.id, { images: newImgs });
                            }}
                            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 font-mono"
                          />
                          <button
                            onClick={() => removeImage(ref.id, i)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder="Bild-URL (Enter zum Hinzufügen)"
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addImage(ref.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                  </Field>

                  <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={ref.featured}
                      onChange={() => update(ref.id, { featured: !ref.featured })}
                      className="rounded"
                    />
                    <Star size={14} className="text-yellow-500" /> Als hervorgehoben markieren (Homepage)
                  </label>
                </div>
              )}
            </div>
          );
        })}
        {refs.length === 0 && (
          <p className="text-center text-gray-400 py-12">Noch keine Referenzen. Klicken Sie auf &quot;Hinzufügen&quot;.</p>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent bg-white";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
        {hint && <span className="text-gray-400 font-normal ml-2">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
