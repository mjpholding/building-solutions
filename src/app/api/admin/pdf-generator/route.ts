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
Übersetze den folgenden polnischen Text ins Deutsche und formatiere das Ergebnis als HTML.

WICHTIGE REGELN:
- Verwende die korrekte deutsche Terminologie für Sicherheitsdatenblätter gemäß REACH-Verordnung (EG) Nr. 1907/2006.
- Strukturiere das Ergebnis mit HTML-Tags: <h2> für Hauptabschnitte (SEKTION 1, 2, 3...), <h3> für Unterabschnitte, <p> für Absätze, <ul>/<li> für Listen, <table> für Tabellen.
- Ersetze polnische Firmendaten (Swish Polska, Warszawa, Pańska, biuro@swishclean.pl etc.) durch [FIRMENNAME], [ADRESSE], [TELEFON], [EMAIL].
- Übersetze Produktnamen NICHT.
- Gib NUR den HTML-Code zurück, ohne Markdown, ohne Codeblöcke, ohne Kommentare.`
    : `Du bist ein professioneller Übersetzer für technische Produktdatenblätter von professionellen Reinigungsprodukten.
Übersetze den folgenden polnischen Text ins Deutsche und formatiere das Ergebnis als sauberes, professionelles HTML.

WICHTIGE REGELN:
- Verwende die korrekte deutsche Fachterminologie für Reinigungsprodukte.
- Strukturiere das Ergebnis mit HTML-Tags:
  - <h2> für Hauptüberschriften (Produktname, "Beschreibung", "Anwendungshinweise", "Technische Daten" etc.)
  - <h3> für Unterüberschriften
  - <p> für Absätze
  - <ul>/<li> für Aufzählungen und Schritte
  - <table><tr><td> für technische Daten (pH-Wert, Größen, Dosierung etc.)
  - <strong> für wichtige Begriffe
- Ersetze polnische Firmendaten (Swish Polska, Warszawa, Pańska 73, biuro@swishclean.pl, swishclean.pl, NIP, KRS, REGON etc.) durch [FIRMENNAME], [ADRESSE], [TELEFON], [EMAIL], [WEBSITE].
- Übersetze Produktnamen NICHT (z.B. "Poly Lock Ultra" bleibt "Poly Lock Ultra").
- Trenne die erste Seite (Produktbeschreibung) und zweite Seite (Anwendungshinweise) mit <hr/>.
- Gib NUR den HTML-Code zurück, ohne Markdown-Codeblöcke, ohne Kommentare.`;

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
