"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import PageBanner from "@/components/layout/PageBanner";
import { Camera, Upload, Loader2, Sparkles, ArrowRight, Check, AlertCircle, RotateCcw } from "lucide-react";

interface ScanResult {
  surface: string;
  dirt: string;
  intensity: string;
  products: { name: string; reason: string }[];
  tips: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  scansPerMonth: number;
  features: string[];
}

export default function AIBeraterPage() {
  const t = useTranslations("products");
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/ai-advisor/config")
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled);
        setPlans(data.plans || []);
      })
      .catch(() => setEnabled(false));
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!imagePreview) return;
    setScanning(true);
    setError("");

    try {
      const res = await fetch("/api/ai-advisor/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imagePreview,
          userId: "public",
          planId: "basic", // TODO: from user subscription
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.result) {
        setResult(data.result);
        setUsage(data.usage);
        setLimit(data.limit);
      }
    } catch {
      setError("Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setScanning(false);
    }
  }

  function reset() {
    setImagePreview(null);
    setResult(null);
    setError("");
  }

  if (enabled === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (enabled === false) return (
    <div className="min-h-screen">
      <PageBanner title="AI-Produktberater" />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Brain className="mx-auto text-gray-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-900">Demnächst verfügbar</h2>
        <p className="mt-3 text-gray-500">Der KI-gestützte Produktberater wird in Kürze freigeschaltet.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bs-gray-50">
      <PageBanner title="AI-Produktberater" subtitle="Fotografieren Sie die Oberfläche — unsere KI empfiehlt das richtige Produkt" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!imagePreview && !result && (
          <div className="space-y-6">
            {/* Upload options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="group p-8 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-bs-accent-light hover:bg-blue-50/30 transition-all text-center"
              >
                <Camera size={48} className="mx-auto text-gray-400 group-hover:text-bs-accent transition-colors" />
                <p className="mt-3 font-semibold text-gray-700">Foto aufnehmen</p>
                <p className="text-xs text-gray-400 mt-1">Kamera öffnen</p>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group p-8 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-bs-accent-light hover:bg-blue-50/30 transition-all text-center"
              >
                <Upload size={48} className="mx-auto text-gray-400 group-hover:text-bs-accent transition-colors" />
                <p className="mt-3 font-semibold text-gray-700">Bild hochladen</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG von Ihrem Gerät</p>
              </button>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

            {/* Plans */}
            {plans.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Verfügbare Tarife</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className={`p-5 rounded-xl border ${plan.price === 0 ? "bg-white border-gray-200" : "bg-white border-bs-accent200 ring-1 ring-red-100"}`}>
                      <h3 className="font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-2xl font-bold text-bs-accent mt-2">
                        {plan.price === 0 ? "Kostenlos" : `${plan.price} €`}
                        {plan.price > 0 && <span className="text-sm text-gray-400 font-normal">/Monat</span>}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <Check size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image preview + scan */}
        {imagePreview && !result && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <img src={imagePreview} alt="Vorschau" className="w-full max-h-96 object-contain bg-gray-50" />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-blue-50 border border-bs-accent200 text-bs-accent-dark px-4 py-3 rounded-lg text-sm">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={reset} className="px-5 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                <RotateCcw size={16} className="inline mr-2" />Anderes Bild
              </button>
              <button onClick={handleScan} disabled={scanning}
                className="flex-1 flex items-center justify-center gap-2 bg-bs-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-bs-accent-dark disabled:opacity-50 text-lg">
                {scanning ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {scanning ? "Wird analysiert..." : "Oberfläche analysieren"}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Analysis summary */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-bs-accent" />
                Analyse-Ergebnis
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-600 font-medium">Oberfläche</p>
                  <p className="font-bold text-gray-900 mt-1">{result.surface || "—"}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl">
                  <p className="text-xs text-orange-600 font-medium">Verschmutzung</p>
                  <p className="font-bold text-gray-900 mt-1">{result.dirt || "—"}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-xs text-purple-600 font-medium">Intensität</p>
                  <p className="font-bold text-gray-900 mt-1">{result.intensity || "—"}</p>
                </div>
              </div>
            </div>

            {/* Recommended products */}
            {result.products && result.products.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Empfohlene Produkte</h3>
                <div className="space-y-3">
                  {result.products.map((p, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-bs-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-bs-accent font-bold text-sm">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{p.name}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">{p.reason}</p>
                      </div>
                      <Link href={`/produkte/${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-bs-accent hover:text-bs-accent-dark text-sm font-medium flex items-center gap-1">
                        Details <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {result.tips && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <p className="font-semibold text-amber-800 text-sm">Anwendungstipp</p>
                <p className="text-sm text-amber-700 mt-1">{result.tips}</p>
              </div>
            )}

            {/* Usage info */}
            {limit > 0 && (
              <p className="text-xs text-gray-400 text-center">
                Verbrauch: {usage} / {limit} Scans diesen Monat
              </p>
            )}

            <button onClick={reset} className="w-full py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              <RotateCcw size={16} className="inline mr-2" />Neue Analyse starten
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Brain({ className, size }: { className?: string; size?: number }) {
  return <Sparkles className={className} size={size} />;
}
