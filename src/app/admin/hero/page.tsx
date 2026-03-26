"use client";

import { useEffect, useState, useRef } from "react";
import {
  Image as ImageIcon, Film, Plus, Trash2, Loader2, ArrowUp, ArrowDown,
  Eye, EyeOff, Save, ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface HeroSlide {
  id: string;
  type: "image" | "video";
  url: string;
  order: number;
  active: boolean;
}

interface HeroConfig {
  slides: HeroSlide[];
  interval: number;
}

export default function HeroManagePage() {
  const [config, setConfig] = useState<HeroConfig>({ slides: [], interval: 8 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/hero").then(r => r.json()).then(setConfig).finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to /api/admin/upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "hero");
      const res = await fetch(`/api/admin/upload?slug=hero-${Date.now()}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Add slide
      const type = file.type.startsWith("video/") ? "video" : "image";
      const addRes = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url, type }),
      });
      const slide = await addRes.json();
      setConfig(prev => ({ ...prev, slides: [...prev.slides, slide] }));
    } catch (err) {
      alert("Upload fehlgeschlagen: " + (err instanceof Error ? err.message : "Unbekannter Fehler"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Add existing file from /public/logo/ by URL
  async function handleAddExisting(filename: string) {
    const url = `/logo/${filename}`;
    const type = filename.match(/\.(mp4|webm|mov)$/i) ? "video" : "image";
    const res = await fetch("/api/admin/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, type }),
    });
    const slide = await res.json();
    setConfig(prev => ({ ...prev, slides: [...prev.slides, slide] }));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/hero?id=${id}`, { method: "DELETE" });
    setConfig(prev => ({ ...prev, slides: prev.slides.filter(s => s.id !== id) }));
  }

  function toggleActive(id: string) {
    setConfig(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === id ? { ...s, active: !s.active } : s),
    }));
  }

  function moveSlide(id: string, direction: "up" | "down") {
    setConfig(prev => {
      const slides = [...prev.slides];
      const idx = slides.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= slides.length) return prev;
      [slides[idx], slides[newIdx]] = [slides[newIdx], slides[idx]];
      return { ...prev, slides: slides.map((s, i) => ({ ...s, order: i })) };
    });
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  // Files available in /public/logo/
  const availableFiles = [
    "Gen-4_5 Create a high-quality, modern logo animation for a professional cleaning and disinfection companyThe logo text is Swish.mp4",
    "Gen-4_5 Create a high-quality, modern logo animation for a professional cleaning and disinfection companyThe logo text is Swish 2.mp4",
    "Product Reshoot - Create a high-quality_ modern logo animation for a professional cleaning and disin.png",
  ];
  const usedUrls = config.slides.map(s => s.url);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-2">
            <ArrowLeft size={14} /> Zurück zum Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Hero-Bereich verwalten</h1>
          <p className="text-gray-500 text-sm mt-1">Bilder und Videos für den Startseiten-Slider</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Einstellungen</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700">Intervall (Sekunden):</label>
          <input
            type="number"
            min="3"
            max="30"
            value={config.interval}
            onChange={(e) => setConfig(prev => ({ ...prev, interval: parseInt(e.target.value) || 8 }))}
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center"
          />
        </div>
      </div>

      {/* Available files from /public/logo/ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Verfügbare Dateien</h2>
        <div className="space-y-2">
          {availableFiles.map((file) => {
            const url = `/logo/${file}`;
            const isUsed = usedUrls.includes(url);
            const isVideo = file.endsWith(".mp4");
            return (
              <div key={file} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 rounded flex items-center justify-center ${isVideo ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                  {isVideo ? <Film size={16} /> : <ImageIcon size={16} />}
                </div>
                <span className="flex-1 text-sm text-gray-700 truncate">{file.slice(0, 60)}...</span>
                {isUsed ? (
                  <span className="text-xs text-green-600 font-medium">Bereits hinzugefügt</span>
                ) : (
                  <button
                    onClick={() => handleAddExisting(file)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Plus size={12} /> Hinzufügen
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload new */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Neue Datei hochladen</h2>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-red-300 transition-all"
        >
          {uploading ? (
            <Loader2 size={32} className="mx-auto text-red-500 animate-spin" />
          ) : (
            <Plus size={32} className="mx-auto text-gray-400" />
          )}
          <p className="mt-2 text-sm text-gray-500">
            {uploading ? "Wird hochgeladen..." : "Bild oder Video hochladen (JPG, PNG, MP4, WebM)"}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Slides list */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Slides ({config.slides.filter(s => s.active).length} aktiv)
        </h2>
        {config.slides.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">Noch keine Slides hinzugefügt</p>
        ) : (
          <div className="space-y-3">
            {config.slides.map((slide, idx) => (
              <div key={slide.id} className={`flex items-center gap-4 p-3 rounded-lg border ${slide.active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                {/* Preview */}
                <div className="w-32 h-20 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                  {slide.type === "video" ? (
                    <video src={slide.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={slide.url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${slide.type === "video" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                      {slide.type === "video" ? "VIDEO" : "BILD"}
                    </span>
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{slide.url.split("/").pop()}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSlide(slide.id, "up")} disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Nach oben">
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => moveSlide(slide.id, "down")} disabled={idx === config.slides.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Nach unten">
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => toggleActive(slide.id)}
                    className={`p-1.5 ${slide.active ? "text-green-500 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}`}
                    title={slide.active ? "Deaktivieren" : "Aktivieren"}>
                    {slide.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleDelete(slide.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600" title="Löschen">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
