"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Loader2, Trash2, ChevronDown, ChevronUp, ExternalLink, ImageIcon } from "lucide-react";

interface Partner {
  id: string; name: string; logo: string; website: string; description: string; order: number;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/partners").then((r) => r.json()).then((d) => { setPartners(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/partners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(partners) });
    setSaved(true); setTimeout(() => setSaved(false), 2000); setSaving(false);
  };

  const addPartner = () => {
    const p: Partner = { id: Date.now().toString(36), name: "Neuer Partner", logo: "", website: "", description: "", order: partners.length };
    setPartners([...partners, p]); setExpandedId(p.id);
  };

  const update = (id: string, u: Partial<Partner>) => { setPartners((p) => p.map((x) => x.id === id ? { ...x, ...u } : x)); setSaved(false); };
  const remove = (id: string) => { if (confirm("Partner löschen?")) { setPartners((p) => p.filter((x) => x.id !== id)); setSaved(false); } };

  const move = (index: number, dir: -1 | 1) => {
    const ni = index + dir; if (ni < 0 || ni >= partners.length) return;
    const copy = [...partners]; [copy[index], copy[ni]] = [copy[ni], copy[index]];
    copy.forEach((p, i) => p.order = i); setPartners(copy); setSaved(false);
  };

  const handleLogoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(id, { logo: reader.result as string });
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-bs-accent mb-2"><ArrowLeft size={14} /> Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Partner verwalten</h1>
          <p className="text-sm text-gray-500 mt-1">{partners.length} Partner</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addPartner} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"><Plus size={16} /> Hinzufügen</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {partners.map((partner, index) => {
          const isExp = expandedId === partner.id;
          return (
            <div key={partner.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(isExp ? null : partner.id)}>
                <div className="flex flex-col gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); move(index, -1); }} className="p-0.5 text-gray-400 hover:text-gray-600" disabled={index === 0}><ChevronUp size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); move(index, 1); }} className="p-0.5 text-gray-400 hover:text-gray-600" disabled={index === partners.length - 1}><ChevronDown size={14} /></button>
                </div>
                {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-8 h-8 object-contain rounded" /> : <ImageIcon size={20} className="text-gray-300" />}
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm">{partner.name}</span>
                  {partner.website && <span className="text-xs text-gray-400 ml-2 flex items-center gap-1 inline-flex"><ExternalLink size={10} />{partner.website}</span>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(partner.id); }} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExp ? "rotate-180" : ""}`} />
              </div>
              {isExp && (
                <div className="border-t border-gray-200 p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Name</label><input value={partner.name} onChange={(e) => update(partner.id, { name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Website</label><input value={partner.website} onChange={(e) => update(partner.id, { website: e.target.value })} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                  </div>
                  <div><label className="text-xs font-medium text-gray-500 mb-1 block">Beschreibung</label><textarea value={partner.description} onChange={(e) => update(partner.id, { description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Logo</label>
                    <div className="flex items-center gap-4">
                      {partner.logo && <img src={partner.logo} alt="Logo" className="w-16 h-16 object-contain border border-gray-200 rounded-lg p-1" />}
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Logo hochladen
                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(partner.id, e)} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {partners.length === 0 && <p className="text-center text-gray-400 py-12">Noch keine Partner. Klicken Sie auf &quot;Hinzufügen&quot;.</p>}
      </div>
    </div>
  );
}
