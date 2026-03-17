"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";

interface ContactData {
  company: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  taxId: string;
  managingDirector: string;
}

const defaultContact: ContactData = {
  company: "Swish Deutschland",
  address: "Ottostr. 14",
  zip: "50170",
  city: "Kerpen",
  country: "Deutschland",
  phone: "+49 (0) 2273 951 55 77",
  fax: "",
  email: "info@swish-deutschland.de",
  website: "www.swish-deutschland.de",
  taxId: "",
  managingDirector: "",
};

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm";

export default function EmailSignaturePage() {
  const [contact, setContact] = useState<ContactData>(defaultContact);
  const [personName, setPersonName] = useState("Max Mustermann");
  const [personRole, setPersonRole] = useState("Vertrieb");
  const [personEmail, setPersonEmail] = useState("");
  const [personPhone, setPersonPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("https://swish-deutschland.vercel.app/logo-swish-deutschland.png");
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/contact")
      .then((r) => r.json())
      .then((data) => {
        if (data.company) setContact(data);
      })
      .catch(() => {});
  }, []);

  const signatureHtml = `<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333333;line-height:1.5;max-width:500px;">
  <tr>
    <td style="padding-right:18px;vertical-align:top;border-right:3px solid #e31837;">
      <img src="${logoUrl}" alt="${contact.company}" width="140" style="display:block;" />
    </td>
    <td style="padding-left:18px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size:15px;font-weight:bold;color:#111827;padding-bottom:2px;">${personName}</td>
        </tr>
        ${personRole ? `<tr><td style="font-size:12px;color:#e31837;font-weight:600;padding-bottom:8px;">${personRole}</td></tr>` : ""}
        <tr>
          <td style="font-size:12px;color:#4b5563;padding-bottom:1px;">
            <strong>${contact.company}</strong>
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#4b5563;padding-bottom:1px;">${contact.address}, ${contact.zip} ${contact.city}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#4b5563;padding-bottom:1px;">
            Tel: ${personPhone || contact.phone}${contact.fax ? ` | Fax: ${contact.fax}` : ""}
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;padding-bottom:1px;">
            <a href="mailto:${personEmail || contact.email}" style="color:#e31837;text-decoration:none;">${personEmail || contact.email}</a>
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;">
            <a href="https://${contact.website}" style="color:#e31837;text-decoration:none;">${contact.website}</a>
          </td>
        </tr>
        ${contact.managingDirector ? `<tr><td style="font-size:10px;color:#9ca3af;padding-top:8px;">Geschäftsführer: ${contact.managingDirector}</td></tr>` : ""}
        ${contact.taxId ? `<tr><td style="font-size:10px;color:#9ca3af;">USt-IdNr.: ${contact.taxId}</td></tr>` : ""}
      </table>
    </td>
  </tr>
</table>`;

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(signatureHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = signatureHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyRich = async () => {
    try {
      const blob = new Blob([signatureHtml], { type: "text/html" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      handleCopyHtml();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-Mail-Signatur</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generieren Sie professionelle E-Mail-Signaturen für Mitarbeiter
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Mitarbeiter-Daten</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input value={personName} onChange={(e) => setPersonName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Position / Abteilung</label>
              <input value={personRole} onChange={(e) => setPersonRole(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">E-Mail (optional)</label>
              <input
                value={personEmail}
                onChange={(e) => setPersonEmail(e.target.value)}
                placeholder={contact.email}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefon (optional)</label>
              <input
                value={personPhone}
                onChange={(e) => setPersonPhone(e.target.value)}
                placeholder={contact.phone}
                className={inputClass}
              />
            </div>
          </div>

          <hr className="border-gray-100" />
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Firmendaten</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Firma</label>
              <input value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefon (Firma)</label>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Geschäftsführer</label>
              <input value={contact.managingDirector} onChange={(e) => setContact({ ...contact, managingDirector: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">USt-IdNr.</label>
              <input value={contact.taxId} onChange={(e) => setContact({ ...contact, taxId: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Logo-URL</label>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Vollständige URL zum Logo (muss öffentlich erreichbar sein)</p>
          </div>
        </div>

        {/* Preview + Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Vorschau</h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div ref={previewRef} dangerouslySetInnerHTML={{ __html: signatureHtml }} />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopyRich}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Kopiert!" : "Signatur kopieren (für E-Mail-Client)"}
            </button>
            <button
              onClick={handleCopyHtml}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              <RefreshCw size={14} />
              HTML kopieren
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Anleitung</h2>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Füllen Sie die Mitarbeiter-Daten aus</li>
              <li>Klicken Sie auf &quot;Signatur kopieren&quot;</li>
              <li><strong>Outlook:</strong> Datei → Optionen → E-Mail → Signaturen → Neue Signatur → Einfügen (Strg+V)</li>
              <li><strong>Gmail:</strong> Einstellungen → Alle Einstellungen → Signatur → Einfügen (Strg+V)</li>
              <li><strong>Thunderbird:</strong> Kontoeinstellungen → Signatur als HTML → HTML-Code einfügen</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
