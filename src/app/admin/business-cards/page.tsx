"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Printer, Plus, Trash2, Save, Loader2, Image as ImageIcon, FileText } from "lucide-react";
import { toPng } from "html-to-image";

// ── Stałe brandowe (z drukowanych wizytówek BS) ──────────────────────────
const COLOR_NAVY = "#1F2D4A"; // nazwiska, numery, "Building Solutions GmbH", "Hauptsitz/Standort"
const COLOR_TEAL = "#3DBFA0"; // stanowisko, etykiety T:/M:/E:, ulica + PLZ, logo
const FONT_FAMILY = "'Inter', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif";
const LOGO_URL = "/logo-bs.png";

// ── Typy ────────────────────────────────────────────────────────────────
interface Location {
  label: string;       // np. "Hauptsitz Kerpen" / "Standort Lübbecke"
  company: string;     // np. "Building Solutions GmbH"
  street: string;      // np. "Ottostraße 14"
  zipCity: string;     // np. "50170 Kerpen"
}

interface CardPerson {
  id: string;
  name: string;
  role: string;
  phone: string;       // T:
  mobile: string;      // M:
  email: string;       // E:
  primaryLocationIdx: number; // który adres ma być pełny (z ulicą + PLZ); drugi tylko nazwa
}

interface CardSettings {
  size: "85x55" | "90x55" | "90x50";
  corner: "sharp" | "soft" | "round";
}

interface BusinessCardsConfig {
  locations: Location[];
  persons: CardPerson[];
  settings: CardSettings;
}

const SIZE_PRESETS: Record<CardSettings["size"], { w: number; h: number; label: string }> = {
  "85x55": { w: 85, h: 55, label: "85 × 55 mm (DIN)" },
  "90x55": { w: 90, h: 55, label: "90 × 55 mm (BS)" },
  "90x50": { w: 90, h: 50, label: "90 × 50 mm (kompakt)" },
};

const CORNER_PRESETS: Record<CardSettings["corner"], { radius: number; label: string }> = {
  sharp: { radius: 0, label: "scharf" },
  soft: { radius: 2, label: "leicht abgerundet" },
  round: { radius: 4, label: "stark abgerundet" },
};

// ── Domyślne dane (na podstawie wizytówek BS) ───────────────────────────
const defaultConfig: BusinessCardsConfig = {
  locations: [
    {
      label: "Hauptsitz Ochsenhausen",
      company: "Building Solutions GmbH",
      street: "Grüner Weg 1",
      zipCity: "88416 Ochsenhausen",
    },
    {
      label: "Standort Kerpen",
      company: "Building Solutions GmbH",
      street: "Ottostraße 14",
      zipCity: "50170 Kerpen",
    },
  ],
  persons: [
    {
      id: "person-1",
      name: "Max Mustermann",
      role: "Projektleitung",
      phone: "+49 (0) 2273 95155 00",
      mobile: "+49 (0) 151 00000000",
      email: "m.mustermann@buildingsolutions.de",
      primaryLocationIdx: 1, // domyślnie Kerpen jako primary (z pełnym adresem)
    },
  ],
  settings: { size: "90x55", corner: "sharp" },
};

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm";

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyPerson(): CardPerson {
  return { id: uid(), name: "", role: "", phone: "", mobile: "", email: "", primaryLocationIdx: 0 };
}

// ── Komponent wizytówki (wspólny: podgląd + canvas do PNG/PDF) ──────────
function BusinessCard({
  person,
  locations,
  settings,
}: {
  person: CardPerson;
  locations: Location[];
  settings: CardSettings;
}) {
  const size = SIZE_PRESETS[settings.size];
  const corner = CORNER_PRESETS[settings.corner];
  // Pozycja jest stała: locations[0] zawsze po lewej, locations[1] zawsze po prawej.
  // Pełny adres (ulica + PLZ) pokazuje się tylko na wybranej u pracownika lokalizacji „głównej".
  const left = locations[0];
  const right = locations[1];

  return (
    <div
      data-bs-card
      style={{
        width: `${size.w}mm`,
        height: `${size.h}mm`,
        background: "#FFFFFF",
        borderRadius: `${corner.radius}mm`,
        padding: "5mm 6mm",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT_FAMILY,
        color: COLOR_NAVY,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        boxSizing: "border-box",
      }}
    >
      {/* Logo prawy górny róg */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_URL}
        alt=""
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          top: "5mm",
          right: "6mm",
          height: "11mm",
          width: "auto",
        }}
      />

      {/* Imię + stanowisko (lewy górny) */}
      <div style={{ marginBottom: "2mm" }}>
        <div style={{ fontSize: "11pt", fontWeight: 500, lineHeight: 1.15, letterSpacing: "0.01em" }}>
          {person.name || "Vor- Nachname"}
        </div>
        <div style={{ fontSize: "9.5pt", color: COLOR_TEAL, fontWeight: 400, marginTop: "0.5mm" }}>
          {person.role || "Position"}
        </div>
      </div>

      {/* Kontakt T/M/E */}
      <div
        style={{
          marginTop: "6mm",
          fontSize: "8pt",
          lineHeight: 1.5,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          columnGap: "2mm",
          rowGap: "0.3mm",
          maxWidth: "60%",
        }}
      >
        {person.phone && (
          <>
            <span style={{ color: COLOR_TEAL, fontWeight: 500 }}>T:</span>
            <span>{person.phone}</span>
          </>
        )}
        {person.mobile && (
          <>
            <span style={{ color: COLOR_TEAL, fontWeight: 500 }}>M:</span>
            <span>{person.mobile}</span>
          </>
        )}
        {person.email && (
          <>
            <span style={{ color: COLOR_TEAL, fontWeight: 500 }}>E:</span>
            <span>{person.email}</span>
          </>
        )}
      </div>

      {/* Adresy: locations[0] zawsze po lewej, locations[1] zawsze po prawej.
          Pełny adres (ulica + PLZ) pokazuje się tylko na lokalizacji wybranej jako „Hauptstandort". */}
      <div
        style={{
          position: "absolute",
          bottom: "5mm",
          left: "6mm",
          right: "6mm",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: "3mm",
          fontSize: "7.5pt",
          lineHeight: 1.4,
        }}
      >
        {left && (
          <div>
            <div style={{ fontWeight: 500 }}>{left.company}</div>
            <div style={{ fontWeight: 500 }}>{left.label}</div>
            {person.primaryLocationIdx === 0 && left.street && (
              <div style={{ color: COLOR_TEAL, marginTop: "0.5mm" }}>{left.street}</div>
            )}
            {person.primaryLocationIdx === 0 && left.zipCity && (
              <div style={{ color: COLOR_TEAL }}>{left.zipCity}</div>
            )}
          </div>
        )}
        {right && (
          <div>
            <div style={{ fontWeight: 500 }}>{right.company}</div>
            <div style={{ fontWeight: 500 }}>{right.label}</div>
            {person.primaryLocationIdx === 1 && right.street && (
              <div style={{ color: COLOR_TEAL, marginTop: "0.5mm" }}>{right.street}</div>
            )}
            {person.primaryLocationIdx === 1 && right.zipCity && (
              <div style={{ color: COLOR_TEAL }}>{right.zipCity}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Strona ──────────────────────────────────────────────────────────────
export default function BusinessCardsPage() {
  const [config, setConfig] = useState<BusinessCardsConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const previewRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Załaduj konfigurację z API; jeśli pusta — pobierz adres firmy z /api/admin/contact jako start
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/business-cards");
        const data = await r.json();
        if (cancelled) return;
        if (data && Array.isArray(data.locations) && Array.isArray(data.persons)) {
          setConfig({
            locations: data.locations,
            persons: data.persons.length ? data.persons : [emptyPerson()],
            settings: data.settings || defaultConfig.settings,
          });
        } else {
          // Brak zapisu — spróbuj zasiać z /api/admin/contact
          try {
            const c = await fetch("/api/admin/contact").then((r) => r.json());
            if (c && c.company) {
              setConfig((prev) => ({
                ...prev,
                locations: [
                  prev.locations[0],
                  {
                    label: `Standort ${c.city || "Kerpen"}`,
                    company: c.company,
                    street: c.address || "",
                    zipCity: `${c.zip || ""} ${c.city || ""}`.trim(),
                  },
                ],
              }));
            }
          } catch {}
        }
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/business-cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }, [config]);

  const updateLocation = (idx: number, field: keyof Location, value: string) => {
    setConfig((c) => ({
      ...c,
      locations: c.locations.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    }));
  };

  const addPerson = () => setConfig((c) => ({ ...c, persons: [...c.persons, emptyPerson()] }));

  const removePerson = (id: string) => {
    setConfig((c) => ({
      ...c,
      persons: c.persons.length > 1 ? c.persons.filter((p) => p.id !== id) : c.persons,
    }));
  };

  const updatePerson = (id: string, field: keyof CardPerson, value: string | number) => {
    setConfig((c) => ({
      ...c,
      persons: c.persons.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  // ── Eksport PNG (pojedyncza karta — wybrana osoba) ────────────────────
  const exportPng = async (personId: string) => {
    const node = previewRefs.current.get(personId);
    if (!node) return;
    const person = config.persons.find((p) => p.id === personId);
    const dataUrl = await toPng(node, {
      pixelRatio: 6, // ~600 dpi przy 90mm = ~2126 px
      cacheBust: true,
      backgroundColor: "#FFFFFF",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `Visitenkarte_${(person?.name || "BS").replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
    a.click();
  };

  // ── Eksport PNG (wszystkie karty — kolejne pliki) ─────────────────────
  const exportAllPng = async () => {
    // Sekwencyjnie, z lekkim opóźnieniem między pobraniami,
    // żeby przeglądarka nie zablokowała wielokrotnych downloadów.
    for (const person of config.persons) {
      await exportPng(person.id);
      await new Promise((r) => setTimeout(r, 250));
    }
  };

  // ── Eksport PDF (wszystkie karty na A4, 2×5 = max 10/strona) ──────────
  const exportPdf = () => {
    const size = SIZE_PRESETS[config.settings.size];
    const corner = CORNER_PRESETS[config.settings.corner];
    const w = window.open("", "_blank");
    if (!w) return;

    // Renderuj HTML z osadzonym fontem Inter — aby wydruk wyglądał tak jak podgląd
    const cardsHtml = config.persons
      .map((p) => {
        // Stała pozycja: locations[0] = lewa kolumna, locations[1] = prawa.
        // Pełny adres pokazuje się tylko na wybranej u pracownika lokalizacji „głównej".
        const left = config.locations[0];
        const right = config.locations[1];
        const renderLoc = (loc: Location | undefined, isPrimary: boolean) => {
          if (!loc) return "";
          return `
            <div>
              <div class="bold">${escape(loc.company)}</div>
              <div class="bold">${escape(loc.label)}</div>
              ${isPrimary && loc.street ? `<div class="teal">${escape(loc.street)}</div>` : ""}
              ${isPrimary && loc.zipCity ? `<div class="teal">${escape(loc.zipCity)}</div>` : ""}
            </div>`;
        };
        return `
        <div class="card">
          <img src="${LOGO_URL}" alt="" class="logo" />
          <div class="head">
            <div class="name">${escape(p.name) || "Vor- Nachname"}</div>
            <div class="role">${escape(p.role) || "Position"}</div>
          </div>
          <div class="contact">
            ${p.phone ? `<span class="lbl">T:</span><span>${escape(p.phone)}</span>` : ""}
            ${p.mobile ? `<span class="lbl">M:</span><span>${escape(p.mobile)}</span>` : ""}
            ${p.email ? `<span class="lbl">E:</span><span>${escape(p.email)}</span>` : ""}
          </div>
          <div class="addr">
            ${renderLoc(left, p.primaryLocationIdx === 0)}
            ${renderLoc(right, p.primaryLocationIdx === 1)}
          </div>
        </div>`;
      })
      .join("\n");

    w.document.write(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>Visitenkarten — Building Solutions</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${FONT_FAMILY}; color: ${COLOR_NAVY}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
    .card {
      width: ${size.w}mm;
      height: ${size.h}mm;
      background: #fff;
      border-radius: ${corner.radius}mm;
      padding: 5mm 6mm;
      position: relative;
      overflow: hidden;
      page-break-inside: avoid;
      border: 0.2mm dashed #d1d5db;
    }
    .logo { position: absolute; top: 5mm; right: 6mm; height: 11mm; width: auto; }
    .head { margin-bottom: 2mm; }
    .name { font-size: 11pt; font-weight: 500; line-height: 1.15; letter-spacing: 0.01em; }
    .role { font-size: 9.5pt; color: ${COLOR_TEAL}; margin-top: 0.5mm; }
    .contact { margin-top: 6mm; font-size: 8pt; line-height: 1.5; display: grid; grid-template-columns: auto 1fr; column-gap: 2mm; row-gap: 0.3mm; max-width: 60%; }
    .contact .lbl { color: ${COLOR_TEAL}; font-weight: 500; }
    .addr { position: absolute; bottom: 5mm; left: 6mm; right: 6mm; display: grid; grid-template-columns: 1fr 1fr; column-gap: 3mm; font-size: 7.5pt; line-height: 1.4; }
    .addr .bold { font-weight: 500; }
    .addr .teal { color: ${COLOR_TEAL}; }
    @media print { .card { border: none; } }
  </style>
</head>
<body>
  <div class="grid">
    ${cardsHtml}
  </div>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 300); });<\/script>
</body>
</html>`);
    w.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const sizePx = SIZE_PRESETS[config.settings.size];

  return (
    <div>
      {/* Osadzenie Inter dla podglądu (poza wydrukiem) */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitenkarten</h1>
          <p className="text-sm text-gray-500 mt-1">Visitenkarten-Generator BS &mdash; Schriftart, Logo und Farben wie im Druck</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedAt && <span className="text-xs text-gray-400 mr-1">gespeichert {new Date(savedAt).toLocaleTimeString()}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Speichern
          </button>
          <button
            onClick={exportAllPng}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-800 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <ImageIcon size={16} />
            PNG (alle)
          </button>
          <button
            onClick={exportPdf}
            className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <FileText size={16} />
            PDF (alle)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Lewa kolumna: formularze ─────────────────────────────────── */}
        <div className="space-y-6">
          {/* Ustawienia karty */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Format</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Größe</label>
                <select
                  value={config.settings.size}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, size: e.target.value as CardSettings["size"] } })}
                  className={inputClass}
                >
                  {Object.entries(SIZE_PRESETS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Ecken</label>
                <select
                  value={config.settings.corner}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, corner: e.target.value as CardSettings["corner"] } })}
                  className={inputClass}
                >
                  {Object.entries(CORNER_PRESETS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lokalizacje firmy */}
          {config.locations.map((loc, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Standort {idx + 1}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Firmenname</label>
                  <input value={loc.company} onChange={(e) => updateLocation(idx, "company", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Bezeichnung (z.&nbsp;B. &bdquo;Hauptsitz Kerpen&rdquo;)</label>
                  <input value={loc.label} onChange={(e) => updateLocation(idx, "label", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Straße</label>
                  <input value={loc.street} onChange={(e) => updateLocation(idx, "street", e.target.value)} className={inputClass} placeholder="Ottostraße 14" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">PLZ + Stadt</label>
                  <input value={loc.zipCity} onChange={(e) => updateLocation(idx, "zipCity", e.target.value)} className={inputClass} placeholder="50170 Kerpen" />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Die vollständige Adresse (Straße + PLZ) erscheint nur am beim Mitarbeiter gewählten &bdquo;Hauptstandort&rdquo;; die zweite Spalte zeigt nur Firmenname und Bezeichnung.
              </p>
            </div>
          ))}

          {/* Pracownicy */}
          {config.persons.map((person, i) => (
            <div key={person.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Mitarbeiter {config.persons.length > 1 ? `#${i + 1}` : ""}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportPng(person.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-bs-accent px-2.5 py-1.5 border border-gray-200 rounded-lg transition-colors"
                  >
                    <ImageIcon size={13} /> PNG
                  </button>
                  {config.persons.length > 1 && (
                    <button onClick={() => removePerson(person.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Vor- und Nachname</label>
                  <input value={person.name} onChange={(e) => updatePerson(person.id, "name", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                  <input value={person.role} onChange={(e) => updatePerson(person.id, "role", e.target.value)} className={inputClass} placeholder="Projektleitung" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">T (Telefon)</label>
                  <input value={person.phone} onChange={(e) => updatePerson(person.id, "phone", e.target.value)} className={inputClass} placeholder="optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">M (Mobil)</label>
                  <input value={person.mobile} onChange={(e) => updatePerson(person.id, "mobile", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">E (E-Mail)</label>
                  <input value={person.email} onChange={(e) => updatePerson(person.id, "email", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Hauptstandort (mit vollständiger Adresse)</label>
                <select
                  value={person.primaryLocationIdx}
                  onChange={(e) => updatePerson(person.id, "primaryLocationIdx", Number(e.target.value))}
                  className={inputClass}
                >
                  {config.locations.map((l, idx) => (
                    <option key={idx} value={idx}>{l.label || `Standort ${idx + 1}`}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={addPerson}
            className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-medium transition-colors border border-dashed border-gray-300"
          >
            <Plus size={16} />
            Weiteren Mitarbeiter hinzufügen
          </button>
        </div>

        {/* ── Prawa kolumna: podgląd ─────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Vorschau ({config.persons.length} {config.persons.length === 1 ? "Karte" : "Karten"} · {sizePx.w}×{sizePx.h} mm)
            </h2>
            <div className="space-y-5">
              {config.persons.map((person) => (
                <div key={person.id} className="flex justify-center">
                  <div
                    ref={(el) => {
                      if (el) previewRefs.current.set(person.id, el);
                      else previewRefs.current.delete(person.id);
                    }}
                  >
                    <BusinessCard person={person} locations={config.locations} settings={config.settings} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 text-sm text-blue-900">
            <p className="font-medium mb-2">Export</p>
            <ul className="space-y-1 list-disc list-inside text-blue-800">
              <li><strong>PNG (alle)</strong> &mdash; alle Karten als einzelne PNG-Dateien (~600 dpi), Schaltfläche oben</li>
              <li><strong>PNG</strong> &mdash; nur eine Karte (Schaltfläche bei jedem Mitarbeiter)</li>
              <li><strong>PDF (alle)</strong> &mdash; alle Karten auf A4, 2 Stück pro Seite, druckfertig</li>
              <li>Format und Ecken werden global im Bereich &bdquo;Format&rdquo; geändert</li>
              <li><Printer size={12} className="inline -mt-0.5" /> Im PDF-Fenster &bdquo;Als PDF speichern&rdquo; wählen oder direkt drucken</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────
function escape(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
