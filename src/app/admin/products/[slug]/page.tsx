"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Check, Trash2, Upload, ImageIcon, X } from "lucide-react";

interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  ph: string;
  applications: string[];
  isBestseller: boolean;
  sizes: string[];
  prices: Record<string, number>;
  surfaceTypes: string[];
  roomTypes: string[];
  dirtTypes: string[];
  intensityLevels: string[];
  image?: string;
}

const CATEGORIES = [
  "floors", "sanitary", "odor", "special", "carpets", "disinfection",
  "food", "industry", "transport", "economy", "green", "dosing",
];
const CAT_LABELS: Record<string, string> = {
  floors: "Boden", sanitary: "Sanitar", odor: "Geruch", special: "Spezial",
  carpets: "Teppiche", disinfection: "Desinfektion", food: "Gastronomie",
  industry: "Industrie", transport: "Transport", economy: "Economy",
  green: "Oko", dosing: "Dosierung",
};
const SURFACE_TYPES = ["pvc", "linoleum", "stone", "ceramic", "glass", "metal", "concrete", "wood", "carpet"];
const ROOM_TYPES = ["office", "hallway", "bathroom", "kitchen", "restaurant", "hospital", "production", "warehouse"];
const DIRT_TYPES = ["general", "grease", "limescale", "stains", "organic", "bacteria", "odor", "polymer", "rust", "salt"];
const INTENSITY_LEVELS = ["light", "medium", "heavy"];

const emptyProduct: Product = {
  id: 0, slug: "", name: "", category: "floors", description: "", ph: "",
  applications: [], isBestseller: false, sizes: [], prices: {}, surfaceTypes: [],
  roomTypes: [], dirtTypes: [], intensityLevels: [], image: "",
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function ProductEditor() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isNew = slug === "new";

  const [product, setProduct] = useState<Product>(emptyProduct);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Temp fields for comma-separated arrays
  const [applicationsText, setApplicationsText] = useState("");
  const [sizesText, setSizesText] = useState("");
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((products: Product[]) => {
        setAllProducts(products);
        if (!isNew) {
          const found = products.find((p: Product) => p.slug === slug);
          if (found) {
            setProduct(found);
            setApplicationsText(found.applications.join(", "));
            setSizesText(found.sizes.join(", "));
            setPrices(found.prices || {});
          }
        }
        setLoading(false);
      });
  }, [slug, isNew]);

  const updateField = (field: string, value: unknown) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof Product, item: string) => {
    const arr = product[field] as string[];
    const next = arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];
    updateField(field, next);
  };

  const handleSave = async () => {
    setSaving(true);
    const finalProduct = {
      ...product,
      applications: applicationsText.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: sizesText.split(",").map((s) => s.trim()).filter(Boolean),
      prices,
    };

    if (isNew) {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalProduct),
      });
    } else {
      const updated = allProducts.map((p) => (p.slug === slug ? finalProduct : p));
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      router.push("/admin/products");
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!product.slug) {
      setUploadError("Bitte zuerst einen Namen/Slug eingeben.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", product.slug);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      updateField("image", data.url);
    } else {
      setUploadError(data.error || "Upload fehlgeschlagen");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageDelete = async () => {
    if (!product.image) return;
    if (!confirm("Produktbild wirklich loschen?")) return;
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: product.image }),
    });
    updateField("image", "");
  };

  const handleDelete = async () => {
    if (!confirm(`"${product.name}" wirklich loschen?`)) return;
    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    router.push("/admin/products");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={14} /> Zuruck zu Produkten
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Neues Produkt" : "Produkt bearbeiten"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} /> Loschen
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !product.name || !product.slug}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Gespeichert!" : "Speichern"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Grunddaten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => {
                  updateField("name", e.target.value);
                  if (isNew) updateField("slug", slugify(e.target.value));
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
              <input
                type="text"
                value={product.slug}
                onChange={(e) => updateField("slug", slugify(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategorie</label>
              <select
                value={product.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 outline-none text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CAT_LABELS[c] || c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">pH-Wert</label>
              <input
                type="text"
                value={product.ph}
                onChange={(e) => updateField("ph", e.target.value)}
                placeholder="z.B. 8.0 - 9.0"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Beschreibung</label>
              <textarea
                value={product.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Anwendungen (kommagetrennt)</label>
              <input
                type="text"
                value={applicationsText}
                onChange={(e) => setApplicationsText(e.target.value)}
                placeholder="PVC, Linoleum, Stein"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Grossen (kommagetrennt)</label>
              <input
                type="text"
                value={sizesText}
                onChange={(e) => setSizesText(e.target.value)}
                placeholder="1 L, 5 L, 10 L"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bestseller"
                checked={product.isBestseller}
                onChange={(e) => updateField("isBestseller", e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="bestseller" className="text-sm font-medium text-gray-700">
                Bestseller
              </label>
            </div>
          </div>
        </div>

        {/* Product Image */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Produktbild</h2>
          {uploadError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center justify-between">
              {uploadError}
              <button onClick={() => setUploadError("")} className="text-red-400 hover:text-red-600"><X size={14} /></button>
            </div>
          )}
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div className="w-40 h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {product.image ? (
                <img src={product.image} alt={product.name || "Produkt"} className="object-contain w-full h-full p-2" />
              ) : (
                <ImageIcon size={32} className="text-gray-300" />
              )}
            </div>
            {/* Controls */}
            <div className="flex-1 space-y-3">
              <p className="text-sm text-gray-500">
                PNG, JPEG oder WebP. Max. 5 MB. Das Bild wird unter dem Produkt-Slug gespeichert.
              </p>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="product-image-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !product.slug}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? "Wird hochgeladen..." : "Bild hochladen"}
                </button>
                {product.image && (
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 size={16} /> Bild entfernen
                  </button>
                )}
              </div>
              {product.image && (
                <p className="text-xs text-gray-400 font-mono break-all">{product.image}</p>
              )}
            </div>
          </div>
        </div>

        {/* Prices */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Preise (netto)</h2>
          {sizesText.trim() ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {sizesText.split(",").map((s) => s.trim()).filter(Boolean).map((size) => (
                <div key={size}>
                  <label className="block text-sm text-gray-600 mb-1">{size}</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={prices[size] || ""}
                      onChange={(e) => setPrices((prev) => ({ ...prev, [size]: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm text-right pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">&euro;</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Bitte zuerst Grossen eingeben (z.B. &quot;1 L, 5 L, 10 L&quot;)</p>
          )}
        </div>

        {/* Surface Types */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Oberflachentypen</h2>
          <div className="flex flex-wrap gap-2">
            {SURFACE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleArrayItem("surfaceTypes", t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  product.surfaceTypes.includes(t)
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Room Types */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Raumtypen</h2>
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleArrayItem("roomTypes", t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  product.roomTypes.includes(t)
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dirt Types */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Verschmutzungstypen</h2>
          <div className="flex flex-wrap gap-2">
            {DIRT_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggleArrayItem("dirtTypes", t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  product.dirtTypes.includes(t)
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Levels */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Intensitatsstufen</h2>
          <div className="flex flex-wrap gap-2">
            {INTENSITY_LEVELS.map((t) => (
              <button
                key={t}
                onClick={() => toggleArrayItem("intensityLevels", t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  product.intensityLevels.includes(t)
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
