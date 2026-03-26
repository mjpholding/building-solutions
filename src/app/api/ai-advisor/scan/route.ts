import { NextRequest, NextResponse } from "next/server";
import { storeGet, storeSet } from "@/lib/admin-store";
import OpenAI from "openai";

interface AIAdvisorConfig {
  enabled: boolean;
  knowledgeBase: { surface: string; visualDescription: string; products: string[] }[];
  systemPrompt: string;
  plans: { id: string; scansPerMonth: number }[];
}

interface UserUsage {
  month: string; // "2026-03"
  count: number;
  planId: string;
}

// POST: analyze image with AI
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API not configured" }, { status: 500 });
  }

  // Check if AI advisor is enabled
  const config = (await storeGet("ai-advisor-config")) as AIAdvisorConfig | null;
  if (!config?.enabled) {
    return NextResponse.json({ error: "AI-Berater ist deaktiviert" }, { status: 403 });
  }

  const body = await request.json();
  const { imageBase64, userId, planId } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: "Kein Bild" }, { status: 400 });
  }

  // Check usage limits
  const currentMonth = new Date().toISOString().slice(0, 7);
  const usageKey = `ai-usage-${userId || "anonymous"}-${currentMonth}`;
  const usage = ((await storeGet(usageKey)) as UserUsage) || { month: currentMonth, count: 0, planId: planId || "free" };

  const plan = config.plans.find((p) => p.id === (planId || "free"));
  if (plan && plan.scansPerMonth > 0 && usage.count >= plan.scansPerMonth) {
    return NextResponse.json({
      error: `Monatliches Limit erreicht (${plan.scansPerMonth} Scans). Bitte upgraden Sie Ihren Plan.`,
      limitReached: true,
      usage: usage.count,
      limit: plan.scansPerMonth,
    }, { status: 429 });
  }

  // Build knowledge base text
  const kbText = config.knowledgeBase
    .map((e) => `- ${e.surface}: ${e.visualDescription} → Produkte: ${e.products.join(", ")}`)
    .join("\n");

  const prompt = config.systemPrompt.replace("[KNOWLEDGE_BASE]", kbText);

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analysiere dieses Bild und empfehle passende Reinigungsprodukte." },
            { type: "image_url", image_url: { url: imageBase64, detail: "low" } },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Try to parse JSON from response
    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: responseText };
    } catch {
      result = { raw: responseText };
    }

    // Update usage
    usage.count++;
    await storeSet(usageKey, usage);

    return NextResponse.json({
      result,
      usage: usage.count,
      limit: plan?.scansPerMonth || 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Analyse fehlgeschlagen: ${message}` }, { status: 500 });
  }
}
