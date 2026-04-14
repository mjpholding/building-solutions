"use client";

import Link from "next/link";
import { Globe, Package, Layers, Mail, ArrowRight, Image as ImageIcon } from "lucide-react";

const stats = [
  { label: "Sprachen", value: "9", icon: Globe, color: "bg-blue-50 text-blue-600" },
  { label: "Produkte", value: "80", icon: Package, color: "bg-green-50 text-green-600" },
  { label: "Kategorien", value: "12", icon: Layers, color: "bg-purple-50 text-purple-600" },
  { label: "Kontaktdaten", value: "1", icon: Mail, color: "bg-amber-50 text-amber-600" },
];

const quickLinks = [
  { href: "/admin/hero", label: "Hero-Bereich verwalten", desc: "Bilder & Videos auf der Startseite", icon: ImageIcon, highlight: true },
  { href: "/admin/contact", label: "Kontaktdaten bearbeiten", desc: "Adresse, Telefon, E-Mail" },
  { href: "/admin/texts", label: "Texte bearbeiten", desc: "Alle Sprachversionen verwalten" },
  { href: "/admin/products", label: "Produkte verwalten", desc: "Hinzufugen, bearbeiten, loschen" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      <p className="mt-1 text-gray-500 text-sm">Building Solutions Verwaltung</p>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <h2 className="mt-10 text-lg font-semibold text-gray-900">Schnellzugriff</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => {
          const ql = link as { href: string; label: string; desc: string; icon?: typeof ImageIcon; highlight?: boolean };
          return (
            <Link
              key={ql.href}
              href={ql.href}
              className={`group rounded-xl border p-5 hover:shadow-sm transition-all ${
                ql.highlight
                  ? "bg-blue-50 border-bs-accent200 hover:border-bs-accent-light"
                  : "bg-white border-gray-200 hover:border-bs-accent200"
              }`}
            >
              {ql.icon && <ql.icon size={20} className="text-bs-accent mb-2" />}
              <h3 className="font-medium text-gray-900 group-hover:text-bs-accent transition-colors">
                {ql.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{ql.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-bs-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Öffnen <ArrowRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
