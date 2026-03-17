"use client";

import { useState, useEffect, useRef } from "react";
import { Printer, Plus, Trash2 } from "lucide-react";

interface ContactData {
  company: string;
  address: string;
  zip: string;
  city: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
}

interface CardPerson {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  mobile: string;
}

const defaultContact: ContactData = {
  company: "Swish Deutschland",
  address: "Ottostr. 14",
  zip: "50170",
  city: "Kerpen",
  phone: "+49 (0) 2273 951 55 77",
  fax: "",
  email: "info@swish-deutschland.de",
  website: "www.swish-deutschland.de",
};

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm";

function createEmptyPerson(): CardPerson {
  return {
    id: crypto.randomUUID(),
    name: "",
    role: "",
    email: "",
    phone: "",
    mobile: "",
  };
}

function BusinessCard({ person, contact, logoUrl }: { person: CardPerson; contact: ContactData; logoUrl: string }) {
  return (
    <div
      className="bg-white border border-gray-300 shadow-sm"
      style={{ width: "90mm", height: "50mm", padding: "6mm 7mm", position: "relative", overflow: "hidden", pageBreakInside: "avoid" }}
    >
      {/* Red accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "#e31837" }} />

      <div style={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Top: Logo + Person */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "11pt", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {person.name || "Name"}
            </div>
            {person.role && (
              <div style={{ fontSize: "7.5pt", color: "#e31837", fontWeight: 600, marginTop: "1px" }}>
                {person.role}
              </div>
            )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} alt={contact.company} style={{ height: "14mm", width: "auto" }} />
        </div>

        {/* Bottom: Contact info */}
        <div style={{ fontSize: "7pt", color: "#4b5563", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: "7.5pt", marginBottom: "1px" }}>
            {contact.company}
          </div>
          <div>{contact.address} | {contact.zip} {contact.city}</div>
          <div>
            {(person.phone || contact.phone) && <>Tel: {person.phone || contact.phone}</>}
            {person.mobile && <> | Mobil: {person.mobile}</>}
            {contact.fax && <> | Fax: {contact.fax}</>}
          </div>
          <div>
            <span style={{ color: "#e31837" }}>{person.email || contact.email}</span>
            <span> | </span>
            <span style={{ color: "#e31837" }}>{contact.website}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessCardsPage() {
  const [contact, setContact] = useState<ContactData>(defaultContact);
  const [persons, setPersons] = useState<CardPerson[]>([{ ...createEmptyPerson(), name: "Max Mustermann", role: "Vertrieb" }]);
  const [logoUrl, setLogoUrl] = useState("/logo-swish-deutschland.png");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/contact")
      .then((r) => r.json())
      .then((data) => {
        if (data.company) {
          setContact({
            company: data.company || defaultContact.company,
            address: data.address || defaultContact.address,
            zip: data.zip || defaultContact.zip,
            city: data.city || defaultContact.city,
            phone: data.phone || defaultContact.phone,
            fax: data.fax || "",
            email: data.email || defaultContact.email,
            website: data.website || defaultContact.website,
          });
        }
      })
      .catch(() => {});
  }, []);

  const addPerson = () => setPersons([...persons, createEmptyPerson()]);

  const removePerson = (id: string) => {
    if (persons.length > 1) setPersons(persons.filter((p) => p.id !== id));
  };

  const updatePerson = (id: string, field: keyof CardPerson, value: string) => {
    setPersons(persons.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Visitenkarten - ${contact.company}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; }
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5mm;
    }
    .card {
      width: 90mm;
      height: 50mm;
      padding: 6mm 7mm;
      position: relative;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      page-break-inside: avoid;
    }
    .card-bar { position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: #e31837; }
    .card-inner { display: flex; height: 100%; flex-direction: column; justify-content: space-between; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .card-name { font-size: 11pt; font-weight: 700; color: #111827; line-height: 1.2; }
    .card-role { font-size: 7.5pt; color: #e31837; font-weight: 600; margin-top: 1px; }
    .card-logo { height: 14mm; width: auto; }
    .card-bottom { font-size: 7pt; color: #4b5563; line-height: 1.6; }
    .card-company { font-weight: 700; color: #111827; font-size: 7.5pt; margin-bottom: 1px; }
    .card-accent { color: #e31837; }
    @media print {
      .card { border: 1px dotted #ccc; }
    }
  </style>
</head>
<body>
  <div class="cards-grid">
    ${persons
      .map(
        (p) => `
      <div class="card">
        <div class="card-bar"></div>
        <div class="card-inner">
          <div class="card-top">
            <div>
              <div class="card-name">${p.name || "Name"}</div>
              ${p.role ? `<div class="card-role">${p.role}</div>` : ""}
            </div>
            <img src="${logoUrl.startsWith("/") ? `https://swish-deutschland.vercel.app${logoUrl}` : logoUrl}" alt="${contact.company}" class="card-logo" />
          </div>
          <div class="card-bottom">
            <div class="card-company">${contact.company}</div>
            <div>${contact.address} | ${contact.zip} ${contact.city}</div>
            <div>
              ${(p.phone || contact.phone) ? `Tel: ${p.phone || contact.phone}` : ""}
              ${p.mobile ? ` | Mobil: ${p.mobile}` : ""}
              ${contact.fax ? ` | Fax: ${contact.fax}` : ""}
            </div>
            <div>
              <span class="card-accent">${p.email || contact.email}</span>
              <span> | </span>
              <span class="card-accent">${contact.website}</span>
            </div>
          </div>
        </div>
      </div>`
      )
      .join("\n")}
  </div>
  <script>window.onload=function(){window.print()}<\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitenkarten</h1>
          <p className="text-sm text-gray-500 mt-1">
            Erstellen und drucken Sie Visitenkarten mit Firmenlogo
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Printer size={16} />
          Drucken / PDF
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          {/* Company info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Firmendaten</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Firma</label>
                <input value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Telefon</label>
                <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Straße</label>
                <input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">PLZ</label>
                <input value={contact.zip} onChange={(e) => setContact({ ...contact, zip: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Stadt</label>
                <input value={contact.city} onChange={(e) => setContact({ ...contact, city: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Logo-Pfad</label>
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Persons */}
          {persons.map((person, i) => (
            <div key={person.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Mitarbeiter {persons.length > 1 ? `#${i + 1}` : ""}
                </h2>
                {persons.length > 1 && (
                  <button onClick={() => removePerson(person.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                  <input value={person.name} onChange={(e) => updatePerson(person.id, "name", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                  <input value={person.role} onChange={(e) => updatePerson(person.id, "role", e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">E-Mail</label>
                <input value={person.email} onChange={(e) => updatePerson(person.id, "email", e.target.value)} placeholder={contact.email} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Telefon</label>
                  <input value={person.phone} onChange={(e) => updatePerson(person.id, "phone", e.target.value)} placeholder={contact.phone} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mobil</label>
                  <input value={person.mobile} onChange={(e) => updatePerson(person.id, "mobile", e.target.value)} className={inputClass} />
                </div>
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

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Vorschau ({persons.length} {persons.length === 1 ? "Karte" : "Karten"})
            </h2>
            <div ref={printRef} className="space-y-4">
              {persons.map((person) => (
                <div key={person.id} className="flex justify-center">
                  <BusinessCard person={person} contact={contact} logoUrl={logoUrl} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Hinweis</h2>
            <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
              <li>Standard-Visitenkartengröße: 90 x 50 mm</li>
              <li>Klicken Sie auf &quot;Drucken / PDF&quot; um die Karten auszudrucken oder als PDF zu speichern</li>
              <li>Für den professionellen Druck empfehlen wir die PDF-Version</li>
              <li>Es werden je 2 Karten nebeneinander auf A4 gedruckt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
