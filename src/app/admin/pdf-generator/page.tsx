"use client";

import { useState, useRef } from "react";
import {
  FileUp, Languages, Download, Loader2, FileText, Image as ImageIcon,
  Eye, Edit3, Upload, RefreshCw, Printer
} from "lucide-react";

type DocType = "product" | "sds";
type Step = "upload" | "translate" | "edit" | "preview";

export default function PDFGeneratorPage() {
  const [step, setStep] = useState<Step>("upload");
  const [docType, setDocType] = useState<DocType>("product");
  const [originalText, setOriginalText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [productName, setProductName] = useState("");
  const [translating, setTranslating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo-swish-deutschland.png");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImgInputRef = useRef<HTMLInputElement>(null);

  // Company data (Swish Deutschland)
  const company = {
    name: "Swish Deutschland",
    sub: "eine Marke der Building Solutions GmbH",
    address: "Ottostr. 14, 50170 Kerpen, Deutschland",
    phone: "+49 (0) 2273 951 55 0",
    email: "info@swish-deutschland.de",
    website: "www.swish-deutschland.de",
  };

  // Step 1: Upload PDF and extract text
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setExtracting(true);

    // Try to get product name from filename
    const name = file.name.replace(/\.pdf$/i, "").replace(/-/g, " ").replace(/karta.*$/i, "").trim();
    if (!productName) setProductName(name);

    try {
      // Extract text client-side using pdfjs-dist
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: unknown) => (item as { str?: string }).str || "")
          .join(" ");
        fullText += pageText + "\n\n";
      }

      setOriginalText(fullText.trim());
      setStep("translate");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "PDF-Extraktion fehlgeschlagen");
    } finally {
      setExtracting(false);
    }
  }

  // Step 2: Translate with ChatGPT
  async function handleTranslate() {
    setError("");
    setTranslating(true);

    try {
      const res = await fetch("/api/admin/pdf-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, type: docType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Replace placeholders with company data
      let text = data.translated;
      text = text.replace(/\[FIRMENNAME\]/g, company.name);
      text = text.replace(/\[ADRESSE\]/g, company.address);
      text = text.replace(/\[TELEFON\]/g, company.phone);
      text = text.replace(/\[EMAIL\]/g, company.email);
      // Also replace Polish company data
      text = text.replace(/Swish Polska[^]*?Warszawa/g, `${company.name}\n${company.sub}\n${company.address}`);
      text = text.replace(/biuro@swishclean\.pl/g, company.email);
      text = text.replace(/swishclean\.pl/g, company.website);
      text = text.replace(/swishclean\.com/g, company.website);
      text = text.replace(/22\s*31\s*47\s*10[24]/g, company.phone);
      text = text.replace(/ul\.\s*Pańska\s*73/g, company.address);
      text = text.replace(/00-834\s*Warszawa/g, "50170 Kerpen");

      setTranslatedText(text);
      setStep("edit");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  // Handle image upload (logo or product)
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "product") {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "logo") setLogoUrl(url);
    else setProductImageUrl(url);
  }

  // Generate and download PDF
  function handleDownloadPDF() {
    // Create a printable HTML document
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sections = translatedText.split("\n").filter(Boolean);
    const bodyHtml = sections
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        // Detect headers (ALL CAPS or starts with number followed by dot)
        if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 100) {
          return `<h2 style="color:#dc2626;font-size:14px;margin:18px 0 6px;font-weight:bold;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${trimmed}</h2>`;
        }
        if (/^\d+\./.test(trimmed) && trimmed.length < 80) {
          return `<h3 style="color:#111827;font-size:12px;margin:14px 0 4px;font-weight:bold;">${trimmed}</h3>`;
        }
        return `<p style="margin:3px 0;font-size:10.5px;line-height:1.5;color:#374151;">${trimmed}</p>`;
      })
      .join("\n");

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${productName} - Produktdatenblatt</title>
  <style>
    @page { margin: 15mm; size: A4; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111827; }
    .header { background: #dc2626; color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-left img { height: 40px; }
    .header-left .brand { font-size: 20px; font-weight: bold; }
    .header-left .sub { font-size: 10px; opacity: 0.8; }
    .header-right { text-align: right; font-size: 9px; line-height: 1.6; }
    .header-right .label { font-weight: bold; font-size: 10px; margin-top: 8px; letter-spacing: 1px; }
    .content { padding: 24px 30px; }
    .product-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .product-name { font-size: 26px; font-weight: bold; color: #111827; }
    .product-badge { display: inline-block; background: #dc2626; color: white; font-size: 8px; font-weight: bold; padding: 3px 10px; border-radius: 10px; margin-top: 6px; letter-spacing: 0.5px; }
    .product-image { width: 120px; height: 150px; object-fit: contain; }
    .footer { background: #1f2937; color: #9ca3af; padding: 12px 30px; font-size: 8px; display: flex; justify-content: space-between; position: fixed; bottom: 0; left: 0; right: 0; }
    .footer strong { color: white; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height:40px;filter:brightness(0) invert(1);" />` : ""}
      <div>
        <div class="brand">Swish Deutschland</div>
        <div class="sub">${company.sub}</div>
      </div>
    </div>
    <div class="header-right">
      ${company.website}<br/>
      Tel: ${company.phone}<br/>
      ${company.email}
      <div class="label">PRODUKTDATENBLATT</div>
    </div>
  </div>

  <div class="content">
    <div class="product-header">
      <div>
        <div class="product-name">${productName}</div>
        <div class="product-badge">${docType === "product" ? "PROFESSIONAL LINE" : "SICHERHEITSDATENBLATT"}</div>
      </div>
      ${productImageUrl ? `<img src="${productImageUrl}" class="product-image" />` : ""}
    </div>

    ${bodyHtml}
  </div>

  <div class="footer">
    <span>${company.name} — ${company.sub} | ${company.address}</span>
    <span><strong>Tel:</strong> ${company.phone} | <strong>E-Mail:</strong> ${company.email} | <strong>Web:</strong> ${company.website}</span>
  </div>

  <script>
    setTimeout(() => { window.print(); }, 500);
  </script>
</body>
</html>`);
    printWindow.document.close();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Printer className="text-red-600" size={28} />
          PDF-Generator
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Polnische Produktdatenblätter automatisch ins Deutsche übersetzen
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[
          { key: "upload", label: "1. Upload", icon: FileUp },
          { key: "translate", label: "2. Übersetzen", icon: Languages },
          { key: "edit", label: "3. Bearbeiten", icon: Edit3 },
          { key: "preview", label: "4. Download", icon: Download },
        ].map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.key;
          const isDone = ["upload", "translate", "edit", "preview"].indexOf(step) > i;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isDone || isActive) setStep(s.key as Step);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : isDone
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Icon size={16} />
                {s.label}
              </button>
              {i < 3 && <span className="text-gray-300">→</span>}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Document type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Dokumenttyp</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setDocType("product")}
                className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                  docType === "product" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText size={24} className="mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-sm">Produktdatenblatt</p>
                <p className="text-xs text-gray-400 mt-1">Karta opisowa produktu</p>
              </button>
              <button
                onClick={() => setDocType("sds")}
                className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                  docType === "sds" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText size={24} className="mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-sm">Sicherheitsdatenblatt (SDB)</p>
                <p className="text-xs text-gray-400 mt-1">Karta charakterystyki (SDS/MSDS)</p>
              </button>
            </div>
          </div>

          {/* Branding settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {logoUrl && (
                    <div className="w-24 h-16 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 p-2">
                      <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Ändern
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "logo")}
                  />
                </div>
              </div>

              {/* Product image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Produktbild</label>
                <div className="flex items-center gap-4">
                  {productImageUrl ? (
                    <div className="w-24 h-16 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 p-2">
                      <img src={productImageUrl} alt="Product" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <ImageIcon size={20} className="text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={() => productImgInputRef.current?.click()}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    {productImageUrl ? "Ändern" : "Hinzufügen"}
                  </button>
                  <input
                    ref={productImgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "product")}
                  />
                </div>
              </div>
            </div>

            {/* Product name */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Produktname</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="z.B. Poly Lock Ultra"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* File upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">PDF hochladen (polnisch)</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all"
            >
              {extracting ? (
                <Loader2 size={40} className="mx-auto text-red-500 animate-spin" />
              ) : (
                <Upload size={40} className="mx-auto text-gray-400" />
              )}
              <p className="mt-4 text-gray-600 font-medium">
                {extracting ? "Text wird extrahiert..." : "Polnische PDF-Datei hier hochladen"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Produktdatenblatt oder Sicherheitsdatenblatt (PDF)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Or paste text manually */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Oder Text manuell einfügen:</p>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                rows={6}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Polnischen Text hier einfügen..."
              />
              {originalText && (
                <button
                  onClick={() => setStep("translate")}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Weiter →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Translate */}
      {step === "translate" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Originaltext (Polnisch)</h2>
              <span className="text-xs text-gray-400">{originalText.length} Zeichen</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{originalText.slice(0, 3000)}</pre>
              {originalText.length > 3000 && <p className="text-xs text-gray-400 mt-2">... und {originalText.length - 3000} weitere Zeichen</p>}
            </div>
          </div>

          <button
            onClick={handleTranslate}
            disabled={translating}
            className="w-full flex items-center justify-center gap-3 bg-red-600 text-white px-6 py-4 rounded-xl font-medium text-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {translating ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Wird übersetzt mit ChatGPT...
              </>
            ) : (
              <>
                <Languages size={24} />
                Jetzt übersetzen (PL → DE)
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Edit */}
      {step === "edit" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Edit3 size={18} />
                Übersetzung bearbeiten
              </h2>
              <button
                onClick={handleTranslate}
                disabled={translating}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <RefreshCw size={14} className={translating ? "animate-spin" : ""} />
                Neu übersetzen
              </button>
            </div>
            <textarea
              value={translatedText}
              onChange={(e) => setTranslatedText(e.target.value)}
              rows={25}
              className="w-full border border-gray-300 rounded-lg p-4 text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-y"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("translate")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ← Zurück
            </button>
            <button
              onClick={() => setStep("preview")}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700"
            >
              <Eye size={18} />
              Vorschau & Download
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Download */}
      {step === "preview" && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            {/* Header preview */}
            <div className="bg-red-600 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="h-10 brightness-0 invert" />
                )}
                <div>
                  <div className="text-lg font-bold">Swish Deutschland</div>
                  <div className="text-xs opacity-80">{company.sub}</div>
                </div>
              </div>
              <div className="text-right text-xs leading-relaxed">
                <div>{company.website}</div>
                <div>Tel: {company.phone}</div>
                <div>{company.email}</div>
                <div className="font-bold mt-1 tracking-wider text-red-200">PRODUKTDATENBLATT</div>
              </div>
            </div>

            {/* Content preview */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{productName || "Produktname"}</h2>
                  <span className="inline-block mt-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {docType === "product" ? "PROFESSIONAL LINE" : "SICHERHEITSDATENBLATT"}
                  </span>
                </div>
                {productImageUrl && (
                  <img src={productImageUrl} alt="Product" className="w-24 h-28 object-contain" />
                )}
              </div>

              <hr className="mb-4" />

              <div className="prose prose-sm max-w-none text-gray-700 text-[13px] leading-relaxed max-h-96 overflow-y-auto">
                {translatedText.split("\n").filter(Boolean).map((line, i) => {
                  const t = line.trim();
                  if (!t) return null;
                  if (t === t.toUpperCase() && t.length > 3 && t.length < 100) {
                    return <h3 key={i} className="text-red-600 font-bold text-sm mt-4 mb-1 border-b border-gray-200 pb-1">{t}</h3>;
                  }
                  if (/^\d+\./.test(t) && t.length < 80) {
                    return <h4 key={i} className="font-bold text-sm mt-3 mb-1">{t}</h4>;
                  }
                  return <p key={i} className="my-0.5">{t}</p>;
                })}
              </div>
            </div>

            {/* Footer preview */}
            <div className="bg-gray-800 text-gray-400 px-6 py-3 text-xs flex justify-between">
              <span>{company.name} — {company.sub} | {company.address}</span>
              <span className="text-white font-medium">{company.website}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("edit")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ← Bearbeiten
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 text-lg"
            >
              <Download size={20} />
              Als PDF herunterladen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
