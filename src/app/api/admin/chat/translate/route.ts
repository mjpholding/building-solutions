import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/admin-auth";

function detectLanguage(text: string): "de" | "pl" | "en" | "tr" | "ru" | "uk" | "unknown" {
  const lower = text.toLowerCase();

  const patterns: Record<string, RegExp> = {
    pl: /[ąćęłńóśźż]|(\b(jest|nie|tak|się|jak|dla|ale|jestem|mam|będzie|już|tylko|bardzo|proszę|dziękuję|witam)\b)/i,
    de: /[äöüß]|(\b(ist|nicht|das|die|der|und|ein|ich|habe|wird|schon|nur|sehr|bitte|danke|hallo|guten)\b)/i,
    tr: /[çğışöü]|(\b(bir|bu|ve|için|ile|olan|var|ben|sen|evet|hayır|merhaba|teşekkür)\b)/i,
    ru: /[а-яё].*[а-яё]|(\b(это|что|как|для|все|они|его|она|мне|вот|нет|да)\b)/i,
    uk: /[іїєґ]|(\b(це|що|як|для|всі|його|вона|мені|так|ні)\b)/i,
  };

  let bestLang: "de" | "pl" | "en" | "tr" | "ru" | "uk" | "unknown" = "unknown";
  let bestScore = 0;

  for (const [lang, pattern] of Object.entries(patterns)) {
    const matches = lower.match(new RegExp(pattern, "gi"));
    const score = matches ? matches.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang as typeof bestLang;
    }
  }

  return bestLang;
}

async function translateWithMyMemory(text: string, from: string, to: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      if (translated === text.toUpperCase()) return null;
      return translated;
    }
    return null;
  } catch {
    return null;
  }
}

async function translateWithLingva(text: string, from: string, to: string): Promise<string | null> {
  // Try only one instance with short timeout
  try {
    const url = `https://lingva.lunar.icu/api/v1/${from}/${to}/${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.translation) return data.translation;
  } catch { /* ignore */ }
  return null;
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

  // Try MyMemory first (more reliable), fallback to Lingva
  let translation = await translateWithMyMemory(text, detected, targetLang);
  if (!translation) {
    translation = await translateWithLingva(text, detected, targetLang);
  }

  return NextResponse.json({ translation, detected, targetLang });
}
