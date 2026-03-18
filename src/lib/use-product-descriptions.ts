"use client";

import de from "@/data/product-descriptions.json";
import en from "@/data/product-descriptions-en.json";
import pl from "@/data/product-descriptions-pl.json";
import tr from "@/data/product-descriptions-tr.json";
import ru from "@/data/product-descriptions-ru.json";
import uk from "@/data/product-descriptions-uk.json";
import sk from "@/data/product-descriptions-sk.json";
import sq from "@/data/product-descriptions-sq.json";
import hr from "@/data/product-descriptions-hr.json";

const allDescriptions: Record<string, Record<string, string>> = {
  de: de as Record<string, string>,
  en: en as Record<string, string>,
  pl: pl as Record<string, string>,
  tr: tr as Record<string, string>,
  ru: ru as Record<string, string>,
  uk: uk as Record<string, string>,
  sk: sk as Record<string, string>,
  sq: sq as Record<string, string>,
  hr: hr as Record<string, string>,
};

export function useProductDescription(slug: string, locale: string = "de"): string | null {
  const localeDescs = allDescriptions[locale] || allDescriptions["de"];
  return localeDescs[slug] || allDescriptions["de"][slug] || null;
}
