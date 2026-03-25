"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileUp, Languages, Download, Loader2, FileText, Image as ImageIcon,
  Eye, Edit3, Upload, RefreshCw, Printer, Save, Trash2, Link2
} from "lucide-react";

type DocType = "product" | "sds" | "hygiene";
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
  const [saving, setSaving] = useState(false);
  const [savedSheets, setSavedSheets] = useState<{ id: string; productName: string; type: string; assignedSlug: string | null; createdAt: number }[]>([]);
  const [products, setProducts] = useState<{ slug: string; name: string }[]>([]);
  const [assignSlug, setAssignSlug] = useState("");

  // Load saved sheets and products
  useEffect(() => {
    fetch("/api/admin/product-sheets").then(r => r.json()).then(setSavedSheets).catch(() => {});
    fetch("/api/products").then(r => r.json()).then((data: { slug: string; name: string }[]) => setProducts(data)).catch(() => {});
  }, []);

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

      // Use local worker
      if (typeof window !== "undefined") {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = (content.items as unknown[])
          .filter((item) => typeof (item as { str?: string }).str === "string")
          .map((item) => (item as { str: string }).str)
          .join(" ");
        fullText += pageText + "\n\n";
      }

      setOriginalText(fullText.trim());
      setStep("translate");
    } catch (err: unknown) {
      console.error("PDF extraction error:", err);
      setError(err instanceof Error ? err.message : "PDF-Extraktion fehlgeschlagen. Bitte Text manuell einfügen.");
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
      // Remove markdown code fences if present
      text = text.replace(/^```html?\n?/i, "").replace(/\n?```$/i, "");
      text = text.replace(/\[FIRMENNAME\]/g, company.name);
      text = text.replace(/\[ADRESSE\]/g, company.address);
      text = text.replace(/\[TELEFON\]/g, company.phone);
      text = text.replace(/\[EMAIL\]/g, company.email);
      text = text.replace(/\[WEBSITE\]/g, company.website);
      // Also replace Polish company data that might not have been replaced
      text = text.replace(/Swish Polska[^<]*?Warszawa/g, `${company.name}<br/>${company.sub}<br/>${company.address}`);
      text = text.replace(/biuro@swishclean\.pl/g, company.email);
      text = text.replace(/swishclean\.pl/g, company.website);
      text = text.replace(/swishclean\.com/g, company.website);
      text = text.replace(/22\s*31\s*47\s*10[24]/g, company.phone);
      text = text.replace(/ul\.\s*Pańska\s*73/g, company.address);
      text = text.replace(/00-834\s*Warszawa/g, "50170 Kerpen");
      // Remove NIP/KRS/REGON lines
      text = text.replace(/NIP[:\s]*\d+/g, "");
      text = text.replace(/KRS[:\s]*\d+/g, "");
      text = text.replace(/REGON[:\s]*\d+/g, "");

      setTranslatedText(text);
      setStep("edit");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setTranslating(false);
    }
  }

  // Handle image upload (logo or product)
  // Store logo and product image as base64 directly when uploaded
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [productImageBase64, setProductImageBase64] = useState<string | null>(null);

  // Convert file to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Load default logo as base64 on mount
  useEffect(() => {
    fetch("/logo-swish-deutschland.png")
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoBase64(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
  }, []);

  // Save sheet to server and reset form
  async function handleSaveSheet() {
    setSaving(true);
    try {
      // Use stored base64 images
      const logoB64 = logoBase64;
      const productImgB64 = productImageBase64;

      if (docType === "hygiene") {
        // Save as hygiene plan
        await fetch("/api/admin/hygiene-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: assignSlug || "sanitary",
            htmlContent: translatedText,
          }),
        });
      } else {
        // Save as product sheet
        const res = await fetch("/api/admin/product-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName,
            type: docType,
            htmlContent: translatedText,
            logoBase64: logoB64,
            productImageBase64: productImgB64,
            assignedSlug: assignSlug || null,
          }),
        });
        const saved = await res.json();
        setSavedSheets((prev) => [...prev, saved]);
      }
      // Reset form
      setStep("upload");
      setOriginalText("");
      setTranslatedText("");
      setProductName("");
      setProductImageUrl("");
      setAssignSlug("");
      setError("");
    } catch {
      setError("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  // Delete sheet
  async function handleDeleteSheet(id: string) {
    await fetch(`/api/admin/product-sheets?id=${id}`, { method: "DELETE" });
    setSavedSheets((prev) => prev.filter((s) => s.id !== id));
  }

  // Assign sheet to product
  async function handleAssignSheet(id: string, slug: string) {
    await fetch("/api/admin/product-sheets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, assignedSlug: slug || null }),
    });
    setSavedSheets((prev) => prev.map((s) => s.id === id ? { ...s, assignedSlug: slug || null } : s));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "product") {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const b64 = await fileToBase64(file);
    if (type === "logo") {
      setLogoUrl(url);
      setLogoBase64(b64);
    } else {
      setProductImageUrl(url);
      setProductImageBase64(b64);
    }
  }

  // Generate and download PDF
  function handleDownloadPDF() {
    // Create a printable HTML document
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Use the HTML directly from ChatGPT translation
    const bodyHtml = translatedText;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${productName} - Produktdatenblatt</title>
  <style>
    @page { margin: 12mm 15mm; size: A4; }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #111827; font-size: 10.5px; line-height: 1.6; }
    .header { background: #dc2626; color: white; padding: 18px 28px; display: flex; justify-content: space-between; align-items: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .header-left { display: flex; align-items: center; gap: 14px; }
    .header-left img { height: 36px; }
    .header-left .brand { font-size: 18px; font-weight: bold; }
    .header-left .sub { font-size: 9px; opacity: 0.8; }
    .header-right { text-align: right; font-size: 8.5px; line-height: 1.6; }
    .header-right .label { font-weight: bold; font-size: 9px; margin-top: 6px; letter-spacing: 1px; opacity: 0.85; }
    .content { padding: 20px 28px 60px; }
    .product-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .product-name { font-size: 24px; font-weight: bold; color: #111827; margin: 0; }
    .product-badge { display: inline-block; background: #dc2626; color: white; font-size: 7.5px; font-weight: bold; padding: 2px 10px; border-radius: 10px; margin-top: 5px; letter-spacing: 0.5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .product-image { width: 110px; height: 140px; object-fit: contain; }
    .content h2 { color: #dc2626; font-size: 13px; font-weight: bold; margin: 16px 0 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; }
    .content h3 { color: #111827; font-size: 11.5px; font-weight: bold; margin: 12px 0 4px; }
    .content p { margin: 4px 0; text-align: justify; }
    .content ul { margin: 4px 0 4px 20px; padding: 0; }
    .content li { margin: 2px 0; }
    .content table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
    .content td, .content th { padding: 4px 8px; border: 1px solid #e5e7eb; text-align: left; }
    .content th { background: #f9fafb; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .content hr { border: none; border-top: 2px solid #dc2626; margin: 20px 0; page-break-before: always; }
    .content strong { color: #111827; }
    .footer { background: #1f2937; color: #9ca3af; padding: 10px 28px; font-size: 7.5px; display: flex; justify-content: space-between; position: fixed; bottom: 0; left: 0; right: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
              <button
                onClick={() => setDocType("hygiene")}
                className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                  docType === "hygiene" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText size={24} className="mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-sm">Hygieneplan</p>
                <p className="text-xs text-gray-400 mt-1">Plan higieny</p>
              </button>
            </div>

            {/* Hygiene category selector */}
            {docType === "hygiene" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                <select
                  value={assignSlug}
                  onChange={(e) => setAssignSlug(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
                >
                  <option value="sanitary">Sanitäranlagen</option>
                  <option value="kitchen">Restaurant – Küche</option>
                  <option value="dining">Restaurant – Gastraum</option>
                </select>
              </div>
            )}
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

              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto
                  prose-h2:text-red-600 prose-h2:text-base prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-2 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-1
                  prose-h3:text-gray-900 prose-h3:text-sm prose-h3:font-bold prose-h3:mt-4 prose-h3:mb-1
                  prose-p:text-[13px] prose-p:my-1
                  prose-li:text-[13px]
                  prose-table:text-[12px] prose-td:px-2 prose-td:py-1 prose-td:border prose-td:border-gray-200
                  prose-th:px-2 prose-th:py-1 prose-th:border prose-th:border-gray-200 prose-th:bg-gray-50 prose-th:font-bold"
                dangerouslySetInnerHTML={{ __html: translatedText }}
              />
            </div>

            {/* Footer preview */}
            <div className="bg-gray-800 text-gray-400 px-6 py-3 text-xs flex justify-between">
              <span>{company.name} — {company.sub} | {company.address}</span>
              <span className="text-white font-medium">{company.website}</span>
            </div>
          </div>

          {/* Assign to product */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Produkt zuordnen (optional)</label>
            <select
              value={assignSlug}
              onChange={(e) => setAssignSlug(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500"
            >
              <option value="">— Kein Produkt —</option>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
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
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50"
            >
              <Download size={18} />
              PDF herunterladen
            </button>
            <button
              onClick={handleSaveSheet}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 text-lg disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {saving ? "Wird gespeichert..." : "Speichern & Zuordnen"}
            </button>
          </div>
        </div>
      )}

      {/* Saved Sheets List */}
      {savedSheets.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-red-500" />
            Gespeicherte Datenblätter ({savedSheets.length})
          </h2>
          <div className="space-y-3">
            {savedSheets.map((sheet) => (
              <div key={sheet.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{sheet.productName}</p>
                  <p className="text-xs text-gray-400">
                    {sheet.type === "product" ? "Produktdatenblatt" : "Sicherheitsdatenblatt"}
                    {" · "}
                    {new Date(sheet.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sheet.assignedSlug || ""}
                    onChange={(e) => handleAssignSheet(sheet.id, e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 max-w-[150px]"
                  >
                    <option value="">Nicht zugeordnet</option>
                    {products.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.name}</option>
                    ))}
                  </select>
                  {sheet.assignedSlug && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Link2 size={12} /> Zugeordnet
                    </span>
                  )}
                  <button
                    onClick={() => window.open(`/api/admin/product-sheets/view?id=${sheet.id}`, "_blank")}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Vorschau"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteSheet(sheet.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
