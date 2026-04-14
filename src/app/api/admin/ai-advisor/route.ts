import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface AIPlan {
  id: string;
  name: string;
  price: number; // EUR per month
  scansPerMonth: number;
  features: string[];
}

export interface AIAdvisorConfig {
  enabled: boolean;
  stripeSecretKey: string;
  stripePublishableKey: string;
  plans: AIPlan[];
  knowledgeBase: KnowledgeEntry[];
  systemPrompt: string;
}

export interface KnowledgeEntry {
  id: string;
  surface: string;
  visualDescription: string;
  products: string[];
}

const DEFAULT_CONFIG: AIAdvisorConfig = {
  enabled: false,
  stripeSecretKey: "",
  stripePublishableKey: "",
  plans: [
    { id: "free", name: "Free", price: 0, scansPerMonth: 0, features: ["Visueller Produktberater", "Produktkatalog"] },
    { id: "basic", name: "Basic", price: 3, scansPerMonth: 20, features: ["AI-Bildanalyse", "20 Scans/Monat", "Analyse-Verlauf"] },
    { id: "standard", name: "Standard", price: 5, scansPerMonth: 50, features: ["AI-Bildanalyse", "50 Scans/Monat", "Analyse-Verlauf", "Prioritäts-Support"] },
    { id: "pro", name: "Pro", price: 10, scansPerMonth: 200, features: ["AI-Bildanalyse", "200 Scans/Monat", "Analyse-Verlauf", "Prioritäts-Support"] },
  ],
  knowledgeBase: [
    { id: "1", surface: "Marmor (matt)", visualDescription: "Heller Naturstein, poröse Oberfläche ohne Glanz, feine Maserung", products: ["SP-100 Citro", "Stone & Tile"] },
    { id: "2", surface: "Marmor (poliert)", visualDescription: "Glänzender Naturstein mit Spiegelung, glatte Oberfläche", products: ["SP-100 Floral", "SP-105 Nano Clean & Shine"] },
    { id: "3", surface: "PVC / Vinyl", visualDescription: "Glatte Kunststoffoberfläche, einheitliche Farbe, leicht elastisch", products: ["SP-100 Citro", "SP-120 Floor Active"] },
    { id: "4", surface: "Feinsteinzeug / Fliesen", visualDescription: "Harte Keramikoberfläche, gleichmäßiges Muster, Fugenlinien sichtbar", products: ["SP-150 Gres Cleaner", "SP-350 Acid Cleaner"] },
    { id: "5", surface: "Holz / Parkett", visualDescription: "Natürliche Holzmaserung, warmer Farbton, lackiert oder geölt", products: ["SP-110 Wood Floor Cleaner"] },
    { id: "6", surface: "Beton", visualDescription: "Graue, raue Oberfläche, porig, industriell", products: ["Jet", "Facto HD40"] },
    { id: "7", surface: "Glas / Spiegel", visualDescription: "Transparente oder reflektierende Oberfläche, Fingerabdrücke sichtbar", products: ["Glass Clean", "Sparkle", "Nano Glass"] },
    { id: "8", surface: "Edelstahl", visualDescription: "Metallisch glänzend, gebürstete oder polierte Oberfläche", products: ["Stainless Steel Cleaner", "Stainless Steel Polish"] },
    { id: "9", surface: "Teppich / Textil", visualDescription: "Weiche, textile Oberfläche, Fasern sichtbar", products: ["Plush", "Stain Remover", "Aromx 80"] },
    { id: "10", surface: "Sanitärkeramik", visualDescription: "Weiße, glatte Keramik, WC, Waschbecken, Urinal", products: ["Kling", "Sani Clean", "Scale Remover"] },
  ],
  systemPrompt: `Du bist ein Experte für professionelle Reinigungsprodukte von Building Solutions GmbH.
Analysiere das Bild und identifiziere:
1. Typ der Oberfläche (z.B. Marmor, PVC, Holz, Fliesen, Glas, Edelstahl, Beton, Teppich, Sanitärkeramik)
2. Art der Verschmutzung (z.B. Fett, Kalk, organisch, Staub, Flecken)
3. Intensität der Verschmutzung (leicht, mittel, stark)

Nutze die folgende Wissensdatenbank um passende Produkte zu empfehlen:
[KNOWLEDGE_BASE]

Antworte auf Deutsch in diesem JSON-Format:
{
  "surface": "erkannte Oberfläche",
  "dirt": "Art der Verschmutzung",
  "intensity": "leicht/mittel/stark",
  "products": [{"name": "Produktname", "reason": "kurze Begründung"}],
  "tips": "Anwendungstipp"
}`,
};

async function getConfig(): Promise<AIAdvisorConfig> {
  const stored = (await storeGet("ai-advisor-config")) as AIAdvisorConfig | null;
  return stored || DEFAULT_CONFIG;
}

// GET: get config
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getConfig());
}

// PUT: update config
export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const config = await getConfig();

  if (body.enabled !== undefined) config.enabled = body.enabled;
  if (body.stripeSecretKey !== undefined) config.stripeSecretKey = body.stripeSecretKey;
  if (body.stripePublishableKey !== undefined) config.stripePublishableKey = body.stripePublishableKey;
  if (body.plans !== undefined) config.plans = body.plans;
  if (body.knowledgeBase !== undefined) config.knowledgeBase = body.knowledgeBase;
  if (body.systemPrompt !== undefined) config.systemPrompt = body.systemPrompt;

  await storeSet("ai-advisor-config", config);
  return NextResponse.json(config);
}
