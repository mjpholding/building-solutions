import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// POST: Translate text from Polish to German using ChatGPT
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!openai) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
  }

  const { text, type } = await request.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const systemPrompt = type === "sds"
    ? `Du bist ein professioneller Übersetzer für Sicherheitsdatenblätter (SDB) von Reinigungsprodukten.
Übersetze den folgenden polnischen Text ins Deutsche.
- Verwende die korrekte deutsche Terminologie für Sicherheitsdatenblätter gemäß REACH-Verordnung (EG) Nr. 1907/2006.
- Behalte alle Abschnittsnummern, Tabellen und Strukturen bei.
- Ersetze NICHT die Firmendaten — lasse Platzhalter [FIRMENNAME], [ADRESSE], [TELEFON], [EMAIL] wo Firmendaten stehen.
- Gib NUR die Übersetzung zurück, ohne Kommentare.`
    : `Du bist ein professioneller Übersetzer für technische Produktdatenblätter von professionellen Reinigungsprodukten.
Übersetze den folgenden polnischen Text ins Deutsche.
- Verwende die korrekte deutsche Fachterminologie für Reinigungsprodukte.
- Behalte die Struktur bei (Überschriften, Aufzählungen, Tabellen).
- Ersetze NICHT die Firmendaten — lasse Platzhalter [FIRMENNAME], [ADRESSE], [TELEFON], [EMAIL] wo Firmendaten stehen.
- Übersetze Produktnamen NICHT (z.B. "Poly Lock Ultra" bleibt "Poly Lock Ultra").
- Gib NUR die Übersetzung zurück, ohne Kommentare.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.2,
      max_tokens: 8000,
    });

    const translated = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      translated,
      usage: completion.usage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Translation failed: ${message}` }, { status: 500 });
  }
}
