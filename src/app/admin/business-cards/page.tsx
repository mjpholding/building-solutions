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

// Rodzaj karty:
//  - "person"  = wizytówka osobowa (imię + stanowisko, T/M/E, jeden adres pełny)
//  - "company" = wizytówka firmowa „Allgemein" (nazwa firmy + slogan, T/F/E, oba adresy pełne)
type CardKind = "person" | "company";

interface CardPerson {
  id: string;
  kind?: CardKind;     // domyślnie "person" (backward-compat)
  name: string;        // dla person = Imię i nazwisko; dla company = Nazwa firmy
  role: string;        // dla person = Stanowisko; dla company = Slogan/Tagline
  phone: string;       // T:
  mobile: string;      // dla person = M: (Mobil); dla company = F: (Fax)
  email: string;       // E:
  primaryLocationIdx: number; // ignorowane gdy kind === "company" (oba adresy pełne)
}

interface CardSettings {
  size: "85x55" | "90x55" | "90x50";
  corner: "sharp" | "soft" | "round";
  // Beschnittzugabe / spad (mm) — dodaje białe pole wokół karty w PDF.
  // Flyeralarm i większość drukarni DE wymaga 1 mm.
  bleedMm: number;
  // Schnittmarken — krzyżyki cięcia w narożnikach poza Endformatem (tylko gdy bleed > 0).
  cutMarks: boolean;
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
  settings: { size: "85x55", corner: "sharp", bleedMm: 1, cutMarks: false },
};

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-bs-accent/10 outline-none text-sm";

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyPerson(): CardPerson {
  return { id: uid(), kind: "person", name: "", role: "", phone: "", mobile: "", email: "", primaryLocationIdx: 0 };
}

function emptyCompany(): CardPerson {
  return {
    id: uid(),
    kind: "company",
    name: "Building Solutions GmbH",
    role: "Elektro- und Gebäudetechnik",
    phone: "+49 (0) 7352 6118 0",
    mobile: "+49 (0) 7352 6118 99",
    email: "info@buildingsolutions.de",
    primaryLocationIdx: 0,
  };
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
  const kind: CardKind = person.kind || "person";
  // Pozycja jest stała: locations[0] zawsze po lewej, locations[1] zawsze po prawej.
  // person  → pełny adres tylko na wybranej u pracownika lokalizacji „głównej",
  //           pod każdym adresem prefiks z nazwą firmy
  // company → oba adresy pełne, bez prefiksu z nazwą firmy (firma jest u góry karty)
  const left = locations[0];
  const right = locations[1];
  const isCompany = kind === "company";
  const labels = isCompany
    ? { phone: "T", mobile: "F", email: "E" }
    : { phone: "T", mobile: "M", email: "E" };

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

      {/* Główka karty: person → imię + stanowisko, company → firma + tagline */}
      <div style={{ marginBottom: "2mm" }}>
        <div style={{ fontSize: "11pt", fontWeight: 500, lineHeight: 1.15, letterSpacing: "0.01em" }}>
          {person.name || (isCompany ? "Firmenname" : "Vor- Nachname")}
        </div>
        <div style={{ fontSize: "9.5pt", color: COLOR_TEAL, fontWeight: 400, marginTop: "0.5mm" }}>
          {person.role || (isCompany ? "Slogan" : "Position")}
        </div>
      </div>

      {/* Kontakt: person → T/M/E, company → T/F/E */}
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
            <span style={{ color: COLOR_TEAL, fontWeight: 500 }}>{labels.phone}:</span>
            <span>{person.phone}</span>
          </>
        )}
        {person.mobile && (
          <>
            <span style={{ color: COLOR_TEAL, fontWeight: 500 }}>{labels.mobile}:</span>
            <span>{person.mobile}</span>
          </>
        )}
        {person.email && (
          <>
            <span style={{ color: COLOR_TEAL, fontWeight: 500 }}>{labels.email}:</span>
            <span>{person.email}</span>
          </>
        )}
      </div>

      {/* Adresy: locations[0] zawsze po lewej, locations[1] zawsze po prawej.
          person  → pełny adres tylko na lokalizacji wybranej jako „Hauptstandort", prefix z nazwą firmy
          company → oba adresy pełne, bez prefiksu z nazwą firmy (firma jest u góry karty) */}
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
            {!isCompany && <div style={{ fontWeight: 500 }}>{left.company}</div>}
            <div style={{ fontWeight: 500 }}>{left.label}</div>
            {(isCompany || person.primaryLocationIdx === 0) && left.street && (
              <div style={{ color: COLOR_TEAL, marginTop: "0.5mm" }}>{left.street}</div>
            )}
            {(isCompany || person.primaryLocationIdx === 0) && left.zipCity && (
              <div style={{ color: COLOR_TEAL }}>{left.zipCity}</div>
            )}
          </div>
        )}
        {right && (
          <div>
            {!isCompany && <div style={{ fontWeight: 500 }}>{right.company}</div>}
            <div style={{ fontWeight: 500 }}>{right.label}</div>
            {(isCompany || person.primaryLocationIdx === 1) && right.street && (
              <div style={{ color: COLOR_TEAL, marginTop: "0.5mm" }}>{right.street}</div>
            )}
            {(isCompany || person.primaryLocationIdx === 1) && right.zipCity && (
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
          // Defensywnie scal z domyślnymi — starsze zapisy mogą nie mieć bleedMm/cutMarks.
          const mergedSettings: CardSettings = {
            ...defaultConfig.settings,
            ...(data.settings || {}),
          };
          setConfig({
            locations: data.locations,
            persons: data.persons.length ? data.persons : [emptyPerson()],
            settings: mergedSettings,
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

  const addCompany = () => setConfig((c) => ({ ...c, persons: [...c.persons, emptyCompany()] }));

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
    const bleed = Math.max(0, config.settings.bleedMm || 0);
    const datW = size.w + 2 * bleed; // Datenformat
    const datH = size.h + 2 * bleed;
    const showCutMarks = bleed > 0 && config.settings.cutMarks;
    const w = window.open("", "_blank");
    if (!w) return;

    // Karty zawijane w bleed-wrap o wymiarze Datenformatu, sama karta absolutnie wyśrodkowana
    // o wymiarze Endformatu. Schnittmarken — 8 linii w narożnikach Endformatu, w obszarze bleedu.
    const cardsHtml = config.persons
      .map((p) => {
        const isCompany = (p.kind || "person") === "company";
        // Stała pozycja: locations[0] = lewa kolumna, locations[1] = prawa.
        // person  → pełny adres tylko na primary; prefix z nazwą firmy
        // company → oba pełne, bez prefiksu z nazwą firmy
        const left = config.locations[0];
        const right = config.locations[1];
        const renderLoc = (loc: Location | undefined, showFull: boolean) => {
          if (!loc) return "";
          return `
            <div>
              ${!isCompany ? `<div class="bold">${escape(loc.company)}</div>` : ""}
              <div class="bold">${escape(loc.label)}</div>
              ${showFull && loc.street ? `<div class="teal">${escape(loc.street)}</div>` : ""}
              ${showFull && loc.zipCity ? `<div class="teal">${escape(loc.zipCity)}</div>` : ""}
            </div>`;
        };
        const lblPhone = "T";
        const lblMobile = isCompany ? "F" : "M";
        const lblEmail = "E";
        const headName = escape(p.name) || (isCompany ? "Firmenname" : "Vor- Nachname");
        const headRole = escape(p.role) || (isCompany ? "Slogan" : "Position");
        const cutMarksHtml = showCutMarks ? `
          <div class="mark mark-h" style="top:${bleed}mm; left:0; width:${bleed}mm;"></div>
          <div class="mark mark-v" style="top:0; left:${bleed}mm; height:${bleed}mm;"></div>
          <div class="mark mark-h" style="top:${bleed}mm; left:${bleed + size.w}mm; width:${bleed}mm;"></div>
          <div class="mark mark-v" style="top:0; left:${bleed + size.w}mm; height:${bleed}mm;"></div>
          <div class="mark mark-h" style="top:${bleed + size.h}mm; left:0; width:${bleed}mm;"></div>
          <div class="mark mark-v" style="top:${bleed + size.h}mm; left:${bleed}mm; height:${bleed}mm;"></div>
          <div class="mark mark-h" style="top:${bleed + size.h}mm; left:${bleed + size.w}mm; width:${bleed}mm;"></div>
          <div class="mark mark-v" style="top:${bleed + size.h}mm; left:${bleed + size.w}mm; height:${bleed}mm;"></div>
        ` : "";
        return `
        <div class="bleed">
          ${cutMarksHtml}
          <div class="card">
            <img src="${LOGO_URL}" alt="" class="logo" />
            <div class="head">
              <div class="name">${headName}</div>
              <div class="role">${headRole}</div>
            </div>
            <div class="contact">
              ${p.phone ? `<span class="lbl">${lblPhone}:</span><span>${escape(p.phone)}</span>` : ""}
              ${p.mobile ? `<span class="lbl">${lblMobile}:</span><span>${escape(p.mobile)}</span>` : ""}
              ${p.email ? `<span class="lbl">${lblEmail}:</span><span>${escape(p.email)}</span>` : ""}
            </div>
            <div class="addr">
              ${renderLoc(left, isCompany || p.primaryLocationIdx === 0)}
              ${renderLoc(right, isCompany || p.primaryLocationIdx === 1)}
            </div>
          </div>
        </div>`;
      })
      .join("\n");

    const formatInfo = bleed > 0
      ? `Datenformat ${datW}×${datH} mm · Endformat ${size.w}×${size.h} mm · Beschnitt ${bleed} mm${showCutMarks ? " · mit Schnittmarken" : ""}`
      : `Format ${size.w}×${size.h} mm · ohne Beschnitt`;

    w.document.write(`<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>Visitenkarten — Building Solutions (${formatInfo})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${FONT_FAMILY}; color: ${COLOR_NAVY}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
    .bleed {
      position: relative;
      width: ${datW}mm;
      height: ${datH}mm;
      background: #fff;
      page-break-inside: avoid;
    }
    .card {
      position: absolute;
      top: ${bleed}mm;
      left: ${bleed}mm;
      width: ${size.w}mm;
      height: ${size.h}mm;
      background: #fff;
      border-radius: ${corner.radius}mm;
      padding: 5mm 6mm;
      overflow: hidden;
      border: 0.2mm dashed #d1d5db;
    }
    .mark { position: absolute; background: #000; }
    .mark-h { height: 0.15mm; }
    .mark-v { width: 0.15mm; }
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Beschnittzugabe</label>
                <select
                  value={config.settings.bleedMm}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, bleedMm: Number(e.target.value) } })}
                  className={inputClass}
                >
                  <option value={0}>ohne (Endformat)</option>
                  <option value={1}>1 mm (Flyeralarm, Standard DE)</option>
                  <option value={2}>2 mm (Premium-Druckereien)</option>
                  <option value={3}>3 mm (international)</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className={`flex items-center gap-2 text-sm font-medium ${config.settings.bleedMm > 0 ? "text-gray-700 cursor-pointer" : "text-gray-400 cursor-not-allowed"}`}>
                  <input
                    type="checkbox"
                    checked={config.settings.cutMarks}
                    disabled={config.settings.bleedMm === 0}
                    onChange={(e) => setConfig({ ...config, settings: { ...config.settings, cutMarks: e.target.checked } })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Schnittmarken im PDF
                </label>
              </div>
            </div>
            {config.settings.bleedMm > 0 && (
              <p className="text-xs text-gray-500">
                Datenformat im PDF: <strong>{SIZE_PRESETS[config.settings.size].w + 2 * config.settings.bleedMm} × {SIZE_PRESETS[config.settings.size].h + 2 * config.settings.bleedMm} mm</strong> (Endformat {SIZE_PRESETS[config.settings.size].w}×{SIZE_PRESETS[config.settings.size].h} mm + {config.settings.bleedMm} mm Beschnitt rundum). Sicherheitsabstand für Inhalte: 3 mm zur Schnittkante.
              </p>
            )}
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

          {/* Karty (osobowe + firmowe) */}
          {config.persons.map((person, i) => {
            const kind: CardKind = person.kind || "person";
            const isCompany = kind === "company";
            return (
            <div key={person.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  {isCompany ? "Allgemeine Karte" : "Mitarbeiter"} {config.persons.length > 1 ? `#${i + 1}` : ""}
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
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kartentyp</label>
                <select
                  value={kind}
                  onChange={(e) => updatePerson(person.id, "kind", e.target.value as CardKind)}
                  className={inputClass}
                >
                  <option value="person">Personenkarte (Mitarbeiter mit Name + Position)</option>
                  <option value="company">Allgemeine Karte (Firmenname + Slogan, Fax statt Mobil)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{isCompany ? "Firmenname" : "Vor- und Nachname"}</label>
                  <input value={person.name} onChange={(e) => updatePerson(person.id, "name", e.target.value)} className={inputClass} placeholder={isCompany ? "Building Solutions GmbH" : ""} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{isCompany ? "Slogan / Tagline" : "Position"}</label>
                  <input value={person.role} onChange={(e) => updatePerson(person.id, "role", e.target.value)} className={inputClass} placeholder={isCompany ? "Elektro- und Gebäudetechnik" : "Projektleitung"} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">T (Telefon)</label>
                  <input value={person.phone} onChange={(e) => updatePerson(person.id, "phone", e.target.value)} className={inputClass} placeholder="optional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{isCompany ? "F (Fax)" : "M (Mobil)"}</label>
                  <input value={person.mobile} onChange={(e) => updatePerson(person.id, "mobile", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">E (E-Mail)</label>
                  <input value={person.email} onChange={(e) => updatePerson(person.id, "email", e.target.value)} className={inputClass} />
                </div>
              </div>
              {!isCompany && (
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
              )}
              {isCompany && (
                <p className="text-xs text-gray-400">
                  Bei der allgemeinen Karte werden beide Standorte mit vollständiger Adresse angezeigt; der Firmenname erscheint nur einmal oben.
                </p>
              )}
            </div>
          );
          })}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={addPerson}
              className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-medium transition-colors border border-dashed border-gray-300"
            >
              <Plus size={16} />
              Mitarbeiter
            </button>
            <button
              onClick={addCompany}
              className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-600 py-3 rounded-xl text-sm font-medium transition-colors border border-dashed border-gray-300"
            >
              <Plus size={16} />
              Allgemeine Karte
            </button>
          </div>
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
