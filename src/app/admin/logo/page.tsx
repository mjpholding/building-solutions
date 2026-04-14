"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Upload, Trash2, ImageIcon } from "lucide-react";

export default function AdminLogoPage() {
  const [logo, setLogo] = useState("");
  const [logoWhite, setLogoWhite] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/logo").then((r) => r.json()).then((d) => {
      setLogo(d.logo || ""); setLogoWhite(d.logoWhite || ""); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/logo", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logo, logoWhite }) });
    setSaved(true); setTimeout(() => setSaved(false), 2000); setSaving(false);
  };

  const handleUpload = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); setSaved(false); };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-bs-accent mb-2"><ArrowLeft size={14} /> Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Logo verwalten</h1>
          <p className="text-sm text-gray-500 mt-1">Logo für Header und Footer hochladen</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? "Gespeichert!" : "Speichern"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Main logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Logo (hell / Header)</h2>
          <p className="text-xs text-gray-500 mb-4">Wird auf hellem Hintergrund angezeigt (Header, helle Seiten). Empfohlen: PNG/SVG mit transparentem Hintergrund.</p>
          <div className="flex items-center gap-6">
            <div className="w-48 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-white">
              {logo ? <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain p-2" /> : <ImageIcon size={32} className="text-gray-300" />}
            </div>
            <div className="space-y-2">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Upload size={16} /> Logo hochladen
                <input type="file" accept="image/*" onChange={handleUpload(setLogo)} className="hidden" />
              </label>
              {logo && <button onClick={() => { setLogo(""); setSaved(false); }} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"><Trash2 size={12} /> Entfernen</button>}
            </div>
          </div>
        </div>

        {/* White logo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Logo (dunkel / Footer)</h2>
          <p className="text-xs text-gray-500 mb-4">Wird auf dunklem Hintergrund angezeigt (Footer). Empfohlen: weiße/helle Version des Logos.</p>
          <div className="flex items-center gap-6">
            <div className="w-48 h-24 border-2 border-dashed border-gray-700 rounded-xl flex items-center justify-center bg-gray-900">
              {logoWhite ? <img src={logoWhite} alt="Logo White" className="max-w-full max-h-full object-contain p-2" /> : <ImageIcon size={32} className="text-gray-600" />}
            </div>
            <div className="space-y-2">
              <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Upload size={16} /> Logo hochladen
                <input type="file" accept="image/*" onChange={handleUpload(setLogoWhite)} className="hidden" />
              </label>
              {logoWhite && <button onClick={() => { setLogoWhite(""); setSaved(false); }} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"><Trash2 size={12} /> Entfernen</button>}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Vorschau</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-4 bg-white">
              <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Header</p>
              {logo ? <img src={logo} alt="Preview" className="h-10 w-auto object-contain" /> : <span className="text-lg font-bold"><span className="text-bs-accent">Building</span> <span className="text-gray-800">Solutions</span></span>}
            </div>
            <div className="border border-gray-700 rounded-xl p-4 bg-gray-900">
              <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">Footer</p>
              {logoWhite ? <img src={logoWhite} alt="Preview" className="h-10 w-auto object-contain" /> : <span className="text-lg font-bold text-white"><span className="text-bs-accent-light">Building</span> Solutions</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
