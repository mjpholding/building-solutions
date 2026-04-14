"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2, Save, Globe, Shield, ShoppingCart } from "lucide-react";

interface PageEntry {
  slug: string;
  label: string;
  path: string;
  group: string;
  enabled: boolean;
  locked?: boolean;
}

const GROUP_META: Record<string, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; description: string }> = {
  main: { label: "Hauptseiten", icon: Globe, description: "Kernseiten der Website" },
  legal: { label: "Rechtliches", icon: Shield, description: "Impressum, Datenschutz & AGB" },
  shop: { label: "Shop-Funktionen", icon: ShoppingCart, description: "E-Commerce & Produktseiten (später aktivierbar)" },
};

export default function PagesAdmin() {
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const togglePage = (slug: string) => {
    setPages((prev) =>
      prev.map((p) => (p.slug === slug && !p.locked ? { ...p, enabled: !p.enabled } : p))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // ignore
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const groups = ["main", "legal", "shop"];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-1 text-sm text-gray-500 hover:text-bs-accent mb-2">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Seitenverwaltung</h1>
          <p className="text-sm text-gray-500 mt-1">Seiten ein- und ausschalten. Deaktivierte Seiten sind nicht erreichbar.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-bs-accent text-white px-5 py-2.5 rounded-lg hover:bg-bs-accent-dark font-medium text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? "Gespeichert!" : "Speichern"}
        </button>
      </div>

      <div className="space-y-8">
        {groups.map((groupKey) => {
          const meta = GROUP_META[groupKey];
          const groupPages = pages.filter((p) => p.group === groupKey);
          if (groupPages.length === 0) return null;

          const GroupIcon = meta.icon;

          return (
            <div key={groupKey} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <GroupIcon size={20} className="text-bs-accent" />
                <div>
                  <h2 className="font-semibold text-gray-900">{meta.label}</h2>
                  <p className="text-xs text-gray-500">{meta.description}</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {groupPages.map((page) => (
                  <div key={page.slug} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">{page.label}</span>
                        {page.locked && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-medium">PFLICHT</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{page.path}</span>
                    </div>
                    <button
                      onClick={() => togglePage(page.slug)}
                      disabled={page.locked}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        page.enabled ? "bg-green-500" : "bg-gray-300"
                      } ${page.locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          page.enabled ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <div className="ml-3 w-6">
                      {page.enabled ? (
                        <Eye size={16} className="text-green-500" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
