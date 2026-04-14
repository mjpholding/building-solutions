"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Loader2, Trash2, ChevronDown, Briefcase } from "lucide-react";

interface JobPosting {
  id: string; title: string; location: string; type: string;
  description: string; requirements: string[]; benefits: string[];
  active: boolean; createdAt: string;
}

const JOB_TYPES = ["Vollzeit", "Teilzeit", "Ausbildung", "Minijob"];

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/careers").then((r) => r.json()).then((d) => { setJobs(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/careers", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(jobs) });
    setSaved(true); setTimeout(() => setSaved(false), 2000); setSaving(false);
  };

  const addJob = () => {
    const j: JobPosting = { id: Date.now().toString(36), title: "Neue Stelle", location: "Kerpen", type: "Vollzeit", description: "", requirements: [], benefits: [], active: true, createdAt: new Date().toISOString() };
    setJobs([...jobs, j]); setExpandedId(j.id);
  };

  const update = (id: string, u: Partial<JobPosting>) => { setJobs((p) => p.map((j) => j.id === id ? { ...j, ...u } : j)); setSaved(false); };
  const remove = (id: string) => { if (confirm("Stelle löschen?")) { setJobs((p) => p.filter((j) => j.id !== id)); setSaved(false); } };

  const updateListItem = (id: string, field: "requirements" | "benefits", idx: number, val: string) => {
    setJobs((p) => p.map((j) => { if (j.id !== id) return j; const arr = [...j[field]]; arr[idx] = val; return { ...j, [field]: arr }; })); setSaved(false);
  };
  const addListItem = (id: string, field: "requirements" | "benefits") => {
    setJobs((p) => p.map((j) => j.id === id ? { ...j, [field]: [...j[field], ""] } : j)); setSaved(false);
  };
  const removeListItem = (id: string, field: "requirements" | "benefits", idx: number) => {
    setJobs((p) => p.map((j) => j.id === id ? { ...j, [field]: j[field].filter((_, i) => i !== idx) } : j)); setSaved(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-bs-accent mb-2"><ArrowLeft size={14} /> Dashboard</Link>
          <h1 className="text-2xl font-bold text-gray-900">Karriere / Stellenangebote</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} Stellen</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addJob} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium"><Plus size={16} /> Hinzufügen</button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => {
          const isExp = expandedId === job.id;
          return (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(isExp ? null : job.id)}>
                <Briefcase size={18} className="text-bs-accent" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm">{job.title}</span>
                  <span className="text-xs text-gray-400 ml-2">{job.location}</span>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{job.type}</span>
                <button onClick={(e) => { e.stopPropagation(); update(job.id, { active: !job.active }); }}
                  className={`relative w-10 h-5 rounded-full transition-colors ${job.active ? "bg-green-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${job.active ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); remove(job.id); }} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExp ? "rotate-180" : ""}`} />
              </div>
              {isExp && (
                <div className="border-t border-gray-200 p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Titel</label><input value={job.title} onChange={(e) => update(job.id, { title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Standort</label><input value={job.location} onChange={(e) => update(job.id, { location: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                    <div><label className="text-xs font-medium text-gray-500 mb-1 block">Art</label>
                      <select value={job.type} onChange={(e) => update(job.id, { type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent">
                        {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="text-xs font-medium text-gray-500 mb-1 block">Beschreibung</label><textarea value={job.description} onChange={(e) => update(job.id, { description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" /></div>
                  {(["requirements", "benefits"] as const).map((field) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">{field === "requirements" ? "Anforderungen" : "Benefits"}</label>
                      <div className="space-y-2">
                        {job[field].map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input value={item} onChange={(e) => updateListItem(job.id, field, i, e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent" />
                            <button onClick={() => removeListItem(job.id, field, i)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        ))}
                        <button onClick={() => addListItem(job.id, field)} className="text-xs text-bs-accent hover:text-bs-accent-dark font-medium flex items-center gap-1"><Plus size={12} /> Hinzufügen</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {jobs.length === 0 && <p className="text-center text-gray-400 py-12">Noch keine Stellen. Klicken Sie auf &quot;Hinzufügen&quot;.</p>}
      </div>
    </div>
  );
}
