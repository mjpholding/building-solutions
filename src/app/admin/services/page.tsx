"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Save, Loader2, Trash2, ChevronDown, ChevronUp, GripVertical,
  Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun
} from "lucide-react";
import type { Service } from "@/types/service";

const ICONS = ["Shield", "Camera", "AlertTriangle", "Radio", "Zap", "Wrench", "Sun"];
const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Shield, Camera, AlertTriangle, Radio, Zap, Wrench, Sun,
};

const CATEGORIES = [
  { value: "security", label: "Sicherheitssysteme" },
  { value: "video", label: "Videoüberwachung" },
  { value: "hazard", label: "Gefahrenmanagement" },
  { value: "communication", label: "Kommunikationstechnik" },
  { value: "electrical", label: "Elektrotechnik" },
  { value: "repairs", label: "Gerätereparaturen" },
  { value: "pv", label: "Photovoltaik" },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((data) => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(services),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now(),
      slug: "",
      name: "Neue Leistung",
      icon: "Shield",
      category: "",
      shortDescription: "",
      description: "",
      features: [],
      image: "",
    };
    setServices([...services, newService]);
    setExpandedId(newService.id);
  };

  const updateService = (id: number, updates: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...updates };
        // Auto-generate slug from name if slug is empty
        if (updates.name && !s.slug) {
          updated.slug = updates.name.toLowerCase().replace(/[^a-z0-9äöü]+/g, "-").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/-+$/g, "");
        }
        return updated;
      })
    );
    setSaved(false);
  };

  const removeService = (id: number) => {
    if (!confirm("Leistung wirklich löschen?")) return;
    setServices((prev) => prev.filter((s) => s.id !== id));
    setSaved(false);
  };

  const moveService = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= services.length) return;
    const copy = [...services];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    setServices(copy);
    setSaved(false);
  };

  const updateFeature = (serviceId: number, featureIndex: number, value: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        const features = [...s.features];
        features[featureIndex] = value;
        return { ...s, features };
      })
    );
    setSaved(false);
  };

  const addFeature = (serviceId: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, features: [...s.features, ""] } : s))
    );
    setSaved(false);
  };

  const removeFeature = (serviceId: number, featureIndex: number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        return { ...s, features: s.features.filter((_, i) => i !== featureIndex) };
      })
    );
    setSaved(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-bs-accent mb-2">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Leistungen verwalten</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} Leistungen</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addService} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium">
            <Plus size={16} /> Hinzufügen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((service, index) => {
          const Icon = iconMap[service.icon] || Shield;
          const isExpanded = expandedId === service.id;

          return (
            <div key={service.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(isExpanded ? null : service.id)}
              >
                <GripVertical size={16} className="text-gray-300" />
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); moveService(index, -1); }} className="p-0.5 text-gray-400 hover:text-gray-600" disabled={index === 0}>
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); moveService(index, 1); }} className="p-0.5 text-gray-400 hover:text-gray-600" disabled={index === services.length - 1}>
                    <ChevronDown size={14} />
                  </button>
                </div>
                <Icon size={20} className="text-bs-accent" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 text-sm">{service.name || "Unbenannt"}</span>
                  <span className="text-xs text-gray-400 ml-2">/{service.slug}</span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {service.features.length} Features
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeService(service.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                      <input
                        value={service.name}
                        onChange={(e) => updateService(service.id, { name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Slug</label>
                      <input
                        value={service.slug}
                        onChange={(e) => updateService(service.id, { slug: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Icon</label>
                      <div className="flex gap-1">
                        {ICONS.map((ic) => {
                          const Ic = iconMap[ic];
                          return (
                            <button
                              key={ic}
                              onClick={() => updateService(service.id, { icon: ic })}
                              className={`p-2 rounded-lg border transition-colors ${service.icon === ic ? "border-bs-accent bg-blue-50 text-bs-accent" : "border-gray-200 text-gray-400 hover:text-gray-600"}`}
                            >
                              <Ic size={18} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Kategorie</label>
                      <select
                        value={service.category}
                        onChange={(e) => updateService(service.id, { category: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent"
                      >
                        <option value="">-- Wählen --</option>
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Kurzbeschreibung</label>
                    <textarea
                      value={service.shortDescription}
                      onChange={(e) => updateService(service.id, { shortDescription: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Ausführliche Beschreibung</label>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(service.id, { description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Leistungen / Features</label>
                    <div className="space-y-2">
                      {service.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2">
                          <input
                            value={f}
                            onChange={(e) => updateFeature(service.id, fi, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-bs-accent/20 focus:border-bs-accent"
                            placeholder={`Feature ${fi + 1}`}
                          />
                          <button onClick={() => removeFeature(service.id, fi)} className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addFeature(service.id)}
                        className="text-xs text-bs-accent hover:text-bs-accent-dark font-medium flex items-center gap-1"
                      >
                        <Plus size={12} /> Feature hinzufügen
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
