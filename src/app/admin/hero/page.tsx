"use client";

import { useEffect, useState, useRef } from "react";
import {
  Image as ImageIcon, Film, Plus, Trash2, Loader2, ArrowUp, ArrowDown,
  Eye, EyeOff, Save, ArrowLeft, Upload
} from "lucide-react";
import Link from "next/link";

interface HeroSlide {
  id: string;
  type: "image" | "video";
  mediaId: string; // Redis key for the media data
  name: string;
  active: boolean;
  order: number;
}

interface HeroConfig {
  slides: HeroSlide[];
  pauseBetween: number;
  pauseAfterLoop: number;
  imageDuration: number;
  bannerEnabled: boolean;
}

export default function HeroManagePage() {
  const [config, setConfig] = useState<HeroConfig>({
    slides: [], pauseBetween: 1, pauseAfterLoop: 10, imageDuration: 8, bannerEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/hero").then(r => r.json()).then((data) => {
      setConfig(data || { slides: [], pauseBetween: 1, pauseAfterLoop: 10, imageDuration: 8, bannerEnabled: true });
      // Load previews for existing slides
      if (data?.slides) {
        data.slides.forEach((s: HeroSlide) => {
          if (s.mediaId) {
            fetch(`/api/admin/hero/upload?id=${s.mediaId}`)
              .then(r => r.json())
              .then(d => { if (d.url) setPreviews(prev => ({ ...prev, [s.id]: d.url })); })
              .catch(() => {});
          }
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("Datei zu groß! Maximal 4 MB erlaubt.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/hero/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const slide: HeroSlide = {
        id: data.id,
        type: data.type,
        mediaId: data.id,
        name: data.name,
        active: true,
        order: config.slides.length,
      };

      // Create local preview
      const previewUrl = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [slide.id]: previewUrl }));

      setConfig(prev => ({ ...prev, slides: [...prev.slides, slide] }));
    } catch (err) {
      alert("Upload fehlgeschlagen: " + (err instanceof Error ? err.message : "Fehler"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setConfig(prev => ({ ...prev, slides: prev.slides.filter(s => s.id !== id) }));
  }

  function toggleActive(id: string) {
    setConfig(prev => ({
      ...prev,
      slides: prev.slides.map(s => s.id === id ? { ...s, active: !s.active } : s),
    }));
  }

  function moveSlide(id: string, dir: "up" | "down") {
    setConfig(prev => {
      const slides = [...prev.slides];
      const idx = slides.findIndex(s => s.id === id);
      const newIdx = dir === "up" ? idx - 1 : idx + 1;
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-2">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Hero-Bereich</h1>
          <p className="text-gray-500 text-sm mt-1">Bilder und Videos für Startseite & Unterseiten-Banner</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 font-medium text-sm disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Bild oder Video hinzufügen</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={36} className="mx-auto text-red-500 animate-spin" />
          ) : (
            <Upload size={36} className="mx-auto text-gray-400" />
          )}
          <p className="mt-3 text-sm font-medium text-gray-600">
            {uploading ? "Wird hochgeladen..." : "Klicken und Datei auswählen"}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, MP4, WebM · max. 4 MB</p>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Einstellungen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pause zwischen (Sek.)</label>
            <input type="number" min="0" max="30" value={config.pauseBetween}
              onChange={(e) => setConfig(prev => ({ ...prev, pauseBetween: parseFloat(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pause nach Durchlauf (Sek.)</label>
            <input type="number" min="1" max="60" value={config.pauseAfterLoop}
              onChange={(e) => setConfig(prev => ({ ...prev, pauseAfterLoop: parseFloat(e.target.value) || 10 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bildanzeige (Sek.)</label>
            <input type="number" min="2" max="30" value={config.imageDuration}
              onChange={(e) => setConfig(prev => ({ ...prev, imageDuration: parseFloat(e.target.value) || 8 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700">Banner auf Unterseiten</p>
            <p className="text-xs text-gray-400">Video/Bild-Banner auf Produkte, Kontakt, Downloads usw.</p>
          </div>
          <button onClick={() => setConfig(prev => ({ ...prev, bannerEnabled: !prev.bannerEnabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${config.bannerEnabled ? "bg-green-500" : "bg-gray-300"}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.bannerEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Slides */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Slides ({config.slides.filter(s => s.active).length} aktiv von {config.slides.length})
        </h2>
        {config.slides.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Noch keine Slides. Klicke oben auf &quot;Datei auswählen&quot;.</p>
        ) : (
          <div className="space-y-3">
            {config.slides.map((slide, idx) => (
              <div key={slide.id} className={`flex items-center gap-4 p-3 rounded-lg border ${slide.active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 opacity-50"}`}>
                {/* Preview */}
                <div className="w-28 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {previews[slide.id] ? (
                    slide.type === "video" ? (
                      <video src={previews[slide.id]} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={previews[slide.id]} alt="" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <span className="text-gray-500 text-xs">Lade...</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${slide.type === "video" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                      {slide.type === "video" ? "VIDEO" : "BILD"}
                    </span>
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{slide.name}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => moveSlide(slide.id, "up")} disabled={idx === 0}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button onClick={() => moveSlide(slide.id, "down")} disabled={idx === config.slides.length - 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown size={14} /></button>
                  <button onClick={() => toggleActive(slide.id)}
                    className={`p-1.5 ${slide.active ? "text-green-500" : "text-gray-400"}`} title={slide.active ? "Deaktivieren" : "Aktivieren"}>
                    {slide.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleDelete(slide.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
