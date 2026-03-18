import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";

// Simple dictionary-based translation DE <-> PL for common chat phrases
// Falls back to label when no translation available
const DE_PL: Record<string, string> = {};
const PL_DE: Record<string, string> = {};

function detectLanguage(text: string): "de" | "pl" | "unknown" {
  const lower = text.toLowerCase();
  // Polish-specific characters and common words
  const plIndicators = /[ąćęłńóśźż]|(\b(jest|nie|tak|się|jak|dla|ale|jestem|mam|będzie|już|tylko|bardzo|proszę|dziękuję|cześć|dobry|dzień|witam|pozdrawiam)\b)/i;
  // German-specific characters and common words
  const deIndicators = /[äöüß]|(\b(ist|nicht|das|die|der|und|ein|ich|habe|wird|schon|nur|sehr|bitte|danke|hallo|guten|tag|grüße)\b)/i;

  const plScore = (lower.match(plIndicators) || []).length;
  const deScore = (lower.match(deIndicators) || []).length;

  if (plScore > deScore) return "pl";
  if (deScore > plScore) return "de";
  return "unknown";
}

async function translateText(text: string, from: string, to: string): Promise<string | null> {
  // Use MyMemory Translation API (free, no key needed, 5000 chars/day)
  try {
    const langPair = `${from}|${to}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      // MyMemory returns uppercase when it can't translate — skip those
      if (translated === text.toUpperCase()) return null;
      return translated;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text, targetLang } = await request.json();
  if (!text || !targetLang) {
    return NextResponse.json({ error: "text and targetLang required" }, { status: 400 });
  }

  const detected = detectLanguage(text);
  if (detected === "unknown" || detected === targetLang) {
    return NextResponse.json({ translation: null, detected });
  }

  const translation = await translateText(text, detected, targetLang);
  return NextResponse.json({ translation, detected, targetLang });
}
